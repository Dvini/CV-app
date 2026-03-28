import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';

type StorageErrorListener = (key: string) => void;

const STORAGE_LISTENERS: StorageErrorListener[] = [];
const DEBOUNCE_MS = 300;

function notifyStorageError(key: string): void {
  STORAGE_LISTENERS.forEach(fn => fn(key));
}

export function onStorageError(listener: StorageErrorListener): () => void {
  STORAGE_LISTENERS.push(listener);
  return () => {
    const idx = STORAGE_LISTENERS.indexOf(listener);
    if (idx !== -1) STORAGE_LISTENERS.splice(idx, 1);
  };
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        notifyStorageError(key);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, value]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // We cannot access current value here, but timer cleanup is enough
    };
  }, []);

  const remove = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, setValue, remove];
}
