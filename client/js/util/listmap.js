define(function() {
    var mori = require('mori');
    
    function ListMap(_map) {
        var self = this;
        var list = mori.vector();
        var map = mori.hash_map();
        
        this.map = map;
        this.list = list;
        
        // Get the value for a key
        this.get = function(key) {
            return mori.get(map, key) || null;
        }
        
        // Check if a key exists
        this.contains = function(key) {
            return mori.has_key(map, key);
        }
        
        // Try to get a value, storing it in the out object if found
        this.tryGet = function(key, out) {
            if (!out) {
                throw TypedError('IllegalArgument', 'out must be an object');
            }
            out.out = self.get(key);
            return out.out !== null;
        }
        
        // Get the list of values
        this.getList = function() {
            return mori.into_array(list);
        }
        
        // Get the current size
        this.size = function() {
            return mori.count(map);
        }
        
        // Clear all entries
        this.clear = function() {
            list = mori.vector();
            map = mori.hash_map();
        }
        
        // Add or update a key-value pair
        this.add = function(key, value) {
            if (typeof key === 'undefined' || key === null || typeof value === 'undefined' || value === null) {
                throw TypedError('IllegalArgument', 'Must have both a key and value!');
            }
            
            if (mori.has_key(map, key)) {
                var oldValue = mori.get(map, key);
                list = mori.filterv(function(v) { return v !== oldValue; }, list);
            }
            
            list = mori.conj(list, value);
            map = mori.assoc(map, key, value);
        }
        
        // Create a shallow copy
        this.copy = function() {
            var copy = new ListMap();
            mori.each(map, function(v, k) {
                copy.add(k, v);
            });
            return copy;
        }
        
        // Remove a key-value pair
        this.remove = function(key) {
            if (mori.has_key(map, key)) {
                var value = mori.get(map, key);
                list = mori.filterv(function(v) { return v !== value; }, list);
                map = mori.dissoc(map, key);
                return value;
            }
            return null;
        }
        
        // Initialize from map if provided
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