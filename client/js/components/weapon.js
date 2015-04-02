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
                this.state = 'held';
            }
            this.$el.mouseenter(function() {
                
            })
        },
        requiredComponents: ["mounted", "animation", "glyphicon-renderer"],
        messages: {
            attack: function(entity, data) {
                if (!data.target || !this.state == 'held') {
                    return false;
                }
                
                data.target.sendMessage("damage", {amount: chance.rpg(this.damage, {sum:true})});
                entity.sendMessage("animate", { animation: "attack-down" });
                return true;
            },
            equip: function(entity, data) {
                if (!data.wielder) {
                    return;
                }
                
                if (this.state == 'held') {
                    entity.sendMessage("drop");
                }
                
                entity.sendMessage('mount', {target: data.wielder });
                data.wielder.data.weapon = entity;
                this.state = 'held';
            },
            drop: function(entity, data) {
                if (this.state == 'held') {
                    this.state = 'not-held';
                    this.mountTarget.data.weapon = null;
                    entity.sendMessage('dismount', {});
                }
            }
        }
        
    };
}