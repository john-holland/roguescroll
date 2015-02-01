define(function() {
    var _ = require("underscore"),
        ImmutableV2 = require("../util/V2").ImmutableV2,
        Chance = require("../util/chance"),
        chance = new Chance();
    
    return function Trap() {
        return {
            _: {
                triggerRange: 50,
                hasTriggered: false,
                senseRange: 100,
                senseTag: 'player',
                damage: '2d6',
                icon: 'heat'
            },
            requiredComponents: ['sensor', 'glyphicon-renderer', 'sine-wave-movement', 'world-entity', 'animation'],
            onRemove: function(entity, component) {
                if (this.disarmer) {
                    this.disarmer.destroy();
                }
            },
            messages: {
                sensed: function(entity, data) {
                    var self = this;
                    if (this.hasTriggered) {
                        return;
                    }
                    
                    data.sensed.forEach(function(sensedEntity) {
                        if (!self.hasTriggered && ImmutableV2.distanceBetween(self.position, sensedEntity.data.position) < self.triggerRange) {
                            var hit = _.random(10, 25 - sensedEntity.data.character.skills / 4);
                            sensedEntity.sendMessage('damage', { amount: chance.rpg(self.damage, {sum:true}) + chance.integer({max: self.level.number, min: 0}), hitRoll: hit });
                            self.hasTriggered = true;
                            entity.sendMessage('animate', { animation: 'attack-up', callback: function() {
                                entity.destroy();
                            }});
                        }
                    });
                    
                    if (!this.disarmer && data.sensed.length) {
                        this.disarmer = entity.engine.createEntity({ tags: ['trap-disarmer'] })
                                            .addComponent('glyphicon-renderer', { icon: 'warning-sign' })
                                            .addComponent('mounted', { mountId: entity.id, offset: { x: 50, y: 50 } });
                        this.disarmer.sendMessage('init');
                        this.disarmer.data.$el.css("cursor", "pointer");
                        this.disarmer.data.$el.click(function() {
                            entity.destroy();
                        })
                    }
                }
            }
        };
    };
});