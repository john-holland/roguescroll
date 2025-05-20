import Component from '../engine/component';

const Health = Component.build('health', {
    requiredComponents: ['position'],
    defaultData: {
        health: 100,
        maxHealth: 100,
        lastDamageTime: 0,
        damageCooldown: 500 // ms between damage events
    },
    syncState: true,
    syncProperties: ['health', 'maxHealth'],
    
    onAdd: function(entity) {
        // Initialize health if not set
        if (!entity.hasData('health')) {
            entity.setData('health', this.defaultData.health);
        }
        if (!entity.hasData('maxHealth')) {
            entity.setData('maxHealth', this.defaultData.maxHealth);
        }
    },
    
    messages: {
        'damage': function(entity, data) {
            const now = Date.now();
            const lastDamage = entity.getData('lastDamageTime') || 0;
            
            // Check damage cooldown
            if (now - lastDamage < this.defaultData.damageCooldown) {
                return;
            }
            
            const currentHealth = entity.getData('health');
            const damage = data.amount || 0;
            const newHealth = Math.max(0, currentHealth - damage);
            
            entity.setData('health', newHealth);
            entity.setData('lastDamageTime', now);
            
            // Send damage event to components
            entity.sendMessage('damage-taken', {
                amount: damage,
                newHealth: newHealth
            });
            
            // Check for death
            if (newHealth <= 0) {
                entity.sendMessage('death');
            }
        },
        
        'heal': function(entity, data) {
            const currentHealth = entity.getData('health');
            const maxHealth = entity.getData('maxHealth');
            const healAmount = data.amount || 0;
            const newHealth = Math.min(maxHealth, currentHealth + healAmount);
            
            entity.setData('health', newHealth);
            
            // Send heal event to components
            entity.sendMessage('healed', {
                amount: healAmount,
                newHealth: newHealth
            });
        }
    }
});

export default Health;