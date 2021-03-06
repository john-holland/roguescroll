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
            
            if (Math.abs(this.position.y - this.player.data.position.y) < this.senseDistance) {
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
                var coffee = entity.engine.createEntity({});
                coffee.addComponent('glyphicon-renderer', {
                    icon: 'coffee-cup'
                })
                .addComponent('mounted', {
                    mountTarget: entity,
                    offset: {
                        x: -50, y: 50
                    }
                })
                .addComponent('animation', {
                    animation: 'drink'
                });
                
                var previousSenseDistance = this.senseDistance;
                this.senseDistance = 0;
                this.onCoffeeBreak = true;
                setTimeout(function() {
                    coffee.destroy();
                    entity.data.senseDistance = previousSenseDistance;
                    entity.data.sineWaveMovementEnabled = true;
                    entity.data.onCoffeeBreak = false;
                    setTimeout(function() {
                        entity.sendMessage('coffee-break');
                    }, chance.integer({ min: 20000, max: 80000 }))    
                }, chance.integer({ min: 10000, max: 20000 }))
            }
        }
    };
}