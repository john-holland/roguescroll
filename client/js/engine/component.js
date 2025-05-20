import ListMap from '../util/listmap';
import mori from 'mori';

class Component {
    constructor() {
        this.data = {};
        this.entity = null;
        this.messages = {};
    }

    static build(name, options) {
        const component = new Component();
        component.name = name;
        component.requiredComponents = options.requiredComponents || [];
        component.defaultData = (options.defaultData || options._) || {};
        component.entities = new ListMap();
        component.messageHandlers = mori ? mori.hashMap() : {};
        component._onAdd = options.onAdd || null;
        component._onRemove = options.onRemove || null;
        component._update = options.update || null;
        component._aggregateUpdate = options.aggregateUpdate || null;
        component._render = options.render || null;
        component.tags = options.tags || null;
        component.entityData = new ListMap();
        component.version = options.version || '1.0.0';
        component.minVersion = options.minVersion || '1.0.0';
        component.maxVersion = options.maxVersion || null;
        component.syncState = options.syncState || false;
        component.syncProperties = options.syncProperties || [];

        // Bind methods
        component.handleMessage = component.handleMessageProxy.bind(component);
        component.update = component.update.bind(component);
        component.onAdd = component.onAdd.bind(component);
        component.onRemove = component.onRemove.bind(component);
        component.render = component.render.bind(component);
        component.aggregateUpdate = component.aggregateUpdate.bind(component);
        component.getState = component.getState.bind(component);
        component.applyState = component.applyState.bind(component);
        component.handleStateUpdate = component.handleStateUpdate.bind(component);
        component.isVersionCompatible = component.isVersionCompatible.bind(component);

        // Register 'state-update' handler
        component.handleMessage('state-update', (entity, data) => component.handleStateUpdate(entity, data));

        return component;
    }

    handleMessageProxy(name, callback) {
        if (!this.messageHandlers) {
            this.messageHandlers = mori ? mori.hashMap() : {};
        }
        
        if (mori && mori.hashMap.isPrototypeOf(this.messageHandlers)) {
            this.messageHandlers = mori.assoc(this.messageHandlers, name, callback.bind(this));
        } else {
            this.messageHandlers[name] = callback.bind(this);
        }
    }

    update(callback) {
        this._update = callback;
    }

    onAdd(callback) {
        this._onAdd = callback;
    }

    onRemove(callback) {
        this._onRemove = callback;
    }

    render(callback) {
        this._render = callback;
    }

    aggregateUpdate(callback) {
        this._aggregateUpdate = callback;
    }

    getState(entity) {
        if (!this.syncState) return {};
        
        const state = {};
        this.syncProperties.forEach(prop => {
            if (prop in entity.data) {
                state[prop] = entity.data[prop];
            }
        });
        
        return state;
    }

    applyState(entity, state) {
        if (!this.syncState) return;
        
        Object.entries(state).forEach(([key, value]) => {
            if (this.syncProperties.includes(key)) {
                entity.setData(key, value);
            }
        });
    }

    handleStateUpdate(entity, data) {
        if (!this.syncState) return;
        
        if (data.delta) {
            this.applyState(entity, data.delta);
        }
    }

    isVersionCompatible(version) {
        if (!version) return true;
        
        const v1 = this.version.split('.').map(Number);
        const v2 = version.split('.').map(Number);
        
        // Check min version
        if (this.minVersion) {
            const minV = this.minVersion.split('.').map(Number);
            if (v2[0] < minV[0] || (v2[0] === minV[0] && v2[1] < minV[1]) || 
                (v2[0] === minV[0] && v2[1] === minV[1] && v2[2] < minV[2])) {
                return false;
            }
        }
        
        // Check max version
        if (this.maxVersion) {
            const maxV = this.maxVersion.split('.').map(Number);
            if (v2[0] > maxV[0] || (v2[0] === maxV[0] && v2[1] > maxV[1]) || 
                (v2[0] === maxV[0] && v2[1] === maxV[1] && v2[2] > maxV[2])) {
                return false;
            }
        }
        
        return true;
    }

    sendMessage(message, data) {
        if (this.entity) {
            this.entity.sendMessage(message, data);
        }
    }
}

export default Component;
