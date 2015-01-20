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
                this.testResultFrames.push(_.map(this.continuityTests, function(test) { return test(); }))
            },
            messages: {
                'set-keep-frames': function(entity, data) {
                    if (data.keepFrames) {
                        while (testResultFrames.length > )
                    }
                }
            }
        }
    }
})