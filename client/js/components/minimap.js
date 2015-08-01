define(function() {
    return function Minimap() {
        return {
            _: {
                isStaticPosition: true,
                'z-index': 1000000
            },
            requiredComponents: ['glyphicon-renderer'],
            onAdd: function(entity, component) {
                this.$el.click(function() {
                    if (!!entity.data.player) {
                        entity.data.player.sendMessage('set-scroll-to-position');
                    }
                });
                
                this.$el.css('cursor', 'pointer');
            },
            update: function(dt, entity, component) {
                if (!this.world) {
                    this.world = entity.engine.findEntityByTag('world');
                } else if (!this.player) {
                    this.player = entity.engine.findEntityByTag('player');
                    entity.sendMessage('change-icon', {icon: this.player.data.icon });
                } else {
                    this.position.y = (this.player.data.position.y / this.world.data.currentLevel.maxHeight) * $(window).height()
                    this.position.x = $(window).width() - 50;
                }
            }
        };
    }
})