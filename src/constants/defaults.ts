export const defaultData = {
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

export const defaultSectionOrder = [
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

export const defaultSectionColumns = {
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
