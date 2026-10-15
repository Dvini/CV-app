import { useState, useCallback } from "react";

const MAX_HISTORY = 50;

/**
 * Hook that wraps a state setter with undo/redo capability.
 * Works by keeping a stack of past and future states.
 *
 * `setValue` must be a raw setter that does NOT call `trackChange` itself,
 * otherwise undo/redo would record themselves as new history entries.
 *
 * @param currentValue - The current state value
 * @param setValue - The raw state setter (e.g., from useLocalStorage)
 * @returns {{ undo, redo, canUndo, canRedo, trackChange, clearHistory }}
 */
export function useHistory<T>(currentValue: T, setValue: (value: T) => void) {
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const trackChange = useCallback((prevValue: T) => {
    setPast((p) => {
      // StrictMode invokes state updaters twice in development — ignore the duplicate
      if (p[p.length - 1] === prevValue) return p;
      const newPast = [...p, prevValue];
      return newPast.length > MAX_HISTORY ? newPast.slice(-MAX_HISTORY) : newPast;
    });
    setFuture((f) => (f.length ? [] : f));
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [currentValue, ...f]);
    setValue(previous);
  }, [past, currentValue, setValue]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, currentValue]);
    setValue(next);
  }, [future, currentValue, setValue]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    trackChange,
    clearHistory,
  };
}
