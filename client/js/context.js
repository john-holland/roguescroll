import RogueScroll from './rogue-scroll'


// Wait for both DOM and all resources to be loaded
window.addEventListener('load', function() {
    // Ensure jQuery is available
    if (typeof jQuery === 'undefined') {
        console.error('jQuery is not loaded');
        return;
    }
    
    // Ensure PIXI is available
    if (typeof PIXI === 'undefined') {
        console.error('PIXI is not loaded');
        return;
    }
    
    // Ensure RogueScroll is available
    if (typeof RogueScroll === 'undefined') {
        console.error('RogueScroll is not loaded');
        return;
    }
    
    jQuery(() => {
        // Initialize RogueScroll
        const game = RogueScroll.init().then(function() {
            // Bind the game context
            const boundGame = {
                ...RogueScroll,
                pause: RogueScroll.pause.bind(RogueScroll),
                play: RogueScroll.play.bind(RogueScroll),
                cleanup: RogueScroll.cleanup.bind(RogueScroll)
            };
            
            // Set up event handlers
            $("a[href='#menu']").click(function() {
                $("li a[href='#game']").parent().removeClass("active");
                $(this).parent().addClass('active');
            });
            
            $("a[href='#game']").click(function() {
                $("li a[href='#menu']").parent().removeClass("active");
                $(this).parent().addClass('active');
            });
            
            $('#nav').on('activate.bs.scrollspy', function () {
                if ($(".active [href='#menu']").length) {
                    if (boundGame.game && typeof boundGame.game.pause === 'function') {
                        boundGame.pause();
                    }
                }
                if ($(".active [href='#game']").length) {
                    if (boundGame.game && typeof boundGame.game.play === 'function') {
                        if (boundGame.engine.findEntityByTag('game-manager').data.gameState === 'in-play') {
                            boundGame.play();
                        }
                    }
                }
            });
            
            // Initial pause
            if (boundGame.game && typeof boundGame.game.pause === 'function') {
                boundGame.pause();
            }
            
            // Set up cleanup
            window.addEventListener('unload', function() {
                if (boundGame.cleanup && typeof boundGame.cleanup === 'function') {
                    boundGame.cleanup();
                }
            });
            
            return boundGame;
        }).catch(function(error) {
            console.error('Failed to initialize RogueScroll:', error);
        });
    });
});