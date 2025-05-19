const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class GameServer {
    constructor(port = 8080) {
        this.wss = new WebSocket.Server({ port });
        this.rooms = new Map();
        this.players = new Map();
        
        this.wss.on('connection', this.handleConnection.bind(this));
    }

    handleConnection(ws) {
        const playerId = uuidv4();
        this.players.set(playerId, {
            ws,
            room: null,
            state: {}
        });

        ws.on('message', (message) => this.handleMessage(playerId, message));
        ws.on('close', () => this.handleDisconnect(playerId));
    }

    handleMessage(playerId, message) {
        const data = JSON.parse(message);
        const player = this.players.get(playerId);

        switch (data.type) {
            case 'join':
                this.handleJoin(playerId, data.roomId);
                break;
            case 'state':
                this.broadcastState(player.room, playerId, data.state);
                break;
            case 'action':
                this.handleAction(player.room, playerId, data.action);
                break;
        }
    }

    handleJoin(playerId, roomId) {
        const player = this.players.get(playerId);
        
        // Create room if it doesn't exist
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                players: new Set(),
                state: {
                    entities: new Map(),
                    version: '1.0.0'
                }
            });
        }

        const room = this.rooms.get(roomId);
        room.players.add(playerId);
        player.room = roomId;

        // Send current room state to new player
        player.ws.send(JSON.stringify({
            type: 'init',
            state: room.state
        }));

        // Notify other players
        this.broadcastToRoom(roomId, {
            type: 'player_joined',
            playerId
        });
    }

    handleDisconnect(playerId) {
        const player = this.players.get(playerId);
        if (player && player.room) {
            const room = this.rooms.get(player.room);
            room.players.delete(playerId);
            
            this.broadcastToRoom(player.room, {
                type: 'player_left',
                playerId
            });

            // Clean up empty rooms
            if (room.players.size === 0) {
                this.rooms.delete(player.room);
            }
        }
        this.players.delete(playerId);
    }

    handleAction(roomId, playerId, action) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Apply action to room state
        this.applyAction(room, action);

        // Broadcast action to all players in room
        this.broadcastToRoom(roomId, {
            type: 'action',
            playerId,
            action
        });
    }

    applyAction(room, action) {
        // Implement state update logic here
        // This should match your game's state management
        switch (action.type) {
            case 'move':
                // Update entity position
                break;
            case 'attack':
                // Handle combat
                break;
            // Add more action types
        }
    }

    broadcastToRoom(roomId, message) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const messageStr = JSON.stringify(message);
        room.players.forEach(playerId => {
            const player = this.players.get(playerId);
            if (player && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(messageStr);
            }
        });
    }

    broadcastState(roomId, senderId, state) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Update room state
        room.state = {
            ...room.state,
            ...state,
            version: '1.0.0'
        };

        // Broadcast to all players except sender
        room.players.forEach(playerId => {
            if (playerId !== senderId) {
                const player = this.players.get(playerId);
                if (player && player.ws.readyState === WebSocket.OPEN) {
                    player.ws.send(JSON.stringify({
                        type: 'state',
                        state: room.state
                    }));
                }
            }
        });
    }
}

module.exports = GameServer; 