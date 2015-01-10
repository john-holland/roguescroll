/**
 * ROGUE SCROLL:
 * 
 * Rogue like in one dimension.
 * 
 * Only use symbols from glyphicons
 * 
 * Bootstrap. Use bootstraps scroll spy to start the game once the index is below page 1.
 * 
 * 2 options in nav: Pause, Play
 * 
 * Once use scrolls down, they start to descend. As they descend they the page will grow.
 * 
 **/

var RogueScroll = null;

$(function() {
    RogueScroll = new Game({
        name: "Rogue Scroll",
        components: { 
            health: {
                _: {
                    health: 100,
                    maxHealth: 100
                },
                messages: {
                    "damage": function(entity, data) {
                        entity.data.health -= data.amount || 0;
                        
                        if (entity.data.health <= 0) {
                            entity.sendMessage("death", { overkill: entity.data.health * -1 });
                        }
                    },
                    "heal": function(entity, data) {
                        entity.data.health += data.amount || 0;
                        entity.data.health = Math.min(entity.data.health, this.maxHealth);
                    }
                }
            },
            position: {
                _: {
                    position: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        width: 24,
                        height: 24
                    },
                    rotation: 0,
                    isFixedPosition: false
                },
                messages: {
                    'set-position-type': function(entity, data) {
                        this.isFixedPosition = (data || { }).isFixedPosition || false;
                    }
                }
            },
            animation: {
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
                                
                                component.playForElem(data.$renderedIcon, component, data, animationData)
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
                        
                        component.stopCurrent(this.$renderedIcon, component, this);
                        
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
                        component.playForElem(this.$renderedIcon, component, this, this.currentAnimation.metadata);
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
                                if (this.$renderedIcon) {
                                    this.$renderedIcon.removeClass("animated");
                                    this.$renderedIcon.removeClass(data.animation);
                                    this.$renderedIcon.removeClass("infinite-animation");
                                }
                                if (this.currentAnimation.callback) {
                                    this.currentAnimation.callback();
                                }
                                this.currentAnimation = null;
                            }
                            
                            if (this.animationQueue.length && _.any(this.animationQueue, function(animation) {
                                return animation.metadata.name === data.name;
                            })) {
                                this.animationQueue = _.filter(this.animationQueue, function(animation) {
                                    return animation.metadata.name !== data.name;
                                })
                            }
                            return;
                        }
                        
                        //stop the current animation
                        if (this.$renderedIcon) {
                            this.$renderedIcon.removeClass("animated");
                            component.animationMetadata.getList().forEach(function(metadata) {
                                data.$renderedIcon.removeClass(metadata.name);
                            });
                            if (this.currentAnimation) {
                                this.$renderedIcon.removeClass(this.currentAnimation.name);
                            }
                        }
                            
                        if (this.currentAnimation) {
                            this.$renderedIcon.removeClass(this.currentAnimation.name);
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
            },
            'glyphicon-renderer': {
                _: {
                    icon: "user",
                    selector: "#game",
                    renderBuffer: {
                        position: {
                            x: 0,
                            y: 0,
                        },
                        rotation: 0,
                        width: 0,
                        height: 0,
                        shouldRender: false
                    }
                },
                requiredComponents: ['position'],
                onAdd: function(entity, component) {
                    $(this.selector).append($("<span style='position: " + (this.isStaticPosition ? "fixed" : "absolute") + 
                        "; display: block; overflow: visible' class='glyphicons glyphicons-"
                        + this.icon + "' data-entity-id='" + entity.id + "'></span>"));
                    
                    this.$renderedIcon = $("span[data-entity-id='" + entity.id + "']");
                    
                    if (!entity.shouldRender) {
                        this.$renderedIcon.hide();
                    }
                },
                update: function(dt, entity, component) {
                    if (this.renderBuffer.shouldRender != entity.shouldRender) {
                        if (entity.shouldRender && !this.renderBuffer.shouldRender && this.$renderedIcon) {
                            this.$renderedIcon.show();
                        } else if (!entity.shouldRender && this.renderBuffer.shouldRender && this.$renderedIcon) {
                            this.$renderedIcon.hide();
                        }
                    }
                    
                    this.renderBuffer.shouldRender = entity.shouldRender;
                },
                render: function(dt, entity, component) {
                    //todo: I should really use transform here, as it produces much smoother movement.
                    //todo: Use the current scroll of the screen as the 'active rectangle' to choose what to render.
                    if (this.renderBuffer.position.x == this.position.x &&
                        this.renderBuffer.position.y == this.position.y &&
                        this.renderBuffer.width == this.size.width &&
                        this.renderBuffer.height == this.size.height) {
                        return;
                    }
                    
                    if (this.renderBuffer.shouldRender != entity.shouldRender) {
                        if (entity.shouldRender && !this.renderBuffer.shouldRender) {
                            this.$renderedIcon.show();
                        } else if (!entity.shouldRender && this.renderBuffer.shouldRender) {
                            this.$renderedIcon.hide();
                        }
                    }
                    
                    if (entity.shouldRender) {
                        this.$renderedIcon.transition({ 
                            left: this.position.x - (this.size.width / 2),
                            top: this.position.y - (this.size.height / 2),
                            "font-size": ((this.size.height + this.size.width) / 2) + "px",
                            duration: 0,
                            queue: false,
                            rotate: (this.rotation !== null) ? this.rotation + 'deg' : null
                        });   
                    }
                    
                    this.renderBuffer.position.x = this.position.x;
                    this.renderBuffer.position.y = this.position.y;
                    this.renderBuffer.width = this.size.width;
                    this.renderBuffer.height = this.size.height;
                    this.renderBuffer.shouldRender = entity.shouldRender;
                },
                onRemove: function(entity, component) {
                    if (this.$renderedIcon) {
                        this.$renderedIcon.remove();
                    }
                },
                messages: {
                    show: function(entity, data) {
                        if (entity.data.$renderedIcon) {
                            entity.data.$renderedIcon.show();
                        }
                        entity.shouldRender = true;
                    },
                    hide: function(entity, data) {
                        if (entity.data.$renderedIcon) {
                            entity.data.$renderedIcon.hide();
                        }
                        entity.shouldRender = false;
                    },
                    'change-icon': function(entity, data) {
                        if (!data.icon) {
                            throw new Error("Must receive icon to render!");
                        }
                        if (entity.data.$renderedIcon) {
                            entity.data.$renderedIcon.removeClass("glyphicons-" + entity.data.icon);
                            entity.data.icon = data.icon;
                            entity.data.$renderedIcon.addClass("glyphicons-" + data.icon);
                        }
                    },
                    'set-position-type': function(entity, data) {
                        if (data.isStaticPosition) {
                            this.$renderedIcon.css("position", "fixed");
                        } else {
                            this.$renderedIcon.css("position", "absolute");
                        }
                    }
                }
            },
            movement: {
                _: {
                    target: {
                        x: 0,
                        y: 0,
                        stopAfterArrival: false,
                        callbacks: []
                    },
                    speed: 100,
                    isMoving: false,
                    pursueTarget: true,
                    ignoreXForTarget: true,
                    direction: "down"
                },
                update: function(dt, entity, component) {
                    if (!this.pursueTarget) {
                        return;
                    }
                    
                    // A -> B :: B - A
                    var _x = this.target.x - this.position.x,
                        _y = this.target.y - this.position.y,
                        newPosition = new V2(_x, _y),
                        length = newPosition.Length();
                    
                    //we should check the dot product of the 
                    if ((this.ignoreXForTarget && Math.abs(this.target.y - this.position.y) < 10) ||
                        (this.ignoreXForTarget && length < 10)) {
                        if (this.isMoving) {
                            entity.sendMessage("stop-animating", {animation: "walk"});
                        }
                        this.isMoving = false;
                        
                        if (this.target.stopAfterArrival) {
                            this.pursueTarget = false;
                        }
                        
                        while (this.target.callbacks && this.target.callbacks.length) {
                            this.target.callbacks.pop()();
                        }
                        return;
                    }
                    
                    if (!this.isMoving) {
                        entity.sendMessage("animate", {animation: "walk"});
                    }
                    
                    this.isMoving = true;
                    
                    newPosition.Normalize().Multiply((dt / 1000) * this.speed);
                        
                    this.position.x += newPosition.X;
                    this.position.y += newPosition.Y;
                    
                    this.direction = this.position.y > this.target.y ? "down" : "up";
                    
                    if (typeof this.worldY !== 'undefined') {
                        this.target.y = this.worldY * 50;
                    }
                },
                requiredComponents: ["position"],
                messages: {
                    "go-to": function(entity, data) {
                        this.target.x = data.x;
                        this.target.y = data.y;
                        
                        if ("stopAfterArrive" in data) this.target.stopAfterArrival = data.stopAfterArrive;
                        if ("callback" in data) this.target.callback = data.callback;
                    }
                }
            },
            "center-aligned": {
                requiredComponents: ["movement"],
                onAdd: function(entity, component) {
                    if (!component.getCenter) {
                        component.getCenter = function(data) {
                            return data.$document.width() / 2 - data.size.width / 2;
                        }
                    }
                    this.$document = $(document);
                    this.position.x = component.getCenter(this);
                    this.target.x = component.getCenter(this);
                },
                update: function(dt, entity, component) {
                    this.target.x = component.getCenter(this);
                }
            },
            combatant: {
                _: {
                    lastAttackTime: null,
                    attackCooldown: 1000,
                    range: 20,
                    side: "baddies"
                },
                requiredComponents: ["health", "movement", "position"],
                onAdd: function(entity, component) {
                    this.tryAttack = function() {
                        if (this.lastAttackTime === null || (entity.engine.gameTime - this.attackCooldown) > this.lastAttackTime) {
                            var data = this;
                            var targets = _.filter(entity.engine.entities.getList(), function(entity) {
                                return "side" in entity.data && "position" in entity.data && "health" in entity.data &&
                                       entity.data.health > 0 &&
                                       entity.data.side !== data.side && Math.abs(entity.data.position.y - data.position.y) < data.range;
                            });
                            
                            if (targets.length) {
                                var metadata = entity.sendMessage("targets-in-range", { targets: targets });
                                
                                if (_.any(metadata.results, function(result) {
                                    return !!result;
                                })) {
                                    this.lastAttackTime = entity.engine.gameTime;
                                    return true;
                                }
                            }
                        }
                        
                        return false;
                    };
                },
                update: function(dt, entity, component) {
                    if (this.health <= 0) {
                        //dead men don't attack...
                        return;
                    }
                    
                    this.tryAttack();
                },
                messages: {
                    "damage": function(entity, data) {
                        if (this.health > 0) {
                            entity.sendMessage("animate", { animation: data.isCritical ? "take-critical-damage" : "take-damage" });
                        }
                    },
                    "death": function(entity, data) {
                        entity.sendMessage("animate", { animation: "death" });
                    },
                    "attack": function(entity, data) {
                        this.tryAttack();
                    }
                }
            },
            "health-potion": {
                _: {
                    healingAmount: 30,
                    icon: "lab",
                    useRange: 100
                },
                requiredComponents: ["glyphicon-renderer", "center-aligned"],
                // requiredComponents: {
                //     'glyphicon-renderer': {
                //         icon: 'lab',
                //     },
                //     'center-aligned': { }
                // },
                onAdd: function(entity, component) {
                    this.player = entity.engine.findEntityByTag("player")[0];  
                },
                update: function(dt, entity, component) {
                    if (Math.abs(this.player.data.position.y - this.position.y) < this.useRange) {
                        this.player.sendMessage("heal", { amount: this.healingAmount });
                        entity.sendMessage("hide");
                        entity.isActive = false;
                    }
                }
            },
            "scroll-chaser": {
                _: {
                },
                onAdd: function() {
                    this.$game = $("#game");
                    this.$menu = $("#menu");
                    this.$scrollContainer = $("#scroll-container");
                    this.$document = $(document);
                    this.topMargin = Math.abs(parseInt(this.$menu.css("margin-top").replace("px", ""))) * 2;
                },
                update: function(dt, entity, component) {
                    var top = Math.max(this.$document.scrollTop() - this.$menu.height(), 0) + this.topMargin;

                    this.target.y = top;
                },
                requiredComponents: ["movement"]
            },
            "weapon": {
                _: {
                    offset: {
                        x: -35, 
                        y: 35
                    },
                    downOffset: {
                        x: -35,
                        y: 35
                    },
                    upOffset: {
                        x: 35,
                        y: -35
                    },
                    pursueTarget: false,
                    icon: "ax"
                },
                onAdd: function(entity, component) {
                    if (this.mountTarget) this.mountTarget.data.weapon = entity;
                },
                update: function(dt, entity, component) {
                    if (this.target) {
                        if (this.target.direction == "down") {
                            this.offset = this.downOffset;
                        } else {
                            this.offset = this.upOffset;
                        }
                    }
                },
                requiredComponents: ["mounted", "animation", "glyphicon-renderer"]
            },
            "shield": {
                _: {
                    offset: {
                        x: 35, 
                        y: 35
                    },
                    downOffset: {
                        x: 35,
                        y: 35
                    },
                    upOffset: {
                        x: -35,
                        y: -35
                    },
                    pursueTarget: false,
                    icon: "shield"
                },
                onAdd: function(entity, component) {
                    if (this.mountTarget) this.mountTarget.data.shield = entity;
                },
                update: function(dt, entity, component) {
                    if (this.target) {
                        if (this.target.direction == "down") {
                            this.offset = this.downOffset;
                        } else {
                            this.offset = this.upOffset;
                        }
                    }
                },
                requiredComponents: ["mounted", "animation", "glyphicon-renderer"]
            },
            "player": {
                _: {
                    side: 'goodies',
                    baseMiss: 10
                },
                onAdd: function(entity, component) {
                },
                requiredComponents: ["health", "scroll-chaser", "position", "glyphicon-renderer", "center-aligned", "animation"],
                messages: {
                    "targets-in-range": function(entity, data) {
                        //for now we'll just hit one at a time.
                        if (!data.targets || !data.targets.length) {
                            return false;
                        }
                        
                        if (this.direction == "down") {
                            entity.sendMessage("animate", { animation: "attack-down" });
                        } else {
                            entity.sendMessage("animate", { animation: "attack-up" });
                        }
                        
                        var target = data.targets[0];
                        var toHit = _.random(this.character.skills / 2, (this.character.brawn + this.character.skills) / 3);
                        
                        if (toHit > target.data.baseMiss) {
                            //hit!
                            target.sendMessage("damage", { 
                                amount: _.random(this.character.brains + this.character.level, this.character.brawn * 2 + this.character.level), 
                                isCritical: _.random(this.character.skills / 4, 20) > 18
                            });
                        }
                        
                        return true;
                    },
                    "keydown": function(entity, data) {
                        if (data.which == 65) {
                           this.weapon.sendMessage("animate", { animation: "attack-down" });
                       }
                    }
                }
            },
            "enemy": {
                _: {
                    target: null,
                    icon: 'skull',
                    baseMiss: 10,
                    side: 'baddies',
                    senseDistance: 100,
                    patrolTopTarget: {
                        x: 0,
                        y: 0
                    },
                    patrolBottomTarget: {
                        x: 0,
                        y: 0
                    },
                    patrolTo: "top",
                    isPatrolling: false
                },
                onAdd: function(entity, component) {
                },
                update: function(dt, entity, component) {
                    if (!this.player) {
                        return;
                    }
                    
                    if (Math.abs(this.position.y - this.player.data.position.y) < this.senseDistance) {
                        entity.isPatrolling = false;
                        this.target.y = this.player.data.position.y + 20;
                    } else {
                        //partrol.
                        if (!this.isPatrolling) {
                            this.isPatrolling = true;
                            var continuePatrol = function() {
                                var data = entity.data;
                                entity.sendMessage("go-to", {
                                    x: data.patrolTo === "top" ? data.patrolTopTarget.x : data.patrolBottomTarget.x,
                                    y: data.patrolTo === "top" ? data.patrolTopTarget.y : data.patrolBottomTarget.y,
                                    callback: function() {
                                        if (entity.data.isPatrolling) {
                                            if (entity.data.patrolTo === 'bottom') {
                                                entity.data.patrolTo = 'top';
                                            } else {
                                                entity.data.patrolTo = 'bottom';
                                            }
                                        }
                                        continuePatrol();
                                    }
                                });
                            }
                            continuePatrol();
                        }
                    }
                },
                requiredComponents: ["health", "movement", "world-entity", "combatant", 'glyphicon-renderer', 'center-aligned'],
                messages: {
                    'game-start': function(entity, data) {
                        this.player = entity.engine.findEntityByTag("player")[0];
                        this.world = entity.engine.findEntityByTag("world")[0];
                        this.baseMiss += _.random(this.player.data.character.level / 2, this.player.data.character.level);
                    }
                }
            },
            "mounted": {
                _: {
                    mountId: null,
                    mountTag: "",
                    offset: {
                        x:null,
                        y:null
                    },
                    mountTarget: null
                },
                onAdd: function(entity, component) {
                    if (!component.tryMount) {
                        component.tryMount = function(data, entity, mountTarget, mountId, mountTag) {
                            if (mountTarget && mountTarget.data && mountTarget.data.position) {
                                data.mountTarget = mountTarget;
                                return;
                            }
                            
                            if (mountId !== null) {
                                data.mountTarget = entity.engine.entities.get(mountId);
                                
                                if (data.mountTarget) {
                                    return;
                                }
                            }
                            
                            if (mountTag) {
                                data.mountTarget = entity.engine.findEntityByTag(data.mountTag)[0];
                                
                                if (data.mountTarget) {
                                    return;
                                }
                            }
                        }
                    }
                    
                    entity.sendMessage("mount", { 
                        target: this.mountTarget,
                        mountId: this.mountId,
                        mountTag: this.mountTag
                    });
                },
                update: function(dt, entity, component) {
                    if (!this.mountTarget) {
                        return;
                    }
                    
                    if (this.offset.x !== null) {
                        this.position.x = this.mountTarget.data.position.x + this.offset.x;
                    }
                    
                    if (this.offset.y !== null) {
                        this.position.y = this.mountTarget.data.position.y + this.offset.y;
                    }
                    
                    entity.shouldRender = this.mountTarget.shouldRender;
                    this.direction = this.mountTarget.data.direction;
                },
                requiredComponents: ["position"],
                messages: {
                    mount: function(entity, data, component) {
                        component.tryMount(this, entity, data.target, data.mountId, data.mountTag);
                    },
                    dismount: function(entity, data, component) {
                        this.mountTarget = null;
                    }
                }
            },
            "sine-line": {
                _: {
                    sineLineOffset: {
                        x: 0,
                        y: 200
                    },
                    isStaticPosition: false
                },
                requiredComponents: ["position"],
                onAdd: function(entity, component) {
                    if (!component.spawned) {
                        component.spawned = true;
                        
                        for (var i = 0; i < 25; i++) {
                            var ent = entity.engine.createEntity({ tags: ['hide-at-start'] });
                            ent.addComponent("sine-line", { });
                            ent.addComponent("glyphicon-renderer", { icon: "clock" });
                        }
                    }
                },
                aggregateUpdate: function(dt, entities, component) {
                    var i = 1,
                        gameTime = component.engine.gameTime,
                        halfDocWidth = $(document).width() / 2;
                    entities.getList().forEach(function(entity) {
                        entity.data.position.x = halfDocWidth + entity.data.sineLineOffset.x + (Math.sin(gameTime / 1000 + i) * (50));
                        entity.data.position.y = entity.data.sineLineOffset.y + i * 20;
                        i++;
                    });
                }
            },
            "enemy-spawner": {
                _: {
                    lastSpawnTime: null,
                    spawnCooldown: 10000, //every 10 seconds,
                    enemiesToSpawn: 20,
                    spawnPosition: null // set with { x, y } object
                },
                onAdd: function(entity, component) {
                    this.lastSpawnTime = entity.engine.gameTime;
                },
                update: function(dt, entity, component) {
                    if (this.enemiesToSpawn <= 0 || (entity.engine.gameTime - this.lastSpawnTime) < this.spawnCooldown) {
                        return;
                    }
                    
                    this.lastSpawnTime = entity.engine.gameTime;
                    this.enemiesToSpawn--;
                    
                    //create the enemy!
                    var patrolCenter = _.random(0, this.world.data.size.height);
                    var patrolRange = _.random(0, this.world.data.size.height / this.enemiesToSpawn);
                    
                    var patrolTop = patrolCenter - (patrolRange / 2);
                    var patrolBottom = patrolCenter + (patrolRange / 2);
                    var position = { y: patrolCenter, x: 0 };
                    
                    var enemy = entity.engine.createEntity();
                    
                    if (this.spawnPosition !== null) {
                        position = this.spawnPosition;
                    }
                    
                    enemy.addComponent("enemy", { position: position, icon: "skull", target: { y: 0 } });
                    
                    enemy.data.patrolTopTarget.y = patrolTop;
                    enemy.data.patrolBottomTarget.y = patrolBottom;
                },
                messages: {
                    init: function(entity, data) {
                        this.world = entity.engine.findEntityByTag("world")[0];
                    }
                }
            },
            "world-entity": {
                _: {
                    worldY: 0
                },
                requiredComponents: ["movement"],
                onAdd: function(){
                    $("#game").keydown(function (e) {
                        
                    })
                },
                update: function(dt, entity, component) {
                    //get screen to world.
                    var translation = 50;
                    this.position.y = this.worldY * translation;
                }
            },
            "world": {
                _: {
                    lowestKnownY: 0
                },
                requiredComponents: ["position"],
                onAdd: function(entity, component) {
                    if (!component.worldEntity) component.worldEntity = entity.engine.components.get('world-entity');
                    if (!component.worldEntity) component.player = entity.engine.findEntityByTag(['player'])[0];
                    
                    entity.sendMessage("set-dimensions", {
                        width: 1000,
                        height: 3000
                    });
                },
                aggragateUpdate: function(dt, entities, component) {
                    var self = this;
                    var previousLowest = self.lowestKnownY;
                    component.worldEntity.entities.getList().forEach(function(entity) {
                        if (entity.data.position.y > self.lowestKnownY) {
                            self.lowestKnownY = entity.data.position.y;
                        }
                    });
                },
                messages: {
                    "set-dimensions": function(entity, data) {
                        var previousHeight = this.size.height;
                        if ('width' in data) entity.data.size.width = data.width;
                        if ('height' in data) entity.data.size.height = data.height;
                        if ('x' in data) entity.data.size.x = data.x;
                        if ('y' in data) entity.data.size.y = data.y;
                        
                        if (this.size.height != previousHeight) {
                            $("#game").css("height", this.size.height + "px");
                        }
                    }
                }
            },
            "game-manager": {
                _: {
                    gameState: "not-started",
                    levels: []
                },
                tags: [],
                messages: {
                    init: function(entity, data) {
                        entity.sendMessage("character-selection", { });
                    },
                    "character-selection": function(entity, data) {
                        if (this.gameState !== "not-started") {
                            return;
                        }
                        
                        this.gameState = "character-selection";
                        
                        entity.engine.findEntityByTag('hide-at-start').forEach(function(entity) {
                            entity.sendMessage("hide");
                        });
                        
                        //pick your character!
                        var characters = ["user", "woman", "girl", "old-man", "cat", "dog", "lamp"];
                        characters = _.map(characters, function(character) {
                            var char = {
                                name: character,
                                icon: character,
                                skills: 10, //crit chance
                                brains: 10, //spell cost
                                brawn: 10, //attack damage
                                light: 10, //light amount,
                                level: 1
                            };
                            
                            switch (character) {
                                case "cat":
                                    char.name = "April";
                                    char.skills += 10;
                                    char.brawn -= 5;
                                    char.description = "A ca- aw jesus! I almost stepped on your tail, damnit cat!"
                                    break;
                                case "dog":
                                    char.name = "Sadie";
                                    char.brawn += 10;
                                    char.skills -= 5;
                                    char.description = "A dog. Woof woof!"
                                    break;
                                case "lamp":
                                    char.name = "Ozwald the Incinerator";
                                    char.light += 10;
                                    char.brains -= 5;
                                    char.description = "A lamp. It's bright, but not that bright!"
                                    break;
                                case "old-man":
                                    char.name = "Frank"
                                    char.brawn -= 5;
                                    char.brains += 10;
                                    char.description = "A wizened old man. What he's lost in muscle tone, he's learned in the magical arts."
                                    break;
                                case "girl":
                                    char.name = "Cindy";
                                    char.skills += 10;
                                    char.light -= 5;
                                    char.description = "A little girl. She's scrappy but not very well equipped."
                                    break;
                                case "user":
                                    char.name = "Joe";
                                    char.description = "A man. Just a regular joe.";
                                    break;
                                case "woman":
                                    char.name = "Jane";
                                    char.description = "A woman. Plain jane.";
                                    break;
                            }
                            
                            return char;
                        });
                        
                        var characterTemplate = Handlebars.compile($("#character-select-template").html());
                        
                        $("#game").append($(characterTemplate({characters: characters})));
                        
                        function setCharacterUi(selectedCharacter) {
                            //set the active on the character
                            $(".character-selection .character-name-input").attr("placeholder", selectedCharacter.name);
                            $(".character-selection .character-description").text(selectedCharacter.description);
                            $(".character-selection .skills").text(selectedCharacter.skills);
                            $(".character-selection .brains").text(selectedCharacter.brains);
                            $(".character-selection .brawn").text(selectedCharacter.brawn);
                            $(".character-selection .light").text(selectedCharacter.light);
                        }
                        
                        setCharacterUi(characters[0]);
                        
                        var data = this;
                        $(".character-selection .character-portrait").click(function() {
                            var $this = $(this);
                            
                            $(".character-selection .character-portrait").removeClass("active");
                            $this.addClass("active");
                            
                            var selectedCharacter = _.find(characters, function(character) {
                                return $this.hasClass("glyphicons-" + character.icon);
                            });
                            
                            if (selectedCharacter) {
                                data.selectedCharacter = selectedCharacter;
                                
                                setCharacterUi(selectedCharacter);
                                
                                $(".character-selection .stats-container").show();
                            }
                        });
                        
                        $(".character-selection .character-select-button").click(function() {
                            var name = $(".character-selection .character-name-input").val();
                            
                            if (data.selectedCharacter) {
                                if (name) {
                                    data.selectedCharacter.name = name;
                                }
                                
                                entity.sendMessage("start", { character: data.selectedCharacter });
                                $(".character-selection").remove();
                            }
                        });
                    },
                    //game is started, character selection in data
                    start: function(entity, data) {
                        if (this.gameState !== 'character-selection') {
                            return;
                        }
                        
                        this.gameState = "in-play";
                        
                        var selectedCharacter = data.character;
                        
                        var player = entity.engine.findEntityByTag("player")[0];
                        player.data.character = selectedCharacter;
                        player.isActive = true;
                        player.sendMessage("change-icon", {icon: selectedCharacter.icon });
                        
                        entity.engine.findEntityByTag('hide-at-start').forEach(function(entity) {
                            entity.sendMessage("show");
                        });
                        
                        var world = entity.engine.findEntityByTag("world")[0];
                        world.sendMessage("generate", { seed: selectedCharacter.name + +new Date() });
                        
                        entity.engine.entities.getList().forEach(function(entity) {
                            entity.sendMessage("game-start");
                        })
                        
                        //start the enemy spawner going
                        //var enemySpawner = entity.engine.findEntityByTag("enemy-spawner")[0];
                        //enemySpawner.sendMessage("start");
                    },
                    downLevel: function(entity, data) {
                        //the player is going down a level! Good for them!
                        // we need to make it if we don't already have it.
                    },
                    restart: function(entity, data) {
                        //cleanup
                        entity.engine.game.restart();
                        $(".character-selection").remove();
                    }
                }
            },
            "health-display": {
                _: {
                    isStaticPosition: true,
                    icon: "heart",
                    position: {
                        x: 50,
                        y: 50
                    },
                    rotate: 45
                },
                requiredComponents: ['glyphicon-renderer'],
                onAdd: function(entity, component) {
                    this.$renderedIcon.append($("<span style='line-height: 30px; vertical-align:middle;' data-health-display='" + entity.id + "'></span>"));
                    this.$healthDisplay = $("span[data-health-display='" + entity.id + "']");
                    
                    this.player = entity.engine.findEntityByTag("player")[0];
                },
                update: function(dt, entity, component) {
                    this.$healthDisplay.text("Health " + this.player.data.health);
                }
            },
            "game-metrics-display": {
                _: {
                    isStaticPosition: true,
                    icon: "clock",
                    position: {
                        x: 50,
                        y: 250
                    }
                },
                requiredComponents: ['glyphicon-renderer'],
                onAdd: function(entity, component) {
                    this.$renderedIcon.append($("<span style='line-height: 30px; vertical-align:middle;' data-health-display='" + entity.id + "'></span>"));
                    this.$healthDisplay = $("span[data-health-display='" + entity.id + "']");
                    this.position.y = $(window).height() - 50;
                },
                update: function(dt, entity, component) {
                    this.$healthDisplay.text("gameTime " + (entity.engine.gameTime / 1000).toFixed(4));
                    
                }
            },
            "hide-on-pause": {
                messages: {
                    "game-pause": function(entity, data) {
                        entity.sendMessage("hide");
                    },
                    "game-resume": function(entity, data) {
                        entity.sendMessage("show");
                    }
                }
            },
            "keyboard-events": {
                onAdd: function(entity, component) {
                    if (!component.events) {
                        $(document).keydown(function(e) {
                            if (component.engine.isPlaying) {
                                component.entities.getList().forEach(function(entity) {
                                     entity.sendMessage("keydown", { which: e.which });
                                });
                            }
                        });
                        $(document).keyup(function(e) {
                            if (component.engine.isPlaying) {
                                component.entities.getList().forEach(function(entity) {
                                     entity.sendMessage("keyup", { which: e.which });
                                });
                            }
                        });
                        component.events = true;
                    }
                }
            }
        },
        entities: [
            {
                tags: ['player', 'hide-at-start'],
                components: {
                    health: {
                        health: 70
                    },
                    player: { },
                    movement: {
                        speed: 100
                    },
                    position: {
                        position: {
                            x: 0,
                            y: 200
                        },
                        size: {
                            width: 50,
                            height: 50
                        }
                    },
                    "keyboard-events": { }
                },
                //isActive: false,
                shouldRender: false
            },
            {
                tags:["shield", 'hide-at-start'],
                components: {
                    shield: {
                        mountTag: "player"
                    }
                }
            },
            {
                tags:["weapon", 'hide-at-start'],
                components: {
                    weapon: {
                        mountTag: "player"
                    }
                }
            },
            {
                tags:["enemy-spawner"],
                components: {
                    'enemy-spawner': {}
                }
            },
            {
                tags:["health-display", 'hide-at-start'],
                components: {
                    "health-display": {},
                    "hide-on-pause": {}
                }
            },
            {
                tags: ['metrics'],
                components: {
                    "game-metrics-display": {}
                }
            },
            {
                tags: ['health-potion', 'hide-at-start'],
                components: {
                    'health-potion': {
                        position: {
                            y: 500,
                            x: 0
                        },
                        target: {
                            y: 500,
                            x: 0
                        }
                    }
                }
            },
            {
                tags: ['game-manager'],
                components: {
                    'game-manager': { }
                }
            },
            {
                tags: ['world'],
                components: {
                    'world': { }
                }
            },
            {
                tags: ['hide-at-start'],
                components: {
                    'glyphicon-renderer': {
                        icon: "clock"
                    },
                    'sine-line': {}
                }
            }]
    });
});