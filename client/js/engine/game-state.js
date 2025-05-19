define(function() {
    var dataClone = require('../util/data-clone');
    
    function GameState(engine) {
        this.engine = engine;
        this.state = {};
        this.stateHistory = [];
        this.maxHistoryLength = 10;
    }
    
    GameState.prototype.updateState = function(newState) {
        // Clone the new state before updating
        var clonedState = dataClone.clone(newState);
        
        // Store current state in history
        this.stateHistory.push(dataClone.clone(this.state));
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
        
        // Update current state
        this.state = clonedState;
        
        // Notify listeners
        this.engine.trigger('stateChanged', clonedState);
    };
    
    GameState.prototype.getState = function() {
        return dataClone.clone(this.state);
    };
    
    GameState.prototype.getPreviousState = function() {
        if (this.stateHistory.length === 0) {
            return null;
        }
        return dataClone.clone(this.stateHistory[this.stateHistory.length - 1]);
    };
    
    return GameState;
}); 