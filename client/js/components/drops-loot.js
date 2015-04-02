define(function() {
    var Chance = require("../util/chance"),
        chance = new Chance();
        
    return function DropsLoot() {
        return {
            messages: {
                death: function(entity, data) {
                    var d6Roll = chance.d6();
                    if (d6Roll == 5) {
                        var healthPotion = entity.engine.createEntity({ tags: ['weapon'] });
                        healthPotion.addComponent("weapon", {
                            position: {
                                x: this.position.x,
                                y: this.position.y + 100
                            },
                            pursueTarget: false,
                            damage: chance.d6() + "d" + chance.d10()
                        });
                    } else if (d6Roll == 6)  {
                        //todo: More loot, weapons, shields, armor (?)
                        var healthPotion = entity.engine.createEntity({ tags: ['health-potion'] });
                        healthPotion.addComponent("health-potion", {
                            position: {
                                x: this.position.x,
                                y: this.position.y + 100
                            },
                            pursueTarget: false
                        });
                    }
                }
            }
        };
    }
});