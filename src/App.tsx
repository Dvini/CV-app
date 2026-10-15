import React from 'react';
import { CVProvider } from './context/CVContext';
import { useCVData, useCVAppearance, useCVManager } from './context/hooks';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Layout/Header';
import { EditorSidebar } from './components/Editor/EditorSidebar';
import { CVPreview } from './components/Preview/CVPreview';
import type { MobileView } from './types/cv';
import './styles/index.css';

function AppContent() {
  const { undo, redo } = useCVData();
  const { darkMode } = useCVAppearance();
  const { storageWarning, dismissWarning } = useCVManager();
  const [mobileView, setMobileView] = React.useState<MobileView>('editor');

  React.useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    );
  }, [darkMode]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // With Shift (or Caps Lock) held, e.key is uppercase
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <>
      <Header mobileView={mobileView} onMobileViewChange={setMobileView} />
      <div className="app-layout">
        {/* On narrow screens only the selected half is shown; .hidden-mobile is a no-op on desktop */}
        <EditorSidebar className={mobileView === 'preview' ? 'hidden-mobile' : undefined} />
        <CVPreview className={mobileView === 'editor' ? 'hidden-mobile' : undefined} />
      </div>
      {storageWarning && (
        <div className="storage-warning-toast" role="alert">
          <span>{storageWarning}</span>
          <button onClick={dismissWarning} className="toast-dismiss">&times;</button>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CVProvider>
        <AppContent />
      </CVProvider>
    </ErrorBoundary>
  );
}
