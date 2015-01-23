define(function() {
    var ListMap = require("../util/listmap");
    
    function Entity(id, engine) {
        this.id = id;
        
        this.data = { };
        this.components = new ListMap();
        this.engine = engine;
        this.isActive = true;
        this.shouldRender = true;
        //entities for which we will send all messages we recieve.
        this.forwardMessages = [];
        // does not forward init message by default.
        this.forwardInit = false;
    }
    
    Entity.prototype.addComponent = function(name, defaultData) {
        this.engine.addComponentToEntity(this, name, defaultData || { });
    }
    
    Entity.prototype.removeComponent = function(name) {
        this.engine.removeComponent(this, name);
    }
    
    Entity.prototype.destroy = function() {
        this.sendMessage("destroyed");
        this.engine.destroyEntity(this);
        this.__isDestroyed = true;
    }
    
    Entity.prototype.isDestroyed = function() {
        return !!this.__isDestroyed;
    }
    
    Entity.prototype.update = function(dt) {
        if (this.__isDestroyed) {
            return;
        }
        
        if (!this.isActive && !this.shouldRender) {
            //skip update if we're not active and we shouldn't render
            return;
        }
        
        var components = this.components.getList();
        
        for (var i = 0; i < components.length; i++) {
            var component = components[i],
                update = component._update,
                render = component._render;
            
            if (this.isActive && update) update.call(this.data, dt, this, component);
            if (this.shouldRender && render) render.call(this.data, dt, this, component);
        }
    }
    
    //todo: implement async messages with timeouts
    Entity.prototype.sendMessage = function(message, data, timeoutMS, callback) {
        
        var metadata = { handled: false, results: [] },
        self = this;
        this.components.getList().forEach(function(component) {
            if (message in component.messageHandlers) {
                metadata.handled = true;
                var result = component.messageHandlers[message].call(self.data, self, data, component);
                if (typeof result !== 'undefined') {
                    metadata.results.push(result);
                }
            }
        });
        
        return metadata;
    }
    
    return Entity;
});