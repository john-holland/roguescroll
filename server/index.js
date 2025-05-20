const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const app = express();
const port = process.env.PORT || 3000;

// Set up static file serving with proper MIME types
app.use(express.static(path.join(__dirname, '../client'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// Serve files from the dist directory
app.use('/dist', express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Handle jQuery.js requests
app.get('/jQuery.js', (req, res) => {
  res.redirect('https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js');
});

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Start HTTP server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 