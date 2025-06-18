define(function() {
    var Chance = require('../util/chance'),
        chance = new Chance();
        
    return function Trap() {
        return {
            _: {
                icon: 'warning-sign',
                damage: '2d6',
                disarmDifficulty: 15,
                detectionRange: 100,
                isDisarmed: false,
                isDetected: false,
                disarmAttempts: 0,
                maxDisarmAttempts: 3
            },
            requiredComponents: ['position', 'glyphicon-renderer', 'sensor'],
            onAdd: function(entity, component) {
                // Set up sensor for player detection
                this.senseTag = 'player';
                this.senseRange = this.detectionRange;
                
                // Initialize trap state
                entity.sendMessage('change-icon', { icon: this.icon });
                entity.sendMessage('set-icon-color', { color: '#ff0000' });
            },
            update: function(dt, entity, component) {
                if (this.isDisarmed) {
                    return;
                }
                
                // Check if player is in range
                if (this.isDetected && !this.isDisarmed) {
                    var player = entity.engine.findEntityByTag('player');
                    if (player && Math.abs(player.data.position.y - this.position.y) < 50) {
                        // Trigger trap
                        this.triggerTrap(entity, player);
                    }
                }
            },
            messages: {
                'sensed': function(entity, data) {
                    if (this.isDisarmed || this.isDetected) {
                        return;
                    }
                    
                    // Check if player is in range
                    var player = data.sensed.find(function(e) { return e.tags.includes('player'); });
                    if (player) {
                        this.isDetected = true;
                        entity.sendMessage('animate', { animation: 'pulse' });
                        
                        // Notify music system
                        entity.engine.findEntityByTag('music').sendMessage('trap-nearby');
                    }
                },
                'disarm': function(entity, data) {
                    if (this.isDisarmed || !this.isDetected) {
                        return false;
                    }
                    
                    this.disarmAttempts++;
                    
                    // Calculate disarm chance based on player skills
                    var player = entity.engine.findEntityByTag('player');
                    var disarmRoll = chance.rpg('1d20', { sum: true }) + 
                                   (player.data.character.skills || 0);
                    
                    if (disarmRoll >= this.disarmDifficulty) {
                        // Successfully disarmed
                        this.isDisarmed = true;
                        entity.sendMessage('animate', { 
                            animation: 'explode',
                            callback: function() {
                                entity.destroy();
                            }
                        });
                        
                        // Notify music system
                        entity.engine.findEntityByTag('music').sendMessage('trap-disarmed');
                        return true;
                    } else if (this.disarmAttempts >= this.maxDisarmAttempts) {
                        // Failed too many times, trigger trap
                        this.triggerTrap(entity, player);
                    }
                    
                    return false;
                }
            },
            triggerTrap: function(entity, player) {
                if (this.isDisarmed) {
                    return;
                }
                
                this.isDisarmed = true;
                
                // Calculate damage
                var damage = chance.rpg(this.damage, { sum: true });
                
                // Apply damage to player
                player.sendMessage('damage', { 
                    amount: damage,
                    isCritical: chance.bool({ likelihood: 20 })
                });
                
                // Visual feedback
                entity.sendMessage('animate', { 
                    animation: 'explode',
                    callback: function() {
                        entity.destroy();
                    }
                });
            }
        };
    };
});