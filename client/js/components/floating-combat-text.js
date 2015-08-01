var _ = require('expose?_!../util/underscore');

module.exports = function() {
    return {
        _: {
          createTextEntity: function(entity, options) {
                var text = entity.engine.createEntity();
                text.addComponent('glyphicon-renderer', {icon: options.icon ? options.icon : 'globe', position: { x: this.position.x, y: this.position.y } });
                text.addComponent('text', {});
                text.data.levelSetsIconColor = false;
                
                if (!options.iconColor) {
                    text.data.$el.css('color', 'green');
                } else {
                    text.data.$el.css('color', options.iconColor);
                }
                
                if (!options.textColor) {
                    text.data.$text.css('color', '#eee');
                } else {
                    text.data.$text.css('color', options.textColor);
                }
                
                if (options.html) {
                    text.data.$text.html(options.html);
                } else {
                    text.data.$text.text(options.text);
                }
                
                text.addComponent('movement', { speed: 100 });
                text.sendMessage('go-to', {
                    x: this.position.x + _.random(-60, 60),
                    y: this.position.y + (this.direction === 'up' ? 200 : -200)
                        + _.random(-60, 60),
                    callback: function() {
                        text.destroy();
                    }
                })
                
                setTimeout(function() {
                    //in two seconds destroy the entity
                    text.destroy();
                }, 3000);
            }  
        },
        messages: {
            'damage': function(entity, data) {
                this.createTextEntity.call(this, entity, {icon: data.isCritical ? 'dice' : 'tint', text: data.amount, iconColor:'red'});
            },
            'heal': function(entity, data) {
                this.createTextEntity.call(this, entity, {icon: 'heart', text: data.amount, iconColor:'green'});
            },
            'roll': function(entity, data) {
                this.createTextEntity.call(this, entity, {icon:'dice', text: data.roll, iconColor:'red'});
            },
            'blocked': function(entity, data) {
                this.createTextEntity.call(this, entity, {icon: 'shield', text: data.amount, iconColor: 'blue'})
            }
        }
    };
}