export interface Personal {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  photo: string | null;
  showPhoto: boolean;
  photoSize: number;
  photoShape: "round" | "square" | "rectangle-portrait" | "rectangle-landscape";
  summary: string;
}

export interface ExperiencePosition {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  positions: ExperiencePosition[];
  description: string;
  skills: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CourseItem {
  id: string;
  name: string;
  organizer: string;
  startDate: string;
  endDate: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link: string;
  skills: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  position: string;
  company: string;
  contact: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
}

export interface VolunteerItem {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CVData {
  personal: Personal;
  experience: ExperienceItem[];
  education: EducationItem[];
  courses: CourseItem[];
  skills: string;
  languages: LanguageItem[];
  interests: string;
  projects: ProjectItem[];
  certificates: CertificateItem[];
  references: ReferenceItem[];
  publications: PublicationItem[];
  volunteer: VolunteerItem[];
  custom: CustomItem[];
  customSectionTitle: string;
  clause: string;
  showClause: boolean;
}

export type SectionKey =
  | "personal"
  | "experience"
  | "education"
  | "courses"
  | "projects"
  | "skills"
  | "languages"
  | "interests"
  | "certificates"
  | "references"
  | "publications"
  | "volunteer"
  | "custom";

export type ColumnSide = "main" | "side";

export type SectionColumns = Record<SectionKey, ColumnSide>;

export type TemplateName =
  | "classic"
  | "twocolumn"
  | "minimalist"
  | "compact"
  | "creative";

export type MarginPreset = "small" | "normal" | "large" | "custom";

export interface CustomMargin {
  vertical: number;
  horizontal: number;
}

export type FontFamily =
  | "sans"
  | "serif"
  | "Roboto"
  | "Open Sans"
  | "Montserrat"
  | "Lato"
  | "Playfair Display";

export type CVLanguage = "pl" | "en";

export type PhotoShape =
  | "round"
  | "square"
  | "rectangle-portrait"
  | "rectangle-landscape";

export interface Profile {
  id: string;
  name: string;
}

export type MarginVariant = "container" | "left-column" | "right-column";

export type MoveDirection = "up" | "down";

export type ArrayFieldName = keyof Pick<
  CVData,
  | "experience"
  | "education"
  | "courses"
  | "languages"
  | "projects"
  | "certificates"
  | "references"
  | "publications"
  | "volunteer"
  | "custom"
>;

// ─── Appearance & snapshot ─────────────────────────────────────────────────

/** Every per-CV appearance setting. Saved in profiles and JSON exports. */
export interface AppearanceSettings {
  template: TemplateName;
  margins: MarginPreset;
  customMargin: CustomMargin;
  themeColor: string;
  fontFamily: FontFamily;
  fontSizeHeading: number;
  fontSizeText: number;
  cvLanguage: CVLanguage;
  showSectionIcons: boolean;
  showContactIcons: boolean;
  creativeHeaderBg: string;
  creativeHeaderImage: string | null;
  sectionGap: number;
  itemGap: number;
  twoColLineWidth: number;
  twoColLineColor: string;
  twoColSidebarWidth: number;
  twoColGapLeft: number;
  twoColGapRight: number;
  twoColSectionGap: number;
  twoColItemGap: number;
}

/** Full state of one CV — what a profile stores and what JSON export contains. */
export interface ProfileSnapshot extends AppearanceSettings {
  data: CVData;
  sectionOrder: SectionKey[];
  sectionColumns: SectionColumns;
}

// ─── Context shape types ───────────────────────────────────────────────────

export interface CVDataContextType {
  data: CVData;
  /**
   * @param group - Consecutive quick updates with the same group become one undo step
   *   (e.g. a field name while typing).
   */
  setData: (updater: CVData | ((prev: CVData) => CVData), group?: string) => void;
  sectionOrder: SectionKey[];
  setSectionOrder: (order: SectionKey[] | ((prev: SectionKey[]) => SectionKey[])) => void;
  sectionColumns: SectionColumns;
  setSectionColumns: (cols: SectionColumns | ((prev: SectionColumns) => SectionColumns)) => void;
  handlePersonalChange: (field: keyof Personal, value: unknown) => void;
  handleSkillsChange: (value: string) => void;
  handleInterestsChange: (value: string) => void;
  handleClauseChange: (value: string) => void;
  toggleClause: () => void;
  addItem: (arrayName: ArrayFieldName, newItem: Record<string, unknown>) => void;
  updateItem: (arrayName: ArrayFieldName, id: string, field: string, value: unknown) => void;
  removeItem: (arrayName: ArrayFieldName, id: string) => void;
  moveItem: (arrayName: ArrayFieldName, index: number, direction: MoveDirection) => void;
  moveSection: (sectionKey: SectionKey, direction: MoveDirection) => void;
  toggleColumn: (sectionKey: SectionKey) => void;
  isFirstInColumn: (sectionKey: SectionKey) => boolean;
  isLastInColumn: (sectionKey: SectionKey) => boolean;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface CVAppearanceContextType extends AppearanceSettings {
  setTemplate: (t: TemplateName) => void;
  setMargins: (m: MarginPreset) => void;
  setCustomMargin: (m: CustomMargin) => void;
  setThemeColor: (c: string) => void;
  setFontFamily: (f: FontFamily) => void;
  setFontSizeHeading: (s: number) => void;
  setFontSizeText: (s: number) => void;
  setCvLanguage: (l: CVLanguage) => void;
  setShowSectionIcons: (s: boolean) => void;
  setShowContactIcons: (s: boolean) => void;
  setCreativeHeaderBg: (c: string) => void;
  setCreativeHeaderImage: (c: string | null) => void;
  setSectionGap: (g: number) => void;
  setItemGap: (g: number) => void;

  // Two-column layout settings
  setTwoColLineWidth: (w: number) => void;
  setTwoColLineColor: (c: string) => void;
  setTwoColSidebarWidth: (w: number) => void;
  setTwoColGapLeft: (g: number) => void;
  setTwoColGapRight: (g: number) => void;
  setTwoColSectionGap: (g: number) => void;
  setTwoColItemGap: (g: number) => void;

  /** Editor UI preference — not part of the CV, so not saved in profiles. */
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;

  getMarginStyle: (variant?: MarginVariant, omitBottom?: boolean) => React.CSSProperties;
  getMarginValues: () => { v: number; h: number };
}

export interface CVManagerContextType {
  storageWarning: string | null;
  dismissWarning: () => void;
  exportJSON: () => void;
  /** Resolves to an error message, or null when the import succeeded. */
  importJSON: (file: File) => Promise<string | null>;
  resetToDefaults: () => void;
  profiles: Profile[];
  activeProfileId: string;
  switchProfile: (id: string) => void;
  createProfile: (name: string, duplicate?: boolean) => void;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
}
