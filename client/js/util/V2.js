define(function() {

/*
  V2 is a mutable vector2 for performance
  
  ImmutableV2 is not mutable.
*/
var isVector2 = function (value) {
    return value.constructor === V2 || value.constructor === ImmutableV2;
};

V2.coalesce = function(value) {
    if (value.constructor === V2) {
        return value;
    } else {
        return new V2(value.x || value.X || 0, value.y || value.Y || 0);
    }
}

ImmutableV2.coalesce = function(value) {
    if (value.constructor === ImmutableV2) {
        return value;
    } else {
        return new ImmutableV2(value.x || value.X || 0, value.y || value.Y || 0);
    }
}

function V2(x, y) {
    if (typeof x === 'undefined' || typeof y === 'undefined') {
        this.X = 0;
        this.Y = 0;
    } else {
        this.X = x;
        this.Y = y;
    }
    
    /*
      Checks the value passed in to make sure it's a Vector2.
    */
    var isVector2 = function (value) {
        return value.constructor === V2 || value.constructor === ImmutableV2;
    };
    
    this.isVector2 = isVector2;
    
    /*
      Performs a dot on this V2 and the V2 passed in.
    */
    this.dot = function(vec2) {
        return (this.X * vec2.X + this.Y * vec2.Y); 
    }

    /*
      Returns the length of the V2. It should be noted that lengthSqr should be used
      for greater performance.
    */
    this.length = function() {
        return Math.sqrt(this.dot(this)); 
    }

    /*
      Returns the length * length of the V2. Faster than V2.length as it does not
      make a Math.sqrt call.
    */
    this.lengthSqr = function() { 
        return this.dot(this); 
    }
    
    /*
      Returns the Absolute value for this vector's X and Y in a new V2.
    */
    this.abs = function() {
        this.X = Math.abs(this.X);
        this.Y = Math.abs(this.Y);
        return this;
    }

    /*
      Returns the unit length V2 (vector components divided by length)
    */
    this.normalize = function() {
        var vlen = this.length();
        this.X = (this.X / vlen);
        this.Y = (this.Y / vlen);
        return this;
    }
    
    /*
      Returns the product of this vector and either a scalar or a V2 passed in.
    */
    this.multiply = function (value) {
        if (isVector2(value)) {
            this.X = (this.X * value.X);
            this.Y = (this.Y * value.Y);
            return this;
        } else {
            this.X = (this.X * value);
            this.Y = (this.Y * value);
            return this;
        }
    }
    
    /*
      Returns the divisor of this vector and a scalar passed in.
    */
    this.divide = function(value) {
        this.X = (this.X / value);
        this.Y = (this.Y / value);
        return this;
    }
    
    /*
      Returns the sum of this vector and either a scalar or a V2 passed in.
    */
    this.add = function(value) {
        if (isVector2(value)) {
            this.X = (this.X + value.X);
            this.Y = (this.Y + value.Y);
            return this;
        } else {
            this.X = (this.X + value);
            this.Y = (this.Y + value);
            return this;
        }
    }
    
    /*
      Returns the difference of this vector and either a scalar or a V2 passed in.
    */
    this.sub = function(value) {
        if (isVector2(value)) { 
            this.X = (this.X - value.X);
            this.Y = (this.Y - value.Y);
            return this;
        } else {
            this.X = (this.X - value);
            this.Y = (this.Y - value);
            return this;
        }
    }
    
    this.perpendicular = function() {
        var y = -this.Y,
        x = this.X;
        
        this.Y = y;
        this.X = x;
        
        return this;
    }
    
    this.init = function(x, y) {
        this.X = x;
        this.Y = y;
        return this;
    }
    
    this.initFromV2 = function(vec2) {
        this.X = vec2.X;
        this.Y = vec2.Y;
        return this;
    }
    
    this.copy = function() {
        return new V2(this.X, this.Y);
    }
    
    this.asImmutable = function() {
        return new ImmutableV2(this.X, this.Y);
    }
    
    this.toRadians = function() {
        return Math.atan2(this.Y, this.X);
    }
    
    this.fromRadians = function(rads) {
        this.X = Math.cos(rads);
        this.Y = Math.sin(rads);
    }
    
    this.toDegrees = function() {
        return Math.degrees(this.toRadians());
    }
    
    this.fromDegrees = function(degrees) {
        return this.fromRadians(Math.radians(degrees));
    }
    
    this.vectorTo = function(otherVector) {
        return V2.coalesce(otherVector).sub(this);
    }
    
    this.distanceTo = function(otherVector) {
        return V2.coalesce(otherVector).sub(this).length();
    }
    
    this.toString = function() {
        return "x: " + this.X + " y: " + this.Y;
    }
    
    this.toFixed = function(decimalPlaces) {
        this.X = parseFloat(this.X.toFixed(decimalPlaces));
        this.Y = parseFloat(this.Y.toFixed(decimalPlaces));
        return this;
    }
}


function ImmutableV2(x, y) {
    if (typeof x === 'undefined' || typeof y === 'undefined') {
        this.X = 0;
        this.Y = 0;
    } else {
        this.X = x;
        this.Y = y;
    }
    
    /*
      Checks the value passed in to make sure it's a Vector2.
    */
    var isVector2 = function (value) {
        return value.constructor === V2 || value.constructor === ImmutableV2;
    };
    
    this.Equals = function(vec2) {
        return isVector2(vec2) && this.X == vec2.X && this.Y == vec2.Y;
    };
    
    /*
      Performs a dot on this V2 and the V2 passed in.
    */
    this.dot = function(vec2) {
        return (this.X * vec2.X + this.Y * vec2.Y); 
    }

    /*
      Returns the length of the V2. It should be noted that lengthSqr should be used
      for greater performance.
    */
    this.length = function() {
        return Math.sqrt(this.dot(this)); 
    }
    
    this.perpendicular = function() {
        return new ImmutableV2(-this.Y, this.X);
    }

    /*
      Returns the length * length of the V2. Faster than V2.length as it does not
      make a Math.sqrt call.
    */
    this.lengthSqr = function() { 
        return this.dot(this); 
    }
    
    /*
      Returns the Absolute value for this vector's X and Y in a new V2.
    */
    this.abs = function() {
        return new ImmutableV2(Math.abs(this.X), Math.abs(this.Y));
    }

    /*
      Returns the unit length V2 (vector components divided by length)
    */
    this.normalize = function() {
        var vlen = this.length();
        return new ImmutableV2(this.X / vlen, this.Y / vlen);
    }
    
    /*
      Returns the product of this vector and either a scalar or a V2 passed in.
    */
    this.multiply = function (value) {
        if (isVector2(value)) {
            return new ImmutableV2(this.X * value.X, this.Y * value.Y);
        } else {
            return new ImmutableV2(this.X * value, this.Y * value);   
        }
    }
    
    /*
      Returns the divisor of this vector and a scalar passed in.
    */
    this.divide = function(value) {
        return new ImmutableV2(this.X / value, this.Y / value); 
    }
    
    /*
      Returns the sum of this vector and either a scalar or a V2 passed in.
    */
    this.add = function(value) {
        if (isVector2(value)) {
            return new ImmutableV2(this.X + value.X, this.Y + value.Y); 
        } else {
            return new ImmutableV2(this.X + value, this.Y + value);
        }
    }
    
    /*
      Returns the difference of this vector and either a scalar or a V2 passed in.
    */
    this.sub = function(value) {
        if (isVector2(value)) { 
            return new ImmutableV2(this.X - value.X, this.Y - value.Y);
        } else {
            return new ImmutableV2(this.X - value, this.Y - value); 
        }
    }
    
    this.vectorTo = function(otherVector) {
        return ImmutableV2.coalesce(otherVector).sub(this);
    }
    
    this.distanceTo = function(otherVector) {
        return ImmutableV2.coalesce(otherVector).sub(this).length();
    }
    
    this.asMutable = function() {
        return new V2(this.X, this.Y);
    }
    
    this.toRadians = function() {
        return Math.atan2(this.Y, this.X);
    }
    
    this.toDegrees = function() {
        return Math.degrees(this.toRadians());
    }
    
    this.fromDegrees = function(degrees) {
        return this.fromRadians(Math.radians(degrees));
    }
    
    this.toString = function() {
        return "x: " + this.X + " y: " + this.Y;
    }
    
    this.toFixed = function(decimalPlaces) {
        return new ImmutableV2(parseFloat(this.X.toFixed(decimalPlaces)), parseFloat(this.Y.toFixed(decimalPlaces)));
    }
}

V2.distanceBetween = function(pointA, pointB) {
    return V2.coalesce(pointA).distanceTo(V2.coalesce(pointB));
}

ImmutableV2.distanceBetween = function(pointA, pointB) {
    return ImmutableV2.coalesce(pointA).distanceTo(ImmutableV2.coalesce(pointB));
}

ImmutableV2.fromTo = function(from, to) {
    return ImmutableV2.coalesce(to).sub(ImmutableV2.coalesce(from));
}

ImmutableV2.fromRadians = function(rads) {
    return new ImmutableV2(Math.cos(rads), Math.sin(rads));
}

V2.fromRadians = function(rads) {
    return new V2(Math.cos(rads), Math.sin(rads));
}

V2.fromTo = function(from, to) {
    return ImmutableV2.coalesce(to).sub(ImmutableV2.coalesce(from));
}

Math.degrees = function(rad)
{
    return rad*(180/Math.PI);
}

Math.radians = function(deg)
{
    return deg * (Math.PI/180);
}

if (window) {
    window.V2 = V2;
    window.ImmutableV2 = ImmutableV2;
}

return {
    V2: V2,
    ImmutableV2: ImmutableV2
};
 
});