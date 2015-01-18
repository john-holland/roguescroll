define(function() {
    var Chance = require("../util/chance"),
        chance = new Chance();
        
    return function DropsLoot() {
        return {
            messages: {
                death: function(entity, data) {
                    if (chance.d6() == 6)  {
                        //todo: More loot, weapons, shields, armor (?)
                        var healthPotion = entity.engine.createEntity({ tags: ['health-potion'] });
                        healthPotion.addComponent("health-potion", {
                            position: {
                                x: this.position.x,
                                y: this.position.y + 100
                            },
                            pursueTarget: false
                        })
                    }
                }
            }
        };
    }
});