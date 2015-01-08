//todo: Maybe implement a jquery like selector for entities
function EntityWrapper(entity) {
    this.entity = entity;
}

EntityWrapper.prototype.position = function(setValue) {
    if (typeof setValue !== 'undefined') {
        this.entity.data.position = setValue;
        return;
    }
    
    return this.entity.data.position;
}

EntityWrapper.prototype.X = function(setValue) {
    if (typeof setValue !== 'undefined') {
        this.entity.data.position.x = setValue;
        return;
    }
    
    return this.entity.data.position.x;
}

EntityWrapper.prototype.Y = function(setValue) {
    if (typeof setValue !== 'undefined') {
        this.entity.data.position.y = setValue;
        return;
    }
    
    return this.entity.data.position.y;
}

function $E(entity) {
    return new EntityWrapper(entity);
}