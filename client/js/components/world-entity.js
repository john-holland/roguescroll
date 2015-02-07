module.exports = function() {
    return {
        _: {
            worldEntity: null,
            level: null
        },
        update: function(dt, entity, component) {
            if (!this.level) {
                //we don't do this in onAdd, because we want to be able to make them while the currentLevel is being constructed,
                // and doing it this way avoids any unnecessary uglieness at the cost of an extra update
                this.worldEntity = entity.engine.findEntityByTag("world");
                
                if (this.worldEntity.data.currentLevel.entities.indexOf(entity) < 0) {
                    this.worldEntity.data.currentLevel.entities.push(entity);
                }
                
                this.level = this.worldEntity.data.currentLevel;
            }
        },
        onRemove: function(entity, component) {
            if (this.level) {
                this.level.entities.splice(this.level.entities.indexOf(entity), 1);
            }
        }
    };
}