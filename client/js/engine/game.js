define(['engine/entity', 'engine/system', 'engine/renderer'], function(Entity, System, Renderer) {
    return function Game() {
        var self = this;
        
        this.entities = [];
        this.systems = [];
        this.renderer = new Renderer();
        
        this.addEntity = function(entity) {
            this.entities.push(entity);
            return entity;
        };
        
        this.removeEntity = function(entity) {
            var index = this.entities.indexOf(entity);
            if (index !== -1) {
                this.entities.splice(index, 1);
            }
        };
        
        this.addSystem = function(system) {
            this.systems.push(system);
            return system;
        };
        
        this.removeSystem = function(system) {
            var index = this.systems.indexOf(system);
            if (index !== -1) {
                this.systems.splice(index, 1);
            }
        };
        
        this.update = function(delta) {
            this.systems.forEach(function(system) {
                system.update(delta);
            });
        };
        
        this.render = function() {
            this.renderer.render(this.entities);
        };
        
        return this;
    };
});