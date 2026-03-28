import React from 'react';
import { CVProvider, useCV } from './context/CVContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Layout/Header';
import { EditorSidebar } from './components/Editor/EditorSidebar';
import { CVPreview } from './components/Preview/CVPreview';
import './styles/index.css';

function AppContent() {
  const { darkMode, storageWarning, dismissWarning } = useCV();

  React.useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    );
  }, [darkMode]);

  return (
    <>
      <Header />
      <div className="app-layout">
        <EditorSidebar />
        <CVPreview />
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
