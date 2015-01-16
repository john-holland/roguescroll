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
    var Game = require("engine/game");
    RogueScroll = new Game({
        name: "Rogue Scroll",
        components: { 
            health: require("health")(),
            position: require("position")(),
            animation: require("animation")(),
            'glyphicon-renderer': require("glyphicon-renderer")(),
            movement: require("movement")(),
            "center-aligned": require("center-aligned")(),
            combatant: require("combatant")(),
            "health-potion": require("health-potion")(),
            "scroll-chaser": require("scroll-chaser")(),
            "floating-combat-text": require("floating-combat-text")(),
            "timed-destroy": require("timed-destroy")(),
            "weapon": require("weapon")(),
            "shield": require("shield")(),
            "augment": require("augment")(),
            "defensive-augment": require("defensive-augment")(),
            "offensive-augment": require("offensive-augment")(),
            "player": require("player")(),
            "enemy": require("enemy")(),
            "mounted": require("mounted")(),
            "trap": {
                //the trap should not be visible unless the player is within senseRange + (brains * 3)
                //once the player sees it, it should show a icon: 'warning-sign' 
            },
            "sine-line": require("sine-line")(),
            "enemy-spawner": require("enemy-spawner")(),
            "world-entity": require("world-entity")(),
            "world": require("world")(),
            "game-manager": require("game-manager")(),
            "text": require("text")(),
            "health-display": require("health-display")(),
            "game-metrics-display": require("game-metrics-display")(),
            "hide-on-pause": require("hide-on-pause")(),
            "keyboard-events": require("keyboard-events")()
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
                        speed: 150
                    },
                    position: {
                        position: {
                            x: $(document).width() / 2,
                            y: -75
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
                tags: ['player-metrics'],
                components: {
                    'game-metrics-display': {
                        metricsTargetTag: "player",
                        isStaticPosition: true,
                        position: {
                            x: $(window).width() - 250,
                            y: $(window) - 200
                        },
                        metricsFunction: function(entity, dt, target) {
                            return target.data.position.x.toFixed(3) + " " + target.data.position.y.toFixed(3);
                        },
                        icon: "global",
                        
                    }
                }
            },
            // {
            //     tags: ['player-metrics'],
            //     components: {
            //         'game-metrics-display': {
            //             isStaticPosition: false,
            //             metricsFunction: function(entity) {
            //                 return entity.data.position.x.toFixed(3) + " " + entity.data.position.y.toFixed(3);
            //             },
            //             icon: "global"
            //         },
            //         mounted: {
            //             mountTag: 'player',
            //             offset: {
            //                 x: 100,
            //                 y: 100
            //             }
            //         }
            //     }
            // },
            // {
            //     tags: ['hide-at-start'],
            //     components: {
            //         'glyphicon-renderer': {
            //             icon: "clock"
            //         },
            //         'sine-line': {}
            //     }
            // },
            {
                components: {
                    "defensive-augment": {
                        mountTag: 'player'
                    }
                }
            },
            {
                components: {
                    "offensive-augment": {
                        mountTag: 'player'
                    }
                }
            },
            {
                components: {
                    "glyphicon-renderer": {
                        icon: "glasses",
                        iconColor: "#eee"
                    },
                    animation: {},
                    movement: {},
                    mounted: {
                        offset: {
                            x: 1,
                            y: -5
                        },
                        mountTag: "player"
                    }
                }
            },
            {
                components: {
                    "glyphicon-renderer": {
                        icon: "education",
                        iconColor: "#eee",
                        size: {
                            width: 35,
                            height: 35
                        }
                    },
                    animation: {},
                    movement: {},
                    mounted: {
                        offset: {
                            x: 1,
                            y: -25
                        },
                        mountTag: "player"
                    }
                }
            },
            {
                components: {
                    "glyphicon-renderer": {
                        icon: "exit"
                    }
                }
            }
            ]
    });
});