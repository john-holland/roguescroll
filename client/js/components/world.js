module.exports = function() {
    var _ = require("underscore"),
        Wall = require("../models/walls/walls"),
        Level = require("../models/level");
    
    return {
        _: {
            level: null,
            currentLevel: null,
            levels: [],
            maxLevel: 25
        },
        requiredComponents: ["position"],
        onAdd: function(entity, component) {
            if (!component.worldEntity) component.worldEntity = entity.engine.components.get('world-entity');
            if (!component.player) component.player = entity.engine.findEntityByTag('player');
            
            entity.sendMessage("go-to-level", { level: 1 });
        },
        update: function(dt, entity, component) {
            if (this.currentLevel) this.currentLevel.update(dt);
        },
        messages: {
            "go-to-level": function(entity, data) {
                //check if the level to go to exists, and if not, create the interveening levels.
                // also check if the level is < 0 or > max levels, bail if so
                if (data.level < 1 || data.level > this.maxLevel) {
                    return;
                }
                
                while (!this.levels.length || this.levels.length < data.level) {
                    this.levels.push(new Level(entity, this.levels.length + 1));
                }
                
                if (this.currentLevel) {
                    this.currentLevel.deactivate();
                }
                var previousLevel = this.level;
                this.levels[data.level - 1].activate(data.direction);
                this.level = data.level;
                
                entity.engine.findEntitiesByTag('level-change-subscriber').forEach(function(entity) {
                    entity.sendMessage('level-change', { level: data.level, previousLevel: previousLevel });
                });
            },
            'go-down': function(entity, data) {
                if (this.level == 25) {
                    return;
                }
                
                entity.sendMessage('go-to-level', {
                    level: this.level + 1,
                    direction: 'above'
                })
            },
            'go-up': function(entity, data) {
                if (this.level == 1) {
                    return;
                }
                
                entity.sendMessage('go-to-level', {
                    level: this.level - 1,
                    direction: 'below'
                })
            }
        }
    };
}