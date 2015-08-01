define(function() {
    function ListMap(_map) {
        var self = this;
        var list = [];
        
        var map = {};
        this.map = map;
        this.list = list;
        
        this.get = function(key) {
            if (!(key in this.map)) {
                return null;
            }
            return this.map[key];
        }
        
        this.contains = function(key) {
            return key in this.map;
        }
        
        this.tryGet = function(key, out) {
            if (!out) {
                throw TypedError('IllegalArgument', 'out must be an object');
            }
            
            out.out = self.get(key);
            return out.out !== null;
        }
        
        this.getList = function() {
            return this.list;
        }
        
        this.clear = function() {
            this.list = [];
            this.map = {};
        }
        
        this.add = function(key, value) {
            if (typeof key === 'undefined' || key === null || typeof value === 'undefined' || value === null) {
                throw TypedError('IllegalArgument', 'Must have both a key and value!');
            }
            //adds to list map with the same key should overwrite the value, and as such remove it from the list if it existed before
            self.remove(key);
            
            this.list.push(value);
            this.map[key] = value;
        }
        
        this.copy = function() {
            return new ListMap(this.map);
        }
        
        this.remove = function(key) {
            if (key in this.map) {
                var value = this.map[key];
                
                var index = this.list.indexOf(value);
                if (index > -1) {
                    this.list.splice(index, 1);
                }
                this.map[key] = null;
                delete this.map[key];
                
                return value;
            }
        }
        
        if (_map && typeof _map === 'object') {
            for (var property in _map) {
                if (_map.hasOwnProperty(property)) {
                    this.add(property, _map[property]);
                }
            }
        }
    
        function TypedError(type, message) {
            return {
                type: type,
                message: message,
                toString: function() { return type + ': ' + message; }
            };
        }
    }
    
    if (window) {
        window.ListMap = ListMap;
    }
    
    return ListMap;
});