const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 3000;

// Debug protocol for server
const debugProtocol = {
  log: (msg) => console.log(`🎮 [Server] ${msg}`),
  error: (msg) => console.error(`❌ [Server] ${msg}`),
  success: (msg) => console.log(`✅ [Server] ${msg}`),
  cache: (msg) => console.log(`📦 [Cache] ${msg}`),
  cdn: (msg) => console.log(`🔄 [CDN] ${msg}`)
};

// Enable compression
app.use(compression());

// Local CDN overwrite middleware
app.use((req, res, next) => {
  const cdnMap = {
    // JavaScript files
    'jquery-2.1.1.min.js': '/js/lib/jquery-2.1.1.min.js',
    'jquery.transit.min.js': '/js/lib/jquery.transit.min.js',
    'jquery.color.min.js': '/js/lib/jquery.color.min.js',
    'bootstrap.min.js': '/js/lib/bootstrap.min.js',
    'underscore-min.js': '/js/lib/underscore-min.js',
    'mori.min.js': '/js/lib/mori.min.js',
    'pixi.min.js': '/js/lib/pixi.min.js',
    
    // CSS files
    'bootstrap.min.css': '/css/bootstrap.min.css',
    'bootstrap-theme.min.css': '/css/bootstrap-theme.min.css',
    'glyphicons.css': '/css/glyphicons.css',
    'google-fonts.css': '/css/google-fonts.css',
    'animations.css': '/css/animations.css',
    
    // Analytics (mock)
    'analytics.js': '/js/lib/analytics-mock.js'
  };

  // Check if this is a CDN request
  const cdnUrl = Object.keys(cdnMap).find(cdn => req.url.includes(cdn));
  if (cdnUrl) {
    debugProtocol.cdn(`Overwrite: ${cdnUrl} -> ${cdnMap[cdnUrl]}`);
    req.url = cdnMap[cdnUrl];
  }
  next();
});

// Create mock analytics
app.get('/js/lib/analytics-mock.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    // Mock Google Analytics
    window.ga = function() { console.log('Analytics:', ...arguments); };
    window.ga.create = function() { return function() {}; };
    window.ga.send = function() { return function() {}; };
  `);
});

// Cache control middleware
const cacheControl = (req, res, next) => {
  // Cache everything for 1 day
  res.setHeader('Cache-Control', 'public, max-age=86400');
  debugProtocol.cache(`Caching: ${req.url}`);
  next();
};

// Serve static files with aggressive caching
app.use('/js/lib', express.static(path.join(__dirname, '../client/js/lib'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      // Cache JS files for 1 week
      res.setHeader('Cache-Control', 'public, max-age=604800');
      debugProtocol.cache(`JS Cache: ${filePath}`);
    }
  }
}));

// Serve CSS files with proper MIME type
app.use('/css', express.static(path.join(__dirname, '../client/css'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=604800');
      debugProtocol.cache(`CSS Cache: ${filePath}`);
    }
  }
}));

// Cache all static assets
app.use(express.static(path.join(__dirname, '../client'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.use('/dist', express.static(path.join(__dirname, '../dist'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Handle jQuery.js requests
app.get('/jQuery.js', (req, res) => {
  res.redirect('https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js');
});

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Start HTTP server
app.listen(port, () => {
  debugProtocol.success(`Server running at http://localhost:${port}`);
}); 