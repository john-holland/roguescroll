define(function() {
    var Chance = require('../util/chance'),
        _ = require('../util/underscore'),
        chance = new Chance();
    
    function Spell(icon, damageRoll) {
        this.icon = icon;
        this.damageRoll = damageRoll;
        
        this.getDamage = function() {
            return chance.rpg(this.damageRoll, {sum:true});
        };
        
        this.damageTarget = function(target) {
            target.sendMessage('damage', { amount: this.getDamage() });
        }
    }
    
    var icons = ['heat', 'magic', 'fire', 'snowflake', 'stroller', 'ipod', 'flash', 'pizza', 'hazard'];
    Spell.createRandom = function() {
        var damage = chance.integer({ min: 1, max: 4 }) + 'd' + chance.integer({ min: 1, max: 12 }),
            icon = icons[chance.integer({min: 0, max: icons.length - 1 })];
            
        return new Spell(icon, damage);
    };
    
    return Spell;
})