/**
 * CVAppearanceContext — manages template, colors, fonts, and margin settings.
 */
import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  MARGIN_PRESETS,
  DEFAULT_CUSTOM_MARGIN,
  DEFAULT_THEME_COLOR,
  COLUMN_INNER_GAP_LEFT,
  COLUMN_INNER_GAP_RIGHT,
} from '../constants/layout';
import type {
  TemplateName,
  MarginPreset,
  CustomMargin,
  FontFamily,
  CVLanguage,
  MarginVariant,
  CVAppearanceContextType,
} from '../types/cv';

export const CVAppearanceContext = createContext<CVAppearanceContextType | null>(null);

export function useCVAppearance(): CVAppearanceContextType {
  const ctx = useContext(CVAppearanceContext);
  if (!ctx) throw new Error('useCVAppearance must be used within CVProvider');
  return ctx;
}

interface CVAppearanceProviderProps {
  children: React.ReactNode;
}

export function CVAppearanceProvider({ children }: CVAppearanceProviderProps) {
  const [template, setTemplate] = useLocalStorage<TemplateName>('cv_template', 'classic');
  const [margins, setMargins] = useLocalStorage<MarginPreset>('cv_margins', 'normal');
  const [customMargin, setCustomMargin] = useLocalStorage<CustomMargin>(
    'cv_customMargin',
    DEFAULT_CUSTOM_MARGIN,
  );
  const [themeColor, setThemeColor] = useLocalStorage<string>('cv_themeColor', DEFAULT_THEME_COLOR);
  const [fontFamily, setFontFamily] = useLocalStorage<FontFamily>('cv_fontFamily', 'sans');
  const [fontSizeHeading, setFontSizeHeading] = useLocalStorage<number>('cv_fontSizeHeading', 1);
  const [fontSizeText, setFontSizeText] = useLocalStorage<number>('cv_fontSizeText', 1);
  const [cvLanguage, setCvLanguage] = useLocalStorage<CVLanguage>('cv_language', 'pl');
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('cv_darkMode', false);
  const [showSectionIcons, setShowSectionIcons] = useLocalStorage<boolean>(
    'cv_showSectionIcons',
    false,
  );
  const [creativeHeaderBg, setCreativeHeaderBg] = useLocalStorage<string>(
    'cv_creativeHeaderBg',
    DEFAULT_THEME_COLOR,
  );

  const getMarginValues = useCallback((): { v: number; h: number } => {
    if (margins === 'custom')
      return { v: customMargin.vertical || 15, h: customMargin.horizontal || 15 };
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
        return {
          paddingTop: `${v}mm`,
          paddingRight: `${COLUMN_INNER_GAP_LEFT}mm`,
          paddingBottom: omitBottom ? '0mm' : `${v}mm`,
          paddingLeft: `${h}mm`,
        };
      }

      if (variant === 'right-column') {
        return {
          paddingTop: `${v}mm`,
          paddingRight: `${h}mm`,
          paddingBottom: omitBottom ? '0mm' : `${v}mm`,
          paddingLeft: `${COLUMN_INNER_GAP_RIGHT}mm`,
        };
      }

      return {
        paddingTop: `${v}mm`,
        paddingRight: `${h}mm`,
        paddingBottom: omitBottom ? '0mm' : `${v}mm`,
        paddingLeft: `${h}mm`,
      };
    },
    [margins, customMargin],
  );

  const value: CVAppearanceContextType = {
    template,
    setTemplate: setTemplate as CVAppearanceContextType['setTemplate'],
    margins,
    setMargins: setMargins as CVAppearanceContextType['setMargins'],
    customMargin,
    setCustomMargin: setCustomMargin as CVAppearanceContextType['setCustomMargin'],
    themeColor,
    setThemeColor: setThemeColor as CVAppearanceContextType['setThemeColor'],
    fontFamily,
    setFontFamily: setFontFamily as CVAppearanceContextType['setFontFamily'],
    fontSizeHeading,
    setFontSizeHeading: setFontSizeHeading as CVAppearanceContextType['setFontSizeHeading'],
    fontSizeText,
    setFontSizeText: setFontSizeText as CVAppearanceContextType['setFontSizeText'],
    cvLanguage,
    setCvLanguage: setCvLanguage as CVAppearanceContextType['setCvLanguage'],
    darkMode,
    setDarkMode: setDarkMode as CVAppearanceContextType['setDarkMode'],
    showSectionIcons,
    setShowSectionIcons: setShowSectionIcons as CVAppearanceContextType['setShowSectionIcons'],
    creativeHeaderBg,
    setCreativeHeaderBg: setCreativeHeaderBg as CVAppearanceContextType['setCreativeHeaderBg'],
    getMarginStyle,
    getMarginValues,
  };

  return (
    <CVAppearanceContext.Provider value={value}>{children}</CVAppearanceContext.Provider>
  );
}
