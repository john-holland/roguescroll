function Component(name, options) {
    this.name = name;
    this.requiredComponents = options.requiredComponents || [];
    this.defaultData = (options.defaultData || options._) || {};
    this.entities = new ListMap();
    this.messageHandlers = { };
    this._onAdd = options.onAdd || null;
    this._onRemove = options.onRemove || null;
    this._update = options.update || null;
    this._aggregateUpdate = options.aggregateUpdate || null;
    this._render = options.render || null;
}

Component.prototype.handleMessage = function (name, callback) {
    this.messageHandlers[name] = callback;
}

Component.prototype.update = function(callback) {
    this._update = callback;
}

Component.prototype.onAdd = function(callback) {
    this._onAdd = callback;
}

Component.prototype.onRemove = function(callback) {
    this._onRemove = callback;
}

Component.prototype.render = function(callback) {
    this._render = callback;
}

Component.prototype.aggregateUpdate = function(callback) {
    this._aggregateUpdate = callback;
}

function Entity(id, engine) {
    this.id = id;
    
    this.data = { };
    this.components = new ListMap();
    this.engine = engine;
    this.isActive = true;
    this.shouldRender = true;
}

Entity.prototype.addComponent = function(name, defaultData) {
    this.engine.addComponentToEntity(this, name, defaultData || { });
}

Entity.prototype.removeComponent = function(name) {
    this.engine.removeComponent(this, name);
}

Entity.prototype.update = function(dt) {
    if (!(this.isActive && this.shouldRender)) {
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

function Engine(game) {
    var self = this,
    nextFreeId = 0;
    
    this.isDestroyed = false;
    this.game = game;
    this.isPlaying = false;
    this.entities = new ListMap();
    this.components = new ListMap();
    
    this.play = function() {
        self.isPlaying = true;
        self._stopUpdate = animLoop(self.update);
    }
    
    this.pause = function() {
        self.isPlaying = false;
        if (self._stopUpdate) {
            self._stopUpdate();
            self._stopUpdate = null;
        }
    }
    
    this.createEntity = function(options) {
        var _options = options || {},
        preExistingId = _options.preExistingId || null,
        tags = _options.tags || [],
        id = nextFreeId;
        if (typeof preExistingId === 'number' && !isNaN(preExistingId)) {
            if (preExistingId >= nextFreeId) {
                nextFreeId = preExistingId + 1;
            }
            
            id = preExistingId;
        } else {
            nextFreeId++;
        }
        
        var entity = new Entity(id, self);
        self.entities.add(id, entity);
        entity.tags = tags.slice();
        entity.isActive = typeof _options.isActive !== 'undefined' ? options.isActive : true;
        entity.shouldRender = typeof _options.shouldRender !== 'undefined' ? options.shouldRender : true;
        
        return entity;
    }
    
    this.registerComponent = function(name, options) {
        var component = new Component(name, options);
        component.engine = self;
        
        self.components.add(name, component);
        
        return component;
    }
    
    this.initialize = function(components, entities) {
        //register all components
        _.pairs(components).forEach(function(pair) {
            var name = pair[0];
            var component = pair[1];
            
            var registeredComponent = self.registerComponent(name, _.omit(component, ['messages']));
            
            if (component.messages) {
                _.pairs(component.messages).forEach(function(pair) {
                    registeredComponent.handleMessage(pair[0], pair[1]);
                });
            }
        });
        
        //add all entities with their components
        entities.forEach(function(entity) {
            var registeredEntity = self.createEntity(_.omit(entity, ['components']));
            
            _.pairs(entity.components || {}).forEach(function(pair) {
                registeredEntity.addComponent(pair[0], pair[1] || {});
            });
        });
        
        //send the init message
        self.entities.getList().forEach(function(entity) {
            entity.sendMessage("init", {});
        });
    }
    
    this.destroy = function() {
        if (self.isDestroyed) {
            throw new Error("Engine already destroyed.");
        }
        
        self.entities.forEach(function(entity) {
            entity.sendMessage("on-destroy");
        });
        
        self.stopUpdate();
        self.entities.clear();
        delete self.entities;
        self.components.clear();
        delete self.components;
    }
    
    this.update = function(dt, gameTime) {
        if (self.isDestroyed) {
            throw new Error("Engine destroyed, cannot update.");
        }
        
        var components = self.components.getList(),
        entities = self.entities.getList(),
        i = 0;
        self.dt = dt;
        self.gameTime = gameTime;
        
        for (i = 0; i < components.length; i++) {
            var component = components[i];
            if (component._aggregateUpdate) component._aggregateUpdate.call(component, dt, component.entities, component);
        }
        
        for (i = 0; i < entities.length; i++) {
            entities[i].update(dt);
        }   
        
        return true;
    }
    
    function addComponent(entity, componentName) {
        var component = self.components.get(componentName);
        if (!component) {
            throw new Error("Cannot find component for name: " + componentName);
        }
        
        if (!entity.components.get(componentName)) {
            entity.components.add(componentName, component);
            component.entities.add(entity.id, entity);
            //take a deep clone of the component defaults, enforces onAdd mentality and should help prevent reference sharing accross entities.
            var defaultDataClone = JSONfn.clone(component.defaultData);
            for (var prop in defaultDataClone) {
                if (defaultDataClone.hasOwnProperty(prop) && !(prop in entity.data)) {
                    entity.data[prop] = defaultDataClone[prop];
                }
            }
            
            component.requiredComponents.forEach(function(component) {
                addComponent(entity, component);
            });
            
            if (typeof component._onAdd === 'function') {
                component._onAdd.call(entity.data, entity, component);
            }
        }
    }
    
    this.addComponentToEntity = function(entity, componentName, defaultData) {
        var defaultDataClone = JSONfn.clone(defaultData);
        for (var prop in defaultDataClone) {
            if (defaultDataClone.hasOwnProperty(prop)) {
                entity.data[prop] = defaultDataClone[prop];
            }
        }
        
        addComponent(entity, componentName);
    }
    
    this.removeComponent = function(entity, componentName) {
        var component = entity.components.get(componentName);
        
        if (!component) {
            return;
        }
        
        component.entities.remove(entity);
        
        if (typeof component._onRemove === 'function') {
            component._onRemove.call(entity.data, entity, component);
        }
        
        entity.components.remove(componentName);
    }
    
    this.findEntityByTag = function(tag) {
        
        return _.filter(self.entities.getList(), function(entity) {
            return entity.tags.indexOf(tag) > -1;
        });
    }
}

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