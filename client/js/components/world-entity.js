module.exports = function() {
    return {
        _: {
            worldEntity: null,
            level: null
        },
        tags: ['world-entity'],
        update: function(dt, entity, component) {
            if (!this.level) {
                //we don't do this in onAdd, because we want to be able to make them while the currentLevel is being constructed,
                // and doing it this way avoids any unnecessary uglieness at the cost of an extra update
                this.worldEntity = entity.engine.findEntityByTag('level-manager');
                
                entity.sendMessage('switch-to-current-level');
            }
        },
        onRemove: function(entity, component) {
            if (this.level) {
                this.level.entities.splice(this.level.entities.indexOf(entity), 1);
            }
        },
        messages: {
            'switch-to-current-level': function(entity, data) {
                if (this.level && this.level.entities.indexOf(entity) > -1) {
                    this.level.entities.splice(this.level.entities.indexOf(entity), 1);
                }
                
                if (this.worldEntity.data.currentLevel.entities.indexOf(entity) < 0) {
                    this.worldEntity.data.currentLevel.entities.push(entity);
                }
                
                this.level = this.worldEntity.data.currentLevel;
            }
        }
    };
}