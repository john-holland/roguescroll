define(function() {
    var ListMap = require('../util/listmap');
    
    function Component(name, options) {
        this.name = name;
        this.requiredComponents = options.requiredComponents || [];
        this.defaultData = (options.defaultData || options._) || {};
        this.entities = new ListMap();
        this.messageHandlers = { };
        this._onAdd = options.onAdd || null;
        this._onRemove = options.onRemove || null;
        this._update = options.update || null;
        this._aggregateUpdate = options.aggregateUpdate || null;
        this._render = options.render || null;
        this.tags = options.tags || null;
        this.entityData = new ListMap();
        
        // Versioning support
        this.version = options.version || '1.0.0';
        this.minVersion = options.minVersion || '1.0.0';
        this.maxVersion = options.maxVersion || null;
    }
    
    Component.prototype.handleMessage = function (name, callback) {
        this.messageHandlers[name] = callback;
    }
    
    Component.prototype.update = function(callback) {
        this._update = callback;
    }
    
    Component.prototype.onAdd = function(callback) {
        this._onAdd = callback;
    }
    
    Component.prototype.onRemove = function(callback) {
        this._onRemove = callback;
    }
    
    Component.prototype.render = function(callback) {
        this._render = callback;
    }
    
    Component.prototype.aggregateUpdate = function(callback) {
        this._aggregateUpdate = callback;
    }

    // Version comparison helper
    Component.prototype.isVersionCompatible = function(version) {
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
    
    return Component;
});