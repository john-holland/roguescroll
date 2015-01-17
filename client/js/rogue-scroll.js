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
define(function() {
    var Game = require("./engine/game"),
    RogueScroll = new Game({
        name: "Rogue Scroll",
        components: { 
            health: require("./components/health")(),
            position: require("./components/position")(),
            animation: require("./components/animation")(),
            'glyphicon-renderer': require("./components/glyphicon-renderer")(),
            movement: require("./components/movement")(),
            "center-aligned": require("./components/center-aligned")(),
            combatant: require("./components/combatant")(),
            "health-potion": require("./components/health-potion")(),
            "scroll-chaser": require("./components/scroll-chaser")(),
            "floating-combat-text": require("./components/floating-combat-text")(),
            "timed-destroy": require("./components/timed-destroy")(),
            "weapon": require("./components/weapon")(),
            "shield": require("./components/shield")(),
            "augment": require("./components/augment")(),
            "defensive-augment": require("./components/defensive-augment")(),
            "offensive-augment": require("./components/offensive-augment")(),
            "player": require("./components/player")(),
            "enemy": require("./components/enemy")(),
            "mounted": require("./components/mounted")(),
            "trap": {
                //the trap should not be visible unless the player is within senseRange + (brains * 3)
                //once the player sees it, it should show a icon: 'warning-sign' 
            },
            "sine-line": require("./components/sine-line")(),
            "enemy-spawner": require("./components/enemy-spawner")(),
            "world-entity": require("./components/world-entity")(),
            "world": require("./components/world")(),
            "game-manager": require("./components/game-manager")(),
            "text": require("./components/text")(),
            "health-display": require("./components/health-display")(),
            "game-metrics-display": require("./components/game-metrics-display")(),
            "hide-on-pause": require("./components/hide-on-pause")(),
            "keyboard-events": require("./components/keyboard-events")()
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
                        icon: "exit",
                        position: {
                            y: 2500,
                            x: 0
                        }
                    },
                    'center-aligned': { }
                }
            }
            ]
    });

    return RogueScroll;
});