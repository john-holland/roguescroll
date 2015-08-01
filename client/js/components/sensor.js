define(function() {
    var V2 = require('../util/V2'),
        ImmutableV2 = V2.ImmutableV2;
    
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
                    var sensed = entity.engine.findEntitiesByTag(this.senseTag).filter(function(entity) {
                        return currentPosition.distanceTo(entity.data.position) < data.senseRange;
                    });
                    
                    if (sensed.length) {
                        entity.sendMessage('sensed', { sensed: sensed, tag: this.senseTag });
                    }
                } else {
                    var sensed = entity.engine.entities.getList().filter(function(entity) {
                        return entity.data.position ? currentPosition.distanceTo(entity.data.position) < data.senseRange : false;
                    });
                    
                    if (sensed.length) {
                        entity.sendMessage('sensed', { sensed: sensed, tag: this.senseTag });
                    }
                }
            }
        }
    }
});