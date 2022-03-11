define(function() {
    var _ = require('../util/underscore');
    var buzz = require('../util/buzz');
    var $ = require('../util/jquery');

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