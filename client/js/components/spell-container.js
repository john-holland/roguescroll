define(function() {
    var $ = require('jquery');
    
    return function SpellContainer() {
       return {
           requiredComponents: ['html-renderer'],
           _: {
               levelSetsColor: false,
               size: {
                   height: null,
                   width: null
               },
               positionAnchor: 'bottom-left',
               isStaticPosition: true,
               spells: [],
               'z-index': 800,
               htmlTemplateFactory: function(entity, component) {
                   return $(require('../templates/spells.hbs')());
               }
           },
           onAdd: function() {
               
           },
           messages: {
               'add-spell': function(entity, data, component) {
                   if (!data.spell) {
                       throw new Error('Must have a spell model to add!')
                   }
                   
                   var $spell = $('<div class="spell glyphicons glyphicons-' + data.spell.icon + '" />').appendTo(this.$el);
                   
                   $spell.click(function() {
                       var spellEntity = entity.engine.createEntity(),
                           player = entity.engine.findEntityByTag('player').data;
                            
                       spellEntity.addComponent('spell', {
                           icon: data.spell.icon,
                           position: {
                               x: player.position.x,
                               y: player.position.y
                           }
                       });
                       
                       spellEntity.data.model = data.spell;
                       
                       $spell.remove();
                   })
                   
               }
           }
       };
   } 
});