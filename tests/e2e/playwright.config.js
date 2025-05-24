const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    // Browser options
    headless: false,
    viewport: { width: 1280, height: 800 },
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    // Capture console output
    launchOptions: {
      args: ['--remote-debugging-port=9222']
    }
  },
  // Run tests in files in parallel
  fullyParallel: true,
  // Reporter to use
  reporter: 'list',
}); 