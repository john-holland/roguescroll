/**
 * Version utility functions for handling semantic versioning and versioned message handlers
 */

define(function() {
    /**
     * Creates a versioned message handler function
     * @param {Object} options - Configuration options
     * @param {number} options.major - Major version number
     * @param {number} options.rev - Revision number
     * @param {Function} options.fun - The message handler function
     * @returns {Function} Versioned message handler
     */
    function versioned({ major = 0, rev = 0, fun }) {
        return function(entity, data, component) {
            // Add version info to the message data
            data.version = `${major}.${rev}.0`;
            return fun.call(this, entity, data, component);
        };
    }

    return {
        versioned
    };
}); 