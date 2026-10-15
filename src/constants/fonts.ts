import type { FontFamily } from '../types/cv';

/** CSS font-family stack for each font option. */
export const FONT_STACKS: Record<FontFamily, string> = {
  sans: 'Inter, system-ui, sans-serif',
  serif: 'Merriweather, Georgia, serif',
  Roboto: '"Roboto Variable", Roboto, sans-serif',
  'Open Sans': '"Open Sans Variable", "Open Sans", sans-serif',
  Montserrat: '"Montserrat Variable", Montserrat, sans-serif',
  Lato: 'Lato, sans-serif',
  'Playfair Display': '"Playfair Display Variable", "Playfair Display", serif',
};

/**
 * Self-hosted font files, loaded only when a font is picked — no requests to Google
 * (the CV holds personal data, and the default fonts are bundled in main.tsx).
 */
export const FONT_LOADERS: Partial<Record<FontFamily, () => Promise<unknown>>> = {
  Roboto: () => import('@fontsource-variable/roboto/index.css'),
  'Open Sans': () => import('@fontsource-variable/open-sans/index.css'),
  Montserrat: () => import('@fontsource-variable/montserrat/index.css'),
  // Lato has no variable version; 400/700 are the weights it offers in the CV's range
  Lato: () => Promise.all([import('@fontsource/lato/400.css'), import('@fontsource/lato/700.css')]),
  'Playfair Display': () => import('@fontsource-variable/playfair-display/index.css'),
};
