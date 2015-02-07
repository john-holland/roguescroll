define(function() {
    return function () {
        return {
            _: {
                sineWaveRange: 200,
                //lower is faster
                sineWaveSpeed: 3000,
                sineWaveMovementEnabled: true
            },
            requiredComponents: ['center-aligned'],
            update: function(dt, entity, component) {
                if (this.sineWaveMovementEnabled) {
                    this.xOffsetOverride = Math.sin(entity.engine.gameTime / this.sineWaveSpeed) * this.sineWaveRange;
                } else {
                    if (this.xOffsetOverride > 0) this.xOffsetOverride -= 0.1 * dt / 1000;
                    if (this.xOffsetOverride < 0) this.xOffsetOverride = 0;
                }
            }
        };
    };
})