import React, { createContext, useContext, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage, onStorageError } from '../hooks/useLocalStorage';
import { useHistory } from '../hooks/useHistory';
import {
  defaultData,
  defaultSectionOrder,
  defaultSectionColumns,
} from '../constants/defaults';
import {
  MARGIN_PRESETS,
  DEFAULT_CUSTOM_MARGIN,
  DEFAULT_THEME_COLOR,
  COLUMN_INNER_GAP_LEFT,
  COLUMN_INNER_GAP_RIGHT,
} from '../constants/layout';

const CVDataContext = createContext(null);
const CVAppearanceContext = createContext(null);
const CVManagerContext = createContext(null);

const SCHEMA_VERSION = 2;

export function CVProvider({ children }) {
  const [storageWarning, setStorageWarning] = useState(null);

  useEffect(() => {
    return onStorageError((key) => {
      setStorageWarning(`Nie udało się zapisać danych (${key}). Pamięć przeglądarki może być pełna.`);
    });
  }, []);

  const dismissWarning = useCallback(() => setStorageWarning(null), []);

  // Schema versioning
  const [schemaVersion, setSchemaVersion] = useLocalStorage('cv_schema_version', SCHEMA_VERSION);

  // Core CV data
  const [data, setDataRaw] = useLocalStorage('cv_data', defaultData);
  const { undo, redo, canUndo, canRedo, trackChange } = useHistory(data, setDataRaw);

  // Wrap setData to track changes for undo/redo
  const setData = useCallback((updater) => {
    setDataRaw((prev) => {
      trackChange(prev);
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }, [setDataRaw, trackChange]);
  const [sectionOrder, setSectionOrder] = useLocalStorage(
    'cv_sectionOrder',
    defaultSectionOrder
  );
  const [sectionColumns, setSectionColumns] = useLocalStorage(
    'cv_sectionColumns',
    defaultSectionColumns
  );

  // Appearance
  const [template, setTemplate] = useLocalStorage('cv_template', 'classic');
  const [margins, setMargins] = useLocalStorage('cv_margins', 'normal');
  const [customMargin, setCustomMargin] = useLocalStorage('cv_customMargin', DEFAULT_CUSTOM_MARGIN);
  const [themeColor, setThemeColor] = useLocalStorage('cv_themeColor', DEFAULT_THEME_COLOR);
  const [fontFamily, setFontFamily] = useLocalStorage('cv_fontFamily', 'sans');
  const [fontSizeHeading, setFontSizeHeading] = useLocalStorage('cv_fontSizeHeading', 1);
  const [fontSizeText, setFontSizeText] = useLocalStorage('cv_fontSizeText', 1);
  const [cvLanguage, setCvLanguage] = useLocalStorage('cv_language', 'pl');
  const [darkMode, setDarkMode] = useLocalStorage('cv_darkMode', false);
  const [showSectionIcons, setShowSectionIcons] = useLocalStorage('cv_showSectionIcons', false);
  const [creativeHeaderBg, setCreativeHeaderBg] = useLocalStorage('cv_creativeHeaderBg', DEFAULT_THEME_COLOR);

  // --- Profiles ---
  const [profiles, setProfiles] = useLocalStorage('cv_profiles', [{ id: 'default', name: 'Profil 1' }]);
  const [activeProfileId, setActiveProfileId] = useLocalStorage('cv_activeProfileId', 'default');
  const switchingRef = useRef(false);

  const getSnapshot = useCallback(() => ({
    data, sectionOrder, sectionColumns, template, margins, customMargin,
    themeColor, fontFamily, fontSizeHeading, fontSizeText, cvLanguage,
    showSectionIcons, creativeHeaderBg,
  }), [data, sectionOrder, sectionColumns, template, margins, customMargin,
    themeColor, fontFamily, fontSizeHeading, fontSizeText, cvLanguage,
    showSectionIcons, creativeHeaderBg]);

  const loadSnapshot = useCallback((s) => {
    if (!s) return;
    switchingRef.current = true;
    if (s.data) setDataRaw(s.data);
    if (s.sectionOrder) setSectionOrder(s.sectionOrder);
    if (s.sectionColumns) setSectionColumns(s.sectionColumns);
    if (s.template) setTemplate(s.template);
    if (s.margins) setMargins(s.margins);
    if (s.customMargin) setCustomMargin(s.customMargin);
    if (s.themeColor) setThemeColor(s.themeColor);
    if (s.fontFamily) setFontFamily(s.fontFamily);
    if (s.fontSizeHeading != null) setFontSizeHeading(s.fontSizeHeading);
    if (s.fontSizeText != null) setFontSizeText(s.fontSizeText);
    if (s.cvLanguage) setCvLanguage(s.cvLanguage);
    if (s.showSectionIcons != null) setShowSectionIcons(s.showSectionIcons);
    if (s.creativeHeaderBg) setCreativeHeaderBg(s.creativeHeaderBg);
    switchingRef.current = false;
  }, [setDataRaw, setSectionOrder, setSectionColumns, setTemplate, setMargins,
    setCustomMargin, setThemeColor, setFontFamily, setFontSizeHeading,
    setFontSizeText, setCvLanguage, setShowSectionIcons, setCreativeHeaderBg]);

  const switchProfile = useCallback((targetId) => {
    if (targetId === activeProfileId) return;
    // Save current profile
    try {
      localStorage.setItem(`cv_profile_${activeProfileId}`, JSON.stringify(getSnapshot()));
    } catch { /* ignore quota errors */ }
    // Load target
    const raw = localStorage.getItem(`cv_profile_${targetId}`);
    if (raw) {
      try { loadSnapshot(JSON.parse(raw)); } catch { /* ignore parse errors */ }
    }
    setActiveProfileId(targetId);
  }, [activeProfileId, getSnapshot, loadSnapshot, setActiveProfileId]);

  const createProfile = useCallback((name, duplicate = false) => {
    const id = `profile_${Date.now()}`;
    // Save current first
    try {
      localStorage.setItem(`cv_profile_${activeProfileId}`, JSON.stringify(getSnapshot()));
    } catch { /* ignore */ }
    setProfiles((prev) => [...prev, { id, name }]);
    if (!duplicate) {
      // Load defaults into the new blank profile
      loadSnapshot({
        data: defaultData, sectionOrder: defaultSectionOrder,
        sectionColumns: defaultSectionColumns, template: 'classic',
        margins: 'normal', customMargin: DEFAULT_CUSTOM_MARGIN,
        themeColor: DEFAULT_THEME_COLOR, fontFamily: 'sans',
        fontSizeHeading: 1, fontSizeText: 1, cvLanguage: 'pl',
        showSectionIcons: false, creativeHeaderBg: DEFAULT_THEME_COLOR,
      });
    }
    // If duplicating, current state is already correct
    setActiveProfileId(id);
  }, [activeProfileId, getSnapshot, loadSnapshot, setProfiles, setActiveProfileId]);

  const deleteProfile = useCallback((id) => {
    if (profiles.length <= 1) return;
    localStorage.removeItem(`cv_profile_${id}`);
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (id === activeProfileId) {
      const nextId = remaining[0].id;
      const raw = localStorage.getItem(`cv_profile_${nextId}`);
      if (raw) {
        try { loadSnapshot(JSON.parse(raw)); } catch { /* ignore */ }
      }
      setActiveProfileId(nextId);
    }
  }, [profiles, activeProfileId, loadSnapshot, setProfiles, setActiveProfileId]);

  const renameProfile = useCallback((id, name) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, [setProfiles]);

  // Run schema migrations when version is outdated
  useEffect(() => {
    if (schemaVersion < SCHEMA_VERSION) {
      // Future migrations go here as version increments
      setSchemaVersion(SCHEMA_VERSION);
    }
  }, [schemaVersion, setSchemaVersion]);

  // --- Ensure backwards compatibility for loaded data ---
  const safeData = useMemo(() => ({
    ...defaultData,
    ...data,
    personal: { ...defaultData.personal, ...(data?.personal || {}) },
    experience: data?.experience || defaultData.experience,
    education: data?.education || defaultData.education,
    courses: data?.courses || defaultData.courses,
    skills: data?.skills ?? defaultData.skills,
    languages: data?.languages || defaultData.languages,
    interests: data?.interests ?? defaultData.interests,
    projects: data?.projects || defaultData.projects || [],
    certificates: data?.certificates || defaultData.certificates,
    references: data?.references || defaultData.references,
    publications: data?.publications || defaultData.publications,
    volunteer: data?.volunteer || defaultData.volunteer,
    custom: data?.custom || defaultData.custom,
    customSectionTitle: data?.customSectionTitle ?? defaultData.customSectionTitle,
    clause: data?.clause ?? defaultData.clause,
    showClause: data?.showClause ?? defaultData.showClause,
  }), [data]);

  const safeSectionOrder = useMemo(() => {
    const order = [...(sectionOrder || defaultSectionOrder)];
    // Ensure all default sections exist in the order
    for (const section of defaultSectionOrder) {
      if (!order.includes(section)) order.push(section);
    }
    return order;
  }, [sectionOrder]);

  const safeSectionColumns = useMemo(() => ({
    ...defaultSectionColumns,
    ...(sectionColumns || {}),
  }), [sectionColumns]);

  // --- Data mutation helpers ---
  const handlePersonalChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const handleSkillsChange = (value) => {
    setData((prev) => ({ ...prev, skills: value }));
  };

  const handleInterestsChange = (value) => {
    setData((prev) => ({ ...prev, interests: value }));
  };

  const handleClauseChange = (value) => {
    setData((prev) => ({ ...prev, clause: value }));
  };

  const toggleClause = () => {
    setData((prev) => ({ ...prev, showClause: !prev.showClause }));
  };

  // Generic array CRUD
  const addItem = (arrayName, newItem) => {
    setData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), newItem],
    }));
  };

  const updateItem = (arrayName, id, field, value) => {
    setData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (arrayName, id) => {
    setData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((item) => item.id !== id),
    }));
  };

  const moveItem = (arrayName, index, direction) => {
    setData((prev) => {
      const newArray = [...prev[arrayName]];
      if (direction === 'up' && index > 0) {
        [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      } else if (direction === 'down' && index < newArray.length - 1) {
        [newArray[index + 1], newArray[index]] = [newArray[index], newArray[index + 1]];
      }
      return { ...prev, [arrayName]: newArray };
    });
  };

  // Section order management
  const moveSection = (sectionKey, direction) => {
    const currentColumn =
      template === 'twocolumn' ? safeSectionColumns[sectionKey] : 'all';
    const relevantList =
      currentColumn === 'all'
        ? [...safeSectionOrder]
        : safeSectionOrder.filter((s) => safeSectionColumns[s] === currentColumn);
    const currentIndex = relevantList.indexOf(sectionKey);

    if (direction === 'up' && currentIndex > 0) {
      swapInGlobalOrder(sectionKey, relevantList[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < relevantList.length - 1) {
      swapInGlobalOrder(sectionKey, relevantList[currentIndex + 1]);
    }
  };

  const swapInGlobalOrder = (key1, key2) => {
    setSectionOrder((prev) => {
      const newOrder = [...prev];
      const idx1 = newOrder.indexOf(key1);
      const idx2 = newOrder.indexOf(key2);
      if (idx1 !== -1 && idx2 !== -1) {
        newOrder[idx1] = key2;
        newOrder[idx2] = key1;
      }
      return newOrder;
    });
  };

  const toggleColumn = (sectionKey) => {
    setSectionColumns((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === 'main' ? 'side' : 'main',
    }));
  };

  const isFirstInColumn = (sectionKey) => {
    const col =
      template === 'twocolumn' ? safeSectionColumns[sectionKey] : 'all';
    const list =
      col === 'all'
        ? safeSectionOrder
        : safeSectionOrder.filter((s) => safeSectionColumns[s] === col);
    return list.indexOf(sectionKey) === 0;
  };

  const isLastInColumn = (sectionKey) => {
    const col =
      template === 'twocolumn' ? safeSectionColumns[sectionKey] : 'all';
    const list =
      col === 'all'
        ? safeSectionOrder
        : safeSectionOrder.filter((s) => safeSectionColumns[s] === col);
    return list.indexOf(sectionKey) === list.length - 1;
  };

  // Import/Export
  const exportJSON = () => {
    const stateToExport = {
      data: safeData,
      sectionOrder: safeSectionOrder,
      sectionColumns: safeSectionColumns,
      template,
      margins,
      customMargin,
      themeColor,
      fontFamily,
      fontSizeHeading,
      fontSizeText,
      cvLanguage,
      showSectionIcons,
      creativeHeaderBg,
    };
    const blob = new Blob([JSON.stringify(stateToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${safeData.personal.fullName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.data) setData({ ...defaultData, ...imported.data });
        if (imported.sectionOrder) setSectionOrder(imported.sectionOrder);
        if (imported.sectionColumns)
          setSectionColumns({ ...defaultSectionColumns, ...imported.sectionColumns });
        if (imported.template) setTemplate(imported.template);
        if (imported.margins) setMargins(imported.margins);
        if (imported.customMargin) setCustomMargin(imported.customMargin);
        if (imported.themeColor) setThemeColor(imported.themeColor);
        if (imported.fontFamily) setFontFamily(imported.fontFamily);
        if (imported.fontSizeHeading) setFontSizeHeading(imported.fontSizeHeading);
        if (imported.fontSizeText) setFontSizeText(imported.fontSizeText);
        if (imported.cvLanguage) setCvLanguage(imported.cvLanguage);
        if (imported.showSectionIcons !== undefined) setShowSectionIcons(imported.showSectionIcons);
        if (imported.creativeHeaderBg) setCreativeHeaderBg(imported.creativeHeaderBg);
      } catch {
        alert('Wystąpił błąd podczas odczytu pliku. Upewnij się, że to poprawny plik JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const resetToDefaults = () => {
    setData(defaultData);
    setSectionOrder(defaultSectionOrder);
    setSectionColumns(defaultSectionColumns);
    setTemplate('classic');
    setMargins('normal');
    setCustomMargin(DEFAULT_CUSTOM_MARGIN);
    setThemeColor(DEFAULT_THEME_COLOR);
    setFontFamily('sans');
    setFontSizeHeading(1);
    setFontSizeText(1);
    setCvLanguage('pl');
    setShowSectionIcons(false);
    setCreativeHeaderBg(DEFAULT_THEME_COLOR);
  };

  const getPhotoStyle = () => {
    const shape = safeData.personal.photoShape || 'round';
    const size = safeData.personal.photoSize || 80;
    
    let borderRadius = '50%';
    let aspectRatio = '1 / 1';
    
    if (shape === 'square' || shape === 'Kwadratowe') {
      borderRadius = '8px';
    } else if (shape === 'rectangle-portrait' || shape === 'Prostokątne (portretowe)') {
      borderRadius = '8px';
      aspectRatio = '3 / 4';
    } else if (shape === 'rectangle-landscape' || shape === 'Prostokątne (poziome)') {
      borderRadius = '8px';
      aspectRatio = '4 / 3';
    }
    
    return {
      width: `${size}px`,
      height: 'auto',
      aspectRatio,
      borderRadius,
      objectFit: 'cover'
    };
  };

  // Margin styles
  const getMarginValues = () => {
    if (margins === 'custom') return { v: customMargin.vertical || 15, h: customMargin.horizontal || 15 };
    return MARGIN_PRESETS[margins] || MARGIN_PRESETS.normal;
  };

  const getMarginStyle = (variant = 'container', omitBottom = false) => {
    let v, h;
    if (margins === 'custom') {
      v = customMargin.vertical;
      h = customMargin.horizontal;
    } else {
      const preset = MARGIN_PRESETS[margins] || MARGIN_PRESETS.normal;
      v = preset.v;
      h = preset.h;
    }

    if (variant === 'left-column') {
      return {
        paddingTop: `${v}mm`,
        paddingRight: `${COLUMN_INNER_GAP_LEFT}mm`,
        paddingBottom: omitBottom ? '0mm' : `${v}mm`,
        paddingLeft: `${h}mm`
      };
    }
    
    if (variant === 'right-column') {
      return {
        paddingTop: `${v}mm`,
        paddingRight: `${h}mm`,
        paddingBottom: omitBottom ? '0mm' : `${v}mm`,
        paddingLeft: `${COLUMN_INNER_GAP_RIGHT}mm`
      };
    }

    // Default container (1 column layout)
    return {
      paddingTop: `${v}mm`,
      paddingRight: `${h}mm`,
      paddingBottom: omitBottom ? '0mm' : `${v}mm`,
      paddingLeft: `${h}mm`
    };
  };

  const dataValue = {
    data: safeData,
    setData,
    sectionOrder: safeSectionOrder,
    setSectionOrder,
    sectionColumns: safeSectionColumns,
    setSectionColumns,
    handlePersonalChange,
    handleSkillsChange,
    handleInterestsChange,
    handleClauseChange,
    toggleClause,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    moveSection,
    toggleColumn,
    isFirstInColumn,
    isLastInColumn,
    undo,
    redo,
    canUndo,
    canRedo,
    getPhotoStyle,
  };

  const appearanceValue = {
    template,
    setTemplate,
    margins,
    setMargins,
    customMargin,
    setCustomMargin,
    themeColor,
    setThemeColor,
    fontFamily,
    setFontFamily,
    fontSizeHeading,
    setFontSizeHeading,
    fontSizeText,
    setFontSizeText,
    cvLanguage,
    setCvLanguage,
    darkMode,
    setDarkMode,
    showSectionIcons,
    setShowSectionIcons,
    creativeHeaderBg,
    setCreativeHeaderBg,
    getMarginStyle,
    getMarginValues,
  };

  const managerValue = {
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

  return (
    <CVManagerContext.Provider value={managerValue}>
      <CVAppearanceContext.Provider value={appearanceValue}>
        <CVDataContext.Provider value={dataValue}>
          {children}
        </CVDataContext.Provider>
      </CVAppearanceContext.Provider>
    </CVManagerContext.Provider>
  );
}

export function useCVData() {
  const ctx = useContext(CVDataContext);
  if (!ctx) throw new Error('useCVData must be used within CVProvider');
  return ctx;
}

export function useCVAppearance() {
  const ctx = useContext(CVAppearanceContext);
  if (!ctx) throw new Error('useCVAppearance must be used within CVProvider');
  return ctx;
}

export function useCVManager() {
  const ctx = useContext(CVManagerContext);
  if (!ctx) throw new Error('useCVManager must be used within CVProvider');
  return ctx;
}

export function useCV() {
  return { ...useCVData(), ...useCVAppearance(), ...useCVManager() };
}
