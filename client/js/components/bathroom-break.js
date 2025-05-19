define(function() {
    var _ = require('../util/underscore');
    var versioned = require('../util/version').versioned;
    
    return function BathroomBreak() {
        return {
            _: {
                isStaticPosition: true,
                'z-index': 1000,
                position: {
                    x: 50,
                    y: 50
                },
                width: 400,
                height: 300,
                title: 'Bathroom Break',
                breakDuration: 300000, // 5 minutes in milliseconds
                breakStartTime: null,
                isBreakActive: false,
                adSlots: {
                    banner: null,
                    video: null
                },
                analytics: {
                    breakCount: 0,
                    totalBreakTime: 0,
                    adImpressions: 0,
                    adClicks: 0,
                    curseCount: 0,
                    peroxideUses: 0,
                    psychicDamageDealt: 0,
                    propertyGained: 0,
                    citrusTasteCount: 0
                },
                hasBathroomCurse: false,
                curseDuration: 600000, // 10 minutes
                curseStartTime: null,
                peroxideAvailable: true,
                tpAvailable: true,
                propertyGainChance: 0.3, // 30% chance to gain property from ads
                citrusTasteChance: 0.4 // 40% chance for citrus/fennel taste
            },
            requiredComponents: ['window'],
            messages: {
                'start-break': versioned({ 
                    major: 1, 
                    rev: 0,
                    fun: function(entity, data) {
                        if (!this.isBreakActive) {
                            this.startBreak();
                            this.isBreakActive = true;
                        }
                    }
                }),
                
                'end-break': versioned({ 
                    major: 1, 
                    rev: 0,
                    fun: function(entity, data) {
                        if (this.isBreakActive) {
                            this.endBreak();
                            this.isBreakActive = false;
                        }
                    }
                }),
                
                'apply-curse': versioned({ 
                    major: 1, 
                    rev: 1,
                    fun: function(entity, data) {
                        if (!this.hasBathroomCurse) {
                            this.applyBathroomCurse();
                            // New in v1.1: Track curse source
                            if (data && data.source) {
                                this.analytics.curseSource = data.source;
                            }
                        }
                    }
                }),
                
                'use-peroxide': versioned({ 
                    major: 1, 
                    rev: 2,
                    fun: function(entity, data) {
                        if (this.hasBathroomCurse && this.peroxideAvailable) {
                            this.usePeroxide();
                            // New in v1.2: Track effectiveness
                            if (data && data.effectiveness) {
                                this.analytics.peroxideEffectiveness = data.effectiveness;
                            }
                        }
                    }
                }),
                
                'use-psychic-damage': versioned({ 
                    major: 1, 
                    rev: 1,
                    fun: function(entity, data) {
                        if (this.hasBathroomCurse && this.tpAvailable) {
                            this.usePsychicDamage();
                            // New in v1.1: Track damage amount
                            if (data && data.damage) {
                                this.analytics.psychicDamageAmount = data.damage;
                            }
                        }
                    }
                }),
                
                'load-ads': versioned({ 
                    major: 1, 
                    rev: 0,
                    fun: function(entity, data) {
                        this.loadAds();
                    }
                })
            },
            onAdd: function(entity, component) {
                // Initialize window
                this.window = entity.engine.createEntity({ tags: ['bathroom-break-window'] });
                this.window.addComponent('window', {
                    title: 'Bathroom Break',
                    size: { width: 400, height: 300 },
                    position: { x: 50, y: 50 }
                });

                // Add styles
                const styles = `
                    .ad-note {
                        margin-top: 10px;
                        padding: 8px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                    }
                    .ad-note p {
                        margin: 5px 0;
                        font-size: 14px;
                    }
                    .legal-text {
                        font-family: Helvetica, Arial, sans-serif;
                        font-size: 10px;
                        color: #999;
                        font-style: italic;
                    }
                `;
                $('<style>').text(styles).appendTo('head');

                // Create break interface
                const breakInterface = `
                    <div class="break-status">
                        <div class="timer">Break Time: <span id="break-timer">5:00</span></div>
                        <div class="curse-status" style="display: none;">
                            <span class="glyphicons glyphicons-skull"></span>
                            <span>Cursed!</span>
                        </div>
                        <div class="property-status" style="display: none;">
                            <span class="glyphicons glyphicons-home"></span>
                            <span>Property Gained!</span>
                        </div>
                        <div class="taste-status" style="display: none;">
                            <span class="glyphicons glyphicons-food"></span>
                            <span>Tastes like oranges and fennel seeds!</span>
                        </div>
                    </div>
                    <div class="sponsored-content">
                        <div class="ad-container"></div>
                        <div class="break-options">
                            <button class="peroxide-btn" style="display: none;">
                                <span class="glyphicons glyphicons-lab"></span>
                                Use 3% USP Hydrogen Peroxide
                            </button>
                            <button class="tp-btn" style="display: none;">
                                <span class="glyphicons glyphicons-toilet"></span>
                                Spit on TP for Psychic Damage
                            </button>
                        </div>
                    </div>
                `;

                this.window.data.$el.find('.window-content').html(breakInterface);
                this.setupEventListeners();
            },
            setupEventListeners: function() {
                const $el = this.window.data.$el;
                
                $el.find('.peroxide-btn').click(() => {
                    if (this.hasBathroomCurse && this.peroxideAvailable) {
                        this.usePeroxide();
                    }
                });

                $el.find('.tp-btn').click(() => {
                    if (this.hasBathroomCurse && this.tpAvailable) {
                        this.usePsychicDamage();
                    }
                });
            },
            startBreak: function() {
                this.analytics.breakCount++;
                this.breakStartTime = Date.now();
                this.updateTimer();
                
                // Random chance to get cursed
                if (Math.random() < 0.3) { // 30% chance
                    this.applyBathroomCurse();
                }

                // Load ads
                this.loadAds();
                
                // Track analytics
                if (window.ga) {
                    ga('send', 'event', 'Bathroom Break', 'Start');
                }
            },
            applyBathroomCurse: function() {
                this.hasBathroomCurse = true;
                this.curseStartTime = Date.now();
                this.analytics.curseCount++;
                
                const $el = this.window.data.$el;
                $el.find('.curse-status').show();
                $el.find('.peroxide-btn').show();
                $el.find('.tp-btn').show();
                
                // Show curse message
                this.showMessage('You have been cursed with stinky doodoo butt!', 'warning');
            },
            usePeroxide: function() {
                if (!this.peroxideAvailable) return;
                
                this.peroxideAvailable = false;
                this.analytics.peroxideUses++;
                this.hasBathroomCurse = false;
                
                const $el = this.window.data.$el;
                $el.find('.curse-status').hide();
                $el.find('.peroxide-btn').hide();
                
                this.showMessage('The curse has been cleansed with hydrogen peroxide!', 'success');
                
                if (window.ga) {
                    ga('send', 'event', 'Bathroom Break', 'Peroxide Used');
                }
            },
            usePsychicDamage: function() {
                if (!this.tpAvailable) return;
                
                this.tpAvailable = false;
                this.analytics.psychicDamageDealt++;
                this.hasBathroomCurse = false;
                
                const $el = this.window.data.$el;
                $el.find('.curse-status').hide();
                $el.find('.tp-btn').hide();
                
                this.showMessage('The curse has been defeated with psychic damage!', 'success');
                
                if (window.ga) {
                    ga('send', 'event', 'Bathroom Break', 'Psychic Damage Used');
                }
            },
            showMessage: function(message, type) {
                const $el = this.window.data.$el;
                const $message = $(`<div class="break-message ${type}">${message}</div>`);
                $el.find('.break-status').append($message);
                setTimeout(() => $message.fadeOut(() => $message.remove()), 3000);
            },
            updateTimer: function() {
                const $timer = this.window.data.$el.find('#break-timer');
                const update = () => {
                    const now = Date.now();
                    const timeLeft = Math.max(0, this.breakDuration - (now - this.breakStartTime));
                    const minutes = Math.floor(timeLeft / 60000);
                    const seconds = Math.floor((timeLeft % 60000) / 1000);
                    $timer.text(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                    
                    if (timeLeft > 0) {
                        setTimeout(update, 1000);
                    } else {
                        this.endBreak();
                    }
                };
                update();
            },
            endBreak: function() {
                this.analytics.totalBreakTime += Date.now() - this.breakStartTime;
                
                if (window.ga) {
                    ga('send', 'event', 'Bathroom Break', 'End', {
                        duration: Math.floor((Date.now() - this.breakStartTime) / 1000)
                    });
                }
                
                this.window.destroy();
            },
            loadAds: function() {
                // Simulate ad loading
                const $adContainer = this.window.data.$el.find('.ad-container');
                $adContainer.html(`
                    <div class="ad-banner">
                        <span class="glyphicons glyphicons-ad"></span>
                        Sponsored Content
                    </div>
                    <div class="ad-note">
                        <p>Please spit on, do not lick the toilet paper! 😜</p>
                        <p class="legal-text">RogueScroll video game 🎮 (tm) not responsible for any fecal or bathroom related activities.</p>
                    </div>
                `);
                
                this.analytics.adImpressions++;
                
                // Check for property gain
                if (Math.random() < this.propertyGainChance) {
                    this.gainProperty();
                }
                
                // Check for citrus/fennel taste
                if (Math.random() < this.citrusTasteChance) {
                    this.applyCitrusTaste();
                }
                
                if (window.ga) {
                    ga('send', 'event', 'Ads', 'Impression');
                }
            },
            gainProperty: function() {
                this.analytics.propertyGained++;
                const $el = this.window.data.$el;
                $el.find('.property-status').show();
                this.showMessage('Congratulations! You gained a new property from watching ads!', 'success');
                
                if (window.ga) {
                    ga('send', 'event', 'Property', 'Gained');
                }
            },
            applyCitrusTaste: function() {
                this.analytics.citrusTasteCount++;
                const $el = this.window.data.$el;
                $el.find('.taste-status').show();
                this.showMessage('Your spit tastes like oranges and fennel seeds!', 'info');
                
                if (window.ga) {
                    ga('send', 'event', 'Taste', 'CitrusFennel');
                }
            }
        };
    };
}); 