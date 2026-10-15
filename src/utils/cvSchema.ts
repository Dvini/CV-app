/**
 * Runtime normalization of CV data coming from outside the type system:
 * localStorage (possibly written by an older app version) and imported JSON files.
 *
 * Fields that are missing fall back to defaults; fields of the wrong type are
 * replaced with a safe empty value so the preview can never crash on them.
 */
import {
  APPEARANCE_KEYS,
  defaultData,
  defaultSectionColumns,
  defaultSectionOrder,
} from '../constants/defaults';
import type {
  AppearanceSettings,
  ArrayFieldName,
  ColumnSide,
  CustomMargin,
  CVData,
  CVLanguage,
  ExperienceItem,
  FontFamily,
  MarginPreset,
  Personal,
  PhotoShape,
  Profile,
  ProfileSnapshot,
  SectionColumns,
  SectionKey,
  TemplateName,
} from '../types/cv';

type Obj = Record<string, unknown>;

const TEMPLATES: readonly TemplateName[] = ['classic', 'twocolumn', 'minimalist', 'compact', 'creative'];
const MARGIN_PRESETS: readonly MarginPreset[] = ['small', 'normal', 'large', 'custom'];
const FONT_FAMILIES: readonly FontFamily[] = [
  'sans', 'serif', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Playfair Display',
];
const CV_LANGUAGES: readonly CVLanguage[] = ['pl', 'en'];
const PHOTO_SHAPES: readonly PhotoShape[] = [
  'round', 'square', 'rectangle-portrait', 'rectangle-landscape',
];
const COLUMN_SIDES: readonly ColumnSide[] = ['main', 'side'];

const isObject = (v: unknown): v is Obj =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const str = (v: unknown): string =>
  typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';

const finite = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

const bool = (v: unknown): boolean | undefined => (typeof v === 'boolean' ? v : undefined);

const hexColor = (v: unknown): string | undefined =>
  typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v) ? v : undefined;

const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;

/** Only embedded images are accepted, so an imported file can't make the CV load external URLs. */
const imageDataUrl = (v: unknown): string | null =>
  typeof v === 'string' && v.startsWith('data:image/') ? v : null;

// ─── CV data ───────────────────────────────────────────────────────────────

const ITEM_FIELDS = {
  education: ['school', 'degree', 'startDate', 'endDate'],
  courses: ['name', 'organizer', 'startDate', 'endDate'],
  languages: ['name', 'level'],
  projects: ['name', 'description', 'link', 'skills'],
  certificates: ['name', 'issuer', 'date', 'credentialUrl'],
  references: ['name', 'position', 'company', 'contact'],
  publications: ['title', 'publisher', 'date', 'url'],
  volunteer: ['role', 'organization', 'startDate', 'endDate', 'description'],
  custom: ['title', 'subtitle', 'date', 'description'],
} as const satisfies Record<Exclude<ArrayFieldName, 'experience'>, readonly string[]>;

function normalizeItems(raw: unknown, fields: readonly string[], prefix: string): Obj[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((item, i) => {
    const out: Obj = { id: str(item.id) || `${prefix}-${i}` };
    for (const field of fields) out[field] = str(item[field]);
    return out;
  });
}

function normalizeExperience(raw: unknown): ExperienceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((exp, i) => {
    const id = str(exp.id) || `experience-${i}`;
    // Legacy format: a single role/startDate/endDate instead of positions[]
    const rawPositions: unknown[] = Array.isArray(exp.positions)
      ? exp.positions
      : exp.role || exp.startDate || exp.endDate
        ? [{ id: `${id}-pos-migrated`, title: exp.role, startDate: exp.startDate, endDate: exp.endDate }]
        : [];
    return {
      id,
      company: str(exp.company),
      positions: rawPositions.filter(isObject).map((pos, j) => ({
        id: str(pos.id) || `${id}-pos-${j}`,
        title: str(pos.title),
        startDate: str(pos.startDate),
        endDate: str(pos.endDate),
      })),
      description: str(exp.description),
      skills: str(exp.skills),
    };
  });
}

type PersonalTextField =
  | 'fullName' | 'title' | 'email' | 'phone' | 'location'
  | 'linkedin' | 'github' | 'website' | 'summary';

function normalizePersonal(raw: unknown): Personal {
  const def = defaultData.personal;
  if (!isObject(raw)) return def;
  const text = (key: PersonalTextField) => (raw[key] === undefined ? def[key] : str(raw[key]));
  return {
    fullName: text('fullName'),
    title: text('title'),
    email: text('email'),
    phone: text('phone'),
    location: text('location'),
    linkedin: text('linkedin'),
    github: text('github'),
    website: text('website'),
    summary: text('summary'),
    photo: imageDataUrl(raw.photo),
    showPhoto: bool(raw.showPhoto) ?? def.showPhoto,
    photoSize: finite(raw.photoSize) ?? def.photoSize,
    photoShape: oneOf(raw.photoShape, PHOTO_SHAPES) ?? def.photoShape,
  };
}

/** Returns valid CVData for any input; missing fields get defaults, malformed ones get emptied. */
export function normalizeCVData(raw: unknown): CVData {
  const d = isObject(raw) ? raw : {};
  const items = <K extends keyof typeof ITEM_FIELDS>(key: K): CVData[K] =>
    d[key] === undefined
      ? defaultData[key]
      : (normalizeItems(d[key], ITEM_FIELDS[key], key) as unknown as CVData[K]);
  const text = (key: 'skills' | 'interests' | 'customSectionTitle' | 'clause'): string =>
    d[key] === undefined ? defaultData[key] : str(d[key]);

  return {
    personal: normalizePersonal(d.personal),
    experience: d.experience === undefined ? defaultData.experience : normalizeExperience(d.experience),
    education: items('education'),
    courses: items('courses'),
    languages: items('languages'),
    projects: items('projects'),
    certificates: items('certificates'),
    references: items('references'),
    publications: items('publications'),
    volunteer: items('volunteer'),
    custom: items('custom'),
    skills: text('skills'),
    interests: text('interests'),
    customSectionTitle: text('customSectionTitle'),
    clause: text('clause'),
    showClause: bool(d.showClause) ?? defaultData.showClause,
  };
}

// ─── Section layout ────────────────────────────────────────────────────────

/** Keeps known section keys (deduplicated) and appends any that are missing. */
export function normalizeSectionOrder(raw: unknown): SectionKey[] {
  const known = Array.isArray(raw)
    ? raw.filter((k): k is SectionKey => oneOf(k, defaultSectionOrder) !== undefined)
    : [];
  const order = [...new Set(known)];
  for (const key of defaultSectionOrder) {
    if (!order.includes(key)) order.push(key);
  }
  return order;
}

export function normalizeSectionColumns(raw: unknown): SectionColumns {
  const columns = { ...defaultSectionColumns };
  if (isObject(raw)) {
    for (const key of defaultSectionOrder) {
      const side = oneOf(raw[key], COLUMN_SIDES);
      if (side) columns[key] = side;
    }
  }
  return columns;
}

// ─── Appearance ────────────────────────────────────────────────────────────

function customMargin(v: unknown): CustomMargin | undefined {
  if (!isObject(v)) return undefined;
  const vertical = finite(v.vertical);
  const horizontal = finite(v.horizontal);
  return vertical !== undefined && horizontal !== undefined ? { vertical, horizontal } : undefined;
}

const APPEARANCE_NORMALIZERS: {
  [K in keyof AppearanceSettings]: (v: unknown) => AppearanceSettings[K] | undefined;
} = {
  template: (v) => oneOf(v, TEMPLATES),
  margins: (v) => oneOf(v, MARGIN_PRESETS),
  customMargin,
  themeColor: hexColor,
  fontFamily: (v) => oneOf(v, FONT_FAMILIES),
  fontSizeHeading: finite,
  fontSizeText: finite,
  cvLanguage: (v) => oneOf(v, CV_LANGUAGES),
  showSectionIcons: bool,
  showContactIcons: bool,
  creativeHeaderBg: hexColor,
  creativeHeaderImage: imageDataUrl,
  sectionGap: finite,
  itemGap: finite,
  twoColLineWidth: finite,
  twoColLineColor: hexColor,
  twoColSidebarWidth: finite,
  twoColGapLeft: finite,
  twoColGapRight: finite,
  twoColSectionGap: finite,
  twoColItemGap: finite,
};

/** Returns only the appearance fields that are present and valid. */
export function normalizeAppearance(raw: Obj): Partial<AppearanceSettings> {
  const out: Obj = {};
  for (const key of APPEARANCE_KEYS) {
    if (raw[key] === undefined) continue;
    const value = APPEARANCE_NORMALIZERS[key](raw[key]);
    if (value !== undefined) out[key] = value;
  }
  return out as Partial<AppearanceSettings>;
}

// ─── Profiles ──────────────────────────────────────────────────────────────

/** Keeps well-formed, uniquely-identified profiles; undefined when none are left. */
export function normalizeProfiles(raw: unknown): Profile[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const seen = new Set<string>();
  const profiles = raw.filter(isObject).flatMap((p) => {
    const id = str(p.id);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ id, name: str(p.name) || id }];
  });
  return profiles.length ? profiles : undefined;
}

// ─── Snapshot (profile / JSON file) ────────────────────────────────────────

export type SnapshotParseResult =
  | { ok: true; snapshot: Partial<ProfileSnapshot> }
  | { ok: false; error: string };

/** Validates a profile snapshot. Fields absent from the input are absent from the result. */
export function parseSnapshot(raw: unknown): SnapshotParseResult {
  if (!isObject(raw) || !isObject(raw.data)) {
    return { ok: false, error: 'Ten plik nie zawiera danych CV.' };
  }
  const snapshot: Partial<ProfileSnapshot> = {
    ...normalizeAppearance(raw),
    data: normalizeCVData(raw.data),
  };
  if (raw.sectionOrder !== undefined) snapshot.sectionOrder = normalizeSectionOrder(raw.sectionOrder);
  if (raw.sectionColumns !== undefined) snapshot.sectionColumns = normalizeSectionColumns(raw.sectionColumns);
  return { ok: true, snapshot };
}

export function parseSnapshotJSON(text: string): SnapshotParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'To nie jest poprawny plik JSON.' };
  }
  return parseSnapshot(raw);
}
