const express = require('express');
const path = require('path');
const GameServer = require('./websocket');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Create WebSocket server
const gameServer = new GameServer(8080);

// Start HTTP server
app.listen(port, () => {
    console.log(`Game server running at http://localhost:${port}`);
    console.log(`WebSocket server running at ws://localhost:8080`);
}); 