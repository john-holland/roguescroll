
define(function() {
    var Spell = require('../models/spell'),
        ListMap = require('../util/listmap'),
        _ = require('../util/underscore');
    
    return function Spell() {
        return {
            _: function() {
                return {
                    model: null,
                    sensedSoFar: new ListMap(),
                    hitCount: 0,
                    maxHitCount: 5,
                    senseTag: 'enemy',
                    'z-index': 900
                };
            },
            tags: ['spell'],
            requiredComponents: ['movement', 'glyphicon-renderer', 'animation', 'sensor'],
            onAdd: function(entity, component) {
                this.maxHitCount = _.random(3, 6);
                entity.sendMessage('go-to', {
                    x: this.position.x,
                    y: this.position.y + 500 + (entity.engine.findEntityByTag('player').data.speed * 4),
                    callback: function() {
                        entity.sendMessage('animate', { animation: 'explode', callback: function() {
                            entity.destroy();
                        }});
                    }
                });
            },
            update: function(dt, entity, component) {
                
            },
            messages: {
                sensed: function(entity, data) {
                    var self = this;
                    if (data.sensed) {
                        data.sensed.forEach(function(sensed) {
                            if (sensed === entity.engine.findEntityByTag('player') || self.sensedSoFar.getList().length >= self.maxHitCount) {
                                return;
                            }
                            
                            if (!self.sensedSoFar.contains(sensed.id)) {
                                self.sensedSoFar.add(sensed.id, sensed);
                                sensed.sendMessage('damage', { amount: self.model.getDamage() * 3 });
                            }
                            
                            if (self.sensedSoFar.getList().length >= self.maxHitCount) {
                                entity.sendMessage('animate', { animation: 'explode', callback: function() {
                                    entity.destroy();
                                }});
                            }
                        })
                        
                    }
                },
                attack: function(entity, data) {
                    entity.sendMessage('go-to', {
                        target: data.target,
                        callback: function() {
                            entity.sendMessage('damage', {
                                amount: this.model.getDamage()
                            })
                        }
                    })
                }
            }
        };
    };
})