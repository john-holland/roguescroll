module.exports = function() {
    return {
        _: {
            isStaticPosition: true,
            icon: "clock",
            position: {
                x: 50,
                y: 250
            },
            metricsFunction: null,
            metricsTarget: null,
            metricsTargetTag: ""
        },
        requiredComponents: ["text"],
        onAdd: function(entity, component) {
            this.position.y = $(window).height() - 50;
            if (this.metricsTargetTag) {
                this.metricsTarget = entity.engine.findEntityByTag(this.metricsTargetTag)[0];
            }
        },
        update: function(dt, entity, component) {
            if (typeof this.metricsFunction !== 'function') {
                this.$text.text("gameTime " + (entity.engine.gameTime / 1000).toFixed(4));
                return;
            }
            
            this.$text.text(this.metricsFunction(entity, dt, this.metricsTarget));
        }
    };
}