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
  const [showContactIcons, setShowContactIcons] = useLocalStorage<boolean>(
    'cv_showContactIcons',
    false,
  );
  const [creativeHeaderBg, setCreativeHeaderBg] = useLocalStorage<string>(
    'cv_creativeHeaderBg',
    DEFAULT_THEME_COLOR,
  );
  const [creativeHeaderImage, setCreativeHeaderImage] = useLocalStorage<string | null>(
    'cv_creativeHeaderImage',
    null,
  );
  const [sectionGap, setSectionGap] = useLocalStorage<number>('cv_sectionGap', 1.25);
  const [itemGap, setItemGap] = useLocalStorage<number>('cv_itemGap', 0.5);

  // Two-column layout settings
  const [twoColLineWidth, setTwoColLineWidth] = useLocalStorage<number>('cv_twoColLineWidth', 1);
  const [twoColLineColor, setTwoColLineColor] = useLocalStorage<string>('cv_twoColLineColor', '#e2e8f0');
  const [twoColSidebarWidth, setTwoColSidebarWidth] = useLocalStorage<number>('cv_twoColSidebarWidth', 33);
  const [twoColGapLeft, setTwoColGapLeft] = useLocalStorage<number>('cv_twoColGapLeft', COLUMN_INNER_GAP_LEFT);
  const [twoColGapRight, setTwoColGapRight] = useLocalStorage<number>('cv_twoColGapRight', COLUMN_INNER_GAP_RIGHT);
  const [twoColSectionGap, setTwoColSectionGap] = useLocalStorage<number>('cv_twoColSectionGap', 0.5);
  const [twoColItemGap, setTwoColItemGap] = useLocalStorage<number>('cv_twoColItemGap', 0.2);

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
    showContactIcons,
    setShowContactIcons: setShowContactIcons as CVAppearanceContextType['setShowContactIcons'],
    creativeHeaderBg,
    setCreativeHeaderBg: setCreativeHeaderBg as CVAppearanceContextType['setCreativeHeaderBg'],
    creativeHeaderImage,
    setCreativeHeaderImage: setCreativeHeaderImage as CVAppearanceContextType['setCreativeHeaderImage'],
    sectionGap,
    setSectionGap: setSectionGap as CVAppearanceContextType['setSectionGap'],
    itemGap,
    setItemGap: setItemGap as CVAppearanceContextType['setItemGap'],
    twoColLineWidth,
    setTwoColLineWidth: setTwoColLineWidth as CVAppearanceContextType['setTwoColLineWidth'],
    twoColLineColor,
    setTwoColLineColor: setTwoColLineColor as CVAppearanceContextType['setTwoColLineColor'],
    twoColSidebarWidth,
    setTwoColSidebarWidth: setTwoColSidebarWidth as CVAppearanceContextType['setTwoColSidebarWidth'],
    twoColGapLeft,
    setTwoColGapLeft: setTwoColGapLeft as CVAppearanceContextType['setTwoColGapLeft'],
    twoColGapRight,
    setTwoColGapRight: setTwoColGapRight as CVAppearanceContextType['setTwoColGapRight'],
    twoColSectionGap,
    setTwoColSectionGap: setTwoColSectionGap as CVAppearanceContextType['setTwoColSectionGap'],
    twoColItemGap,
    setTwoColItemGap: setTwoColItemGap as CVAppearanceContextType['setTwoColItemGap'],
    getMarginStyle,
    getMarginValues,
  };

  return (
    <CVAppearanceContext.Provider value={value}>{children}</CVAppearanceContext.Provider>
  );
}
