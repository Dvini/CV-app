import { useState, useEffect, useCallback } from 'react';

const STORAGE_LISTENERS = [];

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

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      notifyStorageError(key);
    }
  }, [key, value]);

  const remove = useCallback(() => {
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, setValue, remove];
}
