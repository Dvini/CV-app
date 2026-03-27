import React from 'react';
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
  return (
    <aside className="editor-sidebar" id="app-sidebar">
      <div className="editor-sidebar-scroll">
        <DataSyncPanel />
        <AppearancePanel />
        <LayoutPanel />
        <PersonalPanel />
        <ExperiencePanel />
        <EducationPanel />
        <CoursesPanel />
        <ProjectsPanel />
        <LanguagesPanel />
        <SkillsPanel />
      </div>
    </aside>
  );
}
