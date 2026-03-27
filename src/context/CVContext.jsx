import React, { createContext, useContext, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  defaultData,
  defaultSectionOrder,
  defaultSectionColumns,
} from '../constants/defaults';

const CVContext = createContext(null);

export function CVProvider({ children }) {
  // Core CV data
  const [data, setData] = useLocalStorage('cv_data', defaultData);
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
  const [customMargin, setCustomMargin] = useLocalStorage('cv_customMargin', {
    vertical: 15,
    horizontal: 15,
  });
  const [themeColor, setThemeColor] = useLocalStorage('cv_themeColor', '#2563eb');
  const [fontFamily, setFontFamily] = useLocalStorage('cv_fontFamily', 'sans');
  const [cvLanguage, setCvLanguage] = useLocalStorage('cv_language', 'pl');
  const [darkMode, setDarkMode] = useLocalStorage('cv_darkMode', false);

  const fileInputRef = useRef(null);

  // --- Ensure backwards compatibility for loaded data ---
  const safeData = {
    ...defaultData,
    ...data,
    personal: { ...defaultData.personal, ...(data?.personal || {}) },
    experience: data?.experience || defaultData.experience,
    education: data?.education || defaultData.education,
    courses: data?.courses || defaultData.courses,
    skills: data?.skills ?? defaultData.skills,
    languages: data?.languages || defaultData.languages,
    projects: data?.projects || defaultData.projects || [],
    clause: data?.clause ?? defaultData.clause,
    showClause: data?.showClause ?? defaultData.showClause,
  };

  const safeSectionOrder = (() => {
    const order = [...(sectionOrder || defaultSectionOrder)];
    if (!order.includes('projects')) order.push('projects');
    return order;
  })();

  const safeSectionColumns = {
    ...defaultSectionColumns,
    ...(sectionColumns || {}),
  };

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
      cvLanguage,
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
        if (imported.cvLanguage) setCvLanguage(imported.cvLanguage);
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
    setCustomMargin({ vertical: 15, horizontal: 15 });
    setThemeColor('#2563eb');
    setFontFamily('sans');
    setCvLanguage('pl');
  };

  // Margin styles
  const getMarginValues = () => {
    const presets = { small: { v: 12, h: 12 }, normal: { v: 20, h: 20 }, large: { v: 25, h: 25 } };
    if (margins === 'custom') return { v: customMargin.vertical || 15, h: customMargin.horizontal || 15 };
    return presets[margins] || presets.normal;
  };

  const getMarginStyle = (variant = 'container', omitBottom = false) => {
    let v, h;
    if (margins === 'custom') {
      v = customMargin.vertical;
      h = customMargin.horizontal;
    } else {
      const presets = { small: 12, normal: 20, large: 25 };
      v = presets[margins] || presets.normal;
      h = v;
    }

    if (variant === 'left-column') {
      return {
        paddingTop: `${v}mm`,
        paddingRight: `6mm`, // fixed inner gap
        paddingBottom: omitBottom ? '0mm' : `${v}mm`,
        paddingLeft: `${h}mm` // outer document margin
      };
    }
    
    if (variant === 'right-column') {
      return {
        paddingTop: `${v}mm`,
        paddingRight: `${h}mm`, // outer document margin
        paddingBottom: omitBottom ? '0mm' : `${v}mm`,
        paddingLeft: `8mm` // fixed inner gap
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

  const value = {
    data: safeData,
    setData,
    sectionOrder: safeSectionOrder,
    setSectionOrder,
    sectionColumns: safeSectionColumns,
    setSectionColumns,
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
    cvLanguage,
    setCvLanguage,
    darkMode,
    setDarkMode,
    fileInputRef,
    // Helpers
    handlePersonalChange,
    handleSkillsChange,
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
    exportJSON,
    importJSON,
    resetToDefaults,
    getMarginStyle,
    getMarginValues,
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCV must be used within CVProvider');
  return ctx;
}
