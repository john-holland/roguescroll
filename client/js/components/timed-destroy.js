module.exports = function() {
    return {
        _: {
            spawned: null,
            destroyTimer: 5000
        },
        onAdd: function(entity, component) {
            this.spawned = entity.engine.gameTime;
        },
        update: function(entity, component) {
            if (entity.engine.gameTime - this.spawned > this.destroyTimer) {
                entity.destroy();
            }
        }
    };
}