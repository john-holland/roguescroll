var _ = require('../util/underscore');
var Chance = require('../util/chance');
var icons = ['person', 'skull', 'bug'];
var chance = new Chance();

function createEnemy(entity, offset) {
    
    var enemy = entity.engine.createEntity({ tags: ['enemy', 'vision-candidate'] });
    enemy.addComponent('mounted', {
        mountTarget: entity,
        offset: offset
    });
    enemy.addComponent('glyphicon-renderer', {
        icon: chance.pick(icons)
    });
    return enemy;
}

module.exports = function Boss() {
    return {
        _: function() {
            return {
                enemiesToRelease: 5,
                playerAttackOffset: 100,
                icon: 'thumbs-down',
                enemies: [],
                health: 200
            };
        },
        tags: ['boss'],
        requiredComponents: ['mounted', 'movement', 'enemy'],
        //the boss should hang out and release enemies to attack the player over time.
        //until it's down to five, it won't fight the player.
        onAdd: function(entity, component) {
            /**
             * The boss wants to have this basic shape:
                eeeee
                 eee
                  ee
             */
             this.player = entity.engine.findEntityByTag('player');
             entity.sendMessage('go-to', {
                 stopAfterArrive: true,
                 x: this.level.doorDown.data.position.x,
                 y: this.level.doorDown.data.position.y
             });
             
             for (var i = 0; i < 5; i++) {
                this.enemies.push(createEnemy(entity, {
                    x: i*50, y: -50
                }));
             }
             
             for (var i = 0; i < 3; i++) {
                if (i === 1) continue;
                createEnemy(entity, {
                    x: i*50+50, y: 0
                });
             }
             
             for (var i = 0; i < 3; i++) {
                createEnemy(entity, {
                    x: i*50+75, y: -50
                });
             }
             
             var healthTarget = entity.engine.createEntity({tags: ['enemy-health-display']});
            
            healthTarget.addComponent('health-display', {
                isStaticPosition: false
            });
            healthTarget.addComponent('mounted', {
                offset: {
                    x: 50,
                    y: 50
                }
            });
            healthTarget.sendMessage('mount', { target: entity });
            
            entity.data.patrolTopTarget.y = this.position.y - 50;
            entity.data.patrolBottomTarget.y = this.position.y + 50;
            entity.sendMessage('init');
        },
        messages: {
            'targets-in-range': function(entity, data) {
                if (!data.targets || !data.targets.length) {
                    return;
                }
                
                if (this.enemies.length > 0) {
                    if (entity.engine.gameTime < this.nextRelease) {
                        return;
                    }
                    
                    var enemy = this.enemies.pop();
                    enemy.sendMessage('dismount');
                    enemy.removeComponent('mounted');
                    enemy.data.mountTarget = null;
                    var player = entity.engine.findEntityByTag('player');
                    enemy.addComponent('enemy', {
                        position: {
                            x: entity.data.position.x,
                            y: entity.data.position.y
                        }
                    });
                    enemy.sendMessage('init');
                    this.nextRelease = entity.engine.gameTime + 5000;
                    return;
                }
                entity.sendMessage('animate', { animation: 'attack-up' });
                var hit = _.random(0, 20 - this.player.data.character.skills / 2);
                
                if (hit < this.player.data.baseMiss) {
                    return true;
                }
                
                data.targets[0].sendMessage('damage', {amount: chance.rpg(this.damage, {sum:true}), hitRoll: hit});
                return true;
            },
            'death': function(entity, data) {
                
                entity.data.level.doorDown.isActive = true;
            }
        }
    }
}