/**
 * CVContext — orchestrator that composes all three sub-contexts.
 *
 * Re-exports all hooks for backwards compatibility:
 *   useCVData, useCVAppearance, useCVManager, useCV
 */
import React, { useCallback, useRef } from 'react';
import { CVDataProvider, CVDataContext, useCVData } from './CVDataContext';
import { CVAppearanceProvider, CVAppearanceContext, useCVAppearance } from './CVAppearanceContext';
import { CVProfileProvider, CVManagerContext, useCVManager } from './CVProfileContext';
import type { CVData, TemplateName } from '../types/cv';

export { CVDataContext, useCVData };
export { CVAppearanceContext, useCVAppearance };
export { CVManagerContext, useCVManager };

export function useCV() {
  return { ...useCVData(), ...useCVAppearance(), ...useCVManager() };
}

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

  const getSnapshot = useCallback(
    () => ({
      data: dataCtx.data,
      sectionOrder: dataCtx.sectionOrder,
      sectionColumns: dataCtx.sectionColumns as Record<string, string>,
      template: appearanceCtx.template,
      margins: appearanceCtx.margins,
      customMargin: appearanceCtx.customMargin,
      themeColor: appearanceCtx.themeColor,
      fontFamily: appearanceCtx.fontFamily,
      fontSizeHeading: appearanceCtx.fontSizeHeading,
      fontSizeText: appearanceCtx.fontSizeText,
      cvLanguage: appearanceCtx.cvLanguage,
      showSectionIcons: appearanceCtx.showSectionIcons,
      creativeHeaderBg: appearanceCtx.creativeHeaderBg,
    }),
    [dataCtx, appearanceCtx],
  );

  const loadSnapshot = useCallback(
    (s: ReturnType<typeof getSnapshot>) => {
      if (!s) return;
      if (s.data) dataCtx.setData(s.data as CVData);
      if (s.sectionOrder)
        dataCtx.setSectionOrder(s.sectionOrder as Parameters<typeof dataCtx.setSectionOrder>[0]);
      if (s.sectionColumns)
        dataCtx.setSectionColumns(
          s.sectionColumns as Parameters<typeof dataCtx.setSectionColumns>[0],
        );
      if (s.template) appearanceCtx.setTemplate(s.template as TemplateName);
      if (s.margins) appearanceCtx.setMargins(s.margins);
      if (s.customMargin) appearanceCtx.setCustomMargin(s.customMargin);
      if (s.themeColor) appearanceCtx.setThemeColor(s.themeColor);
      if (s.fontFamily) appearanceCtx.setFontFamily(s.fontFamily);
      if (s.fontSizeHeading != null) appearanceCtx.setFontSizeHeading(s.fontSizeHeading);
      if (s.fontSizeText != null) appearanceCtx.setFontSizeText(s.fontSizeText);
      if (s.cvLanguage) appearanceCtx.setCvLanguage(s.cvLanguage);
      if (s.showSectionIcons != null)
        appearanceCtx.setShowSectionIcons(s.showSectionIcons);
      if (s.creativeHeaderBg) appearanceCtx.setCreativeHeaderBg(s.creativeHeaderBg);
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
