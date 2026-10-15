/**
 * The active CV as one document: content, section layout and appearance.
 * Undo history works on whole documents; each slice is persisted under its own key.
 */
import {
  APPEARANCE_KEYS,
  DOCUMENT_STORAGE_KEYS,
  LEGACY_APPEARANCE_STORAGE_KEYS,
  defaultAppearance,
} from '../constants/defaults';
import {
  normalizeAppearance,
  normalizeCVData,
  normalizeSectionColumns,
  normalizeSectionOrder,
} from '../utils/cvSchema';
import type {
  AppearanceSettings,
  CVData,
  ProfileSnapshot,
  SectionColumns,
  SectionKey,
} from '../types/cv';

export interface CVDocument {
  data: CVData;
  sectionOrder: SectionKey[];
  sectionColumns: SectionColumns;
  appearance: AppearanceSettings;
}

/**
 * Applies a pure update to the document. Quick consecutive updates with the same
 * `group` are merged into one undo step.
 */
export type UpdateDocument = (update: (doc: CVDocument) => CVDocument, group?: string) => void;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function readStored(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * The stored active CV, unvalidated, in the JSON import format. Appearance comes from
 * its single key, or from the per-setting keys used by older versions of the app.
 */
export function readStoredSnapshot(): Record<string, unknown> {
  const storedAppearance = readStored(DOCUMENT_STORAGE_KEYS.appearance);
  const appearance: Record<string, unknown> = {};
  for (const key of APPEARANCE_KEYS) {
    appearance[key] = isObject(storedAppearance)
      ? storedAppearance[key]
      : readStored(LEGACY_APPEARANCE_STORAGE_KEYS[key]);
  }
  return {
    ...appearance,
    data: readStored(DOCUMENT_STORAGE_KEYS.data),
    sectionOrder: readStored(DOCUMENT_STORAGE_KEYS.sectionOrder),
    sectionColumns: readStored(DOCUMENT_STORAGE_KEYS.sectionColumns),
  };
}

/** Loads the active CV from localStorage; anything missing or malformed gets defaults. */
export function loadDocument(): CVDocument {
  const stored = readStoredSnapshot();
  return {
    data: normalizeCVData(stored.data),
    sectionOrder: normalizeSectionOrder(stored.sectionOrder),
    sectionColumns: normalizeSectionColumns(stored.sectionColumns),
    appearance: { ...defaultAppearance, ...normalizeAppearance(stored) },
  };
}

export function documentToSnapshot(doc: CVDocument): ProfileSnapshot {
  return {
    ...doc.appearance,
    data: doc.data,
    sectionOrder: doc.sectionOrder,
    sectionColumns: doc.sectionColumns,
  };
}

/** Applies a (possibly partial) snapshot; fields it lacks keep their current value. */
export function applySnapshot(doc: CVDocument, snapshot: Partial<ProfileSnapshot>): CVDocument {
  const appearance: Record<string, unknown> = { ...doc.appearance };
  for (const key of APPEARANCE_KEYS) {
    if (snapshot[key] !== undefined) appearance[key] = snapshot[key];
  }
  return {
    data: snapshot.data ?? doc.data,
    sectionOrder: snapshot.sectionOrder ?? doc.sectionOrder,
    sectionColumns: snapshot.sectionColumns ?? doc.sectionColumns,
    appearance: appearance as unknown as AppearanceSettings,
  };
}

/** Every localStorage key that holds part of the active CV, current and legacy. */
export const ACTIVE_CV_STORAGE_KEYS = [
  ...Object.values(DOCUMENT_STORAGE_KEYS),
  ...Object.values(LEGACY_APPEARANCE_STORAGE_KEYS),
];

export function removeLegacyAppearanceKeys(): void {
  for (const key of Object.values(LEGACY_APPEARANCE_STORAGE_KEYS)) localStorage.removeItem(key);
}
