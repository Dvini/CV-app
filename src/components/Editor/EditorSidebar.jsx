import React, { useState } from 'react';
import { AppearancePanel } from './panels/AppearancePanel';
import { LayoutPanel } from './panels/LayoutPanel';
import { DataSyncPanel } from './panels/DataSyncPanel';
import { PersonalPanel } from './panels/PersonalPanel';
import { ExperiencePanel } from './panels/ExperiencePanel';
import { EducationPanel } from './panels/EducationPanel';
import { CoursesPanel } from './panels/CoursesPanel';
import { SkillsPanel } from './panels/SkillsPanel';
import { LanguagesPanel } from './panels/LanguagesPanel';
import { ProjectsPanel } from './panels/ProjectsPanel';
import './EditorSidebar.css';

export function EditorSidebar() {
  const [openPanel, setOpenPanel] = useState('personal');

  const toggle = (id) => setOpenPanel((prev) => (prev === id ? null : id));

  return (
    <aside className="editor-sidebar" id="app-sidebar">
      <div className="editor-sidebar-scroll">
        <DataSyncPanel />
        <AppearancePanel isOpen={openPanel === 'appearance'} onToggle={() => toggle('appearance')} />
        <LayoutPanel isOpen={openPanel === 'layout'} onToggle={() => toggle('layout')} />
        <PersonalPanel isOpen={openPanel === 'personal'} onToggle={() => toggle('personal')} />
        <ExperiencePanel isOpen={openPanel === 'experience'} onToggle={() => toggle('experience')} />
        <EducationPanel isOpen={openPanel === 'education'} onToggle={() => toggle('education')} />
        <CoursesPanel isOpen={openPanel === 'courses'} onToggle={() => toggle('courses')} />
        <ProjectsPanel isOpen={openPanel === 'projects'} onToggle={() => toggle('projects')} />
        <LanguagesPanel isOpen={openPanel === 'languages'} onToggle={() => toggle('languages')} />
        <SkillsPanel isOpen={openPanel === 'skills'} onToggle={() => toggle('skills')} />
      </div>
    </aside>
  );
}
