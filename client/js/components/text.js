module.exports = function() {
    return {
        _: {
            textColor: '#eee'
        },
        requiredComponents: ['html-renderer'],
        onAdd: function(entity, component) {
            this.$text = $("<span style='line-height: 30px; vertical-align:middle;' data-health-display='" + entity.id + "'></span>").appendTo(this.$el);
            entity.sendMessage('set-text-color', { textColor: this.textColor });
        },
        update: function(dt, entity, component) {
            if (!this.world) {
                this.world = entity.engine.findEntityByTag('world');
            } else {
                if (this.levelSetsColor && this.textColor !== this.world.data.currentLevel.colors.font.toHexString()) {
                    entity.sendMessage('set-text-color', { textColor: this.world.data.currentLevel.colors.font.toHexString() })
                }
            }
        },
        messages: {
            'set-text-color': function(entity, data) {
                if (data.textColor) {
                    this.textColor = data.textColor;
                    this.$text.css({'color': data.textColor});
                }
            }
        }
    };
}