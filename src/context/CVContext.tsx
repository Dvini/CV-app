/**
 * CVProvider — owns the CV document (content, layout, appearance) and its undo
 * history, persists it, and exposes it through the three sub-contexts.
 *
 * Components read state through the hooks in ./hooks:
 *   useCVData, useCVAppearance, useCVManager
 */
import React, { useCallback, useMemo, useReducer } from 'react';
import { CVDataProvider, type HistoryControls } from './CVDataContext';
import { CVAppearanceProvider } from './CVAppearanceContext';
import { CVProfileProvider } from './CVProfileContext';
import { usePersistedValue } from '../hooks/usePersistedValue';
import { DOCUMENT_STORAGE_KEYS } from '../constants/defaults';
import { createHistory, historyReducer } from '../state/history';
import {
  applySnapshot,
  documentToSnapshot,
  loadDocument,
  removeLegacyAppearanceKeys,
  type CVDocument,
  type UpdateDocument,
} from '../state/cvDocument';
import type { ProfileSnapshot } from '../types/cv';

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer<CVDocument>, undefined, () =>
    createHistory(loadDocument()),
  );
  const doc = history.present;

  usePersistedValue(DOCUMENT_STORAGE_KEYS.data, doc.data);
  usePersistedValue(DOCUMENT_STORAGE_KEYS.sectionOrder, doc.sectionOrder);
  usePersistedValue(DOCUMENT_STORAGE_KEYS.sectionColumns, doc.sectionColumns);
  // Once appearance is saved under its single key, the per-setting keys of older versions are obsolete
  usePersistedValue(DOCUMENT_STORAGE_KEYS.appearance, doc.appearance, removeLegacyAppearanceKeys);

  const updateDocument = useCallback<UpdateDocument>(
    (update, group) => dispatch({ type: 'update', update, group, time: Date.now() }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  const historyControls = useMemo<HistoryControls>(
    () => ({ undo, redo, canUndo, canRedo }),
    [undo, redo, canUndo, canRedo],
  );

  const getSnapshot = useCallback(() => documentToSnapshot(doc), [doc]);

  /** Loads a profile/import/reset; fields missing from the snapshot keep their current value. */
  const loadSnapshot = useCallback(
    (snapshot: Partial<ProfileSnapshot>) => dispatch({ type: 'reset', present: applySnapshot(doc, snapshot) }),
    [doc],
  );

  return (
    <CVAppearanceProvider appearance={doc.appearance} updateDocument={updateDocument}>
      <CVDataProvider document={doc} updateDocument={updateDocument} history={historyControls}>
        <CVProfileProvider getSnapshot={getSnapshot} loadSnapshot={loadSnapshot}>
          {children}
        </CVProfileProvider>
      </CVDataProvider>
    </CVAppearanceProvider>
  );
}
