import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";

type StorageErrorListener = (key: string) => void;

const STORAGE_LISTENERS: StorageErrorListener[] = [];
const DEBOUNCE_MS = 300;

function notifyStorageError(key: string): void {
  STORAGE_LISTENERS.forEach((fn) => fn(key));
}

export function onStorageError(listener: StorageErrorListener): () => void {
  STORAGE_LISTENERS.push(listener);
  return () => {
    const idx = STORAGE_LISTENERS.indexOf(listener);
    if (idx !== -1) STORAGE_LISTENERS.splice(idx, 1);
  };
}

/**
 * @param normalize - Optional guard for the stored value; returning undefined falls back to the default.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  normalize?: (stored: unknown) => T | undefined,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      const parsed: unknown = JSON.parse(saved);
      return normalize ? (normalize(parsed) ?? defaultValue) : (parsed as T);
    } catch {
      return defaultValue;
    }
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest value not yet written to storage (null when nothing is pending)
  const pendingRef = useRef<{ value: T } | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    try {
      localStorage.setItem(key, JSON.stringify(pending.value));
    } catch {
      notifyStorageError(key);
    }
  }, [key]);

  useEffect(() => {
    pendingRef.current = { value };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, DEBOUNCE_MS);
  }, [value, flush]);

  // Write pending changes immediately when the tab is hidden or closed, and on unmount,
  // so the last edit isn't lost inside the debounce window
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      flush();
    };
  }, [flush]);

  const remove = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current = null;
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, setValue, remove];
}
