import { useCallback, useEffect, useRef } from "react";

type StorageErrorListener = (key: string) => void;

const STORAGE_LISTENERS: StorageErrorListener[] = [];
const DEBOUNCE_MS = 300;

function notifyStorageError(key: string): void {
  STORAGE_LISTENERS.forEach((fn) => fn(key));
}

/** Subscribes to failed localStorage writes (e.g. quota exceeded). Returns an unsubscribe function. */
export function onStorageError(listener: StorageErrorListener): () => void {
  STORAGE_LISTENERS.push(listener);
  return () => {
    const idx = STORAGE_LISTENERS.indexOf(listener);
    if (idx !== -1) STORAGE_LISTENERS.splice(idx, 1);
  };
}

/**
 * Persists `value` to localStorage under `key`, debounced.
 *
 * The initial value is assumed to be what is already stored (or a default), so it is not
 * written back. Pending changes are written immediately when the tab is hidden or closed,
 * and on unmount, so the last edit isn't lost inside the debounce window.
 *
 * @param onWritten - Called after each successful write.
 */
export function usePersistedValue<T>(key: string, value: T, onWritten?: () => void): void {
  const writtenRef = useRef(value);
  // Latest value not yet written to storage (null when nothing is pending)
  const pendingRef = useRef<{ value: T } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onWrittenRef = useRef(onWritten);

  useEffect(() => {
    onWrittenRef.current = onWritten;
  });

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    try {
      localStorage.setItem(key, JSON.stringify(pending.value));
      writtenRef.current = pending.value;
      onWrittenRef.current?.();
    } catch {
      notifyStorageError(key);
    }
  }, [key]);

  useEffect(() => {
    if (value === writtenRef.current && !pendingRef.current) return;
    pendingRef.current = { value };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, DEBOUNCE_MS);
  }, [value, flush]);

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
}
