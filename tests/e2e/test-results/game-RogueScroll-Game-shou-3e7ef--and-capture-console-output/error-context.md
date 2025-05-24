# Test info

- Name: RogueScroll Game >> should load the game page and capture console output
- Location: /Users/johnholland/Developers/roguescroll/tests/e2e/game.spec.js:72:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3000/", waiting until "networkidle"

    at /Users/johnholland/Developers/roguescroll/tests/e2e/game.spec.js:67:16
```

# Test source

```ts
   1 | const { test, expect } = require('@playwright/test');
   2 | const axios = require('axios');
   3 | const { spawn } = require('child_process');
   4 | const path = require('path');
   5 |
   6 | let serverProcess;
   7 |
   8 | // Helper to check if the server is running
   9 | async function isServerUp() {
   10 |   try {
   11 |     await axios.get('http://localhost:3000');
   12 |     return true;
   13 |   } catch {
   14 |     return false;
   15 |   }
   16 | }
   17 |
   18 | test.beforeAll(async () => {
   19 |   if (!(await isServerUp())) {
   20 |     console.log('Server not running, starting it...');
   21 |     serverProcess = spawn('npm', ['start'], {
   22 |       stdio: 'inherit',
   23 |       shell: true,
   24 |       cwd: path.resolve(__dirname, '../..')
   25 |     });
   26 |     // Wait for server to start
   27 |     let ready = false;
   28 |     for (let i = 0; i < 20; i++) {
   29 |       if (await isServerUp()) {
   30 |         ready = true;
   31 |         break;
   32 |       }
   33 |       await new Promise(res => setTimeout(res, 1000));
   34 |     }
   35 |     if (!ready) throw new Error('Server did not start in time');
   36 |   } else {
   37 |     console.log('Server is already running.');
   38 |   }
   39 | });
   40 |
   41 | test.afterAll(async () => {
   42 |   if (serverProcess) {
   43 |     serverProcess.kill();
   44 |   }
   45 | });
   46 |
   47 | test.describe('RogueScroll Game', () => {
   48 |   let consoleMessages = [];
   49 |
   50 |   test.beforeEach(async ({ page }) => {
   51 |     // Clear console messages before each test
   52 |     consoleMessages = [];
   53 |     
   54 |     // Listen for console messages
   55 |     page.on('console', msg => {
   56 |       consoleMessages.push({
   57 |         type: msg.type(),
   58 |         text: msg.text(),
   59 |         location: msg.location()
   60 |       });
   61 |       // Log to our test output
   62 |       console.log(`Browser ${msg.type()}: ${msg.text()}`);
   63 |     });
   64 |
   65 |     // Navigate to the game
   66 |     console.log('Navigating to http://localhost:3000...');
>  67 |     await page.goto('http://localhost:3000', {
      |                ^ Error: page.goto: Target page, context or browser has been closed
   68 |       waitUntil: 'networkidle'
   69 |     });
   70 |   });
   71 |
   72 |   test('should load the game page and capture console output', async ({ page }) => {
   73 |     // Check page title
   74 |     const title = await page.title();
   75 |     console.log('Page title:', title);
   76 |     expect(title).toContain('Rogue Scroll');
   77 |
   78 |     // Check for game container
   79 |     const gameContainer = await page.locator('#game');
   80 |     await expect(gameContainer).toBeVisible();
   81 |     
   82 |     // Log all captured console messages
   83 |     console.log('\nAll captured console messages:');
   84 |     consoleMessages.forEach((msg, index) => {
   85 |       console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
   86 |     });
   87 |
   88 |     // Check for any errors
   89 |     const errors = consoleMessages.filter(m => m.type === 'error');
   90 |     if (errors.length > 0) {
   91 |       console.log('\nErrors found during initialization:');
   92 |       errors.forEach((error, index) => {
   93 |         console.log(`${index + 1}. ${error.text}`);
   94 |       });
   95 |     }
   96 |   });
   97 |
   98 |   test('should have working game elements', async ({ page }) => {
   99 |     // Check for menu
  100 |     const menu = await page.locator('#menu');
  101 |     await expect(menu).toBeVisible();
  102 |
  103 |     // Check for welcome message
  104 |     const welcomeMessage = await page.locator('h1');
  105 |     await expect(welcomeMessage).toContainText('Welcome to Rogue Scroll');
  106 |   });
  107 | }); 
```