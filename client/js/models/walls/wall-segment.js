define(function() {
    var V2 = require("../../util/V2"),
        ImmutableV2 = V2.ImmutableV2,
        V2 = V2.V2,
        height = 50;
        
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
        
        this.$el = (this.wall.direction == "left") ? $("<div class='wall-segment'>").appendTo(this.wall.$wallContainer) : $("<div class='wall-segment'>").prependTo(this.wall.$wallContainer);
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
    }

    return WallSegment;
});