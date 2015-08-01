define(function() {
    var di = require('./util/dijection');
    var RogueScroll = require('./rogue-scroll');
    
    
    return di(function() {
    $(function() {
        window.unload = function() {
          
        };
        
        $('a[href="#menu"]').click(function() {
          $('li a[href="#game"]').parent().removeClass('active');
          $(this).parent().addClass('active');
        });
        $('a[href="#game"]').click(function() {
          $('li a[href="#menu"]').parent().removeClass('active');
          $(this).parent().addClass('active');
        });
        
        $('#nav').on('activate.bs.scrollspy', function () {
          if ($('.active [href="#menu"]').length) {
            RogueScroll.pause();
          }
          if ($('.active [href="#game"]').length) {
            if (RogueScroll.engine.findEntityByTag('game-manager').data.gameState === 'in-play') {
                RogueScroll.play();
            }
          }
        });
        
        RogueScroll.pause();
      });
    });
});