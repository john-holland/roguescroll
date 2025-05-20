import Component from '../engine/component';
import _ from '../util/random';

const DesignSubmission = Component.build('design-submission', {
    requiredComponents: ['position', 'renderer'],
    defaultData: {
        submissions: [],
        currentDesign: null,
        designStats: {
            powerEfficiency: 0,
            waterEfficiency: 0,
            costEfficiency: 0,
            innovationScore: 0,
            safetyScore: 0
        },
        componentTypes: {
            fan: ['desk-fan', 'ceiling-fan', 'computer-fan', 'custom-fan'],
            battery: ['lithium-ion', 'lead-acid', 'supercapacitor', 'custom-battery'],
            bladder: ['soda-bottle', 'water-bladder', 'custom-bladder'],
            alternator: ['copper-coil', 'neodymium-magnet', 'custom-alternator'],
            circuitBreaker: [
                'light-bulb-fuse',
                'thermal-breaker',
                'resettable-fuse',
                'custom-breaker'
            ]
        },
        safetyFeatures: {
            'light-bulb-fuse': {
                description: 'Simple light bulb that burns out when current is too high',
                cost: 1,
                reliability: 0.7,
                responseTime: 0.5
            },
            'thermal-breaker': {
                description: 'Temperature-sensitive breaker that trips when system overheats',
                cost: 2,
                reliability: 0.9,
                responseTime: 0.8
            },
            'resettable-fuse': {
                description: 'Automatically resets after cooling down',
                cost: 3,
                reliability: 0.95,
                responseTime: 0.9
            },
            'custom-breaker': {
                description: 'Your own custom safety solution',
                cost: 4,
                reliability: 0.8,
                responseTime: 0.7
            }
        }
    },
    
    onAdd: function(entity) {
        // Initialize submission data
        if (!entity.hasData('submissions')) {
            entity.setData('submissions', this.defaultData.submissions);
        }
        if (!entity.hasData('currentDesign')) {
            entity.setData('currentDesign', this.defaultData.currentDesign);
        }
        
        // Create submission form entity
        const formEntity = entity.engine.createEntity({
            tags: ['submission-form']
        });
        
        formEntity.addComponent('html-renderer', {
            template: 'submission-form',
            data: {
                componentTypes: this.defaultData.componentTypes,
                designStats: this.defaultData.designStats
            }
        });
    },
    
    messages: {
        'submit-design': function(entity, data) {
            const submission = {
                id: Date.now(),
                name: data.name || 'Anonymous',
                components: data.components,
                description: data.description,
                materials: data.materials,
                safetyFeatures: data.safetyFeatures || [],
                timestamp: new Date().toISOString(),
                stats: this.calculateDesignStats(data.components, data.safetyFeatures)
            };
            
            // Add to submissions list
            const submissions = entity.getData('submissions');
            submissions.push(submission);
            entity.setData('submissions', submissions);
            
            // Send notification
            entity.sendMessage('design-submitted', {
                submission: submission
            });
            
            // Update leaderboard
            this.updateLeaderboard(entity);
        },
        
        'view-design': function(entity, data) {
            const submission = entity.getData('submissions').find(s => s.id === data.id);
            if (submission) {
                entity.setData('currentDesign', submission);
                entity.sendMessage('design-viewed', {
                    submission: submission
                });
            }
        },
        
        'rate-design': function(entity, data) {
            const submissions = entity.getData('submissions');
            const submission = submissions.find(s => s.id === data.id);
            if (submission) {
                submission.ratings = submission.ratings || [];
                submission.ratings.push({
                    userId: data.userId,
                    rating: data.rating,
                    comment: data.comment
                });
                
                // Update average rating
                submission.averageRating = this.calculateAverageRating(submission.ratings);
                
                entity.setData('submissions', submissions);
                entity.sendMessage('design-rated', {
                    submission: submission
                });
            }
        }
    },
    
    calculateDesignStats: function(components, safetyFeatures) {
        return {
            powerEfficiency: this.calculatePowerEfficiency(components),
            waterEfficiency: this.calculateWaterEfficiency(components),
            costEfficiency: this.calculateCostEfficiency(components),
            innovationScore: this.calculateInnovationScore(components),
            safetyScore: this.calculateSafetyScore(components, safetyFeatures)
        };
    },
    
    calculatePowerEfficiency: function(components) {
        // Calculate based on component types and combinations
        let score = 0;
        if (components.fan && components.alternator) {
            score += 50;
            if (components.fan === 'custom-fan') score += 20;
            if (components.alternator === 'neodymium-magnet') score += 30;
        }
        return Math.min(100, score);
    },
    
    calculateWaterEfficiency: function(components) {
        // Calculate based on bladder type and water management
        let score = 0;
        if (components.bladder) {
            score += 40;
            if (components.bladder === 'water-bladder') score += 30;
            if (components.bladder === 'custom-bladder') score += 40;
        }
        return Math.min(100, score);
    },
    
    calculateCostEfficiency: function(components) {
        // Calculate based on material costs and complexity
        let score = 100;
        const expensiveComponents = ['neodymium-magnet', 'lithium-ion', 'supercapacitor'];
        expensiveComponents.forEach(comp => {
            if (Object.values(components).includes(comp)) {
                score -= 20;
            }
        });
        return Math.max(0, score);
    },
    
    calculateInnovationScore: function(components) {
        // Calculate based on unique combinations and custom components
        let score = 0;
        Object.values(components).forEach(comp => {
            if (comp.startsWith('custom-')) score += 25;
        });
        return Math.min(100, score);
    },
    
    calculateAverageRating: function(ratings) {
        if (!ratings || ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        return sum / ratings.length;
    },
    
    calculateSafetyScore: function(components, safetyFeatures) {
        let score = 0;
        
        // Base score for having a circuit breaker
        if (components.circuitBreaker) {
            const breakerType = components.circuitBreaker;
            const breakerStats = this.defaultData.safetyFeatures[breakerType];
            
            if (breakerStats) {
                score += breakerStats.reliability * 50;
                score += breakerStats.responseTime * 30;
            }
        }
        
        // Additional safety features
        if (safetyFeatures) {
            safetyFeatures.forEach(feature => {
                switch(feature) {
                    case 'water-level-sensor':
                        score += 20;
                        break;
                    case 'temperature-monitor':
                        score += 20;
                        break;
                    case 'automatic-shutdown':
                        score += 30;
                        break;
                    case 'battery-protection':
                        score += 25;
                        break;
                }
            });
        }
        
        // Penalty for high-power components without proper safety
        if (components.alternator === 'neodymium-magnet' && !components.circuitBreaker) {
            score -= 40;
        }
        
        return Math.min(100, Math.max(0, score));
    },
    
    updateLeaderboard: function(entity) {
        const submissions = entity.getData('submissions');
        const leaderboard = submissions
            .sort((a, b) => {
                const scoreA = (a.stats.powerEfficiency + a.stats.waterEfficiency + 
                              a.stats.costEfficiency + a.stats.innovationScore + 
                              a.stats.safetyScore) / 5;
                const scoreB = (b.stats.powerEfficiency + b.stats.waterEfficiency + 
                              b.stats.costEfficiency + b.stats.innovationScore + 
                              b.stats.safetyScore) / 5;
                return scoreB - scoreA;
            })
            .slice(0, 10);
        
        entity.sendMessage('leaderboard-updated', {
            leaderboard: leaderboard
        });
    }
});

export default DesignSubmission; 