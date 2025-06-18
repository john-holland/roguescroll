import ListMap from '../util/listmap';
import dataClone from '../util/data-clone';

// Add data access layer
const EntityDataAccess = {
    get: function(entity, key) {
        if (!entity._data) {
            entity._data = {};
        }
        return entity._data[key];
    },
    
    set: function(entity, key, value) {
        if (!entity._data) {
            entity._data = {};
        }
        const oldValue = entity._data[key];
        entity._data[key] = value;
        
        // Notify components of data change
        entity.sendMessage('data-changed', {
            key: key,
            oldValue: oldValue,
            newValue: value
        });
        
        return value;
    },
    
    has: function(entity, key) {
        return entity._data && key in entity._data;
    }
};

class Entity {
    constructor(id, world) {
        this.id = id;
        this.world = world;
        this.components = new ListMap();
        this.data = {};
        this.tags = new Set();
        this._isActive = true;
        this._shouldRender = true;
        //entities for which we will send all messages we recieve.
        this.forwardMessages = [];
        // does not forward init message by default.
        this.forwardInit = false;
    }
    
    get isActive() {
        return this.world.updateEntities.contains(this.id);
    }
    
    set isActive(value) {
        if (value) {
            this.world.updateEntities.add(this.id, this);
        } else {
            this.world.updateEntities.remove(this.id);
        }
    }
    
    get shouldRender() {
        return this.world.renderEntities.contains(this.id);
    }
    
    set shouldRender(value) {
        if (value) {
            this.world.renderEntities.add(this.id, this);
        } else {
            this.world.renderEntities.remove(this.id);
        }
    }
    
    addComponent(name, defaultData) {
        var component = this.world.components[name];
        if (!component) {
            throw new Error('Component ' + name + ' not found');
        }

        var instance = Object.create(component);
        instance.data = defaultData || {};
        instance.entity = this;

        if (component.requiredComponents) {
            component.requiredComponents.forEach(function(required) {
                if (!this.hasComponent(required)) {
                    throw new Error('Required component ' + required + ' not found on entity ' + JSON.stringify(this.tags));
                }
            }.bind(this));
        }

        this.components.set(name, instance);

        if (component.onAdd) {
            component.onAdd.call(instance);
        }

        return this;
    }
    
    removeComponent(name) {
        this.world.removeComponent(this, name);
    }
    
    destroy() {
        if (this.__isDestroyed) return;
        
        this.components.forEach((component) => {
            if (component.onRemove) {
                component.onRemove();
            }
        });
        
        this.sendMessage('destroyed');
        this.world.destroyEntity(this);
        this.__isDestroyed = true;
    }
    
    isDestroyed() {
        return !!this.__isDestroyed;
    }
    
    update(dt) {
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
    
    render(dt) {
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
    sendMessage(message, data, timeoutMS, callback) {
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

    // Add data access methods to prototype
    getData(key) {
        return EntityDataAccess.get(this, key);
    }

    setData(key, value) {
        return EntityDataAccess.set(this, key, value);
    }

    hasData(key) {
        return EntityDataAccess.has(this, key);
    }

    hasComponent(name) {
        return this.components.has(name);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    addTag(tag) {
        this.tags.add(tag);
        return this;
    }

    removeTag(tag) {
        this.tags.delete(tag);
        return this;
    }

    hasTag(tag) {
        return this.tags.has(tag);
    }

    clone() {
        const clone = new Entity(this.id + '_clone', this.world);
        clone.data = dataClone(this.data);
        
        this.components.forEach((component, name) => {
            clone.addComponent(name, dataClone(component.data));
        });
        
        this.tags.forEach(tag => clone.addTag(tag));
        
        return clone;
    }
}

export default Entity;