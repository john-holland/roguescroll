var _ = require("../util/underscore");
var ListMap = require("../util/listmap");

module.exports = function() {
    return {
        _: {
            lastSpawnTime: null,
            spawnCooldown: 10000, //every 10 seconds,
            enemiesToSpawn: 20,
            spawnPosition: null // set with { x, y } object
        },
        onAdd: function(entity, component) {
            this.lastSpawnTime = entity.engine.gameTime;
        },
        update: function(dt, entity, component) {
            if (!this.world || this.enemiesToSpawn <= 0 || (this.lastSpawnTime !== null && entity.engine.gameTime - this.lastSpawnTime) < this.spawnCooldown) {
                return;
            }
            
            this.lastSpawnTime = entity.engine.gameTime;
            this.enemiesToSpawn--;
            
            //create the enemy!
            var patrolCenter = _.random(0, this.world.data.size.height);
            var patrolRange = Math.max(_.random(100, this.world.data.size.height / this.enemiesToSpawn * 2), 100);
            
            var patrolTop = patrolCenter - (patrolRange / 2);
            var patrolBottom = patrolCenter + (patrolRange / 2);
            var position = { y: patrolCenter, x: 0 };
            
            var enemy = entity.engine.createEntity({ tags: ['enemy'] });
            
            if (this.spawnPosition !== null) {
                position = this.spawnPosition;
            }
            
            enemy.addComponent("enemy", { position: position, icon: "skull", target: { y: 0, x: 0 } });
            
            var healthTarget = entity.engine.createEntity({tags: ['enemy-health-display']});
            
            healthTarget.addComponent("health-display", {
                isStaticPosition: false
            });
            healthTarget.addComponent("mounted", {
                offset: {
                    x: 50,
                    y: 50
                }
            });
            healthTarget.sendMessage("mount", { target: enemy });
            
            enemy.data.patrolTopTarget.y = patrolTop;
            enemy.data.patrolBottomTarget.y = patrolBottom;
            enemy.data.position.y = patrolCenter;
            enemy.sendMessage("init");
            console.log("spawned at: " + enemy.data.position.x + " " + enemy.data.position.y);
        },
        messages: {
            init: function(entity, data) {
                this.world = entity.engine.findEntityByTag("world")[0];
            }
        }
    };
}