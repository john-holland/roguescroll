//todo: The music component should look at the current level's foreground, background and accent color and pick clips played in the same key, that are quantized

//primary colors: red, yellow, blue
/***
 * Take each group of loops and map it to a section of the color wheel.
 * 
 * If the color chosen falls into that, play a random clip from that section.
 * 
 */
 
 define(function() {
    var ListMap = require('../util/listmap'),
        buzz = require('../util/buzz'),
        sound = buzz.sound,
        tinyColor = require('../util/tinycolor'),
        _ = require('../util/underscore'),
        conversions = require('../util/colorconversions');
     
    return function() {
        var BPM = 83,
            quantizedBeats = 8,
            msPerQuantization = quantizedBeats / BPM * (60 * 1000);
        return {
            _: {
                baseDir: '/audio/',
                formats: ['m4a', 'ogg', 'mp3', 'wav'],
                tracks: {
                    unsorted: [
                        'DRUMS 1', 
                        'DRUMS 2', 
                        'DRUMS 3', 
                        'DRUMS 4', 
                        'DRUMS 5',
                        'DRUMS 6', 
                        'HARMONY1', 
                        'HARMONY2', 
                        'HARMONY3', 
                        'HARMONY4', 
                        'HARMONY5', 
                        'HARMONY6',
                        'MELODY1',
                        'MELODY2', 
                        'MELODY3', 
                        'MELODY4',
                        'MELODY5',
                        'MELODY6'
                    ],
                    colors: [
                        'blue',
                        'purple',
                        'red',
                        'orange',
                        'yellow',
                        'green'
                    ],
                    drums: {
                        blue: 'OUTRO_DRUMS 2',
                        red: 'OUTRO_DRUMS 3',
                        yellow: 'OUTRO_DRUMS'
                    },
                    byColor: undefined
                },
                timeSinceLastQuantization: 0,
                tracksToPlay: [],
                tracksToStop: [],
                volume: 50
            },
            tags: ['level-change-subscriber'],
            onAdd: function(entity, component) {
                
                this.tracks.byGroup = _.groupBy(this.tracks.unsorted, function(track) { return track.replace(/\d/ig, '').trim(); });
                this.tracks.groups = _.pairs(this.tracks.byGroup).map(function(groupPair) {
                    return {
                        name: groupPair[0],
                        tracks: groupPair[1]
                    };
                });
                
                var groupsToPop = _.pairs(this.tracks.byGroup).map(function(groupPair) {
                    return {
                        name: groupPair[0],
                        tracks: groupPair[1].slice(0)
                    };
                }),
                self = this;
                
                //turn the colors into their group 
                this.tracks.byColor = _.object(this.tracks.colors.map(function(color) {
                    return [color, []];
                }))
                
                while (_.any(groupsToPop, function(group) { return group.tracks.length; })) {
                    this.tracks.colors.forEach(function(color) {
                        groupsToPop.forEach(function(group) {
                            self.tracks.byColor[color].push(group.tracks.pop());
                        });
                    })
                }
            },
            update: function(dt, entity, component) {
                //increment the 
                var self = this;
                this.timeSinceLastQuantization += dt;
                
                if (this.timeSinceLastQuantization > msPerQuantization) {
                    this.timeSinceLastQuantization -= msPerQuantization;
                    
                    
                    this.tracksToStop.forEach(function(track) {
                        if (self.loadedTracks.contains(track)) {
                            self.loadedTracks.get(track).stop();
                        }
                    });
                    this.tracksToStop = [];
                    
                    this.tracksToPlay.forEach(function(track) {
                        if (self.loadedTracks.contains(track)) {
                            self.loadedTracks.get(track).play().loop();
                        }
                    });
                    this.tracksToPlay = [];
                }
            },
            messages: {
                'game-start': function(entity, data) {
                    var world = entity.engine.findEntityByTag('world'),
                        levels = world.data.levels,
                        self = this;
                    
                    this.loadedTracks = this.loadedTracks || new ListMap();
                    
                    //pick the tracks to play for each level
                    /*background
                    font
                    accent*/
                    this.levelToTracks = levels.map(getTracksForLevel.bind(null, entity, this));
                    
                    //now that we have all the tracks decided for each of the levels,
                    //  we should load the first level
                    
                    loadLevel(this.levelToTracks[0], this.loadedTracks, this.baseDir, this.formats)
                        .then(function() {
                            playLevel(this.levelToTracks[0], self.tracksToPlay);
                        }.bind(this));
                        
                    setTimeout(function() {
                        loadLevel(this.levelToTracks[1], this.loadedTracks, this.baseDir, this.formats);
                        loadLevel(this.levelToTracks[2], this.loadedTracks, this.baseDir, this.formats);
                    }.bind(this), 5000);
                },
                'level-change': function(entity, data) {
                    var self = this,
                        level = data.level,
                        world = entity.engine.findEntityByTag('world');
                        
                    if (this.levelToTracks.length < data.level) {
                        var levels = world.data.levels;
                        while (this.levelToTracks.length < data.level) {
                            this.levelToTracks.push(getTracksForLevel(entity, this, levels[this.levelToTracks.length - 1]));
                        }
                    }
                    
                    var levelMusic = this.levelToTracks[level - 1];
                    
                    if (data.previousLevel) {
                        stopLevel(this.levelToTracks[data.previousLevel - 1], self.tracksToStop);
                    }

                    loadLevel(levelMusic, self.loadedTracks, self.baseDir, self.formats).then(function() {
                        if (world.data.level === level) {
                            playLevel(levelMusic, self.tracksToPlay); 
                        }
                    });
                },
                'loaded-level': function(entity, data) {
                    var self = this,
                        level = data.level;
                        
                    if (this.levelToTracks.length < data.level) {
                        var levels = entity.engine.findEntityByTag('world').data.levels;
                        while (this.levelToTracks.length < data.level) {
                            this.levelToTracks.push(getTracksForLevel(entity, this, levels[this.levelToTracks.length - 1]));
                        }
                    }
                    
                    var levelMusic = this.levelToTracks[level - 1];

                    loadLevel(levelMusic, self.loadedTracks, self.baseDir, self.formats);
                    console.log('loaded music for next level');
                },
                'set-volume': function(entity, data) {
                    if (!data.volume) {
                        throw new Error('volume requied');
                    }
                    
                    buzz.all().setVolume(data.volume);
                }
            }
        };
    }
    
    function loadLevel(levelMusic, loadedTracks, baseDir, formats) {
        var tracksToPlay = _.values(levelMusic);

        tracksToPlay.forEach(function(track) {
            if (!loadedTracks.contains(track)) {
                loadedTracks.add(track, new sound(baseDir + track, {
                    formats: formats
                }));
                loadedTracks.get(track).load();
                
            }
        });
        
        return Promise.all(tracksToPlay.map(function(track) { 
            return new Promise(function(resolve, reject) { 
                var sound = loadedTracks.get(track);
                
                if (sound.getStateCode() === 4) {
                    resolve(sound);
                }
                
                sound.bind('canplay', function() {
                    resolve(sound);
                });
                
                sound.bind('error', function(e) {
                    reject(e);
                });
            });
        }));
    }
    
    function playLevel(levelMusic, tracksToPlay) {
        tracksToPlay.push(levelMusic.background);
        tracksToPlay.push(levelMusic.font);
        tracksToPlay.push(levelMusic.accent);
    }
    
    function stopLevel(levelMusic, tracksToStop) {
        tracksToStop.push(levelMusic.background);
        tracksToStop.push(levelMusic.font);
        tracksToStop.push(levelMusic.accent);
    }
    
    function colorDistance(origin, labToTrack) {
        //using Lab we're able to do a euclidean distance between colors
        var trackColor = labToTrack[0];
        return Math.sqrt(Math.pow(trackColor[0] - origin[0], 2),
                         Math.pow(trackColor[1] - origin[1], 2),
                         Math.pow(trackColor[2] - origin[2], 2));
    }
    
    function convertToLab(drumPair) {
        var drumLAB = conversions.keyword2lab(drumPair[0]);
        return [drumLAB, drumPair[1]];
    }
    
    function tinyColorToRgbArray(color) {
        var rgb = color.toRgb();
        return [rgb.r, rgb.g, rgb.b];
    }
    
    var world = null;
    function getTracksForLevel(entity, self, level) {
        /*
        - Pads
        - Drums 1
        - Melody
        */
        var tracks = {},
            world = world || entity.engine.findEntityByTag('world'),
            background = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.background : tinyColor('yellow'))),
            font = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.font : tinyColor('orange'))),
            accent = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.accent : tinyColor('yellow'))),
            closestBackground, 
            closestFont, 
            closestAccent,
            previousLevel = level.number > 1 ? world.data.levels[level.number - 2] : null,
            tracksToRemove = previousLevel ? _.values(getTracksForLevel(entity, self, world.data.levels[previousLevel.number - 1])) : [];
            
        var tracksByColor = _.flatten(_.pairs(self.tracks.byColor).map(function(colorToTracks) {
            return colorToTracks[1].map(function(track) {
                return [colorToTracks[0], track];
            })
            .filter(function(colorToTrack) {
                return _.all(tracksToRemove, function(track) { 
                    return colorToTrack[1].indexOf(track) < 0;
                });
            });
        }), true);
        
        closestBackground = _.sortBy(tracksByColor.map(convertToLab),
            colorDistance.bind(null, background))[0][1]; //a pair is returned
        var strippedBackground = closestBackground.replace(/\d/ig, '').trim();
        
        tracksByColor = _.filter(tracksByColor, function(colorTrack) { 
            return colorTrack[1].indexOf(strippedBackground) < 0; 
        });
        
        //map the accent and colors out into pairs and pass them into this...
        closestFont = _.sortBy(tracksByColor.map(convertToLab),
            colorDistance.bind(null, font))[0][1]; //a pair is returned
        var strippedFont = closestFont.replace(/\d/ig, '').trim();
        
        tracksByColor = _.filter(tracksByColor, function(colorTrack) { 
            return colorTrack[1].indexOf(strippedFont) < 0;
        });
        
        closestAccent = _.sortBy(tracksByColor.map(convertToLab),
            colorDistance.bind(null, accent))[0][1]; //a pair is returned
        
        return {
            background: closestBackground,
            font: closestFont,
            accent: closestAccent
        }
    }
 })