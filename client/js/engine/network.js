import dataClone from '../util/data-clone';

class Network {
    constructor(engine) {
        this.engine = engine;
        this.messageHandlers = {};
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    handleMessage(message, data) {
        // Clone incoming data before processing
        const clonedData = dataClone.clone(data);
        
        if (message in this.messageHandlers) {
            this.messageHandlers[message].forEach(handler => {
                handler(clonedData);
            });
        }
    }

    sendMessage(message, data) {
        if (!this.connected) {
            console.warn('Cannot send message: not connected');
            return;
        }
        
        // Clone outgoing data before sending
        const clonedData = dataClone.clone(data);
        
        this.engine.socket.emit(message, clonedData);
    }

    connect() {
        if (this.connected) {
            return;
        }

        this.engine.socket.on('connect', () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            this.engine.trigger('networkConnected');
        });

        this.engine.socket.on('disconnect', () => {
            this.connected = false;
            this.engine.trigger('networkDisconnected');
            this.attemptReconnect();
        });

        this.engine.socket.on('message', (data) => {
            this.handleMessage(data.type, data.payload);
        });
    }

    disconnect() {
        if (!this.connected) {
            return;
        }

        this.engine.socket.disconnect();
        this.connected = false;
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    onMessage(message, handler) {
        if (!(message in this.messageHandlers)) {
            this.messageHandlers[message] = [];
        }
        this.messageHandlers[message].push(handler);
    }

    offMessage(message, handler) {
        if (message in this.messageHandlers) {
            const index = this.messageHandlers[message].indexOf(handler);
            if (index !== -1) {
                this.messageHandlers[message].splice(index, 1);
            }
        }
    }
}

export default Network; 