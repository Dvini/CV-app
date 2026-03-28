import React, { useState } from 'react';
import { Download, Moon, Sun, FileText, Edit3, Loader } from 'lucide-react';
import { useCVData, useCVAppearance } from '../../context/CVContext';
import './Header.css';

export function Header() {
  const { data } = useCVData();
  const { themeColor, darkMode, setDarkMode } = useCVAppearance();
  const [mobileView, setMobileView] = useState('editor');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { exportToPDF } = await import('../../utils/pdfExport');
      const name = data.personal.fullName
        ? `CV_${data.personal.fullName.replace(/\s+/g, '_')}`
        : 'CV';
      await exportToPDF(name);
    } catch {
      alert('Nie udało się wygenerować PDF. Spróbuj ponownie.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <header className="app-header" id="app-header">
        <div className="header-left">
          <div className="header-logo">
            <FileText size={20} />
            <h1 className="header-title">Kreator CV</h1>
          </div>
        </div>

        <div className="header-right">
          <button
            className="header-icon-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Jasny motyw' : 'Ciemny motyw'}
            aria-label={darkMode ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="header-cta"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? <Loader size={16} className="spin" /> : <Download size={16} />}
            <span>{exporting ? 'Generowanie...' : 'Pobierz PDF'}</span>
          </button>
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="mobile-nav">
        <button
          className={`mobile-nav-btn ${mobileView === 'editor' ? 'mobile-nav-btn--active' : ''}`}
          onClick={() => {
            setMobileView('editor');
            document.getElementById('app-sidebar')?.classList.remove('hidden-mobile');
            document.querySelector('.preview-area')?.classList.add('hidden-mobile');
          }}
        >
          <Edit3 size={16} />
          Edytor
        </button>
        <button
          className={`mobile-nav-btn ${mobileView === 'preview' ? 'mobile-nav-btn--active' : ''}`}
          onClick={() => {
            setMobileView('preview');
            document.getElementById('app-sidebar')?.classList.add('hidden-mobile');
            document.querySelector('.preview-area')?.classList.remove('hidden-mobile');
          }}
        >
          <FileText size={16} />
          Podgląd
        </button>
      </nav>
    </>
  );
}
