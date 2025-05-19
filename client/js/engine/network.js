define(function() {
    var dataClone = require('../util/data-clone');
    
    function Network(engine) {
        this.engine = engine;
        this.messageHandlers = {};
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }
    
    Network.prototype.handleMessage = function(message, data) {
        // Clone incoming data before processing
        var clonedData = dataClone.clone(data);
        
        if (message in this.messageHandlers) {
            this.messageHandlers[message].forEach(function(handler) {
                handler(clonedData);
            });
        }
    };
    
    Network.prototype.sendMessage = function(message, data) {
        if (!this.connected) {
            console.warn('Cannot send message: not connected');
            return;
        }
        
        // Clone outgoing data before sending
        var clonedData = dataClone.clone(data);
        
        this.engine.socket.emit(message, clonedData);
    };
    
    // ... existing code ...
    
    return Network;
}); 