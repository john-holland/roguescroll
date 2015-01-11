function ListMap(_map) {
    var self = this;
    var list = [];
    
    var map = {};
    
    this.get = function(key) {
        if (!(key in map)) {
            return null;
        }
        return map[key];
    }
    
    this.contains = function(key) {
        return key in map;
    }
    
    this.tryGet = function(key, out) {
        if (!out) {
            throw TypedError("IllegalArgument", "out must be an object");
        }
        
        out.out = self.get(key);
        return out.out !== null;
    }
    
    this.getList = function() {
        return list;
    }
    
    this.clear = function() {
        list = [];
        map = {};
    }
    
    this.add = function(key, value) {
        if (typeof key === 'undefined' || key === null || typeof value === 'undefined' || value === null) {
            throw TypedError("IllegalArgument", "Must have both a key and value!");
        }
        //adds to list map with the same key should overwrite the value, and as such remove it from the list if it existed before
        self.remove(key);
        
        list.push(value);
        map[key] = value;
    }
    
    this.copy = function() {
        return new ListMap(map);
    }
    
    this.remove = function(key) {
        if (key in map) {
            var value = map[key];
            
            var index = list.indexOf();
            if (index > -1) {
                list.splice(index, 1);
            }
            map[key] = null;
            delete map[key];
            
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
            toString: function() { return type + ": " + message; }
        };
    }
}