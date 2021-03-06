define(function() { 
    var V2 = require('../util/V2'),
        ImmutableV2 = V2.ImmutableV2,
        V2 = V2.V2;
        
    return function LevelDoor() {
        return {
            _: {
                icon: 'exit',
                senseTag: 'player',
                position: {
                    x: 0,
                    y: 7300
                },
                senseRange: 50,
                leads: 'down'
            },
            requiredComponents: ['center-aligned', 'glyphicon-renderer', 'world-entity', 'sensor'],
            messages: {
                sensed: function(entity, data) {
                    if (this.leads == 'down') entity.engine.findEntityByTag('world').sendMessage('go-down');
                    else if (this.leads == 'up') entity.engine.findEntityByTag('world').sendMessage('go-up');
                }
            }
        };
    }
})