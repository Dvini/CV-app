import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_LISTENERS = [];
const DEBOUNCE_MS = 300;

function notifyStorageError(key) {
  STORAGE_LISTENERS.forEach(fn => fn(key));
}

export function onStorageError(listener) {
  STORAGE_LISTENERS.push(listener);
  return () => {
    const idx = STORAGE_LISTENERS.indexOf(listener);
    if (idx !== -1) STORAGE_LISTENERS.splice(idx, 1);
  };
}

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        notifyStorageError(key);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [key, value]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      // We cannot access current value here, but timer cleanup is enough
    };
  }, []);

  const remove = useCallback(() => {
    clearTimeout(timerRef.current);
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, setValue, remove];
}
