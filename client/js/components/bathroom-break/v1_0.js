(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root.BathroomBreak_v1_0 = factory();
    }
}(this, function() {
    return function BathroomBreak_v1_0() {
        return {
            messages: {
                'clean': function(entity, data) {
                    alert('clean!');
                }
            }
        };
    };
}));
