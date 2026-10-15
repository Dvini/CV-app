import { expect, test } from '@playwright/test';
import { captureLayout, longData, seedCV, waitForStablePagination, type CVSetup } from './fixtures';
import type { TemplateName } from '../src/types/cv';

/**
 * Regression net for the pagination engine: the page count and the position of every
 * block on every page must stay identical unless a layout change is intended.
 */

const TEMPLATES: TemplateName[] = ['classic', 'twocolumn', 'minimalist', 'compact', 'creative'];

const cases: { name: string; setup: CVSetup; screenshot?: boolean }[] = [];
for (const template of TEMPLATES) {
  for (const margins of ['small', 'normal', 'large'] as const) {
    cases.push({ name: `${template}-${margins}-short`, setup: { appearance: { template, margins } } });
    cases.push({
      name: `${template}-${margins}-long`,
      setup: { data: longData, appearance: { template, margins } },
      screenshot: margins === 'normal',
    });
  }
  cases.push({
    name: `${template}-custom0-long`,
    setup: { data: longData, appearance: { template, margins: 'custom', customMargin: { vertical: 0, horizontal: 0 } } },
  });
}
cases.push(
  { name: 'classic-normal-long-noclause', setup: { data: { ...longData, showClause: false }, appearance: { template: 'classic' } } },
  { name: 'twocolumn-normal-long-noclause', setup: { data: { ...longData, showClause: false }, appearance: { template: 'twocolumn' } } },
);

for (const { name, setup, screenshot } of cases) {
  test(name, async ({ page }) => {
    await seedCV(page, setup);
    await page.goto('/');
    await waitForStablePagination(page);

    const layout = await captureLayout(page);
    expect(JSON.stringify(layout, null, 1)).toMatchSnapshot(`${name}.json`);

    if (screenshot) {
      const sheets = page.locator('.cv-page-sheet');
      for (let i = 0; i < layout.length; i++) {
        await expect(sheets.nth(i)).toHaveScreenshot(`${name}-page${i + 1}.png`);
      }
    }
  });
}
