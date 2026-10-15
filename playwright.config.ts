import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * Browser tests run against a production build (no StrictMode double effects),
 * in Playwright's bundled Chromium so layout snapshots don't drift with browser updates.
 * Update snapshots after an intended layout change: npm run test:e2e:update
 */
export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFileName}/{arg}{ext}',
  fullyParallel: true,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1,
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002 },
  },
  webServer: {
    command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
