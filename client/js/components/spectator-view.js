define(function() {
    var _ = require('../util/underscore');
    
    return function SpectatorView() {
        return {
            _: {
                isStaticPosition: true,
                positionAnchor: 'bottom-right',
                'z-index': 1000,
                spectatorOpacity: 0.3,
                maxSpectators: 3,
                spectatorSpacing: 60,
                spectators: []
            },
            requiredComponents: ['html-renderer'],
            onAdd: function(entity, component) {
                // Create container for spectator views
                this.$container = $('<div class="spectator-container" style="position: fixed; bottom: 20px; right: 20px;"></div>').appendTo(this.$el);
                
                // Subscribe to ICP actor updates
                this.icpManager = entity.engine.findEntityByTag('icp-manager');
                if (this.icpManager) {
                    this.icpManager.on('actor-update', this.handleActorUpdate.bind(this));
                }
            },
            handleActorUpdate: function(data) {
                const { actorId, state, owner } = data;
                
                // Don't show our own player
                if (actorId === this.icpManager.data.playerId) {
                    return;
                }
                
                // Update or create spectator view
                let spectator = this.spectators.find(s => s.actorId === actorId);
                
                if (!spectator) {
                    // Create new spectator view if we haven't reached the limit
                    if (this.spectators.length >= this.maxSpectators) {
                        return;
                    }
                    
                    spectator = {
                        actorId,
                        owner,
                        $el: $('<div class="spectator" style="position: relative; margin-bottom: 10px;"></div>'),
                        $icon: $('<span class="glyphicons glyphicons-user" style="font-size: 24px;"></span>'),
                        $level: $('<span class="level-indicator" style="position: absolute; bottom: -5px; right: -5px; font-size: 12px; background: rgba(0,0,0,0.5); padding: 2px 4px; border-radius: 3px;"></span>')
                    };
                    
                    spectator.$el.append(spectator.$icon).append(spectator.$level);
                    this.$container.append(spectator.$el);
                    this.spectators.push(spectator);
                }
                
                // Update spectator state
                spectator.$el.css({
                    opacity: this.spectatorOpacity,
                    transform: `translateY(${this.spectators.indexOf(spectator) * this.spectatorSpacing}px)`
                });
                
                // Update level indicator based on Y position
                const level = Math.floor(state.position.y / 1000) + 1;
                spectator.$level.text(`Level ${level}`);
                
                // Update icon position to match player's relative position
                const relativeY = (state.position.y % 1000) / 1000;
                spectator.$icon.css({
                    transform: `translateY(${relativeY * 20}px)`
                });
            },
            destroy: function() {
                if (this.icpManager) {
                    this.icpManager.off('actor-update', this.handleActorUpdate);
                }
                this.$container.remove();
            }
        };
    };
}); 