import Entity from './entity';
import System from './system';
import Renderer from './renderer';

class Game {
    constructor(components = {}, entities = []) {
        this.entities = [];
        this.systems = [];
        this.renderer = new Renderer();
        this.components = components;
        this.nextEntityId = 0;
        
        // Initialize entities if provided
        if (entities && entities.length > 0) {
            entities.forEach(entityConfig => {
                this.createEntity(entityConfig);
            });
        }
    }

    addEntity(entity) {
        this.entities.push(entity);
        return entity;
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    addSystem(system) {
        this.systems.push(system);
        return system;
    }

    removeSystem(system) {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.splice(index, 1);
        }
    }

    update(delta) {
        this.systems.forEach(system => {
            system.update(delta);
        });
    }

    render() {
        this.renderer.render(this.entities);
    }

    /**
     * Creates an entity from a configuration object and adds it to the game.
     * @param {Object} config - The entity configuration.
     * @param {Array} config.tags - Tags to add to the entity.
     * @param {Object} config.components - Components to add to the entity.
     * @returns {Entity} The created entity.
     */
    createEntity(config) {
        const entity = new Entity(this.nextEntityId++, this);
        if (config.tags && Array.isArray(config.tags)) {
            config.tags.forEach(tag => entity.addTag(tag));
        }
        if (config.components && typeof config.components === 'object') {
            Object.entries(config.components).forEach(([name, data]) => {
                entity.addComponent(name, data);
            });
        }
        this.addEntity(entity);
        return entity;
    }

    /**
     * Destroys the game instance and cleans up resources.
     */
    destroy() {
        this.entities.forEach(entity => {
            if (entity.destroy) {
                entity.destroy();
            }
        });
        this.entities = [];
        this.systems = [];
        if (this.renderer && this.renderer.destroy) {
            this.renderer.destroy();
        }
    }

    /**
     * Pauses the game.
     */
    pause() {
        // Implement pause logic
    }

    /**
     * Resumes the game.
     */
    play() {
        // Implement play logic
    }
}

export default Game;