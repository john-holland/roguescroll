define(function() {
    var V2 = require("../util/V2"),
        ImmutableV2 = V2.ImmutableV2,
        V2 = V2.V2,
        height = 500;
        
    function WallSegment(wall, bottomPoint, topPoint, length, color) {
        this.topPoint = ImmutableV2.coalesce(topPoint);
        this.bottomPoint = ImmutableV2.coalesce(bottomPoint);
        this.wall = wall;
        this.length = length;
        this.color = color;
    };
        
    WallSegment.prototype.getTransformAngle = function() {
        
        
        var angle = Math.atan2(this.bottomPoint.Y - this.topPoint.Y, this.bottomPoint.X - this.topPoint.X);
        
        return this.bottomPoint.sub(this.topPoint).toDegrees();
    }
    
    WallSegment.prototype.render = function() {
        if (this.$el) {
            this.$el.remove();
            this.$el = null;
        }
        
        if (this.$gapFiller) {
            this.$gapFiller.remove();
            this.$gapFiller = null;
        }
        
        var edge = this.topPoint.vectorTo(this.bottomPoint), //get the vector of the wall edge
        middlePoint = this.topPoint.add(edge.normalize().multiply(edge.length() / 2)), //find the middle point on that edge
        position = middlePoint.add(edge.normalize().perpendicular().multiply(height / 2)).sub(new ImmutableV2(edge.length() / 2, height / 2)); //slide the middle point back to half the height of the box, and add that to the topPoint
        
        this.$el = $("<div class='wall-segment'>").appendTo(this.wall.$wallContainer);
        this.$el.transition({
            width: edge.length() + 2 + 'px',
            height: height + 'px',
            left: position.X + 'px',
            top: position.Y + 'px',
            '-webkit-transform': 'rotate(' + this.getTransformAngle() + 'deg)',
            '-moz-transform': 'rotate(' + this.getTransformAngle() + 'deg)',
            '-o-transform': 'rotate(' + this.getTransformAngle() + 'deg)',
            '-ms-transform': 'rotate(' + this.getTransformAngle() + 'deg)',
            transform: 'rotate(' + this.getTransformAngle() + 'deg)',
            duration: 0,
            queue: false
        });
        this.$el.css('background', this.color);
        
        // var i,
        //     segmentsLength = this.wall.segments.length,
        //     segmentIndex = 0;
        // for(i = 0; i < segmentsLength; i++) {
        //     if (this.wall.segments[i] === this) {
        //         segmentIndex = i;
        //         break;
        //     }
        // }
        
        // //if we're the first segment 
        // if (i == 0) {
        //     return;
        // }
        // var previousSegment = this.wall.segments[i - 1];
        
        // //if we're not the first segment, then get the vectors from our two points and the previous two points and if we're greater, create
        // // a $gapFiller that's 
        // var previousEdgeAngle = ImmutableV2.fromTo(previousSegment.topPoint, previousSegment.bottomPoint).toRadians(),
        //     edgeAngle = edge.toRadians();
            
        // if (edgeAngle < previousEdgeAngle) {
        //     var avgAngle = edgeAngle + previousEdgeAngle / 2,
        //         gapFillerVector = ImmutableV2.fromRadians(avgAngle);
            
        //     //since we have have the vector for the angle we'll need to fill, we should
        //     // go perpendicular from that and slide it back into place. Rotate it to the avg angle
            
        //     this.$gapFiller = $("<div class='wall-segment'>").appendTo(this.wall.$wallContainer);
        //     this.$el.css('background', 'green');
            
        //     //this.topPoint.sub()
        // }
    }

    return WallSegment;
});