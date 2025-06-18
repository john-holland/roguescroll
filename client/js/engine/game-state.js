import dataClone from '../util/data-clone';

class GameState {
    constructor(engine) {
        this.engine = engine;
        this.state = {};
        this.stateHistory = [];
        this.maxHistoryLength = 10;
    }

    updateState(newState) {
        // Clone the new state before updating
        const clonedState = dataClone.clone(newState);
        
        // Store current state in history
        this.stateHistory.push(dataClone.clone(this.state));
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
        
        // Update current state
        this.state = clonedState;
        
        // Notify listeners
        this.engine.trigger('stateChanged', clonedState);
    }

    getState() {
        return dataClone.clone(this.state);
    }

    getPreviousState() {
        if (this.stateHistory.length === 0) {
            return null;
        }
        return dataClone.clone(this.stateHistory[this.stateHistory.length - 1]);
    }
}

export default GameState; 