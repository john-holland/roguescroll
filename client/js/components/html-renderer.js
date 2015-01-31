define(function() {
    
    return function HtmlRenderer() {
        return {
            _: {
                htmlTemplateFactory: function(entity, component) {
                    return "<span style='position: " + (entity.data.isStaticPosition ? "fixed" : "absolute") + 
                            "; display: block; overflow: visible; color: " +  (entity.data.iconColor || "black") +
                            " z-index:" + entity.data['z-index'] + ";' class='go-faster-hack glyphicons' data-entity-id='" + entity.id + "'></span>";
                },
                selector: "#game",
                'z-index': 0,
                renderBuffer: {
                    position: {
                        x: 0,
                        y: 0,
                    },
                    rotation: 0,
                    width: 0,
                    height: 0,
                    shouldRender: false
                },
                levelSetsColor: true
            },
            requiredComponents: ['position'],
            onAdd: function(entity, component) {
                this.$el = $(this.htmlTemplateFactory(entity, component)).appendTo($(this.selector));
                    
                this.$el.css({
                    left: this.position.x - (this.size.width / 2) + (this.xOccupancyOffset || 0),
                    top: this.position.y - (this.size.height / 2),
                    "font-size": ((this.size.height + this.size.width) / 2) + "px",
                    width: this.size.width === null ? 'initial' : this.size.width,
                    height: this.size.height === null ? 'initial' : this.size.height
                });
                
                this.$el.css('z-index', entity.data['z-index']);
                
                if (!entity.shouldRender) {
                    this.$el.hide();
                }
            },
            update: function(dt, entity, component) {
                if (this.renderBuffer.shouldRender != entity.shouldRender) {
                    if (entity.shouldRender && !this.renderBuffer.shouldRender && this.$el) {
                        this.$el.show();
                    } else if (!entity.shouldRender && this.renderBuffer.shouldRender && this.$el) {
                        this.$el.hide();
                    }
                }
                
                this.renderBuffer.shouldRender = entity.shouldRender;
            },
            render: function(dt, entity, component) {
                //todo: Use the current scroll of the screen as the 'active rectangle' to choose what to render.
                if (this.renderBuffer.position.x == this.position.x &&
                    this.renderBuffer.position.y == this.position.y &&
                    this.renderBuffer.width == this.size.width &&
                    this.renderBuffer.height == this.size.height) {
                    return;
                }
                
                if (entity.shouldRender) {
                    this.$el.css({ 
                        left: this.position.x - (this.size.width / 2),
                        top: this.position.y - (this.size.height / 2),
                        width: this.size.width === null ? 'initial' : this.size.width,
                        height: this.size.height === null ? 'initial' : this.size.height,
                        "font-size": ((this.size.height + this.size.width) / 2) + "px",
                        'z-index': entity.data['z-index']
                    });   
                }
                
                this.renderBuffer.position.x = this.position.x;
                this.renderBuffer.position.y = this.position.y;
                this.renderBuffer.width = this.size.width;
                this.renderBuffer.height = this.size.height;
                this.renderBuffer.shouldRender = entity.shouldRender;
            },
            onRemove: function(entity, component) {
                if (this.$el) {
                    this.$el.remove();
                }
            },
            messages: {
                show: function(entity, data) {
                    if (entity.data.$el) {
                        entity.data.$el.show(80);
                    }
                    entity.shouldRender = true;
                },
                hide: function(entity, data) {
                    if (entity.data.$el) {
                        entity.data.$el.hide(80);
                    }
                    entity.shouldRender = false;
                },
                'set-position-type': function(entity, data) {
                    if (data.isStaticPosition) {
                        this.isStaticPosition = true;
                        this.$el.css("position", "fixed");
                    } else {
                        this.$el.css("position", "absolute");
                        this.isStaticPosition = false;
                    }
                }
            }
        };
    }
})