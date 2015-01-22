define(function() {
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
        this.doorDown.addComponent('level-door', {});
        this.doorDown.sendMessage('init', {});
        this.doorDown.data.position.y = this.maxHeight - 500;
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
    
    return Level;
})