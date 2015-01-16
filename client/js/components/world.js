module.exports = function() {
    return {
        _: {
            lowestKnownY: 0
        },
        requiredComponents: ["position"],
        onAdd: function(entity, component) {
            if (!component.worldEntity) component.worldEntity = entity.engine.components.get('world-entity');
            if (!component.worldEntity) component.player = entity.engine.findEntityByTag(['player'])[0];
            
            entity.sendMessage("set-dimensions", {
                width: 1000,
                height: 3000
            });
        },
        aggragateUpdate: function(dt, entities, component) {
            var self = this;
            var previousLowest = self.lowestKnownY;
            component.worldEntity.entities.getList().forEach(function(entity) {
                if (entity.data.position.y > self.lowestKnownY) {
                    self.lowestKnownY = entity.data.position.y;
                }
            });
            
            if (this.lowestKnownY > previousLowest) {
                
            }
        },
        messages: {
            "set-dimensions": function(entity, data) {
                var previousHeight = this.size.height;
                if ('width' in data) entity.data.size.width = data.width;
                if ('height' in data) entity.data.size.height = data.height;
                if ('x' in data) entity.data.size.x = data.x;
                if ('y' in data) entity.data.size.y = data.y;
                
                if (this.size.height != previousHeight) {
                    var $game = $("#game"),
                    hidden = $game.css("display") === 'none';
                    $game.show();
                    $game.css("height", this.size.height + "px");
                    if (hidden) {
                        $game.hide();
                    }
                }
            }
        }
    };
}