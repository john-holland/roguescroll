import Component from '../engine/component';

const BossRenderer = Component.build('boss-renderer', {
    requiredComponents: ['position', 'boss'],
    defaultData: {
        radius: 150,
        componentIcons: {
            fan: '💨',
            battery: '🔋',
            bladder: '💧',
            alternator: '⚡',
            fuse: '💡'
        },
        componentColors: {
            fan: '#4a90e2',
            battery: '#50e3c2',
            bladder: '#9013fe',
            alternator: '#f5a623',
            fuse: '#ffff00'
        },
        effectColors: {
            speed: '#ff6b6b',
            power: '#ffd93d',
            defense: '#6c5ce7',
            regen: '#00b894',
            fuse: '#ffff00'
        }
    },
    
    onAdd(entity) {
        // Create display entities for each component
        const boss = entity.getData('boss');
        Object.keys(boss.components).forEach(componentKey => {
            const displayEntity = entity.engine.createEntity({
                tags: ['boss-component', componentKey]
            });
            
            displayEntity.addComponent('position', {
                x: 0,
                y: 0
            });
            
            displayEntity.addComponent('renderer', {
                char: this.defaultData.componentIcons[componentKey],
                color: this.defaultData.componentColors[componentKey]
            });
            
            // Add health display
            const healthEntity = entity.engine.createEntity({
                tags: ['component-health', componentKey]
            });
            
            healthEntity.addComponent('position', {
                x: 0,
                y: 0
            });
            
            healthEntity.addComponent('renderer', {
                char: '❤️',
                color: '#ff0000'
            });

            // Add effect indicator
            const effectEntity = entity.engine.createEntity({
                tags: ['component-effect', componentKey]
            });
            
            effectEntity.addComponent('position', {
                x: 0,
                y: 0
            });
            
            effectEntity.addComponent('renderer', {
                char: '✨',
                color: this.defaultData.effectColors[boss.components[componentKey].effect]
            });
        });

        // Add boss rotation animation
        entity.$el.addClass('boss-rotate');
    },
    
    messages: {
        'render'(entity, data) {
            const boss = entity.getData('boss');
            if (boss.isDefeated) return;

            const radius = this.defaultData.radius;
            
            // Update component positions based on rotation
            Object.entries(boss.components).forEach(([key, component]) => {
                const angle = (component.rotationOffset + boss.currentRotation) * (Math.PI / 180);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                // Find and update component display entity
                const displayEntity = entity.engine.findEntityByTag(key);
                if (displayEntity) {
                    displayEntity.setData('position', { x, y });
                    
                    // Update visibility and color based on vulnerability
                    if (component.isVulnerable) {
                        displayEntity.setData('renderer', {
                            char: this.defaultData.componentIcons[key],
                            color: '#ffffff' // Highlight vulnerable components
                        });
                        displayEntity.$el.addClass('component-vulnerable');
                    } else {
                        displayEntity.setData('renderer', {
                            char: this.defaultData.componentIcons[key],
                            color: this.defaultData.componentColors[key]
                        });
                        displayEntity.$el.removeClass('component-vulnerable');
                    }
                    
                    // Update health display
                    const healthEntity = entity.engine.findEntityByTag(`component-health-${key}`);
                    if (healthEntity) {
                        healthEntity.setData('position', { x, y: y + 1 });
                        healthEntity.setData('renderer', {
                            char: '❤️',
                            color: component.active ? '#ff0000' : '#666666'
                        });
                    }

                    // Update effect indicator
                    const effectEntity = entity.engine.findEntityByTag(`component-effect-${key}`);
                    if (effectEntity) {
                        effectEntity.setData('position', { x, y: y - 1 });
                        effectEntity.setData('renderer', {
                            char: '✨',
                            color: this.defaultData.effectColors[component.effect]
                        });
                    }
                }
            });
            
            // Draw vulnerability indicator
            const vulnerableAngle = boss.vulnerableAngle * (Math.PI / 180);
            const indicatorX = Math.cos(Math.PI) * radius;
            const indicatorY = Math.sin(Math.PI) * radius;
            
            // Create or update vulnerability indicator
            let indicatorEntity = entity.engine.findEntityByTag('vulnerability-indicator');
            if (!indicatorEntity) {
                indicatorEntity = entity.engine.createEntity({
                    tags: ['vulnerability-indicator']
                });
                indicatorEntity.addComponent('position', { x: indicatorX, y: indicatorY });
                indicatorEntity.addComponent('renderer', { char: '⬆️', color: '#ffff00' });
            } else {
                indicatorEntity.setData('position', { x: indicatorX, y: indicatorY });
            }
        },

        'component-damaged'(entity, data) {
            const displayEntity = entity.engine.findEntityByTag(data.component);
            if (displayEntity) {
                displayEntity.$el.addClass('component-damage');
                setTimeout(() => {
                    displayEntity.$el.removeClass('component-damage');
                }, 500);
            }
        },

        'phase-changed'(entity, data) {
            entity.$el.addClass('phase-transition');
            setTimeout(() => {
                entity.$el.removeClass('phase-transition');
            }, 1000);
        },

        'power-increased'(entity, data) {
            // Create a floating power indicator
            const powerEntity = entity.engine.createEntity({
                tags: ['power-indicator']
            });
            
            powerEntity.addComponent('position', {
                x: 0,
                y: 0
            });
            
            powerEntity.addComponent('renderer', {
                char: `+${data.amount}⚡`,
                color: '#ffd93d'
            });
            
            // Animate the power indicator floating up
            powerEntity.$el.css({
                position: 'absolute',
                animation: 'float-up 1s ease-out forwards'
            });
            
            // Remove after animation
            setTimeout(() => {
                powerEntity.destroy();
            }, 1000);
        },

        'boss-defeated'(entity, data) {
            // Stop boss rotation
            entity.$el.removeClass('boss-rotate');
            
            // Hide all components
            Object.keys(data.components).forEach(key => {
                const displayEntity = entity.engine.findEntityByTag(key);
                if (displayEntity) {
                    displayEntity.$el.hide();
                }
                
                const healthEntity = entity.engine.findEntityByTag(`component-health-${key}`);
                if (healthEntity) {
                    healthEntity.$el.hide();
                }
                
                const effectEntity = entity.engine.findEntityByTag(`component-effect-${key}`);
                if (effectEntity) {
                    effectEntity.$el.hide();
                }
            });
            
            // Hide vulnerability indicator
            const indicatorEntity = entity.engine.findEntityByTag('vulnerability-indicator');
            if (indicatorEntity) {
                indicatorEntity.$el.hide();
            }

            // Create the person entity for the walk-out animation
            const personEntity = entity.engine.createEntity({
                tags: ['defeated-boss']
            });
            
            personEntity.addComponent('position', {
                x: 0,
                y: 0
            });
            
            personEntity.addComponent('renderer', {
                char: '👨‍💼',
                color: '#ffffff'
            });

            // Add walk animation and dialogue
            personEntity.$el.addClass('walk');
            
            // Create dialogue bubble
            const dialogueEntity = entity.engine.createEntity({
                tags: ['defeat-dialogue']
            });
            
            dialogueEntity.addComponent('position', {
                x: 0,
                y: -2
            });
            
            dialogueEntity.addComponent('renderer', {
                char: '"Oh gee, I didn\'t see it that way, let\'s try your design for the generator!"',
                color: '#ffffff'
            });

            // Position dialogue above person
            dialogueEntity.$el.css({
                position: 'absolute',
                'text-align': 'center',
                'white-space': 'nowrap',
                'background-color': 'rgba(0, 0, 0, 0.8)',
                padding: '5px 10px',
                'border-radius': '5px',
                'font-size': '14px'
            });

            // Remove entities after animation
            setTimeout(() => {
                personEntity.destroy();
                dialogueEntity.destroy();
            }, 3000);
        }
    }
});

export default BossRenderer; 