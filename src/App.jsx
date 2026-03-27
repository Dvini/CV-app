import React from 'react';
import { CVProvider, useCV } from './context/CVContext';
import { Header } from './components/Layout/Header';
import { EditorSidebar } from './components/Editor/EditorSidebar';
import { CVPreview } from './components/Preview/CVPreview';
import './styles/index.css';

function AppContent() {
  const { darkMode } = useCV();

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
    </>
  );
}

export default function App() {
  return (
    <CVProvider>
      <AppContent />
    </CVProvider>
  );
}
