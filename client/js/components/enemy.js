var Chance = require('../util/chance'),
    chance = new Chance();
var _ = require('../util/underscore');

module.exports = function() {
    return {
        _: {
            icon: 'skull',
            baseMiss: 10,
            side: 'baddies',
            senseDistance: 150,
            patrolTopTarget: {
                x: 0,
                y: 0
            },
            patrolBottomTarget: {
                x: 0,
                y: 0
            },
            size: {
                height: 40,
                width: 40
            },
            patrolTo: 'top',
            isPatrolling: false,
            damage: '1d6',
            playerAttackOffset: 60,
            sineWaveRange: 50,
            sineWaveSpeed: 500,
            onCoffeeBreak: false
        },
        onAdd: function(entity, component) {
            setTimeout(function() { entity.sendMessage('coffee-break') }, chance.integer({min: 5000, max: 10000}));
        },
        update: function(dt, entity, component) {
            if (!this.player) {
                return;
            }
            
            if (this.onCoffeeBreak) {
                this.sineWaveMovementEnabled = false;
                this.xOffsetOverride = $(document).width() / 5;
                return;
            }
            
            var wasInRange = Math.abs(this.position.y - this.player.data.position.y) < this.senseDistance;
            var isInRange = Math.abs(this.position.y - this.player.data.position.y) < this.senseDistance;
            
            // Send music events based on player detection
            if (isInRange && !wasInRange) {
                entity.engine.findEntityByTag('music').sendMessage('enemy-spotted-player');
            } else if (!isInRange && wasInRange) {
                entity.engine.findEntityByTag('music').sendMessage('enemy-lost-player');
            }
            
            if (isInRange) {
                entity.isPatrolling = false;
                this.target.y = this.player.data.position.y + this.playerAttackOffset;
                this.sineWaveMovementEnabled = false;
            } else {
                //partrol.
                //todo: Implement smoke break
                if (!this.isPatrolling) {
                    this.sineWaveMovementEnabled = true;
                    this.isPatrolling = true;
                    entity.sendMessage('go-to', {
                        x: this.patrolTo === 'top' ? this.patrolTopTarget.x : this.patrolBottomTarget.x,
                        y: this.patrolTo === 'top' ? this.patrolTopTarget.y : this.patrolBottomTarget.y,
                        callback: function() {
                            if (entity.data.isPatrolling) {
                                entity.data.isPatrolling = false;
                                if (entity.data.patrolTo === 'bottom') {
                                    entity.data.patrolTo = 'top';
                                } else {
                                    entity.data.patrolTo = 'bottom';
                                }
                            }
                        },
                        stopAfterArrival: true
                    });
                }
            }
        },
        requiredComponents: ['health', 'movement', 'world-entity', 'combatant', 'glyphicon-renderer', 'sine-wave-movement', 'floating-combat-text', 'animation', 'drops-loot'],
        messages: {
            'init': function(entity, data) {
                this.player = entity.engine.findEntityByTag('player');
                this.world = entity.engine.findEntityByTag('world');
            },
            'targets-in-range': function(entity, data) {
                if (!data.targets || !data.targets.length) {
                    return;
                }
                
                if (this.onCoffeeBreak || entity.tags.indexOf('boss') > -1) {
                    return false;
                }
                
                entity.sendMessage('animate', { animation: 'attack-up' });
                var hit = _.random(0, 15 - this.player.data.character.skills / 4);
                
                if (hit < this.player.data.baseMiss) {
                    return true;
                }
                
                data.targets[0].sendMessage('damage', {amount: chance.rpg(this.damage, {sum:true}), hitRoll: hit});
                return true;
            },
            'coffee-break': function(entity, data) {
                if (data.withPlayer) {
                    // Enemy smokes - they'll return with player
                    entity.data.onBreak = true;
                    entity.data.originalPosition = {...entity.data.position};
                    entity.data.originalBehavior = {...entity.data.behavior};
                    
                    // Move to coffee break position
                    entity.data.position.x = entity.engine.findEntityByTag('player').data.position.x + 50;
                    entity.data.position.y = -100; // Above the player
                    
                    // Change appearance to show smoking
                    entity.sendMessage('change-icon', {icon: 'smoking'});
                } else {
                    // Enemy doesn't smoke - they stay in place
                    entity.data.onBreak = true;
                    entity.data.originalPosition = {...entity.data.position};
                    entity.data.originalBehavior = {...entity.data.behavior};
                    
                    // Stop moving
                    entity.data.behavior = 'idle';
                }
            },
            'return-from-break': function(entity, data) {
                if (entity.data.onBreak) {
                    entity.data.onBreak = false;
                    
                    if (entity.data.willReturn) {
                        // Return to original position
                        entity.data.position = {...entity.data.originalPosition};
                        entity.data.behavior = {...entity.data.originalBehavior};
                        
                        // Change appearance back
                        entity.sendMessage('change-icon', {icon: entity.data.originalIcon});
                        
                        // Attack player with message
                        const player = entity.engine.findEntityByTag('player');
                        entity.sendMessage('attack', {target: player});
                        entity.sendMessage('say', {text: "I can't believe you don't smoke!"});
                    }
                }
            }
        }
    };
}