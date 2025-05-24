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
import Game from './engine/game';
import Health from './components/health';
import Position from './components/position';
import Renderer from './components/renderer';
import Input from './components/input';
import Physics from './components/physics';
import Combat from './components/combat';
import Inventory from './components/inventory';
import Quest from './components/quest';
import Dialogue from './components/dialogue';
import AI from './components/ai';
import Network from './components/network';
import Animation from './components/animation';
import Augment from './components/augment';
import Boss from './components/boss';
import CenterAligned from './components/center-aligned';
import Combatant from './components/combatant';
import DefensiveAugment from './components/defensive-augment';
import DropsLoot from './components/drops-loot';
import EnemySpawner from './components/enemy-spawner';
import Enemy from './components/enemy';
import FloatingCombatText from './components/floating-combat-text';
import GameManager from './components/game-manager';
import GameMetricsDisplay from './components/game-metrics-display';
import GlyphiconRenderer from './components/glyphicon-renderer';
import HealthDisplay from './components/health-display';
import HealthPotion from './components/health-potion';
import HideOnPause from './components/hide-on-pause';
import HtmlRenderer from './components/html-renderer';
import KeyboardEvents from './components/keyboard-events';
import LevelDoor from './components/level-door';
import Minimap from './components/minimap';
import Mounted from './components/mounted';
import Movement from './components/movement';
import Music from './components/music';
import OffensiveAugment from './components/offensive-augment';
import Options from './components/options';
import Player from './components/player';
import ScrollChaser from './components/scroll-chaser';
import Sensor from './components/sensor';
import Shield from './components/shield';
import SineLine from './components/sine-line';
import SineWaveMovement from './components/sine-wave-movement';
import SpellContainer from './components/spell-container';
import Spell from './components/spell';
import Tests from './components/tests';
import Text from './components/text';
import TimedDestroy from './components/timed-destroy';
import Trap from './components/trap';
import Vision from './components/vision';
import mori from './util/mori';
import $ from 'jquery.transit';

// Load non-critical components dynamically
const loadNonCriticalComponents = async () => {
    const [
        Boss,
        SpellContainer,
        Spell,
        Tests,
        Options
    ] = await Promise.all([
        import('./components/boss'),
        import('./components/spell-container'),
        import('./components/spell'),
        import('./components/tests'),
        import('./components/options')
    ]);
    
    return {
        boss: Boss.default,
        'spell-container': SpellContainer.default,
        spell: Spell.default,
        tests: Tests.default,
        options: Options.default
    };
};

// Create empty RogueScroll object
const RogueScroll = {
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
        player: Player,
        'scroll-chaser': ScrollChaser,
        sensor: Sensor,
        shield: Shield,
        'sine-line': SineLine,
        'sine-wave-movement': SineWaveMovement,
        text: Text,
        'timed-destroy': TimedDestroy,
        trap: Trap,
        vision: Vision
    },
    entities: mori.vector(
        mori.hashMap(
            'tags', mori.vector('world'),
            'components', mori.hashMap('world', mori.hashMap())
        ),
        mori.hashMap(
            'tags', mori.vector('music', 'level-change-subscriber'),
            'components', mori.hashMap('music', mori.hashMap())
        ),
        mori.hashMap(
            'tags', mori.vector('player', 'hide-at-start'),
            'components', mori.hashMap(
                'health', mori.hashMap(
                    'health', 70,
                    'maxHealth', 100
                ),
                'player', mori.hashMap(
                    'iconColor', '#eee'
                ),
                'movement', mori.hashMap(
                    'speed', 250
                ),
                'position', mori.hashMap(
                    'position', mori.hashMap(
                        'x', document.documentElement.clientWidth / 2,
                        'y', -75
                    ),
                    'size', mori.hashMap(
                        'width', 50,
                        'height', 50
                    )
                ),
                'keyboard-events', mori.hashMap(),
                'vision', mori.hashMap()
            ),
            'shouldRender', false
        ),
        mori.hashMap(
            'tags', mori.vector('shield', 'hide-at-start'),
            'components', mori.hashMap(
                'shield', mori.hashMap(
                    'mountTag', 'player'
                )
            )
        ),
        mori.hashMap(
            'tags', mori.vector('weapon', 'hide-at-start', 'level-change-subscriber'),
            'components', mori.hashMap(
                'weapon', mori.hashMap(
                    'mountTag', 'player'
                )
            )
        ),
        mori.hashMap(
            'tags', mori.vector('health-display', 'hide-at-start'),
            'components', mori.hashMap(
                'health-display', mori.hashMap(
                    'textColor', '#eee',
                    'z-index', 10000
                ),
                'hide-on-pause', mori.hashMap()
            )
        ),
        mori.hashMap(
            'tags', mori.vector('metrics'),
            'components', mori.hashMap(
                'game-metrics-display', mori.hashMap(
                    'textColor', '#eee',
                    'z-index', 10000
                ),
                'hide-on-pause', mori.hashMap()
            )
        ),
        mori.hashMap(
            'tags', mori.vector('health-potion', 'hide-at-start'),
            'components', mori.hashMap(
                'health-potion', mori.hashMap(
                    'position', mori.hashMap(
                        'y', 500,
                        'x', 0
                    ),
                    'target', mori.hashMap(
                        'y', 500,
                        'x', 0
                    ),
                    'pursueTarget', false
                )
            )
        ),
        mori.hashMap(
            'tags', mori.vector('game-manager'),
            'components', mori.hashMap(
                'game-manager', mori.hashMap()
            )
        ),
        mori.hashMap(
            'tags', mori.vector('player-metrics'),
            'components', mori.hashMap(
                'game-metrics-display', mori.hashMap(
                    'shouldRender', false,
                    'isActive', false,
                    'metricsTargetTag', 'player',
                    'isStaticPosition', true,
                    'positionAnchor', 'bottom-right',
                    'position', mori.hashMap(
                        'x', 250,
                        'y', 200
                    ),
                    'metricsFunction', function(entity, dt, target) {
                        return target.data.position.x.toFixed(3) + ' ' + target.engine.updateEntities.getList().length;
                    },
                    'icon', 'global',
                    'textColor', '#eee'
                ),
                'hide-on-pause', mori.hashMap()
            )
        ),
        mori.hashMap(
            'components', mori.hashMap(
                'defensive-augment', mori.hashMap(
                    'mountTag', 'player'
                )
            )
        ),
        mori.hashMap(
            'components', mori.hashMap(
                'offensive-augment', mori.hashMap(
                    'mountTag', 'player'
                )
            )
        ),
        mori.hashMap(
            'components', mori.hashMap(
                'glyphicon-renderer', mori.hashMap(
                    'icon', 'align-center'
                ),
                'mounted', mori.hashMap(
                    'mountTag', 'level-door',
                    'offset', mori.hashMap(
                        'x', 0,
                        'y', 25
                    )
                )
            )
        ),
        mori.hashMap(
            'tags', mori.vector('minimap'),
            'components', mori.hashMap(
                'minimap', mori.hashMap()
            )
        ),
        mori.hashMap(
            'tags', mori.vector('options'),
            'components', mori.hashMap(
                'options', mori.hashMap()
            )
        ),
        mori.hashMap(
            'tags', mori.vector('spell-container'),
            'components', mori.hashMap(
                'spell-container', mori.hashMap()
            )
        )
    ),
    isRunning: false,
    lastTime: 0,
    targetFPS: 60,
    frameTime: 1000 / 60
};

// Define methods separately
const methods = {
    async init() {
        try {
            // Load non-critical components
            const nonCriticalComponents = await loadNonCriticalComponents();
            this.components = { ...this.components, ...nonCriticalComponents };
            
            // Initialize game
            this.game = new Game(this.components, this.entities);
            
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
            window.addEventListener('unload', this.cleanup);
            
            return true;
        } catch (error) {
            console.error('Failed to initialize RogueScroll:', error);
            return false;
        }
    },
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        }
    },
    
    stop() {
        this.isRunning = false;
    },
    
    gameLoop(timestamp) {
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
        requestAnimationFrame(this.gameLoop);
    },
    
    cleanup() {
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
    },
    
    play() {
        if (this.game) {
            this.game.play();
        }
    },
    
    pause() {
        if (this.game) {
            this.game.pause();
        }
    }
};

// Add bound methods to RogueScroll
Object.entries(methods).forEach(([name, method]) => {
    RogueScroll[name] = method.bind(RogueScroll);
});

// Make RogueScroll available globally
window.RogueScroll = RogueScroll;

export default RogueScroll;