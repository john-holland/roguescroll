var Chance = require("../util/chance"),
    chance = new Chance();
var _ = require("../util/underscore");

module.exports = function() {
    return {
        _: {
            icon: 'skull',
            baseMiss: 10,
            side: 'baddies',
            senseDistance: 150,
            patrolTopTarget: {
                x: 0,
                y: 0
            },
            patrolBottomTarget: {
                x: 0,
                y: 0
            },
            size: {
                height: 40,
                width: 40
            },
            patrolTo: "top",
            isPatrolling: false,
            damage: "1d6",
            playerAttackOffset: 60
        },
        onAdd: function(entity, component) {
        },
        update: function(dt, entity, component) {
            if (!this.player) {
                return;
            }
            
            if (Math.abs(this.position.y - this.player.data.position.y) < this.senseDistance) {
                entity.isPatrolling = false;
                this.target.y = this.player.data.position.y + this.playerAttackOffset;
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
        requiredComponents: ["health", "movement", "world-entity", "combatant", 'glyphicon-renderer', 'center-aligned', "floating-combat-text", 'animation', 'drops-loot'],
        messages: {
            'init': function(entity, data) {
                this.player = entity.engine.findEntityByTag("player")[0];
                this.world = entity.engine.findEntityByTag("world")[0];
            },
            "targets-in-range": function(entity, data) {
                if (!data.targets || !data.targets.length) {
                    return;
                }
                
                entity.sendMessage("animate", { animation: 'attack-up' });
                var hit = _.random(0, 15 - this.player.data.character.skills / 4);
                
                if (hit < this.player.data.baseMiss) {
                    return true;
                }
                
                data.targets[0].sendMessage("damage", {amount: chance.rpg(this.damage, {sum:true}), hitRoll: hit});
                return true;
            }
        }
    };
}