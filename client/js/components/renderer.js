import Renderer from '../engine/renderer';

export default function RendererComponent(Renderer) {
    return function RendererComponent() {
        return {
            _: {
                renderer: null,
                visible: true,
                alpha: 1,
                tint: 0xFFFFFF,
                blendMode: PIXI.BLEND_MODES.NORMAL
            },
            messages: {
                'init': function(entity) {
                    this.renderer = new Renderer(entity);
                },
                'update': function(entity) {
                    if (this.renderer) {
                        this.renderer.update(entity);
                    }
                },
                'set-visible': function(entity, data) {
                    this.visible = data.visible;
                    if (this.renderer) {
                        this.renderer.setVisible(this.visible);
                    }
                },
                'set-alpha': function(entity, data) {
                    this.alpha = data.alpha;
                    if (this.renderer) {
                        this.renderer.setAlpha(this.alpha);
                    }
                },
                'set-tint': function(entity, data) {
                    this.tint = data.tint;
                    if (this.renderer) {
                        this.renderer.setTint(this.tint);
                    }
                },
                'set-blend-mode': function(entity, data) {
                    this.blendMode = data.blendMode;
                    if (this.renderer) {
                        this.renderer.setBlendMode(this.blendMode);
                    }
                }
            }
        };
    };
}; 