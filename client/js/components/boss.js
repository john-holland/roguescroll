import Component from '../engine/component';
import _ from '../util/random';

const Boss = Component.build('boss', {
    requiredComponents: ['position', 'health'],
    defaultData: {
        name: 'The Wellspring Guardian',
        phase: 1,
        maxPhases: 3,
        waterLevel: 100,
        powerLevel: 100,
        rotationSpeed: 0.5,
        currentRotation: 0,
        weightHit: false,
        components: {
            fan: { 
                health: 100, 
                active: true, 
                rotationOffset: 0,
                effect: 'speed'
            },
            battery: { 
                health: 100, 
                active: true, 
                rotationOffset: 90,
                effect: 'power'
            },
            bladder: { 
                health: 100, 
                active: true, 
                rotationOffset: 180,
                effect: 'defense'
            },
            alternator: { 
                health: 100, 
                active: true, 
                rotationOffset: 270,
                effect: 'regen'
            },
            fuse: {
                health: 100,
                active: true,
                rotationOffset: 45,
                effect: 'fuse'
            }
        },
        vulnerableAngle: 45,
        lastRotationUpdate: 0,
        defeatedComponents: new Set(),
        isDefeated: false
    },
    
    onAdd(entity) {
        if (!entity.hasData('boss')) {
            entity.setData('boss', this.defaultData);
        }
        
        const boss = entity.getData('boss');
        boss.lastRotationUpdate = Date.now();
    },
    
    messages: {
        'update'(entity, data) {
            const boss = entity.getData('boss');
            if (boss.isDefeated) return;

            const now = Date.now();
            const deltaTime = (now - boss.lastRotationUpdate) / 1000;
            boss.lastRotationUpdate = now;
            
            const speedModifier = boss.defeatedComponents.has('fan') ? 1.5 : 1;
            boss.currentRotation = (boss.currentRotation + (boss.rotationSpeed * speedModifier * deltaTime * 360)) % 360;
            
            Object.entries(boss.components).forEach(([key, component]) => {
                const componentAngle = (component.rotationOffset + boss.currentRotation) % 360;
                const wasVulnerable = component.isVulnerable;
                
                const isVulnerable = this.calculateVulnerability(boss, key, componentAngle);
                component.isVulnerable = isVulnerable;
                
                if (component.isVulnerable && !wasVulnerable) {
                    entity.sendMessage('component-vulnerable', {
                        component: key,
                        angle: componentAngle,
                        reason: this.getVulnerabilityReason(boss, key)
                    });
                }
            });
            
            this.updatePhase(entity);
        },
        
        'damage'(entity, data) {
            const boss = entity.getData('boss');
            if (boss.isDefeated) return;

            const component = boss.components[data.target];
            
            if (component?.active && component.isVulnerable) {
                const damageReduction = boss.defeatedComponents.has('bladder') ? 1 : 0.75;
                const actualDamage = data.amount * damageReduction;
                
                component.health = Math.max(0, component.health - actualDamage);
                
                entity.sendMessage('component-damaged', {
                    component: data.target,
                    damage: actualDamage,
                    originalDamage: data.amount
                });
                
                if (component.health <= 0) {
                    component.active = false;
                    boss.defeatedComponents.add(data.target);
                    
                    entity.sendMessage('component-destroyed', {
                        component: data.target,
                        effect: component.effect
                    });
                    
                    this.applyComponentDestructionEffects(boss, data.target);
                    
                    // Check if fuse should blow
                    if (data.target === 'fuse' || this.shouldBlowFuse(boss)) {
                        this.blowFuse(entity, boss);
                    }
                }
            }
        },
        
        'update-phase'(entity, data) {
            const boss = entity.getData('boss');
            if (boss.phase < boss.maxPhases) {
                boss.phase++;
                
                Object.entries(boss.components).forEach(([key, component]) => {
                    if (!component.active) {
                        component.active = true;
                        component.health = 100 * boss.phase;
                        boss.defeatedComponents.delete(key);
                    }
                });
                
                this.adjustPhaseMechanics(boss);
                
                entity.sendMessage('phase-changed', {
                    phase: boss.phase,
                    components: boss.components,
                    defeatedComponents: Array.from(boss.defeatedComponents)
                });
            }
        },
        
        'weight-hit'(entity, data) {
            const boss = entity.getData('boss');
            if (boss.isDefeated) return;

            // Only increase power if weight is moving downward
            if (data.direction === 'down') {
                boss.powerLevel = Math.min(200, boss.powerLevel + 25);
                boss.weightHit = true;
                
                entity.sendMessage('power-increased', {
                    amount: 25,
                    newLevel: boss.powerLevel
                });
                
                // Check if this hit should trigger fuse
                if (this.shouldBlowFuse(boss)) {
                    this.blowFuse(entity, boss);
                }
            }
        }
    },
    
    calculateVulnerability(boss, componentKey, angle) {
        const baseVulnerability = Math.abs(angle - 180) <= boss.vulnerableAngle;
        
        const vulnerabilityModifiers = {
            fan: ['alternator'],
            battery: ['alternator'],
            bladder: ['fan'],
            alternator: ['battery'],
            fuse: ['battery', 'alternator']
        };
        
        const supportingComponents = vulnerabilityModifiers[componentKey] || [];
        const missingSupport = supportingComponents.some(support => 
            boss.defeatedComponents.has(support)
        );
        
        return baseVulnerability || missingSupport;
    },
    
    getVulnerabilityReason(boss, componentKey) {
        const vulnerabilityModifiers = {
            fan: ['alternator'],
            battery: ['alternator'],
            bladder: ['fan'],
            alternator: ['battery'],
            fuse: ['battery', 'alternator']
        };
        
        const supportingComponents = vulnerabilityModifiers[componentKey] || [];
        const missingSupport = supportingComponents.find(support => 
            boss.defeatedComponents.has(support)
        );
        
        return missingSupport ? 
            `Vulnerable due to missing ${missingSupport}` : 
            'Vulnerable due to position';
    },
    
    applyComponentDestructionEffects(boss, componentKey) {
        const effects = {
            fan: () => {
                boss.rotationSpeed *= 1.5;
            },
            battery: () => {
                boss.powerLevel *= 1.5;
            },
            bladder: () => {
                boss.waterLevel *= 0.75;
            },
            alternator: () => {
                boss.rotationSpeed *= 0.75;
                boss.powerLevel *= 0.75;
            },
            fuse: () => {
                // Fuse destruction handled separately
            }
        };
        
        if (effects[componentKey]) {
            effects[componentKey]();
        }
    },
    
    adjustPhaseMechanics(boss) {
        switch(boss.phase) {
            case 2:
                boss.rotationSpeed *= 1.5;
                boss.vulnerableAngle = 30;
                break;
            case 3:
                boss.rotationSpeed *= 1.5;
                boss.vulnerableAngle = 20;
                Object.values(boss.components).forEach(component => {
                    component.rotationOffset = Math.random() * 360;
                });
                break;
        }
    },
    
    shouldBlowFuse(boss) {
        // Fuse blows when power level exceeds storage capacity
        const activeComponents = Object.values(boss.components).filter(c => c.active).length;
        const powerOverload = boss.powerLevel > (100 * activeComponents);
        return powerOverload && !boss.defeatedComponents.has('fuse');
    },
    
    blowFuse(entity, boss) {
        boss.isDefeated = true;
        
        // Create burst particles
        const numParticles = 8;
        const baseAngle = 270; // Start at 270 degrees
        const angleRange = 135; // Spread to 45 degrees (270 - 135 = 135)
        
        for (let i = 0; i < numParticles; i++) {
            const angle = baseAngle - (angleRange * (i / (numParticles - 1)));
            const particle = entity.engine.createEntity({
                tags: ['fuse-particle']
            });
            
            particle.addComponent('position', {
                x: 0,
                y: 0
            });
            
            particle.addComponent('renderer', {
                char: '💡',
                color: '#ffff00'
            });
            
            // Set burst angle for animation
            particle.$el.style.setProperty('--burst-angle', `${angle}deg`);
            particle.$el.addClass('lightbulb-burst');
            
            // Remove particle after animation
            setTimeout(() => {
                particle.destroy();
            }, 500);
        }
        
        entity.sendMessage('boss-defeated', {
            components: boss.components,
            defeatedComponents: Array.from(boss.defeatedComponents)
        });
    },
    
    updatePhase(entity) {
        const boss = entity.getData('boss');
        const allComponentsDestroyed = Object.values(boss.components).every(c => !c.active);
        
        if (allComponentsDestroyed && boss.phase < boss.maxPhases) {
            entity.sendMessage('update-phase');
        }
    }
});

export default Boss;