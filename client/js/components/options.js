define(function() {
    var _ = require("underscore");
    
    return function Options() {
        return {
            _: {
                options: {
                    //if you provide an object, you must provide an function optionsTemplate(option, value, entity, component)
                    // setup sensible data-attributes and use find() selectors on $el to setup callbacks
                    speed: 200
                },
                optionsMetadata: [],
                htmlTemplateFactory: function(entity, component) {
                    var options = _.filter(_.map(_.pairs(entity.data.options), function(pair) {
                        var option = pair[0],
                            value = pair[1],
                            optionType = typeof value,
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
                    }), function(metadata) { return metadata != null });
                    entity.optionsMetadata = options;
                    return require("../templates/options.hbs")({ options: options });
                }
            },
            update: function(dt, entity, component) {
                //foreach option, check the value of the option 
            },
            requiredComponents: ['html-renderer']
        };
    }
});