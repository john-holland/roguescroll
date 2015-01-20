define(function() {
    var _ = require("underscore");
    var WallSegment = require("./wall-segment");
    
    //build a wall
    function Wall(appendTo, minLength, maxWidth, direction, color) {
        this.segments = [];
        this.$wallContainer = $("<div class='wall'>").appendTo(appendTo);
        this.$wallContainer.width(maxWidth);
        this.maxWidth = maxWidth;
        this.length = 0;
        
        this.addSegment = function() {
            var topPoint = {
                x: 0,
                y: 0
            };
            
            if (this.segments.length) {
                //get the bottom point to use as the top point for new segment
                topPoint.x = this.segments[this.segments.length - 1].bottomPoint.X;
                topPoint.y = this.segments[this.segments.length - 1].bottomPoint.Y;
            }
            
            //pick a new bottom point that's relative to the top point
            var bottomPoint = {
                x: Math.min(Math.max(50, topPoint.x + _.random(-75, 75)), this.maxWidth),
                y: topPoint.y + _.random(50, 200)
            },
            length = Math.abs(bottomPoint.y - topPoint.y),
            segment = new WallSegment(this, bottomPoint, topPoint, length, color);
            console.log(bottomPoint.y);
            this.length += length;
            this.$wallContainer.height(this.length);
            
            segment.render();
            this.segments.push(segment);
        }
        
        while (this.length < minLength) {
            this.addSegment();
        }
        
        //turn the walls outer container to change its direction
        this.$wallContainer.addClass(direction + '-wall');
    }
    
    Wall.Direction = {
        UP: "up",
        DOWN: "down",
        RIGHT: "right",
        LEFT: "left",
        fromString: function(string) {
            var lowered = string.toLowerCase().trim();
            
            if (!(lowered == this.UP || lowered == this.DOWN || lowered == this.RIGHT || lowered == this.LEFT)) { 
                return null;
            }
            
            return lowered;
        }
    };
    
    return Wall;
});