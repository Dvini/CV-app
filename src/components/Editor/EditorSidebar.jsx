import React, { lazy, Suspense, useState, useCallback, useRef } from 'react';
import { DataSyncPanel } from './panels/DataSyncPanel';
import './EditorSidebar.css';

const AppearancePanel = lazy(() => import('./panels/AppearancePanel').then(m => ({ default: m.AppearancePanel })));
const LayoutPanel = lazy(() => import('./panels/LayoutPanel').then(m => ({ default: m.LayoutPanel })));
const PersonalPanel = lazy(() => import('./panels/PersonalPanel').then(m => ({ default: m.PersonalPanel })));
const ExperiencePanel = lazy(() => import('./panels/ExperiencePanel').then(m => ({ default: m.ExperiencePanel })));
const EducationPanel = lazy(() => import('./panels/EducationPanel').then(m => ({ default: m.EducationPanel })));
const CoursesPanel = lazy(() => import('./panels/CoursesPanel').then(m => ({ default: m.CoursesPanel })));
const SkillsPanel = lazy(() => import('./panels/SkillsPanel').then(m => ({ default: m.SkillsPanel })));
const LanguagesPanel = lazy(() => import('./panels/LanguagesPanel').then(m => ({ default: m.LanguagesPanel })));
const InterestsPanel = lazy(() => import('./panels/InterestsPanel').then(m => ({ default: m.InterestsPanel })));
const ProjectsPanel = lazy(() => import('./panels/ProjectsPanel').then(m => ({ default: m.ProjectsPanel })));
const CertificatesPanel = lazy(() => import('./panels/CertificatesPanel').then(m => ({ default: m.CertificatesPanel })));
const ReferencesPanel = lazy(() => import('./panels/ReferencesPanel').then(m => ({ default: m.ReferencesPanel })));
const PublicationsPanel = lazy(() => import('./panels/PublicationsPanel').then(m => ({ default: m.PublicationsPanel })));
const VolunteerPanel = lazy(() => import('./panels/VolunteerPanel').then(m => ({ default: m.VolunteerPanel })));
const CustomPanel = lazy(() => import('./panels/CustomPanel').then(m => ({ default: m.CustomPanel })));

const MIN_WIDTH = 320;
const MAX_WIDTH = 700;

export function EditorSidebar() {
  const [openPanel, setOpenPanel] = useState('personal');
  const [width, setWidth] = useState(480);
  const sidebarRef = useRef(null);

  const toggle = (id) => setOpenPanel((prev) => (prev === id ? null : id));

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (e) => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + (e.clientX - startX)));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [width]);

  return (
    <aside className="editor-sidebar" id="app-sidebar" ref={sidebarRef} style={{ width: `${width}px`, minWidth: `${width}px` }}>
      <div className="editor-sidebar-scroll">
        <DataSyncPanel />
        <Suspense fallback={null}>
          <AppearancePanel isOpen={openPanel === 'appearance'} onToggle={() => toggle('appearance')} />
          <LayoutPanel isOpen={openPanel === 'layout'} onToggle={() => toggle('layout')} />
          <PersonalPanel isOpen={openPanel === 'personal'} onToggle={() => toggle('personal')} />
          <ExperiencePanel isOpen={openPanel === 'experience'} onToggle={() => toggle('experience')} />
          <EducationPanel isOpen={openPanel === 'education'} onToggle={() => toggle('education')} />
          <CoursesPanel isOpen={openPanel === 'courses'} onToggle={() => toggle('courses')} />
          <ProjectsPanel isOpen={openPanel === 'projects'} onToggle={() => toggle('projects')} />
          <LanguagesPanel isOpen={openPanel === 'languages'} onToggle={() => toggle('languages')} />
          <SkillsPanel isOpen={openPanel === 'skills'} onToggle={() => toggle('skills')} />
          <InterestsPanel isOpen={openPanel === 'interests'} onToggle={() => toggle('interests')} />
          <CertificatesPanel isOpen={openPanel === 'certificates'} onToggle={() => toggle('certificates')} />
          <ReferencesPanel isOpen={openPanel === 'references'} onToggle={() => toggle('references')} />
          <PublicationsPanel isOpen={openPanel === 'publications'} onToggle={() => toggle('publications')} />
          <VolunteerPanel isOpen={openPanel === 'volunteer'} onToggle={() => toggle('volunteer')} />
          <CustomPanel isOpen={openPanel === 'custom'} onToggle={() => toggle('custom')} />
        </Suspense>
      </div>
      <div
        className="sidebar-resize-handle"
        onMouseDown={handleResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
      />
    </aside>
  );
}
