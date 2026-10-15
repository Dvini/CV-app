import React, { lazy, Suspense } from 'react';
import { DataSyncPanel } from './panels/DataSyncPanel';
import { useLocalStorage } from '../../hooks/useLocalStorage';
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
const DEFAULT_WIDTH = 480;
const KEYBOARD_STEP = 16;

const clampWidth = (width: number) => Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width)));

const normalizeWidth = (v: unknown) =>
  typeof v === 'number' && Number.isFinite(v) ? clampWidth(v) : undefined;

const normalizeOpenPanels = (v: unknown) =>
  Array.isArray(v) ? v.filter((id): id is string => typeof id === 'string') : undefined;

export function EditorSidebar({ className }: { className?: string }) {
  // Editor layout preferences, remembered across visits
  const [openPanels, setOpenPanels] = useLocalStorage<string[]>('cv_openPanels', ['personal'], normalizeOpenPanels);
  const [width, setWidth] = useLocalStorage<number>('cv_sidebarWidth', DEFAULT_WIDTH, normalizeWidth);

  const isOpen = (id: string) => openPanels.includes(id);
  const toggle = (id: string) =>
    setOpenPanels((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  const panelProps = (id: string) => ({ isOpen: isOpen(id), onToggle: () => toggle(id) });

  // Pointer events cover mouse, pen and touch; capture keeps the drag going outside the handle
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    const startX = e.clientX;
    const startWidth = width;
    handle.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onPointerMove = (ev: PointerEvent) => setWidth(clampWidth(startWidth + (ev.clientX - startX)));
    const onPointerUp = () => {
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
      handle.removeEventListener('pointercancel', onPointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const next = {
      ArrowLeft: width - KEYBOARD_STEP,
      ArrowRight: width + KEYBOARD_STEP,
      Home: MIN_WIDTH,
      End: MAX_WIDTH,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setWidth(clampWidth(next));
  };

  return (
    <aside
      className={`editor-sidebar${className ? ` ${className}` : ''}`}
      id="app-sidebar"
      style={{ '--sidebar-width': `${width}px` } as React.CSSProperties}
    >
      <div className="editor-sidebar-scroll">
        <DataSyncPanel />
        <Suspense fallback={null}>
          <AppearancePanel {...panelProps('appearance')} />
          <LayoutPanel {...panelProps('layout')} />
          <PersonalPanel {...panelProps('personal')} />
          <ExperiencePanel {...panelProps('experience')} />
          <EducationPanel {...panelProps('education')} />
          <CoursesPanel {...panelProps('courses')} />
          <ProjectsPanel {...panelProps('projects')} />
          <LanguagesPanel {...panelProps('languages')} />
          <SkillsPanel {...panelProps('skills')} />
          <InterestsPanel {...panelProps('interests')} />
          <CertificatesPanel {...panelProps('certificates')} />
          <ReferencesPanel {...panelProps('references')} />
          <PublicationsPanel {...panelProps('publications')} />
          <VolunteerPanel {...panelProps('volunteer')} />
          <CustomPanel {...panelProps('custom')} />
        </Suspense>
      </div>
      <div
        className="sidebar-resize-handle"
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="separator"
        aria-orientation="vertical"
        aria-label="Szerokość panelu edytora"
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-valuenow={width}
      />
    </aside>
  );
}

