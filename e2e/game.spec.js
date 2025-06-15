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

test.describe('Game', () => {
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
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('Welcome to Rogue Scroll');
    await expect(page.locator('#menu')).toBeVisible();
  });

  test('should start the game when clicking start', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for RogueScroll to be available
    await page.waitForFunction(() => typeof window.RogueScroll !== 'undefined', { timeout: 10000 });
    
    // Click the start button
    await page.click('a[href="#game"]');
    
    // Wait for game initialization
    await page.waitForFunction(() => {
      const rs = window.RogueScroll;
      return rs && rs.game && typeof rs.game.addComponentToEntity === 'function';
    }, { timeout: 10000 });
    
    // Verify game container is visible
    await expect(page.locator('#game')).toBeVisible();
    
    // Verify game is running
    const isGameRunning = await page.evaluate(() => {
      const rs = window.RogueScroll;
      return rs && rs.game && rs.isRunning;
    });
    expect(isGameRunning).toBe(true);
  });
}); 