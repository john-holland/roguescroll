import Component from '../engine/component';
import _ from '../util/random';

const Level = Component.build('level', {
    requiredComponents: ['position'],
    defaultData: {
        id: null,
        walls: [],
        traps: [],
        entities: [],
        isActive: false,
        color: '#eee',
        difficulty: 1,
        config: {
            minWalls: 3,
            maxWalls: 8,
            minTraps: 1,
            maxTraps: 4,
            wallConfig: {
                minLength: 100,
                maxLength: 300,
                minWidth: 50,
                maxWidth: 100
            }
        }
    },
    
    onAdd: function(entity) {
        if (!entity.hasData('level')) {
            entity.setData('level', this.defaultData);
        }
        
        const level = entity.getData('level');
        level.id = _.random(1000, 9999);
    },
    
    messages: {
        'activate': function(entity, data) {
            const level = entity.getData('level');
            if (!level.isActive) {
                level.isActive = true;
                
                // Generate level content if not already generated
                if (level.walls.length === 0) {
                    this.generateLevel(entity);
                }
                
                // Activate all entities
                level.entities.forEach(entityId => {
                    entity.world.sendMessage('activate-entity', { entityId });
                });
                
                entity.sendMessage('level-activated', { levelId: level.id });
            }
        },
        
        'deactivate': function(entity, data) {
            const level = entity.getData('level');
            if (level.isActive) {
                level.isActive = false;
                
                // Deactivate all entities
                level.entities.forEach(entityId => {
                    entity.world.sendMessage('deactivate-entity', { entityId });
                });
                
                entity.sendMessage('level-deactivated', { levelId: level.id });
            }
        },
        
        'set-difficulty': function(entity, data) {
            const level = entity.getData('level');
            level.difficulty = data.difficulty;
            
            // Regenerate level with new difficulty
            this.generateLevel(entity);
        },
        
        'add-entity': function(entity, data) {
            const level = entity.getData('level');
            if (!level.entities.includes(data.entityId)) {
                level.entities.push(data.entityId);
                
                // Activate entity if level is active
                if (level.isActive) {
                    entity.world.sendMessage('activate-entity', { entityId: data.entityId });
                }
            }
        },
        
        'remove-entity': function(entity, data) {
            const level = entity.getData('level');
            const index = level.entities.indexOf(data.entityId);
            if (index !== -1) {
                level.entities.splice(index, 1);
                
                // Deactivate entity
                entity.world.sendMessage('deactivate-entity', { entityId: data.entityId });
            }
        }
    },
    
    generateLevel: function(entity) {
        const level = entity.getData('level');
        const position = entity.getData('position');
        
        // Clear existing level content
        level.walls = [];
        level.traps = [];
        
        // Generate walls
        const numWalls = _.random(
            level.config.minWalls,
            level.config.maxWalls + Math.floor(level.difficulty / 2)
        );
        
        for (let i = 0; i < numWalls; i++) {
            const wallId = entity.world.createEntity();
            const wallEntity = entity.world.getEntity(wallId);
            
            // Add wall components
            wallEntity.addComponent('position', {
                x: position.x + _.random(-200, 200),
                y: position.y + _.random(-200, 200)
            });
            
            wallEntity.addComponent('wall', {
                direction: _.random(['left', 'right', 'up', 'down']),
                minLength: level.config.wallConfig.minLength,
                maxWidth: level.config.wallConfig.maxWidth,
                color: level.color
            });
            
            level.walls.push(wallId);
            level.entities.push(wallId);
        }
        
        // Generate traps
        const numTraps = _.random(
            level.config.minTraps,
            level.config.maxTraps + Math.floor(level.difficulty / 3)
        );
        
        for (let i = 0; i < numTraps; i++) {
            const trapId = entity.world.createEntity();
            const trapEntity = entity.world.getEntity(trapId);
            
            // Add trap components
            trapEntity.addComponent('position', {
                x: position.x + _.random(-300, 300),
                y: position.y + _.random(-300, 300)
            });
            
            trapEntity.addComponent('trap', {
                type: _.random(['spike', 'laser', 'flame']),
                damage: 10 * level.difficulty,
                color: level.color
            });
            
            level.traps.push(trapId);
            level.entities.push(trapId);
        }
        
        // Notify level generated
        entity.sendMessage('level-generated', { levelId: level.id });
    }
});

export default Level; 