//todo: The music component should look at the current level's foreground, background and accent color and pick clips played in the same key, that are quantized

//primary colors: red, yellow, blue
/***
 * Take each group of loops and map it to a section of the color wheel.
 * 
 * If the color chosen falls into that, play a random clip from that section.
 * 
 */
 
 define(function() {
    var mori = require('mori'),
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
                    unsorted: mori.vector(
                        'DRUMS 1', 'DRUMS 2', 'DRUMS 3', 'DRUMS 4', 'DRUMS 5',
                        'DRUMS 6', 'HARMONY1', 'HARMONY2', 'HARMONY3', 'HARMONY4',
                        'HARMONY5', 'HARMONY6', 'MELODY1', 'MELODY2', 'MELODY3',
                        'MELODY4', 'MELODY5', 'MELODY6'
                    ),
                    colors: mori.vector('blue', 'purple', 'red', 'orange', 'yellow', 'green'),
                    drums: mori.hashMap(
                        'blue', 'OUTRO_DRUMS 2',
                        'red', 'OUTRO_DRUMS 3',
                        'yellow', 'OUTRO_DRUMS'
                    ),
                    byColor: null
                },
                timeSinceLastQuantization: 0,
                tracksToPlay: mori.vector(),
                tracksToStop: mori.vector(),
                volume: 50,
                volumeRamps: mori.hashMap(
                    'background', mori.hashMap('target', 50, 'current', 50, 'speed', 0.5),
                    'font', mori.hashMap('target', 50, 'current', 50, 'speed', 0.5),
                    'accent', mori.hashMap('target', 50, 'current', 50, 'speed', 0.5)
                ),
                defaultVolume: 50,
                maxVolume: 100,
                minVolume: 20
            },
            tags: ['level-change-subscriber'],
            onAdd: function(entity, component) {
                // Group tracks by type
                var byGroup = mori.group_by(
                    function(track) { return track.replace(/\d/ig, '').trim(); },
                    this.tracks.unsorted
                );
                
                // Convert groups to vector of maps
                this.tracks.groups = mori.map(
                    function(group) {
                        return mori.hash_map(
                            'name', mori.first(group),
                            'tracks', mori.second(group)
                        );
                    },
                    mori.seq(byGroup)
                );
                
                // Initialize color groups
                this.tracks.byColor = mori.reduce(
                    function(acc, color) {
                        return mori.assoc(acc, color, mori.vector());
                    },
                    mori.hash_map(),
                    this.tracks.colors
                );
                
                // Distribute tracks across colors
                var groupsToPop = mori.map(
                    function(group) {
                        return mori.hash_map(
                            'name', mori.get(group, 'name'),
                            'tracks', mori.into(mori.vector(), mori.get(group, 'tracks'))
                        );
                    },
                    this.tracks.groups
                );
                
                while (mori.some(function(group) { 
                    return mori.count(mori.get(group, 'tracks')) > 0; 
                }, groupsToPop)) {
                    mori.each(this.tracks.colors, function(color) {
                        mori.each(groupsToPop, function(group) {
                            var tracks = mori.get(group, 'tracks');
                            if (mori.count(tracks) > 0) {
                                var track = mori.first(tracks);
                                this.tracks.byColor = mori.update_in(
                                    this.tracks.byColor,
                                    [color],
                                    function(tracks) { return mori.conj(tracks, track); }
                                );
                                mori.assoc(group, 'tracks', mori.rest(tracks));
                            }
                        });
                    });
                }
            },
            update: function(dt, entity, component) {
                this.timeSinceLastQuantization += dt;
                
                // Update volume ramps
                this.volumeRamps = mori.reduce(
                    function(acc, pair) {
                        var track = mori.first(pair);
                        var ramp = mori.second(pair);
                        var diff = mori.get(ramp, 'target') - mori.get(ramp, 'current');
                        
                        if (Math.abs(diff) > 0.1) {
                            var newCurrent = mori.get(ramp, 'current') + 
                                diff * (dt / 1000) * mori.get(ramp, 'speed');
                            
                            ramp = mori.assoc(ramp, 'current', newCurrent);
                            
                            // Apply volume to track
                            if (this.loadedTracks && mori.has_key(this.loadedTracks, track)) {
                                mori.get(this.loadedTracks, track).setVolume(newCurrent);
                            }
                        }
                        
                        return mori.assoc(acc, track, ramp);
                    },
                    this.volumeRamps,
                    mori.seq(this.volumeRamps)
                );
                
                if (this.timeSinceLastQuantization > msPerQuantization) {
                    this.timeSinceLastQuantization -= msPerQuantization;
                    
                    // Stop tracks
                    mori.each(this.tracksToStop, function(track) {
                        if (this.loadedTracks && mori.has_key(this.loadedTracks, track)) {
                            mori.get(this.loadedTracks, track).stop();
                        }
                    });
                    this.tracksToStop = mori.vector();
                    
                    // Play tracks
                    mori.each(this.tracksToPlay, function(track) {
                        if (this.loadedTracks && mori.has_key(this.loadedTracks, track)) {
                            mori.get(this.loadedTracks, track).play().loop();
                        }
                    });
                    this.tracksToPlay = mori.vector();
                }
            },
            messages: {
                'game-start': function(entity, data) {
                    var world = entity.engine.findEntityByTag('world'),
                        levels = world.data.levels;
                    
                    this.loadedTracks = this.loadedTracks || mori.hash_map();
                    
                    // Pick tracks for each level
                    this.levelToTracks = mori.map(
                        function(level) { 
                            return getTracksForLevel(entity, this, level); 
                        },
                        mori.vector.apply(null, levels)
                    );
                    
                    // Load first level
                    loadLevel(
                        mori.first(this.levelToTracks),
                        this.loadedTracks,
                        this.baseDir,
                        this.formats
                    ).then(function() {
                        playLevel(mori.first(this.levelToTracks), this.tracksToPlay);
                    }.bind(this));
                    
                    // Preload next levels
                    setTimeout(function() {
                        loadLevel(mori.nth(this.levelToTracks, 1), this.loadedTracks, this.baseDir, this.formats);
                        loadLevel(mori.nth(this.levelToTracks, 2), this.loadedTracks, this.baseDir, this.formats);
                    }.bind(this), 5000);
                },
                'level-change': function(entity, data) {
                    var level = data.level,
                        world = entity.engine.findEntityByTag('world');
                    
                    // Generate new levels if needed
                    if (mori.count(this.levelToTracks) < level) {
                        var levels = world.data.levels;
                        while (mori.count(this.levelToTracks) < data.level) {
                            this.levelToTracks = mori.conj(
                                this.levelToTracks,
                                getTracksForLevel(entity, this, levels[mori.count(this.levelToTracks)])
                            );
                        }
                    }
                    
                    var levelMusic = mori.nth(this.levelToTracks, level - 1);
                    
                    if (data.previousLevel) {
                        stopLevel(
                            mori.nth(this.levelToTracks, data.previousLevel - 1),
                            this.tracksToStop
                        );
                    }
                    
                    loadLevel(levelMusic, this.loadedTracks, this.baseDir, this.formats)
                        .then(function() {
                            if (world.data.level === level) {
                                playLevel(levelMusic, this.tracksToPlay);
                            }
                        }.bind(this));
                },
                'loaded-level': function(entity, data) {
                    var self = this,
                        level = data.level;
                        
                    if (mori.count(this.levelToTracks) < data.level) {
                        var levels = entity.engine.findEntityByTag('world').data.levels;
                        while (mori.count(this.levelToTracks) < data.level) {
                            this.levelToTracks = mori.conj(
                                this.levelToTracks,
                                getTracksForLevel(entity, this, levels[mori.count(this.levelToTracks)])
                            );
                        }
                    }
                    
                    var levelMusic = mori.nth(this.levelToTracks, level - 1);

                    loadLevel(levelMusic, this.loadedTracks, this.baseDir, this.formats);
                    console.log('loaded music for next level');
                },
                'enemy-spotted-player': function(entity, data) {
                    this.volumeRamps = mori.update_in(
                        this.volumeRamps,
                        ['background'],
                        function(ramp) {
                            return mori.assoc(ramp, 'target', this.maxVolume, 'speed', 1.0);
                        }
                    );
                },
                'enemy-lost-player': function(entity, data) {
                    this.volumeRamps = mori.update_in(
                        this.volumeRamps,
                        ['background'],
                        function(ramp) {
                            return mori.assoc(ramp, 'target', this.defaultVolume, 'speed', 0.3);
                        }
                    );
                },
                'trap-nearby': function(entity, data) {
                    this.volumeRamps = mori.update_in(
                        this.volumeRamps,
                        ['accent'],
                        function(ramp) {
                            return mori.assoc(ramp, 'target', this.maxVolume, 'speed', 0.8);
                        }
                    );
                },
                'trap-disarmed': function(entity, data) {
                    this.volumeRamps = mori.update_in(
                        this.volumeRamps,
                        ['accent'],
                        function(ramp) {
                            return mori.assoc(ramp, 'target', this.defaultVolume, 'speed', 0.3);
                        }
                    );
                },
                'set-volume': function(entity, data) {
                    if (!data.volume) {
                        throw new Error('volume required');
                    }
                    
                    this.defaultVolume = data.volume;
                    this.volumeRamps = mori.reduce(
                        function(acc, pair) {
                            var track = mori.first(pair);
                            var ramp = mori.second(pair);
                            return mori.assoc(acc, track, mori.assoc(ramp, 'target', data.volume));
                        },
                        this.volumeRamps,
                        mori.seq(this.volumeRamps)
                    );
                }
            }
        };
    }
    
    function loadLevel(levelMusic, loadedTracks, baseDir, formats) {
        var tracksToPlay = mori.vals(levelMusic);
        
        mori.each(tracksToPlay, function(track) {
            if (!mori.has_key(loadedTracks, track)) {
                loadedTracks = mori.assoc(
                    loadedTracks,
                    track,
                    new sound(baseDir + track, { formats: formats })
                );
                mori.get(loadedTracks, track).load();
            }
        });
        
        return Promise.all(mori.map(function(track) {
            return new Promise(function(resolve, reject) {
                var sound = mori.get(loadedTracks, track);
                
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
        }, tracksToPlay));
    }
    
    function playLevel(levelMusic, tracksToPlay) {
        return mori.conj(
            mori.conj(
                mori.conj(tracksToPlay, mori.get(levelMusic, 'background')),
                mori.get(levelMusic, 'font')
            ),
            mori.get(levelMusic, 'accent')
        );
    }
    
    function stopLevel(levelMusic, tracksToStop) {
        return mori.conj(
            mori.conj(
                mori.conj(tracksToStop, mori.get(levelMusic, 'background')),
                mori.get(levelMusic, 'font')
            ),
            mori.get(levelMusic, 'accent')
        );
    }
    
    function colorDistance(origin, labToTrack) {
        var trackColor = labToTrack[0];
        return Math.sqrt(
            Math.pow(trackColor[0] - origin[0], 2) +
            Math.pow(trackColor[1] - origin[1], 2) +
            Math.pow(trackColor[2] - origin[2], 2)
        );
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
        var world = world || entity.engine.findEntityByTag('world'),
            background = conversions.rgb2lab(tinyColorToRgbArray(
                level.number !== 1 ? level.colors.background : tinyColor('yellow')
            )),
            font = conversions.rgb2lab(tinyColorToRgbArray(
                level.number !== 1 ? level.colors.font : tinyColor('orange')
            )),
            accent = conversions.rgb2lab(tinyColorToRgbArray(
                level.number !== 1 ? level.colors.accent : tinyColor('yellow')
            )),
            previousLevel = level.number > 1 ? world.data.levels[level.number - 2] : null,
            tracksToRemove = previousLevel ? 
                mori.vals(getTracksForLevel(entity, self, world.data.levels[previousLevel.number - 1])) : 
                mori.vector();
        
        var tracksByColor = mori.filter(
            function(colorTrack) {
                return mori.every(function(track) {
                    return mori.get(colorTrack, 1).indexOf(track) < 0;
                }, tracksToRemove);
            },
            mori.mapcat(
                function(colorToTracks) {
                    return mori.map(
                        function(track) {
                            return mori.vector(mori.first(colorToTracks), track);
                        },
                        mori.second(colorToTracks)
                    );
                },
                mori.seq(self.tracks.byColor)
            )
        );
        
        var closestBackground = mori.second(
            mori.first(
                mori.sort_by(
                    function(track) { return colorDistance(background, convertToLab(track)); },
                    mori.map(convertToLab, tracksByColor)
                )
            )
        );
        
        var strippedBackground = closestBackground.replace(/\d/ig, '').trim();
        
        tracksByColor = mori.filter(
            function(colorTrack) {
                return mori.get(colorTrack, 1).indexOf(strippedBackground) < 0;
            },
            tracksByColor
        );
        
        var closestFont = mori.second(
            mori.first(
                mori.sort_by(
                    function(track) { return colorDistance(font, convertToLab(track)); },
                    mori.map(convertToLab, tracksByColor)
                )
            )
        );
        
        var strippedFont = closestFont.replace(/\d/ig, '').trim();
        
        tracksByColor = mori.filter(
            function(colorTrack) {
                return mori.get(colorTrack, 1).indexOf(strippedFont) < 0;
            },
            tracksByColor
        );
        
        var closestAccent = mori.second(
            mori.first(
                mori.sort_by(
                    function(track) { return colorDistance(accent, convertToLab(track)); },
                    mori.map(convertToLab, tracksByColor)
                )
            )
        );
        
        return mori.hash_map(
            'background', closestBackground,
            'font', closestFont,
            'accent', closestAccent
        );
    }
 })