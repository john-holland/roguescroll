define(function() {
    return function Sensor() {
        return {
            _: {
                senseTag: null,
                senseRange: 100
            },
            requiredComponents: ['position'],
            update: function(dt, entity, component) {
                var currentPosition = ImmutableV2.coalesce(this.position),
                    data = this;
                if (this.senseTag) {
                    var sensed = entity.engine.findEntityByTag(this.senseTag).filter(function(entity) {
                        return currentPosition.distanceTo(entity.data.position) < data.senseRange;
                    });
                    
                    if (sensed.length) {
                        entity.sendMessage('sensed', { sensed: sensed, tag: this.senseTag });
                    }
                } else {
                    var sensed = entity.engine.entities.getList().filter(function(entity) {
                        return currentPosition.distanceTo(entity.data.position) < data.senseRange;
                    });
                    
                    if (sensed.length) {
                        entity.sendMessage('sensed', { sensed: sensed, tag: this.senseTag });
                    }
                }
            }
        }
    }
});