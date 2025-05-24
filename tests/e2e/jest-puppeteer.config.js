module.exports = {
  launch: {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    timeout: 60000,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
  },
  browserContext: 'default'
}; 