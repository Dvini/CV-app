import {
  DEFAULT_CUSTOM_MARGIN,
  DEFAULT_THEME_COLOR,
  COLUMN_INNER_GAP_LEFT,
  COLUMN_INNER_GAP_RIGHT,
} from './layout';
import type {
  AppearanceSettings,
  CVData,
  ProfileSnapshot,
  SectionColumns,
  SectionKey,
} from '../types/cv';

export const defaultData: CVData = {
  personal: {
    fullName: 'Jan Kowalski',
    title: 'Senior Software Engineer',
    email: 'jan.kowalski@example.com',
    phone: '+48 123 456 789',
    location: 'Warszawa, Polska',
    linkedin: 'linkedin.com/in/jankowalski',
    github: '',
    website: '',
    photo: null,
    showPhoto: false,
    photoSize: 80,
    photoShape: 'round',
    summary:
      'Doświadczony inżynier oprogramowania z ponad 5-letnim stażem w budowaniu skalowalnych aplikacji webowych. Zorientowany na jakość kodu, czystą architekturę oraz efektywną pracę w zespole.',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Solutions Sp. z o.o.',
      positions: [
        {
          id: 'pos-1a',
          title: 'Senior Frontend Developer',
          startDate: '06/2022',
          endDate: 'Obecnie',
        },
        {
          id: 'pos-1b',
          title: 'Frontend Developer',
          startDate: '01/2021',
          endDate: '05/2022',
        },
      ],
      description:
        'Projektowanie i implementacja nowoczesnych interfejsów użytkownika.\nOptymalizacja wydajności aplikacji oraz mentoring młodszych programistów.',
      skills: 'React, TypeScript, Tailwind CSS, Node.js',
    },
    {
      id: 'exp-2',
      company: 'Digital Studio',
      positions: [
        {
          id: 'pos-2a',
          title: 'Web Developer',
          startDate: '06/2018',
          endDate: '12/2020',
        },
      ],
      description:
        'Tworzenie responsywnych stron internetowych dla klientów korporacyjnych.\nIntegracja z systemami CMS i zewnętrznymi API.',
      skills: 'JavaScript, HTML, CSS, PHP',
    },
  ],
  education: [
    {
      id: 'edu-1',
      school: 'Politechnika Warszawska',
      degree: 'Magister Inżynier, Informatyka',
      startDate: '10/2013',
      endDate: '06/2018',
    },
  ],
  courses: [
    {
      id: 'course-1',
      name: 'Advanced React Patterns',
      organizer: 'Frontend Masters',
      startDate: '03/2023',
      endDate: '04/2023',
    },
  ],
  skills:
    'JavaScript, TypeScript, React, Next.js, Node.js, SQL, Git, Docker, Architektura Systemów, Scrum',
  languages: [
    {
      id: 'lang-1',
      name: 'Angielski',
      level: 'C1',
    },
  ],
  interests: 'Fotografia, podróże, technologie webowe',
  projects: [
    {
      id: 'proj-1',
      name: 'Portfolio Website',
      description: 'Responsywna strona portfolio z ciemnym motywem i animacjami.',
      link: 'https://example.com',
      skills: 'React, CSS, Framer Motion',
    },
  ],
  clause:
    'Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).',
  showClause: true,
  certificates: [],
  references: [],
  publications: [],
  volunteer: [],
  custom: [],
  customSectionTitle: '',
};

export const defaultSectionOrder: SectionKey[] = [
  'personal',
  'experience',
  'education',
  'courses',
  'projects',
  'skills',
  'languages',
  'interests',
  'certificates',
  'references',
  'publications',
  'volunteer',
  'custom',
];

export const defaultSectionColumns: SectionColumns = {
  personal: 'main',
  experience: 'main',
  education: 'side',
  courses: 'main',
  projects: 'main',
  skills: 'side',
  languages: 'side',
  interests: 'side',
  certificates: 'side',
  references: 'main',
  publications: 'main',
  volunteer: 'main',
  custom: 'main',
};

export const defaultAppearance: AppearanceSettings = {
  template: 'classic',
  margins: 'normal',
  customMargin: DEFAULT_CUSTOM_MARGIN,
  themeColor: DEFAULT_THEME_COLOR,
  fontFamily: 'sans',
  fontSizeHeading: 1,
  fontSizeText: 1,
  cvLanguage: 'pl',
  showSectionIcons: false,
  showContactIcons: false,
  creativeHeaderBg: DEFAULT_THEME_COLOR,
  creativeHeaderImage: null,
  sectionGap: 1.25,
  itemGap: 0.5,
  twoColLineWidth: 1,
  twoColLineColor: '#e2e8f0',
  twoColSidebarWidth: 33,
  twoColGapLeft: COLUMN_INNER_GAP_LEFT,
  twoColGapRight: COLUMN_INNER_GAP_RIGHT,
  twoColSectionGap: 0.5,
  twoColItemGap: 0.2,
};

export const APPEARANCE_KEYS = Object.keys(defaultAppearance) as (keyof AppearanceSettings)[];

/**
 * Where each appearance setting was stored before they were merged into
 * DOCUMENT_STORAGE_KEYS.appearance. Read once to migrate older data, then removed.
 */
export const LEGACY_APPEARANCE_STORAGE_KEYS: Record<keyof AppearanceSettings, string> = {
  template: 'cv_template',
  margins: 'cv_margins',
  customMargin: 'cv_customMargin',
  themeColor: 'cv_themeColor',
  fontFamily: 'cv_fontFamily',
  fontSizeHeading: 'cv_fontSizeHeading',
  fontSizeText: 'cv_fontSizeText',
  cvLanguage: 'cv_language',
  showSectionIcons: 'cv_showSectionIcons',
  showContactIcons: 'cv_showContactIcons',
  creativeHeaderBg: 'cv_creativeHeaderBg',
  creativeHeaderImage: 'cv_creativeHeaderImage',
  sectionGap: 'cv_sectionGap',
  itemGap: 'cv_itemGap',
  twoColLineWidth: 'cv_twoColLineWidth',
  twoColLineColor: 'cv_twoColLineColor',
  twoColSidebarWidth: 'cv_twoColSidebarWidth',
  twoColGapLeft: 'cv_twoColGapLeft',
  twoColGapRight: 'cv_twoColGapRight',
  twoColSectionGap: 'cv_twoColSectionGap',
  twoColItemGap: 'cv_twoColItemGap',
};

/** localStorage keys holding the active CV, one per document slice. */
export const DOCUMENT_STORAGE_KEYS = {
  data: 'cv_data',
  sectionOrder: 'cv_sectionOrder',
  sectionColumns: 'cv_sectionColumns',
  appearance: 'cv_appearance',
} as const;

export const DEFAULT_SNAPSHOT: ProfileSnapshot = {
  data: defaultData,
  sectionOrder: defaultSectionOrder,
  sectionColumns: defaultSectionColumns,
  ...defaultAppearance,
};
