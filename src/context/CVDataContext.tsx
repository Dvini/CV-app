/**
 * CVDataContext — manages core CV data, section order, and all CRUD operations.
 */
import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useLocalStorage, onStorageError } from '../hooks/useLocalStorage';
import { useHistory } from '../hooks/useHistory';
import { defaultData, defaultSectionOrder, defaultSectionColumns } from '../constants/defaults';
import type {
  CVData,
  SectionKey,
  SectionColumns,
  ArrayFieldName,
  MoveDirection,
  CVDataContextType,
  TemplateName,
} from '../types/cv';

export const CVDataContext = createContext<CVDataContextType | null>(null);

export function useCVData(): CVDataContextType {
  const ctx = useContext(CVDataContext);
  if (!ctx) throw new Error('useCVData must be used within CVProvider');
  return ctx;
}

interface CVDataProviderProps {
  children: React.ReactNode;
  template: TemplateName;
}

export function CVDataProvider({ children, template }: CVDataProviderProps) {
  const [data, setDataRaw] = useLocalStorage<CVData>('cv_data', defaultData as CVData);
  const { undo, redo, canUndo, canRedo, trackChange } = useHistory(data, setDataRaw);

  const setData = useCallback(
    (updater: CVData | ((prev: CVData) => CVData)) => {
      setDataRaw((prev) => {
        trackChange(prev);
        return typeof updater === 'function' ? updater(prev) : updater;
      });
    },
    [setDataRaw, trackChange],
  );

  const [sectionOrder, setSectionOrder] = useLocalStorage<SectionKey[]>(
    'cv_sectionOrder',
    defaultSectionOrder as SectionKey[],
  );
  const [sectionColumns, setSectionColumns] = useLocalStorage<SectionColumns>(
    'cv_sectionColumns',
    defaultSectionColumns as SectionColumns,
  );

  // Backwards-compat safe data
  const safeData = useMemo<CVData>(() => {
    // Migrate old experience format (role/startDate/endDate) to new positions[] format
    const rawExperience = data?.experience || (defaultData as CVData).experience;
    const migratedExperience = (rawExperience as unknown as Array<Record<string, unknown>>).map((exp) => {
      if (!exp.positions && (exp.role || exp.startDate || exp.endDate)) {
        return {
          ...exp,
          positions: [
            {
              id: `${exp.id}-pos-migrated`,
              title: exp.role || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
            },
          ],
        };
      }
      return exp;
    });

    return {
      ...(defaultData as CVData),
      ...data,
      personal: { ...(defaultData as CVData).personal, ...(data?.personal || {}) },
      experience: migratedExperience as unknown as CVData['experience'],
      education: data?.education || (defaultData as CVData).education,
      courses: data?.courses || (defaultData as CVData).courses,
      skills: data?.skills ?? (defaultData as CVData).skills,
      languages: data?.languages || (defaultData as CVData).languages,
      interests: data?.interests ?? (defaultData as CVData).interests,
      projects: data?.projects || (defaultData as CVData).projects || [],
      certificates: data?.certificates || (defaultData as CVData).certificates,
      references: data?.references || (defaultData as CVData).references,
      publications: data?.publications || (defaultData as CVData).publications,
      volunteer: data?.volunteer || (defaultData as CVData).volunteer,
      custom: data?.custom || (defaultData as CVData).custom,
      customSectionTitle: data?.customSectionTitle ?? (defaultData as CVData).customSectionTitle,
      clause: data?.clause ?? (defaultData as CVData).clause,
      showClause: data?.showClause ?? (defaultData as CVData).showClause,
    };
  }, [data]);

  const safeSectionOrder = useMemo<SectionKey[]>(() => {
    const order = [...((sectionOrder as SectionKey[]) || defaultSectionOrder)];
    for (const section of defaultSectionOrder as SectionKey[]) {
      if (!order.includes(section)) order.push(section);
    }
    return order;
  }, [sectionOrder]);

  const safeSectionColumns = useMemo<SectionColumns>(
    () => ({
      ...(defaultSectionColumns as SectionColumns),
      ...(sectionColumns || {}),
    }),
    [sectionColumns],
  );

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
