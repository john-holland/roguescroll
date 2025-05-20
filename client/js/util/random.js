define(function() {
    return {
        /**
         * Returns a random integer between min and max (inclusive)
         * @param {number} min - The minimum value
         * @param {number} max - The maximum value
         * @returns {number} A random integer between min and max
         */
        random: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        
        /**
         * Returns a random float between min and max
         * @param {number} min - The minimum value
         * @param {number} max - The maximum value
         * @returns {number} A random float between min and max
         */
        randomFloat: function(min, max) {
            return Math.random() * (max - min) + min;
        },
        
        /**
         * Returns a random element from an array
         * @param {Array} array - The array to pick from
         * @returns {*} A random element from the array
         */
        pick: function(array) {
            return array[Math.floor(Math.random() * array.length)];
        },
        
        /**
         * Returns true with the given probability
         * @param {number} probability - Probability between 0 and 1
         * @returns {boolean} True with the given probability
         */
        chance: function(probability) {
            return Math.random() < probability;
        }
    };
}); 