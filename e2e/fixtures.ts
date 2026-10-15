import type { Page } from '@playwright/test';
import {
  LEGACY_APPEARANCE_STORAGE_KEYS,
  DOCUMENT_STORAGE_KEYS,
  defaultData,
} from '../src/constants/defaults';
import type { AppearanceSettings, CVData } from '../src/types/cv';

const lines = (count: number, prefix: string) =>
  Array.from(
    { length: count },
    (_, i) => `${prefix} ${i + 1}: projektowanie, wdrażanie i utrzymanie modułów aplikacji webowej w zespole.`,
  ).join('\n');

/** Deterministic CV long enough to span 2–3 pages in every template. */
export const longData: CVData = {
  ...defaultData,
  experience: Array.from({ length: 7 }, (_, i) => ({
    id: `exp-${i}`,
    company: `Firma ${i + 1} Sp. z o.o.`,
    positions: [
      { id: `pos-${i}-a`, title: `Starszy specjalista ${i + 1}`, startDate: '01/2019', endDate: '12/2020' },
      ...(i % 2 === 0
        ? [{ id: `pos-${i}-b`, title: `Specjalista ${i + 1}`, startDate: '01/2017', endDate: '12/2018' }]
        : []),
    ],
    description: lines(3 + (i % 3), 'Zadanie'),
    skills: 'TypeScript, React, Node.js, PostgreSQL',
  })),
  courses: Array.from({ length: 4 }, (_, i) => ({
    id: `course-${i}`,
    name: `Kurs zaawansowany ${i + 1}`,
    organizer: 'Akademia Programowania',
    startDate: '03/2022',
    endDate: '04/2022',
  })),
  projects: Array.from({ length: 4 }, (_, i) => ({
    id: `proj-${i}`,
    name: `Projekt ${i + 1}`,
    description: lines(2, 'Funkcja'),
    link: `example.com/projekt-${i + 1}`,
    skills: 'React, CSS',
  })),
  certificates: Array.from({ length: 5 }, (_, i) => ({
    id: `cert-${i}`,
    name: `Certyfikat ${i + 1}`,
    issuer: 'Instytut Certyfikacji',
    date: '2023',
    credentialUrl: '',
  })),
  languages: [
    { id: 'lang-1', name: 'Angielski', level: 'C1' },
    { id: 'lang-2', name: 'Niemiecki', level: 'B1' },
  ],
  volunteer: Array.from({ length: 2 }, (_, i) => ({
    id: `vol-${i}`,
    role: `Wolontariusz ${i + 1}`,
    organization: 'Fundacja Pomocy',
    startDate: '2018',
    endDate: '2019',
    description: lines(2, 'Działanie'),
  })),
};

export interface CVSetup {
  data?: CVData;
  appearance?: Partial<AppearanceSettings>;
}

/**
 * Seeds localStorage before the app's first script runs. Appearance is written in the
 * legacy per-setting format on purpose, so every test also exercises the migration.
 */
export async function seedCV(page: Page, { data = defaultData, appearance = {} }: CVSetup) {
  const entries: [string, string][] = [[DOCUMENT_STORAGE_KEYS.data, JSON.stringify(data)]];
  for (const [key, value] of Object.entries(appearance)) {
    entries.push([LEGACY_APPEARANCE_STORAGE_KEYS[key as keyof AppearanceSettings], JSON.stringify(value)]);
  }
  await page.addInitScript((items) => {
    localStorage.clear();
    for (const [key, value] of items) localStorage.setItem(key, value);
  }, entries);
}

/** Waits until fonts are loaded and the pagination spacers stop changing. */
export async function waitForStablePagination(page: Page) {
  await page.waitForSelector('.cv-page-sheet .cv-name');
  await page.evaluate(() => document.fonts.ready);
  let previous = '';
  for (let attempt = 0; attempt < 30; attempt++) {
    await page.waitForTimeout(150);
    const signature = await page.evaluate(() =>
      [
        document.querySelectorAll('.cv-page-sheet').length,
        ...Array.from(document.querySelectorAll<HTMLElement>('.cv-measure-container .cv-breakable'),
          (el) => el.style.marginTop),
      ].join('|'),
    );
    if (signature === previous) return;
    previous = signature;
  }
  throw new Error('Pagination did not settle');
}

export interface PageLayout {
  items: { text: string; top: number; bottom: number; cut?: true }[];
}

/**
 * Structural fingerprint of the visible pages: for every page, each breakable block
 * that is visible on it with its position relative to the page's content area.
 */
export function captureLayout(page: Page): Promise<PageLayout[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.cv-page-sheet'), (sheet) => {
      const clip = sheet.querySelector('.cv-page-content-clip')!.getBoundingClientRect();
      const items = Array.from(sheet.querySelectorAll<HTMLElement>('.cv-breakable'))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40),
            top: Math.round(rect.top - clip.top),
            bottom: Math.round(rect.bottom - clip.top),
            ...(rect.bottom - clip.top > clip.height + 0.5 ? { cut: true as const } : {}),
          };
        })
        .filter((item) => item.bottom > 0 && item.top < clip.height);
      return { items };
    }),
  );
}
