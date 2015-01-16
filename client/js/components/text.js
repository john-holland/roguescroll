module.exports = function() {
    return {
        requiredComponents: ['glyphicon-renderer'],
        onAdd: function(entity, component) {
            this.$text = $("<span style='line-height: 30px; vertical-align:middle;' data-health-display='" + entity.id + "'></span>").appendTo(this.$renderedIcon);
        }
    };
}