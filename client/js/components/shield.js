module.exports = function() {
    return {
        _: {
            offset: {
                x: 35, 
                y: 35
            },
            downOffset: {
                x: 35,
                y: 35
            },
            upOffset: {
                x: -35,
                y: -35
            },
            
            pursueTarget: false,
            icon: "shield"
        },
        onAdd: function(entity, component) {
            if (this.mountTarget) this.mountTarget.data.shield = entity;
        },
        update: function(dt, entity, component) {
            if (this.target) {
                if (this.target.direction == "down") {
                    this.offset = this.downOffset;
                } else {
                    this.offset = this.upOffset;
                }
            }
        },
        requiredComponents: ["mounted", "animation", "glyphicon-renderer"]
    };
}