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
    
    return Component;
});