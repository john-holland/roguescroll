define(function() {
    var _ = require("underscore"),
        Wall = require("../models/walls/walls"),
        tinycolor = require("../util/tinycolor"),
        tinyColors = _.values(tinycolor.names),
        $ = require("jquery"),
        Chance = require("../util/chance"),
        chance = new Chance();
 
    function Level(worldEntity, number) {
        var self = this;
        this.worldEntity = worldEntity;
        this.active = false;
        this.height = 2000;
        this.maxHeight = 8000;
        this.lowestKnownY = 0;
        this.number = number;
        
        if (number === 1) {
            this.colors = {
                background: tinycolor("#333"),
                font: tinycolor("#eee"),
                accent: tinycolor("#eee")
            };
        } else {
            var colors = tinycolor(tinyColors[_.random(0, tinyColors.length)]).triad();
            var fontColor = tinycolor.mostReadable(colors[0], [colors[1], colors[2]]);
            var accent = _.find(colors, function(color) {return color != fontColor && color != colors[0]; });
            
            while (!tinycolor.isReadable(colors[0], fontColor)) {
                colors = tinycolor(tinyColors[_.random(0, tinyColors.length)]).splitcomplement();
                fontColor = tinycolor.mostReadable(colors[0], [colors[1], colors[2]]);
                accent = _.find(colors, function(color) {return color != fontColor && color != colors[0]; });
            }
            
            this.colors = {
                background: colors[0],
                font: fontColor,
                accent: accent
            };
        }
        
        this.entities = [];
        this.traps = [];
        this.walls = [];
        this.walls.push(new Wall($("#game"), 3000, $(window).width() / 3, Wall.Direction.LEFT, this.colors.accent.toHexString()));
        this.walls.push(new Wall($("#game"), 3000, $(window).width() / 3, Wall.Direction.RIGHT, this.colors.accent.toHexString()));
        //a list of entities and their isactive and shouldrender states before the level was deactivated
        this.entityMetaData = [];
        
        this.enemySpawner = worldEntity.engine.createEntity({ tags:["enemy-spawner"] })
                                .addComponent('enemy-spawner', { });
        this.enemySpawner.sendMessage('init');
        this.entities.push(this.enemySpawner);

        if (this.number < 25) {
            this.doorDown = worldEntity.engine.createEntity({tags: ['vision-candidate', 'level-door']})
                                .addComponent('level-door', { size: { width: 40, height: 40 }});
            this.doorDown.sendMessage('init', {});
            this.doorDown.data.position.y = this.maxHeight - 500;
            this.doorDown.data.level = this;
            this.doorDown.sendMessage('hide');
            this.entities.push(this.doorDown);
        }
        
        if (number > 1) {
            this.doorUp = worldEntity.engine.createEntity({tags: ['vision-candidate', 'level-door']})
                                .addComponent('level-door', { leads: 'up', size: { width: 40, height: 40 } });
            this.doorUp.sendMessage('init', {});
            this.doorUp.data.position.y = 700;
            this.doorUp.data.level = this;
            this.doorUp.sendMessage('hide');
            this.entities.push(this.doorUp);
        }
        
                
        +function() {
            for (var i = 0; i < _.random(1, Math.ceil(number / 3)); i++) {
                var trapY = _.random('doorUp' in self ? self.doorUp.data.position.y + 300 : 600,
                                     'doorDown' in self ? self.doorDown.data.position.y - 300 : self.maxHeight - 400);
                console.log('spawned trap at: ' + trapY);
                var trap = worldEntity.engine.createEntity({ tags: ['trap', 'vision-candidate'] })
                            .addComponent('trap', {icon: chance.pick(['fire', 'electricity', 'birthday-cake', 'bomb', 'heat', 'cardio'])});
                trap.data.position.y = trapY;
                trap.data.level = self;
                trap.sendMessage('init');
                self.entities.push(trap);
            }
        }();
        
        this.activate = function(enteredFrom) {
            var player = this.worldEntity.engine.findEntityByTag('player')[0];
            if (enteredFrom == 'below') {
                if (player) player.data.position.y = this.doorDown.data.position.y - 150;
            } else {
                if (player && this.number > 1) player.data.position.y = 1000;
                else if (player) player.data.position.y = 0;
            }
            
            this.worldEntity.data.currentLevel = this;
            
            setHeight.call(this);
            
            this.walls.forEach(function(wall) {
                wall.$wallContainer.show();
            });
            
            this.entityMetaData.forEach(function(metadata) {
                metadata.entity.isActive = metadata.isActive;
                
                if (metadata.shouldRender) {
                    metadata.entity.sendMessage('show');
                }
                
                metadata.entity.shouldRender = metadata.shouldRender;
            });
            
            this.walls.forEach(function(wall) {
                wall.$wallContainer.find(".wall-segment").animate({
                    'border-top-color': self.colors.accent.toHexString()
                }, 1000);
            });
            
            $("#game").animate({
                'background-color': this.colors.background.toHexString()
            }, 1000);
            
            $("#menu").css({'background': 'linear-gradient(to bottom, black 60%, '+ this.colors.background.toHexString() +' 90%)'});
            
            if (player) {
                player.sendMessage('set-scroll-to-position');
            }
                
            this.active = true;
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
                var metadata = {
                   isActive: entity.isActive,
                   shouldRender: entity.shouldRender,
                   entity: entity
               };
               
               entity.isActive = false;
               entity.sendMessage('hide');
               entity.shouldRender = false;
               return metadata;
            });
            
            this.active = false;
        }
        
        this.update = function(dt) {
            var self = this;
            var previousLowest = self.lowestKnownY;
            this.entities.forEach(function(entity) {
                if ('position' in entity.data && entity.data.position.y + 3000 > self.lowestKnownY) {
                    self.lowestKnownY = entity.data.position.y + 3000;
                }
            });
            
            if (!this.player) {
                this.player = this.worldEntity.engine.findEntityByTag('player')[0];
            }
            
            if (this.player && this.player.data.position.y + 1000 > this.lowestKnownY) {
                this.lowestKnownY = this.player.data.position.y + 3000;
            }
            
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