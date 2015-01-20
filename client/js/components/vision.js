define(function() {
    var _ = require("../util/underscore"),
        V2 = require("../util/V2"),
        ImmutableV2 = V2.ImmutableV2,
        V2 = V2.V2;
    
    return function Vision() {
        return {
            _: {
                sightRange: 100,
                withinSight: []
            },
            update: function(dt, entity, component) {
                this.withinSight = _.filter(entity.engine.entities.getList(), function(visionCandidate) {
                    return V2.distanceBetween(entity.data.position, visionCandidate.data.position) < entity.data.sightRange;
                });
            }
        };
    };
});