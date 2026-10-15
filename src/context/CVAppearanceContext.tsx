/**
 * CVAppearanceContext — manages template, colors, fonts, and margin settings.
 */
import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  MARGIN_PRESETS,
  COLUMN_INNER_GAP_LEFT,
  COLUMN_INNER_GAP_RIGHT,
} from '../constants/layout';
import {
  APPEARANCE_KEYS,
  APPEARANCE_STORAGE_KEYS as KEYS,
  defaultAppearance as DEFAULTS,
} from '../constants/defaults';
import { APPEARANCE_NORMALIZERS } from '../utils/cvSchema';
import type {
  AppearanceSettings,
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

type AppearanceSetters = {
  [K in keyof AppearanceSettings]: (value: AppearanceSettings[K]) => void;
};

/** One persisted appearance setting; invalid stored values fall back to the default. */
function useAppearanceSetting<K extends keyof AppearanceSettings>(key: K) {
  return useLocalStorage<AppearanceSettings[K]>(KEYS[key], DEFAULTS[key], APPEARANCE_NORMALIZERS[key]);
}

export function CVAppearanceProvider({ children }: CVAppearanceProviderProps) {
  const [template, setTemplate] = useAppearanceSetting('template');
  const [margins, setMargins] = useAppearanceSetting('margins');
  const [customMargin, setCustomMargin] = useAppearanceSetting('customMargin');
  const [themeColor, setThemeColor] = useAppearanceSetting('themeColor');
  const [fontFamily, setFontFamily] = useAppearanceSetting('fontFamily');
  const [fontSizeHeading, setFontSizeHeading] = useAppearanceSetting('fontSizeHeading');
  const [fontSizeText, setFontSizeText] = useAppearanceSetting('fontSizeText');
  const [cvLanguage, setCvLanguage] = useAppearanceSetting('cvLanguage');
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('cv_darkMode', false);
  const [showSectionIcons, setShowSectionIcons] = useAppearanceSetting('showSectionIcons');
  const [showContactIcons, setShowContactIcons] = useAppearanceSetting('showContactIcons');
  const [creativeHeaderBg, setCreativeHeaderBg] = useAppearanceSetting('creativeHeaderBg');
  const [creativeHeaderImage, setCreativeHeaderImage] = useAppearanceSetting('creativeHeaderImage');
  const [sectionGap, setSectionGap] = useAppearanceSetting('sectionGap');
  const [itemGap, setItemGap] = useAppearanceSetting('itemGap');

  // Two-column layout settings
  const [twoColLineWidth, setTwoColLineWidth] = useAppearanceSetting('twoColLineWidth');
  const [twoColLineColor, setTwoColLineColor] = useAppearanceSetting('twoColLineColor');
  const [twoColSidebarWidth, setTwoColSidebarWidth] = useAppearanceSetting('twoColSidebarWidth');
  const [twoColGapLeft, setTwoColGapLeft] = useAppearanceSetting('twoColGapLeft');
  const [twoColGapRight, setTwoColGapRight] = useAppearanceSetting('twoColGapRight');
  const [twoColSectionGap, setTwoColSectionGap] = useAppearanceSetting('twoColSectionGap');
  const [twoColItemGap, setTwoColItemGap] = useAppearanceSetting('twoColItemGap');

  // Typed as a mapped type so adding a field to AppearanceSettings without a setter fails to compile.
  // useState setters are stable, so this map never goes stale.
  const setters: AppearanceSetters = {
    template: setTemplate,
    margins: setMargins,
    customMargin: setCustomMargin,
    themeColor: setThemeColor,
    fontFamily: setFontFamily,
    fontSizeHeading: setFontSizeHeading,
    fontSizeText: setFontSizeText,
    cvLanguage: setCvLanguage,
    showSectionIcons: setShowSectionIcons,
    showContactIcons: setShowContactIcons,
    creativeHeaderBg: setCreativeHeaderBg,
    creativeHeaderImage: setCreativeHeaderImage,
    sectionGap: setSectionGap,
    itemGap: setItemGap,
    twoColLineWidth: setTwoColLineWidth,
    twoColLineColor: setTwoColLineColor,
    twoColSidebarWidth: setTwoColSidebarWidth,
    twoColGapLeft: setTwoColGapLeft,
    twoColGapRight: setTwoColGapRight,
    twoColSectionGap: setTwoColSectionGap,
    twoColItemGap: setTwoColItemGap,
  };

  const applyAppearance = (patch: Partial<AppearanceSettings>) => {
    for (const key of APPEARANCE_KEYS) {
      if (patch[key] !== undefined) {
        (setters[key] as (value: unknown) => void)(patch[key]);
      }
    }
  };

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

  const value: CVAppearanceContextType = {
    template,
    margins,
    customMargin,
    themeColor,
    fontFamily,
    fontSizeHeading,
    fontSizeText,
    cvLanguage,
    showSectionIcons,
    showContactIcons,
    creativeHeaderBg,
    creativeHeaderImage,
    sectionGap,
    itemGap,
    twoColLineWidth,
    twoColLineColor,
    twoColSidebarWidth,
    twoColGapLeft,
    twoColGapRight,
    twoColSectionGap,
    twoColItemGap,
    setTemplate,
    setMargins,
    setCustomMargin,
    setThemeColor,
    setFontFamily,
    setFontSizeHeading,
    setFontSizeText,
    setCvLanguage,
    setShowSectionIcons,
    setShowContactIcons,
    setCreativeHeaderBg,
    setCreativeHeaderImage,
    setSectionGap,
    setItemGap,
    setTwoColLineWidth,
    setTwoColLineColor,
    setTwoColSidebarWidth,
    setTwoColGapLeft,
    setTwoColGapRight,
    setTwoColSectionGap,
    setTwoColItemGap,
    darkMode,
    setDarkMode,
    applyAppearance,
    getMarginStyle,
    getMarginValues,
  };

  return (
    <CVAppearanceContext.Provider value={value}>{children}</CVAppearanceContext.Provider>
  );
}
