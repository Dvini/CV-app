/**
 * CVAppearanceContext — exposes template, colors, fonts, and margin settings.
 * Settings live in the CV document owned by CVProvider; dark mode is an editor
 * preference stored separately.
 */
import React, { useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CVAppearanceContext } from './hooks';
import {
  MARGIN_PRESETS,
  COLUMN_INNER_GAP_LEFT,
  COLUMN_INNER_GAP_RIGHT,
} from '../constants/layout';
import type { UpdateDocument } from '../state/cvDocument';
import type {
  AppearanceSettings,
  MarginVariant,
  CVAppearanceContextType,
} from '../types/cv';

interface CVAppearanceProviderProps {
  children: React.ReactNode;
  appearance: AppearanceSettings;
  updateDocument: UpdateDocument;
}

export function CVAppearanceProvider({ children, appearance, updateDocument }: CVAppearanceProviderProps) {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('cv_darkMode', false);
  const { margins, customMargin, template, twoColGapLeft, twoColGapRight } = appearance;

  const setters = useMemo(() => {
    // Grouped per setting, so dragging a slider or a color picker undoes in one step
    const set =
      <K extends keyof AppearanceSettings>(key: K) =>
      (value: AppearanceSettings[K]) =>
        updateDocument(
          (doc) =>
            doc.appearance[key] === value ? doc : { ...doc, appearance: { ...doc.appearance, [key]: value } },
          `appearance.${key}`,
        );
    return {
      setTemplate: set('template'),
      setMargins: set('margins'),
      setCustomMargin: set('customMargin'),
      setThemeColor: set('themeColor'),
      setFontFamily: set('fontFamily'),
      setFontSizeHeading: set('fontSizeHeading'),
      setFontSizeText: set('fontSizeText'),
      setCvLanguage: set('cvLanguage'),
      setShowSectionIcons: set('showSectionIcons'),
      setShowContactIcons: set('showContactIcons'),
      setCreativeHeaderBg: set('creativeHeaderBg'),
      setCreativeHeaderImage: set('creativeHeaderImage'),
      setSectionGap: set('sectionGap'),
      setItemGap: set('itemGap'),
      setTwoColLineWidth: set('twoColLineWidth'),
      setTwoColLineColor: set('twoColLineColor'),
      setTwoColSidebarWidth: set('twoColSidebarWidth'),
      setTwoColGapLeft: set('twoColGapLeft'),
      setTwoColGapRight: set('twoColGapRight'),
      setTwoColSectionGap: set('twoColSectionGap'),
      setTwoColItemGap: set('twoColItemGap'),
    };
  }, [updateDocument]);

  const getMarginValues = useCallback((): { v: number; h: number } => {
    if (margins === 'custom')
      return { v: customMargin.vertical ?? 15, h: customMargin.horizontal ?? 15 };
    return MARGIN_PRESETS[margins] || MARGIN_PRESETS.normal;
  }, [margins, customMargin]);

  const getMarginStyle = useCallback(
    (variant: MarginVariant = 'container', omitBottom = false): React.CSSProperties => {
      let v: number, h: number;
      if (margins === 'custom') {
        v = customMargin.vertical;
        h = customMargin.horizontal;
      } else {
        const preset = MARGIN_PRESETS[margins] || MARGIN_PRESETS.normal;
        v = preset.v;
        h = preset.h;
      }

      if (variant === 'left-column') {
        const gapL = template === 'twocolumn' ? twoColGapLeft : COLUMN_INNER_GAP_LEFT;
        return {
          paddingTop: `${v}mm`,
          paddingRight: `${gapL}mm`,
          paddingBottom: omitBottom ? '0mm' : `${v}mm`,
          paddingLeft: `${h}mm`,
        };
      }

      if (variant === 'right-column') {
        const gapR = template === 'twocolumn' ? twoColGapRight : COLUMN_INNER_GAP_RIGHT;
        return {
          paddingTop: `${v}mm`,
          paddingRight: `${h}mm`,
          paddingBottom: omitBottom ? '0mm' : `${v}mm`,
          paddingLeft: `${gapR}mm`,
        };
      }

      return {
        paddingTop: `${v}mm`,
        paddingRight: `${h}mm`,
        paddingBottom: omitBottom ? '0mm' : `${v}mm`,
        paddingLeft: `${h}mm`,
      };
    },
    [margins, customMargin, template, twoColGapLeft, twoColGapRight],
  );

  const value = useMemo<CVAppearanceContextType>(
    () => ({
      ...appearance,
      ...setters,
      darkMode,
      setDarkMode,
      getMarginStyle,
      getMarginValues,
    }),
    [appearance, setters, darkMode, setDarkMode, getMarginStyle, getMarginValues],
  );

  return (
    <CVAppearanceContext.Provider value={value}>{children}</CVAppearanceContext.Provider>
  );
}
