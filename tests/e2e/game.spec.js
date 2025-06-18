// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('RogueScroll Game', () => {
  let consoleMessages = [];

  test.beforeEach(async ({ page }) => {
    // Clear console messages before each test
    consoleMessages = [];
    
    // Listen for console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
      // Log to our test output
      console.log(`Browser ${msg.type()}: ${msg.text()}`);
    });

    // Navigate to the game
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle'
    });
  });

  test('should load the game page and capture console output', async ({ page }) => {
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    expect(title).toContain('Rogue Scroll');

    // Check for game container
    const gameContainer = await page.locator('#game');
    await expect(gameContainer).toBeVisible();
    
    // Log all captured console messages
    console.log('\nAll captured console messages:');
    consoleMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
    });

    // Check for any errors
    const errors = consoleMessages.filter(m => m.type === 'error');
    if (errors.length > 0) {
      console.log('\nErrors found during initialization:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text}`);
      });
    }
  });

  test('should have working game elements', async ({ page }) => {
    // Check for menu
    const menu = await page.locator('#menu');
    await expect(menu).toBeVisible();

    // Check for welcome message
    const welcomeMessage = await page.locator('h1');
    await expect(welcomeMessage).toContainText('Welcome to Rogue Scroll');
  });
}); 