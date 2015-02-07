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
            isStaticPosition: false
        },
        messages: {
            'set-position-type': function(entity, data) {
                this.isStaticPosition = (data || { }).isStaticPosition || false;
            }
        }
    };
};