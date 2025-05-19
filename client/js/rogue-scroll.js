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
 * Once user scrolls down, they start to descend. As they descend the page will grow.
 * 
 **/
define([
    'engine/game',
    'components/health',
    'components/position',
    'components/renderer',
    'components/input',
    'components/physics',
    'components/combat',
    'components/inventory',
    'components/quest',
    'components/dialogue',
    'components/ai',
    'components/network',
    'components/animation',
    'components/augment',
    'components/boss',
    'components/center-aligned',
    'components/combatant',
    'components/defensive-augment',
    'components/drops-loot',
    'components/enemy-spawner',
    'components/enemy',
    'components/floating-combat-text',
    'components/game-manager',
    'components/game-metrics-display',
    'components/glyphicon-renderer',
    'components/health-display',
    'components/health-potion',
    'components/hide-on-pause',
    'components/html-renderer',
    'components/keyboard-events',
    'components/level-door',
    'components/minimap',
    'components/mounted',
    'components/movement',
    'components/music',
    'components/offensive-augment',
    'components/options',
    'components/player',
    'components/scroll-chaser',
    'components/sensor',
    'components/shield',
    'components/sine-line',
    'components/sine-wave-movement',
    'components/spell-container',
    'components/spell',
    'components/tests',
    'components/text',
    'components/timed-destroy',
    'components/trap',
    'components/vision'
], function(
    Game,
    Health,
    Position,
    Renderer,
    Input,
    Physics,
    Combat,
    Inventory,
    Quest,
    Dialogue,
    AI,
    Network,
    Animation,
    Augment,
    Boss,
    CenterAligned,
    Combatant,
    DefensiveAugment,
    DropsLoot,
    EnemySpawner,
    Enemy,
    FloatingCombatText,
    GameManager,
    GameMetricsDisplay,
    GlyphiconRenderer,
    HealthDisplay,
    HealthPotion,
    HideOnPause,
    HtmlRenderer,
    KeyboardEvents,
    LevelDoor,
    Minimap,
    Mounted,
    Movement,
    Music,
    OffensiveAugment,
    Options,
    Player,
    ScrollChaser,
    Sensor,
    Shield,
    SineLine,
    SineWaveMovement,
    SpellContainer,
    Spell,
    Tests,
    Text,
    TimedDestroy,
    Trap,
    Vision
) {
    var RogueScroll = {
        game: null,
        components: {
            health: Health,
            position: Position,
            renderer: Renderer,
            input: Input,
            physics: Physics,
            combat: Combat,
            inventory: Inventory,
            quest: Quest,
            dialogue: Dialogue,
            ai: AI,
            network: Network,
            animation: Animation,
            augment: Augment,
            boss: Boss,
            'center-aligned': CenterAligned,
            combatant: Combatant,
            'defensive-augment': DefensiveAugment,
            'drops-loot': DropsLoot,
            'enemy-spawner': EnemySpawner,
            enemy: Enemy,
            'floating-combat-text': FloatingCombatText,
            'game-manager': GameManager,
            'game-metrics-display': GameMetricsDisplay,
            'glyphicon-renderer': GlyphiconRenderer,
            'health-display': HealthDisplay,
            'health-potion': HealthPotion,
            'hide-on-pause': HideOnPause,
            'html-renderer': HtmlRenderer,
            'keyboard-events': KeyboardEvents,
            'level-door': LevelDoor,
            minimap: Minimap,
            mounted: Mounted,
            movement: Movement,
            music: Music,
            'offensive-augment': OffensiveAugment,
            options: Options,
            player: Player,
            'scroll-chaser': ScrollChaser,
            sensor: Sensor,
            shield: Shield,
            'sine-line': SineLine,
            'sine-wave-movement': SineWaveMovement,
            'spell-container': SpellContainer,
            spell: Spell,
            tests: Tests,
            text: Text,
            'timed-destroy': TimedDestroy,
            trap: Trap,
            vision: Vision
        },
        entities: [
            {
                tags: ['game-manager'],
                components: {
                    'game-manager': {}
                }
            },
            {
                tags: ['player'],
                components: {
                    'player': {},
                    'health': {},
                    'position': { x: 0, y: 0 },
                    'movement': { speed: 100 },
                    'glyphicon-renderer': { icon: 'user' },
                    'center-aligned': {},
                    'animation': {},
                    'combatant': {},
                    'floating-combat-text': {},
                    'world-entity': {}
                }
            },
            {
                tags: ['world'],
                components: {
                    'world': {}
                }
            },
            {
                tags: ['music'],
                components: {
                    'music': {}
                }
            },
            {
                tags: ['minimap'],
                components: {
                    'minimap': {}
                }
            },
            {
                tags: ['options'],
                components: {
                    'options': {}
                }
            }
        ],
        isRunning: false,
        lastTime: 0,
        targetFPS: 60,
        frameTime: 1000 / 60,
        init: function() {
            try {
                // Initialize game engine
                this.game = new Game();
                
                // Initialize all systems
                this.systems = {
                    physics: new Physics(),
                    combat: new Combat(),
                    ai: new AI(),
                    network: new Network(),
                    input: new Input(),
                    renderer: new Renderer()
                };
                
                // Add systems to game
                Object.values(this.systems).forEach(system => {
                    this.game.addSystem(system);
                });
                
                // Initialize entities
                this.entities.forEach(entityConfig => {
                    var entity = this.game.createEntity({ tags: entityConfig.tags });
                    Object.entries(entityConfig.components).forEach(([name, data]) => {
                        entity.addComponent(name, data);
                    });
                });
                
                // Start game loop
                this.start();
                
                // Add cleanup on window unload
                window.addEventListener('unload', this.cleanup.bind(this));
                
                return true;
            } catch (error) {
                console.error('Failed to initialize RogueScroll:', error);
                return false;
            }
        },
        
        start: function() {
            if (!this.isRunning) {
                this.isRunning = true;
                this.lastTime = performance.now();
                requestAnimationFrame(this.gameLoop.bind(this));
            }
        },
        
        stop: function() {
            this.isRunning = false;
        },
        
        gameLoop: function(timestamp) {
            if (!this.isRunning) return;
            
            // Calculate delta time in seconds
            var delta = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;
            
            // Cap delta to prevent large jumps
            delta = Math.min(delta, 0.1);
            
            try {
                // Update game state
                this.game.update(delta);
                this.game.render();
            } catch (error) {
                console.error('Error in game loop:', error);
                this.stop();
                return;
            }
            
            // Schedule next frame
            requestAnimationFrame(this.gameLoop.bind(this));
        },
        
        cleanup: function() {
            this.stop();
            if (this.game) {
                // Cleanup systems
                Object.values(this.systems).forEach(system => {
                    if (system.cleanup) {
                        system.cleanup();
                    }
                });
                
                // Cleanup game
                this.game.destroy();
                this.game = null;
            }
        }
    };
    
    return RogueScroll;
});