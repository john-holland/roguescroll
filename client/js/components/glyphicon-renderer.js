module.exports = function GlyphiconRenderer() {
    return {
        _: {
            icon: "user",
            iconColor: '#eee',
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
                if (data.color) this.$el.css("color", data.color);
            }
        }
    };
};