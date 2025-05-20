class Renderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
    }

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    render(entities) {
        if (!this.ctx) {
            return;
        }

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Sort entities by z-index
        const sortedEntities = entities.sort((a, b) => {
            const aZ = a.getComponent('renderer')?.data.zIndex || 0;
            const bZ = b.getComponent('renderer')?.data.zIndex || 0;
            return aZ - bZ;
        });

        // Render each entity
        sortedEntities.forEach(entity => {
            const renderer = entity.getComponent('renderer');
            if (renderer && renderer.render) {
                renderer.render(this.ctx);
            }
        });
    }

    resize(width, height) {
        if (this.canvas) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.width = width;
            this.height = height;
        }
    }
}

export default Renderer; 