import Component from '../engine/component';

const LevelRenderer = Component.build('level-renderer', {
    requiredComponents: ['position', 'level'],
    defaultData: {
        canvas: null,
        ctx: null,
        container: null,
        activeLevels: new Set()
    },
    
    onAdd: function(entity) {
        if (!entity.hasData('level-renderer')) {
            entity.setData('level-renderer', this.defaultData);
        }
        
        const renderer = entity.getData('level-renderer');
        
        // Create container if it doesn't exist
        if (!renderer.container) {
            renderer.container = document.createElement('div');
            renderer.container.style.position = 'absolute';
            renderer.container.style.top = '0';
            renderer.container.style.left = '0';
            renderer.container.style.width = '100%';
            renderer.container.style.height = '100%';
            renderer.container.style.pointerEvents = 'none';
            document.body.appendChild(renderer.container);
        }
        
        // Create canvas if it doesn't exist
        if (!renderer.canvas) {
            renderer.canvas = document.createElement('canvas');
            renderer.canvas.style.position = 'absolute';
            renderer.canvas.style.top = '0';
            renderer.canvas.style.left = '0';
            renderer.canvas.style.width = '100%';
            renderer.canvas.style.height = '100%';
            renderer.canvas.style.pointerEvents = 'none';
            renderer.container.appendChild(renderer.canvas);
            
            renderer.ctx = renderer.canvas.getContext('2d');
            
            // Set canvas size to window size
            this.resizeCanvas(renderer);
            window.addEventListener('resize', () => this.resizeCanvas(renderer));
        }
    },
    
    messages: {
        'render': function(entity, data) {
            const renderer = entity.getData('level-renderer');
            const level = entity.getData('level');
            
            // Clear canvas
            renderer.ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);
            
            // Only render active levels
            if (level.isActive) {
                this.renderLevel(renderer, level);
            }
        },
        
        'level-activated': function(entity, data) {
            const renderer = entity.getData('level-renderer');
            renderer.activeLevels.add(data.levelId);
        },
        
        'level-deactivated': function(entity, data) {
            const renderer = entity.getData('level-renderer');
            renderer.activeLevels.delete(data.levelId);
        }
    },
    
    resizeCanvas: function(renderer) {
        renderer.canvas.width = window.innerWidth;
        renderer.canvas.height = window.innerHeight;
    },
    
    renderLevel: function(renderer, level) {
        const ctx = renderer.ctx;
        const position = level.entity.getData('position');
        
        // Draw level background
        ctx.fillStyle = level.color + '20'; // Add transparency
        ctx.fillRect(
            position.x - 400,
            position.y - 400,
            800,
            800
        );
        
        // Draw level border
        ctx.strokeStyle = level.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(
            position.x - 400,
            position.y - 400,
            800,
            800
        );
        
        // Draw level ID
        ctx.fillStyle = level.color;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `Level ${level.id}`,
            position.x,
            position.y - 380
        );
        
        // Draw difficulty indicator
        const difficulty = '★'.repeat(level.difficulty);
        ctx.fillText(
            difficulty,
            position.x,
            position.y - 360
        );
    }
});

export default LevelRenderer; 