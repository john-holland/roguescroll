module.exports = function() {
    return {
        _: {
            augmentAbility: null,
            downRightOffset: {
                x: -35,
                y: -35
            },
            upRightOffset: {
                x: 35,
                y: 35
            },
            downLeftOffset: {
                x: 35,
                y: -35
            },
            upLeftOffset: {
                x: -35,
                y: 35
            },
            augmentPosition: 'left'
        },
        requiredComponents: ['mounted', 'animation', 'glyphicon-renderer'],
        update: function(dt, entity, component) {
            if (this.target) {
                if (this.augmentPosition === 'left') {
                    if (this.target.direction == 'down') {
                        this.offset = this.downLeftOffset;
                    } else {
                        this.offset = this.upLeftOffset;
                    }
                } else {
                    if (this.target.direction == 'down') {
                        this.offset = this.downRightOffset;
                    } else {
                        this.offset = this.upRightOffset;
                    }
                }
            }
        }
    };
}