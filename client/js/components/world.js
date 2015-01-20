module.exports = function() {
    var _ = require("underscore");
    var Wall = require("../models/walls/walls");
    
    function Level(worldEntity) {
        this.worldEntity = worldEntity;
        this.height = 2000;
        this.maxHeight = 8000;
        this.lowestKnownY = 0;
        this.number = 1;
        this.entities = [];
        this.traps = [];
        this.walls = [];
        this.walls.push(new Wall($("#game"), 3000, $(window).width() / 3, Wall.Direction.LEFT, "transparent"));
        this.walls.push(new Wall($("#game"), 3000, $(window).width() / 3, Wall.Direction.RIGHT, "transparent"));
        //a list of entities and their isactive and shouldrender states before the level was deactivated
        this.entityMetaData = [];
        
        this.doorDown = worldEntity.engine.createEntity({tags: ['vision-candidate', 'level-door']});
        this.doorDown.addComponent('level-door', {
            position: {
                x: 0,
                y: this.maxHeight - 500
            }
        });
        this.doorDown.data.level = this;
        
        this.activate = function() {
            var player = this.worldEntity.engine.findEntityByTag('player')[0];
            if (player) player.data.position.y = 0;
            
            this.worldEntity.data.currentLevel = this;
            
            setHeight.call(this);
            
            this.walls.forEach(function(wall) {
                wall.$wallContainer.show();
            });
            
            this.entityMetaData.forEach(function(metadata) {
                metadata.entity.isActive = metadata.isActive;
                metadata.entity.shouldRender = metadata.shouldRender;
            });
        }
        
        this.deactivate = function() {
            var player = this.worldEntity.engine.findEntityByTag('player')[0];
            
            if (this.worldEntity.data.currentLevel == this) {
                this.worldEntity.data.currentLevel = null;
            }
            
            this.walls.forEach(function(wall) {
                wall.$wallContainer.hide();
            });
            
            this.entityMetaData = this.entities.filter(function(entity) {
                return !!player ? entity != player : true;
            }).map(function(entity) {
               return {
                   isActive: entity.isActive,
                   shouldRender: entity.shouldRender,
                   entity: entity
               };
            });
        }
        
        this.update = function(dt) {
            var self = this;
            var previousLowest = self.lowestKnownY;
            this.entities.forEach(function(entity) {
                if (entity.data.position.y + 1000 > self.lowestKnownY) {
                    self.lowestKnownY = entity.data.position.y + 1000;
                }
            });
            
            if (this.lowestKnownY > previousLowest) {
                if (this.height > this.lowestKnownY || this.height >= this.maxHeight) {
                    return;
                }
                
                this.height = this.lowestKnownY;
                if (this.height > this.maxHeight) {
                    this.height = this.maxHeight;
                }
                
                _.filter(this.walls, function(wall) { return wall.direction == Wall.Direction.LEFT || wall.direction == Wall.Direction.RIGHT; })
                    .forEach(function(wall) {
                        wall.setMinLength(self.height);
                    });
                    
                setHeight.call(this);
            }
        }
        
        function setHeight() {
            var $game = $("#game"),
                hidden = $game.css("display") === 'none';
            $game.show();
            $game.css("height", this.height + "px");
            if (hidden) {
                $game.hide();
            }
        }
    }
    
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
            if (!component.worldEntity) component.player = entity.engine.findEntityByTag(['player'])[0];
            
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
                
                while (!this.levels.length || this.levels.length < (data.level - 1)) {
                    this.levels.push(new Level(entity));
                }
                
                if (this.currentLevel) {
                    this.currentLevel.deactivate();
                }
                
                this.levels[data.level - 1].activate();
                this.level = data.level;
            },
            'go-down': function(entity, data) {
                if (this.level == 25) {
                    return;
                }
                
                entity.sendMessage('go-to-level', {
                    level: this.level + 1
                })
            },
            'go-up': function(entity, data) {
                if (this.level == 1) {
                    return;
                }
                
                entity.sendMessage('go-to-level', {
                    level: this.level - 1
                })
            }
        }
    };
}