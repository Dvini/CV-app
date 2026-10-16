import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import { captureLayout, longData, seedCV, waitForStablePagination, type CVSetup, type PageLayout } from './fixtures';
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
    // No fixture block is taller than a page, so none may be split across pages
    const cutBlocks = layout.flatMap((p) => p.items.filter((item) => item.cut).map((item) => item.text));
    expect(cutBlocks).toEqual([]);
    expect(JSON.stringify(layout, null, 1)).toMatchSnapshot(`${name}.json`);

    if (screenshot) {
      const sheets = page.locator('.cv-page-sheet');
      for (let i = 0; i < layout.length; i++) {
        await expect(sheets.nth(i)).toHaveScreenshot(`${name}-page${i + 1}.png`);
      }
    }
  });
}

/**
 * Narrow preview areas must paginate exactly like the full-width preview (and the PDF):
 * pages keep the A4 width and are only zoomed out, never reflowed.
 */
const narrowCases = ['classic-normal-long', 'twocolumn-small-long', 'creative-normal-long'];
const narrowViewports = [
  { label: 'phone', viewport: { width: 390, height: 844 }, mobile: true },
  { label: 'narrow desktop', viewport: { width: 1100, height: 900 }, mobile: false },
];

for (const { label, viewport, mobile } of narrowViewports) {
  test.describe(label, () => {
    test.use({ viewport });

    for (const name of narrowCases) {
      test(`${name} paginates like the full-width preview`, async ({ page }) => {
        const { setup } = cases.find((c) => c.name === name)!;
        await seedCV(page, setup);
        await page.goto('/');
        if (mobile) await page.getByRole('button', { name: 'Podgląd' }).click();
        await waitForStablePagination(page);

        // Unscaled content height of a page (inline style, unaffected by zoom)
        const clipHeight = await page
          .locator('.cv-page-content-clip')
          .first()
          .evaluate((el) => parseFloat((el as HTMLElement).style.height));
        // Zoomed pages snap to device pixels, so a block ending exactly at a page break can
        // leave an invisible sliver (≤2 screen px) on the next page — ignore those at both edges
        const scale = await page.evaluate(() =>
          parseFloat(getComputedStyle(document.querySelector('.preview-area')!).getPropertyValue('--cv-preview-scale')) || 1,
        );
        const sliver = 2 / scale;
        const pageTexts = (layout: PageLayout[]) =>
          layout.map((p) =>
            p.items
              .filter((item) => item.bottom > sliver && item.top < clipHeight - sliver)
              .map((item) => item.text),
          );
        const fullWidth: PageLayout[] = JSON.parse(
          fs.readFileSync(test.info().snapshotPath(`${name}.json`), 'utf8'),
        );
        expect(pageTexts(await captureLayout(page))).toEqual(pageTexts(fullWidth));

        // Zoomed out, the page fits the preview area instead of needing horizontal scrolling
        const sheetWidth = (await page.locator('.cv-preview-container').first().boundingBox())!.width;
        const previewWidth = (await page.locator('.preview-scroll').boundingBox())!.width;
        expect(sheetWidth).toBeLessThanOrEqual(previewWidth);
      });
    }
  });
}

/**
 * Appearance changes can move content inside one column without changing the document's
 * total height, which the DOM observers alone don't notice. Pages must still be re-split.
 */
test.describe('live appearance changes', () => {
  const appearance = { template: 'twocolumn', margins: 'small' } as const;
  const changes = [
    { label: 'Odstęp między elementami (lewa kolumna)', value: 0.6, setting: { twoColItemGap: 0.6 } },
    { label: 'Odstęp między sekcjami (lewa kolumna)', value: 1.5, setting: { twoColSectionGap: 1.5 } },
    { label: 'Wielkość tekstów', value: 1.1, setting: { fontSizeText: 1.1 } },
  ];

  for (const { label, value, setting } of changes) {
    test(`re-paginate after "${label}" changes`, async ({ page, browser }) => {
      await seedCV(page, { data: longData, appearance });
      await page.goto('/');
      await waitForStablePagination(page);
      await page.locator('button.panel-header', { hasText: 'Wygląd CV' }).click();
      await page.getByLabel(label).first().fill(String(value));
      await waitForStablePagination(page);
      const live = await captureLayout(page);

      // Reference: a separate page that starts with the changed setting
      // (not a reload — seedCV's init script would restore the original settings)
      const reference = await browser.newPage({ viewport: page.viewportSize()! });
      await seedCV(reference, { data: longData, appearance: { ...appearance, ...setting } });
      await reference.goto('/');
      await waitForStablePagination(reference);
      const fresh = await captureLayout(reference);
      await reference.close();

      expect(live).toEqual(fresh);
    });
  }
});
