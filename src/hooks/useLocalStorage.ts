import { useState, type Dispatch, type SetStateAction } from "react";
import { usePersistedValue } from "./usePersistedValue";

/**
 * State backed by localStorage.
 *
 * @param normalize - Optional guard for the stored value; returning undefined falls back to the default.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  normalize?: (stored: unknown) => T | undefined,
): [T, Dispatch<SetStateAction<T>>] {
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

  usePersistedValue(key, value);

  return [value, setValue];
}
