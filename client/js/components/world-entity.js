module.exports = function() {
    return {
        _: {
            worldEntity: null,
            level: null
        },
        update: function(dt, entity, component) {
            if (!this.level) {
                //we don't do this in onAdd, because we want to be able to make them while the currentLevel is being constructed,
                // and doing it this way avoids any unnecessary uglieness
                this.worldEntity = entity.engine.findEntityByTag("world")[0];
                this.worldEntity.data.currentLevel.entities.push(entity);
                this.level = this.worldEntity.data.currentLevel;
            }
        },
        requiredComponents: ["movement"]
    };
}