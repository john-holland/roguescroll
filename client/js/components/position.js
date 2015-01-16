module.exports = function Position() {
    return {
        _: {
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 24,
                height: 24
            },
            rotation: 0,
            isFixedPosition: false
        },
        messages: {
            'set-position-type': function(entity, data) {
                this.isFixedPosition = (data || { }).isFixedPosition || false;
            }
        }
    };
};