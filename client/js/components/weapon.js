var Chance = require('../util/chance'),
    chance = new Chance();

module.exports = function() {
    return {
        _: {
            offset: {
                x: -35,
                y: 35
            },
            pursueTarget: false,
            icon: 'ax',
            damage: '1d4',
            ability: null, //function(entity),
            state: 'not-held'
        },
        onAdd: function(entity, component) {
            if (this.mountTarget) {
                this.mountTarget.data.weapon = entity;
                this.state = 'held';
            }
            this.$el.click(function() {
                if (this.state == 'held') {
                    entity.sendMessage('drop');
                } else {
                    var player = entity.engine.findEntityByTag('player');
                    if (player.data.weapon) {
                        player.data.weapon.sendMessage('drop');
                    }
                    
                    entity.sendMessage('equip', { wielder: player });
                }
            })
            
            this.$el.attr('title', this.icon + ': ' + this.damage);
        },
        requiredComponents: ['mounted', 'animation', 'glyphicon-renderer', 'world-entity'],
        messages: {
            attack: function(entity, data) {
                if (!data.target || !this.state == 'held') {
                    return false;
                }
                
                data.target.sendMessage('damage', {amount: chance.rpg(this.damage, {sum:true})});
                entity.sendMessage('animate', { animation: 'attack-down' });
                return true;
            },
            equip: function(entity, data) {
                if (!data.wielder) {
                    return;
                }
                
                if (this.state == 'held') {
                    entity.sendMessage('drop');
                }
                
                entity.sendMessage('mount', {target: data.wielder });
                data.wielder.data.weapon = entity;
                this.state = 'held';
            },
            drop: function(entity, data) {
                if (this.state == 'held') {
                    this.state = 'not-held';
                    this.mountTarget.data.weapon = null;
                    entity.sendMessage('switch-to-current-level');
                    entity.sendMessage('dismount', {});
                }
            }
        }
        
    };
}