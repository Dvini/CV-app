/**
 * CVDataContext — manages core CV data, section order, and all CRUD operations.
 */
import React, { useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CVDataContext } from './hooks';
import { useHistory } from '../hooks/useHistory';
import {
  defaultData,
  defaultSectionOrder,
  defaultSectionColumns,
  DATA_STORAGE_KEYS,
} from '../constants/defaults';
import {
  normalizeCVData,
  normalizeSectionOrder,
  normalizeSectionColumns,
} from '../utils/cvSchema';
import type {
  CVData,
  SectionKey,
  SectionColumns,
  ArrayFieldName,
  MoveDirection,
  CVDataContextType,
  TemplateName,
} from '../types/cv';


interface CVDataProviderProps {
  children: React.ReactNode;
  template: TemplateName;
}

export function CVDataProvider({ children, template }: CVDataProviderProps) {
  const [data, setDataRaw] = useLocalStorage<CVData>(DATA_STORAGE_KEYS.data, defaultData);
  const { undo, redo, canUndo, canRedo, trackChange, clearHistory } = useHistory(data, setDataRaw);

  const setData = useCallback(
    (updater: CVData | ((prev: CVData) => CVData)) => {
      setDataRaw((prev) => {
        trackChange(prev);
        // Mutation helpers assume well-formed data, so never hand them raw stored data
        const current = normalizeCVData(prev);
        return typeof updater === 'function' ? updater(current) : updater;
      });
    },
    [setDataRaw, trackChange],
  );

  const replaceData = useCallback(
    (next: CVData) => {
      setDataRaw(next);
      clearHistory();
    },
    [setDataRaw, clearHistory],
  );

  const [sectionOrder, setSectionOrder] = useLocalStorage<SectionKey[]>(
    DATA_STORAGE_KEYS.sectionOrder,
    defaultSectionOrder,
  );
  const [sectionColumns, setSectionColumns] = useLocalStorage<SectionColumns>(
    DATA_STORAGE_KEYS.sectionColumns,
    defaultSectionColumns,
  );

  // Stored data may come from an older app version or be corrupted — normalize before use
  const safeData = useMemo(() => normalizeCVData(data), [data]);
  const safeSectionOrder = useMemo(() => normalizeSectionOrder(sectionOrder), [sectionOrder]);
  const safeSectionColumns = useMemo(() => normalizeSectionColumns(sectionColumns), [sectionColumns]);

  // — Mutation helpers —
  const handlePersonalChange = useCallback(
    (field: keyof CVData['personal'], value: unknown) => {
      setData((prev) => ({
        ...prev,
        personal: { ...prev.personal, [field]: value },
      }));
    },
    [setData],
  );

  const handleSkillsChange = useCallback(
    (value: string) => setData((prev) => ({ ...prev, skills: value })),
    [setData],
  );

  const handleInterestsChange = useCallback(
    (value: string) => setData((prev) => ({ ...prev, interests: value })),
    [setData],
  );

  const handleClauseChange = useCallback(
    (value: string) => setData((prev) => ({ ...prev, clause: value })),
    [setData],
  );

  const toggleClause = useCallback(
    () => setData((prev) => ({ ...prev, showClause: !prev.showClause })),
    [setData],
  );

  const addItem = useCallback(
    (arrayName: ArrayFieldName, newItem: Record<string, unknown>) => {
      setData((prev) => ({
        ...prev,
        [arrayName]: [...((prev[arrayName] as unknown[]) || []), newItem],
      }));
    },
    [setData],
  );

  const updateItem = useCallback(
    (arrayName: ArrayFieldName, id: string, field: string, value: unknown) => {
      setData((prev) => ({
        ...prev,
        [arrayName]: (prev[arrayName] as unknown as Array<Record<string, unknown>>).map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [setData],
  );

  const removeItem = useCallback(
    (arrayName: ArrayFieldName, id: string) => {
      setData((prev) => ({
        ...prev,
        [arrayName]: ((prev[arrayName] as Array<{ id: string }>) || []).filter((item) => item.id !== id),
      }));
    },
    [setData],
  );

  const moveItem = useCallback(
    (arrayName: ArrayFieldName, index: number, direction: MoveDirection) => {
      setData((prev) => {
        const newArray = [...(prev[arrayName] as unknown[])];
        if (direction === 'up' && index > 0) {
          [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
        } else if (direction === 'down' && index < newArray.length - 1) {
          [newArray[index + 1], newArray[index]] = [newArray[index], newArray[index + 1]];
        }
        return { ...prev, [arrayName]: newArray };
      });
    },
    [setData],
  );

  const swapInGlobalOrder = useCallback(
    (key1: SectionKey, key2: SectionKey) => {
      setSectionOrder((prev) => {
        const newOrder = [...(prev as SectionKey[])];
        const idx1 = newOrder.indexOf(key1);
        const idx2 = newOrder.indexOf(key2);
        if (idx1 !== -1 && idx2 !== -1) {
          newOrder[idx1] = key2;
          newOrder[idx2] = key1;
        }
        return newOrder;
      });
    },
    [setSectionOrder],
  );

  const moveSection = useCallback(
    (sectionKey: SectionKey, direction: MoveDirection) => {
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
    },
    [template, safeSectionOrder, safeSectionColumns, swapInGlobalOrder],
  );

  const toggleColumn = useCallback(
    (sectionKey: SectionKey) => {
      setSectionColumns((prev) => ({
        ...(prev as SectionColumns),
        [sectionKey]: (prev as SectionColumns)[sectionKey] === 'main' ? 'side' : 'main',
      }));
    },
    [setSectionColumns],
  );

  const isFirstInColumn = useCallback(
    (sectionKey: SectionKey): boolean => {
      const col = template === 'twocolumn' ? safeSectionColumns[sectionKey] : 'all';
      const list =
        col === 'all'
          ? safeSectionOrder
          : safeSectionOrder.filter((s) => safeSectionColumns[s] === col);
      return list.indexOf(sectionKey) === 0;
    },
    [template, safeSectionOrder, safeSectionColumns],
  );

  const isLastInColumn = useCallback(
    (sectionKey: SectionKey): boolean => {
      const col = template === 'twocolumn' ? safeSectionColumns[sectionKey] : 'all';
      const list =
        col === 'all'
          ? safeSectionOrder
          : safeSectionOrder.filter((s) => safeSectionColumns[s] === col);
      return list.indexOf(sectionKey) === list.length - 1;
    },
    [template, safeSectionOrder, safeSectionColumns],
  );

  const value: CVDataContextType = {
    data: safeData,
    setData,
    replaceData,
    sectionOrder: safeSectionOrder,
    setSectionOrder: setSectionOrder as CVDataContextType['setSectionOrder'],
    sectionColumns: safeSectionColumns,
    setSectionColumns: setSectionColumns as CVDataContextType['setSectionColumns'],
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
  };

  return <CVDataContext.Provider value={value}>{children}</CVDataContext.Provider>;
}
