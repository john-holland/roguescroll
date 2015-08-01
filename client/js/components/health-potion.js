module.exports = function() {
    return {
        _: {
            healingAmount: 30,
            icon: 'lab',
            useRange: 100
        },
        requiredComponents: ['glyphicon-renderer', 'center-aligned', 'world-entity'],
        // requiredComponents: {
        //     'glyphicon-renderer': {
        //         icon: 'lab',
        //     },
        //     'center-aligned': { }
        // },
        onAdd: function(entity, component) {
            this.player = entity.engine.findEntityByTag('player'); 
        },
        update: function(dt, entity, component) {
            if (Math.abs(this.player.data.position.y - this.position.y) < this.useRange) {
                this.player.sendMessage('heal', { amount: this.healingAmount });
                entity.sendMessage('hide');
                entity.isActive = false;
            }
        }
    };
}