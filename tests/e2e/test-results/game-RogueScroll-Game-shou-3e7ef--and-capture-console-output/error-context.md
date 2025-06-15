# Test info

- Name: RogueScroll Game >> should load the game page and capture console output
- Location: /Users/johnholland/Developers/roguescroll/tests/e2e/game.spec.js:29:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('#game')
Expected: visible
Received: hidden
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('#game')
    9 × locator resolved to <div id="game"></div>
      - unexpected value "hidden"

    at /Users/johnholland/Developers/roguescroll/tests/e2e/game.spec.js:37:33
```

# Page snapshot

```yaml
- navigation:
  - link "Rogue Scroll":
    - /url: "#"
  - list:
    - listitem:
      - link "Menu":
        - /url: "#menu"
    - listitem:
      - link "Game":
        - /url: "#game"
- heading "Welcome to Rogue Scroll!" [level=1]
```

# Test source

```ts
   1 | // @ts-check
   2 | const { test, expect } = require('@playwright/test');
   3 |
   4 | test.describe('RogueScroll Game', () => {
   5 |   let consoleMessages = [];
   6 |
   7 |   test.beforeEach(async ({ page }) => {
   8 |     // Clear console messages before each test
   9 |     consoleMessages = [];
  10 |     
  11 |     // Listen for console messages
  12 |     page.on('console', msg => {
  13 |       consoleMessages.push({
  14 |         type: msg.type(),
  15 |         text: msg.text(),
  16 |         location: msg.location()
  17 |       });
  18 |       // Log to our test output
  19 |       console.log(`Browser ${msg.type()}: ${msg.text()}`);
  20 |     });
  21 |
  22 |     // Navigate to the game
  23 |     console.log('Navigating to http://localhost:3000...');
  24 |     await page.goto('http://localhost:3000', {
  25 |       waitUntil: 'networkidle'
  26 |     });
  27 |   });
  28 |
  29 |   test('should load the game page and capture console output', async ({ page }) => {
  30 |     // Check page title
  31 |     const title = await page.title();
  32 |     console.log('Page title:', title);
  33 |     expect(title).toContain('Rogue Scroll');
  34 |
  35 |     // Check for game container
  36 |     const gameContainer = await page.locator('#game');
> 37 |     await expect(gameContainer).toBeVisible();
     |                                 ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  38 |     
  39 |     // Log all captured console messages
  40 |     console.log('\nAll captured console messages:');
  41 |     consoleMessages.forEach((msg, index) => {
  42 |       console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
  43 |     });
  44 |
  45 |     // Check for any errors
  46 |     const errors = consoleMessages.filter(m => m.type === 'error');
  47 |     if (errors.length > 0) {
  48 |       console.log('\nErrors found during initialization:');
  49 |       errors.forEach((error, index) => {
  50 |         console.log(`${index + 1}. ${error.text}`);
  51 |       });
  52 |     }
  53 |   });
  54 |
  55 |   test('should have working game elements', async ({ page }) => {
  56 |     // Check for menu
  57 |     const menu = await page.locator('#menu');
  58 |     await expect(menu).toBeVisible();
  59 |
  60 |     // Check for welcome message
  61 |     const welcomeMessage = await page.locator('h1');
  62 |     await expect(welcomeMessage).toContainText('Welcome to Rogue Scroll');
  63 |   });
  64 | }); 
```