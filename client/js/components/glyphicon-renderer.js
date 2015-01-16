module.exports = function GlyphiconRenderer() {
    return {
        _: {
            icon: "user",
            selector: "#game",
            renderBuffer: {
                position: {
                    x: 0,
                    y: 0,
                },
                rotation: 0,
                width: 0,
                height: 0,
                shouldRender: false
            }
        },
        requiredComponents: ['position'],
        onAdd: function(entity, component) {
            $(this.selector).append($("<span style='position: " + (this.isStaticPosition ? "fixed" : "absolute") + 
                "; display: block; overflow: visible; color: " +  (this.iconColor || "black") + "' class='go-faster-hack glyphicons glyphicons-"
                + this.icon + "' data-entity-id='" + entity.id + "'></span>"));
            
            this.$renderedIcon = $("span[data-entity-id='" + entity.id + "']");
            this.$renderedIcon.transition({
                left: this.position.x - (this.size.width / 2) + (this.xOccupancyOffset || 0),
                top: this.position.y - (this.size.height / 2),
                "font-size": ((this.size.height + this.size.width) / 2) + "px",
                width: this.size.width,
                height: this.size.height,
                duration: 0,
                queue: false,
                rotate: (this.rotation !== null) ? this.rotation + 'deg' : null
            });
            
            if (!entity.shouldRender) {
                this.$renderedIcon.hide();
            }
        },
        update: function(dt, entity, component) {
            if (this.renderBuffer.shouldRender != entity.shouldRender) {
                if (entity.shouldRender && !this.renderBuffer.shouldRender && this.$renderedIcon) {
                    this.$renderedIcon.show();
                } else if (!entity.shouldRender && this.renderBuffer.shouldRender && this.$renderedIcon) {
                    this.$renderedIcon.hide();
                }
            }
            
            this.renderBuffer.shouldRender = entity.shouldRender;
        },
        render: function(dt, entity, component) {
            //todo: I should really use transform here, as it produces much smoother movement.
            //todo: Use the current scroll of the screen as the 'active rectangle' to choose what to render.
            if (this.renderBuffer.position.x == this.position.x &&
                this.renderBuffer.position.y == this.position.y &&
                this.renderBuffer.width == this.size.width &&
                this.renderBuffer.height == this.size.height) {
                return;
            }
            
            if (this.renderBuffer.shouldRender != entity.shouldRender) {
                if (entity.shouldRender && !this.renderBuffer.shouldRender) {
                    this.$renderedIcon.show();
                } else if (!entity.shouldRender && this.renderBuffer.shouldRender) {
                    this.$renderedIcon.hide();
                }
            }
            
            if (entity.shouldRender) {
                this.$renderedIcon.transition({ 
                    left: this.position.x - (this.size.width / 2),
                    top: this.position.y - (this.size.height / 2),
                    "font-size": ((this.size.height + this.size.width) / 2) + "px",
                    duration: 0,
                    queue: false,
                    rotate: (this.rotation !== null) ? this.rotation + 'deg' : null
                });   
            }
            
            this.renderBuffer.position.x = this.position.x;
            this.renderBuffer.position.y = this.position.y;
            this.renderBuffer.width = this.size.width;
            this.renderBuffer.height = this.size.height;
            this.renderBuffer.shouldRender = entity.shouldRender;
        },
        onRemove: function(entity, component) {
            if (this.$renderedIcon) {
                this.$renderedIcon.remove();
            }
        },
        messages: {
            show: function(entity, data) {
                if (entity.data.$renderedIcon) {
                    entity.data.$renderedIcon.show();
                }
                entity.shouldRender = true;
            },
            hide: function(entity, data) {
                if (entity.data.$renderedIcon) {
                    entity.data.$renderedIcon.hide();
                }
                entity.shouldRender = false;
            },
            'change-icon': function(entity, data) {
                if (!data.icon) {
                    throw new Error("Must receive icon to render!");
                }
                if (entity.data.$renderedIcon) {
                    entity.data.$renderedIcon.removeClass("glyphicons-" + entity.data.icon);
                    entity.data.icon = data.icon;
                    entity.data.$renderedIcon.addClass("glyphicons-" + data.icon);
                }
            },
            'set-icon-color': function(entity, data) {
                if (data.color) this.$renderedIcon.css("color", data.color);
            },
            'set-position-type': function(entity, data) {
                if (data.isStaticPosition) {
                    this.$renderedIcon.css("position", "fixed");
                } else {
                    this.$renderedIcon.css("position", "absolute");
                }
            }
        }
    };
};