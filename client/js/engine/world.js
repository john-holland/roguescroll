import ListMap from '../util/listmap';
import Entity from './entity';

class World {
    constructor() {
        this.entities = new ListMap();
        this.updateEntities = new ListMap();
        this.renderEntities = new ListMap();
        this.components = {};
        this.systems = [];
    }

    addEntity(id) {
        var entity = new Entity(id, this);
        this.entities.add(id, entity);
        return entity;
    }

    removeEntity(id) {
        var entity = this.entities.get(id);
        if (entity) {
            entity.destroy();
        }
    }

    getEntity(id) {
        return this.entities.get(id);
    }

    addComponent(name, component) {
        this.components[name] = component;
    }

    addComponentToEntity(entity, name, defaultData) {
        var component = this.components[name];
        if (!component) {
            throw new Error('Component ' + name + ' not found');
        }

        var instance = Object.create(component);
        instance.data = defaultData || {};
        instance.entity = entity;

        if (component.requiredComponents) {
            component.requiredComponents.forEach(function(required) {
                if (!entity.hasComponent(required)) {
                    throw new Error('Required component ' + required + ' not found on entity');
                }
            });
        }

        entity.components.add(name, instance);

        if (component.onAdd) {
            component.onAdd.call(instance);
        }

        return instance;
    }

    removeComponent(entity, name) {
        var component = entity.components.get(name);
        if (component && component.onRemove) {
            component.onRemove.call(component);
        }
        entity.components.remove(name);
    }

    addSystem(system) {
        this.systems.push(system);
    }

    update(dt) {
        this.systems.forEach(function(system) {
            if (system.update) {
                system.update(dt);
            }
        });
    }

    render(dt) {
        this.systems.forEach(function(system) {
            if (system.render) {
                system.render(dt);
            }
        });
    }

    destroyEntity(entity) {
        this.entities.remove(entity.id);
        this.updateEntities.remove(entity.id);
        this.renderEntities.remove(entity.id);
    }
}

export default World; 