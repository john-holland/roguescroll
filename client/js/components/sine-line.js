module.exports = function() {
    return {
        _: {
            sineLineOffset: {
                x: 0,
                y: 200
            },
            isStaticPosition: false
        },
        requiredComponents: ["position"],
        onAdd: function(entity, component) {
            if (!component.spawned) {
                component.spawned = true;
                
                for (var i = 0; i < 25; i++) {
                    var ent = entity.engine.createEntity({ tags: ['hide-at-start'] });
                    ent.addComponent("sine-line", { });
                    ent.addComponent("glyphicon-renderer", { icon: "clock" });
                }
            }
        },
        aggregateUpdate: function(dt, entities, component) {
            var i = 1,
                gameTime = component.engine.gameTime,
                halfDocWidth = $(document).width() / 2;
            entities.getList().forEach(function(entity) {
                entity.data.position.x = halfDocWidth + entity.data.sineLineOffset.x + (Math.sin(gameTime / 1000 + i) * (50));
                entity.data.position.y = entity.data.sineLineOffset.y + i * 20;
                i++;
            });
        }
    };
}