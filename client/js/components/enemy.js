var chance = require("chance");
var _ = require("underscore");

module.exports = function() {
    return {
        _: {
            icon: 'skull',
            baseMiss: 10,
            side: 'baddies',
            senseDistance: 100,
            patrolTopTarget: {
                x: 0,
                y: 0
            },
            patrolBottomTarget: {
                x: 0,
                y: 0
            },
            patrolTo: "top",
            isPatrolling: false,
            damage: "1d6"
        },
        onAdd: function(entity, component) {
        },
        update: function(dt, entity, component) {
            if (!this.player) {
                return;
            }
            
            if (Math.abs(this.position.y - this.player.data.position.y) < this.senseDistance) {
                entity.isPatrolling = false;
                this.target.y = this.player.data.position.y + 40;
            } else {
                //partrol.
                //todo: Implement smoke break
                if (!this.isPatrolling) {
                    this.isPatrolling = true;
                    entity.sendMessage("go-to", {
                        x: this.patrolTo === "top" ? this.patrolTopTarget.x : this.patrolBottomTarget.x,
                        y: this.patrolTo === "top" ? this.patrolTopTarget.y : this.patrolBottomTarget.y,
                        callback: function() {
                            if (entity.data.isPatrolling) {
                                entity.data.isPatrolling = false;
                                if (entity.data.patrolTo === 'bottom') {
                                    entity.data.patrolTo = 'top';
                                } else {
                                    entity.data.patrolTo = 'bottom';
                                }
                            }
                        },
                        stopAfterArrival: true
                    });
                }
            }
        },
        requiredComponents: ["health", "movement", "world-entity", "combatant", 'glyphicon-renderer', 'center-aligned', "floating-combat-text", 'animation'],
        messages: {
            'init': function(entity, data) {
                this.player = entity.engine.findEntityByTag("player")[0];
                this.world = entity.engine.findEntityByTag("world")[0];
            },
            "targets-in-range": function(entity, data) {
                if (!data.targets || !data.targets.length) {
                    return;
                }
                
                var hit = _.random(0, 15 - this.player.data.character.skills / 4);
                
                if (hit < this.player.data.baseMiss) {
                    return true;
                }
                
                data.targets[0].sendMessage("damage", {amount: chance.rpg(this.damage, {sum:true})});
                return true;
            }
        }
    };
}