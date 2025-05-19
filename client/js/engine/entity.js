define(function() {
    var ListMap = require('../util/listmap');
    var dataClone = require('../util/data-clone');
    
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
    
    Object.defineProperty(Entity.prototype, 'isActive', {
        get: function() { return this.engine.updateEntities.contains(this.id); },
        set: function(value) {
            if (value) {
                this.engine.updateEntities.add(this.id, this);
            } else {
                this.engine.updateEntities.remove(this.id);
            }
        }
    });
    
    Object.defineProperty(Entity.prototype, 'shouldRender', {
        get: function() { return this.engine.renderEntities.contains(this.id); },
        set: function(value) {
            if (value) {
                this.engine.renderEntities.add(this.id, this);
            } else {
                this.engine.renderEntities.remove(this.id);
            }
        }
    });
    
    Entity.prototype.addComponent = function(name, defaultData) {
        this.engine.addComponentToEntity(this, name, defaultData || { });
        return this;
    }
    
    Entity.prototype.removeComponent = function(name) {
        this.engine.removeComponent(this, name);
    }
    
    Entity.prototype.destroy = function() {
        this.components.getList().forEach(function(component) {
            component._onRemove && component._onRemove.call(this.data);
        }.bind(this));
        this.sendMessage('destroyed');
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
        
        var components = this.components.getList();
        
        for (var i = 0; i < components.length; i++) {
            var component = components[i],
                update = component._update;
            
            if (this.isActive && update) update.call(this.data, dt, this, component);
        }
    }
    
    Entity.prototype.render = function(dt) {
        if (this.__isDestroyed) {
            return;
        }
        
        var components = this.components.getList();
        
        for (var i = 0; i < components.length; i++) {
            var component = components[i],
                render = component._render;
            
            if (this.shouldRender && render) render.call(this.data, dt, this, component);
        }
    }
    
    //todo: implement async messages with timeouts
    Entity.prototype.sendMessage = function(message, data, timeoutMS, callback) {
        var metadata = { 
            handled: false, 
            results: [], 
            version: data?.version || '1.0.0',
            timestamp: Date.now()
        };
        
        // Clone the data before passing to handlers
        var clonedData = dataClone.clone(data);
        
        this.components.getList().forEach(function(component) {
            if (message in component.messageHandlers) {
                if (!component.isVersionCompatible(metadata.version)) {
                    console.warn(`Component ${component.name} version ${component.version} is not compatible with message version ${metadata.version}`);
                    return;
                }
                
                metadata.handled = true;
                var result = component.messageHandlers[message].call(this.data, this, clonedData, component);
                if (typeof result !== 'undefined') {
                    metadata.results.push(dataClone.clone(result));
                }
            }
        }.bind(this));
        
        return metadata;
    }
    
    return Entity;
});