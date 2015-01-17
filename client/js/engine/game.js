define(function() {
    var Engine = require("./engine"),
        _ = require("../util/underscore");
    
    function Game(options) {
        var self = this;
        this.name = options.name || "";
        this.engine = new Engine(this);
        this.engine.initialize(options.components || [], options.entities || []);
        
        this.pause = function() {
            self.engine.pause();
            self.engine.entities.getList().forEach(function(entity) {
                entity.sendMessage("game-pause");
            });
        }
        
        this.play = function() {
            self.engine.play();
            self.engine.entities.getList().forEach(function(entity) {
                entity.sendMessage("game-resume");
            });
        }
        
        this.restart = function() {
            self.engine.pause();
            self.engine.destroy();
            self.engine = new Engine(self);
            self.engine.initialize(options.components, options.entities);
            self.play();
        }
    }
    
    return Game;
});