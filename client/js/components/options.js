define(function() {
    var _ = require('../util/underscore');
    var buzz = require('../util/buzz');
    var $ = require('jquery');

    return function Options() {
        return {
            _: {
                size: {
                    width: null,
                    height: null
                },
                positionAnchor: 'bottom-right',
                levelSetsColor: false,
                'z-index': 10000,
                optionTemplates: {
                  slider: {
                      init: function(entity, option, $parent, $el) {
                          $($el).change(function() {
                              option.set($(this).val())
                          });
                          return $el;
                      },
                      set: function($el, value) {
                          $($el).val(value);
                      }
                  },
                  boolean: {
                      init: function(entity, option, $parent, $el) {
                          $($el).change(function() {
                              option.set($($el).is(':checked'))
                          })
                      },
                      set: function($el, value) {
                          $($el).val(value);
                      }
                  },
                  textbox: {
                      init: function(entity, option, $parent, $el) {
                          $($el).change(function() {
                              option.set($(this).val())
                          });
                          return $el;
                      },
                      set: function($el, value) {
                          $($el).val(value);
                      }
                  },
                  'textarea': {
                      init: function(entity, option, $parent, $el) {
                          $($el).change(function() {
                              option.set($(this).val())
                          })
                          return $el;
                      },
                      set: function($el, value) {
                          $($el).val(value);
                      }
                  },
                  'number': {
                      init: function(entity, option, $parent, $el) {
                          $($el).change(function() {
                              option.set($(this).val())
                          });
                          return $el;
                      },
                      set: function($el, value) {
                          $($el).val(value);
                      }
                  },
                  text: {
                      init: function(entity, option, $parent, $el) {
                          $($el).change(function() {
                              option.set($(this).val())
                          });
                          return $el;
                      },
                      set: function($el, value) {
                          $($el).val(value);
                      }
                  }
                },
                options: {
                    //if you provide an object, you must provide an function optionsTemplate(option, value, entity, component)
                    // setup sensible data-attributes and use find() selectors on $el to setup callbacks
                    'dev options': {
                        type: 'text',
                        get: function() {
                            return 'These options should be disabled upon release... probably.';
                        },
                        set: function() {
                            
                        }
                    },
                    'temp max mode (30s)': {
                        type: 'boolean',
                        get: function(entity) {
                            return entity.data.tempMaxMode || false;
                        },
                        set: function(entity, value) {
                            if (value) {
                                entity.data.tempMaxMode = true;
                                // Store original values
                                entity.data.originalValues = {
                                    speed: entity.data.options.speed.get(entity),
                                    health: entity.data.options.health.get(entity),
                                    damage: entity.data.options.damage.get(entity),
                                    audio: entity.data.options['audio level'].get(entity)
                                };
                                
                                // Set to max
                                entity.data.options.speed.set(1000);
                                entity.data.options.health.set(200);
                                entity.data.options.damage.set(999);
                                entity.data.options['audio level'].set(100);
                                
                                // Reset after 30 seconds
                                setTimeout(() => {
                                    entity.data.tempMaxMode = false;
                                    entity.data.options.speed.set(entity.data.originalValues.speed);
                                    entity.data.options.health.set(entity.data.originalValues.health);
                                    entity.data.options.damage.set(entity.data.originalValues.damage);
                                    entity.data.options['audio level'].set(entity.data.originalValues.audio);
                                }, 30000);
                            }
                        }
                    },
                    'coffee break': {
                        type: 'boolean',
                        get: function(entity) {
                            return entity.data.coffeeBreak || false;
                        },
                        set: function(entity, value) {
                            if (value) {
                                entity.data.coffeeBreak = true;
                                const player = entity.engine.findEntityByTag('player');
                                const enemies = entity.engine.findEntitiesByTag('enemy');
                                
                                if (enemies.length > 0) {
                                    // Find closest enemy
                                    const closestEnemy = enemies.reduce((closest, enemy) => {
                                        const dist = Math.abs(enemy.data.position.x - player.data.position.x);
                                        return (!closest || dist < closest.dist) ? {enemy, dist} : closest;
                                    }, null).enemy;
                                    
                                    // 50% chance enemy smokes
                                    if (Math.random() < 0.5) {
                                        // Enemy smokes - they'll return with player
                                        closestEnemy.data.willReturn = true;
                                        closestEnemy.sendMessage('coffee-break', {withPlayer: true});
                                    } else {
                                        // Enemy doesn't smoke - they'll stay
                                        closestEnemy.sendMessage('coffee-break', {withPlayer: false});
                                    }
                                }
                                
                                // Reset after 60 seconds
                                setTimeout(() => {
                                    entity.data.coffeeBreak = false;
                                    if (closestEnemy && closestEnemy.data.willReturn) {
                                        closestEnemy.sendMessage('return-from-break');
                                    }
                                }, 60000);
                            }
                        }
                    },
                    'max mode': {
                        type: 'boolean',
                        get: function(entity) {
                            return entity.data.maxMode || false;
                        },
                        set: function(entity, value) {
                            entity.data.maxMode = value;
                            if (value) {
                                // Set all values to max
                                entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
                                entity.data.playerCache.data.speed = 1000;
                                entity.data.playerCache.data.health = 200;
                                if (entity.data.playerCache.data.weapon) {
                                    entity.data.playerCache.data.weapon.data.damage = 999;
                                }
                                entity.data.buzz.all().setVolume(100);
                                
                                // Update UI
                                entity.data.options.speed.set(1000);
                                entity.data.options.health.set(200);
                                entity.data.options.damage.set(999);
                                entity.data.options['audio level'].set(100);
                            }
                        }
                    },
                    speed: {
                        type: 'slider',
                        min: 0,
                        max: 1000,
                        step: 1,
                        get: function(entity) {
                            entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
                            return entity.data.playerCache.data.speed;
                        },
                        set: function(entity, value) {
                            entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
                            entity.data.playerCache.data.speed = value;
                        }
                    },
                    health: {
                        type: 'slider',
                        min: 0,
                        max: 200,
                        step: 1,
                        get: function(entity) {
                            entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
                            return entity.data.playerCache.data.health;
                        },
                        set: function(entity, value) {
                            entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
                            entity.data.playerCache.data.health = value;
                        }
                    },
                    'damage': {
                        type: 'textbox',
                        get: function(entity) {
                            entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
                            return entity.data.playerCache.data.weapon.data.damage;
                        },
                        set: function(entity, value) {
                            entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
                            entity.data.playerCache.data.weapon.data.damage = value;
                        }
                    },
                    'game options': {
                        type: 'text',
                        get: function() {
                            return '';
                        },
                        set: function() {
                            
                        }
                    },
                    'audio level': {
                        type: 'slider',
                        min: 0,
                        max: 100,
                        step: 1,
                        get: function(entity) {
                            entity.data.musicCache = entity.data.musicCache || entity.engine.findEntityByTag('music');
                            return entity.data.musicCache.data.volume;
                        },
                        set: function(entity, value) {
                            entity.data.buzz.all().setVolume(value);
                        }
                    }
                },
                isStaticPosition: true,
                htmlTemplateFactory: function(entity, component) {
                    _.pairs(entity.data.options).forEach(function(optPair) {
                        optPair[1].name = optPair[0];
                    })

                    const domParser = new DOMParser();

                    const parseHtml = (htmlString) => domParser.parseFromString(htmlString, 'text/html').body.firstElementChild;
                    
                    var $options = parseHtml(require('../templates/options.hbs')({ options: entity.data.options }));
                    
                    _.pairs(entity.data.options).forEach(function(optPair) {
                        var self = entity.data,
                            name = optPair[0],
                            option = optPair[1],
                            template = self.optionTemplates[option.type];
                            
                        option._name = name;

                        var $el = parseHtml(require('../templates/optionControls/' + option.type + '.hbs')(_.extend({value: option.get(entity)}, option)))

                        var $li = parseHtml('<li></li>');
                        $options.querySelector('.options-list').append($li);
                        $li.append($el);
                        option.$el = template.init(entity, option, $options, $el);
                        
                        var userModifier = option.set;
                        
                        option.set = function(value) {
                            if (userModifier) {
                                userModifier(entity, value);
                            }
                            template.set(option.$el, value);
                        }
                        
                        
                        option._template = template;
                        option._previousValue = undefined;
                    });
                    
                    return $options;
                }
            },
            onAdd: function(entity, component) {
                this.buzz = buzz;
                this.updateOptions = _.values(this.options);
            },
            update: function(dt, entity, component) {
                //each update, iterate through all options and call get 
                
                this.updateOptions.forEach(function(option) {
                    var currentValue = option.get(entity);
                    
                    if (currentValue !== option._previousValue) {
                        option.set(currentValue);
                        option._previousValue = currentValue;
                    }
                });
            },
            requiredComponents: ['html-renderer']
        };
    }
});