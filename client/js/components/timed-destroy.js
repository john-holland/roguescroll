export default function TimedDestroy() {
    return {
        _: {
            destroyTime: 0,
            destroyDelay: 1000, // Default 1 second
            destroyOnStart: false
        },
        onAdd: function(entity, component) {
            if (this.destroyOnStart) {
                this.destroyTime = entity.engine.gameTime + this.destroyDelay;
            }
        },
        update: function(dt, entity, component) {
            if (this.destroyTime > 0 && entity.engine.gameTime >= this.destroyTime) {
                entity.destroy();
            }
        },
        messages: {
            'start-destroy-timer': function(entity, data) {
                if (data.delay) {
                    this.destroyDelay = data.delay;
                }
                this.destroyTime = entity.engine.gameTime + this.destroyDelay;
            },
            'cancel-destroy-timer': function(entity, data) {
                this.destroyTime = 0;
            }
        }
    };
}