var _ = require("../util/underscore");
var ListMap = require("../util/listmap");

module.exports = function Combatant() {
    return {
        _: {
            lastAttackTime: null,
            attackCooldown: 1000,
            range: 50,
            side: "baddies"
        },
        requiredComponents: ["health", "movement", "position"],
        onAdd: function(entity, component) {
            this.tryAttack = function() {
                if (this.lastAttackTime === null || (entity.engine.gameTime - this.attackCooldown) > this.lastAttackTime) {
                    var data = this;
                    var targets = _.filter(entity.engine.entities.getList(), function(entity) {
                        return "side" in entity.data && "position" in entity.data && "health" in entity.data &&
                               entity.data.health > 0 &&
                               entity.data.side !== data.side && 
                               Math.abs(entity.data.position.y - data.position.y) < data.range;
                    });
                    
                    if (targets.length) {
                        var metadata = entity.sendMessage("targets-in-range", { targets: targets });
                        
                        if (_.any(metadata.results, function(result) {
                            return !!result;
                        })) {
                            this.lastAttackTime = entity.engine.gameTime;
                            return true;
                        }
                    }
                }
                
                return false;
            };
        },
        update: function(dt, entity, component) {
            if (this.health <= 0) {
                //dead men don't attack...
                return;
            }
            
            this.tryAttack();
        },
        messages: {
            "damage": function(entity, data) {
                if (this.health > 0) {
                    entity.sendMessage("animate", { animation: data.isCritical ? "take-critical-damage" : "take-damage" });
                }
            },
            "death": function(entity, data) {
                //drop your loot!
                entity.sendMessage("animate", {
                    animation: "death",
                    callback: function() {
                        entity.shouldRender = false;
                        entity.destroy();
                    }
                });
            },
            "attack": function(entity, data) {
                this.tryAttack();
            }
        }
    };
}