define(function() {
    var _ = require('../util/underscore'),
        ImmutableV2 = require('../util/V2').ImmutableV2,
        Chance = require('../util/chance'),
        chance = new Chance(),
        Spell = require('../models/spell');
    
    return function Trap() {
        return {
            _: function() {
                return {
                    triggerRange: 50,
                    hasTriggered: false,
                    senseRange: 100,
                    senseTag: 'player',
                    damage: '2d6',
                    icon: 'heat',
                    sineWaveSpeed: _.random(3000, 2000),
                    unlockProximity: 0.8, // 80% proximity required to unlock
                    currentProximity: 0,
                    disarmerPosition: {
                        x: 0,
                        y: 0
                    }
                };
            },
            requiredComponents: ['sensor', 'glyphicon-renderer', 'sine-wave-movement', 'world-entity', 'animation'],
            onAdd: function(entity, component) {
                this.spellModel = Spell.createRandom();
                entity.sendMessage('change-icon', { icon: this.spellModel.icon });
                
                // Initialize disarmer position with some random offset
                this.disarmerPosition = {
                    x: this.position.x + _.random(-30, 30),
                    y: this.position.y + _.random(-30, 30)
                };
            },
            onRemove: function(entity, component) {
                if (this.disarmer) {
                    this.disarmer.destroy();
                }
            },
            update: function(dt, entity, component) {
                if (this.disarmer && this.disarmer.data.$el) {
                    // Calculate proximity based on mouse position
                    const mousePos = {
                        x: this.disarmer.data.$el.data('mouseX') || 0,
                        y: this.disarmer.data.$el.data('mouseY') || 0
                    };
                    
                    const distance = ImmutableV2.distanceBetween(
                        this.disarmerPosition,
                        mousePos
                    );
                    
                    // Calculate proximity percentage (1 = exact match, 0 = far away)
                    this.currentProximity = Math.max(0, 1 - (distance / 100));
                    
                    // Update disarmer appearance based on proximity
                    if (this.currentProximity >= this.unlockProximity) {
                        this.disarmer.data.$el.addClass('unlock-ready');
                        if (!this.disarmer.data.$el.data('unlockShown')) {
                            this.showMessage('Trap can be disarmed!', 'success');
                            this.disarmer.data.$el.data('unlockShown', true);
                        }
                    } else {
                        this.disarmer.data.$el.removeClass('unlock-ready');
                        this.disarmer.data.$el.data('unlockShown', false);
                    }
                }
            },
            showMessage: function(message, type) {
                if (this.disarmer && this.disarmer.data.$el) {
                    const $message = $(`<div class="trap-message ${type}">${message}</div>`);
                    this.disarmer.data.$el.append($message);
                    setTimeout(() => $message.fadeOut(() => $message.remove()), 2000);
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
                            sensedEntity.sendMessage('damage', { amount: self.spellModel.getDamage() + chance.integer({max: self.level.number, min: 0}), hitRoll: hit });
                            self.hasTriggered = true;
                            entity.sendMessage('animate', { animation: 'explode', callback: function() {
                                entity.destroy();
                            }});
                        }
                    });
                    
                    if (!this.disarmer && data.sensed.length) {
                        this.disarmer = entity.engine.createEntity({ tags: ['trap-disarmer'] })
                                            .addComponent('glyphicon-renderer', { icon: 'warning-sign' })
                                            .addComponent('mounted', { 
                                                mountId: entity.id, 
                                                offset: { 
                                                    x: this.disarmerPosition.x - this.position.x,
                                                    y: this.disarmerPosition.y - this.position.y
                                                } 
                                            });
                        this.disarmer.sendMessage('init');
                        
                        // Add mouse tracking
                        this.disarmer.data.$el.on('mousemove', function(e) {
                            const rect = this.getBoundingClientRect();
                            $(this).data('mouseX', e.clientX - rect.left);
                            $(this).data('mouseY', e.clientY - rect.top);
                        });
                        
                        // Add unlock on proximity
                        this.disarmer.data.$el.on('mouseover', function() {
                            if (self.currentProximity >= self.unlockProximity) {
                                entity.engine.findEntityByTag('spell-container').sendMessage('add-spell', { spell: self.spellModel });
                                entity.destroy();
                            }
                        });
                        
                        // Add visual feedback
                        this.disarmer.data.$el.css({
                            'cursor': 'pointer',
                            'transition': 'all 0.3s ease',
                            'opacity': '0.7'
                        });
                    }
                }
            }
        };
    };
});