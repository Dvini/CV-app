/**
 * CVProfileContext — manages CV profiles, import/export, and data sync.
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage, onStorageError } from '../hooks/useLocalStorage';
import {
  defaultData,
  defaultSectionOrder,
  defaultSectionColumns,
} from '../constants/defaults';
import {
  DEFAULT_CUSTOM_MARGIN,
  DEFAULT_THEME_COLOR,
} from '../constants/layout';
import type {
  CVData,
  Profile,
  TemplateName,
  MarginPreset,
  CustomMargin,
  FontFamily,
  CVLanguage,
  CVManagerContextType,
} from '../types/cv';

export const CVManagerContext = createContext<CVManagerContextType | null>(null);

export function useCVManager(): CVManagerContextType {
  const ctx = useContext(CVManagerContext);
  if (!ctx) throw new Error('useCVManager must be used within CVProvider');
  return ctx;
}

interface ProfileSnapshot {
  data: CVData;
  sectionOrder: string[];
  sectionColumns: Record<string, string>;
  template: TemplateName;
  margins: MarginPreset;
  customMargin: CustomMargin;
  themeColor: string;
  fontFamily: FontFamily;
  fontSizeHeading: number;
  fontSizeText: number;
  cvLanguage: CVLanguage;
  showSectionIcons: boolean;
  creativeHeaderBg: string;
}

interface CVProfileProviderProps {
  children: React.ReactNode;
  /** Callbacks to read/write appearance & data state for profile switching */
  getSnapshot: () => ProfileSnapshot;
  loadSnapshot: (s: ProfileSnapshot) => void;
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

  const [profiles, setProfiles] = useLocalStorage<Profile[]>('cv_profiles', [
    { id: 'default', name: 'Profil 1' },
  ]);
  const [activeProfileId, setActiveProfileId] = useLocalStorage<string>(
    'cv_activeProfileId',
    'default',
  );

  const switchProfile = useCallback(
    (targetId: string) => {
      if (targetId === activeProfileId) return;
      try {
        localStorage.setItem(`cv_profile_${activeProfileId}`, JSON.stringify(getSnapshot()));
      } catch {
        /* ignore quota errors */
      }
      const raw = localStorage.getItem(`cv_profile_${targetId}`);
      if (raw) {
        try {
          loadSnapshot(JSON.parse(raw) as ProfileSnapshot);
        } catch {
          /* ignore parse errors */
        }
      }
      setActiveProfileId(targetId);
    },
    [activeProfileId, getSnapshot, loadSnapshot, setActiveProfileId],
  );

  const createProfile = useCallback(
    (name: string, duplicate = false) => {
      const id = `profile_${Date.now()}`;
      try {
        localStorage.setItem(`cv_profile_${activeProfileId}`, JSON.stringify(getSnapshot()));
      } catch {
        /* ignore */
      }
      setProfiles((prev) => [...(prev as Profile[]), { id, name }]);
      if (!duplicate) {
        loadSnapshot({
          data: defaultData as CVData,
          sectionOrder: defaultSectionOrder,
          sectionColumns: defaultSectionColumns,
          template: 'classic',
          margins: 'normal',
          customMargin: DEFAULT_CUSTOM_MARGIN,
          themeColor: DEFAULT_THEME_COLOR,
          fontFamily: 'sans',
          fontSizeHeading: 1,
          fontSizeText: 1,
          cvLanguage: 'pl',
          showSectionIcons: false,
          creativeHeaderBg: DEFAULT_THEME_COLOR,
        });
      }
      setActiveProfileId(id);
    },
    [activeProfileId, getSnapshot, loadSnapshot, setProfiles, setActiveProfileId],
  );

  const deleteProfile = useCallback(
    (id: string) => {
      if ((profiles as Profile[]).length <= 1) return;
      localStorage.removeItem(`cv_profile_${id}`);
      const remaining = (profiles as Profile[]).filter((p) => p.id !== id);
      setProfiles(remaining);
      if (id === activeProfileId) {
        const nextId = remaining[0].id;
        const raw = localStorage.getItem(`cv_profile_${nextId}`);
        if (raw) {
          try {
            loadSnapshot(JSON.parse(raw) as ProfileSnapshot);
          } catch {
            /* ignore */
          }
        }
        setActiveProfileId(nextId);
      }
    },
    [profiles, activeProfileId, loadSnapshot, setProfiles, setActiveProfileId],
  );

  const renameProfile = useCallback(
    (id: string, name: string) => {
      setProfiles((prev) =>
        (prev as Profile[]).map((p) => (p.id === id ? { ...p, name } : p)),
      );
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as Partial<ProfileSnapshot>;
          loadSnapshot(imported as ProfileSnapshot);
        } catch {
          alert('Wystąpił błąd podczas odczytu pliku. Upewnij się, że to poprawny plik JSON.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [loadSnapshot],
  );

  const resetToDefaults = useCallback(() => {
    loadSnapshot({
      data: defaultData as CVData,
      sectionOrder: defaultSectionOrder,
      sectionColumns: defaultSectionColumns,
      template: 'classic',
      margins: 'normal',
      customMargin: DEFAULT_CUSTOM_MARGIN,
      themeColor: DEFAULT_THEME_COLOR,
      fontFamily: 'sans',
      fontSizeHeading: 1,
      fontSizeText: 1,
      cvLanguage: 'pl',
      showSectionIcons: false,
      creativeHeaderBg: DEFAULT_THEME_COLOR,
    });
  }, [loadSnapshot]);

  const value: CVManagerContextType = {
    storageWarning,
    dismissWarning,
    exportJSON,
    importJSON,
    resetToDefaults,
    profiles: profiles as Profile[],
    activeProfileId: activeProfileId as string,
    switchProfile,
    createProfile,
    deleteProfile,
    renameProfile,
  };

  return <CVManagerContext.Provider value={value}>{children}</CVManagerContext.Provider>;
}
