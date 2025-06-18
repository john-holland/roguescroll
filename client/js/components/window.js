define(function() {
    var _ = require('../util/underscore');
    
    return function Window() {
        return {
            _: {
                isStaticPosition: true,
                'z-index': 1000,
                title: 'Window',
                width: 300,
                height: 400,
                position: {
                    x: 50,
                    y: 50
                },
                isDraggable: true,
                isResizable: true,
                isMinimized: false,
                isMaximized: false,
                originalPosition: null,
                originalSize: null
            },
            requiredComponents: ['html-renderer'],
            onAdd: function(entity, component) {
                this.$window = $('<div class="window" style="position: fixed; background: rgba(0,0,0,0.8); border: 1px solid #444; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>');
                this.$titleBar = $('<div class="window-title" style="padding: 5px; background: #333; border-bottom: 1px solid #444; cursor: move; display: flex; justify-content: space-between; align-items: center;"></div>');
                this.$title = $('<span class="window-title-text"></span>');
                this.$controls = $('<div class="window-controls"></div>');
                this.$minimize = $('<button class="window-minimize" style="background: none; border: none; color: #fff; cursor: pointer;">_</button>');
                this.$maximize = $('<button class="window-maximize" style="background: none; border: none; color: #fff; cursor: pointer;">□</button>');
                this.$close = $('<button class="window-close" style="background: none; border: none; color: #fff; cursor: pointer;">×</button>');
                this.$content = $('<div class="window-content" style="padding: 10px; height: calc(100% - 30px); overflow: auto;"></div>');
                
                this.$controls.append(this.$minimize, this.$maximize, this.$close);
                this.$titleBar.append(this.$title, this.$controls);
                this.$window.append(this.$titleBar, this.$content);
                this.$el.append(this.$window);
                
                // Initialize window state
                this.updateWindowState();
                
                // Set up event handlers
                if (this.isDraggable) {
                    this.setupDragging();
                }
                
                if (this.isResizable) {
                    this.setupResizing();
                }
                
                this.$minimize.click(() => this.toggleMinimize());
                this.$maximize.click(() => this.toggleMaximize());
                this.$close.click(() => entity.destroy());
            },
            updateWindowState: function() {
                this.$title.text(this.title);
                
                if (this.isMinimized) {
                    this.$window.css({
                        height: '30px',
                        width: this.width + 'px'
                    });
                    this.$content.hide();
                } else if (this.isMaximized) {
                    this.$window.css({
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0
                    });
                    this.$content.show();
                } else {
                    this.$window.css({
                        width: this.width + 'px',
                        height: this.height + 'px',
                        top: this.position.y + 'px',
                        left: this.position.x + 'px'
                    });
                    this.$content.show();
                }
            },
            setupDragging: function() {
                let isDragging = false;
                let startX, startY, startLeft, startTop;
                
                this.$titleBar.mousedown((e) => {
                    if (e.target === this.$titleBar[0] || e.target === this.$title[0]) {
                        isDragging = true;
                        startX = e.clientX;
                        startY = e.clientY;
                        startLeft = parseInt(this.$window.css('left'));
                        startTop = parseInt(this.$window.css('top'));
                    }
                });
                
                $(document).mousemove((e) => {
                    if (isDragging) {
                        this.position.x = startLeft + (e.clientX - startX);
                        this.position.y = startTop + (e.clientY - startY);
                        this.updateWindowState();
                    }
                });
                
                $(document).mouseup(() => {
                    isDragging = false;
                });
            },
            setupResizing: function() {
                const $resizer = $('<div class="window-resizer" style="position: absolute; right: 0; bottom: 0; width: 10px; height: 10px; cursor: se-resize;"></div>');
                this.$window.append($resizer);
                
                let isResizing = false;
                let startX, startY, startWidth, startHeight;
                
                $resizer.mousedown((e) => {
                    isResizing = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(this.$window.css('width'));
                    startHeight = parseInt(this.$window.css('height'));
                });
                
                $(document).mousemove((e) => {
                    if (isResizing) {
                        this.width = Math.max(200, startWidth + (e.clientX - startX));
                        this.height = Math.max(200, startHeight + (e.clientY - startY));
                        this.updateWindowState();
                    }
                });
                
                $(document).mouseup(() => {
                    isResizing = false;
                });
            },
            toggleMinimize: function() {
                this.isMinimized = !this.isMinimized;
                this.isMaximized = false;
                this.updateWindowState();
            },
            toggleMaximize: function() {
                if (!this.isMaximized) {
                    this.originalPosition = { ...this.position };
                    this.originalSize = { width: this.width, height: this.height };
                }
                
                this.isMaximized = !this.isMaximized;
                this.isMinimized = false;
                this.updateWindowState();
            },
            messages: {
                'set-title': function(entity, data) {
                    this.title = data.title;
                    this.updateWindowState();
                },
                'set-content': function(entity, data) {
                    this.$content.html(data.content);
                }
            }
        };
    };
}); 