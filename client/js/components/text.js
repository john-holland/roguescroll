define(function() {
    return function Text() {
        return {
            _: {
                text: '',
                textColor: '#eee',
                fontSize: '14px',
                fontFamily: 'Arial',
                textAlign: 'center',
                textShadow: 'none'
            },
            requiredComponents: ['html-renderer'],
            onAdd: function(entity, component) {
                // Create text element
                this.$text = $('<span class="text"></span>').appendTo(this.$el);
                
                // Apply initial styles
                this.$text.css({
                    'color': this.textColor,
                    'font-size': this.fontSize,
                    'font-family': this.fontFamily,
                    'text-align': this.textAlign,
                    'text-shadow': this.textShadow,
                    'display': 'block',
                    'position': 'absolute',
                    'width': '100%',
                    'height': '100%',
                    'line-height': '100%'
                });
                
                // Set initial text
                this.$text.text(this.text);
            },
            messages: {
                'set-text': function(entity, data) {
                    if (data.text !== undefined) {
                        this.text = data.text;
                        this.$text.text(data.text);
                    }
                    if (data.color) {
                        this.textColor = data.color;
                        this.$text.css('color', data.color);
                    }
                    if (data.fontSize) {
                        this.fontSize = data.fontSize;
                        this.$text.css('font-size', data.fontSize);
                    }
                    if (data.fontFamily) {
                        this.fontFamily = data.fontFamily;
                        this.$text.css('font-family', data.fontFamily);
                    }
                    if (data.textAlign) {
                        this.textAlign = data.textAlign;
                        this.$text.css('text-align', data.textAlign);
                    }
                    if (data.textShadow) {
                        this.textShadow = data.textShadow;
                        this.$text.css('text-shadow', data.textShadow);
                    }
                }
            }
        };
    };
});