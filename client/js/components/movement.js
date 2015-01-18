var V2 = require("../util/V2");
var ImmutableV2 = V2.ImmutableV2;
V2 = V2.V2;

module.exports = function Movement() {
    return {
        _: {
            target: {
                x: 0,
                y: 0,
                stopAfterArrival: false,
                callbacks: []
            },
            previousPosition: {
                x: 0,
                y: 0
            },
            speed: 100,
            isMoving: false,
            pursueTarget: true,
            ignoreXForTarget: true,
            direction: "down",
            isMobile: true
        },
        onAdd: function(entity, component) {
            this.target.callbacks = [];
        },
        update: function(dt, entity, component) {
            this.previousPosition.x = this.position.x;
            this.previousPosition.y = this.position.y;
            
            
            if (!this.pursueTarget) {
                return;
            }
            
            if (!this.isMobile) {
                return;
            }
            
            // A -> B :: B - A
            
            //if our move would put us passed our target, then we're there
            //so if (target - position) · (move) < 0 we're there.
            var _x = this.target.x - this.position.x
                _y = this.target.y - this.position.y,
                toTarget = new V2(_x, _y),
                length = toTarget.length(),
                move = toTarget.normalize().multiply(this.speed * (dt/1000)),
                target = new V2(this.target.x, this.target.y),
                position = new V2(this.position.x, this.position.y),
                reachedTarget = target.sub(position).dot(move) <= 0;
                 
            //or you know, if you're really close.
            if (reachedTarget || length < 3) {
                this.position.x = this.target.x;
                this.position.y = this.target.y;
                this.isMoving = false;
                
                if (this.target.stopAfterArrival) {
                    this.pursueTarget = false;
                }
                
                while (this.target.callbacks && this.target.callbacks.length) {
                    this.target.callbacks.pop()();
                }
                reachedTarget = true;
            }
            
            if (!reachedTarget) {    
                if (!this.centerAlign) this.position.x += move.X;
                
                this.position.y += move.Y;
                this.rotation = move.toDegrees();
            }
            
            if (!reachedTarget) {
                this.direction = this.position.y > this.target.y ? "down" : "up";   
            }
            
            var wasMoving = this.isMoving;
            
            this.isMoving = !(this.position.x == this.previousPosition.x && this.position.y == this.previousPosition.y);
            
            if (reachedTarget || (!this.isMoving && wasMoving)) {
                entity.sendMessage("stop-animating", {animation: "walk"});
            }
            
            if (this.isMoving && !wasMoving) {
                entity.sendMessage("animate", {animation: "walk"});
            }
        },
        requiredComponents: ["position"],
        messages: {
            "go-to": function(entity, data) {
                this.pursueTarget = true;
                this.target.x = data.x;
                this.target.y = data.y;
                
                if ("stopAfterArrive" in data) this.target.stopAfterArrival = data.stopAfterArrive;
                if ("callback" in data) this.target.callbacks.push(data.callback);
            }
        }
    };
}