import fs from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/** End-to-end checks of editor flows that unit tests can't see: keyboard, dialogs, files, reloads. */

const NAME = '.cv-page-sheet .cv-name';

const previewName = (page: Page) => page.locator(NAME).first();
const nameInput = (page: Page) => page.locator('input[name="fullName"]');

async function open(page: Page) {
  await page.goto('/');
  await expect(previewName(page)).toBeVisible();
}

async function openPanel(page: Page, title: string) {
  await page.locator('button.panel-header', { hasText: title }).click();
}

const sidebarWidthSlider = (page: Page) => page.locator('input[type=range][min="20"][max="50"]');
const sidebarWidthLabel = (page: Page) =>
  page.locator('label.appearance-label', { hasText: 'Szerokość lewej kolumny' }).locator('span').nth(1);

async function setSidebarWidth(page: Page, value: number) {
  await sidebarWidthSlider(page).fill(String(value));
}

test('undo and redo from the keyboard', async ({ page }) => {
  await open(page);
  await nameInput(page).fill('Anna Nowak');
  await expect(previewName(page)).toHaveText('Anna Nowak');

  await page.keyboard.press('Control+KeyZ');
  await expect(previewName(page)).toHaveText('Jan Kowalski');

  // A new edit after undo must drop the redo stack
  await nameInput(page).fill('Ewa Zielińska');
  await page.keyboard.press('Control+KeyY');
  await expect(previewName(page)).toHaveText('Ewa Zielińska');

  await page.keyboard.press('Control+KeyZ');
  await expect(previewName(page)).toHaveText('Jan Kowalski');
  await page.keyboard.press('Control+Shift+KeyZ');
  await expect(previewName(page)).toHaveText('Ewa Zielińska');
});

test('typing a word undoes in one step', async ({ page }) => {
  await open(page);
  await nameInput(page).fill('');
  await nameInput(page).pressSequentially('Ola', { delay: 20 });
  await expect(previewName(page)).toHaveText('Ola');
  await page.keyboard.press('Control+KeyZ');
  await expect(previewName(page)).toHaveText('Jan Kowalski');
});

test('profiles keep their own content and two-column settings', async ({ page }) => {
  await open(page);
  await nameInput(page).fill('Ewa Zielińska');
  await openPanel(page, 'Wygląd CV');
  await page.locator('button.btn-option', { hasText: 'Nowoczesny (2 kolumny)' }).click();
  await setSidebarWidth(page, 45);
  await expect(sidebarWidthLabel(page)).toHaveText('45% / 55%');

  await openPanel(page, 'Zarządzaj danymi');
  await page.getByRole('button', { name: 'Nowy profil' }).click();
  await expect(previewName(page)).toHaveText('Jan Kowalski');
  await expect(page.locator('button.btn-option--active', { hasText: 'Klasyczny' })).toBeVisible();
  await page.locator('button.btn-option', { hasText: 'Nowoczesny (2 kolumny)' }).click();
  await expect(sidebarWidthLabel(page)).toHaveText('33% / 67%');
  await setSidebarWidth(page, 25);

  await page.locator('.layout-item', { hasText: 'Profil 1' }).click();
  await expect(previewName(page)).toHaveText('Ewa Zielińska');
  await expect(sidebarWidthLabel(page)).toHaveText('45% / 55%');
  // Switching profiles starts a fresh history — undo must not bring back the other profile
  await page.keyboard.press('Control+KeyZ');
  await expect(previewName(page)).toHaveText('Ewa Zielińska');

  await page.locator('.layout-item', { hasText: 'Profil 2' }).click();
  await expect(sidebarWidthLabel(page)).toHaveText('25% / 75%');
});

test('JSON export contains every appearance setting', async ({ page }) => {
  await open(page);
  await openPanel(page, 'Wygląd CV');
  await page.locator('button.btn-option', { hasText: 'Nowoczesny (2 kolumny)' }).click();
  await setSidebarWidth(page, 45);
  await openPanel(page, 'Zarządzaj danymi');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Pobierz JSON' }).click();
  const exported = JSON.parse(fs.readFileSync(await (await downloadPromise).path(), 'utf8'));
  expect(exported).toMatchObject({ template: 'twocolumn', twoColSidebarWidth: 45, showContactIcons: false });
  expect(exported).toHaveProperty('creativeHeaderImage');
  expect(exported).toHaveProperty('data.personal.fullName', 'Jan Kowalski');
});

test('JSON import validates files', async ({ page }) => {
  await open(page);
  await openPanel(page, 'Zarządzaj danymi');
  const fileInput = page.locator('input[type=file][accept*=".json"]');
  const importFile = (content: string) =>
    fileInput.setInputFiles({ name: 'cv.json', mimeType: 'application/json', buffer: Buffer.from(content) });
  const importError = page.locator('p.field-error', { hasText: 'Nie wczytano pliku' });

  await importFile('{oops');
  await expect(importError).toContainText('To nie jest poprawny plik JSON');
  await importFile('{"name":"x"}');
  await expect(importError).toContainText('Ten plik nie zawiera danych CV');

  await importFile(JSON.stringify({
    data: { personal: { fullName: 'Import Test' }, experience: {}, education: 'zzz' },
    template: 'bogus',
  }));
  await expect(previewName(page)).toHaveText('Import Test');
  await expect(importError).toHaveCount(0);
  await expect(page.getByText('Coś poszło nie tak')).toHaveCount(0);
});

test('reset and profile deletion ask for confirmation', async ({ page }) => {
  await open(page);
  await nameInput(page).fill('Do zachowania');
  await openPanel(page, 'Zarządzaj danymi');
  await page.getByRole('button', { name: 'Nowy profil' }).click();
  await page.locator('.layout-item', { hasText: 'Profil 1' }).click();
  await expect(previewName(page)).toHaveText('Do zachowania');

  const dialogs: string[] = [];
  page.once('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
  await page.getByRole('button', { name: 'Resetuj do domyślnych' }).click();
  await expect(previewName(page)).toHaveText('Do zachowania');

  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Resetuj do domyślnych' }).click();
  await expect(previewName(page)).toHaveText('Jan Kowalski');

  page.once('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
  await page.getByRole('button', { name: 'Usuń profil: Profil 2' }).click();
  await expect(page.locator('.layout-item')).toHaveCount(2);
  expect(dialogs).toHaveLength(2);
});

test('the last edit survives an immediate reload', async ({ page }) => {
  await open(page);
  await nameInput(page).fill('Zapis Test');
  await page.reload();
  await expect(previewName(page)).toHaveText('Zapis Test');
});

test('corrupted storage does not crash the app', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cv_fontFamily', '123');
    localStorage.setItem('cv_appearance', '"x"');
    localStorage.setItem('cv_profiles', '"x"');
    localStorage.setItem('cv_data', JSON.stringify({ personal: 5, experience: {}, skills: 7 }));
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await open(page);
  await expect(previewName(page)).toHaveText('Jan Kowalski');
  await expect(page.locator('.cv-page-sheet h2', { hasText: 'Doświadczenie' })).toHaveCount(0);
  await openPanel(page, 'Zarządzaj danymi');
  await expect(page.locator('.layout-item', { hasText: 'Profil 1' })).toHaveCount(1);
  expect(errors).toEqual([]);
});
