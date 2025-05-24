const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess;

// Helper to check if the server is running
async function isServerUp() {
  try {
    await axios.get('http://localhost:3000');
    return true;
  } catch {
    return false;
  }
}

async function globalSetup() {
  if (!(await isServerUp())) {
    console.log('Server not running, starting it...');
    serverProcess = spawn('npm', ['start'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '../..')
    });
    // Wait for server to start
    let ready = false;
    for (let i = 0; i < 20; i++) {
      if (await isServerUp()) {
        ready = true;
        break;
      }
      await new Promise(res => setTimeout(res, 1000));
    }
    if (!ready) throw new Error('Server did not start in time');
  } else {
    console.log('Server is already running.');
  }
}

async function globalTeardown() {
  if (serverProcess) {
    serverProcess.kill();
  }
}

// Export a single function that handles both setup and teardown
module.exports = async function() {
  await globalSetup();
  return async () => {
    await globalTeardown();
  };
}; 