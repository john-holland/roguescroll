define(function() {
    var _ = require("../util/underscore"),
        V2 = require("../util/V2"),
        ImmutableV2 = V2.ImmutableV2,
        V2 = V2.V2;
    
    return function Vision() {
        return {
            _: {
                sightRange: 400,
                withinSight: [],
                showVision: true,
                circleColor: null
            },
            onAdd: function(entity, component) {
                this.world = entity.engine.findEntityByTag('world')[0];
                var world = this.world;
                this.visionCircle = entity.engine.createEntity({tags: ['vision-circle']})
                    .addComponent('html-renderer', {
                        htmlTemplateFactory: function(entity, component) {
                            return "<div style='position:absolute;border:2px dashed " + entity.engine.findEntityByTag('world')[0].data.currentLevel.colors.accent.toHexString() + "'></div>";
                        }
                    })
                    .addComponent('mounted', {
                        mountTag: 'player',
                        offset: {
                            x:0,
                            y:0
                        }
                    });
                this.visionCircle.sendMessage('init');
                this.visionCircle.data.$el.transition({
                    'border-radius': this.sightRange + 'px'
                });
                this.visionCircle.data.size.width = this.sightRange * 2;
                this.visionCircle.data.size.height = this.sightRange * 2;
                this.$el.click(function() {
                    entity.data.visionCircle.shouldRender ^= 1;
                })
            },
            update: function(dt, entity, component) {
                if (this.showVision && this.circleColor != this.world.data.currentLevel.colors.accent.toHexString()) {
                    this.circleColor = this.world.data.currentLevel.colors.accent.toHexString();
                    this.visionCircle.data.$el.css({'border-color': this.circleColor });
                }
                
                this.withinSight = _.filter(entity.engine.findEntityByTag('vision-candidate'), function(visionCandidate) {
                    var canSee = visionCandidate.isActive && V2.distanceBetween(entity.data.position, visionCandidate.data.position) < entity.data.sightRange;
                    
                    if (canSee) {
                        visionCandidate.sendMessage('show');
                    } else {
                        visionCandidate.sendMessage('hide');
                    }
                    
                    return canSee;
                });
            }
        };
    };
});