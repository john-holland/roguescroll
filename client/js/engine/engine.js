import ListMap from '../util/listmap';
import animLoop from '../util/animLoop';
import JSONfn from '../util/JSONfn';
import Entity from './entity';
import Component from './component';
import _ from '../util/underscore';

class Engine {
    constructor(game) {
        this.isDestroyed = false;
        this.game = game;
        this.isPlaying = false;
        this.entities = new ListMap();
        this.updateEntities = new ListMap();
        this.renderEntities = new ListMap();
        this.components = new ListMap();
        this.entitiesToDestroy = [];
        this.gameTime = 0;
        this.nextFreeId = 0;
    }

    play() {
        this.isPlaying = true;
        this._stopUpdate = animLoop(this.update.bind(this));
    }

    pause() {
        this.isPlaying = false;
        if (this._stopUpdate) {
            this._stopUpdate();
            this._stopUpdate = null;
        }
    }

    createEntity(options = {}) {
        const preExistingId = options.preExistingId || null;
        const tags = options.tags || [];
        let id = this.nextFreeId;

        if (typeof preExistingId === 'number' && !isNaN(preExistingId)) {
            if (preExistingId >= this.nextFreeId) {
                this.nextFreeId = preExistingId + 1;
            }
            id = preExistingId;
        } else {
            this.nextFreeId++;
        }

        const entity = new Entity(id, this);
        this.entities.add(id, entity);
        entity.tags = tags.slice();
        entity.isActive = typeof options.isActive !== 'undefined' ? options.isActive : true;
        entity.shouldRender = typeof options.shouldRender !== 'undefined' ? options.shouldRender : true;

        return entity;
    }

    registerComponent(name, options) {
        const component = new Component(name, options);
        component.engine = this;

        // Check version compatibility with existing components
        const existingComponent = this.components.get(name);
        if (existingComponent) {
            if (!existingComponent.isVersionCompatible(component.version)) {
                console.warn(`Component ${name} version ${component.version} is not compatible with existing version ${existingComponent.version}`);
                return null;
            }
        }

        this.components.add(name, component);
        return component;
    }

    initialize(components, entities) {
        // Register all components
        _.pairs(components).forEach(([name, component]) => {
            const registeredComponent = this.registerComponent(name, _.omit(component, ['messages']));

            if (component.messages) {
                _.pairs(component.messages).forEach(([message, handler]) => {
                    registeredComponent.handleMessage(message, handler);
                });
            }
        });

        // Add all entities with their components
        entities.forEach(entity => {
            const registeredEntity = this.createEntity(_.omit(entity, ['components']));

            _.pairs(entity.components || {}).forEach(([name, data]) => {
                registeredEntity.addComponent(name, data || {});
            });
        });

        // Send the init message
        this.entities.getList().forEach(entity => {
            entity.sendMessage('init', {});
        });
    }

    destroy() {
        if (this.isDestroyed) {
            throw new Error('Engine already destroyed.');
        }

        this.entities.getList().forEach(entity => {
            entity.destroy();
        });

        this.pause();
        this.entities.clear();
        this.components.clear();
        this.isDestroyed = true;
    }

    _destroyEntity(entity) {
        entity.components.getList().forEach(component => {
            entity.removeComponent(component.name);
        });
        this.entities.remove(entity.id);
    }

    destroyEntity(entity) {
        this.entitiesToDestroy.push(entity);
    }

    update(dt, gameTime) {
        if (this.isDestroyed) {
            throw new Error('Engine destroyed, cannot update.');
        }

        const components = this.components.getList();
        const entities = this.updateEntities.getList();
        const renderEntities = this.renderEntities.getList();
        this.dt = dt;
        this.gameTime += dt;

        // Update components
        components.forEach(component => {
            if (component._aggregateUpdate) {
                component._aggregateUpdate.call(component, dt, component.entities, component);
            }
        });

        // Update entities
        entities.forEach(entity => entity.update(dt));

        // Render entities
        renderEntities.forEach(entity => entity.render(dt));

        // Clean up destroyed entities
        while (this.entitiesToDestroy.length) {
            this._destroyEntity(this.entitiesToDestroy.pop());
        }

        return true;
    }

    _addComponent(entity, componentName) {
        const component = this.components.get(componentName);
        if (!component) {
            throw new Error('Cannot find component for name: ' + componentName);
        }

        if (!entity.components.get(componentName)) {
            entity.components.add(componentName, component);
            component.entities.add(entity.id, entity);

            // Take a deep clone of the component defaults
            const defaultDataClone = typeof component.defaultData === 'function' 
                ? component.defaultData() 
                : JSONfn.clone(component.defaultData);

            for (const prop in defaultDataClone) {
                if (defaultDataClone.hasOwnProperty(prop) && !(prop in entity.data)) {
                    entity.data[prop] = defaultDataClone[prop];
                }
            }

            if (component.tags) {
                component.tags.forEach(tag => {
                    if (entity.tags.indexOf(tag) < 0) {
                        entity.tags.push(tag);
                    }
                });
            }

            component.requiredComponents.forEach(required => {
                this._addComponent(entity, required);
            });

            if (typeof component._onAdd === 'function') {
                component._onAdd.call(entity.data, entity, component);
            }
        }
    }

    addComponentToEntity(entity, componentName, defaultData) {
        const defaultDataClone = defaultData;
        for (const prop in defaultDataClone) {
            if (defaultDataClone.hasOwnProperty(prop)) {
                entity.data[prop] = defaultDataClone[prop];
            }
        }

        this._addComponent(entity, componentName);
    }

    removeComponent(entity, componentName) {
        const component = entity.components.get(componentName);

        if (!component) {
            return;
        }

        component.entities.remove(entity);

        if (typeof component._onRemove === 'function') {
            component._onRemove.call(entity.data, entity, component);
        }

        entity.components.remove(componentName);
    }

    findEntityByTag(tag) {
        return _.find(this.entities.getList(), entity => entity.tags.indexOf(tag) > -1);
    }

    findEntitiesByTag(tag) {
        return _.filter(this.entities.getList(), entity => entity.tags.indexOf(tag) > -1);
    }
}

export default Engine;