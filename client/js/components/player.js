var _ = require("../util/underscore");

module.exports = function() {
    return {
        _: {
            side: 'goodies',
            baseMiss: 10
        },
        onAdd: function(entity, component) {
        },
        requiredComponents: ["health", "scroll-chaser", "position", "glyphicon-renderer", "center-aligned", "animation", 'combatant', "floating-combat-text", "world-entity"],
        messages: {
            "targets-in-range": function(entity, data) {
                //for now we'll just hit one at a time.
                if (!data.targets || !data.targets.length) {
                    return false;
                }
                
                if (this.position.y - data.targets[0].data.position.y > 0) {
                    this.direction = "up";
                } else {
                    this.direction = "down";
                }
                
                if (this.direction == "down") {
                    entity.sendMessage("animate", { animation: "attack-down" });
                } else {
                    entity.sendMessage("animate", { animation: "attack-up" });
                }
                
                var target = data.targets[0];
                var toHit = _.random(this.character.skills / 2, this.character.brawn + this.character.skills);
                
                if (toHit > target.data.baseMiss) {
                    //hit!
                    target.sendMessage("damage", { 
                        amount: _.random(this.character.brains + this.character.level, this.character.brawn * 2 + this.character.level), 
                        isCritical: _.random(this.character.skills / 4, 20) > 18
                    });
                    
                    if (this.weapon) {
                        this.weapon.sendMessage("attack", {
                            target: target
                        });
                    }
                }
                
                return true;
            },
            death: function(entity, component) {
                entity.engine.findEntityByTag("game-manager").sendMessage("game-over");
            }
        }
    };
}