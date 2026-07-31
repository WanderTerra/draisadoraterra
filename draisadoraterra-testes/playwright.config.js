// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  // Sobe um servidor estático servindo a raiz do repositório
  // (onde estão index.html, og-preview.png e a pasta links/)
  webServer: {
    command: 'npx http-server . -p 8080 -s',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
