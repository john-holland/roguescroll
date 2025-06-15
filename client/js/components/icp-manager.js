define(function() {
    const { Actor, HttpAgent } = require('@dfinity/agent');
    const { idlFactory } = require('../icp/roguescroll.did.js');
    const crypto = require('crypto');

    return function ICPManager() {
        return {
            _: {
                isInitialized: false,
                actor: null,
                agent: null,
                canisterId: null,
                ownedActors: new Set(),
                sharedActors: new Map(),
                authToken: null,
                sourceHash: null
            },
            requiredComponents: ['network-manager'],
            onAdd: function(entity, component) {
                this.init();
            },
            init: async function() {
                if (this.isInitialized) return;

                // Calculate source hash
                this.sourceHash = await this.calculateSourceHash();

                // Initialize ICP agent
                this.agent = new HttpAgent({
                    host: process.env.ICP_HOST || 'https://ic0.app'
                });

                // Load canister ID from environment or config
                this.canisterId = process.env.ROGUESCROLL_CANISTER_ID;
                
                // Create actor
                this.actor = Actor.createActor(idlFactory, {
                    agent: this.agent,
                    canisterId: this.canisterId
                });

                // Authenticate user
                await this.authenticate();
                
                this.isInitialized = true;
            },
            calculateSourceHash: async function() {
                // Get all script elements
                const scripts = Array.from(document.getElementsByTagName('script'));
                const sourceContent = scripts
                    .filter(script => script.src && !script.src.includes('node_modules'))
                    .map(script => script.src)
                    .join('');
                
                // Calculate SHA-384 hash
                return crypto.createHash('sha384')
                    .update(sourceContent)
                    .digest('base64');
            },
            verifySourceIntegrity: function(update) {
                if (!update.sourceHash) return false;
                return update.sourceHash === this.sourceHash;
            },
            authenticate: async function() {
                try {
                    // Request authentication from Internet Identity
                    const authResult = await this.actor.authenticate();
                    this.authToken = authResult.token;
                    
                    // Register owned actors
                    const ownedActors = await this.actor.getOwnedActors();
                    this.ownedActors = new Set(ownedActors);
                    
                    // Subscribe to shared actors
                    await this.subscribeToSharedActors();
                } catch (error) {
                    console.error('ICP Authentication failed:', error);
                }
            },
            subscribeToSharedActors: async function() {
                try {
                    // Subscribe to shared actor updates
                    await this.actor.subscribeToSharedActors((update) => {
                        this.handleSharedActorUpdate(update);
                    });
                } catch (error) {
                    console.error('Failed to subscribe to shared actors:', error);
                }
            },
            handleSharedActorUpdate: function(update) {
                // Verify source integrity
                if (!this.verifySourceIntegrity(update.state)) {
                    console.warn('Received actor update with invalid source hash');
                    return;
                }

                const { actorId, state, owner } = update;
                
                // Update shared actor state
                this.sharedActors.set(actorId, {
                    state,
                    owner
                });
                
                // Notify game engine of actor update
                this.entity.sendMessage('actor-update', {
                    actorId,
                    state,
                    owner
                });
            },
            claimActor: async function(actorId) {
                if (!this.isInitialized) return false;
                
                try {
                    const result = await this.actor.claimActor(actorId);
                    if (result.success) {
                        this.ownedActors.add(actorId);
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Failed to claim actor:', error);
                    return false;
                }
            },
            releaseActor: async function(actorId) {
                if (!this.isInitialized || !this.ownedActors.has(actorId)) return false;
                
                try {
                    const result = await this.actor.releaseActor(actorId);
                    if (result.success) {
                        this.ownedActors.delete(actorId);
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Failed to release actor:', error);
                    return false;
                }
            },
            updateActorState: async function(actorId, state) {
                if (!this.isInitialized || !this.ownedActors.has(actorId)) return false;
                
                try {
                    // Add source hash to state
                    const stateWithHash = {
                        ...state,
                        sourceHash: this.sourceHash
                    };
                    
                    const result = await this.actor.updateActorState(actorId, stateWithHash);
                    return result.success;
                } catch (error) {
                    console.error('Failed to update actor state:', error);
                    return false;
                }
            },
            submitObjective: async function(objective) {
                if (!this.isInitialized) return false;
                
                try {
                    const result = await this.actor.submitObjective(objective);
                    return result.success;
                } catch (error) {
                    console.error('Failed to submit objective:', error);
                    return false;
                }
            },
            messages: {
                'actor-claim': async function(entity, data) {
                    return await this.claimActor(data.actorId);
                },
                'actor-release': async function(entity, data) {
                    return await this.releaseActor(data.actorId);
                },
                'actor-update': async function(entity, data) {
                    return await this.updateActorState(data.actorId, data.state);
                },
                'submit-objective': async function(entity, data) {
                    return await this.submitObjective(data.objective);
                }
            }
        };
    };
}); 