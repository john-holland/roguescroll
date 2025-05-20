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
        this.stateVersion = 0;
        this.lastSentState = new Map();
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
        const entity = this.engine.entities.get(data.entityId);
        if (!entity) return;

        // Apply delta update
        if (data.delta) {
            Object.entries(data.delta).forEach(([key, value]) => {
                entity.setData(key, value);
            });
        }

        // Notify components of state update
        entity.sendMessage('state-update', {
            version: data.version,
            timestamp: data.timestamp,
            delta: data.delta
        });
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
        if (!this.isConnected || !this.roomId) return;

        try {
            await this.icpManager.sendMessage('state-update', {
                roomId: this.roomId,
                state: state
            });
        } catch (error) {
            console.error('Failed to send state update:', error);
            this.handleDisconnect();
        }
    }

    processPendingActions() {
        while (this.pendingActions.length > 0) {
            const action = this.pendingActions.shift();
            action();
        }
    }

    updateEntityState(entity, state) {
        // Get current state
        const currentState = this.getEntityState(entity);
        
        // Calculate delta
        const delta = this.calculateDelta(currentState, state);
        
        // Only send if there are changes
        if (Object.keys(delta).length > 0) {
            // Update version
            this.stateVersion++;
            
            // Add metadata
            const stateUpdate = {
                version: this.stateVersion,
                timestamp: Date.now(),
                entityId: entity.id,
                delta: delta
            };
            
            // Store last sent state
            this.lastSentState.set(entity.id, currentState);
            
            // Send update
            this.sendState(stateUpdate);
        }
    }

    calculateDelta(oldState, newState) {
        const delta = {};
        
        // Compare each property
        for (const key in newState) {
            if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
                delta[key] = newState[key];
            }
        }
        
        return delta;
    }

    getEntityState(entity) {
        const state = {
            isActive: entity.isActive,
            shouldRender: entity.shouldRender
        };

        // Get state from all components that support state synchronization
        entity.components.getList().forEach(component => {
            if (component.syncState) {
                Object.assign(state, component.getState(entity));
            }
        });

        return state;
    }

    destroy() {
        this.handleDisconnect();
        super.destroy();
    }
}

// Register the component
RogueScroll.registerComponent(NetworkManager); 