import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;

/**
 * Hook that wraps a state setter with undo/redo capability.
 * Works by keeping a stack of past and future states.
 *
 * @param currentValue - The current state value
 * @param setValue - The state setter (e.g., from useLocalStorage)
 * @returns {{ undo, redo, canUndo, canRedo, trackChange }}
 */
export function useHistory<T>(currentValue: T, setValue: (value: T) => void) {
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const skipTrack = useRef(false);

  const trackChange = useCallback((prevValue: T) => {
    if (skipTrack.current) {
      skipTrack.current = false;
      return;
    }
    setPast((p) => {
      const newPast = [...p, prevValue];
      return newPast.length > MAX_HISTORY
        ? newPast.slice(-MAX_HISTORY)
        : newPast;
    });
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [currentValue, ...f]);
    skipTrack.current = true;
    setValue(previous);
  }, [past, currentValue, setValue]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, currentValue]);
    skipTrack.current = true;
    setValue(next);
  }, [future, currentValue, setValue]);

  return {
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    trackChange,
  };
}
