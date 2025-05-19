define(function() {
    return function Position() {
        return {
            _: {
                x: 0,
                y: 0,
                z: 0,
                rotation: 0,
                scale: 1,
                layer: 0
            },
            messages: {
                'move': function(entity, data) {
                    if (data.x !== undefined) entity.data.x = data.x;
                    if (data.y !== undefined) entity.data.y = data.y;
                    if (data.z !== undefined) entity.data.z = data.z;
                    if (data.rotation !== undefined) entity.data.rotation = data.rotation;
                    if (data.scale !== undefined) entity.data.scale = data.scale;
                    if (data.layer !== undefined) entity.data.layer = data.layer;
                }
            }
        };
    };
});