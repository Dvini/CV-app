import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, Download, GripVertical, FileJson, Upload } from 'lucide-react';

// Słownik tłumaczeń statycznych nagłówków na CV
const cvTranslations = {
  pl: {
    summary: 'Podsumowanie',
    experience: 'Doświadczenie',
    education: 'Edukacja',
    courses: 'Szkolenia i Kursy',
    skills: 'Umiejętności',
    languages: 'Języki',
    tech: 'Technologie:'
  },
  en: {
    summary: 'Profile',
    experience: 'Experience',
    education: 'Education',
    courses: 'Courses & Training',
    skills: 'Skills',
    languages: 'Languages',
    tech: 'Technologies:'
  }
};

// Funkcja pomocnicza do ładowania stanu z localStorage
const loadState = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch {
    return defaultVal;
  }
};

// Domyślne dane początkowe
const defaultData = {
  personal: {
    fullName: 'Jan Kowalski',
    title: 'Senior Software Engineer',
    email: 'jan.kowalski@example.com',
    phone: '+48 123 456 789',
    location: 'Warszawa, Polska',
    linkedin: 'linkedin.com/in/jankowalski',
    summary: 'Doświadczony inżynier oprogramowania z ponad 5-letnim stażem w budowaniu skalowalnych aplikacji webowych. Zorientowany na jakość kodu, czystą architekturę (Uncodixify) oraz efektywną pracę w zespole.'
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Solutions Sp. z o.o.',
      role: 'Senior Frontend Developer',
      startDate: '01/2021',
      endDate: 'Obecnie',
      description: 'Projektowanie i implementacja nowoczesnych interfejsów użytkownika. Optymalizacja wydajności aplikacji oraz mentoring młodszych programistów.',
      skills: 'React, TypeScript, Tailwind CSS, Node.js'
    },
    {
      id: 'exp-2',
      company: 'Digital Studio',
      role: 'Web Developer',
      startDate: '06/2018',
      endDate: '12/2020',
      description: 'Tworzenie responsywnych stron internetowych dla klientów korporacyjnych. Integracja z systemami CMS i zewnętrznymi API.',
      skills: 'JavaScript, HTML, CSS, PHP'
    }
  ],
  education: [
    {
      id: 'edu-1',
      school: 'Politechnika Warszawska',
      degree: 'Magister Inżynier, Informatyka',
      startDate: '10/2013',
      endDate: '06/2018'
    }
  ],
  courses: [
    {
      id: 'course-1',
      name: 'Advanced React Patterns',
      organizer: 'Frontend Masters',
      startDate: '03/2023',
      endDate: '04/2023'
    }
  ],
  skills: 'JavaScript, TypeScript, React, Next.js, Node.js, SQL, Git, Docker, Architektura Systemów, Scrum',
  languages: [
    {
      id: 'lang-1',
      name: 'Angielski',
      level: 'C1 / Zaawansowany'
    }
  ]
};

const presetColors = [
  { name: 'Niebieski', value: '#2563eb' },
  { name: 'Morski', value: '#0f766e' },
  { name: 'Indygo', value: '#4f46e5' },
  { name: 'Rdza', value: '#b45309' },
  { name: 'Czerń', value: '#111827' }
];

export default function App() {
  // Stany główne ładujące się z LocalStorage, z zabezpieczeniem brakujących nowych sekcji
  const [data, setData] = useState(() => {
    const loaded = loadState('cv_data', defaultData);
    if (!loaded.languages) loaded.languages = defaultData.languages;
    return loaded;
  });
  const [sectionOrder, setSectionOrder] = useState(() => {
    const loaded = loadState('cv_sectionOrder', ['personal', 'experience', 'education', 'courses', 'skills', 'languages']);
    if (!loaded.includes('languages')) loaded.push('languages');
    return loaded;
  });
  const [sectionColumns, setSectionColumns] = useState(() => {
    const loaded = loadState('cv_sectionColumns', { personal: 'main', experience: 'main', education: 'side', courses: 'main', skills: 'side', languages: 'side' });
    if (!loaded.languages) loaded.languages = 'side';
    return loaded;
  });
  const [template, setTemplate] = useState(() => loadState('cv_template', 'classic'));
  const [margins, setMargins] = useState(() => loadState('cv_margins', 'normal'));
  const [customMargin, setCustomMargin] = useState(() => loadState('cv_customMargin', { vertical: 15, horizontal: 15 }));
  const [themeColor, setThemeColor] = useState(() => loadState('cv_themeColor', '#2563eb'));
  const [fontFamily, setFontFamily] = useState(() => loadState('cv_fontFamily', 'sans'));
  const [cvLanguage, setCvLanguage] = useState(() => loadState('cv_language', 'pl'));

  const fileInputRef = useRef(null);

  // Stan otwartych paneli w edytorze
  const [openPanels, setOpenPanels] = useState({
    dataSync: false,
    appearance: true,
    layout: false,
    personal: true,
    experience: false,
    education: false,
    courses: false,
    skills: false,
    languages: false
  });

  // Autozapis do LocalStorage
  useEffect(() => {
    localStorage.setItem('cv_data', JSON.stringify(data));
    localStorage.setItem('cv_sectionOrder', JSON.stringify(sectionOrder));
    localStorage.setItem('cv_sectionColumns', JSON.stringify(sectionColumns));
    localStorage.setItem('cv_template', JSON.stringify(template));
    localStorage.setItem('cv_margins', JSON.stringify(margins));
    localStorage.setItem('cv_customMargin', JSON.stringify(customMargin));
    localStorage.setItem('cv_themeColor', JSON.stringify(themeColor));
    localStorage.setItem('cv_fontFamily', JSON.stringify(fontFamily));
    localStorage.setItem('cv_language', JSON.stringify(cvLanguage));
  }, [data, sectionOrder, sectionColumns, template, margins, customMargin, themeColor, fontFamily, cvLanguage]);

  const togglePanel = (panel) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  // --- Handlery Import/Export ---
  const exportJSON = () => {
    const stateToExport = { data, sectionOrder, sectionColumns, template, margins, customMargin, themeColor, fontFamily, cvLanguage };
    const blob = new Blob([JSON.stringify(stateToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${data.personal.fullName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.data) {
          if (!imported.data.languages) imported.data.languages = [];
          setData(imported.data);
        }
        if (imported.sectionOrder) {
          if (!imported.sectionOrder.includes('languages')) imported.sectionOrder.push('languages');
          setSectionOrder(imported.sectionOrder);
        }
        if (imported.sectionColumns) {
          if (!imported.sectionColumns.languages) imported.sectionColumns.languages = 'side';
          setSectionColumns(imported.sectionColumns);
        }
        if (imported.template) setTemplate(imported.template);
        if (imported.margins) setMargins(imported.margins);
        if (imported.customMargin) setCustomMargin(imported.customMargin);
        if (imported.themeColor) setThemeColor(imported.themeColor);
        if (imported.fontFamily) setFontFamily(imported.fontFamily);
        if (imported.cvLanguage) setCvLanguage(imported.cvLanguage);
      } catch (err) {
        alert("Wystąpił błąd podczas odczytu pliku. Upewnij się, że to poprawny plik JSON z CV.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // --- Handlery edycji danych ---
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, personal: { ...prev.personal, [name]: value } }));
  };

  const handleSkillsChange = (e) => {
    setData(prev => ({ ...prev, skills: e.target.value }));
  };

  const moveItemInArray = (arrayName, index, direction) => {
    setData(prev => {
      const newArray = [...prev[arrayName]];
      if (direction === 'up' && index > 0) {
        [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      } else if (direction === 'down' && index < newArray.length - 1) {
        [newArray[index + 1], newArray[index]] = [newArray[index], newArray[index + 1]];
      }
      return { ...prev, [arrayName]: newArray };
    });
  };

  // Doświadczenie
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: '', skills: '' }] }));
  const updateExperience = (id, field, value) => setData(prev => ({ ...prev, experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) }));
  const removeExperience = (id) => setData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));

  // Edukacja
  const addEducation = () => setData(prev => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), school: '', degree: '', startDate: '', endDate: '' }] }));
  const updateEducation = (id, field, value) => setData(prev => ({ ...prev, education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) }));
  const removeEducation = (id) => setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));

  // Kursy
  const addCourse = () => setData(prev => ({ ...prev, courses: [...prev.courses, { id: Date.now().toString(), name: '', organizer: '', startDate: '', endDate: '' }] }));
  const updateCourse = (id, field, value) => setData(prev => ({ ...prev, courses: prev.courses.map(course => course.id === id ? { ...course, [field]: value } : course) }));
  const removeCourse = (id) => setData(prev => ({ ...prev, courses: prev.courses.filter(course => course.id !== id) }));

  // Języki
  const addLanguage = () => setData(prev => ({ ...prev, languages: [...prev.languages, { id: Date.now().toString(), name: '', level: '' }] }));
  const updateLanguage = (id, field, value) => setData(prev => ({ ...prev, languages: prev.languages.map(lang => lang.id === id ? { ...lang, [field]: value } : lang) }));
  const removeLanguage = (id) => setData(prev => ({ ...prev, languages: prev.languages.filter(lang => lang.id !== id) }));


  // --- Handlery zarządzania układem sekcji ---
  const toggleColumn = (sectionKey) => {
    setSectionColumns(prev => ({ ...prev, [sectionKey]: prev[sectionKey] === 'main' ? 'side' : 'main' }));
  };

  const moveSection = (sectionKey, direction) => {
    const currentColumn = template === 'twocolumn' ? sectionColumns[sectionKey] : 'all';
    let relevantList = currentColumn === 'all' ? [...sectionOrder] : sectionOrder.filter(s => sectionColumns[s] === currentColumn);
    const currentIndex = relevantList.indexOf(sectionKey);
    
    if (direction === 'up' && currentIndex > 0) {
      swapInGlobalOrder(sectionKey, relevantList[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < relevantList.length - 1) {
      swapInGlobalOrder(sectionKey, relevantList[currentIndex + 1]);
    }
  };

  const swapInGlobalOrder = (key1, key2) => {
    setSectionOrder(prev => {
      const newOrder = [...prev];
      const idx1 = newOrder.indexOf(key1);
      const idx2 = newOrder.indexOf(key2);
      newOrder[idx1] = key2;
      newOrder[idx2] = key1;
      return newOrder;
    });
  };

  const isFirstInColumn = (sectionKey) => {
    const col = template === 'twocolumn' ? sectionColumns[sectionKey] : 'all';
    const list = col === 'all' ? sectionOrder : sectionOrder.filter(s => sectionColumns[s] === col);
    return list.indexOf(sectionKey) === 0;
  };

  const isLastInColumn = (sectionKey) => {
    const col = template === 'twocolumn' ? sectionColumns[sectionKey] : 'all';
    const list = col === 'all' ? sectionOrder : sectionOrder.filter(s => sectionColumns[s] === col);
    return list.indexOf(sectionKey) === list.length - 1;
  };

  const getSectionNamePl = (key) => {
    const names = { personal: 'Podsumowanie i Kontakt', experience: 'Doświadczenie zawodowe', education: 'Edukacja', courses: 'Szkolenia i Kursy', skills: 'Umiejętności', languages: 'Języki' };
    return names[key] || key;
  };

  // --- Style i klasyfikacja UI ---
  const getColumnPaddingStyle = () => {
    if (margins === 'custom') return { padding: `${customMargin.vertical}mm ${customMargin.horizontal}mm` };
    switch (margins) {
      case 'small': return { padding: '10mm' };
      case 'large': return { padding: '20mm' };
      case 'normal': default: return { padding: '15mm' };
    }
  };

  const getContainerPaddingStyle = () => {
    if (margins === 'custom') return { padding: `${customMargin.vertical}mm ${customMargin.horizontal}mm` };
    switch (margins) {
      case 'small': return { padding: '12mm' };
      case 'large': return { padding: '25mm' };
      case 'normal': default: return { padding: '20mm' };
    }
  };

  const Input = ({ label, type = "text", ...props }) => (
    <div className="flex flex-col mb-3">
      <label className="mb-1 text-sm font-medium text-slate-700">{label}</label>
      <input type={type} className="border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors" {...props} />
    </div>
  );

  const Textarea = ({ label, ...props }) => (
    <div className="flex flex-col mb-3">
      <label className="mb-1 text-sm font-medium text-slate-700">{label}</label>
      <textarea className="border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors resize-y min-h-[80px]" {...props} />
    </div>
  );

  const Panel = ({ id, title, children }) => {
    const isOpen = openPanels[id];
    return (
      <div className="border-b border-slate-200">
        <button onClick={() => togglePanel(id)} className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left focus:outline-none">
          <span className="font-semibold text-slate-900">{title}</span>
          {isOpen ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
        </button>
        {isOpen && <div className="p-4 bg-white">{children}</div>}
      </div>
    );
  };

  // --- Renderowanie poszczególnych sekcji (Podgląd) ---
  const renderSection = (sectionKey, columnType = 'full') => {
    // UKRYWANIE PUSTYCH SEKCJI
    if (sectionKey === 'personal' && !data.personal.summary && template !== 'twocolumn') return null; 
    if (sectionKey === 'experience' && data.experience.length === 0) return null;
    if (sectionKey === 'education' && data.education.length === 0) return null;
    if (sectionKey === 'courses' && data.courses.length === 0) return null;
    if (sectionKey === 'skills' && !data.skills.trim()) return null;
    if (sectionKey === 'languages' && (!data.languages || data.languages.length === 0)) return null;

    const t = cvTranslations[cvLanguage] || cvTranslations['pl'];

    const headingClass = template === 'minimalist'
      ? "text-sm font-bold uppercase tracking-widest mb-4 border-b border-slate-200 pb-2"
      : "text-lg font-bold border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider text-sm";

    const itemContainerClass = `print-avoid-break ${template === 'minimalist' ? "flex flex-col pl-4 border-l-2 border-slate-200 mb-6" : "flex flex-col mb-4"}`;
    const headerLayoutClass = columnType === 'side' ? "flex flex-col mb-1" : "flex flex-wrap justify-between items-baseline gap-x-2 mb-1";
    const dateTextClass = columnType === 'side' ? "text-xs text-slate-500 mt-0.5" : "text-sm text-slate-600 shrink-0";

    switch (sectionKey) {
      case 'personal':
        if (!data.personal.summary) return null;
        return (
          <div key="personal" className="mb-6 print-avoid-break">
            {template === 'twocolumn' && <h2 className={headingClass} style={{ color: themeColor }}>{t.summary}</h2>}
            <p className={`text-sm text-slate-700 leading-relaxed ${template !== 'twocolumn' ? 'mt-2' : ''}`}>
              {data.personal.summary}
            </p>
          </div>
        );
      case 'experience':
        return (
          <div key="experience" className="mb-6">
            <h2 className={headingClass} style={{ color: themeColor }}>{t.experience}</h2>
            <div className="flex flex-col gap-2">
              {data.experience.map(exp => (
                <div key={exp.id} className={itemContainerClass}>
                  <div className={headerLayoutClass}>
                    <h3 className="font-bold text-slate-900 leading-tight">{exp.role}</h3>
                    <span className={dateTextClass}>{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-700 mb-2">{exp.company}</div>
                  {exp.description && <p className="text-sm text-slate-700 mb-2 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                  {exp.skills && (
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-semibold">{t.tech} </span> {exp.skills}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'education':
        return (
          <div key="education" className="mb-6">
            <h2 className={headingClass} style={{ color: themeColor }}>{t.education}</h2>
            <div className="flex flex-col gap-2">
              {data.education.map(edu => (
                <div key={edu.id} className={itemContainerClass}>
                  <div className={headerLayoutClass}>
                    <h3 className="font-bold text-slate-900 leading-tight">{edu.degree}</h3>
                    <span className={dateTextClass}>{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="text-sm text-slate-700 leading-tight">{edu.school}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return (
          <div key="courses" className="mb-6">
            <h2 className={headingClass} style={{ color: themeColor }}>{t.courses}</h2>
            <div className="flex flex-col gap-2">
              {data.courses.map(course => (
                <div key={course.id} className={itemContainerClass}>
                  <div className={headerLayoutClass}>
                    <h3 className="font-bold text-slate-900 leading-tight">{course.name}</h3>
                    <span className={dateTextClass}>{course.startDate} {course.endDate ? `– ${course.endDate}` : ''}</span>
                  </div>
                  <div className="text-sm text-slate-700 leading-tight">{course.organizer}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        const skillsArray = data.skills.split(',').map(s => s.trim()).filter(s => s !== '');
        return (
          <div key="skills" className="mb-6 print-avoid-break">
            <h2 className={headingClass} style={{ color: themeColor }}>{t.skills}</h2>
            <ul className="list-disc pl-5 text-sm text-slate-700 marker:text-slate-400 grid grid-cols-1 gap-1">
              {skillsArray.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        );
      case 'languages':
        return (
          <div key="languages" className="mb-6 print-avoid-break">
            <h2 className={headingClass} style={{ color: themeColor }}>{t.languages}</h2>
            <div className="flex flex-col gap-1">
              {data.languages.map(lang => (
                <div key={lang.id} className="flex justify-between items-baseline">
                  <span className="font-semibold text-sm text-slate-900">{lang.name}</span>
                  <span className="text-sm text-slate-600 ml-3 text-right">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-slate-900 selection:bg-slate-200 font-sans">
      
      <style>{`
        @media print {
          body { background: white !important; }
          #app-header, #app-sidebar { display: none !important; }
          #cv-preview-container {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: none !important;
          }
          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          @page { margin: 5mm; }
        }
      `}</style>

      {/* Header */}
      <header id="app-header" className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-10 font-sans">
        <h1 className="text-lg font-semibold text-slate-900">Kreator CV</h1>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 hover:opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{ backgroundColor: themeColor }}
        >
          <Download size={16} />
          Pobierz PDF
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Lewa kolumna: Edytor */}
        <aside id="app-sidebar" className="w-[420px] bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-0">

          <Panel id="dataSync" title="Zarządzaj Danymi">
             <p className="text-xs text-slate-500 mb-4">
               Dane zapisują się automatycznie w przeglądarce. Możesz je pobrać by zachować kopię na dysku.
             </p>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={exportJSON} className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                 <FileJson size={16} /> Pobierz
               </button>
               <input type="file" accept=".json" ref={fileInputRef} onChange={importJSON} className="hidden" />
               <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                 <Upload size={16} /> Wgraj
               </button>
             </div>
          </Panel>

          <Panel id="appearance" title="Wygląd CV">
            <div className="flex flex-col gap-5">
              
              {/* Sekcja wyboru języka CV */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Język dokumentu (CV)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setCvLanguage('pl')} className={`px-3 py-2 text-sm border rounded-md transition-colors ${cvLanguage === 'pl' ? 'border-slate-800 bg-slate-50 text-slate-900 font-medium' : 'border-slate-300 hover:bg-slate-50'}`}>Polski</button>
                  <button onClick={() => setCvLanguage('en')} className={`px-3 py-2 text-sm border rounded-md transition-colors ${cvLanguage === 'en' ? 'border-slate-800 bg-slate-50 text-slate-900 font-medium' : 'border-slate-300 hover:bg-slate-50'}`}>Angielski</button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Szablon</label>
                <div className="grid grid-cols-1 gap-2">
                  {['classic', 'twocolumn', 'minimalist'].map(t => {
                    const labels = { classic: 'Klasyczny (1 kolumna)', twocolumn: 'Nowoczesny (2 kolumny)', minimalist: 'Minimalistyczny (Linie)' };
                    return (
                      <button
                        key={t}
                        onClick={() => setTemplate(t)}
                        className={`px-3 py-2 text-sm border rounded-md text-left transition-colors ${template === t ? 'border-slate-800 bg-slate-50 text-slate-900 font-medium' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                      >
                        {labels[t]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Rodzaj Czcionki</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setFontFamily('sans')} className={`px-3 py-2 text-sm border rounded-md font-sans transition-colors ${fontFamily === 'sans' ? 'border-slate-800 bg-slate-50 text-slate-900' : 'border-slate-300 hover:bg-slate-50'}`}>Bezszeryfowa</button>
                  <button onClick={() => setFontFamily('serif')} className={`px-3 py-2 text-sm border rounded-md font-serif transition-colors ${fontFamily === 'serif' ? 'border-slate-800 bg-slate-50 text-slate-900' : 'border-slate-300 hover:bg-slate-50'}`}>Szeryfowa</button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Kolor Akcentujący</label>
                <div className="flex gap-2 items-center">
                  {presetColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setThemeColor(color.value)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${themeColor === color.value ? 'scale-110 border-slate-800' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                  
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  
                  {/* Customowy wybór koloru (Color Picker) */}
                  <label 
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 cursor-pointer transition-transform overflow-hidden ${!presetColors.some(c => c.value === themeColor) ? 'scale-110 border-slate-800' : 'border-dashed border-slate-400 hover:scale-105 hover:border-slate-600'}`}
                    style={{ backgroundColor: !presetColors.some(c => c.value === themeColor) ? themeColor : 'transparent' }}
                    title="Wybierz własny kolor z palety"
                  >
                    <input 
                      type="color" 
                      value={themeColor} 
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    {presetColors.some(c => c.value === themeColor) && (
                      <Plus size={16} className="text-slate-500" />
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Marginesy dokumentu</label>
                <div className="grid grid-cols-2 gap-2">
                  {['small', 'normal', 'large', 'custom'].map(m => {
                    const mLabels = { small: 'Małe', normal: 'Normalne', large: 'Duże', custom: 'Własne' };
                    return (
                      <button key={m} onClick={() => setMargins(m)} className={`px-2 py-1.5 text-xs text-center border rounded-md transition-colors ${margins === m ? 'border-slate-800 bg-slate-50 text-slate-900 font-medium' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
                        {mLabels[m]}
                      </button>
                    )
                  })}
                </div>
                {margins === 'custom' && (
                  <div className="mt-3 flex flex-col gap-3 border border-slate-200 rounded-md p-3 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Góra / Dół (mm):</label>
                      <input type="number" min="0" max="50" value={customMargin.vertical} onChange={(e) => setCustomMargin(prev => ({ ...prev, vertical: Number(e.target.value) }))} className="border border-slate-300 rounded-md px-2 py-1 w-20 text-sm text-right focus:outline-none focus:border-slate-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Lewy / Prawy (mm):</label>
                      <input type="number" min="0" max="50" value={customMargin.horizontal} onChange={(e) => setCustomMargin(prev => ({ ...prev, horizontal: Number(e.target.value) }))} className="border border-slate-300 rounded-md px-2 py-1 w-20 text-sm text-right focus:outline-none focus:border-slate-500" />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </Panel>

          <Panel id="layout" title="Układ sekcji">
            <p className="text-xs text-slate-500 mb-3">Ustaw kolejność i położenie sekcji na swoim CV.</p>
            <div className="flex flex-col gap-2">
              {sectionOrder.map((section) => (
                <div key={section} className="flex items-center justify-between border border-slate-200 rounded-md p-2 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-slate-400" />
                    <span className="text-sm font-medium">{getSectionNamePl(section)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {template === 'twocolumn' && (
                      <button onClick={() => toggleColumn(section)} className="text-xs px-2 py-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 transition-colors whitespace-nowrap">
                        {sectionColumns[section] === 'side' ? 'Lewa kol.' : 'Prawa kol.'}
                      </button>
                    )}
                    <div className="flex gap-1 border-l border-slate-200 pl-2">
                      <button onClick={() => moveSection(section, 'up')} disabled={isFirstInColumn(section)} className="p-1 text-slate-500 hover:text-slate-900 rounded disabled:opacity-30"><ArrowUp size={16} /></button>
                      <button onClick={() => moveSection(section, 'down')} disabled={isLastInColumn(section)} className="p-1 text-slate-500 hover:text-slate-900 rounded disabled:opacity-30"><ArrowDown size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel id="personal" title="Dane Osobowe">
            <Input label="Imię i nazwisko" name="fullName" value={data.personal.fullName} onChange={handlePersonalChange} />
            <Input label="Tytuł zawodowy" name="title" value={data.personal.title} onChange={handlePersonalChange} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" name="email" type="email" value={data.personal.email} onChange={handlePersonalChange} />
              <Input label="Telefon" name="phone" value={data.personal.phone} onChange={handlePersonalChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Lokalizacja" name="location" value={data.personal.location} onChange={handlePersonalChange} />
              <Input label="LinkedIn" name="linkedin" value={data.personal.linkedin || ''} placeholder="linkedin.com/in/..." onChange={handlePersonalChange} />
            </div>
            <Textarea label="Podsumowanie zawodowe" name="summary" value={data.personal.summary} onChange={handlePersonalChange} />
          </Panel>

          <Panel id="experience" title="Doświadczenie zawodowe">
            <div className="flex flex-col gap-6">
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="relative border border-slate-200 rounded-md p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-sm">Stanowisko #{index + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveItemInArray('experience', index, 'up')} disabled={index === 0} className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"><ArrowUp size={16} /></button>
                      <button onClick={() => moveItemInArray('experience', index, 'down')} disabled={index === data.experience.length - 1} className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"><ArrowDown size={16} /></button>
                      <div className="w-px bg-slate-300 mx-1"></div>
                      <button onClick={() => removeExperience(exp.id)} className="text-red-600 hover:text-red-800 p-1" title="Usuń wpis"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <Input label="Stanowisko" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                  <Input label="Firma" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Od" value={exp.startDate} placeholder="MM/RRRR" onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} />
                    <Input label="Do" value={exp.endDate} placeholder="MM/RRRR lub Obecnie" onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} />
                  </div>
                  <Textarea label="Opis obowiązków" value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} />
                  <Input label="Kluczowe umiejętności" value={exp.skills} placeholder="Np. React, TypeScript, Agile" onChange={(e) => updateExperience(exp.id, 'skills', e.target.value)} />
                </div>
              ))}
              <button onClick={addExperience} className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 border-dashed rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
                <Plus size={16} /> Dodaj doświadczenie
              </button>
            </div>
          </Panel>

          <Panel id="education" title="Edukacja">
             <div className="flex flex-col gap-6">
              {data.education.map((edu, index) => (
                <div key={edu.id} className="relative border border-slate-200 rounded-md p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-sm">Szkoła #{index + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveItemInArray('education', index, 'up')} disabled={index === 0} className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"><ArrowUp size={16} /></button>
                      <button onClick={() => moveItemInArray('education', index, 'down')} disabled={index === data.education.length - 1} className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"><ArrowDown size={16} /></button>
                      <div className="w-px bg-slate-300 mx-1"></div>
                      <button onClick={() => removeEducation(edu.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <Input label="Kierunek / Tytuł" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                  <Input label="Uczelnia / Szkoła" value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Od" value={edu.startDate} placeholder="MM/RRRR" onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} />
                    <Input label="Do" value={edu.endDate} placeholder="MM/RRRR" onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addEducation} className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 border-dashed rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
                <Plus size={16} /> Dodaj edukację
              </button>
            </div>
          </Panel>

          <Panel id="courses" title="Szkolenia i Kursy">
             <div className="flex flex-col gap-6">
              {data.courses.map((course, index) => (
                <div key={course.id} className="relative border border-slate-200 rounded-md p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-sm">Kurs #{index + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveItemInArray('courses', index, 'up')} disabled={index === 0} className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"><ArrowUp size={16} /></button>
                      <button onClick={() => moveItemInArray('courses', index, 'down')} disabled={index === data.courses.length - 1} className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"><ArrowDown size={16} /></button>
                      <div className="w-px bg-slate-300 mx-1"></div>
                      <button onClick={() => removeCourse(course.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <Input label="Nazwa szkolenia / kursu" value={course.name} onChange={(e) => updateCourse(course.id, 'name', e.target.value)} />
                  <Input label="Organizator" value={course.organizer} onChange={(e) => updateCourse(course.id, 'organizer', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Od" value={course.startDate} placeholder="MM/RRRR" onChange={(e) => updateCourse(course.id, 'startDate', e.target.value)} />
                    <Input label="Do" value={course.endDate} placeholder="MM/RRRR" onChange={(e) => updateCourse(course.id, 'endDate', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addCourse} className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 border-dashed rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
                <Plus size={16} /> Dodaj kurs
              </button>
            </div>
          </Panel>

          <Panel id="languages" title="Języki obce">
             <div className="flex flex-col gap-6">
              {data.languages.map((lang, index) => (
                <div key={lang.id} className="relative border border-slate-200 rounded-md p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-sm">Język #{index + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveItemInArray('languages', index, 'up')} disabled={index === 0} className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"><ArrowUp size={16} /></button>
                      <button onClick={() => moveItemInArray('languages', index, 'down')} disabled={index === data.languages.length - 1} className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"><ArrowDown size={16} /></button>
                      <div className="w-px bg-slate-300 mx-1"></div>
                      <button onClick={() => removeLanguage(lang.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Język" value={lang.name} placeholder="Np. Angielski" onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)} />
                    <Input label="Poziom" value={lang.level} placeholder="Np. C1" onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addLanguage} className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 border-dashed rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
                <Plus size={16} /> Dodaj język
              </button>
            </div>
          </Panel>

          <Panel id="skills" title="Umiejętności">
            <Textarea 
              label="Wymień swoje umiejętności (oddziel przecinkami)" 
              value={data.skills} 
              onChange={handleSkillsChange} 
            />
            <p className="text-xs text-slate-500 mt-1">
              Podczas generowania podglądu, przecinki automatycznie zamienią się w czystą listę wypunktowaną.
            </p>
          </Panel>

        </aside>

        {/* Prawa kolumna: Podgląd */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-100">
          
          <div 
            id="cv-preview-container"
            className={`bg-white w-full max-w-[210mm] min-h-[297mm] shadow-[0_2px_8px_rgba(0,0,0,0.1)] box-border flex flex-col ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
          >
            {template === 'twocolumn' ? (
              <div className="flex flex-1">
                {/* Lewa węższa kolumna */}
                <div className="w-[35%] bg-slate-50 border-r border-slate-200 box-border" style={getColumnPaddingStyle()}>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 leading-tight break-words">
                    {data.personal.fullName || 'Imię Nazwisko'}
                  </h1>
                  <div className="text-sm font-medium mb-6 leading-tight break-words" style={{ color: themeColor }}>
                    {data.personal.title}
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-slate-600 mb-8">
                    {data.personal.email && <span className="break-all">{data.personal.email}</span>}
                    {data.personal.phone && <span>{data.personal.phone}</span>}
                    {data.personal.location && <span>{data.personal.location}</span>}
                    {data.personal.linkedin && (
                      <a href={data.personal.linkedin.startsWith('http') ? data.personal.linkedin : `https://${data.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors break-all">
                        {data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    )}
                  </div>

                  {sectionOrder
                    .filter(s => sectionColumns[s] === 'side')
                    .map(section => renderSection(section, 'side'))}
                </div>
                
                {/* Prawa szersza kolumna */}
                <div className="w-[65%] box-border" style={getColumnPaddingStyle()}>
                  {sectionOrder
                    .filter(s => sectionColumns[s] === 'main')
                    .map(section => renderSection(section, 'main'))}
                </div>
              </div>
            ) : (
              <div className="box-border" style={getContainerPaddingStyle()}>
                {/* Nagłówek 1-kolumnowych */}
                <header className={`mb-6 print-avoid-break ${template === 'minimalist' ? 'text-center border-b border-slate-200 pb-8 mb-8' : ''}`}>
                  <h1 className={`text-3xl font-bold text-slate-900 tracking-tight mb-1 ${template === 'minimalist' ? 'uppercase tracking-widest' : ''}`}>
                    {data.personal.fullName || 'Imię Nazwisko'}
                  </h1>
                  <div className="text-lg font-medium mb-3" style={{ color: themeColor }}>
                    {data.personal.title}
                  </div>
                  <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 ${template === 'minimalist' ? 'justify-center' : ''}`}>
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>{data.personal.phone}</span>}
                    {data.personal.location && <span>{data.personal.location}</span>}
                    {data.personal.linkedin && (
                      <a href={data.personal.linkedin.startsWith('http') ? data.personal.linkedin : `https://${data.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                        {data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    )}
                  </div>
                </header>

                <div className="flex flex-col gap-2">
                  {sectionOrder.map(section => renderSection(section, 'full'))}
                </div>
              </div>
            )}
          </div>

        </main>

      </div>
    </div>
  );
}