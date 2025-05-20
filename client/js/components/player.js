import Component from '../engine/component';
import _ from '../util/random';

const Player = Component.build('player', {
    requiredComponents: ['position', 'health'],
    defaultData: {
        direction: 'right',
        character: {
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            vitality: 10
        }
    },
    syncState: true,
    syncProperties: ['direction', 'character'],
    
    onAdd: function(entity) {
        // Initialize player data if not set
        if (!entity.hasData('direction')) {
            entity.setData('direction', this.defaultData.direction);
        }
        if (!entity.hasData('character')) {
            entity.setData('character', this.defaultData.character);
        }
    },
    
    messages: {
        'targets-in-range': function(entity, data) {
            const targets = data.targets || [];
            if (targets.length === 0) return;
            
            // Get target position to determine attack direction
            const target = targets[0];
            const targetPos = target.getData('position');
            const entityPos = entity.getData('position');
            
            // Set direction based on target position
            const direction = targetPos.x > entityPos.x ? 'right' : 'left';
            entity.setData('direction', direction);
            
            // Calculate hit chance and damage
            const character = entity.getData('character');
            const hitChance = (character.dexterity / 20) + 0.5; // 50% base + dexterity bonus
            const damage = Math.floor(character.strength * (1 + _.random(0, 0.5))); // Strength + random bonus
            
            // Check for critical hit
            const isCritical = _.random(0, 1) < (character.dexterity / 100);
            const finalDamage = isCritical ? damage * 2 : damage;
            
            // Send damage to target
            target.sendMessage('damage', {
                amount: finalDamage,
                isCritical: isCritical
            });
            
            // Send attack message to weapon if present
            const weapon = entity.getComponent('weapon');
            if (weapon) {
                weapon.sendMessage('attack', {
                    target: target,
                    damage: finalDamage,
                    isCritical: isCritical
                });
            }
        },
        
        'death': function(entity) {
            // Send game over message to game manager
            entity.sendMessage('game-over');
        }
    }
});

export default Player;