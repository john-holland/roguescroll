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
            "drops-loot": require("./components/drops-loot")(),
            "mounted": require("./components/mounted")(),
            "trap": require("./components/trap")(),
            "sine-line": require("./components/sine-line")(),
            "enemy-spawner": require("./components/enemy-spawner")(),
            "world-entity": require("./components/world-entity")(),
            "world": require("./components/world")(),
            "game-manager": require("./components/game-manager")(),
            "text": require("./components/text")(),
            "health-display": require("./components/health-display")(),
            "game-metrics-display": require("./components/game-metrics-display")(),
            "hide-on-pause": require("./components/hide-on-pause")(),
            "keyboard-events": require("./components/keyboard-events")(),
            "html-renderer": require("./components/html-renderer")(),
            vision: require("./components/vision")(),
            sensor: require("./components/sensor")(),
            'level-door': require("./components/level-door")(),
            options: require("./components/options")(),
            minimap: require("./components/minimap")(),
            'sine-wave-movement': require("./components/sine-wave-movement")()
        },
        entities: [
            {
                tags: ['world'],
                components: {
                    'world': { }
                }
            },
            {
                tags: ['player', 'hide-at-start'],
                components: {
                    health: {
                        health: 70
                    },
                    player: {
                        iconColor: '#eee'
                    },
                    movement: {
                        speed: 200
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
                    "keyboard-events": { },
                    vision: { }
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
                tags:["health-display", 'hide-at-start'],
                components: {
                    "health-display": {
                        textColor: '#eee',
                        'z-index': 10000
                    },
                    "hide-on-pause": {}
                }
            },
            {
                tags: ['metrics'],
                components: {
                    "game-metrics-display": {
                        textColor: '#eee',
                        'z-index': 10000
                    },
                    "hide-on-pause": {}
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
                        },
                        pursueTarget: false
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
                tags: ['player-metrics'],
                components: {
                    'game-metrics-display': {
                        shouldRender: false,
                        isActive: false,
                        metricsTargetTag: "player",
                        isStaticPosition: true,
                        position: {
                            x: $(window).width() - 250,
                            y: $(window).height() - 200
                        },
                        metricsFunction: function(entity, dt, target) {
                            return target.data.position.x.toFixed(3) + " " + target.data.position.y.toFixed(3);
                        },
                        icon: "global",
                        textColor: '#eee'
                    },
                    "hide-on-pause": {}
                }
            },
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
                    'glyphicon-renderer': {
                        icon: 'align-center'
                    },
                    mounted: {
                        mountTag: 'level-door',
                        offset: {
                            x: 0,
                            y: 25
                        }
                    }
                }
            },
            {
                tags: ['miniap'],
                components: {
                    minimap: { }
                }
            }
            // ,
            // {
            //     tags: ['options'],
            //     components: {
            //         options: { }
            //     }
            // }
            ]
    });

    return RogueScroll;
});