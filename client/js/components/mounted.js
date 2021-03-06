module.exports = function() {
    return {
        _: {
            mountId: null,
            mountTag: '',
            offset: {
                x:null,
                y:null
            },
            mountTarget: null
        },
        onAdd: function(entity, component) {
            if (!component.tryMount) {
                component.tryMount = function(data, entity, mountTarget, mountId, mountTag) {
                    if (mountTarget && mountTarget.data && mountTarget.data.position) {
                        data.mountTarget = mountTarget;
                        return;
                    }
                    
                    if (mountId !== null) {
                        data.mountTarget = entity.engine.entities.get(mountId);
                        
                        if (data.mountTarget) {
                            return;
                        }
                    }
                    
                    if (mountTag) {
                        data.mountTarget = entity.engine.findEntityByTag(data.mountTag);
                        
                        if (data.mountTarget) {
                            return;
                        }
                    }
                }
            }
            
            entity.sendMessage('mount', { 
                target: this.mountTarget,
                mountId: this.mountId,
                mountTag: this.mountTag
            });
        },
        update: function(dt, entity, component) {
            if (!this.mountTarget) {
                entity.sendMessage('mount', { 
                    target: this.mountTarget,
                    mountId: this.mountId,
                    mountTag: this.mountTag
                });
                return;
            }
            
            if (this.offset.x !== null) {
                this.position.x = this.mountTarget.data.position.x + this.offset.x;
            }
            
            if (this.offset.y !== null) {
                this.position.y = this.mountTarget.data.position.y + this.offset.y;
            }
            
            if (entity.shouldRender != this.mountTarget.shouldRender) {
                if (this.mountTarget.shouldRender) {
                    entity.sendMessage('show');
                } else {
                    entity.sendMessage('hide');
                }
            }
            
            this.direction = this.mountTarget.data.direction;
        },
        requiredComponents: ['position'],
        tags: ['level-change-subscriber'],
        messages: {
            mount: function(entity, data, component) {
                component.tryMount(this, entity, data.target, data.mountId, data.mountTag);
            },
            dismount: function(entity, data, component) {
                this.mountTarget = null;
                this.mountTag = null;
                this.mountId = null;
            },
            'level-change': function(entity, data, component) {
                if (this.mountTarget && this.mountTarget.data.level && this.worldEntity && this.worldEntity.data.currentLevel === this.mountTarget.data.level) {
                    entity.sendMessage('switch-to-current-level');
                    if (entity.shouldRender != this.mountTarget.shouldRender) {
                        if (this.mountTarget.shouldRender) {
                            entity.sendMessage('show');
                        } else {
                            entity.sendMessage('hide');
                        }
                    }
                }
            }
        }
    };
}