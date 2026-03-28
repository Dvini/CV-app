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

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
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
