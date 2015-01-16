module.exports = function() {
    return {
        _: {
            isStaticPosition: true,
            icon: "heart",
            healthTarget: null,
            position: {
                x: 50,
                y: 100
            },
            rotate: 45,
            destroyOnTargetDestroy: true
        },
        requiredComponents: ['text'],
        onAdd: function(entity, component) {
            this.healthTarget = this.player = entity.engine.findEntityByTag("player")[0];
        },
        update: function(dt, entity, component) {
            if (this.destroyOnTargetDestroy && this.healthTarget.isDestroyed()) {
                entity.destroy();
            }
            this.$text.text("Health " + this.healthTarget.data.health);
        },
        messages: {
            "mount": function(entity, data) {
                if (data.target && data.target.data && data.target.data.health) this.healthTarget = data.target;
            }
        }
    };
}