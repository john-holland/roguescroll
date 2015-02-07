module.exports = function GlyphiconRenderer() {
    return {
        _: {
            icon: "user",
            iconColor: '#eee',
            levelSetsIconColor: true,
            htmlTemplateFactory: function(entity, component) {
                return "<span style='position: " + (entity.data.isStaticPosition ? "fixed" : "absolute") + 
                    "; display: block; overflow: visible; color: " +  (entity.data.iconColor || "black") + "' class='go-faster-hack glyphicons glyphicons-"
                    + entity.data.icon + "' data-entity-id='" + entity.id + "'></span>";
            }
        },
        requiredComponents: ['html-renderer'],
        onAdd: function(entity, component) {
            if (this.$el) {
                this.$el.remove();
            }
            this.$el = $(this.htmlTemplateFactory(entity, component)).appendTo(this.selector);
        },
        update: function(dt, entity, component) {
            if (!this.world) {
                this.world = entity.engine.findEntityByTag('world');
            } else {
                if (this.levelSetsIconColor && this.iconColor !== this.world.data.currentLevel.colors.font.toHexString()) {
                    entity.sendMessage('set-icon-color', { color: this.world.data.currentLevel.colors.accent.toHexString() });
                }
            }
        },
        messages: {
            'change-icon': function(entity, data) {
                if (!data.icon) {
                    throw new Error("Must receive icon to render!");
                }
                if (this.$el) {
                    this.$el.removeClass("glyphicons-" + this.icon);
                    this.icon = data.icon;
                    this.$el.addClass("glyphicons-" + data.icon);
                }
            },
            'set-icon-color': function(entity, data) {
                if (data.color) {
                    this.$el.css({"color": data.color});
                    this.iconColor = data.color;
                }
            }
        }
    };
};