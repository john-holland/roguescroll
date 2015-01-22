var _ = require("../util/underscore");

module.exports = function CenterAligned() {
    return {
        _: {
            alignCenter: true,
            xOccupancyOffset: 0,
            previousCenterAlignX: 0,
            previousXOccupancyOffset: 0
        },
        requiredComponents: ["position"],
        onAdd: function(entity, component) {
            if (!component.getCenter) {
                component.getCenter = function(data) {
                    return data.$document.width() / 2 - data.size.width / 2;
                }
            }
            
            this.$document = $(document);
            this.position.x = component.getCenter(this);
            if (this.target) this.target.x = component.getCenter(this);
        },
        update: function(dt, entity, component) {
            if (this.target && this.alignCenter) this.target.x = component.getCenter(this) + this.xOccupancyOffset;
            if (this.alignCenter) this.position.x = component.getCenter(this) + this.xOccupancyOffset;
        },
        aggregateUpdate: function(dt, entities, component) {
            //group the entities by their Math.floor(position.y / 10)
            var entitiesBySpan = _.pairs(_.groupBy(entities.getList(), function(entity) { return Math.floor(entity.data.position.y / 100); }));
            
            entitiesBySpan.forEach(function(pair) {
                var i = 0;
                var ySpan = pair[0];
                _.sortBy(pair[1], function(entity) {
                    return entity.id;
                }).forEach(function(entity) {
                    entity.data.xOccupancyOffset = i * 100 - (i * 100 / 2);
                });
            });
        }
    };
};