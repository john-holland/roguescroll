var chance = require("../util/chance");

module.exports = function() {
    return {
        _: {
            offset: {
                x: -35, 
                y: 35
            },
            downOffset: {
                x: -35,
                y: 35
            },
            upOffset: {
                x: 35,
                y: -35
            },
            pursueTarget: false,
            icon: "ax",
            damage: "1d4",
            ability: null //function(entity)
        },
        onAdd: function(entity, component) {
            if (this.mountTarget) this.mountTarget.data.weapon = entity;
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
        requiredComponents: ["mounted", "animation", "glyphicon-renderer"],
        messages: {
            attack: function(entity, data) {
                if (!data.target) {
                    return false;
                }
                
                data.target.sendMessage("damage", {amount: chance.rpg(this.damage, {sum:true})});
                entity.sendMessage("animate", { animation: "attack-down" });
            }
        }
        
    };
}