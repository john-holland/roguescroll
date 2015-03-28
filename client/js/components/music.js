//todo: The music component should look at the current level's foreground, background and accent color and pick clips played in the same key, that are quantized

//primary colors: red, yellow, blue
/***
 * Take each group of loops and map it to a section of the color wheel.
 * 
 * If the color chosen falls into that, play a random clip from that section.
 * 
 */
 
 define(function() {
    var ListMap = require("../util/listmap"),
        buzz = require("../util/buzz"),
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
                formats: ['m4a', 'mp3'],
                tracks: {
                    drums: {
                        blue: 'OUTRO_DRUMS 2',
                        red: 'OUTRO_DRUMS 3',
                        yellow: 'OUTRO_DRUMS'
                    },
                    byColor: {
                        blue: [
                            'OUTRO_COWBELL'
                        ],
                        purple: [
                            'OUTRO_FRACTAL BASS'
                        ],
                        red: [
                            'OUTRO_CHIPPY ARP'
                        ],
                        orange: [
                            'OUTRO_MELODY'
                        ],
                        yellow: [
                            'OUTRO_PADS'
                        ],
                        green: [
                            'OUTRO_SINES'
                        ]
                    }
                },
                timeSinceLastQuantization: 0,
                tracksToPlay: [],
                tracksToStop: []
            },
            tags: ['level-change-subscriber'],
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
                    this.levelToTracks = levels.map(getTracksForLevel.bind(null, this));
                    
                    //now that we have all the tracks decided for each of the levels,
                    //  we should load the first level
                    
                    loadLevel(this.levelToTracks[0], this.loadedTracks, this.baseDir, this.formats);
                    playLevel(this.levelToTracks[0], self.tracksToPlay);
                    //loadLevel(this.levelToTracks[1], this.loadedTracks, this.baseDir, this.formats);
                },
                'level-change': function(entity, data) {
                    var self = this,
                        level = data.level;
                        
                    if (this.levelToTracks.length < data.level) {
                        var levels = entity.engine.findEntityByTag('world').data.levels;
                        while (this.levelToTracks.length < data.level) {
                            this.levelToTracks.push(getTracksForLevel(this, levels[this.levelToTracks.length - 1]));
                        }
                    }
                    
                    var levelMusic = this.levelToTracks[level - 1];
                    
                    if (data.previousLevel) {
                        stopLevel(this.levelToTracks[data.previousLevel - 1], self.tracksToStop);
                    }

                    loadLevel(levelMusic, self.loadedTracks, self.baseDir, self.formats);

                    playLevel(levelMusic, self.tracksToPlay);
                },
                'loaded-level': function(entity, data) {
                    var self = this,
                        level = data.level;
                        
                    if (this.levelToTracks.length < data.level) {
                        var levels = entity.engine.findEntityByTag('world').data.levels;
                        while (this.levelToTracks.length < data.level) {
                            this.levelToTracks.push(getTracksForLevel(this, levels[this.levelToTracks.length - 1]));
                        }
                    }
                    
                    var levelMusic = this.levelToTracks[level - 1];

                    loadLevel(levelMusic, self.loadedTracks, self.baseDir, self.formats);
                    console.log('loaded music for next level');
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
    
    function getTracksForLevel(self, level) {
        /*
        - Pads
        - Drums 1
        - Melody
        */
        var tracks = {},
            background = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.background : tinyColor("yellow"))),
            font = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.font : tinyColor("orange"))),
            accent = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.accent : tinyColor("yellow"))),
            closestBackground, closestFont, closestAccent;
            
        //get the closest sound to each of the colors
        closestBackground = _.sortBy(_.pairs(self.tracks.drums).map(convertToLab),
            colorDistance.bind(null, background))[0][1]; //a pair is returned
            
        var tracksByColor = _.flatten(_.pairs(self.tracks.byColor).map(function(colorToTrack) {
            return colorToTrack[1].map(function(track) {
                return [colorToTrack[0], track];
            });
        }), true);
        
        //map the accent and colors out into pairs and pass them into this...
        closestFont = _.sortBy(tracksByColor.map(convertToLab),
            colorDistance.bind(null, font))[0][1]; //a pair is returned
        
        closestAccent = _.sortBy(tracksByColor.map(convertToLab),
            colorDistance.bind(null, accent))[0][1]; //a pair is returned
        
        return {
            background: closestBackground,
            font: closestFont,
            accent: closestAccent
        }
    }
 })