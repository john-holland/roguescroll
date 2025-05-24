// @ts-check
const { test, expect } = require('@playwright/test');

// Debug protocol for game testing
const debugProtocol = {
  log: (msg) => console.log(`🎮 [Game Test] ${msg}`),
  error: (msg) => console.error(`❌ [Game Test] ${msg}`),
  success: (msg) => console.log(`✅ [Game Test] ${msg}`),
  state: (state) => console.log(`📊 [Game State] ${JSON.stringify(state, null, 2)}`),
  event: (event) => console.log(`🎯 [Game Event] ${event}`)
};

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
      // Log to our test output with protocol
      debugProtocol.log(`Browser ${msg.type()}: ${msg.text()}`);
    });

    // Listen for page errors
    page.on('pageerror', error => {
      debugProtocol.error(`Page error: ${error.message}`);
    });

    // Navigate to the game in test mode
    debugProtocol.log('Navigating to http://localhost:3000/?test=true...');
    await page.goto('http://localhost:3000/?test=true', {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });

    // Wait for the menu to be visible
    const menu = await page.locator('#menu');
    await expect(menu).toBeVisible({ timeout: 60000 });
    debugProtocol.success('Menu loaded successfully');
  });

  test('should load the game page and show menu', async ({ page }) => {
    // Check page title
    const title = await page.title();
    debugProtocol.log(`Page title: ${title}`);
    expect(title).toContain('Rogue Scroll');
    debugProtocol.success('Page title verified');

    // Check for welcome message
    const welcomeMessage = await page.locator('h1');
    await expect(welcomeMessage).toContainText('Welcome to Rogue Scroll', { timeout: 60000 });
    debugProtocol.success('Welcome message verified');
    
    // Log all captured console messages
    debugProtocol.log('Captured console messages:');
    consoleMessages.forEach((msg, index) => {
      debugProtocol.event(`${index + 1}. [${msg.type}] ${msg.text}`);
    });
  });

  test('should be able to start the game', async ({ page }) => {
    // Click the game link in the navigation
    debugProtocol.log('Attempting to start game...');
    await page.locator('a[href="#game"]').click();
    
    // Wait for the game container to be visible
    const gameContainer = await page.locator('#game');
    await expect(gameContainer).toBeVisible({ timeout: 60000 });
    debugProtocol.success('Game container loaded');

    // Check that the menu is hidden
    const menu = await page.locator('#menu');
    await expect(menu).not.toBeVisible();
    debugProtocol.success('Menu hidden as expected');

    // Log any new console messages
    debugProtocol.log('Console messages after starting game:');
    consoleMessages.forEach((msg, index) => {
      debugProtocol.event(`${index + 1}. [${msg.type}] ${msg.text}`);
    });
  });
}); 