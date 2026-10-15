/**
 * CVDataContext — exposes CV content, section order, and all CRUD operations.
 * State lives in the CV document owned by CVProvider.
 */
import React, { useMemo, useCallback } from 'react';
import { CVDataContext } from './hooks';
import { isColumnTemplate } from '../constants/layout';
import type { CVDocument, UpdateDocument } from '../state/cvDocument';
import type {
  CVData,
  SectionKey,
  SectionColumns,
  ArrayFieldName,
  MoveDirection,
  CVDataContextType,
  TemplateName,
} from '../types/cv';

export interface HistoryControls {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface CVDataProviderProps {
  children: React.ReactNode;
  document: CVDocument;
  updateDocument: UpdateDocument;
  history: HistoryControls;
}

/** Sections that reorder together with `key`: its own column in column templates, otherwise all. */
function siblingsOf(
  key: SectionKey,
  order: SectionKey[],
  columns: SectionColumns,
  template: TemplateName,
): SectionKey[] {
  if (!isColumnTemplate(template)) return order;
  return order.filter((s) => columns[s] === columns[key]);
}

export function CVDataProvider({ children, document, updateDocument, history }: CVDataProviderProps) {
  const { data, sectionOrder, sectionColumns } = document;
  const { template } = document.appearance;

  const updateData = useCallback(
    (update: (data: CVData) => CVData, group?: string) =>
      updateDocument((doc) => {
        const next = update(doc.data);
        return next === doc.data ? doc : { ...doc, data: next };
      }, group),
    [updateDocument],
  );

  const setData = useCallback(
    (updater: CVData | ((prev: CVData) => CVData), group?: string) =>
      updateData((prev) => (typeof updater === 'function' ? updater(prev) : updater), group),
    [updateData],
  );

  const setSectionOrder = useCallback(
    (order: SectionKey[] | ((prev: SectionKey[]) => SectionKey[])) =>
      updateDocument((doc) => ({
        ...doc,
        sectionOrder: typeof order === 'function' ? order(doc.sectionOrder) : order,
      })),
    [updateDocument],
  );

  const setSectionColumns = useCallback(
    (columns: SectionColumns | ((prev: SectionColumns) => SectionColumns)) =>
      updateDocument((doc) => ({
        ...doc,
        sectionColumns: typeof columns === 'function' ? columns(doc.sectionColumns) : columns,
      })),
    [updateDocument],
  );

  // — Mutation helpers — (text edits are grouped per field so typing undoes in one step)
  const handlePersonalChange = useCallback(
    (field: keyof CVData['personal'], value: unknown) =>
      updateData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }), `personal.${field}`),
    [updateData],
  );

  const handleSkillsChange = useCallback(
    (value: string) => updateData((prev) => ({ ...prev, skills: value }), 'skills'),
    [updateData],
  );

  const handleInterestsChange = useCallback(
    (value: string) => updateData((prev) => ({ ...prev, interests: value }), 'interests'),
    [updateData],
  );

  const handleClauseChange = useCallback(
    (value: string) => updateData((prev) => ({ ...prev, clause: value }), 'clause'),
    [updateData],
  );

  const toggleClause = useCallback(
    () => updateData((prev) => ({ ...prev, showClause: !prev.showClause })),
    [updateData],
  );

  const addItem = useCallback(
    (arrayName: ArrayFieldName, newItem: Record<string, unknown>) =>
      updateData((prev) => ({
        ...prev,
        [arrayName]: [...(prev[arrayName] as unknown[]), newItem],
      })),
    [updateData],
  );

  const updateItem = useCallback(
    (arrayName: ArrayFieldName, id: string, field: string, value: unknown) =>
      updateData(
        (prev) => ({
          ...prev,
          [arrayName]: (prev[arrayName] as unknown as Array<Record<string, unknown>>).map((item) =>
            item.id === id ? { ...item, [field]: value } : item,
          ),
        }),
        `${arrayName}.${id}.${field}`,
      ),
    [updateData],
  );

  const removeItem = useCallback(
    (arrayName: ArrayFieldName, id: string) =>
      updateData((prev) => ({
        ...prev,
        [arrayName]: (prev[arrayName] as Array<{ id: string }>).filter((item) => item.id !== id),
      })),
    [updateData],
  );

  const moveItem = useCallback(
    (arrayName: ArrayFieldName, index: number, direction: MoveDirection) =>
      updateData((prev) => {
        const target = direction === 'up' ? index - 1 : index + 1;
        const items = [...(prev[arrayName] as unknown[])];
        if (target < 0 || target >= items.length) return prev;
        [items[index], items[target]] = [items[target], items[index]];
        return { ...prev, [arrayName]: items };
      }),
    [updateData],
  );

  const moveSection = useCallback(
    (sectionKey: SectionKey, direction: MoveDirection) =>
      updateDocument((doc) => {
        const siblings = siblingsOf(sectionKey, doc.sectionOrder, doc.sectionColumns, doc.appearance.template);
        const index = siblings.indexOf(sectionKey);
        const other = siblings[direction === 'up' ? index - 1 : index + 1];
        if (index === -1 || !other) return doc;
        // Swap the two sections in the global order
        const order = doc.sectionOrder.map((s) => (s === sectionKey ? other : s === other ? sectionKey : s));
        return { ...doc, sectionOrder: order };
      }),
    [updateDocument],
  );

  const toggleColumn = useCallback(
    (sectionKey: SectionKey) =>
      updateDocument((doc) => ({
        ...doc,
        sectionColumns: {
          ...doc.sectionColumns,
          [sectionKey]: doc.sectionColumns[sectionKey] === 'main' ? 'side' : 'main',
        },
      })),
    [updateDocument],
  );

  const isFirstInColumn = useCallback(
    (sectionKey: SectionKey): boolean =>
      siblingsOf(sectionKey, sectionOrder, sectionColumns, template)[0] === sectionKey,
    [sectionOrder, sectionColumns, template],
  );

  const isLastInColumn = useCallback(
    (sectionKey: SectionKey): boolean => {
      const siblings = siblingsOf(sectionKey, sectionOrder, sectionColumns, template);
      return siblings[siblings.length - 1] === sectionKey;
    },
    [sectionOrder, sectionColumns, template],
  );

  const value = useMemo<CVDataContextType>(
    () => ({
      data,
      setData,
      sectionOrder,
      setSectionOrder,
      sectionColumns,
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
      ...history,
    }),
    [
      data, setData, sectionOrder, setSectionOrder, sectionColumns, setSectionColumns,
      handlePersonalChange, handleSkillsChange, handleInterestsChange, handleClauseChange,
      toggleClause, addItem, updateItem, removeItem, moveItem, moveSection, toggleColumn,
      isFirstInColumn, isLastInColumn, history,
    ],
  );

  return <CVDataContext.Provider value={value}>{children}</CVDataContext.Provider>;
}
