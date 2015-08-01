module.exports = function() {
    return {
        onAdd: function(entity, component) {
            if (!component.events) {
                component.events = true;
                $(document).keydown(function(e) {
                    if (component.engine.isPlaying) {
                        component.entities.getList().forEach(function(entity) {
                             entity.sendMessage('keydown', { which: e.which });
                        });
                    }
                });
                $(document).keyup(function(e) {
                    if (component.engine.isPlaying) {
                        component.entities.getList().forEach(function(entity) {
                             entity.sendMessage('keyup', { which: e.which });
                        });
                    }
                });
            }
        }
    };
}