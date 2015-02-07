var ListMap = require("../util/listmap");
var _ = require("../util/underscore");

module.exports = function Animation() {
    return {
        _: {
            currentAnimation: null,
            animationQueue: []
        },
        requiredComponents: ['glyphicon-renderer'],
        onAdd: function(entity, component) {
            if (!component.animationMetadata) {
                var animationMetadata = new ListMap();
                var metadata = {
                    walk: {
                        duration: 1000,
                        looping: true,
                        defferable: true
                    },
                    "attack-down": {
                        duration: 1000,
                        looping: false,
                        defferable: false
                    },
                    "attack-up": {
                        duration: 1000,
                        looping: false,
                        defferable: false
                    },
                    "walk-down-steps": {
                        duration: 3000,
                        looping: false,
                        defferable: false
                    },
                    "take-damage": {
                        duration: 750,
                        looping: false,
                        defferable: false
                    },
                    "fall-down-pit": {
                        duration: 1000,
                        looping: false,
                        defferable: false
                    },
                    death: {
                        duration: 1000,
                        looping: false,
                        defferable: false
                    },
                    "take-critical-damage": {
                        duration: 750,
                        looping: false,
                        defferable: false
                    },
                    explode: {
                        duration: 1000,
                        looping: false,
                        defferable: false
                    }
                };
                
                for (var prop in metadata) {
                    if (metadata.hasOwnProperty(prop)) {
                        var data = metadata[prop];
                        data.name = prop;
                        animationMetadata.add(prop, data);
                    }
                }
                
                component.animationMetadata = animationMetadata;
                
                component.playAnimation = function(data, entity, animation, callback) {
                    if (!component.animationMetadata.contains(animation)) {
                        console.error("tried to play a bad animation");
                    }
                    
                    if (data.currentAnimation && data.currentAnimation.metadata.name == animation && data.currentAnimation.metadata.looping) {
                        //don't restart a looping animation
                        return;
                    }
                    
                    var animationData = component.animationMetadata.get(animation),
                        playCurrent = false,
                        animationWrapper = {
                            metadata: animationData,
                            callback: callback,
                            started: entity.engine.gameTime
                        };
                    
                    if (!data.currentAnimation) {
                        playCurrent = true;
                    } else {
                        var currentAnimation = data.currentAnimation;
                        
                        if (currentAnimation.metadata.defferable) {
                            entity.data.animationQueue.push(currentAnimation);
                            playCurrent = true;
                        }
                    }
                    
                    if (playCurrent) {
                        data.currentAnimation = animationWrapper;
                        
                        component.playForElem(data.$el, component, data, animationData)
                    } else {
                        data.animationQueue.push(animationWrapper);
                    }
                };
            
                component.playForElem = function(elem, component, data, metadata) {
                    //remove all the other animation classes.
                    if (elem && elem.hasClass("animated")) {
                        component.animationMetadata.getList().forEach(function(metadata) {
                            elem.removeClass(metadata.name);
                        });
                    } else if (elem) {
                        elem.addClass("animated");
                    }
                    
                    if (metadata.looping) {
                        elem.addClass("infinite-animation");
                    }
                    
                    if (elem) {
                        elem.addClass(metadata.name);
                    }
                };
                
                component.stopCurrent = function(elem, component, data) {
                    if (elem) {
                        elem.removeClass("animated");
                        elem.removeClass("infinite-animation");
                        component.animationMetadata.getList().forEach(function(metadata) {
                            elem.removeClass(metadata.name);
                        });
                        
                        if (data.currentAnimation) {
                            elem.removeClass(data.currentAnimation.name);
                        }
                    }
                };
            }
        },
        update: function(dt, entity, component) {
            //check to see if our current animation is over and start the next one.
            // check to see if any in the queue are now done. remove them and fire their callbacks if any
            var playNext = !this.currentAnimation || (!this.currentAnimation.metadata.looping 
                    && (this.currentAnimation.started + this.currentAnimation.metadata.duration) < entity.engine.gameTime);
                    
            if (this.currentAnimation && playNext) {
                if (this.currentAnimation.callback) {
                    this.currentAnimation.callback();
                }
                
                component.stopCurrent(this.$el, component, this);
                
                this.currentAnimation = null;
            }
            
            //remove any that are already over
            if (_.any(this.animationQueue, function(animation) {
                return animation.started + animation.metadata.duration < entity.engine.gameTime && !animation.metadata.looping;
            })) {
                this.animationQueue = _.filter(this.animationQueue, function(animation) {
                    var over = animation.started + animation.metadata.duration < entity.engine.gameTime && !animation.metadata.looping;
                    if (over && animation.callback) {
                        animation.callback();
                    }
                    
                    return !over;
                });
            }
            
            if (playNext && this.animationQueue.length) {
                this.currentAnimation = this.animationQueue.pop();
                component.playForElem(this.$el, component, this, this.currentAnimation.metadata);
            }
        },
        messages: {
            animate: function(entity, data, component) {
                if (!data || !data.animation) {
                    return;
                }
                
                var animation = data.animation,
                    callback = data.callback;
                    
                component.playAnimation(this, entity, animation, callback);
            },
            "stop-animating": function(entity, data, component) {
                if (data.animation) {
                    if (this.currentAnimation && this.currentAnimation.metadata.name == data.animation) {
                        if (this.$el) {
                            this.$el.removeClass("animated");
                            this.$el.removeClass(data.animation);
                            this.$el.removeClass("infinite-animation");
                        }
                        if (this.currentAnimation.callback) {
                            this.currentAnimation.callback();
                        }
                        this.currentAnimation = null;
                    }
                    
                    if (this.animationQueue.length && _.any(this.animationQueue, function(animation) {
                        return animation.metadata.name === data.animation;
                    })) {
                        this.animationQueue = _.filter(this.animationQueue, function(animation) {
                            return animation.metadata.name !== data.animation;
                        });
                    }
                    return;
                }
                
                //stop the current animation
                this.$el.removeClass("animated");
                component.animationMetadata.getList().forEach(function(metadata) {
                    data.$el.removeClass(metadata.name);
                });
                if (this.currentAnimation) {
                    this.$el.removeClass(this.currentAnimation.name);
                }
                    
                if (this.currentAnimation) {
                    this.$el.removeClass(this.currentAnimation.name);
                    if (this.currentAnimation.callback) {
                        this.currentAnimation.callback();
                    }
                }
                
                this.animationQueue.forEach(function(animation) {
                   if (animation.callback) {
                       animation.callback();
                   }
                });
                
                this.animationQueue = [];
            }
        }
    };
};