var Chance = require("../util/chance"),
    chance = new Chance();

module.exports = function() {
    return {
        _: {
            offset: {
                x: 35, 
                y: 35
            },
            pursueTarget: false,
            icon: "shield",
            shields: [{
                name: 'Wooden Shield',
                color: 'brown',
                power: null
            }]
        },
        onAdd: function(entity, component) {
            if (this.mountTarget) this.mountTarget.data.shield = entity;
            if (this.mountTarget.data.damagePredicates) {
                this.mountTarget.data.damagePredicates.push(function(damage) {
                    var blockCheck = (entity.data.mountTarget.data.character.brawn + entity.data.mountTarget.data.character.skills) / 2 + chance.rpg("2d6", {sum: true});
                    
                    if (blockCheck > entity.data.mountTarget.data.baseMiss) {
                        entity.data.mountTarget.sendMessage('blocked', { amount: damage.amount});
                        entity.sendMessage('animate', { animation: 'take-damage' });
                        return false;
                    }
                    
                    return true;
                });
            }
        },
        requiredComponents: ["mounted", "animation", "glyphicon-renderer"]
    };
}