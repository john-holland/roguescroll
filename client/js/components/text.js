module.exports = function() {
    return {
        _: {
            textColor: 'black'
        },
        requiredComponents: ['html-renderer'],
        onAdd: function(entity, component) {
            this.$text = $("<span style='line-height: 30px; vertical-align:middle;' data-health-display='" + entity.id + "'></span>").appendTo(this.$el);
            entity.sendMessage('set-text-color', { textColor: this.textColor });
        },
        messages: {
            'set-text-color': function(entity, data) {
                if (data.textColor) {
                    this.textColor = data.textColor;
                    this.$text.css('color', data.textColor);
                }
            }
        }
    };
}