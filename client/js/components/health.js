module.exports = function Health() { 
    return {
        _: {
            health: 100,
            maxHealth: 100
        },
        messages: {
            "damage": function(entity, data) {
                entity.data.health -= data.amount || 0;
                
                if (entity.data.health <= 0) {
                    entity.sendMessage("death", { overkill: entity.data.health * -1 });
                }
            },
            "heal": function(entity, data) {
                entity.data.health += data.amount || 0;
                entity.data.health = Math.min(entity.data.health, this.maxHealth);
            }
        }
    };
};