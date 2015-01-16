// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

//anim loop

function animLoop( render, maximumUpdateMS) {
    var running, lastFrame = new Date().getTime(),
        gameTime = 0,
        raf = window.requestAnimationFrame,
        cancelId = { id: null },
        maxUpdateMS = maximumUpdateMS || 160;
              
    function loop( now ) {
        // stop the loop if render returned false
        if ( running !== false ) {
            cancelId.id = raf( loop );
            var deltaT = Math.max(Math.min(now - lastFrame, maxUpdateMS), 0);
            gameTime += deltaT;
            
            if ( deltaT < maxUpdateMS ) {
                running = render( deltaT, gameTime );
            } else {
                running = render( maxUpdateMS, gameTime );
            }
            lastFrame = now;
        }
    }
    loop( lastFrame );
    
    return function() {
        if (window.cancelAnimationFrame && cancelId.id) {
            window.cancelAnimationFrame(cancelId.id);
        }
    }
}

if (module && module.exports) {
    module.exports = animLoop;
}