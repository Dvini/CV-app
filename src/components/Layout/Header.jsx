import React, { useState } from 'react';
import { Download, Moon, Sun, FileText, Edit3 } from 'lucide-react';
import { useCV } from '../../context/CVContext';
import './Header.css';

export function Header() {
  const { themeColor, darkMode, setDarkMode } = useCV();
  const [mobileView, setMobileView] = useState('editor');

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
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="header-cta"
            onClick={() => window.print()}
          >
            <Download size={16} />
            <span>Pobierz PDF</span>
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
