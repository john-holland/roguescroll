var Chance = require("../util/chance"),
    chance = new Chance();

module.exports = function() {
    return {
        _: {
            offset: {
                x: -35,
                y: 35
            },
            pursueTarget: false,
            icon: "ax",
            damage: "1d4",
            ability: null, //function(entity),
            state: "not-held"
        },
        onAdd: function(entity, component) {
            if (this.mountTarget) {
                this.mountTarget.data.weapon = entity;
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