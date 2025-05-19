define(function() {
    var _ = require('./underscore');
    
    function deepClone(data) {
        if (!data) return data;
        
        // Handle primitive types
        if (typeof data !== 'object') return data;
        
        // Handle arrays
        if (Array.isArray(data)) {
            return data.map(deepClone);
        }
        
        // Handle objects
        if (data instanceof Object) {
            var clone = {};
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    clone[key] = deepClone(data[key]);
                }
            }
            return clone;
        }
        
        // Handle other types (Date, RegExp, etc)
        return data;
    }
    
    return {
        clone: deepClone,
        cloneMessage: function(message, data) {
            return {
                message: message,
                data: deepClone(data),
                timestamp: Date.now()
            };
        }
    };
}); 