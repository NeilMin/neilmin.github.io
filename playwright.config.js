// playwright.config.js — E2E tests for blog animation stagger

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:1313',
    trace: 'on-first-retry',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
});