define(function() {
    var _ = require("underscore");
    
    return function Options() {
        return {
            _: {
                size: {
                    width: null,
                    height: null
                },
                options: {
                    //if you provide an object, you must provide an function optionsTemplate(option, value, entity, component)
                    // setup sensible data-attributes and use find() selectors on $el to setup callbacks
                    speed: 200
                },
                isStaticPosition: true,
                metadataFactory: function createOptionMetadata(entity, component, option, value) {
                    var optionType = typeof value,
                        optionMetadata = {
                            isBoolean: optionType === 'boolean',
                            isNumber: optionType === 'number',
                            isString: optionType === 'string', //can be tagged with __options_readonly__ = true
                            isObject: optionType === 'object',
                            name: option,
                            value: value
                        };
                        
                    if (optionMetadata.isObject) {
                        if (!('optionsTemplate' in value)) {
                            return null;
                        }
                        
                        optionMetadata.template = value.optionsTemplate(option, value, entity, component);
                    }
                    
                    return optionMetadata;
                },
                optionsMetadata: [],
                htmlTemplateFactory: function(entity, component) {
                    var options = _.filter(_.map(_.pairs(entity.data.options), function(pair) {
                        var option = pair[0],
                            value = pair[1];
                        return entity.data.metadataFactory(entity, component, option, value);
                    }), function(metadata) { return metadata != null });
                    entity.data.optionsMetadata = options;
                    return require("../templates/options.hbs")({ options: options });
                }
            },
            update: function(dt, entity, component) {
                for (var prop in this.options) {
                    if (this.options.hasOwnProperty(prop)) {
                        var metadata = _.find(this.optionsMetadata, function(metadata) { return metadata.name === prop });
                        if (!metadata) {
                            metadata = entity.data.metadataFactory(entity, component, prop, this.options[prop]);
                            this.optionsMetadata.push(metadata);
                            $(require('../templates/option-list-item.hbs')(metadata)).appendTo(this.$el.find('.options-list'));
                        } else {
                            if (metadata.isObject) {
                                return;
                            }
                                
                            var value;
                            
                            if (metadata.isBoolean) {
                                value = this.$el.find('[data-option-name="' + prop + '"]').prop(":checked");
                            } else if (metadata.isNumber) {
                                value = parseFloat(this.$el.find('[data-option-name="' + prop + '"]').val());
                            } else if (metadata.isString) {
                                value = this.$el.find('[data-option-name="' + prop + '"]').val();
                            }
                            
                            if (this.options[prop] != value) {
                                this.options[prop] = value;
                            }
                        }
                    }
                }
            },
            requiredComponents: ['html-renderer']
        };
    }
});