// A4 page dimensions
export const A4_HEIGHT_MM = 297;
export const A4_WIDTH_MM = 210;
export const MM_TO_PX = 96 / 25.4; // 1mm ≈ 3.7795px at 96dpi
export const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * MM_TO_PX); // ~1123px

// Pagination
export const MIN_FOOTER_PX = 24;
export const FOOTER_TEXT_HEIGHT_PX = 36;
export const PAGINATION_DEBOUNCE_MS = 100;
export const PAGINATION_OBSERVER_DEBOUNCE_MS = 50;

// Margin presets (mm)
export const MARGIN_PRESETS = {
  small: { v: 12, h: 12 },
  normal: { v: 20, h: 20 },
  large: { v: 25, h: 25 },
};

// Column widths for two-column layout
export const TWO_COLUMN_SIDE_WIDTH = '35%';
export const TWO_COLUMN_MAIN_WIDTH = '65%';

// Photo defaults
export const PHOTO_DEFAULT_SIZE = 80;
export const PHOTO_MIN_SIZE = 40;
export const PHOTO_MAX_SIZE = 180;

// Font size scale range
export const FONT_SCALE_MIN = 0.8;
export const FONT_SCALE_MAX = 1.3;
export const FONT_SCALE_STEP = 0.05;

// Default custom margin (mm)
export const DEFAULT_CUSTOM_MARGIN = { vertical: 15, horizontal: 15 };

// Default theme
export const DEFAULT_THEME_COLOR = '#2563eb';

// Inner column gaps (mm) for two-column layout
export const COLUMN_INNER_GAP_LEFT = 6;
export const COLUMN_INNER_GAP_RIGHT = 8;
