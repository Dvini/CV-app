import { Download, Moon, Sun, FileText, Edit3 } from 'lucide-react';
import { useCVData, useCVAppearance } from '../../context/hooks';
import { exportToPDF, getPDFFileName } from '../../utils/pdfExport';
import type { MobileView } from '../../types/cv';
import './Header.css';

interface HeaderProps {
  /** Which half of the app is shown on narrow screens */
  mobileView: MobileView;
  onMobileViewChange: (view: MobileView) => void;
}

export function Header({ mobileView, onMobileViewChange }: HeaderProps) {
  const { data } = useCVData();
  const { darkMode, setDarkMode } = useCVAppearance();

  const handleExport = () => exportToPDF(getPDFFileName(data.personal.fullName));

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
          >
            <Download size={16} />
            <span>Pobierz PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="mobile-nav" aria-label="Widok">
        <button
          className={`mobile-nav-btn ${mobileView === 'editor' ? 'mobile-nav-btn--active' : ''}`}
          aria-pressed={mobileView === 'editor'}
          onClick={() => onMobileViewChange('editor')}
        >
          <Edit3 size={16} />
          Edytor
        </button>
        <button
          className={`mobile-nav-btn ${mobileView === 'preview' ? 'mobile-nav-btn--active' : ''}`}
          aria-pressed={mobileView === 'preview'}
          onClick={() => onMobileViewChange('preview')}
        >
          <FileText size={16} />
          Podgląd
        </button>
      </nav>
    </>
  );
}

