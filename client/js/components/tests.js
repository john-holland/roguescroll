define(function() {
    return function Tests() {
        return {
            _: {
                unitTests: [],
                unitTestResults: null,
                integrationTests: [],
                integrationTestResults: null,
                continuityTests: [],
                testResultFrames: new Array(3600),
                keepFrames: 3600
            },
            onAdd: function(entity, component) {
                this.unitTestResults = _.map(this.unitTests, function(test) { return test(); });
                this.integrationTestResults = _.map(this.integrationTests, function(test) { return test(); });
            },
            update: function (dt, entity, component) {
                if (this.testResultFrames.length > this.keepFrames) {
                    this.testResultFrames.unshift();
                }
                this.testResultFrames.push(_.map(this.continuityTests, function(test) { return { results: test(), gameTime: entity.engine.gameTime }; }))
            },
            messages: {
                'set-keep-frames': function(entity, data) {
                    if ('keepFrames' in data) {
                        while (this.testResultFrames.length > data.keepFrames) {
                            this.testResultFrames.unshift();
                        }
                        
                        this.keepFrames = data.keepFrames;
                    }
                }
            }
        }
    }
})