define(function() {
    //todo: explore a MVC entity architecture, include message passing and propegation.
    
    var ListMap = require('../util/listmap'),
        animLoop = require('../util/animLoop'),
        JSONfn = require('../util/JSONfn'),
        Entity = require('./entity'),
        Component = require('./component'),
        _ = require('../util/underscore');
    
    function Engine(game) {
        var self = this,
        nextFreeId = 0;
        
        this.isDestroyed = false;
        this.game = game;
        this.isPlaying = false;
        this.entities = new ListMap();
        this.updateEntities = new ListMap();
        this.renderEntities = new ListMap();
        this.components = new ListMap();
        this.entitiesToDestroy = [];
        this.gameTime = 0;
        
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
            
            // Check version compatibility with existing components
            var existingComponent = self.components.get(name);
            if (existingComponent) {
                if (!existingComponent.isVersionCompatible(component.version)) {
                    console.warn(`Component ${name} version ${component.version} is not compatible with existing version ${existingComponent.version}`);
                    return null;
                }
            }
            
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
                entity.sendMessage('init', {});
            });
        }
        
        this.destroy = function() {
            if (self.isDestroyed) {
                throw new Error('Engine already destroyed.');
            }
            
            self.entities.getList().forEach(function(entity) {
                entity.destroy();
            });
            
            self.pause();
            self.entities.clear();
            delete self.entities;
            self.components.clear();
            delete self.components;
            self.isDestroyed = true;
        }
        
        function _destroyEntity(entity) {
            entity.components.getList().forEach(function(component) {
                entity.removeComponent(component.name);
            });
            self.entities.remove(entity.id);
        }
        
        this.destroyEntity = function(entity) {
            self.entitiesToDestroy.push(entity);
        }
        
        this.update = function(dt, gameTime) {
            if (self.isDestroyed) {
                throw new Error('Engine destroyed, cannot update.');
            }
            
            var components = self.components.getList(),
                entities = self.updateEntities.getList(),
                renderEntities = self.renderEntities.getList(),
                i = 0;
                self.dt = dt;
                self.gameTime += dt;
            
            for (i = 0; i < components.length; i++) {
                var component = components[i];
                if (component._aggregateUpdate) component._aggregateUpdate.call(component, dt, component.entities, component);
            }
            
            for (i = 0; i < entities.length; i++) {
                entities[i].update(dt);
            }
            
            for (i = 0; i < renderEntities.length; i++) {
                renderEntities[i].render(dt);
            }
            
            while (self.entitiesToDestroy.length) {
                _destroyEntity(self.entitiesToDestroy.pop());
            }
            
            return true;
        }
        
        function addComponent(entity, componentName) {
            var component = self.components.get(componentName);
            if (!component) {
                throw new Error('Cannot find component for name: ' + componentName);
            }
            
            if (!entity.components.get(componentName)) {
                entity.components.add(componentName, component);
                component.entities.add(entity.id, entity);
                //take a deep clone of the component defaults, enforces onAdd mentality and should help prevent reference sharing accross entities.
                var defaultDataClone = typeof component.defaultData === 'function' ? component.defaultData() : JSONfn.clone(component.defaultData);
                for (var prop in defaultDataClone) {
                    if (defaultDataClone.hasOwnProperty(prop) && !(prop in entity.data)) {
                        entity.data[prop] = defaultDataClone[prop];
                    }
                }
                
                if (component.tags) {
                    component.tags.forEach(function(tag) {
                        if (entity.tags.indexOf(tag) < 0) {
                            entity.tags.push(tag);
                        }
                    })
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
            var defaultDataClone = defaultData;
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
            
            return _.find(self.entities.getList(), function(entity) {
                return entity.tags.indexOf(tag) > -1;
            });
        }
        
        this.findEntitiesByTag = function(tag) {
            return _.filter(self.entities.getList(), function(entity) {
                return entity.tags.indexOf(tag) > -1;
            })
        }
    }
    
    return Engine;
});