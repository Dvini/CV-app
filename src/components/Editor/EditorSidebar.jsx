import React, { lazy, Suspense, useState } from 'react';
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

export function EditorSidebar() {
  const [openPanel, setOpenPanel] = useState('personal');

  const toggle = (id) => setOpenPanel((prev) => (prev === id ? null : id));

  return (
    <aside className="editor-sidebar" id="app-sidebar">
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
        </Suspense>
      </div>
    </aside>
  );
}
