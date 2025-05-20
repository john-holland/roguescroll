// Wrapper for mori npm package for AMD/CommonJS compatibility
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['mori'], function(mori) {
            return factory(mori);
        });
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory(require('mori'));
    } else {
        // Browser globals
        root.mori = factory(root.mori);
    }
}(this, function(mori) {
    if (!mori) {
        throw new Error('Mori library not loaded. Please ensure mori is properly included in your RequireJS configuration.');
    }
    return mori;
})); 