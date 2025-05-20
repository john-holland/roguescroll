import Entity from './entity';
import System from './system';
import Renderer from './renderer';

class Game {
    constructor() {
        this.entities = [];
        this.systems = [];
        this.renderer = new Renderer();
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
}

export default Game;