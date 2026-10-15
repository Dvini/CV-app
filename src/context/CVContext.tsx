/**
 * CVContext — orchestrator that composes all three sub-contexts.
 *
 * Re-exports all hooks for backwards compatibility:
 *   useCVData, useCVAppearance, useCVManager
 */
import React, { useCallback } from 'react';
import { CVDataProvider, CVDataContext, useCVData } from './CVDataContext';
import { CVAppearanceProvider, CVAppearanceContext, useCVAppearance } from './CVAppearanceContext';
import { CVProfileProvider, CVManagerContext, useCVManager } from './CVProfileContext';
import { APPEARANCE_KEYS } from '../constants/defaults';
import type { AppearanceSettings, ProfileSnapshot, TemplateName } from '../types/cv';

export { CVDataContext, useCVData };
export { CVAppearanceContext, useCVAppearance };
export { CVManagerContext, useCVManager };

/**
 * Orchestrator provider — wires up snapshot callbacks between sub-contexts.
 *
 * The snapshot pattern bridges CVAppearanceProvider and CVDataProvider
 * with CVProfileProvider, allowing profile switching to save and restore
 * the full application state.
 */
function CVOrchestrator({ children }: { children: React.ReactNode }) {
  // Access both sub-contexts from within the tree
  const dataCtx = useCVData();
  const appearanceCtx = useCVAppearance();

  const getSnapshot = useCallback((): ProfileSnapshot => {
    const appearance = {} as Record<keyof AppearanceSettings, unknown>;
    for (const key of APPEARANCE_KEYS) appearance[key] = appearanceCtx[key];
    return {
      ...(appearance as AppearanceSettings),
      data: dataCtx.data,
      sectionOrder: dataCtx.sectionOrder,
      sectionColumns: dataCtx.sectionColumns,
    };
  }, [dataCtx, appearanceCtx]);

  /** Fields missing from the snapshot (e.g. older files) keep their current value. */
  const loadSnapshot = useCallback(
    (s: Partial<ProfileSnapshot>) => {
      if (s.data) dataCtx.replaceData(s.data);
      if (s.sectionOrder) dataCtx.setSectionOrder(s.sectionOrder);
      if (s.sectionColumns) dataCtx.setSectionColumns(s.sectionColumns);
      appearanceCtx.applyAppearance(s);
    },
    [dataCtx, appearanceCtx],
  );

  return (
    <CVProfileProvider getSnapshot={getSnapshot} loadSnapshot={loadSnapshot}>
      {children}
    </CVProfileProvider>
  );
}

export function CVProvider({ children }: { children: React.ReactNode }) {
  // CVAppearanceProvider exposes template so CVDataProvider can read it for
  // section column logic — we thread it via an inner wrapper.
  return (
    <CVAppearanceProvider>
      <CVAppearanceConsumerForData>
        {(template) => (
          <CVDataProvider template={template}>
            <CVOrchestrator>{children}</CVOrchestrator>
          </CVDataProvider>
        )}
      </CVAppearanceConsumerForData>
    </CVAppearanceProvider>
  );
}

/** Helper: reads template from CVAppearanceContext and passes it as prop. */
function CVAppearanceConsumerForData({
  children,
}: {
  children: (template: TemplateName) => React.ReactNode;
}) {
  const { template } = useCVAppearance();
  return <>{children(template)}</>;
}
