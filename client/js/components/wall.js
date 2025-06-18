import Component from '../engine/component';
import _ from '../util/random';

const Wall = Component.build('wall', {
    requiredComponents: ['position'],
    defaultData: {
        direction: 'left', // 'left', 'right', 'up', 'down'
        segments: [],
        maxWidth: 0,
        minLength: 0,
        currentLength: 0,
        color: '#eee',
        segmentConfig: {
            minLength: 50,
            maxLength: 200,
            minWidth: 50,
            maxWidth: 75
        }
    },
    
    onAdd: function(entity) {
        if (!entity.hasData('wall')) {
            entity.setData('wall', this.defaultData);
        }
        
        // Initialize wall segments
        this.generateSegments(entity);
    },
    
    messages: {
        'update': function(entity, data) {
            const wall = entity.getData('wall');
            
            // Check if we need to generate more segments
            if (wall.currentLength < wall.minLength) {
                this.generateSegments(entity);
            }
            
            // Update segment positions
            this.updateSegments(entity);
        },
        
        'set-min-length': function(entity, data) {
            const wall = entity.getData('wall');
            wall.minLength = data.length;
            
            // Generate more segments if needed
            if (wall.currentLength < wall.minLength) {
                this.generateSegments(entity);
            }
        },
        
        'set-color': function(entity, data) {
            const wall = entity.getData('wall');
            wall.color = data.color;
            
            // Update all segments with new color
            wall.segments.forEach(segment => {
                segment.color = data.color;
                entity.sendMessage('update-segment', { segment });
            });
        }
    },
    
    generateSegments: function(entity) {
        const wall = entity.getData('wall');
        const position = entity.getData('position');
        
        while (wall.currentLength < wall.minLength) {
            const lastSegment = wall.segments[wall.segments.length - 1];
            const startPoint = lastSegment ? {
                x: lastSegment.endPoint.x,
                y: lastSegment.endPoint.y
            } : {
                x: position.x,
                y: position.y
            };
            
            // Generate end point based on direction and constraints
            const endPoint = this.generateEndPoint(startPoint, wall);
            
            // Create new segment
            const segment = {
                startPoint,
                endPoint,
                length: Math.sqrt(
                    Math.pow(endPoint.x - startPoint.x, 2) +
                    Math.pow(endPoint.y - startPoint.y, 2)
                ),
                color: wall.color
            };
            
            wall.segments.push(segment);
            wall.currentLength += segment.length;
            
            // Notify renderer of new segment
            entity.sendMessage('segment-created', { segment });
        }
    },
    
    generateEndPoint: function(startPoint, wall) {
        const config = wall.segmentConfig;
        let endPoint;
        
        switch (wall.direction) {
            case 'left':
            case 'right':
                endPoint = {
                    x: startPoint.x + (wall.direction === 'right' ? 1 : -1) * 
                       _.random(config.minWidth, config.maxWidth),
                    y: startPoint.y + _.random(config.minLength, config.maxLength)
                };
                break;
                
            case 'up':
            case 'down':
                endPoint = {
                    x: startPoint.x + _.random(-config.maxWidth, config.maxWidth),
                    y: startPoint.y + (wall.direction === 'down' ? 1 : -1) * 
                       _.random(config.minLength, config.maxLength)
                };
                break;
        }
        
        // Ensure end point stays within bounds
        endPoint.x = Math.max(0, Math.min(endPoint.x, wall.maxWidth));
        
        return endPoint;
    },
    
    updateSegments: function(entity) {
        const wall = entity.getData('wall');
        const position = entity.getData('position');
        
        // Update segment positions relative to wall position
        wall.segments.forEach((segment, index) => {
            const startPoint = index === 0 ? position : wall.segments[index - 1].endPoint;
            segment.startPoint = startPoint;
            
            // Notify renderer of segment update
            entity.sendMessage('update-segment', { segment });
        });
    }
});

export default Wall; 