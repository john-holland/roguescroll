//todo: Maybe implement a jquery like selector for entities
function EntityWrapper(entity, entities) {
    this.entities = entities && entities.length ? entities : [];
    this.entity = entity;
    
    this.figureOutType = function() {
        
    }
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

function parseEntitySelector(entitys) {
    
}

function $VG(entity) {
    if (typeof entity === 'object') {
        return new EntityWrapper(entity);
    } else {
        return parseEntitySelector(entity);
    }
}