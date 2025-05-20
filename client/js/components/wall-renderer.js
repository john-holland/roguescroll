import Component from '../engine/component';

const WallRenderer = Component.build('wall-renderer', {
    requiredComponents: ['position', 'wall'],
    defaultData: {
        canvas: null,
        ctx: null,
        segmentElements: new Map()
    },
    
    onAdd: function(entity) {
        if (!entity.hasData('wall-renderer')) {
            entity.setData('wall-renderer', this.defaultData);
        }
        
        // Create canvas if it doesn't exist
        const renderer = entity.getData('wall-renderer');
        if (!renderer.canvas) {
            renderer.canvas = document.createElement('canvas');
            renderer.canvas.style.position = 'absolute';
            renderer.canvas.style.top = '0';
            renderer.canvas.style.left = '0';
            renderer.canvas.style.pointerEvents = 'none';
            document.body.appendChild(renderer.canvas);
            
            renderer.ctx = renderer.canvas.getContext('2d');
            
            // Set canvas size to window size
            this.resizeCanvas(renderer);
            window.addEventListener('resize', () => this.resizeCanvas(renderer));
        }
    },
    
    messages: {
        'render': function(entity, data) {
            const renderer = entity.getData('wall-renderer');
            const wall = entity.getData('wall');
            
            // Clear canvas
            renderer.ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);
            
            // Draw all segments
            wall.segments.forEach(segment => {
                this.drawSegment(renderer, segment);
            });
        },
        
        'segment-created': function(entity, data) {
            const renderer = entity.getData('wall-renderer');
            const segment = data.segment;
            
            // Create new segment element
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.backgroundColor = segment.color;
            element.style.transformOrigin = '0 0';
            document.body.appendChild(element);
            
            // Store element reference
            renderer.segmentElements.set(segment, element);
            
            // Initial render
            this.updateSegmentElement(element, segment);
        },
        
        'update-segment': function(entity, data) {
            const renderer = entity.getData('wall-renderer');
            const segment = data.segment;
            const element = renderer.segmentElements.get(segment);
            
            if (element) {
                this.updateSegmentElement(element, segment);
            }
        }
    },
    
    resizeCanvas: function(renderer) {
        renderer.canvas.width = window.innerWidth;
        renderer.canvas.height = window.innerHeight;
    },
    
    drawSegment: function(renderer, segment) {
        const ctx = renderer.ctx;
        
        ctx.beginPath();
        ctx.moveTo(segment.startPoint.x, segment.startPoint.y);
        ctx.lineTo(segment.endPoint.x, segment.endPoint.y);
        ctx.strokeStyle = segment.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    },
    
    updateSegmentElement: function(element, segment) {
        // Calculate segment properties
        const dx = segment.endPoint.x - segment.startPoint.x;
        const dy = segment.endPoint.y - segment.startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Update element style
        element.style.width = `${length}px`;
        element.style.height = '2px';
        element.style.left = `${segment.startPoint.x}px`;
        element.style.top = `${segment.startPoint.y}px`;
        element.style.transform = `rotate(${angle}deg)`;
    }
});

export default WallRenderer; 