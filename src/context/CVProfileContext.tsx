/**
 * CVProfileContext — manages CV profiles, import/export, and data sync.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage, onStorageError } from '../hooks/useLocalStorage';
import { DEFAULT_SNAPSHOT } from '../constants/defaults';
import { normalizeProfiles, parseSnapshot, parseSnapshotJSON } from '../utils/cvSchema';
import type { Profile, ProfileSnapshot, CVManagerContextType } from '../types/cv';

export const CVManagerContext = createContext<CVManagerContextType | null>(null);

export function useCVManager(): CVManagerContextType {
  const ctx = useContext(CVManagerContext);
  if (!ctx) throw new Error('useCVManager must be used within CVProvider');
  return ctx;
}

interface CVProfileProviderProps {
  children: React.ReactNode;
  /** Callbacks to read/write appearance & data state for profile switching */
  getSnapshot: () => ProfileSnapshot;
  loadSnapshot: (s: Partial<ProfileSnapshot>) => void;
}

const profileStorageKey = (id: string) => `cv_profile_${id}`;

/** Reads a stored profile; returns null when it is missing or unreadable. */
function readStoredProfile(id: string): Partial<ProfileSnapshot> | null {
  try {
    const raw = localStorage.getItem(profileStorageKey(id));
    if (!raw) return null;
    const result = parseSnapshot(JSON.parse(raw));
    return result.ok ? result.snapshot : null;
  } catch {
    return null;
  }
}

export function CVProfileProvider({
  children,
  getSnapshot,
  loadSnapshot,
}: CVProfileProviderProps) {
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  useEffect(() => {
    return onStorageError((key) => {
      setStorageWarning(
        `Nie udało się zapisać danych (${key}). Pamięć przeglądarki może być pełna.`,
      );
    });
  }, []);

  const dismissWarning = useCallback(() => setStorageWarning(null), []);

  const [profiles, setProfiles] = useLocalStorage<Profile[]>(
    'cv_profiles',
    [{ id: 'default', name: 'Profil 1' }],
    normalizeProfiles,
  );
  const [activeProfileId, setActiveProfileId] = useLocalStorage<string>(
    'cv_activeProfileId',
    'default',
    (v) => (typeof v === 'string' ? v : undefined),
  );

  /** Saves the active CV under its profile key. Returns false (and warns) when storage is full. */
  const saveActiveProfile = useCallback((): boolean => {
    try {
      localStorage.setItem(profileStorageKey(activeProfileId), JSON.stringify(getSnapshot()));
      return true;
    } catch {
      setStorageWarning(
        'Nie udało się zapisać bieżącego profilu — pamięć przeglądarki jest pełna. ' +
          'Pobierz kopię JSON lub usuń zdjęcia, zanim przełączysz profil.',
      );
      return false;
    }
  }, [activeProfileId, getSnapshot]);

  const switchProfile = useCallback(
    (targetId: string) => {
      if (targetId === activeProfileId) return;
      if (!saveActiveProfile()) return;
      const target = readStoredProfile(targetId);
      if (target) loadSnapshot(target);
      setActiveProfileId(targetId);
    },
    [activeProfileId, saveActiveProfile, loadSnapshot, setActiveProfileId],
  );

  const createProfile = useCallback(
    (name: string, duplicate = false) => {
      if (!saveActiveProfile()) return;
      const id = `profile_${Date.now()}`;
      setProfiles((prev) => [...prev, { id, name }]);
      if (!duplicate) loadSnapshot(DEFAULT_SNAPSHOT);
      setActiveProfileId(id);
    },
    [saveActiveProfile, loadSnapshot, setProfiles, setActiveProfileId],
  );

  const deleteProfile = useCallback(
    (id: string) => {
      if (profiles.length <= 1) return;
      localStorage.removeItem(profileStorageKey(id));
      const remaining = profiles.filter((p) => p.id !== id);
      setProfiles(remaining);
      if (id === activeProfileId) {
        const nextId = remaining[0].id;
        const next = readStoredProfile(nextId);
        if (next) loadSnapshot(next);
        setActiveProfileId(nextId);
      }
    },
    [profiles, activeProfileId, loadSnapshot, setProfiles, setActiveProfileId],
  );

  const renameProfile = useCallback(
    (id: string, name: string) => {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
    },
    [setProfiles],
  );

  const exportJSON = useCallback(() => {
    const snapshot = getSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${(snapshot.data.personal?.fullName || 'export').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getSnapshot]);

  const importJSON = useCallback(
    async (file: File): Promise<string | null> => {
      let text: string;
      try {
        text = await file.text();
      } catch {
        return 'Nie udało się odczytać pliku.';
      }
      const result = parseSnapshotJSON(text);
      if (!result.ok) return result.error;
      loadSnapshot(result.snapshot);
      return null;
    },
    [loadSnapshot],
  );

  const resetToDefaults = useCallback(() => {
    loadSnapshot(DEFAULT_SNAPSHOT);
  }, [loadSnapshot]);

  const value: CVManagerContextType = {
    storageWarning,
    dismissWarning,
    exportJSON,
    importJSON,
    resetToDefaults,
    profiles,
    activeProfileId,
    switchProfile,
    createProfile,
    deleteProfile,
    renameProfile,
  };

  return <CVManagerContext.Provider value={value}>{children}</CVManagerContext.Provider>;
}
