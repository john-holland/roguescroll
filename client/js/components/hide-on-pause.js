module.exports = function() {
    return {
        messages: {
            "game-pause": function(entity, data) {
                entity.sendMessage("hide");
            },
            "game-resume": function(entity, data) {
                entity.sendMessage("show");
            },
            "game-start": function(entity, data) {
                if (!entity.engine.isPlaying) {
                    entity.sendMessage("hide");
                }
            }
        }
    };
}