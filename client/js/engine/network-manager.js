class NetworkManager extends Component {
    constructor() {
        super('network-manager', {
            version: '1.0.0',
            minVersion: '1.0.0'
        });
        
        this.icpManager = null;
        this.roomId = null;
        this.playerId = null;
        this.isConnected = false;
        this.pendingActions = [];
    }

    init() {
        // Get ICP manager reference
        this.icpManager = this.entity.engine.findEntityByTag('icp-manager');
        if (!this.icpManager) {
            console.error('ICP Manager not found');
            return;
        }
    }

    async connect() {
        if (this.isConnected) return;

        try {
            // Wait for ICP manager to initialize
            while (!this.icpManager.data.isInitialized) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Generate unique player ID
            this.playerId = crypto.randomUUID();
            
            // Claim player actor
            const success = await this.icpManager.sendMessage('actor-claim', {
                actorId: this.playerId
            });

            if (!success) {
                throw new Error('Failed to claim player actor');
            }

            this.isConnected = true;
            this.processPendingActions();
            
            // Subscribe to shared actor updates
            this.entity.on('actor-update', this.handleActorUpdate.bind(this));
            
        } catch (error) {
            console.error('Failed to connect:', error);
            this.handleDisconnect();
        }
    }

    handleDisconnect() {
        this.isConnected = false;
        
        // Release player actor
        if (this.playerId) {
            this.icpManager.sendMessage('actor-release', {
                actorId: this.playerId
            });
        }
        
        this.playerId = null;
        this.roomId = null;
    }

    async joinRoom(roomId) {
        if (!this.isConnected) {
            this.pendingActions.push(() => this.joinRoom(roomId));
            return;
        }

        this.roomId = roomId;
        
        // Submit room join objective
        await this.icpManager.sendMessage('submit-objective', {
            objective: {
                id: `join_room_${roomId}`,
                description: `Join room ${roomId}`,
                reward: 0,
                deadline: null,
                completed: false,
                completedBy: null
            }
        });
    }

    handleActorUpdate(data) {
        const { actorId, state, owner } = data;
        
        // Update local actor state
        const entity = this.entity.engine.findEntityById(actorId);
        if (entity) {
            entity.data.position = state.position;
            entity.data.health = state.health;
            entity.data.maxHealth = state.maxHealth;
        }
    }

    async sendAction(action) {
        if (!this.isConnected) {
            this.pendingActions.push(() => this.sendAction(action));
            return;
        }

        // Update actor state through ICP
        await this.icpManager.sendMessage('actor-update', {
            actorId: this.playerId,
            state: {
                position: this.entity.data.position,
                health: this.entity.data.health,
                maxHealth: this.entity.data.maxHealth,
                owner: this.icpManager.data.authToken,
                lastUpdate: Date.now()
            }
        });
    }

    async sendState(state) {
        if (!this.isConnected) {
            this.pendingActions.push(() => this.sendState(state));
            return;
        }

        // Update actor state through ICP
        await this.icpManager.sendMessage('actor-update', {
            actorId: this.playerId,
            state: {
                ...state,
                owner: this.icpManager.data.authToken,
                lastUpdate: Date.now()
            }
        });
    }

    processPendingActions() {
        while (this.pendingActions.length > 0) {
            const action = this.pendingActions.shift();
            action();
        }
    }

    destroy() {
        this.handleDisconnect();
        super.destroy();
    }
}

// Register the component
RogueScroll.registerComponent(NetworkManager); 