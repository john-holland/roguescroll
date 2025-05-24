(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("mori"), require("jQuery"));
	else if(typeof define === 'function' && define.amd)
		define("RogueScroll", ["mori", "jQuery"], factory);
	else if(typeof exports === 'object')
		exports["RogueScroll"] = factory(require("mori"), require("jQuery"));
	else
		root["RogueScroll"] = factory(root["mori"], root["jQuery"]);
})(this, (__WEBPACK_EXTERNAL_MODULE_mori__, __WEBPACK_EXTERNAL_MODULE_jquery__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./client/js/components/ai.js":
/*!************************************!*\
  !*** ./client/js/components/ai.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AI)
/* harmony export */ });
function AI() {
  return {
    // Minimal stub
  };
}

/***/ }),

/***/ "./client/js/components/animation.js":
/*!*******************************************!*\
  !*** ./client/js/components/animation.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ListMap = __webpack_require__(/*! ../util/listmap */ "./client/js/util/listmap.js");
var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
module.exports = function Animation() {
  return {
    _: {
      currentAnimation: null,
      animationQueue: []
    },
    requiredComponents: ['glyphicon-renderer'],
    onAdd: function onAdd(entity, component) {
      if (!component.animationMetadata) {
        var animationMetadata = new ListMap();
        var metadata = {
          walk: {
            duration: 1000,
            looping: true,
            defferable: true
          },
          'attack-down': {
            duration: 1000,
            looping: false,
            defferable: false
          },
          'attack-up': {
            duration: 1000,
            looping: false,
            defferable: false
          },
          'walk-down-steps': {
            duration: 3000,
            looping: false,
            defferable: false
          },
          'take-damage': {
            duration: 750,
            looping: false,
            defferable: false
          },
          'fall-down-pit': {
            duration: 1000,
            looping: false,
            defferable: false
          },
          death: {
            duration: 1000,
            looping: false,
            defferable: false
          },
          'take-critical-damage': {
            duration: 750,
            looping: false,
            defferable: false
          },
          explode: {
            duration: 1000,
            looping: false,
            defferable: false
          },
          drink: {
            duration: 1500,
            looping: true,
            defferable: true
          }
        };
        for (var prop in metadata) {
          if (metadata.hasOwnProperty(prop)) {
            var data = metadata[prop];
            data.name = prop;
            animationMetadata.add(prop, data);
          }
        }
        component.animationMetadata = animationMetadata;
        component.playAnimation = function (data, entity, animation, callback) {
          if (!component.animationMetadata.contains(animation)) {
            console.error('tried to play a bad animation');
          }
          if (data.currentAnimation && data.currentAnimation.metadata.name == animation && data.currentAnimation.metadata.looping) {
            //don't restart a looping animation
            return;
          }
          var animationData = component.animationMetadata.get(animation),
            playCurrent = false,
            animationWrapper = {
              metadata: animationData,
              callback: callback,
              started: entity.engine.gameTime
            };
          if (!data.currentAnimation) {
            playCurrent = true;
          } else {
            var currentAnimation = data.currentAnimation;
            if (currentAnimation.metadata.defferable) {
              entity.data.animationQueue.push(currentAnimation);
              playCurrent = true;
            }
          }
          if (playCurrent) {
            data.currentAnimation = animationWrapper;
            component.playForElem(data.$el, component, data, animationData);
          } else {
            data.animationQueue.push(animationWrapper);
          }
        };
        component.playForElem = function (elem, component, data, metadata) {
          //remove all the other animation classes.
          if (elem && elem.hasClass('animated')) {
            component.animationMetadata.getList().forEach(function (metadata) {
              elem.removeClass(metadata.name);
            });
          } else if (elem) {
            elem.addClass('animated');
          }
          if (metadata.looping) {
            elem.addClass('infinite-animation');
          }
          if (elem) {
            elem.addClass(metadata.name);
          }
        };
        component.stopCurrent = function (elem, component, data) {
          if (elem) {
            elem.removeClass('animated');
            elem.removeClass('infinite-animation');
            component.animationMetadata.getList().forEach(function (metadata) {
              elem.removeClass(metadata.name);
            });
            if (data.currentAnimation) {
              elem.removeClass(data.currentAnimation.name);
            }
          }
        };
      }
    },
    update: function update(dt, entity, component) {
      //check to see if our current animation is over and start the next one.
      // check to see if any in the queue are now done. remove them and fire their callbacks if any
      var playNext = !this.currentAnimation || !this.currentAnimation.metadata.looping && this.currentAnimation.started + this.currentAnimation.metadata.duration < entity.engine.gameTime;
      if (this.currentAnimation && playNext) {
        if (this.currentAnimation.callback) {
          this.currentAnimation.callback();
        }
        component.stopCurrent(this.$el, component, this);
        this.currentAnimation = null;
      }

      //remove any that are already over
      if (_.any(this.animationQueue, function (animation) {
        return animation.started + animation.metadata.duration < entity.engine.gameTime && !animation.metadata.looping;
      })) {
        this.animationQueue = _.filter(this.animationQueue, function (animation) {
          var over = animation.started + animation.metadata.duration < entity.engine.gameTime && !animation.metadata.looping;
          if (over && animation.callback) {
            animation.callback();
          }
          return !over;
        });
      }
      if (playNext && this.animationQueue.length) {
        this.currentAnimation = this.animationQueue.pop();
        component.playForElem(this.$el, component, this, this.currentAnimation.metadata);
      }
    },
    messages: {
      animate: function animate(entity, data, component) {
        if (!data || !data.animation) {
          return;
        }
        var animation = data.animation,
          callback = data.callback;
        component.playAnimation(this, entity, animation, callback);
      },
      'stop-animating': function stopAnimating(entity, data, component) {
        if (data.animation) {
          if (this.currentAnimation && this.currentAnimation.metadata.name == data.animation) {
            if (this.$el) {
              this.$el.removeClass('animated');
              this.$el.removeClass(data.animation);
              this.$el.removeClass('infinite-animation');
            }
            if (this.currentAnimation.callback) {
              this.currentAnimation.callback();
            }
            this.currentAnimation = null;
          }
          if (this.animationQueue.length && _.any(this.animationQueue, function (animation) {
            return animation.metadata.name === data.animation;
          })) {
            this.animationQueue = _.filter(this.animationQueue, function (animation) {
              return animation.metadata.name !== data.animation;
            });
          }
          return;
        }

        //stop the current animation
        this.$el.removeClass('animated');
        component.animationMetadata.getList().forEach(function (metadata) {
          data.$el.removeClass(metadata.name);
        });
        if (this.currentAnimation) {
          this.$el.removeClass(this.currentAnimation.name);
        }
        if (this.currentAnimation) {
          this.$el.removeClass(this.currentAnimation.name);
          if (this.currentAnimation.callback) {
            this.currentAnimation.callback();
          }
        }
        this.animationQueue.forEach(function (animation) {
          if (animation.callback) {
            animation.callback();
          }
        });
        this.animationQueue = [];
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/augment.js":
/*!*****************************************!*\
  !*** ./client/js/components/augment.js ***!
  \*****************************************/
/***/ ((module) => {

module.exports = function () {
  return {
    _: {
      augmentAbility: null,
      downRightOffset: {
        x: -35,
        y: -35
      },
      upRightOffset: {
        x: 35,
        y: 35
      },
      downLeftOffset: {
        x: 35,
        y: -35
      },
      upLeftOffset: {
        x: -35,
        y: 35
      },
      augmentPosition: 'left'
    },
    requiredComponents: ['mounted', 'animation', 'glyphicon-renderer'],
    update: function update(dt, entity, component) {
      if (this.target) {
        if (this.augmentPosition === 'left') {
          if (this.target.direction == 'down') {
            this.offset = this.downLeftOffset;
          } else {
            this.offset = this.upLeftOffset;
          }
        } else {
          if (this.target.direction == 'down') {
            this.offset = this.downRightOffset;
          } else {
            this.offset = this.upRightOffset;
          }
        }
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/boss.js":
/*!**************************************!*\
  !*** ./client/js/components/boss.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _engine_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../engine/component */ "./client/js/engine/component.js");
/* harmony import */ var _util_random__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/random */ "./client/js/util/random.js");
/* harmony import */ var _util_random__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_util_random__WEBPACK_IMPORTED_MODULE_1__);
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }


var Boss = _engine_component__WEBPACK_IMPORTED_MODULE_0__["default"].build('boss', {
  requiredComponents: ['position', 'health'],
  defaultData: {
    name: 'The Wellspring Guardian',
    phase: 1,
    maxPhases: 3,
    waterLevel: 100,
    powerLevel: 100,
    rotationSpeed: 0.5,
    currentRotation: 0,
    weightHit: false,
    components: {
      fan: {
        health: 100,
        active: true,
        rotationOffset: 0,
        effect: 'speed'
      },
      battery: {
        health: 100,
        active: true,
        rotationOffset: 90,
        effect: 'power'
      },
      bladder: {
        health: 100,
        active: true,
        rotationOffset: 180,
        effect: 'defense'
      },
      alternator: {
        health: 100,
        active: true,
        rotationOffset: 270,
        effect: 'regen'
      },
      fuse: {
        health: 100,
        active: true,
        rotationOffset: 45,
        effect: 'fuse'
      }
    },
    vulnerableAngle: 45,
    lastRotationUpdate: 0,
    defeatedComponents: new Set(),
    isDefeated: false
  },
  onAdd: function onAdd(entity) {
    if (!entity.hasData('boss')) {
      entity.setData('boss', this.defaultData);
    }
    var boss = entity.getData('boss');
    boss.lastRotationUpdate = Date.now();
  },
  messages: {
    'update': function update(entity, data) {
      var _this = this;
      var boss = entity.getData('boss');
      if (boss.isDefeated) return;
      var now = Date.now();
      var deltaTime = (now - boss.lastRotationUpdate) / 1000;
      boss.lastRotationUpdate = now;
      var speedModifier = boss.defeatedComponents.has('fan') ? 1.5 : 1;
      boss.currentRotation = (boss.currentRotation + boss.rotationSpeed * speedModifier * deltaTime * 360) % 360;
      Object.entries(boss.components).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          component = _ref2[1];
        var componentAngle = (component.rotationOffset + boss.currentRotation) % 360;
        var wasVulnerable = component.isVulnerable;
        var isVulnerable = _this.calculateVulnerability(boss, key, componentAngle);
        component.isVulnerable = isVulnerable;
        if (component.isVulnerable && !wasVulnerable) {
          entity.sendMessage('component-vulnerable', {
            component: key,
            angle: componentAngle,
            reason: _this.getVulnerabilityReason(boss, key)
          });
        }
      });
      this.updatePhase(entity);
    },
    'damage': function damage(entity, data) {
      var boss = entity.getData('boss');
      if (boss.isDefeated) return;
      var component = boss.components[data.target];
      if (component !== null && component !== void 0 && component.active && component.isVulnerable) {
        var damageReduction = boss.defeatedComponents.has('bladder') ? 1 : 0.75;
        var actualDamage = data.amount * damageReduction;
        component.health = Math.max(0, component.health - actualDamage);
        entity.sendMessage('component-damaged', {
          component: data.target,
          damage: actualDamage,
          originalDamage: data.amount
        });
        if (component.health <= 0) {
          component.active = false;
          boss.defeatedComponents.add(data.target);
          entity.sendMessage('component-destroyed', {
            component: data.target,
            effect: component.effect
          });
          this.applyComponentDestructionEffects(boss, data.target);

          // Check if fuse should blow
          if (data.target === 'fuse' || this.shouldBlowFuse(boss)) {
            this.blowFuse(entity, boss);
          }
        }
      }
    },
    'update-phase': function updatePhase(entity, data) {
      var boss = entity.getData('boss');
      if (boss.phase < boss.maxPhases) {
        boss.phase++;
        Object.entries(boss.components).forEach(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            component = _ref4[1];
          if (!component.active) {
            component.active = true;
            component.health = 100 * boss.phase;
            boss.defeatedComponents["delete"](key);
          }
        });
        this.adjustPhaseMechanics(boss);
        entity.sendMessage('phase-changed', {
          phase: boss.phase,
          components: boss.components,
          defeatedComponents: Array.from(boss.defeatedComponents)
        });
      }
    },
    'weight-hit': function weightHit(entity, data) {
      var boss = entity.getData('boss');
      if (boss.isDefeated) return;

      // Only increase power if weight is moving downward
      if (data.direction === 'down') {
        boss.powerLevel = Math.min(200, boss.powerLevel + 25);
        boss.weightHit = true;
        entity.sendMessage('power-increased', {
          amount: 25,
          newLevel: boss.powerLevel
        });

        // Check if this hit should trigger fuse
        if (this.shouldBlowFuse(boss)) {
          this.blowFuse(entity, boss);
        }
      }
    }
  },
  calculateVulnerability: function calculateVulnerability(boss, componentKey, angle) {
    var baseVulnerability = Math.abs(angle - 180) <= boss.vulnerableAngle;
    var vulnerabilityModifiers = {
      fan: ['alternator'],
      battery: ['alternator'],
      bladder: ['fan'],
      alternator: ['battery'],
      fuse: ['battery', 'alternator']
    };
    var supportingComponents = vulnerabilityModifiers[componentKey] || [];
    var missingSupport = supportingComponents.some(function (support) {
      return boss.defeatedComponents.has(support);
    });
    return baseVulnerability || missingSupport;
  },
  getVulnerabilityReason: function getVulnerabilityReason(boss, componentKey) {
    var vulnerabilityModifiers = {
      fan: ['alternator'],
      battery: ['alternator'],
      bladder: ['fan'],
      alternator: ['battery'],
      fuse: ['battery', 'alternator']
    };
    var supportingComponents = vulnerabilityModifiers[componentKey] || [];
    var missingSupport = supportingComponents.find(function (support) {
      return boss.defeatedComponents.has(support);
    });
    return missingSupport ? "Vulnerable due to missing ".concat(missingSupport) : 'Vulnerable due to position';
  },
  applyComponentDestructionEffects: function applyComponentDestructionEffects(boss, componentKey) {
    var effects = {
      fan: function fan() {
        boss.rotationSpeed *= 1.5;
      },
      battery: function battery() {
        boss.powerLevel *= 1.5;
      },
      bladder: function bladder() {
        boss.waterLevel *= 0.75;
      },
      alternator: function alternator() {
        boss.rotationSpeed *= 0.75;
        boss.powerLevel *= 0.75;
      },
      fuse: function fuse() {
        // Fuse destruction handled separately
      }
    };
    if (effects[componentKey]) {
      effects[componentKey]();
    }
  },
  adjustPhaseMechanics: function adjustPhaseMechanics(boss) {
    switch (boss.phase) {
      case 2:
        boss.rotationSpeed *= 1.5;
        boss.vulnerableAngle = 30;
        break;
      case 3:
        boss.rotationSpeed *= 1.5;
        boss.vulnerableAngle = 20;
        Object.values(boss.components).forEach(function (component) {
          component.rotationOffset = Math.random() * 360;
        });
        break;
    }
  },
  shouldBlowFuse: function shouldBlowFuse(boss) {
    // Fuse blows when power level exceeds storage capacity
    var activeComponents = Object.values(boss.components).filter(function (c) {
      return c.active;
    }).length;
    var powerOverload = boss.powerLevel > 100 * activeComponents;
    return powerOverload && !boss.defeatedComponents.has('fuse');
  },
  blowFuse: function blowFuse(entity, boss) {
    boss.isDefeated = true;

    // Create burst particles
    var numParticles = 8;
    var baseAngle = 270; // Start at 270 degrees
    var angleRange = 135; // Spread to 45 degrees (270 - 135 = 135)
    var _loop = function _loop() {
      var angle = baseAngle - angleRange * (i / (numParticles - 1));
      var particle = entity.engine.createEntity({
        tags: ['fuse-particle']
      });
      particle.addComponent('position', {
        x: 0,
        y: 0
      });
      particle.addComponent('renderer', {
        "char": '💡',
        color: '#ffff00'
      });

      // Set burst angle for animation
      particle.$el.style.setProperty('--burst-angle', "".concat(angle, "deg"));
      particle.$el.addClass('lightbulb-burst');

      // Remove particle after animation
      setTimeout(function () {
        particle.destroy();
      }, 500);
    };
    for (var i = 0; i < numParticles; i++) {
      _loop();
    }
    entity.sendMessage('boss-defeated', {
      components: boss.components,
      defeatedComponents: Array.from(boss.defeatedComponents)
    });
  },
  updatePhase: function updatePhase(entity) {
    var boss = entity.getData('boss');
    var allComponentsDestroyed = Object.values(boss.components).every(function (c) {
      return !c.active;
    });
    if (allComponentsDestroyed && boss.phase < boss.maxPhases) {
      entity.sendMessage('update-phase');
    }
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Boss);

/***/ }),

/***/ "./client/js/components/center-aligned.js":
/*!************************************************!*\
  !*** ./client/js/components/center-aligned.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
module.exports = function CenterAligned() {
  return {
    _: {
      alignCenter: true,
      xOccupancyOffset: 0,
      xOffsetOverride: 0,
      previousCenterAlignX: 0,
      previousXOccupancyOffset: 0
    },
    requiredComponents: ['position'],
    onAdd: function onAdd(entity, component) {
      if (!component.getCenter) {
        component.getCenter = function (data) {
          return data.$document.width() / 2 - data.size.width / 2;
        };
      }
      this.$document = $(document);
      this.position.x = component.getCenter(this);
      if (this.target) this.target.x = component.getCenter(this);
    },
    update: function update(dt, entity, component) {
      if (this.target && this.alignCenter) this.target.x = component.getCenter(this) + (this.xOffsetOverride || this.xOccupancyOffset);
      if (this.alignCenter) this.position.x = component.getCenter(this) + (this.xOffsetOverride || this.xOccupancyOffset);
    },
    aggregateUpdate: function aggregateUpdate(dt, entities, component) {
      //group the entities by their Math.floor(position.y / 10)
      var entitiesBySpan = _.pairs(_.groupBy(entities.getList(), function (entity) {
        return Math.floor(entity.data.position.y / 100);
      }));
      entitiesBySpan.forEach(function (pair) {
        var i = 0;
        var ySpan = pair[0];
        _.sortBy(pair[1], function (entity) {
          return entity.id;
        }).forEach(function (entity) {
          entity.data.xOccupancyOffset = i * 100 - i * 100 / 2;
        });
      });
    }
  };
};

/***/ }),

/***/ "./client/js/components/combat.js":
/*!****************************************!*\
  !*** ./client/js/components/combat.js ***!
  \****************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  return function Combat() {
    return {
      // Minimal stub
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/combatant.js":
/*!*******************************************!*\
  !*** ./client/js/components/combatant.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
var ListMap = __webpack_require__(/*! ../util/listmap */ "./client/js/util/listmap.js");
module.exports = function Combatant() {
  return {
    _: {
      lastAttackTime: null,
      attackCooldown: 1000,
      range: 70,
      side: 'baddies'
    },
    requiredComponents: ['health', 'movement', 'position'],
    onAdd: function onAdd(entity, component) {
      this.tryAttack = function () {
        if (this.lastAttackTime === null || entity.engine.gameTime - this.attackCooldown > this.lastAttackTime) {
          var data = this;
          var targets = _.filter(entity.engine.entities.getList(), function (entity) {
            return entity.isActive && 'side' in entity.data && 'position' in entity.data && 'health' in entity.data && entity.data.health > 0 && entity.data.side !== data.side && Math.abs(entity.data.position.y - data.position.y) < data.range;
          });
          if (targets.length) {
            var metadata = entity.sendMessage('targets-in-range', {
              targets: targets
            });
            if (_.any(metadata.results, function (result) {
              return !!result;
            })) {
              this.lastAttackTime = entity.engine.gameTime;
              return true;
            }
          }
        }
        return false;
      };
    },
    update: function update(dt, entity, component) {
      if (this.health <= 0) {
        //dead men don't attack...
        return;
      }
      this.tryAttack();
    },
    messages: {
      'damage': function damage(entity, data) {
        if (this.health > 0) {
          entity.sendMessage('animate', {
            animation: data.isCritical ? 'take-critical-damage' : 'take-damage'
          });
        }
      },
      'death': function death(entity, data) {
        //drop your loot!
        entity.sendMessage('animate', {
          animation: 'death',
          callback: function callback() {
            entity.shouldRender = false;
            entity.destroy();
          }
        });
      },
      'attack': function attack(entity, data) {
        this.tryAttack();
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/defensive-augment.js":
/*!***************************************************!*\
  !*** ./client/js/components/defensive-augment.js ***!
  \***************************************************/
/***/ ((module) => {

module.exports = function () {
  return {
    _: {
      augmentPosition: 'right',
      icon: 'umbrella'
    },
    requiredComponents: ['augment']
  };
};

/***/ }),

/***/ "./client/js/components/dialogue.js":
/*!******************************************!*\
  !*** ./client/js/components/dialogue.js ***!
  \******************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  return function Dialogue() {
    return {
      // Minimal stub
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/drops-loot.js":
/*!********************************************!*\
  !*** ./client/js/components/drops-loot.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DropsLoot)
/* harmony export */ });
/* harmony import */ var _util_chance__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/chance */ "./client/js/util/chance.js");
/* harmony import */ var _util_chance__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_util_chance__WEBPACK_IMPORTED_MODULE_0__);

var chance = new (_util_chance__WEBPACK_IMPORTED_MODULE_0___default())();
function DropsLoot() {
  return {
    messages: {
      death: function death(entity, data) {
        var d6Roll = chance.d6();
        if (d6Roll == 5) {
          var healthPotion = entity.engine.createEntity({
            tags: ['weapon', 'world-entity']
          });
          healthPotion.addComponent('weapon', {
            position: {
              x: this.position.x,
              y: this.position.y + 100
            },
            icon: 'umbrella',
            pursueTarget: false,
            damage: chance.d6() + 'd' + chance.d10()
          });
        } else if (d6Roll == 6) {
          //todo: More loot, weapons, shields, armor (?)
          var healthPotion = entity.engine.createEntity({
            tags: ['health-potion', 'world-entity']
          });
          healthPotion.addComponent('health-potion', {
            position: {
              x: this.position.x,
              y: this.position.y + 100
            },
            pursueTarget: false
          });
        }
      }
    }
  };
}

/***/ }),

/***/ "./client/js/components/enemy-spawner.js":
/*!***********************************************!*\
  !*** ./client/js/components/enemy-spawner.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
var ListMap = __webpack_require__(/*! ../util/listmap */ "./client/js/util/listmap.js");
var Chance = __webpack_require__(/*! ../util/chance */ "./client/js/util/chance.js");
var chance = new Chance();
module.exports = function () {
  return {
    _: {
      lastSpawnTime: null,
      spawnCooldown: 10000,
      //every 10 seconds,
      enemiesToSpawn: 20,
      spawnPosition: null // set with { x, y } object
    },
    onAdd: function onAdd(entity, component) {
      this.lastSpawnTime = entity.engine.gameTime;
    },
    update: function update(dt, entity, component) {
      if (!this.world || this.enemiesToSpawn <= 0 || (this.lastSpawnTime !== null && entity.engine.gameTime - this.lastSpawnTime) < this.spawnCooldown) {
        return;
      }
      this.lastSpawnTime = entity.engine.gameTime;
      this.enemiesToSpawn--;

      //create the enemy!
      var patrolCenter = _.random($(window).height() / 2, this.world.data.currentLevel.height - $(window).height() / 2);
      var patrolRange = Math.max(_.random(100, this.world.data.size.height / Math.max(4, this.enemiesToSpawn / 4)), 200);
      var patrolTop = patrolCenter - patrolRange / 2;
      var patrolBottom = patrolCenter + patrolRange / 2;
      var position = {
        y: patrolCenter,
        x: 0
      };
      var enemy = entity.engine.createEntity({
        tags: ['enemy', 'vision-candidate']
      });
      if (this.spawnPosition !== null) {
        position = this.spawnPosition;
      }
      enemy.addComponent('enemy', {
        iconColor: '#eee',
        position: position,
        icon: chance.pick(['person', 'skull', 'bug']),
        target: {
          y: 0,
          x: 0
        }
      });
      var healthTarget = entity.engine.createEntity({
        tags: ['enemy-health-display']
      });
      healthTarget.addComponent('health-display', {
        isStaticPosition: false
      });
      healthTarget.addComponent('mounted', {
        offset: {
          x: 50,
          y: 50
        }
      });
      healthTarget.sendMessage('mount', {
        target: enemy
      });
      enemy.data.patrolTopTarget.y = patrolTop;
      enemy.data.patrolBottomTarget.y = patrolBottom;
      enemy.data.position.y = patrolCenter;
      enemy.sendMessage('init');
      console.log('spawned at: ' + enemy.data.position.x + ' ' + enemy.data.position.y);
    },
    messages: {
      init: function init(entity, data) {
        this.world = entity.engine.findEntityByTag('world');
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/enemy.js":
/*!***************************************!*\
  !*** ./client/js/components/enemy.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Chance = __webpack_require__(/*! ../util/chance */ "./client/js/util/chance.js"),
  chance = new Chance();
var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
module.exports = function () {
  return {
    _: {
      icon: 'skull',
      baseMiss: 10,
      side: 'baddies',
      senseDistance: 150,
      patrolTopTarget: {
        x: 0,
        y: 0
      },
      patrolBottomTarget: {
        x: 0,
        y: 0
      },
      size: {
        height: 40,
        width: 40
      },
      patrolTo: 'top',
      isPatrolling: false,
      damage: '1d6',
      playerAttackOffset: 60,
      sineWaveRange: 50,
      sineWaveSpeed: 500,
      onCoffeeBreak: false
    },
    onAdd: function onAdd(entity, component) {
      setTimeout(function () {
        entity.sendMessage('coffee-break');
      }, chance.integer({
        min: 5000,
        max: 10000
      }));
    },
    update: function update(dt, entity, component) {
      if (!this.player) {
        return;
      }
      if (this.onCoffeeBreak) {
        this.sineWaveMovementEnabled = false;
        this.xOffsetOverride = $(document).width() / 5;
        return;
      }
      var wasInRange = Math.abs(this.position.y - this.player.data.position.y) < this.senseDistance;
      var isInRange = Math.abs(this.position.y - this.player.data.position.y) < this.senseDistance;

      // Send music events based on player detection
      if (isInRange && !wasInRange) {
        entity.engine.findEntityByTag('music').sendMessage('enemy-spotted-player');
      } else if (!isInRange && wasInRange) {
        entity.engine.findEntityByTag('music').sendMessage('enemy-lost-player');
      }
      if (isInRange) {
        entity.isPatrolling = false;
        this.target.y = this.player.data.position.y + this.playerAttackOffset;
        this.sineWaveMovementEnabled = false;
      } else {
        //partrol.
        //todo: Implement smoke break
        if (!this.isPatrolling) {
          this.sineWaveMovementEnabled = true;
          this.isPatrolling = true;
          entity.sendMessage('go-to', {
            x: this.patrolTo === 'top' ? this.patrolTopTarget.x : this.patrolBottomTarget.x,
            y: this.patrolTo === 'top' ? this.patrolTopTarget.y : this.patrolBottomTarget.y,
            callback: function callback() {
              if (entity.data.isPatrolling) {
                entity.data.isPatrolling = false;
                if (entity.data.patrolTo === 'bottom') {
                  entity.data.patrolTo = 'top';
                } else {
                  entity.data.patrolTo = 'bottom';
                }
              }
            },
            stopAfterArrival: true
          });
        }
      }
    },
    requiredComponents: ['health', 'movement', 'world-entity', 'combatant', 'glyphicon-renderer', 'sine-wave-movement', 'floating-combat-text', 'animation', 'drops-loot'],
    messages: {
      'init': function init(entity, data) {
        this.player = entity.engine.findEntityByTag('player');
        this.world = entity.engine.findEntityByTag('world');
      },
      'targets-in-range': function targetsInRange(entity, data) {
        if (!data.targets || !data.targets.length) {
          return;
        }
        if (this.onCoffeeBreak || entity.tags.indexOf('boss') > -1) {
          return false;
        }
        entity.sendMessage('animate', {
          animation: 'attack-up'
        });
        var hit = _.random(0, 15 - this.player.data.character.skills / 4);
        if (hit < this.player.data.baseMiss) {
          return true;
        }
        data.targets[0].sendMessage('damage', {
          amount: chance.rpg(this.damage, {
            sum: true
          }),
          hitRoll: hit
        });
        return true;
      },
      'coffee-break': function coffeeBreak(entity, data) {
        if (data.withPlayer) {
          // Enemy smokes - they'll return with player
          entity.data.onBreak = true;
          entity.data.originalPosition = _objectSpread({}, entity.data.position);
          entity.data.originalBehavior = _objectSpread({}, entity.data.behavior);

          // Move to coffee break position
          entity.data.position.x = entity.engine.findEntityByTag('player').data.position.x + 50;
          entity.data.position.y = -100; // Above the player

          // Change appearance to show smoking
          entity.sendMessage('change-icon', {
            icon: 'smoking'
          });
        } else {
          // Enemy doesn't smoke - they stay in place
          entity.data.onBreak = true;
          entity.data.originalPosition = _objectSpread({}, entity.data.position);
          entity.data.originalBehavior = _objectSpread({}, entity.data.behavior);

          // Stop moving
          entity.data.behavior = 'idle';
        }
      },
      'return-from-break': function returnFromBreak(entity, data) {
        if (entity.data.onBreak) {
          entity.data.onBreak = false;
          if (entity.data.willReturn) {
            // Return to original position
            entity.data.position = _objectSpread({}, entity.data.originalPosition);
            entity.data.behavior = _objectSpread({}, entity.data.originalBehavior);

            // Change appearance back
            entity.sendMessage('change-icon', {
              icon: entity.data.originalIcon
            });

            // Attack player with message
            var player = entity.engine.findEntityByTag('player');
            entity.sendMessage('attack', {
              target: player
            });
            entity.sendMessage('say', {
              text: "I can't believe you don't smoke!"
            });
          }
        }
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/floating-combat-text.js":
/*!******************************************************!*\
  !*** ./client/js/components/floating-combat-text.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
module.exports = function () {
  return {
    _: {
      createTextEntity: function createTextEntity(entity, options) {
        var text = entity.engine.createEntity();
        text.addComponent('glyphicon-renderer', {
          icon: options.icon ? options.icon : 'globe',
          position: {
            x: this.position.x,
            y: this.position.y
          }
        });
        text.addComponent('text', {});
        text.data.levelSetsIconColor = false;
        if (!options.iconColor) {
          text.data.$el.css('color', 'green');
        } else {
          text.data.$el.css('color', options.iconColor);
        }
        if (!options.textColor) {
          text.data.$text.css('color', '#eee');
        } else {
          text.data.$text.css('color', options.textColor);
        }
        if (options.html) {
          text.data.$text.html(options.html);
        } else {
          text.data.$text.text(options.text);
        }
        text.addComponent('movement', {
          speed: 100
        });
        text.sendMessage('go-to', {
          x: this.position.x + _.random(-60, 60),
          y: this.position.y + (this.direction === 'up' ? 200 : -200) + _.random(-60, 60),
          callback: function callback() {
            text.destroy();
          }
        });
        setTimeout(function () {
          //in two seconds destroy the entity
          text.destroy();
        }, 3000);
      }
    },
    messages: {
      'damage': function damage(entity, data) {
        this.createTextEntity.call(this, entity, {
          icon: data.isCritical ? 'dice' : 'tint',
          text: data.amount,
          iconColor: 'red'
        });
      },
      'heal': function heal(entity, data) {
        this.createTextEntity.call(this, entity, {
          icon: 'heart',
          text: data.amount,
          iconColor: 'green'
        });
      },
      'roll': function roll(entity, data) {
        this.createTextEntity.call(this, entity, {
          icon: 'dice',
          text: data.roll,
          iconColor: 'red'
        });
      },
      'blocked': function blocked(entity, data) {
        this.createTextEntity.call(this, entity, {
          icon: 'shield',
          text: data.amount,
          iconColor: 'blue'
        });
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/game-manager.js":
/*!**********************************************!*\
  !*** ./client/js/components/game-manager.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
module.exports = function () {
  return {
    _: {
      gameState: 'not-started',
      levels: []
    },
    tags: [],
    messages: {
      init: function init(entity, data) {
        entity.sendMessage('character-selection', {});
      },
      'character-selection': function characterSelection(entity, data) {
        if (this.gameState !== 'not-started') {
          return;
        }
        this.gameState = 'character-selection';
        entity.engine.findEntitiesByTag('hide-at-start').forEach(function (entity) {
          entity.sendMessage('hide');
        });

        //pick your character!
        var characters = ['user', 'woman', 'girl', 'old-man', 'cat', 'dog', 'lamp'];
        characters = _.map(characters, function (character) {
          var _char = {
            name: character,
            icon: character,
            skills: 10,
            //crit chance
            brains: 10,
            //spell cost
            brawn: 10,
            //attack damage
            light: 10,
            //light amount,
            level: 1
          };
          switch (character) {
            case 'cat':
              _char.name = 'April';
              _char.skills += 10;
              _char.brawn -= 5;
              _char.description = 'A ca- aw jesus! I almost stepped on your tail, damnit cat!';
              break;
            case 'dog':
              _char.name = 'Sadie';
              _char.brawn += 10;
              _char.skills -= 5;
              _char.description = 'A dog. Woof woof!';
              break;
            case 'lamp':
              _char.name = 'Ozwald the Incinerator';
              _char.light += 10;
              _char.brains -= 5;
              _char.description = 'A lamp. It\'s bright, but not that bright!';
              break;
            case 'old-man':
              _char.name = 'Frank';
              _char.brawn -= 5;
              _char.brains += 10;
              _char.description = 'A wizened old man. What he\'s lost in muscle tone, he\'s learned in the magical arts.';
              break;
            case 'girl':
              _char.name = 'Cindy';
              _char.skills += 10;
              _char.light -= 5;
              _char.description = 'A little girl. She\'s scrappy but not very well equipped.';
              break;
            case 'user':
              _char.name = 'Joe';
              _char.description = 'A man. Just a regular joe.';
              break;
            case 'woman':
              _char.name = 'Jane';
              _char.description = 'A woman. Plain jane.';
              break;
          }
          return _char;
        });
        var domParser = new DOMParser();
        var parseHtml = function parseHtml(htmlString) {
          return domParser.parseFromString(htmlString, 'text/html').body.firstElementChild;
        };
        var characterTemplate = parseHtml(__webpack_require__(/*! ../templates/characterSelection.hbs */ "./client/js/templates/characterSelection.hbs")({
          characters: characters
        }));
        $('#menu').append(characterTemplate);
        function setCharacterUi(selectedCharacter) {
          //set the active on the character
          $('.character-selection .character-name-input').attr('placeholder', selectedCharacter.name);
          $('.character-selection .character-description').text(selectedCharacter.description);
          $('.character-selection .skills').text(selectedCharacter.skills);
          $('.character-selection .brains').text(selectedCharacter.brains);
          $('.character-selection .brawn').text(selectedCharacter.brawn);
          $('.character-selection .light').text(selectedCharacter.light);
        }
        setCharacterUi(characters[0]);
        this.selectedCharacter = characters[0];
        $('.glyphicons-' + characters[0].icon).addClass('active');
        $('.character-selection .stats-container').show();
        var data = this;
        $('.character-selection .character-portrait').click(function () {
          var $this = $(this);
          $('.character-selection .character-portrait').removeClass('active');
          $this.addClass('active');
          var selectedCharacter = _.find(characters, function (character) {
            return $this.hasClass('glyphicons-' + character.icon);
          });
          if (selectedCharacter) {
            data.selectedCharacter = selectedCharacter;
            setCharacterUi(selectedCharacter);
          }
        });
        $('.character-selection .character-select-button').click(function () {
          var name = $('.character-selection .character-name-input').val();
          if (data.selectedCharacter) {
            if (name) {
              data.selectedCharacter.name = name;
            }
            entity.sendMessage('start', {
              character: data.selectedCharacter
            });
            $('.character-selection').remove();
          }
        });
      },
      //game is started, character selection in data
      start: function start(entity, data) {
        if (this.gameState !== 'character-selection') {
          return;
        }
        this.gameState = 'in-play';
        var selectedCharacter = data.character;
        $('.start-your-adventure').show();
        var $game = $('#game');
        if ($game.length === 0) {
          document.querySelector('#scroll-container').append(new DOMParser().parseFromString('<div id="game"></div>', 'text/html').body.firstElementChild);
        }
        $game = $('#game');
        $game.show();
        var player = entity.engine.findEntityByTag('player');
        player.data.character = selectedCharacter;
        player.isActive = true;
        player.sendMessage('change-icon', {
          icon: selectedCharacter.icon
        });
        entity.engine.findEntitiesByTag('hide-at-start').forEach(function (entity) {
          entity.sendMessage('show');
        });
        var world = entity.engine.findEntityByTag('world');
        world.sendMessage('generate', {
          seed: selectedCharacter.name + +new Date()
        });
        $game.css('height', world.data.levels[0].height + 'px');
        entity.engine.entities.getList().forEach(function (entity) {
          entity.sendMessage('game-start');
        });

        //start the enemy spawner going
        //var enemySpawner = entity.engine.findEntityByTag('enemy-spawner');
        //enemySpawner.sendMessage('start');
      },
      'game-over': function gameOver(entity, data) {
        //todo: handle game over. Show summary of play etc
        $('<div style="position static">Restart</div> ').appendTo($('#game'));
      },
      restart: function restart(entity, data) {
        //cleanup
        entity.engine.game.restart();
        $('.character-selection').remove();
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/game-metrics-display.js":
/*!******************************************************!*\
  !*** ./client/js/components/game-metrics-display.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
module.exports = function () {
  return {
    _: {
      isStaticPosition: true,
      icon: 'clock',
      position: {
        x: 50,
        y: 250
      },
      metricsFunction: null,
      metricsTarget: null,
      metricsTargetTag: ''
    },
    requiredComponents: ['text'],
    onAdd: function onAdd(entity, component) {
      this.position.y = $(window).height() - 50;
      if (this.metricsTargetTag) {
        this.metricsTarget = entity.engine.findEntityByTag(this.metricsTargetTag);
      }
    },
    update: function update(dt, entity, component) {
      if (typeof this.metricsFunction !== 'function') {
        this.$text.text('gameTime ' + (entity.engine.gameTime / 1000).toFixed(4));
        return;
      }
      this.$text.text(this.metricsFunction(entity, dt, this.metricsTarget));
    }
  };
};

/***/ }),

/***/ "./client/js/components/glyphicon-renderer.js":
/*!****************************************************!*\
  !*** ./client/js/components/glyphicon-renderer.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
module.exports = function GlyphiconRenderer() {
  return {
    _: {
      icon: 'user',
      iconColor: '#eee',
      levelSetsIconColor: true,
      htmlTemplateFactory: function htmlTemplateFactory(entity, component) {
        return '<span style="position: ' + (entity.data.isStaticPosition ? 'fixed' : 'absolute') + '; display: block; overflow: visible; color: ' + (entity.data.iconColor || 'black') + '" class="go-faster-hack glyphicons glyphicons-' + entity.data.icon + '" data-entity-id="' + entity.id + '"></span>';
      }
    },
    requiredComponents: ['html-renderer'],
    onAdd: function onAdd(entity, component) {
      if (this.$el) {
        this.$el.remove();
      }
      this.$el = $(this.htmlTemplateFactory(entity, component)).appendTo(this.selector);
    },
    update: function update(dt, entity, component) {
      if (!this.world) {
        this.world = entity.engine.findEntityByTag('world');
      } else {
        if (this.levelSetsIconColor && this.iconColor !== this.world.data.currentLevel.colors.font.toHexString()) {
          entity.sendMessage('set-icon-color', {
            color: this.world.data.currentLevel.colors.accent.toHexString()
          });
        }
      }
    },
    messages: {
      'change-icon': function changeIcon(entity, data) {
        if (!data.icon) {
          throw new Error('Must receive icon to render!');
        }
        if (this.$el) {
          this.$el.removeClass('glyphicons-' + this.icon);
          this.icon = data.icon;
          this.$el.addClass('glyphicons-' + data.icon);
        }
      },
      'set-icon-color': function setIconColor(entity, data) {
        if (data.color) {
          this.$el.css({
            'color': data.color
          });
          this.iconColor = data.color;
        }
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/health-display.js":
/*!************************************************!*\
  !*** ./client/js/components/health-display.js ***!
  \************************************************/
/***/ ((module) => {

module.exports = function () {
  return {
    _: {
      isStaticPosition: true,
      icon: 'heart',
      healthTarget: null,
      position: {
        x: 50,
        y: 100
      },
      rotate: 45,
      destroyOnTargetDestroy: true
    },
    requiredComponents: ['text'],
    onAdd: function onAdd(entity, component) {
      this.healthTarget = this.player = entity.engine.findEntityByTag('player');
    },
    update: function update(dt, entity, component) {
      if (this.destroyOnTargetDestroy && this.healthTarget.isDestroyed()) {
        entity.destroy();
      }
      this.$text.text('Health ' + this.healthTarget.data.health);
    },
    messages: {
      'mount': function mount(entity, data) {
        if (data.target && data.target.data && data.target.data.health) this.healthTarget = data.target;
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/health-potion.js":
/*!***********************************************!*\
  !*** ./client/js/components/health-potion.js ***!
  \***********************************************/
/***/ ((module) => {

module.exports = function () {
  return {
    _: {
      healingAmount: 30,
      icon: 'lab',
      useRange: 100
    },
    requiredComponents: ['glyphicon-renderer', 'center-aligned', 'world-entity'],
    // requiredComponents: {
    //     'glyphicon-renderer': {
    //         icon: 'lab',
    //     },
    //     'center-aligned': { }
    // },
    onAdd: function onAdd(entity, component) {
      this.player = entity.engine.findEntityByTag('player');
    },
    update: function update(dt, entity, component) {
      if (Math.abs(this.player.data.position.y - this.position.y) < this.useRange) {
        this.player.sendMessage('heal', {
          amount: this.healingAmount
        });
        entity.sendMessage('hide');
        entity.isActive = false;
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/health.js":
/*!****************************************!*\
  !*** ./client/js/components/health.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _engine_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../engine/component */ "./client/js/engine/component.js");

var Health = _engine_component__WEBPACK_IMPORTED_MODULE_0__["default"].build('health', {
  requiredComponents: ['position'],
  defaultData: {
    health: 100,
    maxHealth: 100,
    lastDamageTime: 0,
    damageCooldown: 500 // ms between damage events
  },
  syncState: true,
  syncProperties: ['health', 'maxHealth'],
  onAdd: function onAdd(entity) {
    // Initialize health if not set
    if (!entity.hasData('health')) {
      entity.setData('health', this.defaultData.health);
    }
    if (!entity.hasData('maxHealth')) {
      entity.setData('maxHealth', this.defaultData.maxHealth);
    }
  },
  messages: {
    'damage': function damage(entity, data) {
      var now = Date.now();
      var lastDamage = entity.getData('lastDamageTime') || 0;

      // Check damage cooldown
      if (now - lastDamage < this.defaultData.damageCooldown) {
        return;
      }
      var currentHealth = entity.getData('health');
      var damage = data.amount || 0;
      var newHealth = Math.max(0, currentHealth - damage);
      entity.setData('health', newHealth);
      entity.setData('lastDamageTime', now);

      // Send damage event to components
      entity.sendMessage('damage-taken', {
        amount: damage,
        newHealth: newHealth
      });

      // Check for death
      if (newHealth <= 0) {
        entity.sendMessage('death');
      }
    },
    'heal': function heal(entity, data) {
      var currentHealth = entity.getData('health');
      var maxHealth = entity.getData('maxHealth');
      var healAmount = data.amount || 0;
      var newHealth = Math.min(maxHealth, currentHealth + healAmount);
      entity.setData('health', newHealth);

      // Send heal event to components
      entity.sendMessage('healed', {
        amount: healAmount,
        newHealth: newHealth
      });
    }
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Health);

/***/ }),

/***/ "./client/js/components/hide-on-pause.js":
/*!***********************************************!*\
  !*** ./client/js/components/hide-on-pause.js ***!
  \***********************************************/
/***/ ((module) => {

module.exports = function () {
  return {
    messages: {
      'game-pause': function gamePause(entity, data) {
        entity.sendMessage('hide');
      },
      'game-resume': function gameResume(entity, data) {
        entity.sendMessage('show');
      },
      'game-start': function gameStart(entity, data) {
        if (!entity.engine.isPlaying) {
          entity.sendMessage('hide');
        }
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/html-renderer.js":
/*!***********************************************!*\
  !*** ./client/js/components/html-renderer.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ HtmlRenderer)
/* harmony export */ });
/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
function applyCss() {
  if (this.size.height != null && this.size.width != null) {
    $(this.$el).css({
      'font-size': this.size.height != null && this.size.width != null ? (this.size.height + this.size.width) / 2 + 'px' : this.$el.css('font-size'),
      width: this.size.width === null ? this.$el.css('width') : this.size.width,
      height: this.size.height === null ? this.$el.css('height') : this.size.height
    });
  }
  $(this.$el).css('z-index', this['z-index']);
  if (!this.positionAnchor || this.positionAnchor === 'top-left') {
    $(this.$el).css({
      bottom: 'initial',
      right: 'initial',
      left: this.position.x - this.size.width / 2,
      top: this.position.y - this.size.height / 2
    });
  } else if (this.positionAnchor === 'top-right') {
    $(this.$el).css({
      bottom: 'initial',
      left: 'initial',
      right: this.position.x - this.size.width / 2,
      top: this.position.y - this.size.height / 2
    });
  } else if (this.positionAnchor === 'bottom-left') {
    $(this.$el).css({
      top: 'initial',
      right: 'initial',
      left: this.position.x - this.size.width / 2,
      bottom: this.position.y - this.size.height / 2
    });
  } else if (this.positionAnchor === 'bottom-right') {
    $(this.$el).css({
      top: 'initial',
      left: 'initial',
      right: this.position.x + this.size.width / 2,
      bottom: this.position.y + this.size.height / 2
    });
  }
}
function HtmlRenderer() {
  return {
    _: {
      htmlTemplateFactory: function htmlTemplateFactory(entity, component) {
        return '<span style="position: ' + (entity.data.isStaticPosition ? 'fixed' : 'absolute') + '; display: block; overflow: visible; color: ' + (entity.data.iconColor || 'black') + ' z-index:' + entity.data['z-index'] + ';" class="go-faster-hack glyphicons" data-entity-id="' + entity.id + '"></span>';
      },
      selector: '#game',
      'z-index': 0,
      renderBuffer: {
        position: {
          x: 0,
          y: 0
        },
        rotation: 0,
        width: 0,
        height: 0,
        shouldRender: false
      },
      levelSetsColor: true,
      positionAnchor: 'top-left' //'top-right', 'bottom-left', 'bottom-right'
    },
    requiredComponents: ['position'],
    onAdd: function onAdd(entity, component) {
      try {
        this.$el = $(this.selector).append(new DOMParser().parseFromString(this.htmlTemplateFactory(entity, component), 'text/html').body.firstElementChild);
      } catch (e) {
        debugger;
      }
      applyCss.call(this);
      if (!entity.shouldRender) {
        this.$el.hide();
      }
    },
    update: function update(dt, entity, component) {
      if (this.renderBuffer.shouldRender != entity.shouldRender) {
        if (entity.shouldRender && !this.renderBuffer.shouldRender && this.$el) {
          this.$el.show();
        } else if (!entity.shouldRender && this.renderBuffer.shouldRender && this.$el) {
          this.$el.hide();
        }
      }
      this.renderBuffer.shouldRender = entity.shouldRender;
    },
    render: function render(dt, entity, component) {
      //todo: Use the current scroll of the screen as the 'active rectangle' to choose what to render.
      if (this.renderBuffer.position.x == this.position.x && this.renderBuffer.position.y == this.position.y && this.renderBuffer.width == this.size.width && this.renderBuffer.height == this.size.height) {
        return;
      }
      if (entity.shouldRender) {
        applyCss.call(this);
      }
      this.renderBuffer.position.x = this.position.x;
      this.renderBuffer.position.y = this.position.y;
      this.renderBuffer.width = this.size.width;
      this.renderBuffer.height = this.size.height;
      this.renderBuffer.shouldRender = entity.shouldRender;
    },
    onRemove: function onRemove(entity, component) {
      if (this.$el) {
        this.$el.hide();
        this.$el.remove();
      }
    },
    messages: {
      show: function show(entity, data) {
        if (entity.data.$el) {
          entity.data.$el.show(80);
        }
        entity.shouldRender = true;
      },
      hide: function hide(entity, data) {
        if (entity.data.$el) {
          entity.data.$el.hide(80);
        }
        entity.shouldRender = false;
      },
      'set-position-type': function setPositionType(entity, data) {
        if (data.isStaticPosition) {
          this.isStaticPosition = true;
          this.$el.css('position', 'fixed');
        } else {
          this.$el.css('position', 'absolute');
          this.isStaticPosition = false;
        }
      }
    }
  };
}

/***/ }),

/***/ "./client/js/components/input.js":
/*!***************************************!*\
  !*** ./client/js/components/input.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Input)
/* harmony export */ });
function Input() {
  return {
    // Minimal stub
  };
}

/***/ }),

/***/ "./client/js/components/inventory.js":
/*!*******************************************!*\
  !*** ./client/js/components/inventory.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Inventory)
/* harmony export */ });
function Inventory() {
  return {
    // Minimal stub
  };
}

/***/ }),

/***/ "./client/js/components/keyboard-events.js":
/*!*************************************************!*\
  !*** ./client/js/components/keyboard-events.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
module.exports = function () {
  return {
    onAdd: function onAdd(entity, component) {
      if (!component.events) {
        component.events = true;
        $(document).keydown(function (e) {
          if (component.engine.isPlaying) {
            component.entities.getList().forEach(function (entity) {
              entity.sendMessage('keydown', {
                which: e.which
              });
            });
          }
        });
        $(document).keyup(function (e) {
          if (component.engine.isPlaying) {
            component.entities.getList().forEach(function (entity) {
              entity.sendMessage('keyup', {
                which: e.which
              });
            });
          }
        });
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/level-door.js":
/*!********************************************!*\
  !*** ./client/js/components/level-door.js ***!
  \********************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var V2 = __webpack_require__(/*! ../util/V2 */ "./client/js/util/V2.js"),
    ImmutableV2 = V2.ImmutableV2,
    V2 = V2.V2;
  return function LevelDoor() {
    return {
      _: {
        icon: 'exit',
        senseTag: 'player',
        position: {
          x: 0,
          y: 7300
        },
        senseRange: 50,
        leads: 'down'
      },
      requiredComponents: ['center-aligned', 'glyphicon-renderer', 'world-entity', 'sensor'],
      messages: {
        sensed: function sensed(entity, data) {
          if (this.leads == 'down') entity.engine.findEntityByTag('world').sendMessage('go-down');else if (this.leads == 'up') entity.engine.findEntityByTag('world').sendMessage('go-up');
        }
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/minimap.js":
/*!*****************************************!*\
  !*** ./client/js/components/minimap.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  return function Minimap() {
    return {
      _: {
        isStaticPosition: true,
        'z-index': 1000000
      },
      requiredComponents: ['glyphicon-renderer'],
      onAdd: function onAdd(entity, component) {
        this.$el.click(function () {
          if (!!entity.data.player) {
            entity.data.player.sendMessage('set-scroll-to-position');
          }
        });
        this.$el.css('cursor', 'pointer');
      },
      update: function update(dt, entity, component) {
        if (!this.world) {
          this.world = entity.engine.findEntityByTag('world');
        } else if (!this.player) {
          this.player = entity.engine.findEntityByTag('player');
          entity.sendMessage('change-icon', {
            icon: this.player.data.icon
          });
        } else {
          this.position.y = this.player.data.position.y / this.world.data.currentLevel.maxHeight * $(window).height();
          this.position.x = $(window).width() - 50;
        }
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/mounted.js":
/*!*****************************************!*\
  !*** ./client/js/components/mounted.js ***!
  \*****************************************/
/***/ ((module) => {

module.exports = function () {
  return {
    _: {
      mountId: null,
      mountTag: '',
      offset: {
        x: null,
        y: null
      },
      mountTarget: null
    },
    onAdd: function onAdd(entity, component) {
      if (!component.tryMount) {
        component.tryMount = function (data, entity, mountTarget, mountId, mountTag) {
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
        };
      }
      entity.sendMessage('mount', {
        target: this.mountTarget,
        mountId: this.mountId,
        mountTag: this.mountTag
      });
    },
    update: function update(dt, entity, component) {
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
      mount: function mount(entity, data, component) {
        component.tryMount(this, entity, data.target, data.mountId, data.mountTag);
      },
      dismount: function dismount(entity, data, component) {
        this.mountTarget = null;
        this.mountTag = null;
        this.mountId = null;
      },
      'level-change': function levelChange(entity, data, component) {
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
};

/***/ }),

/***/ "./client/js/components/movement.js":
/*!******************************************!*\
  !*** ./client/js/components/movement.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var V2 = __webpack_require__(/*! ../util/V2 */ "./client/js/util/V2.js");
var ImmutableV2 = V2.ImmutableV2;
V2 = V2.V2;
module.exports = function Movement() {
  return {
    _: {
      target: {
        x: 0,
        y: 0,
        stopAfterArrival: false,
        callbacks: []
      },
      previousPosition: {
        x: 0,
        y: 0
      },
      speed: 100,
      isMoving: false,
      pursueTarget: true,
      ignoreXForTarget: true,
      direction: 'down',
      isMobile: true
    },
    onAdd: function onAdd(entity, component) {
      if (!this.target.callbacks) this.target.callbacks = [];
    },
    update: function update(dt, entity, component) {
      this.previousPosition.x = this.position.x;
      this.previousPosition.y = this.position.y;
      if (!this.pursueTarget) {
        return;
      }
      if (!this.isMobile) {
        return;
      }

      // A -> B :: B - A

      //if our move would put us passed our target, then we're there
      //so if (target - position) · (move) < 0 we're there.
      var _x = this.target.x - this.position.x,
        _y = this.target.y - this.position.y,
        toTarget = new V2(_x, _y),
        length = toTarget.length(),
        move = toTarget.normalize().multiply(this.speed * (dt / 1000)),
        //todo: put in lerp for movement when close to soften things up
        target = new V2(this.target.x, this.target.y),
        position = new V2(this.position.x, this.position.y),
        reachedTarget = target.sub(position).dot(move) <= 0; // || toTarget <= move.length();

      //or you know, if you're really close.
      if (reachedTarget || length < 3) {
        this.position.x = this.target.x;
        this.position.y = this.target.y;
        this.isMoving = false;
        if (this.target.stopAfterArrival) {
          this.pursueTarget = false;
        }
        while (this.target.callbacks && this.target.callbacks.length) {
          this.target.callbacks.pop()();
        }
        reachedTarget = true;
      }
      if (!reachedTarget) {
        if (!this.centerAlign) this.position.x += move.X;
        this.position.y += move.Y;
        this.rotation = move.toDegrees();
      }
      if (!reachedTarget) {
        this.direction = this.position.y > this.target.y ? 'down' : 'up';
      }
      var wasMoving = this.isMoving;
      this.isMoving = !(this.position.x == this.previousPosition.x && this.position.y == this.previousPosition.y);
      if (reachedTarget || !this.isMoving && wasMoving) {
        entity.sendMessage('stop-animating', {
          animation: 'walk'
        });
      }
      if (this.isMoving && !wasMoving) {
        entity.sendMessage('animate', {
          animation: 'walk'
        });
      }
    },
    requiredComponents: ['position'],
    messages: {
      'go-to': function goTo(entity, data) {
        this.pursueTarget = true;
        this.target.x = data.x;
        this.target.y = data.y;
        if ('stopAfterArrive' in data) this.target.stopAfterArrival = data.stopAfterArrive;
        if ('callback' in data) this.target.callbacks.push(data.callback);
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/music.js":
/*!***************************************!*\
  !*** ./client/js/components/music.js ***!
  \***************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;//todo: The music component should look at the current level's foreground, background and accent color and pick clips played in the same key, that are quantized

//primary colors: red, yellow, blue
/***
 * Take each group of loops and map it to a section of the color wheel.
 * 
 * If the color chosen falls into that, play a random clip from that section.
 * 
 */

!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var mori = __webpack_require__(/*! mori */ "mori"),
    buzz = __webpack_require__(/*! ../util/buzz */ "./client/js/util/buzz.js"),
    sound = buzz.sound,
    tinyColor = __webpack_require__(/*! ../util/tinycolor */ "./client/js/util/tinycolor.js"),
    _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js"),
    conversions = __webpack_require__(/*! ../util/colorconversions */ "./client/js/util/colorconversions.js");
  return function () {
    var BPM = 83,
      quantizedBeats = 8,
      msPerQuantization = quantizedBeats / BPM * (60 * 1000);
    return {
      _: {
        baseDir: '/audio/',
        formats: ['m4a', 'ogg', 'mp3', 'wav'],
        tracks: {
          unsorted: mori.vector('DRUMS 1', 'DRUMS 2', 'DRUMS 3', 'DRUMS 4', 'DRUMS 5', 'DRUMS 6', 'HARMONY1', 'HARMONY2', 'HARMONY3', 'HARMONY4', 'HARMONY5', 'HARMONY6', 'MELODY1', 'MELODY2', 'MELODY3', 'MELODY4', 'MELODY5', 'MELODY6'),
          colors: mori.vector('blue', 'purple', 'red', 'orange', 'yellow', 'green'),
          drums: mori.hashMap('blue', 'OUTRO_DRUMS 2', 'red', 'OUTRO_DRUMS 3', 'yellow', 'OUTRO_DRUMS'),
          byColor: null
        },
        timeSinceLastQuantization: 0,
        tracksToPlay: mori.vector(),
        tracksToStop: mori.vector(),
        volume: 50,
        volumeRamps: mori.hashMap('background', mori.hashMap('target', 50, 'current', 50, 'speed', 0.5), 'font', mori.hashMap('target', 50, 'current', 50, 'speed', 0.5), 'accent', mori.hashMap('target', 50, 'current', 50, 'speed', 0.5)),
        defaultVolume: 50,
        maxVolume: 100,
        minVolume: 20
      },
      tags: ['level-change-subscriber'],
      onAdd: function onAdd(entity, component) {
        // Group tracks by type
        var byGroup = mori.group_by(function (track) {
          return track.replace(/\d/ig, '').trim();
        }, this.tracks.unsorted);

        // Convert groups to vector of maps
        this.tracks.groups = mori.map(function (group) {
          return mori.hash_map('name', mori.first(group), 'tracks', mori.second(group));
        }, mori.seq(byGroup));

        // Initialize color groups
        this.tracks.byColor = mori.reduce(function (acc, color) {
          return mori.assoc(acc, color, mori.vector());
        }, mori.hash_map(), this.tracks.colors);

        // Distribute tracks across colors
        var groupsToPop = mori.map(function (group) {
          return mori.hash_map('name', mori.get(group, 'name'), 'tracks', mori.into(mori.vector(), mori.get(group, 'tracks')));
        }, this.tracks.groups);
        while (mori.some(function (group) {
          return mori.count(mori.get(group, 'tracks')) > 0;
        }, groupsToPop)) {
          mori.each(this.tracks.colors, function (color) {
            mori.each(groupsToPop, function (group) {
              var tracks = mori.get(group, 'tracks');
              if (mori.count(tracks) > 0) {
                var track = mori.first(tracks);
                this.tracks.byColor = mori.update_in(this.tracks.byColor, [color], function (tracks) {
                  return mori.conj(tracks, track);
                });
                mori.assoc(group, 'tracks', mori.rest(tracks));
              }
            });
          });
        }
      },
      update: function update(dt, entity, component) {
        this.timeSinceLastQuantization += dt;

        // Update volume ramps
        this.volumeRamps = mori.reduce(function (acc, pair) {
          var track = mori.first(pair);
          var ramp = mori.second(pair);
          var diff = mori.get(ramp, 'target') - mori.get(ramp, 'current');
          if (Math.abs(diff) > 0.1) {
            var newCurrent = mori.get(ramp, 'current') + diff * (dt / 1000) * mori.get(ramp, 'speed');
            ramp = mori.assoc(ramp, 'current', newCurrent);

            // Apply volume to track
            if (this.loadedTracks && mori.has_key(this.loadedTracks, track)) {
              mori.get(this.loadedTracks, track).setVolume(newCurrent);
            }
          }
          return mori.assoc(acc, track, ramp);
        }, this.volumeRamps, mori.seq(this.volumeRamps));
        if (this.timeSinceLastQuantization > msPerQuantization) {
          this.timeSinceLastQuantization -= msPerQuantization;

          // Stop tracks
          mori.each(this.tracksToStop, function (track) {
            if (this.loadedTracks && mori.has_key(this.loadedTracks, track)) {
              mori.get(this.loadedTracks, track).stop();
            }
          });
          this.tracksToStop = mori.vector();

          // Play tracks
          mori.each(this.tracksToPlay, function (track) {
            if (this.loadedTracks && mori.has_key(this.loadedTracks, track)) {
              mori.get(this.loadedTracks, track).play().loop();
            }
          });
          this.tracksToPlay = mori.vector();
        }
      },
      messages: {
        'game-start': function gameStart(entity, data) {
          var world = entity.engine.findEntityByTag('world'),
            levels = world.data.levels;
          this.loadedTracks = this.loadedTracks || mori.hash_map();

          // Pick tracks for each level
          this.levelToTracks = mori.map(function (level) {
            return getTracksForLevel(entity, this, level);
          }, mori.vector.apply(null, levels));

          // Load first level
          loadLevel(mori.first(this.levelToTracks), this.loadedTracks, this.baseDir, this.formats).then(function () {
            playLevel(mori.first(this.levelToTracks), this.tracksToPlay);
          }.bind(this));

          // Preload next levels
          setTimeout(function () {
            loadLevel(mori.nth(this.levelToTracks, 1), this.loadedTracks, this.baseDir, this.formats);
            loadLevel(mori.nth(this.levelToTracks, 2), this.loadedTracks, this.baseDir, this.formats);
          }.bind(this), 5000);
        },
        'level-change': function levelChange(entity, data) {
          var level = data.level,
            world = entity.engine.findEntityByTag('world');

          // Generate new levels if needed
          if (mori.count(this.levelToTracks) < level) {
            var levels = world.data.levels;
            while (mori.count(this.levelToTracks) < data.level) {
              this.levelToTracks = mori.conj(this.levelToTracks, getTracksForLevel(entity, this, levels[mori.count(this.levelToTracks)]));
            }
          }
          var levelMusic = mori.nth(this.levelToTracks, level - 1);
          if (data.previousLevel) {
            stopLevel(mori.nth(this.levelToTracks, data.previousLevel - 1), this.tracksToStop);
          }
          loadLevel(levelMusic, this.loadedTracks, this.baseDir, this.formats).then(function () {
            if (world.data.level === level) {
              playLevel(levelMusic, this.tracksToPlay);
            }
          }.bind(this));
        },
        'loaded-level': function loadedLevel(entity, data) {
          var self = this,
            level = data.level;
          if (mori.count(this.levelToTracks) < data.level) {
            var levels = entity.engine.findEntityByTag('world').data.levels;
            while (mori.count(this.levelToTracks) < data.level) {
              this.levelToTracks = mori.conj(this.levelToTracks, getTracksForLevel(entity, this, levels[mori.count(this.levelToTracks)]));
            }
          }
          var levelMusic = mori.nth(this.levelToTracks, level - 1);
          loadLevel(levelMusic, this.loadedTracks, this.baseDir, this.formats);
          console.log('loaded music for next level');
        },
        'enemy-spotted-player': function enemySpottedPlayer(entity, data) {
          this.volumeRamps = mori.update_in(this.volumeRamps, ['background'], function (ramp) {
            return mori.assoc(ramp, 'target', this.maxVolume, 'speed', 1.0);
          });
        },
        'enemy-lost-player': function enemyLostPlayer(entity, data) {
          this.volumeRamps = mori.update_in(this.volumeRamps, ['background'], function (ramp) {
            return mori.assoc(ramp, 'target', this.defaultVolume, 'speed', 0.3);
          });
        },
        'trap-nearby': function trapNearby(entity, data) {
          this.volumeRamps = mori.update_in(this.volumeRamps, ['accent'], function (ramp) {
            return mori.assoc(ramp, 'target', this.maxVolume, 'speed', 0.8);
          });
        },
        'trap-disarmed': function trapDisarmed(entity, data) {
          this.volumeRamps = mori.update_in(this.volumeRamps, ['accent'], function (ramp) {
            return mori.assoc(ramp, 'target', this.defaultVolume, 'speed', 0.3);
          });
        },
        'set-volume': function setVolume(entity, data) {
          if (!data.volume) {
            throw new Error('volume required');
          }
          this.defaultVolume = data.volume;
          this.volumeRamps = mori.reduce(function (acc, pair) {
            var track = mori.first(pair);
            var ramp = mori.second(pair);
            return mori.assoc(acc, track, mori.assoc(ramp, 'target', data.volume));
          }, this.volumeRamps, mori.seq(this.volumeRamps));
        }
      }
    };
  };
  function loadLevel(levelMusic, loadedTracks, baseDir, formats) {
    var tracksToPlay = mori.vals(levelMusic);
    mori.each(tracksToPlay, function (track) {
      if (!mori.has_key(loadedTracks, track)) {
        loadedTracks = mori.assoc(loadedTracks, track, new sound(baseDir + track, {
          formats: formats
        }));
        mori.get(loadedTracks, track).load();
      }
    });
    return Promise.all(mori.map(function (track) {
      return new Promise(function (resolve, reject) {
        var sound = mori.get(loadedTracks, track);
        if (sound.getStateCode() === 4) {
          resolve(sound);
        }
        sound.bind('canplay', function () {
          resolve(sound);
        });
        sound.bind('error', function (e) {
          reject(e);
        });
      });
    }, tracksToPlay));
  }
  function playLevel(levelMusic, tracksToPlay) {
    return mori.conj(mori.conj(mori.conj(tracksToPlay, mori.get(levelMusic, 'background')), mori.get(levelMusic, 'font')), mori.get(levelMusic, 'accent'));
  }
  function stopLevel(levelMusic, tracksToStop) {
    return mori.conj(mori.conj(mori.conj(tracksToStop, mori.get(levelMusic, 'background')), mori.get(levelMusic, 'font')), mori.get(levelMusic, 'accent'));
  }
  function colorDistance(origin, labToTrack) {
    var trackColor = labToTrack[0];
    return Math.sqrt(Math.pow(trackColor[0] - origin[0], 2) + Math.pow(trackColor[1] - origin[1], 2) + Math.pow(trackColor[2] - origin[2], 2));
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
      background = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.background : tinyColor('yellow'))),
      font = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.font : tinyColor('orange'))),
      accent = conversions.rgb2lab(tinyColorToRgbArray(level.number !== 1 ? level.colors.accent : tinyColor('yellow'))),
      previousLevel = level.number > 1 ? world.data.levels[level.number - 2] : null,
      tracksToRemove = previousLevel ? mori.vals(getTracksForLevel(entity, self, world.data.levels[previousLevel.number - 1])) : mori.vector();
    var tracksByColor = mori.filter(function (colorTrack) {
      return mori.every(function (track) {
        return mori.get(colorTrack, 1).indexOf(track) < 0;
      }, tracksToRemove);
    }, mori.mapcat(function (colorToTracks) {
      return mori.map(function (track) {
        return mori.vector(mori.first(colorToTracks), track);
      }, mori.second(colorToTracks));
    }, mori.seq(self.tracks.byColor)));
    var closestBackground = mori.second(mori.first(mori.sort_by(function (track) {
      return colorDistance(background, convertToLab(track));
    }, mori.map(convertToLab, tracksByColor))));
    var strippedBackground = closestBackground.replace(/\d/ig, '').trim();
    tracksByColor = mori.filter(function (colorTrack) {
      return mori.get(colorTrack, 1).indexOf(strippedBackground) < 0;
    }, tracksByColor);
    var closestFont = mori.second(mori.first(mori.sort_by(function (track) {
      return colorDistance(font, convertToLab(track));
    }, mori.map(convertToLab, tracksByColor))));
    var strippedFont = closestFont.replace(/\d/ig, '').trim();
    tracksByColor = mori.filter(function (colorTrack) {
      return mori.get(colorTrack, 1).indexOf(strippedFont) < 0;
    }, tracksByColor);
    var closestAccent = mori.second(mori.first(mori.sort_by(function (track) {
      return colorDistance(accent, convertToLab(track));
    }, mori.map(convertToLab, tracksByColor))));
    return mori.hash_map('background', closestBackground, 'font', closestFont, 'accent', closestAccent);
  }
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/network.js":
/*!*****************************************!*\
  !*** ./client/js/components/network.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Network)
/* harmony export */ });
function Network() {
  return {
    // Minimal stub
  };
}

/***/ }),

/***/ "./client/js/components/offensive-augment.js":
/*!***************************************************!*\
  !*** ./client/js/components/offensive-augment.js ***!
  \***************************************************/
/***/ ((module) => {

module.exports = function () {
  return {
    _: {
      augmentPosition: 'left',
      icon: 'candle'
    },
    requiredComponents: ['augment']
  };
};

/***/ }),

/***/ "./client/js/components/options.js":
/*!*****************************************!*\
  !*** ./client/js/components/options.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
  var buzz = __webpack_require__(/*! ../util/buzz */ "./client/js/util/buzz.js");
  var $ = __webpack_require__(/*! jquery */ "jquery");
  return function Options() {
    return {
      _: {
        size: {
          width: null,
          height: null
        },
        positionAnchor: 'bottom-right',
        levelSetsColor: false,
        'z-index': 10000,
        optionTemplates: {
          slider: {
            init: function init(entity, option, $parent, $el) {
              $($el).change(function () {
                option.set($(this).val());
              });
              return $el;
            },
            set: function set($el, value) {
              $($el).val(value);
            }
          },
          "boolean": {
            init: function init(entity, option, $parent, $el) {
              $($el).change(function () {
                option.set($($el).is(':checked'));
              });
            },
            set: function set($el, value) {
              $($el).val(value);
            }
          },
          textbox: {
            init: function init(entity, option, $parent, $el) {
              $($el).change(function () {
                option.set($(this).val());
              });
              return $el;
            },
            set: function set($el, value) {
              $($el).val(value);
            }
          },
          'textarea': {
            init: function init(entity, option, $parent, $el) {
              $($el).change(function () {
                option.set($(this).val());
              });
              return $el;
            },
            set: function set($el, value) {
              $($el).val(value);
            }
          },
          'number': {
            init: function init(entity, option, $parent, $el) {
              $($el).change(function () {
                option.set($(this).val());
              });
              return $el;
            },
            set: function set($el, value) {
              $($el).val(value);
            }
          },
          text: {
            init: function init(entity, option, $parent, $el) {
              $($el).change(function () {
                option.set($(this).val());
              });
              return $el;
            },
            set: function set($el, value) {
              $($el).val(value);
            }
          }
        },
        options: {
          //if you provide an object, you must provide an function optionsTemplate(option, value, entity, component)
          // setup sensible data-attributes and use find() selectors on $el to setup callbacks
          'dev options': {
            type: 'text',
            get: function get() {
              return 'These options should be disabled upon release... probably.';
            },
            set: function set() {}
          },
          'temp max mode (30s)': {
            type: 'boolean',
            get: function get(entity) {
              return entity.data.tempMaxMode || false;
            },
            set: function set(entity, value) {
              if (value) {
                entity.data.tempMaxMode = true;
                // Store original values
                entity.data.originalValues = {
                  speed: entity.data.options.speed.get(entity),
                  health: entity.data.options.health.get(entity),
                  damage: entity.data.options.damage.get(entity),
                  audio: entity.data.options['audio level'].get(entity)
                };

                // Set to max
                entity.data.options.speed.set(1000);
                entity.data.options.health.set(200);
                entity.data.options.damage.set(999);
                entity.data.options['audio level'].set(100);

                // Reset after 30 seconds
                setTimeout(function () {
                  entity.data.tempMaxMode = false;
                  entity.data.options.speed.set(entity.data.originalValues.speed);
                  entity.data.options.health.set(entity.data.originalValues.health);
                  entity.data.options.damage.set(entity.data.originalValues.damage);
                  entity.data.options['audio level'].set(entity.data.originalValues.audio);
                }, 30000);
              }
            }
          },
          'coffee break': {
            type: 'boolean',
            get: function get(entity) {
              return entity.data.coffeeBreak || false;
            },
            set: function set(entity, value) {
              if (value) {
                entity.data.coffeeBreak = true;
                var player = entity.engine.findEntityByTag('player');
                var enemies = entity.engine.findEntitiesByTag('enemy');
                if (enemies.length > 0) {
                  // Find closest enemy
                  var _closestEnemy = enemies.reduce(function (closest, enemy) {
                    var dist = Math.abs(enemy.data.position.x - player.data.position.x);
                    return !closest || dist < closest.dist ? {
                      enemy: enemy,
                      dist: dist
                    } : closest;
                  }, null).enemy;

                  // 50% chance enemy smokes
                  if (Math.random() < 0.5) {
                    // Enemy smokes - they'll return with player
                    _closestEnemy.data.willReturn = true;
                    _closestEnemy.sendMessage('coffee-break', {
                      withPlayer: true
                    });
                  } else {
                    // Enemy doesn't smoke - they'll stay
                    _closestEnemy.sendMessage('coffee-break', {
                      withPlayer: false
                    });
                  }
                }

                // Reset after 60 seconds
                setTimeout(function () {
                  entity.data.coffeeBreak = false;
                  if (closestEnemy && closestEnemy.data.willReturn) {
                    closestEnemy.sendMessage('return-from-break');
                  }
                }, 60000);
              }
            }
          },
          'max mode': {
            type: 'boolean',
            get: function get(entity) {
              return entity.data.maxMode || false;
            },
            set: function set(entity, value) {
              entity.data.maxMode = value;
              if (value) {
                // Set all values to max
                entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
                entity.data.playerCache.data.speed = 1000;
                entity.data.playerCache.data.health = 200;
                if (entity.data.playerCache.data.weapon) {
                  entity.data.playerCache.data.weapon.data.damage = 999;
                }
                entity.data.buzz.all().setVolume(100);

                // Update UI
                entity.data.options.speed.set(1000);
                entity.data.options.health.set(200);
                entity.data.options.damage.set(999);
                entity.data.options['audio level'].set(100);
              }
            }
          },
          speed: {
            type: 'slider',
            min: 0,
            max: 1000,
            step: 1,
            get: function get(entity) {
              entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
              return entity.data.playerCache.data.speed;
            },
            set: function set(entity, value) {
              entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
              entity.data.playerCache.data.speed = value;
            }
          },
          health: {
            type: 'slider',
            min: 0,
            max: 200,
            step: 1,
            get: function get(entity) {
              entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
              return entity.data.playerCache.data.health;
            },
            set: function set(entity, value) {
              entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
              entity.data.playerCache.data.health = value;
            }
          },
          'damage': {
            type: 'textbox',
            get: function get(entity) {
              entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
              return entity.data.playerCache.data.weapon.data.damage;
            },
            set: function set(entity, value) {
              entity.data.playerCache = entity.data.playerCache || entity.engine.findEntityByTag('player');
              entity.data.playerCache.data.weapon.data.damage = value;
            }
          },
          'game options': {
            type: 'text',
            get: function get() {
              return '';
            },
            set: function set() {}
          },
          'audio level': {
            type: 'slider',
            min: 0,
            max: 100,
            step: 1,
            get: function get(entity) {
              entity.data.musicCache = entity.data.musicCache || entity.engine.findEntityByTag('music');
              return entity.data.musicCache.data.volume;
            },
            set: function set(entity, value) {
              entity.data.buzz.all().setVolume(value);
            }
          }
        },
        isStaticPosition: true,
        htmlTemplateFactory: function htmlTemplateFactory(entity, component) {
          _.pairs(entity.data.options).forEach(function (optPair) {
            optPair[1].name = optPair[0];
          });
          var domParser = new DOMParser();
          var parseHtml = function parseHtml(htmlString) {
            return domParser.parseFromString(htmlString, 'text/html').body.firstElementChild;
          };
          var $options = parseHtml(__webpack_require__(/*! ../templates/options.hbs */ "./client/js/templates/options.hbs")({
            options: entity.data.options
          }));
          _.pairs(entity.data.options).forEach(function (optPair) {
            var self = entity.data,
              name = optPair[0],
              option = optPair[1],
              template = self.optionTemplates[option.type];
            option._name = name;
            var $el = parseHtml(__webpack_require__("./client/js/templates/optionControls sync recursive ^\\.\\/.*\\.hbs$")("./" + option.type + ".hbs")(_.extend({
              value: option.get(entity)
            }, option)));
            var $li = parseHtml('<li></li>');
            $options.querySelector('.options-list').append($li);
            $li.append($el);
            option.$el = template.init(entity, option, $options, $el);
            var userModifier = option.set;
            option.set = function (value) {
              if (userModifier) {
                userModifier(entity, value);
              }
              template.set(option.$el, value);
            };
            option._template = template;
            option._previousValue = undefined;
          });
          return $options;
        }
      },
      onAdd: function onAdd(entity, component) {
        this.buzz = buzz;
        this.updateOptions = _.values(this.options);
      },
      update: function update(dt, entity, component) {
        //each update, iterate through all options and call get 

        this.updateOptions.forEach(function (option) {
          var currentValue = option.get(entity);
          if (currentValue !== option._previousValue) {
            option.set(currentValue);
            option._previousValue = currentValue;
          }
        });
      },
      requiredComponents: ['html-renderer']
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/physics.js":
/*!*****************************************!*\
  !*** ./client/js/components/physics.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  return function Physics() {
    return {
      // Minimal stub
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/player.js":
/*!****************************************!*\
  !*** ./client/js/components/player.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _engine_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../engine/component */ "./client/js/engine/component.js");
/* harmony import */ var _util_random__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/random */ "./client/js/util/random.js");
/* harmony import */ var _util_random__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_util_random__WEBPACK_IMPORTED_MODULE_1__);


var Player = _engine_component__WEBPACK_IMPORTED_MODULE_0__["default"].build('player', {
  requiredComponents: ['position', 'health'],
  defaultData: {
    direction: 'right',
    character: {
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      vitality: 10
    }
  },
  syncState: true,
  syncProperties: ['direction', 'character'],
  onAdd: function onAdd(entity) {
    // Initialize player data if not set
    if (!entity.hasData('direction')) {
      entity.setData('direction', this.defaultData.direction);
    }
    if (!entity.hasData('character')) {
      entity.setData('character', this.defaultData.character);
    }
  },
  messages: {
    'targets-in-range': function targetsInRange(entity, data) {
      var targets = data.targets || [];
      if (targets.length === 0) return;

      // Get target position to determine attack direction
      var target = targets[0];
      var targetPos = target.getData('position');
      var entityPos = entity.getData('position');

      // Set direction based on target position
      var direction = targetPos.x > entityPos.x ? 'right' : 'left';
      entity.setData('direction', direction);

      // Calculate hit chance and damage
      var character = entity.getData('character');
      var hitChance = character.dexterity / 20 + 0.5; // 50% base + dexterity bonus
      var damage = Math.floor(character.strength * (1 + _util_random__WEBPACK_IMPORTED_MODULE_1___default().random(0, 0.5))); // Strength + random bonus

      // Check for critical hit
      var isCritical = _util_random__WEBPACK_IMPORTED_MODULE_1___default().random(0, 1) < character.dexterity / 100;
      var finalDamage = isCritical ? damage * 2 : damage;

      // Send damage to target
      target.sendMessage('damage', {
        amount: finalDamage,
        isCritical: isCritical
      });

      // Send attack message to weapon if present
      var weapon = entity.getComponent('weapon');
      if (weapon) {
        weapon.sendMessage('attack', {
          target: target,
          damage: finalDamage,
          isCritical: isCritical
        });
      }
    },
    'death': function death(entity) {
      // Send game over message to game manager
      entity.sendMessage('game-over');
    }
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Player);

/***/ }),

/***/ "./client/js/components/position.js":
/*!******************************************!*\
  !*** ./client/js/components/position.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Position)
/* harmony export */ });
function Position() {
  return {
    _: {
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
      scale: 1,
      layer: 0
    },
    messages: {
      'move': function move(entity, data) {
        if (data.x !== undefined) entity.data.x = data.x;
        if (data.y !== undefined) entity.data.y = data.y;
        if (data.z !== undefined) entity.data.z = data.z;
        if (data.rotation !== undefined) entity.data.rotation = data.rotation;
        if (data.scale !== undefined) entity.data.scale = data.scale;
        if (data.layer !== undefined) entity.data.layer = data.layer;
      }
    }
  };
}

/***/ }),

/***/ "./client/js/components/quest.js":
/*!***************************************!*\
  !*** ./client/js/components/quest.js ***!
  \***************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  return function Quest() {
    return {
      // Minimal stub
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/renderer.js":
/*!******************************************!*\
  !*** ./client/js/components/renderer.js ***!
  \******************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! ../engine/renderer */ "./client/js/engine/renderer.js")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (Renderer) {
  return function RendererComponent() {
    return {
      _: {
        renderer: null,
        visible: true,
        alpha: 1,
        tint: 0xFFFFFF,
        blendMode: PIXI.BLEND_MODES.NORMAL
      },
      messages: {
        'init': function init(entity) {
          this.renderer = new Renderer(entity);
        },
        'update': function update(entity) {
          if (this.renderer) {
            this.renderer.update(entity);
          }
        },
        'set-visible': function setVisible(entity, data) {
          this.visible = data.visible;
          if (this.renderer) {
            this.renderer.setVisible(this.visible);
          }
        },
        'set-alpha': function setAlpha(entity, data) {
          this.alpha = data.alpha;
          if (this.renderer) {
            this.renderer.setAlpha(this.alpha);
          }
        },
        'set-tint': function setTint(entity, data) {
          this.tint = data.tint;
          if (this.renderer) {
            this.renderer.setTint(this.tint);
          }
        },
        'set-blend-mode': function setBlendMode(entity, data) {
          this.blendMode = data.blendMode;
          if (this.renderer) {
            this.renderer.setBlendMode(this.blendMode);
          }
        }
      }
    };
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/scroll-chaser.js":
/*!***********************************************!*\
  !*** ./client/js/components/scroll-chaser.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
module.exports = function () {
  return {
    onAdd: function onAdd() {
      this.$game = $('#game');
      this.$menu = $('#menu');
      this.$scrollContainer = $('#scroll-container');
      this.$document = $(document);
      this.$window = $(window);
      this.topMargin = this.$window.height() / 2;
      var self = this;
      this.$window.resize(function () {
        //maybe debounce this?
        self.topMargin = self.$window.height() / 2;
      });
    },
    update: function update(dt, entity, component) {
      var top = Math.max(this.$document.scrollTop() - this.$menu.height(), 0) + this.topMargin;
      this.target.y = top;
    },
    requiredComponents: ['movement'],
    messages: {
      'set-scroll-to-position': function setScrollToPosition() {
        this.$document.scrollTop(this.position.y + this.topMargin - $('nav').height());
      }
    }
  };
};

/***/ }),

/***/ "./client/js/components/sensor.js":
/*!****************************************!*\
  !*** ./client/js/components/sensor.js ***!
  \****************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var V2 = __webpack_require__(/*! ../util/V2 */ "./client/js/util/V2.js"),
    ImmutableV2 = V2.ImmutableV2;
  return function Sensor() {
    return {
      _: {
        senseTag: null,
        senseRange: 100
      },
      requiredComponents: ['position'],
      update: function update(dt, entity, component) {
        var currentPosition = ImmutableV2.coalesce(this.position),
          data = this;
        if (this.senseTag) {
          var sensed = entity.engine.findEntitiesByTag(this.senseTag).filter(function (entity) {
            return currentPosition.distanceTo(entity.data.position) < data.senseRange;
          });
          if (sensed.length) {
            entity.sendMessage('sensed', {
              sensed: sensed,
              tag: this.senseTag
            });
          }
        } else {
          var sensed = entity.engine.entities.getList().filter(function (entity) {
            return entity.data.position ? currentPosition.distanceTo(entity.data.position) < data.senseRange : false;
          });
          if (sensed.length) {
            entity.sendMessage('sensed', {
              sensed: sensed,
              tag: this.senseTag
            });
          }
        }
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/shield.js":
/*!****************************************!*\
  !*** ./client/js/components/shield.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Chance = __webpack_require__(/*! ../util/chance */ "./client/js/util/chance.js"),
  chance = new Chance();
module.exports = function () {
  return {
    _: {
      offset: {
        x: 35,
        y: 35
      },
      pursueTarget: false,
      icon: 'shield',
      shields: [{
        name: 'Wooden Shield',
        color: 'brown',
        power: null
      }]
    },
    tags: ['level-change-subscriber'],
    onAdd: function onAdd(entity, component) {
      if (this.mountTarget) this.mountTarget.data.shield = entity;
      if (this.mountTarget.data.damagePredicates) {
        this.mountTarget.data.damagePredicates.push(function (damage) {
          var blockCheck = (entity.data.mountTarget.data.character.brawn + entity.data.mountTarget.data.character.skills) / 2 + chance.rpg('2d6', {
            sum: true
          });
          if (blockCheck > entity.data.mountTarget.data.baseMiss) {
            entity.data.mountTarget.sendMessage('blocked', {
              amount: damage.amount
            });
            entity.sendMessage('animate', {
              animation: 'take-damage'
            });
            return false;
          }
          return true;
        });
      }
    },
    requiredComponents: ['mounted', 'animation', 'glyphicon-renderer']
  };
};

/***/ }),

/***/ "./client/js/components/sine-line.js":
/*!*******************************************!*\
  !*** ./client/js/components/sine-line.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
module.exports = function () {
  return {
    _: {
      sineLineOffset: {
        x: 0,
        y: 200
      },
      isStaticPosition: false
    },
    requiredComponents: ['position'],
    onAdd: function onAdd(entity, component) {
      if (!component.spawned) {
        component.spawned = true;
        for (var i = 0; i < 25; i++) {
          var ent = entity.engine.createEntity({
            tags: ['hide-at-start']
          });
          ent.addComponent('sine-line', {});
          ent.addComponent('glyphicon-renderer', {
            icon: 'clock'
          });
        }
      }
    },
    aggregateUpdate: function aggregateUpdate(dt, entities, component) {
      var i = 1,
        gameTime = component.engine.gameTime,
        halfDocWidth = $(document).width() / 2;
      entities.getList().forEach(function (entity) {
        entity.data.position.x = halfDocWidth + entity.data.sineLineOffset.x + Math.sin(gameTime / 1000 + i) * 50;
        entity.data.position.y = entity.data.sineLineOffset.y + i * 20;
        i++;
      });
    }
  };
};

/***/ }),

/***/ "./client/js/components/sine-wave-movement.js":
/*!****************************************************!*\
  !*** ./client/js/components/sine-wave-movement.js ***!
  \****************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  return function () {
    return {
      _: {
        sineWaveRange: 200,
        //lower is faster
        sineWaveSpeed: 3000,
        sineWaveMovementEnabled: true
      },
      requiredComponents: ['center-aligned'],
      update: function update(dt, entity, component) {
        if (this.sineWaveMovementEnabled) {
          this.xOffsetOverride = Math.sin(entity.engine.gameTime / this.sineWaveSpeed) * this.sineWaveRange;
        } else {
          if (this.xOffsetOverride > 0) this.xOffsetOverride -= 0.1 * dt / 1000;
          if (this.xOffsetOverride < 0) this.xOffsetOverride = 0;
        }
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/spell-container.js":
/*!*************************************************!*\
  !*** ./client/js/components/spell-container.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var $ = __webpack_require__(/*! jquery */ "jquery");
  return function SpellContainer() {
    return {
      requiredComponents: ['html-renderer'],
      _: {
        levelSetsColor: false,
        size: {
          height: null,
          width: null
        },
        positionAnchor: 'bottom-left',
        isStaticPosition: true,
        spells: [],
        'z-index': 800,
        htmlTemplateFactory: function htmlTemplateFactory(entity, component) {
          var domParser = new DOMParser();
          var parseHtml = function parseHtml(htmlString) {
            return domParser.parseFromString(htmlString, 'text/html').body.firstElementChild;
          };
          return parseHtml(__webpack_require__(/*! ../templates/spells.hbs */ "./client/js/templates/spells.hbs")());
        }
      },
      onAdd: function onAdd() {},
      messages: {
        'add-spell': function addSpell(entity, data, component) {
          if (!data.spell) {
            throw new Error('Must have a spell model to add!');
          }
          var $spell = $('<div class="spell glyphicons glyphicons-' + data.spell.icon + '" />').appendTo(this.$el);
          $spell.click(function () {
            var spellEntity = entity.engine.createEntity(),
              player = entity.engine.findEntityByTag('player').data;
            spellEntity.addComponent('spell', {
              icon: data.spell.icon,
              position: {
                x: player.position.x,
                y: player.position.y
              }
            });
            spellEntity.data.model = data.spell;
            $spell.remove();
          });
        }
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/spell.js":
/*!***************************************!*\
  !*** ./client/js/components/spell.js ***!
  \***************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var Spell = __webpack_require__(/*! ../models/spell */ "./client/js/models/spell.js"),
    ListMap = __webpack_require__(/*! ../util/listmap */ "./client/js/util/listmap.js"),
    _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js");
  return function Spell() {
    return {
      _: function _() {
        return {
          model: null,
          sensedSoFar: new ListMap(),
          hitCount: 0,
          maxHitCount: 5,
          senseTag: 'enemy',
          'z-index': 900
        };
      },
      tags: ['spell'],
      requiredComponents: ['movement', 'glyphicon-renderer', 'animation', 'sensor'],
      onAdd: function onAdd(entity, component) {
        this.maxHitCount = _.random(3, 6);
        entity.sendMessage('go-to', {
          x: this.position.x,
          y: this.position.y + 500 + entity.engine.findEntityByTag('player').data.speed * 4,
          callback: function callback() {
            entity.sendMessage('animate', {
              animation: 'explode',
              callback: function callback() {
                entity.destroy();
              }
            });
          }
        });
      },
      update: function update(dt, entity, component) {},
      messages: {
        sensed: function sensed(entity, data) {
          var self = this;
          if (data.sensed) {
            data.sensed.forEach(function (sensed) {
              if (sensed === entity.engine.findEntityByTag('player') || self.sensedSoFar.getList().length >= self.maxHitCount) {
                return;
              }
              if (!self.sensedSoFar.contains(sensed.id)) {
                self.sensedSoFar.add(sensed.id, sensed);
                sensed.sendMessage('damage', {
                  amount: self.model.getDamage() * 3
                });
              }
              if (self.sensedSoFar.getList().length >= self.maxHitCount) {
                entity.sendMessage('animate', {
                  animation: 'explode',
                  callback: function callback() {
                    entity.destroy();
                  }
                });
              }
            });
          }
        },
        attack: function attack(entity, data) {
          entity.sendMessage('go-to', {
            target: data.target,
            callback: function callback() {
              entity.sendMessage('damage', {
                amount: this.model.getDamage()
              });
            }
          });
        }
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/tests.js":
/*!***************************************!*\
  !*** ./client/js/components/tests.js ***!
  \***************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
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
      onAdd: function onAdd(entity, component) {
        this.unitTestResults = _.map(this.unitTests, function (test) {
          return test();
        });
        this.integrationTestResults = _.map(this.integrationTests, function (test) {
          return test();
        });
      },
      update: function update(dt, entity, component) {
        if (this.testResultFrames.length > this.keepFrames) {
          this.testResultFrames.unshift();
        }
        this.testResultFrames.push(_.map(this.continuityTests, function (test) {
          return {
            results: test(),
            gameTime: entity.engine.gameTime
          };
        }));
      },
      messages: {
        'set-keep-frames': function setKeepFrames(entity, data) {
          if ('keepFrames' in data) {
            while (this.testResultFrames.length > data.keepFrames) {
              this.testResultFrames.unshift();
            }
            this.keepFrames = data.keepFrames;
          }
        }
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/text.js":
/*!**************************************!*\
  !*** ./client/js/components/text.js ***!
  \**************************************/
/***/ ((module, exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  return function Text() {
    return {
      _: {
        text: '',
        textColor: '#eee',
        fontSize: '14px',
        fontFamily: 'Arial',
        textAlign: 'center',
        textShadow: 'none'
      },
      requiredComponents: ['html-renderer'],
      onAdd: function onAdd(entity, component) {
        // Create text element
        this.$text = $('<span class="text"></span>').appendTo(this.$el);

        // Apply initial styles
        this.$text.css({
          'color': this.textColor,
          'font-size': this.fontSize,
          'font-family': this.fontFamily,
          'text-align': this.textAlign,
          'text-shadow': this.textShadow,
          'display': 'block',
          'position': 'absolute',
          'width': '100%',
          'height': '100%',
          'line-height': '100%'
        });

        // Set initial text
        this.$text.text(this.text);
      },
      messages: {
        'set-text': function setText(entity, data) {
          if (data.text !== undefined) {
            this.text = data.text;
            this.$text.text(data.text);
          }
          if (data.color) {
            this.textColor = data.color;
            this.$text.css('color', data.color);
          }
          if (data.fontSize) {
            this.fontSize = data.fontSize;
            this.$text.css('font-size', data.fontSize);
          }
          if (data.fontFamily) {
            this.fontFamily = data.fontFamily;
            this.$text.css('font-family', data.fontFamily);
          }
          if (data.textAlign) {
            this.textAlign = data.textAlign;
            this.$text.css('text-align', data.textAlign);
          }
          if (data.textShadow) {
            this.textShadow = data.textShadow;
            this.$text.css('text-shadow', data.textShadow);
          }
        }
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/timed-destroy.js":
/*!***********************************************!*\
  !*** ./client/js/components/timed-destroy.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TimedDestroy)
/* harmony export */ });
function TimedDestroy() {
  return {
    _: {
      destroyTime: 0,
      destroyDelay: 1000,
      // Default 1 second
      destroyOnStart: false
    },
    onAdd: function onAdd(entity, component) {
      if (this.destroyOnStart) {
        this.destroyTime = entity.engine.gameTime + this.destroyDelay;
      }
    },
    update: function update(dt, entity, component) {
      if (this.destroyTime > 0 && entity.engine.gameTime >= this.destroyTime) {
        entity.destroy();
      }
    },
    messages: {
      'start-destroy-timer': function startDestroyTimer(entity, data) {
        if (data.delay) {
          this.destroyDelay = data.delay;
        }
        this.destroyTime = entity.engine.gameTime + this.destroyDelay;
      },
      'cancel-destroy-timer': function cancelDestroyTimer(entity, data) {
        this.destroyTime = 0;
      }
    }
  };
}

/***/ }),

/***/ "./client/js/components/trap.js":
/*!**************************************!*\
  !*** ./client/js/components/trap.js ***!
  \**************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var Chance = __webpack_require__(/*! ../util/chance */ "./client/js/util/chance.js"),
    chance = new Chance();
  return function Trap() {
    return {
      _: {
        icon: 'warning-sign',
        damage: '2d6',
        disarmDifficulty: 15,
        detectionRange: 100,
        isDisarmed: false,
        isDetected: false,
        disarmAttempts: 0,
        maxDisarmAttempts: 3
      },
      requiredComponents: ['position', 'glyphicon-renderer', 'sensor'],
      onAdd: function onAdd(entity, component) {
        // Set up sensor for player detection
        this.senseTag = 'player';
        this.senseRange = this.detectionRange;

        // Initialize trap state
        entity.sendMessage('change-icon', {
          icon: this.icon
        });
        entity.sendMessage('set-icon-color', {
          color: '#ff0000'
        });
      },
      update: function update(dt, entity, component) {
        if (this.isDisarmed) {
          return;
        }

        // Check if player is in range
        if (this.isDetected && !this.isDisarmed) {
          var player = entity.engine.findEntityByTag('player');
          if (player && Math.abs(player.data.position.y - this.position.y) < 50) {
            // Trigger trap
            this.triggerTrap(entity, player);
          }
        }
      },
      messages: {
        'sensed': function sensed(entity, data) {
          if (this.isDisarmed || this.isDetected) {
            return;
          }

          // Check if player is in range
          var player = data.sensed.find(function (e) {
            return e.tags.includes('player');
          });
          if (player) {
            this.isDetected = true;
            entity.sendMessage('animate', {
              animation: 'pulse'
            });

            // Notify music system
            entity.engine.findEntityByTag('music').sendMessage('trap-nearby');
          }
        },
        'disarm': function disarm(entity, data) {
          if (this.isDisarmed || !this.isDetected) {
            return false;
          }
          this.disarmAttempts++;

          // Calculate disarm chance based on player skills
          var player = entity.engine.findEntityByTag('player');
          var disarmRoll = chance.rpg('1d20', {
            sum: true
          }) + (player.data.character.skills || 0);
          if (disarmRoll >= this.disarmDifficulty) {
            // Successfully disarmed
            this.isDisarmed = true;
            entity.sendMessage('animate', {
              animation: 'explode',
              callback: function callback() {
                entity.destroy();
              }
            });

            // Notify music system
            entity.engine.findEntityByTag('music').sendMessage('trap-disarmed');
            return true;
          } else if (this.disarmAttempts >= this.maxDisarmAttempts) {
            // Failed too many times, trigger trap
            this.triggerTrap(entity, player);
          }
          return false;
        }
      },
      triggerTrap: function triggerTrap(entity, player) {
        if (this.isDisarmed) {
          return;
        }
        this.isDisarmed = true;

        // Calculate damage
        var damage = chance.rpg(this.damage, {
          sum: true
        });

        // Apply damage to player
        player.sendMessage('damage', {
          amount: damage,
          isCritical: chance.bool({
            likelihood: 20
          })
        });

        // Visual feedback
        entity.sendMessage('animate', {
          animation: 'explode',
          callback: function callback() {
            entity.destroy();
          }
        });
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/components/vision.js":
/*!****************************************!*\
  !*** ./client/js/components/vision.js ***!
  \****************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js"),
    V2 = __webpack_require__(/*! ../util/V2 */ "./client/js/util/V2.js"),
    ImmutableV2 = V2.ImmutableV2,
    V2 = V2.V2;
  return function Vision() {
    return {
      _: {
        sightRange: 400,
        withinSight: [],
        showVision: true,
        circleColor: null
      },
      onAdd: function onAdd(entity, component) {
        this.world = entity.engine.findEntityByTag('world');
        var world = this.world;
        this.visionCircle = entity.engine.createEntity({
          tags: ['vision-circle']
        }).addComponent('html-renderer', {
          htmlTemplateFactory: function htmlTemplateFactory(entity, component) {
            return '<div style="position:absolute;border:2px dashed ' + entity.engine.findEntityByTag('world').data.currentLevel.colors.accent.toHexString() + '"></div>';
          }
        }).addComponent('mounted', {
          mountTag: 'player',
          offset: {
            x: 0,
            y: 0
          }
        });
        this.visionCircle.sendMessage('init');
        this.visionCircle.data.$el.transition({
          'border-radius': this.sightRange + 'px'
        });
        this.visionCircle.data.size.width = this.sightRange * 2;
        this.visionCircle.data.size.height = this.sightRange * 2;
        this.$el.click(function () {
          entity.data.visionCircle.shouldRender ^= 1;
        });
      },
      update: function update(dt, entity, component) {
        if (this.showVision && this.circleColor != this.world.data.currentLevel.colors.accent.toHexString()) {
          this.circleColor = this.world.data.currentLevel.colors.accent.toHexString();
          this.visionCircle.data.$el.css({
            'border-color': this.circleColor
          });
        }
        this.withinSight = _.filter(entity.engine.findEntitiesByTag('vision-candidate'), function (visionCandidate) {
          var canSee = visionCandidate.isActive && V2.distanceBetween(entity.data.position, visionCandidate.data.position) < entity.data.sightRange;
          if (canSee) {
            visionCandidate.sendMessage('show');
          } else {
            visionCandidate.sendMessage('hide');
          }
          return canSee;
        });
      }
    };
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/engine/component.js":
/*!***************************************!*\
  !*** ./client/js/engine/component.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_listmap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/listmap */ "./client/js/util/listmap.js");
/* harmony import */ var mori__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mori */ "mori");
/* harmony import */ var mori__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mori__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


var Component = /*#__PURE__*/function () {
  function Component() {
    _classCallCheck(this, Component);
    this.data = {};
    this.entity = null;
    this.messages = {};
  }
  return _createClass(Component, [{
    key: "handleMessageProxy",
    value: function handleMessageProxy(name, callback) {
      if (!this.messageHandlers) {
        this.messageHandlers = (mori__WEBPACK_IMPORTED_MODULE_1___default()) ? mori__WEBPACK_IMPORTED_MODULE_1___default().hashMap() : {};
      }
      if ((mori__WEBPACK_IMPORTED_MODULE_1___default()) && mori__WEBPACK_IMPORTED_MODULE_1___default().hashMap.isPrototypeOf(this.messageHandlers)) {
        this.messageHandlers = mori__WEBPACK_IMPORTED_MODULE_1___default().assoc(this.messageHandlers, name, callback.bind(this));
      } else {
        this.messageHandlers[name] = callback.bind(this);
      }
    }
  }, {
    key: "update",
    value: function update(callback) {
      this._update = callback;
    }
  }, {
    key: "onAdd",
    value: function onAdd(callback) {
      this._onAdd = callback;
    }
  }, {
    key: "onRemove",
    value: function onRemove(callback) {
      this._onRemove = callback;
    }
  }, {
    key: "render",
    value: function render(callback) {
      this._render = callback;
    }
  }, {
    key: "aggregateUpdate",
    value: function aggregateUpdate(callback) {
      this._aggregateUpdate = callback;
    }
  }, {
    key: "getState",
    value: function getState(entity) {
      if (!this.syncState) return {};
      var state = {};
      this.syncProperties.forEach(function (prop) {
        if (prop in entity.data) {
          state[prop] = entity.data[prop];
        }
      });
      return state;
    }
  }, {
    key: "applyState",
    value: function applyState(entity, state) {
      var _this = this;
      if (!this.syncState) return;
      Object.entries(state).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        if (_this.syncProperties.includes(key)) {
          entity.setData(key, value);
        }
      });
    }
  }, {
    key: "handleStateUpdate",
    value: function handleStateUpdate(entity, data) {
      if (!this.syncState) return;
      if (data.delta) {
        this.applyState(entity, data.delta);
      }
    }
  }, {
    key: "isVersionCompatible",
    value: function isVersionCompatible(version) {
      if (!version) return true;
      var v1 = this.version.split('.').map(Number);
      var v2 = version.split('.').map(Number);

      // Check min version
      if (this.minVersion) {
        var minV = this.minVersion.split('.').map(Number);
        if (v2[0] < minV[0] || v2[0] === minV[0] && v2[1] < minV[1] || v2[0] === minV[0] && v2[1] === minV[1] && v2[2] < minV[2]) {
          return false;
        }
      }

      // Check max version
      if (this.maxVersion) {
        var maxV = this.maxVersion.split('.').map(Number);
        if (v2[0] > maxV[0] || v2[0] === maxV[0] && v2[1] > maxV[1] || v2[0] === maxV[0] && v2[1] === maxV[1] && v2[2] > maxV[2]) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: "sendMessage",
    value: function sendMessage(message, data) {
      if (this.entity) {
        this.entity.sendMessage(message, data);
      }
    }
  }], [{
    key: "build",
    value: function build(name, options) {
      var component = new Component();
      component.name = name;
      component.requiredComponents = options.requiredComponents || [];
      component.defaultData = options.defaultData || options._ || {};
      component.entities = new _util_listmap__WEBPACK_IMPORTED_MODULE_0__["default"]();
      component.messageHandlers = (mori__WEBPACK_IMPORTED_MODULE_1___default()) ? mori__WEBPACK_IMPORTED_MODULE_1___default().hashMap() : {};
      component._onAdd = options.onAdd || null;
      component._onRemove = options.onRemove || null;
      component._update = options.update || null;
      component._aggregateUpdate = options.aggregateUpdate || null;
      component._render = options.render || null;
      component.tags = options.tags || null;
      component.entityData = new _util_listmap__WEBPACK_IMPORTED_MODULE_0__["default"]();
      component.version = options.version || '1.0.0';
      component.minVersion = options.minVersion || '1.0.0';
      component.maxVersion = options.maxVersion || null;
      component.syncState = options.syncState || false;
      component.syncProperties = options.syncProperties || [];

      // Bind methods
      component.handleMessage = component.handleMessageProxy.bind(component);
      component.update = component.update.bind(component);
      component.onAdd = component.onAdd.bind(component);
      component.onRemove = component.onRemove.bind(component);
      component.render = component.render.bind(component);
      component.aggregateUpdate = component.aggregateUpdate.bind(component);
      component.getState = component.getState.bind(component);
      component.applyState = component.applyState.bind(component);
      component.handleStateUpdate = component.handleStateUpdate.bind(component);
      component.isVersionCompatible = component.isVersionCompatible.bind(component);

      // Register 'state-update' handler
      component.handleMessage('state-update', function (entity, data) {
        return component.handleStateUpdate(entity, data);
      });
      return component;
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Component);

/***/ }),

/***/ "./client/js/engine/entity.js":
/*!************************************!*\
  !*** ./client/js/engine/entity.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_listmap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/listmap */ "./client/js/util/listmap.js");
/* harmony import */ var _util_data_clone__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/data-clone */ "./client/js/util/data-clone.js");
/* harmony import */ var _util_data_clone__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_util_data_clone__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _readOnlyError(r) { throw new TypeError('"' + r + '" is read-only'); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



// Add data access layer
var EntityDataAccess = {
  get: function get(entity, key) {
    if (!entity._data) {
      entity._data = {};
    }
    return entity._data[key];
  },
  set: function set(entity, key, value) {
    if (!entity._data) {
      entity._data = {};
    }
    var oldValue = entity._data[key];
    entity._data[key] = value;

    // Notify components of data change
    entity.sendMessage('data-changed', {
      key: key,
      oldValue: oldValue,
      newValue: value
    });
    return value;
  },
  has: function has(entity, key) {
    return entity._data && key in entity._data;
  }
};
var Entity = /*#__PURE__*/function () {
  function Entity(id, world) {
    _classCallCheck(this, Entity);
    this.id = id;
    this.world = world;
    this.components = new _util_listmap__WEBPACK_IMPORTED_MODULE_0__["default"]();
    this.data = {};
    this.tags = new Set();
    this._isActive = true;
    this._shouldRender = true;
    //entities for which we will send all messages we recieve.
    this.forwardMessages = [];
    // does not forward init message by default.
    this.forwardInit = false;
  }
  return _createClass(Entity, [{
    key: "isActive",
    get: function get() {
      return this.world.updateEntities.contains(this.id);
    },
    set: function set(value) {
      if (value) {
        this.world.updateEntities.add(this.id, this);
      } else {
        this.world.updateEntities.remove(this.id);
      }
    }
  }, {
    key: "shouldRender",
    get: function get() {
      return this.world.renderEntities.contains(this.id);
    },
    set: function set(value) {
      if (value) {
        this.world.renderEntities.add(this.id, this);
      } else {
        this.world.renderEntities.remove(this.id);
      }
    }
  }, {
    key: "addComponent",
    value: function addComponent(name, defaultData) {
      this.world.addComponentToEntity(this, name, defaultData || {});
      return this;
    }
  }, {
    key: "removeComponent",
    value: function removeComponent(name) {
      this.world.removeComponent(this, name);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.__isDestroyed) return;
      this.components.forEach(function (component) {
        if (component.onRemove) {
          component.onRemove();
        }
      });
      this.sendMessage('destroyed');
      this.world.destroyEntity(this);
      this.__isDestroyed = true;
    }
  }, {
    key: "isDestroyed",
    value: function isDestroyed() {
      return !!this.__isDestroyed;
    }
  }, {
    key: "update",
    value: function update(dt) {
      if (this.__isDestroyed) {
        return;
      }
      var components = this.components.getList();
      for (var i = 0; i < components.length; i++) {
        var component = components[i],
          update = component._update;
        if (this.isActive && update) update.call(this.data, dt, this, component);
      }
    }
  }, {
    key: "render",
    value: function render(dt) {
      if (this.__isDestroyed) {
        return;
      }
      var components = this.components.getList();
      for (var i = 0; i < components.length; i++) {
        var component = components[i],
          render = component._render;
        if (this.shouldRender && render) render.call(this.data, dt, this, component);
      }
    }

    //todo: implement async messages with timeouts
  }, {
    key: "sendMessage",
    value: function sendMessage(message, data, timeoutMS, callback) {
      var metadata = {
        handled: false,
        results: [],
        version: (data === null || data === void 0 ? void 0 : data.version) || '1.0.0',
        timestamp: Date.now()
      };

      // Clone the data before passing to handlers
      var clonedData = _util_data_clone__WEBPACK_IMPORTED_MODULE_1___default().clone(data);
      this.components.getList().forEach(function (component) {
        if (message in component.messageHandlers) {
          if (!component.isVersionCompatible(metadata.version)) {
            console.warn("Component ".concat(component.name, " version ").concat(component.version, " is not compatible with message version ").concat(metadata.version));
            return;
          }
          metadata.handled = true;
          var result = component.messageHandlers[message].call(this.data, this, clonedData, component);
          if (typeof result !== 'undefined') {
            metadata.results.push(_util_data_clone__WEBPACK_IMPORTED_MODULE_1___default().clone(result));
          }
        }
      }.bind(this));
      return metadata;
    }

    // Add data access methods to prototype
  }, {
    key: "getData",
    value: function getData(key) {
      return EntityDataAccess.get(this, key);
    }
  }, {
    key: "setData",
    value: function setData(key, value) {
      return EntityDataAccess.set(this, key, value);
    }
  }, {
    key: "hasData",
    value: function hasData(key) {
      return EntityDataAccess.has(this, key);
    }
  }, {
    key: "hasComponent",
    value: function hasComponent(name) {
      return this.components.has(name);
    }
  }, {
    key: "getComponent",
    value: function getComponent(name) {
      return this.components.get(name);
    }
  }, {
    key: "addTag",
    value: function addTag(tag) {
      this.tags.add(tag);
      return this;
    }
  }, {
    key: "removeTag",
    value: function removeTag(tag) {
      this.tags["delete"](tag);
      return this;
    }
  }, {
    key: "hasTag",
    value: function hasTag(tag) {
      return this.tags.has(tag);
    }
  }, {
    key: "clone",
    value: function clone() {
      var clone = new Entity(this.id + '_clone', this.world);
      clone.data = _util_data_clone__WEBPACK_IMPORTED_MODULE_1___default()(this.data);
      this.components.forEach(function (component, name) {
        clone.addComponent(name, _util_data_clone__WEBPACK_IMPORTED_MODULE_1___default()(component.data));
      });
      this.tags.forEach(function (tag) {
        return clone.addTag(tag);
      });
      return clone;
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Entity);

/***/ }),

/***/ "./client/js/engine/game.js":
/*!**********************************!*\
  !*** ./client/js/engine/game.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entity */ "./client/js/engine/entity.js");
/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./system */ "./client/js/engine/system.js");
/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_system__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _renderer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderer */ "./client/js/engine/renderer.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



var Game = /*#__PURE__*/function () {
  function Game() {
    _classCallCheck(this, Game);
    this.entities = [];
    this.systems = [];
    this.renderer = new _renderer__WEBPACK_IMPORTED_MODULE_2__["default"]();
  }
  return _createClass(Game, [{
    key: "addEntity",
    value: function addEntity(entity) {
      this.entities.push(entity);
      return entity;
    }
  }, {
    key: "removeEntity",
    value: function removeEntity(entity) {
      var index = this.entities.indexOf(entity);
      if (index !== -1) {
        this.entities.splice(index, 1);
      }
    }
  }, {
    key: "addSystem",
    value: function addSystem(system) {
      this.systems.push(system);
      return system;
    }
  }, {
    key: "removeSystem",
    value: function removeSystem(system) {
      var index = this.systems.indexOf(system);
      if (index !== -1) {
        this.systems.splice(index, 1);
      }
    }
  }, {
    key: "update",
    value: function update(delta) {
      this.systems.forEach(function (system) {
        system.update(delta);
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.renderer.render(this.entities);
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Game);

/***/ }),

/***/ "./client/js/engine/renderer.js":
/*!**************************************!*\
  !*** ./client/js/engine/renderer.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Renderer = /*#__PURE__*/function () {
  function Renderer() {
    _classCallCheck(this, Renderer);
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
  }
  return _createClass(Renderer, [{
    key: "init",
    value: function init(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = canvas.width;
      this.height = canvas.height;
    }
  }, {
    key: "render",
    value: function render(entities) {
      var _this = this;
      if (!this.ctx) {
        return;
      }

      // Clear the canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Sort entities by z-index
      var sortedEntities = entities.sort(function (a, b) {
        var _a$getComponent, _b$getComponent;
        var aZ = ((_a$getComponent = a.getComponent('renderer')) === null || _a$getComponent === void 0 ? void 0 : _a$getComponent.data.zIndex) || 0;
        var bZ = ((_b$getComponent = b.getComponent('renderer')) === null || _b$getComponent === void 0 ? void 0 : _b$getComponent.data.zIndex) || 0;
        return aZ - bZ;
      });

      // Render each entity
      sortedEntities.forEach(function (entity) {
        var renderer = entity.getComponent('renderer');
        if (renderer && renderer.render) {
          renderer.render(_this.ctx);
        }
      });
    }
  }, {
    key: "resize",
    value: function resize(width, height) {
      if (this.canvas) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
      }
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Renderer);

/***/ }),

/***/ "./client/js/engine/system.js":
/*!************************************!*\
  !*** ./client/js/engine/system.js ***!
  \************************************/
/***/ (() => {



/***/ }),

/***/ "./client/js/models/spell.js":
/*!***********************************!*\
  !*** ./client/js/models/spell.js ***!
  \***********************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var Chance = __webpack_require__(/*! ../util/chance */ "./client/js/util/chance.js"),
    _ = __webpack_require__(/*! ../util/underscore */ "./client/js/util/underscore.js"),
    chance = new Chance();
  function Spell(icon, damageRoll) {
    this.icon = icon;
    this.damageRoll = damageRoll;
    this.getDamage = function () {
      return chance.rpg(this.damageRoll, {
        sum: true
      });
    };
    this.damageTarget = function (target) {
      target.sendMessage('damage', {
        amount: this.getDamage()
      });
    };
  }
  var icons = ['heat', 'magic', 'fire', 'snowflake', 'stroller', 'ipod', 'flash', 'pizza', 'hazard'];
  Spell.createRandom = function () {
    var damage = chance.integer({
        min: 1,
        max: 4
      }) + 'd' + chance.integer({
        min: 1,
        max: 12
      }),
      icon = icons[chance.integer({
        min: 0,
        max: icons.length - 1
      })];
    return new Spell(icon, damage);
  };
  return Spell;
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/rogue-scroll.js":
/*!***********************************!*\
  !*** ./client/js/rogue-scroll.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _engine_game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./engine/game */ "./client/js/engine/game.js");
/* harmony import */ var _components_health__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/health */ "./client/js/components/health.js");
/* harmony import */ var _components_position__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/position */ "./client/js/components/position.js");
/* harmony import */ var _components_renderer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/renderer */ "./client/js/components/renderer.js");
/* harmony import */ var _components_renderer__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_components_renderer__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/input */ "./client/js/components/input.js");
/* harmony import */ var _components_physics__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/physics */ "./client/js/components/physics.js");
/* harmony import */ var _components_physics__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_components_physics__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _components_combat__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/combat */ "./client/js/components/combat.js");
/* harmony import */ var _components_combat__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_components_combat__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _components_inventory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/inventory */ "./client/js/components/inventory.js");
/* harmony import */ var _components_quest__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/quest */ "./client/js/components/quest.js");
/* harmony import */ var _components_quest__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_components_quest__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _components_dialogue__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/dialogue */ "./client/js/components/dialogue.js");
/* harmony import */ var _components_dialogue__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_components_dialogue__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _components_ai__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/ai */ "./client/js/components/ai.js");
/* harmony import */ var _components_network__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/network */ "./client/js/components/network.js");
/* harmony import */ var _components_animation__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/animation */ "./client/js/components/animation.js");
/* harmony import */ var _components_animation__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_components_animation__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var _components_augment__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/augment */ "./client/js/components/augment.js");
/* harmony import */ var _components_augment__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(_components_augment__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var _components_boss__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/boss */ "./client/js/components/boss.js");
/* harmony import */ var _components_center_aligned__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./components/center-aligned */ "./client/js/components/center-aligned.js");
/* harmony import */ var _components_center_aligned__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(_components_center_aligned__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var _components_combatant__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/combatant */ "./client/js/components/combatant.js");
/* harmony import */ var _components_combatant__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(_components_combatant__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var _components_defensive_augment__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./components/defensive-augment */ "./client/js/components/defensive-augment.js");
/* harmony import */ var _components_defensive_augment__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(_components_defensive_augment__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var _components_drops_loot__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./components/drops-loot */ "./client/js/components/drops-loot.js");
/* harmony import */ var _components_enemy_spawner__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./components/enemy-spawner */ "./client/js/components/enemy-spawner.js");
/* harmony import */ var _components_enemy_spawner__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(_components_enemy_spawner__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var _components_enemy__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./components/enemy */ "./client/js/components/enemy.js");
/* harmony import */ var _components_enemy__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(_components_enemy__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var _components_floating_combat_text__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./components/floating-combat-text */ "./client/js/components/floating-combat-text.js");
/* harmony import */ var _components_floating_combat_text__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(_components_floating_combat_text__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var _components_game_manager__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./components/game-manager */ "./client/js/components/game-manager.js");
/* harmony import */ var _components_game_manager__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(_components_game_manager__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var _components_game_metrics_display__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./components/game-metrics-display */ "./client/js/components/game-metrics-display.js");
/* harmony import */ var _components_game_metrics_display__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(_components_game_metrics_display__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var _components_glyphicon_renderer__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./components/glyphicon-renderer */ "./client/js/components/glyphicon-renderer.js");
/* harmony import */ var _components_glyphicon_renderer__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(_components_glyphicon_renderer__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var _components_health_display__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./components/health-display */ "./client/js/components/health-display.js");
/* harmony import */ var _components_health_display__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(_components_health_display__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var _components_health_potion__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./components/health-potion */ "./client/js/components/health-potion.js");
/* harmony import */ var _components_health_potion__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(_components_health_potion__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var _components_hide_on_pause__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./components/hide-on-pause */ "./client/js/components/hide-on-pause.js");
/* harmony import */ var _components_hide_on_pause__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(_components_hide_on_pause__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var _components_html_renderer__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./components/html-renderer */ "./client/js/components/html-renderer.js");
/* harmony import */ var _components_keyboard_events__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./components/keyboard-events */ "./client/js/components/keyboard-events.js");
/* harmony import */ var _components_keyboard_events__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(_components_keyboard_events__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var _components_level_door__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./components/level-door */ "./client/js/components/level-door.js");
/* harmony import */ var _components_level_door__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(_components_level_door__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var _components_minimap__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./components/minimap */ "./client/js/components/minimap.js");
/* harmony import */ var _components_minimap__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(_components_minimap__WEBPACK_IMPORTED_MODULE_31__);
/* harmony import */ var _components_mounted__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./components/mounted */ "./client/js/components/mounted.js");
/* harmony import */ var _components_mounted__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(_components_mounted__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var _components_movement__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./components/movement */ "./client/js/components/movement.js");
/* harmony import */ var _components_movement__WEBPACK_IMPORTED_MODULE_33___default = /*#__PURE__*/__webpack_require__.n(_components_movement__WEBPACK_IMPORTED_MODULE_33__);
/* harmony import */ var _components_music__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./components/music */ "./client/js/components/music.js");
/* harmony import */ var _components_music__WEBPACK_IMPORTED_MODULE_34___default = /*#__PURE__*/__webpack_require__.n(_components_music__WEBPACK_IMPORTED_MODULE_34__);
/* harmony import */ var _components_offensive_augment__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./components/offensive-augment */ "./client/js/components/offensive-augment.js");
/* harmony import */ var _components_offensive_augment__WEBPACK_IMPORTED_MODULE_35___default = /*#__PURE__*/__webpack_require__.n(_components_offensive_augment__WEBPACK_IMPORTED_MODULE_35__);
/* harmony import */ var _components_options__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./components/options */ "./client/js/components/options.js");
/* harmony import */ var _components_options__WEBPACK_IMPORTED_MODULE_36___default = /*#__PURE__*/__webpack_require__.n(_components_options__WEBPACK_IMPORTED_MODULE_36__);
/* harmony import */ var _components_player__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./components/player */ "./client/js/components/player.js");
/* harmony import */ var _components_scroll_chaser__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./components/scroll-chaser */ "./client/js/components/scroll-chaser.js");
/* harmony import */ var _components_scroll_chaser__WEBPACK_IMPORTED_MODULE_38___default = /*#__PURE__*/__webpack_require__.n(_components_scroll_chaser__WEBPACK_IMPORTED_MODULE_38__);
/* harmony import */ var _components_sensor__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./components/sensor */ "./client/js/components/sensor.js");
/* harmony import */ var _components_sensor__WEBPACK_IMPORTED_MODULE_39___default = /*#__PURE__*/__webpack_require__.n(_components_sensor__WEBPACK_IMPORTED_MODULE_39__);
/* harmony import */ var _components_shield__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./components/shield */ "./client/js/components/shield.js");
/* harmony import */ var _components_shield__WEBPACK_IMPORTED_MODULE_40___default = /*#__PURE__*/__webpack_require__.n(_components_shield__WEBPACK_IMPORTED_MODULE_40__);
/* harmony import */ var _components_sine_line__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./components/sine-line */ "./client/js/components/sine-line.js");
/* harmony import */ var _components_sine_line__WEBPACK_IMPORTED_MODULE_41___default = /*#__PURE__*/__webpack_require__.n(_components_sine_line__WEBPACK_IMPORTED_MODULE_41__);
/* harmony import */ var _components_sine_wave_movement__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./components/sine-wave-movement */ "./client/js/components/sine-wave-movement.js");
/* harmony import */ var _components_sine_wave_movement__WEBPACK_IMPORTED_MODULE_42___default = /*#__PURE__*/__webpack_require__.n(_components_sine_wave_movement__WEBPACK_IMPORTED_MODULE_42__);
/* harmony import */ var _components_spell_container__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./components/spell-container */ "./client/js/components/spell-container.js");
/* harmony import */ var _components_spell_container__WEBPACK_IMPORTED_MODULE_43___default = /*#__PURE__*/__webpack_require__.n(_components_spell_container__WEBPACK_IMPORTED_MODULE_43__);
/* harmony import */ var _components_spell__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./components/spell */ "./client/js/components/spell.js");
/* harmony import */ var _components_spell__WEBPACK_IMPORTED_MODULE_44___default = /*#__PURE__*/__webpack_require__.n(_components_spell__WEBPACK_IMPORTED_MODULE_44__);
/* harmony import */ var _components_tests__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./components/tests */ "./client/js/components/tests.js");
/* harmony import */ var _components_tests__WEBPACK_IMPORTED_MODULE_45___default = /*#__PURE__*/__webpack_require__.n(_components_tests__WEBPACK_IMPORTED_MODULE_45__);
/* harmony import */ var _components_text__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./components/text */ "./client/js/components/text.js");
/* harmony import */ var _components_text__WEBPACK_IMPORTED_MODULE_46___default = /*#__PURE__*/__webpack_require__.n(_components_text__WEBPACK_IMPORTED_MODULE_46__);
/* harmony import */ var _components_timed_destroy__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./components/timed-destroy */ "./client/js/components/timed-destroy.js");
/* harmony import */ var _components_trap__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./components/trap */ "./client/js/components/trap.js");
/* harmony import */ var _components_trap__WEBPACK_IMPORTED_MODULE_48___default = /*#__PURE__*/__webpack_require__.n(_components_trap__WEBPACK_IMPORTED_MODULE_48__);
/* harmony import */ var _components_vision__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./components/vision */ "./client/js/components/vision.js");
/* harmony import */ var _components_vision__WEBPACK_IMPORTED_MODULE_49___default = /*#__PURE__*/__webpack_require__.n(_components_vision__WEBPACK_IMPORTED_MODULE_49__);
/* harmony import */ var _util_mori__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./util/mori */ "./client/js/util/mori.js");
/* harmony import */ var jquery_transit__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! jquery.transit */ "./node_modules/jquery.transit/jquery.transit.js");
/* harmony import */ var jquery_transit__WEBPACK_IMPORTED_MODULE_51___default = /*#__PURE__*/__webpack_require__.n(jquery_transit__WEBPACK_IMPORTED_MODULE_51__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _this = undefined;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { return Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = c(GeneratorFunctionPrototype, u, "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, "catch": function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * ROGUE SCROLL:
 * 
 * Rogue like in one dimension.
 * 
 * Only use symbols from glyphicons
 * 
 * Bootstrap. Use bootstraps scroll spy to start the game once the index is below page 1.
 * 
 * 2 options in nav: Pause, Play
 * 
 * Once user scrolls down, they start to descend. As they descend the page will grow.
 * 
 **/





















































// Load non-critical components dynamically
var loadNonCriticalComponents = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var _yield$Promise$all, _yield$Promise$all2, Boss, SpellContainer, Spell, Tests, Options;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return Promise.all([Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./components/boss */ "./client/js/components/boss.js")), Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./components/spell-container */ "./client/js/components/spell-container.js", 23)), Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./components/spell */ "./client/js/components/spell.js", 23)), Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./components/tests */ "./client/js/components/tests.js", 23)), Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./components/options */ "./client/js/components/options.js", 23))]);
        case 2:
          _yield$Promise$all = _context.sent;
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 5);
          Boss = _yield$Promise$all2[0];
          SpellContainer = _yield$Promise$all2[1];
          Spell = _yield$Promise$all2[2];
          Tests = _yield$Promise$all2[3];
          Options = _yield$Promise$all2[4];
          return _context.abrupt("return", {
            boss: Boss["default"],
            'spell-container': SpellContainer["default"],
            spell: Spell["default"],
            tests: Tests["default"],
            options: Options["default"]
          });
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function loadNonCriticalComponents() {
    return _ref.apply(this, arguments);
  };
}();
var RogueScroll = {
  game: null,
  components: {
    health: _components_health__WEBPACK_IMPORTED_MODULE_1__["default"],
    position: _components_position__WEBPACK_IMPORTED_MODULE_2__["default"],
    renderer: (_components_renderer__WEBPACK_IMPORTED_MODULE_3___default()),
    input: _components_input__WEBPACK_IMPORTED_MODULE_4__["default"],
    physics: (_components_physics__WEBPACK_IMPORTED_MODULE_5___default()),
    combat: (_components_combat__WEBPACK_IMPORTED_MODULE_6___default()),
    inventory: _components_inventory__WEBPACK_IMPORTED_MODULE_7__["default"],
    quest: (_components_quest__WEBPACK_IMPORTED_MODULE_8___default()),
    dialogue: (_components_dialogue__WEBPACK_IMPORTED_MODULE_9___default()),
    ai: _components_ai__WEBPACK_IMPORTED_MODULE_10__["default"],
    network: _components_network__WEBPACK_IMPORTED_MODULE_11__["default"],
    animation: (_components_animation__WEBPACK_IMPORTED_MODULE_12___default()),
    augment: (_components_augment__WEBPACK_IMPORTED_MODULE_13___default()),
    'center-aligned': (_components_center_aligned__WEBPACK_IMPORTED_MODULE_15___default()),
    combatant: (_components_combatant__WEBPACK_IMPORTED_MODULE_16___default()),
    'defensive-augment': (_components_defensive_augment__WEBPACK_IMPORTED_MODULE_17___default()),
    'drops-loot': _components_drops_loot__WEBPACK_IMPORTED_MODULE_18__["default"],
    'enemy-spawner': (_components_enemy_spawner__WEBPACK_IMPORTED_MODULE_19___default()),
    enemy: (_components_enemy__WEBPACK_IMPORTED_MODULE_20___default()),
    'floating-combat-text': (_components_floating_combat_text__WEBPACK_IMPORTED_MODULE_21___default()),
    'game-manager': (_components_game_manager__WEBPACK_IMPORTED_MODULE_22___default()),
    'game-metrics-display': (_components_game_metrics_display__WEBPACK_IMPORTED_MODULE_23___default()),
    'glyphicon-renderer': (_components_glyphicon_renderer__WEBPACK_IMPORTED_MODULE_24___default()),
    'health-display': (_components_health_display__WEBPACK_IMPORTED_MODULE_25___default()),
    'health-potion': (_components_health_potion__WEBPACK_IMPORTED_MODULE_26___default()),
    'hide-on-pause': (_components_hide_on_pause__WEBPACK_IMPORTED_MODULE_27___default()),
    'html-renderer': _components_html_renderer__WEBPACK_IMPORTED_MODULE_28__["default"],
    'keyboard-events': (_components_keyboard_events__WEBPACK_IMPORTED_MODULE_29___default()),
    'level-door': (_components_level_door__WEBPACK_IMPORTED_MODULE_30___default()),
    minimap: (_components_minimap__WEBPACK_IMPORTED_MODULE_31___default()),
    mounted: (_components_mounted__WEBPACK_IMPORTED_MODULE_32___default()),
    movement: (_components_movement__WEBPACK_IMPORTED_MODULE_33___default()),
    music: (_components_music__WEBPACK_IMPORTED_MODULE_34___default()),
    'offensive-augment': (_components_offensive_augment__WEBPACK_IMPORTED_MODULE_35___default()),
    player: _components_player__WEBPACK_IMPORTED_MODULE_37__["default"],
    'scroll-chaser': (_components_scroll_chaser__WEBPACK_IMPORTED_MODULE_38___default()),
    sensor: (_components_sensor__WEBPACK_IMPORTED_MODULE_39___default()),
    shield: (_components_shield__WEBPACK_IMPORTED_MODULE_40___default()),
    'sine-line': (_components_sine_line__WEBPACK_IMPORTED_MODULE_41___default()),
    'sine-wave-movement': (_components_sine_wave_movement__WEBPACK_IMPORTED_MODULE_42___default()),
    text: (_components_text__WEBPACK_IMPORTED_MODULE_46___default()),
    'timed-destroy': _components_timed_destroy__WEBPACK_IMPORTED_MODULE_47__["default"],
    trap: (_components_trap__WEBPACK_IMPORTED_MODULE_48___default()),
    vision: (_components_vision__WEBPACK_IMPORTED_MODULE_49___default())
  },
  entities: _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector(_util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('world'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('world', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap())), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('music', 'level-change-subscriber'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('music', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap())), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('player', 'hide-at-start'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('health', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('health', 70, 'maxHealth', 100), 'player', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('iconColor', '#eee'), 'movement', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('speed', 250), 'position', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('position', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('x', document.documentElement.clientWidth / 2, 'y', -75), 'size', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('width', 50, 'height', 50)), 'keyboard-events', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap(), 'vision', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap()), 'shouldRender', false), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('shield', 'hide-at-start'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('shield', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('mountTag', 'player'))), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('weapon', 'hide-at-start', 'level-change-subscriber'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('weapon', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('mountTag', 'player'))), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('health-display', 'hide-at-start'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('health-display', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('textColor', '#eee', 'z-index', 10000), 'hide-on-pause', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap())), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('metrics'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('game-metrics-display', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('textColor', '#eee', 'z-index', 10000), 'hide-on-pause', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap())), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('health-potion', 'hide-at-start'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('health-potion', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('position', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('y', 500, 'x', 0), 'target', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('y', 500, 'x', 0), 'pursueTarget', false))), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('game-manager'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('game-manager', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap())), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('player-metrics'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('game-metrics-display', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('shouldRender', false, 'isActive', false, 'metricsTargetTag', 'player', 'isStaticPosition', true, 'positionAnchor', 'bottom-right', 'position', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('x', 250, 'y', 200), 'metricsFunction', function (entity, dt, target) {
    return target.data.position.x.toFixed(3) + ' ' + target.engine.updateEntities.getList().length;
  }, 'icon', 'global', 'textColor', '#eee'), 'hide-on-pause', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap())), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('defensive-augment', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('mountTag', 'player'))), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('offensive-augment', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('mountTag', 'player'))), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('glyphicon-renderer', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('icon', 'align-center'), 'mounted', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('mountTag', 'level-door', 'offset', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('x', 0, 'y', 25)))), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('minimap'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('minimap', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap())), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('options'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('options', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap())), _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('tags', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].vector('spell-container'), 'components', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap('spell-container', _util_mori__WEBPACK_IMPORTED_MODULE_50__["default"].hashMap()))),
  isRunning: false,
  lastTime: 0,
  targetFPS: 60,
  frameTime: 1000 / 60,
  init: function () {
    var _init = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var nonCriticalComponents;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return loadNonCriticalComponents();
          case 3:
            nonCriticalComponents = _context2.sent;
            _this.components = _objectSpread(_objectSpread({}, _this.components), nonCriticalComponents);

            // Initialize game
            _this.game = new _engine_game__WEBPACK_IMPORTED_MODULE_0__["default"](_this.components, _this.entities);

            // Initialize all systems
            _this.systems = {
              physics: new (_components_physics__WEBPACK_IMPORTED_MODULE_5___default())(),
              combat: new (_components_combat__WEBPACK_IMPORTED_MODULE_6___default())(),
              ai: new _components_ai__WEBPACK_IMPORTED_MODULE_10__["default"](),
              network: new _components_network__WEBPACK_IMPORTED_MODULE_11__["default"](),
              input: new _components_input__WEBPACK_IMPORTED_MODULE_4__["default"](),
              renderer: new (_components_renderer__WEBPACK_IMPORTED_MODULE_3___default())()
            };

            // Add systems to game
            Object.values(_this.systems).forEach(function (system) {
              _this.game.addSystem(system);
            });

            // Initialize entities
            _this.entities.forEach(function (entityConfig) {
              var entity = _this.game.createEntity({
                tags: entityConfig.tags
              });
              Object.entries(entityConfig.components).forEach(function (_ref2) {
                var _ref3 = _slicedToArray(_ref2, 2),
                  name = _ref3[0],
                  data = _ref3[1];
                entity.addComponent(name, data);
              });
            });

            // Start game loop
            _this.start();

            // Add cleanup on window unload
            window.addEventListener('unload', _this.cleanup.bind(_this));
            return _context2.abrupt("return", true);
          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](0);
            console.error('Failed to initialize RogueScroll:', _context2.t0);
            return _context2.abrupt("return", false);
          case 18:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[0, 14]]);
    }));
    function init() {
      return _init.apply(this, arguments);
    }
    return init;
  }(),
  start: function start() {
    if (!_this.isRunning) {
      _this.isRunning = true;
      _this.lastTime = performance.now();
      requestAnimationFrame(_this.gameLoop.bind(_this));
    }
  },
  stop: function stop() {
    _this.isRunning = false;
  },
  gameLoop: function gameLoop(timestamp) {
    if (!_this.isRunning) return;

    // Calculate delta time in seconds
    var delta = (timestamp - _this.lastTime) / 1000;
    _this.lastTime = timestamp;

    // Cap delta to prevent large jumps
    delta = Math.min(delta, 0.1);
    try {
      // Update game state
      _this.game.update(delta);
      _this.game.render();
    } catch (error) {
      console.error('Error in game loop:', error);
      _this.stop();
      return;
    }

    // Schedule next frame
    requestAnimationFrame(_this.gameLoop.bind(_this));
  },
  cleanup: function cleanup() {
    _this.stop();
    if (_this.game) {
      // Cleanup systems
      Object.values(_this.systems).forEach(function (system) {
        if (system.cleanup) {
          system.cleanup();
        }
      });

      // Cleanup game
      _this.game.destroy();
      _this.game = null;
    }
  },
  play: function play() {
    if (_this.game) {
      _this.game.play();
    }
  },
  pause: function pause() {
    if (_this.game) {
      _this.game.pause();
    }
  }
};
for (var propName in RogueScroll) {
  if (RogueScroll.hasOwnProperty(propName) && typeof RogueScroll[propName] === 'function') {
    RogueScroll[propName] = RogueScroll[propName].bind(RogueScroll);
  }
}

// Make RogueScroll available globally
window.RogueScroll = RogueScroll;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RogueScroll);

/***/ }),

/***/ "./client/js/templates/characterSelection.hbs":
/*!****************************************************!*\
  !*** ./client/js/templates/characterSelection.hbs ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <span class='character-portrait glyphicons glyphicons-"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"icon") || (depth0 != null ? lookupProperty(depth0,"icon") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"icon","hash":{},"data":data,"loc":{"start":{"line":5,"column":66},"end":{"line":5,"column":74}}}) : helper)))
    + "'></span>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class='character-selection text-center'>\n    <h2>Choose a character!</h2>\n    <div class='row portraits portrait-container' style='text-align: center'>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"characters") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":6,"column":17}}})) != null ? stack1 : "")
    + "    </div>\n\n    <h3 class='character-name'>Name</h3>\n    <input class='character-name-input' type='text' placeholder='Select a character' />\n    <p class='character-description'></p>\n    <h3>Stats</h3>\n    <div class='stats-container'>\n        <br/><strong>Skills </strong><span class='skills'></span>\n        <br/><strong>Brains </strong><span class='brains'></span>\n        <br/><strong>Brawn </strong><span class='brawn'></span>\n        <br/><strong>Light </strong><span class='light'></span>\n    </div>\n    <br/>\n    <button class='character-select-button centered btn btn-primary'>Select</button>\n</div>";
},"useData":true});

/***/ }),

/***/ "./client/js/templates/optionControls sync recursive ^\\.\\/.*\\.hbs$":
/*!****************************************************************!*\
  !*** ./client/js/templates/optionControls/ sync ^\.\/.*\.hbs$ ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./checkbox.hbs": "./client/js/templates/optionControls/checkbox.hbs",
	"./number.hbs": "./client/js/templates/optionControls/number.hbs",
	"./slider.hbs": "./client/js/templates/optionControls/slider.hbs",
	"./text.hbs": "./client/js/templates/optionControls/text.hbs",
	"./textarea.hbs": "./client/js/templates/optionControls/textarea.hbs",
	"./textbox.hbs": "./client/js/templates/optionControls/textbox.hbs"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./client/js/templates/optionControls sync recursive ^\\.\\/.*\\.hbs$";

/***/ }),

/***/ "./client/js/templates/optionControls/checkbox.hbs":
/*!*********************************************************!*\
  !*** ./client/js/templates/optionControls/checkbox.hbs ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"1":function(container,depth0,helpers,partials,data) {
    return "<input type='checkbox' checked='checked' />\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h3>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"_name") || (depth0 != null ? lookupProperty(depth0,"_name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"_name","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":13}}}) : helper)))
    + "</h3>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(1, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":6,"column":7}}})) != null ? stack1 : "");
},"useData":true});

/***/ }),

/***/ "./client/js/templates/optionControls/number.hbs":
/*!*******************************************************!*\
  !*** ./client/js/templates/optionControls/number.hbs ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h3>"
    + alias4(((helper = (helper = lookupProperty(helpers,"_name") || (depth0 != null ? lookupProperty(depth0,"_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_name","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":13}}}) : helper)))
    + "</h3>\n<input type='number' value='"
    + alias4(((helper = (helper = lookupProperty(helpers,"value") || (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data,"loc":{"start":{"line":2,"column":28},"end":{"line":2,"column":37}}}) : helper)))
    + "' />";
},"useData":true});

/***/ }),

/***/ "./client/js/templates/optionControls/slider.hbs":
/*!*******************************************************!*\
  !*** ./client/js/templates/optionControls/slider.hbs ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h3>"
    + alias4(((helper = (helper = lookupProperty(helpers,"_name") || (depth0 != null ? lookupProperty(depth0,"_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_name","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":13}}}) : helper)))
    + "</h3>\n<input style='width: 100%' type='range' min='"
    + alias4(((helper = (helper = lookupProperty(helpers,"min") || (depth0 != null ? lookupProperty(depth0,"min") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"min","hash":{},"data":data,"loc":{"start":{"line":2,"column":45},"end":{"line":2,"column":52}}}) : helper)))
    + "' max='"
    + alias4(((helper = (helper = lookupProperty(helpers,"max") || (depth0 != null ? lookupProperty(depth0,"max") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"max","hash":{},"data":data,"loc":{"start":{"line":2,"column":59},"end":{"line":2,"column":66}}}) : helper)))
    + "' value='"
    + alias4(((helper = (helper = lookupProperty(helpers,"value") || (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data,"loc":{"start":{"line":2,"column":75},"end":{"line":2,"column":84}}}) : helper)))
    + "' step='"
    + alias4(((helper = (helper = lookupProperty(helpers,"step") || (depth0 != null ? lookupProperty(depth0,"step") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"step","hash":{},"data":data,"loc":{"start":{"line":2,"column":92},"end":{"line":2,"column":100}}}) : helper)))
    + "' />";
},"useData":true});

/***/ }),

/***/ "./client/js/templates/optionControls/text.hbs":
/*!*****************************************************!*\
  !*** ./client/js/templates/optionControls/text.hbs ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h3>"
    + alias4(((helper = (helper = lookupProperty(helpers,"_name") || (depth0 != null ? lookupProperty(depth0,"_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_name","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":13}}}) : helper)))
    + "</h3>\n<p>\n    "
    + alias4(((helper = (helper = lookupProperty(helpers,"value") || (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data,"loc":{"start":{"line":3,"column":4},"end":{"line":3,"column":13}}}) : helper)))
    + "\n</p>";
},"useData":true});

/***/ }),

/***/ "./client/js/templates/optionControls/textarea.hbs":
/*!*********************************************************!*\
  !*** ./client/js/templates/optionControls/textarea.hbs ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h3>"
    + alias4(((helper = (helper = lookupProperty(helpers,"_name") || (depth0 != null ? lookupProperty(depth0,"_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_name","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":13}}}) : helper)))
    + "</h3>\n<textarea cols='10' rows='4'>"
    + alias4(((helper = (helper = lookupProperty(helpers,"value") || (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data,"loc":{"start":{"line":2,"column":29},"end":{"line":2,"column":38}}}) : helper)))
    + "</textarea>";
},"useData":true});

/***/ }),

/***/ "./client/js/templates/optionControls/textbox.hbs":
/*!********************************************************!*\
  !*** ./client/js/templates/optionControls/textbox.hbs ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h3>"
    + alias4(((helper = (helper = lookupProperty(helpers,"_name") || (depth0 != null ? lookupProperty(depth0,"_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_name","hash":{},"data":data,"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":13}}}) : helper)))
    + "</h3>\n<input type='text' value='"
    + alias4(((helper = (helper = lookupProperty(helpers,"value") || (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data,"loc":{"start":{"line":2,"column":26},"end":{"line":2,"column":35}}}) : helper)))
    + "' />";
},"useData":true});

/***/ }),

/***/ "./client/js/templates/options.hbs":
/*!*****************************************!*\
  !*** ./client/js/templates/options.hbs ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class='options-container' style='background-color: #eee; border: 4px solid #331; border-radius: 5px; position: fixed; font-size: 0.8em'>\n    <style type='text/css'>\n        .options-container * {\n            font-size: 1.2em;\n        }\n        \n        .options-container {\n            padding-right: 10px;\n            overflow-y: scroll;\n            height: 200px;\n        }\n        \n        .options-container p {\n            font-size: 0.8em;\n        }\n        \n        .hidden-options {\n            height: 100px;\n        }\n        \n        .options-header {\n            margin-top: 0;\n            padding-top: 10px;\n            padding-left: 10px;\n            cursor: pointer;\n        }\n    </style>\n    <h3 class='options-header'><span class='glyphicons glyphicons-chevron-right'></span><span class='options-hide'>Options</span></h3>\n    <script type='text/javascript'>\n    $(function() {\n        var $optionsHeader = $('.options-header');\n        \n        function hideHeader() {\n            $optionsHeader.attr('data-hidden', true);\n            $('.options-list, .options-hide').hide();\n            $('.options-container').addClass('hidden-options');\n            $optionsHeader.find('.glyphicons').css({ rotate: '90deg' });\n        }\n        \n        function showHeader() {\n            $optionsHeader.attr('data-hidden', false);\n            $('.options-list, .options-hide').show();\n            $('.options-container').removeClass('hidden-options');\n            $optionsHeader.find('.glyphicons').css({ rotate: '0deg' });\n        }\n        \n        $optionsHeader.click(function() {\n            if (!$(this).attr('data-hidden') || $(this).attr('data-hidden') == 'false') {\n                hideHeader();\n            } else {\n                showHeader();\n            }\n        });  \n        \n        hideHeader();\n    });\n    </script>\n    <ul class='options-list' style='list-style-type: none'>\n    </ul>\n</div>";
},"useData":true});

/***/ }),

/***/ "./client/js/templates/spells.hbs":
/*!****************************************!*\
  !*** ./client/js/templates/spells.hbs ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Handlebars = __webpack_require__(/*! ../../../node_modules/handlebars/runtime.js */ "./node_modules/handlebars/runtime.js");
function __default(obj) { return obj && (obj.__esModule ? obj["default"] : obj); }
module.exports = (Handlebars["default"] || Handlebars).template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "    <style type='text/css'>\n        .spell-container {\n            background-color: transparent;\n            left: 0;\n            width: 100%;\n            overflow-x: auto;\n            bottom: 0;\n            height: 100px;\n            position: fixed;\n            text-align: center;\n        }\n        \n        .spell-container .spell {\n            display: inline;\n            text-align: center;\n            width: 90px;\n            height: 90px;\n            margin: 0 10px 0 10px;\n            padding: 0;\n            font-size: 40px;\n            color: white;\n        }\n    </style>\n\n<div class='spell-container'>\n    \n    \n</div>";
},"useData":true});

/***/ }),

/***/ "./client/js/util/V2.js":
/*!******************************!*\
  !*** ./client/js/util/V2.js ***!
  \******************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var mori = __webpack_require__(/*! mori */ "mori");

  /*
    V2 is a mutable vector2 for performance
    
    ImmutableV2 is not mutable.
  */
  var isVector2 = function isVector2(value) {
    return value.constructor === V2 || value.constructor === ImmutableV2;
  };
  V2.coalesce = function (value) {
    if (value.constructor === V2) {
      return value;
    } else {
      return new V2(value.x || value.X || 0, value.y || value.Y || 0);
    }
  };
  ImmutableV2.coalesce = function (value) {
    if (value.constructor === ImmutableV2) {
      return value;
    } else {
      return new ImmutableV2(value.x || value.X || 0, value.y || value.Y || 0);
    }
  };
  function V2(x, y) {
    if (typeof x === 'undefined' || typeof y === 'undefined') {
      this.X = 0;
      this.Y = 0;
    } else {
      this.X = x;
      this.Y = y;
    }

    /*
      Checks the value passed in to make sure it's a Vector2.
    */
    var isVector2 = function isVector2(value) {
      return value.constructor === V2 || value.constructor === ImmutableV2;
    };
    this.isVector2 = isVector2;

    /*
      Performs a dot on this V2 and the V2 passed in.
    */
    this.dot = function (vec2) {
      return this.X * vec2.X + this.Y * vec2.Y;
    };

    /*
      Returns the length of the V2. It should be noted that lengthSqr should be used
      for greater performance.
    */
    this.length = function () {
      return Math.sqrt(this.dot(this));
    };

    /*
      Returns the length * length of the V2. Faster than V2.length as it does not
      make a Math.sqrt call.
    */
    this.lengthSqr = function () {
      return this.dot(this);
    };

    /*
      Returns the Absolute value for this vector's X and Y in a new V2.
    */
    this.abs = function () {
      this.X = Math.abs(this.X);
      this.Y = Math.abs(this.Y);
      return this;
    };

    /*
      Returns the unit length V2 (vector components divided by length)
    */
    this.normalize = function () {
      var vlen = this.length();
      this.X = this.X / vlen;
      this.Y = this.Y / vlen;
      return this;
    };

    /*
      Returns the product of this vector and either a scalar or a V2 passed in.
    */
    this.multiply = function (value) {
      if (isVector2(value)) {
        this.X = this.X * value.X;
        this.Y = this.Y * value.Y;
        return this;
      } else {
        this.X = this.X * value;
        this.Y = this.Y * value;
        return this;
      }
    };

    /*
      Returns the divisor of this vector and a scalar passed in.
    */
    this.divide = function (value) {
      this.X = this.X / value;
      this.Y = this.Y / value;
      return this;
    };

    /*
      Returns the sum of this vector and either a scalar or a V2 passed in.
    */
    this.add = function (value) {
      if (isVector2(value)) {
        this.X = this.X + value.X;
        this.Y = this.Y + value.Y;
        return this;
      } else {
        this.X = this.X + value;
        this.Y = this.Y + value;
        return this;
      }
    };

    /*
      Returns the difference of this vector and either a scalar or a V2 passed in.
    */
    this.sub = function (value) {
      if (isVector2(value)) {
        this.X = this.X - value.X;
        this.Y = this.Y - value.Y;
        return this;
      } else {
        this.X = this.X - value;
        this.Y = this.Y - value;
        return this;
      }
    };
    this.perpendicular = function () {
      var y = -this.Y,
        x = this.X;
      this.Y = y;
      this.X = x;
      return this;
    };
    this.init = function (x, y) {
      this.X = x;
      this.Y = y;
      return this;
    };
    this.initFromV2 = function (vec2) {
      this.X = vec2.X;
      this.Y = vec2.Y;
      return this;
    };
    this.copy = function () {
      return new V2(this.X, this.Y);
    };
    this.asImmutable = function () {
      return new ImmutableV2(this.X, this.Y);
    };
    this.toRadians = function () {
      return Math.atan2(this.Y, this.X);
    };
    this.fromRadians = function (rads) {
      this.X = Math.cos(rads);
      this.Y = Math.sin(rads);
    };
    this.toDegrees = function () {
      return Math.degrees(this.toRadians());
    };
    this.fromDegrees = function (degrees) {
      return this.fromRadians(Math.radians(degrees));
    };
    this.vectorTo = function (otherVector) {
      return V2.coalesce(otherVector).sub(this);
    };
    this.distanceTo = function (otherVector) {
      return V2.coalesce(otherVector).sub(this).length();
    };
    this.toString = function () {
      return 'x: ' + this.X + ' y: ' + this.Y;
    };
    this.toFixed = function (decimalPlaces) {
      this.X = parseFloat(this.X.toFixed(decimalPlaces));
      this.Y = parseFloat(this.Y.toFixed(decimalPlaces));
      return this;
    };
    this.toMori = function () {
      return mori.hashMap('x', this.X, 'y', this.Y);
    };
    this.fromMori = function (moriVector) {
      this.X = mori.get(moriVector, 'x');
      this.Y = mori.get(moriVector, 'y');
      return this;
    };
  }
  function ImmutableV2(x, y) {
    if (typeof x === 'undefined' || typeof y === 'undefined') {
      this.X = 0;
      this.Y = 0;
    } else {
      this.X = x;
      this.Y = y;
    }

    /*
      Checks the value passed in to make sure it's a Vector2.
    */
    var isVector2 = function isVector2(value) {
      return value.constructor === V2 || value.constructor === ImmutableV2;
    };
    this.Equals = function (vec2) {
      return isVector2(vec2) && this.X == vec2.X && this.Y == vec2.Y;
    };

    /*
      Performs a dot on this V2 and the V2 passed in.
    */
    this.dot = function (vec2) {
      return this.X * vec2.X + this.Y * vec2.Y;
    };

    /*
      Returns the length of the V2. It should be noted that lengthSqr should be used
      for greater performance.
    */
    this.length = function () {
      return Math.sqrt(this.dot(this));
    };
    this.perpendicular = function () {
      return new ImmutableV2(-this.Y, this.X);
    };

    /*
      Returns the length * length of the V2. Faster than V2.length as it does not
      make a Math.sqrt call.
    */
    this.lengthSqr = function () {
      return this.dot(this);
    };

    /*
      Returns the Absolute value for this vector's X and Y in a new V2.
    */
    this.abs = function () {
      return new ImmutableV2(Math.abs(this.X), Math.abs(this.Y));
    };

    /*
      Returns the unit length V2 (vector components divided by length)
    */
    this.normalize = function () {
      var vlen = this.length();
      return new ImmutableV2(this.X / vlen, this.Y / vlen);
    };

    /*
      Returns the product of this vector and either a scalar or a V2 passed in.
    */
    this.multiply = function (value) {
      if (isVector2(value)) {
        return new ImmutableV2(this.X * value.X, this.Y * value.Y);
      } else {
        return new ImmutableV2(this.X * value, this.Y * value);
      }
    };

    /*
      Returns the divisor of this vector and a scalar passed in.
    */
    this.divide = function (value) {
      return new ImmutableV2(this.X / value, this.Y / value);
    };

    /*
      Returns the sum of this vector and either a scalar or a V2 passed in.
    */
    this.add = function (value) {
      if (isVector2(value)) {
        return new ImmutableV2(this.X + value.X, this.Y + value.Y);
      } else {
        return new ImmutableV2(this.X + value, this.Y + value);
      }
    };

    /*
      Returns the difference of this vector and either a scalar or a V2 passed in.
    */
    this.sub = function (value) {
      if (isVector2(value)) {
        return new ImmutableV2(this.X - value.X, this.Y - value.Y);
      } else {
        return new ImmutableV2(this.X - value, this.Y - value);
      }
    };
    this.vectorTo = function (otherVector) {
      return ImmutableV2.coalesce(otherVector).sub(this);
    };
    this.distanceTo = function (otherVector) {
      return ImmutableV2.coalesce(otherVector).sub(this).length();
    };
    this.asMutable = function () {
      return new V2(this.X, this.Y);
    };
    this.toRadians = function () {
      return Math.atan2(this.Y, this.X);
    };
    this.toDegrees = function () {
      return Math.degrees(this.toRadians());
    };
    this.fromDegrees = function (degrees) {
      return this.fromRadians(Math.radians(degrees));
    };
    this.toString = function () {
      return 'x: ' + this.X + ' y: ' + this.Y;
    };
    this.toFixed = function (decimalPlaces) {
      return new ImmutableV2(parseFloat(this.X.toFixed(decimalPlaces)), parseFloat(this.Y.toFixed(decimalPlaces)));
    };
    this.toMori = function () {
      return mori.hashMap('x', this.X, 'y', this.Y);
    };
    this.fromMori = function (moriVector) {
      return new ImmutableV2(mori.get(moriVector, 'x'), mori.get(moriVector, 'y'));
    };
  }
  V2.distanceBetween = function (pointA, pointB) {
    return V2.coalesce(pointA).distanceTo(V2.coalesce(pointB));
  };
  ImmutableV2.distanceBetween = function (pointA, pointB) {
    return ImmutableV2.coalesce(pointA).distanceTo(ImmutableV2.coalesce(pointB));
  };
  ImmutableV2.fromTo = function (from, to) {
    return ImmutableV2.coalesce(to).sub(ImmutableV2.coalesce(from));
  };
  ImmutableV2.fromRadians = function (rads) {
    return new ImmutableV2(Math.cos(rads), Math.sin(rads));
  };
  V2.fromRadians = function (rads) {
    return new V2(Math.cos(rads), Math.sin(rads));
  };
  V2.fromTo = function (from, to) {
    return ImmutableV2.coalesce(to).sub(ImmutableV2.coalesce(from));
  };
  Math.degrees = function (rad) {
    return rad * (180 / Math.PI);
  };
  Math.radians = function (deg) {
    return deg * (Math.PI / 180);
  };
  if (window) {
    window.V2 = V2;
    window.ImmutableV2 = ImmutableV2;
  }
  return {
    V2: V2,
    ImmutableV2: ImmutableV2
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/util/buzz.js":
/*!********************************!*\
  !*** ./client/js/util/buzz.js ***!
  \********************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// ----------------------------------------------------------------------------
// Buzz, a Javascript HTML5 Audio library
// v1.1.9 - Built 2015-03-03 14:20
// Licensed under the MIT license.
// http://buzz.jaysalvat.com/
// ----------------------------------------------------------------------------
// Copyright (C) 2010-2015 Jay Salvat
// http://jaysalvat.com/
// ----------------------------------------------------------------------------

(function (context, factory) {
  'use strict';

  if ( true && module.exports) {
    module.exports = factory();
  } else if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(this, function () {
  'use strict';

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var buzz = {
    defaults: {
      autoplay: false,
      duration: 5e3,
      formats: [],
      loop: false,
      placeholder: '--',
      preload: 'metadata',
      volume: 80,
      webAudioApi: false,
      document: window.document
    },
    types: {
      mp3: 'audio/mpeg',
      ogg: 'audio/ogg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      m4a: 'audio/x-m4a'
    },
    sounds: [],
    el: document.createElement('audio'),
    getAudioContext: function getAudioContext() {
      if (this.audioCtx === undefined) {
        try {
          this.audioCtx = AudioContext ? new AudioContext() : null;
        } catch (e) {
          this.audioCtx = null;
        }
      }
      return this.audioCtx;
    },
    sound: function sound(src, options) {
      options = options || {};
      var doc = options.document || buzz.defaults.document;
      var pid = 0,
        events = [],
        eventsOnce = {},
        supported = buzz.isSupported();
      this.load = function () {
        if (!supported) {
          return this;
        }
        this.sound.load();
        return this;
      };
      this.play = function () {
        if (!supported) {
          return this;
        }
        this.sound.play();
        return this;
      };
      this.togglePlay = function () {
        if (!supported) {
          return this;
        }
        if (this.sound.paused) {
          this.sound.play();
        } else {
          this.sound.pause();
        }
        return this;
      };
      this.pause = function () {
        if (!supported) {
          return this;
        }
        this.sound.pause();
        return this;
      };
      this.isPaused = function () {
        if (!supported) {
          return null;
        }
        return this.sound.paused;
      };
      this.stop = function () {
        if (!supported) {
          return this;
        }
        this.setTime(0);
        this.sound.pause();
        return this;
      };
      this.isEnded = function () {
        if (!supported) {
          return null;
        }
        return this.sound.ended;
      };
      this.loop = function () {
        if (!supported) {
          return this;
        }
        this.sound.loop = 'loop';
        this.bind('ended.buzzloop', function () {
          this.currentTime = 0;
          this.play();
        });
        return this;
      };
      this.unloop = function () {
        if (!supported) {
          return this;
        }
        this.sound.removeAttribute('loop');
        this.unbind('ended.buzzloop');
        return this;
      };
      this.mute = function () {
        if (!supported) {
          return this;
        }
        this.sound.muted = true;
        return this;
      };
      this.unmute = function () {
        if (!supported) {
          return this;
        }
        this.sound.muted = false;
        return this;
      };
      this.toggleMute = function () {
        if (!supported) {
          return this;
        }
        this.sound.muted = !this.sound.muted;
        return this;
      };
      this.isMuted = function () {
        if (!supported) {
          return null;
        }
        return this.sound.muted;
      };
      this.setVolume = function (volume) {
        if (!supported) {
          return this;
        }
        if (volume < 0) {
          volume = 0;
        }
        if (volume > 100) {
          volume = 100;
        }
        this.volume = volume;
        this.sound.volume = volume / 100;
        return this;
      };
      this.getVolume = function () {
        if (!supported) {
          return this;
        }
        return this.volume;
      };
      this.increaseVolume = function (value) {
        return this.setVolume(this.volume + (value || 1));
      };
      this.decreaseVolume = function (value) {
        return this.setVolume(this.volume - (value || 1));
      };
      this.setTime = function (time) {
        if (!supported) {
          return this;
        }
        var set = true;
        this.whenReady(function () {
          if (set === true) {
            set = false;
            this.sound.currentTime = time;
          }
        });
        return this;
      };
      this.getTime = function () {
        if (!supported) {
          return null;
        }
        var time = Math.round(this.sound.currentTime * 100) / 100;
        return isNaN(time) ? buzz.defaults.placeholder : time;
      };
      this.setPercent = function (percent) {
        if (!supported) {
          return this;
        }
        return this.setTime(buzz.fromPercent(percent, this.sound.duration));
      };
      this.getPercent = function () {
        if (!supported) {
          return null;
        }
        var percent = Math.round(buzz.toPercent(this.sound.currentTime, this.sound.duration));
        return isNaN(percent) ? buzz.defaults.placeholder : percent;
      };
      this.setSpeed = function (duration) {
        if (!supported) {
          return this;
        }
        this.sound.playbackRate = duration;
        return this;
      };
      this.getSpeed = function () {
        if (!supported) {
          return null;
        }
        return this.sound.playbackRate;
      };
      this.getDuration = function () {
        if (!supported) {
          return null;
        }
        var duration = Math.round(this.sound.duration * 100) / 100;
        return isNaN(duration) ? buzz.defaults.placeholder : duration;
      };
      this.getPlayed = function () {
        if (!supported) {
          return null;
        }
        return timerangeToArray(this.sound.played);
      };
      this.getBuffered = function () {
        if (!supported) {
          return null;
        }
        return timerangeToArray(this.sound.buffered);
      };
      this.getSeekable = function () {
        if (!supported) {
          return null;
        }
        return timerangeToArray(this.sound.seekable);
      };
      this.getErrorCode = function () {
        if (supported && this.sound.error) {
          return this.sound.error.code;
        }
        return 0;
      };
      this.getErrorMessage = function () {
        if (!supported) {
          return null;
        }
        switch (this.getErrorCode()) {
          case 1:
            return 'MEDIA_ERR_ABORTED';
          case 2:
            return 'MEDIA_ERR_NETWORK';
          case 3:
            return 'MEDIA_ERR_DECODE';
          case 4:
            return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
          default:
            return null;
        }
      };
      this.getStateCode = function () {
        if (!supported) {
          return null;
        }
        return this.sound.readyState;
      };
      this.getStateMessage = function () {
        if (!supported) {
          return null;
        }
        switch (this.getStateCode()) {
          case 0:
            return 'HAVE_NOTHING';
          case 1:
            return 'HAVE_METADATA';
          case 2:
            return 'HAVE_CURRENT_DATA';
          case 3:
            return 'HAVE_FUTURE_DATA';
          case 4:
            return 'HAVE_ENOUGH_DATA';
          default:
            return null;
        }
      };
      this.getNetworkStateCode = function () {
        if (!supported) {
          return null;
        }
        return this.sound.networkState;
      };
      this.getNetworkStateMessage = function () {
        if (!supported) {
          return null;
        }
        switch (this.getNetworkStateCode()) {
          case 0:
            return 'NETWORK_EMPTY';
          case 1:
            return 'NETWORK_IDLE';
          case 2:
            return 'NETWORK_LOADING';
          case 3:
            return 'NETWORK_NO_SOURCE';
          default:
            return null;
        }
      };
      this.set = function (key, value) {
        if (!supported) {
          return this;
        }
        this.sound[key] = value;
        return this;
      };
      this.get = function (key) {
        if (!supported) {
          return null;
        }
        return key ? this.sound[key] : this.sound;
      };
      this.bind = function (types, func) {
        if (!supported) {
          return this;
        }
        types = types.split(' ');
        var self = this,
          efunc = function efunc(e) {
            func.call(self, e);
          };
        for (var t = 0; t < types.length; t++) {
          var type = types[t],
            idx = type;
          type = idx.split('.')[0];
          events.push({
            idx: idx,
            func: efunc
          });
          this.sound.addEventListener(type, efunc, true);
        }
        return this;
      };
      this.unbind = function (types) {
        if (!supported) {
          return this;
        }
        types = types.split(' ');
        for (var t = 0; t < types.length; t++) {
          var idx = types[t],
            type = idx.split('.')[0];
          for (var i = 0; i < events.length; i++) {
            var namespace = events[i].idx.split('.');
            if (events[i].idx === idx || namespace[1] && namespace[1] === idx.replace('.', '')) {
              this.sound.removeEventListener(type, events[i].func, true);
              events.splice(i, 1);
            }
          }
        }
        return this;
      };
      this.bindOnce = function (type, func) {
        if (!supported) {
          return this;
        }
        var self = this;
        eventsOnce[pid++] = false;
        this.bind(type + '.' + pid, function () {
          if (!eventsOnce[pid]) {
            eventsOnce[pid] = true;
            func.call(self);
          }
          self.unbind(type + '.' + pid);
        });
        return this;
      };
      this.trigger = function (types, detail) {
        if (!supported) {
          return this;
        }
        types = types.split(' ');
        for (var t = 0; t < types.length; t++) {
          var idx = types[t];
          for (var i = 0; i < events.length; i++) {
            var eventType = events[i].idx.split('.');
            if (events[i].idx === idx || eventType[0] && eventType[0] === idx.replace('.', '')) {
              var evt = doc.createEvent('HTMLEvents');
              evt.initEvent(eventType[0], false, true);
              evt.originalEvent = detail;
              this.sound.dispatchEvent(evt);
            }
          }
        }
        return this;
      };
      this.fadeTo = function (to, duration, callback) {
        if (!supported) {
          return this;
        }
        if (duration instanceof Function) {
          callback = duration;
          duration = buzz.defaults.duration;
        } else {
          duration = duration || buzz.defaults.duration;
        }
        var from = this.volume,
          delay = duration / Math.abs(from - to),
          self = this;
        this.play();
        function doFade() {
          setTimeout(function () {
            if (from < to && self.volume < to) {
              self.setVolume(self.volume += 1);
              doFade();
            } else if (from > to && self.volume > to) {
              self.setVolume(self.volume -= 1);
              doFade();
            } else if (callback instanceof Function) {
              callback.apply(self);
            }
          }, delay);
        }
        this.whenReady(function () {
          doFade();
        });
        return this;
      };
      this.fadeIn = function (duration, callback) {
        if (!supported) {
          return this;
        }
        return this.setVolume(0).fadeTo(100, duration, callback);
      };
      this.fadeOut = function (duration, callback) {
        if (!supported) {
          return this;
        }
        return this.fadeTo(0, duration, callback);
      };
      this.fadeWith = function (sound, duration) {
        if (!supported) {
          return this;
        }
        this.fadeOut(duration, function () {
          this.stop();
        });
        sound.play().fadeIn(duration);
        return this;
      };
      this.whenReady = function (func) {
        if (!supported) {
          return null;
        }
        var self = this;
        if (this.sound.readyState === 0) {
          this.bind('canplay.buzzwhenready', function () {
            func.call(self);
          });
        } else {
          func.call(self);
        }
      };
      this.addSource = function (src) {
        var self = this,
          source = doc.createElement('source');
        source.src = src;
        if (buzz.types[getExt(src)]) {
          source.type = buzz.types[getExt(src)];
        }
        this.sound.appendChild(source);
        source.addEventListener('error', function (e) {
          self.sound.networkState = 3;
          self.trigger('sourceerror', e);
        });
        return source;
      };
      function timerangeToArray(timeRange) {
        var array = [],
          length = timeRange.length - 1;
        for (var i = 0; i <= length; i++) {
          array.push({
            start: timeRange.start(i),
            end: timeRange.end(i)
          });
        }
        return array;
      }
      function getExt(filename) {
        return filename.split('.').pop();
      }
      if (supported && src) {
        for (var i in buzz.defaults) {
          if (buzz.defaults.hasOwnProperty(i)) {
            if (options[i] === undefined) {
              options[i] = buzz.defaults[i];
            }
          }
        }
        this.sound = doc.createElement('audio');
        if (options.webAudioApi) {
          var audioCtx = buzz.getAudioContext();
          if (audioCtx) {
            this.source = audioCtx.createMediaElementSource(this.sound);
            this.source.connect(audioCtx.destination);
          }
        }
        if (src instanceof Array) {
          for (var j in src) {
            if (src.hasOwnProperty(j)) {
              this.addSource(src[j]);
            }
          }
        } else if (options.formats.length) {
          for (var k in options.formats) {
            if (options.formats.hasOwnProperty(k)) {
              this.addSource(src + '.' + options.formats[k]);
            }
          }
        } else {
          this.addSource(src);
        }
        if (options.loop) {
          this.loop();
        }
        if (options.autoplay) {
          this.sound.autoplay = 'autoplay';
        }
        if (options.preload === true) {
          this.sound.preload = 'auto';
        } else if (options.preload === false) {
          this.sound.preload = 'none';
        } else {
          this.sound.preload = options.preload;
        }
        this.setVolume(options.volume);
        buzz.sounds.push(this);
      }
    },
    group: function group(sounds) {
      sounds = argsToArray(sounds, arguments);
      this.getSounds = function () {
        return sounds;
      };
      this.add = function (soundArray) {
        soundArray = argsToArray(soundArray, arguments);
        for (var a = 0; a < soundArray.length; a++) {
          sounds.push(soundArray[a]);
        }
      };
      this.remove = function (soundArray) {
        soundArray = argsToArray(soundArray, arguments);
        for (var a = 0; a < soundArray.length; a++) {
          for (var i = 0; i < sounds.length; i++) {
            if (sounds[i] === soundArray[a]) {
              sounds.splice(i, 1);
              break;
            }
          }
        }
      };
      this.load = function () {
        fn('load');
        return this;
      };
      this.play = function () {
        fn('play');
        return this;
      };
      this.togglePlay = function () {
        fn('togglePlay');
        return this;
      };
      this.pause = function (time) {
        fn('pause', time);
        return this;
      };
      this.stop = function () {
        fn('stop');
        return this;
      };
      this.mute = function () {
        fn('mute');
        return this;
      };
      this.unmute = function () {
        fn('unmute');
        return this;
      };
      this.toggleMute = function () {
        fn('toggleMute');
        return this;
      };
      this.setVolume = function (volume) {
        fn('setVolume', volume);
        return this;
      };
      this.increaseVolume = function (value) {
        fn('increaseVolume', value);
        return this;
      };
      this.decreaseVolume = function (value) {
        fn('decreaseVolume', value);
        return this;
      };
      this.loop = function () {
        fn('loop');
        return this;
      };
      this.unloop = function () {
        fn('unloop');
        return this;
      };
      this.setSpeed = function (speed) {
        fn('setSpeed', speed);
        return this;
      };
      this.setTime = function (time) {
        fn('setTime', time);
        return this;
      };
      this.set = function (key, value) {
        fn('set', key, value);
        return this;
      };
      this.bind = function (type, func) {
        fn('bind', type, func);
        return this;
      };
      this.unbind = function (type) {
        fn('unbind', type);
        return this;
      };
      this.bindOnce = function (type, func) {
        fn('bindOnce', type, func);
        return this;
      };
      this.trigger = function (type) {
        fn('trigger', type);
        return this;
      };
      this.fade = function (from, to, duration, callback) {
        fn('fade', from, to, duration, callback);
        return this;
      };
      this.fadeIn = function (duration, callback) {
        fn('fadeIn', duration, callback);
        return this;
      };
      this.fadeOut = function (duration, callback) {
        fn('fadeOut', duration, callback);
        return this;
      };
      function fn() {
        var args = argsToArray(null, arguments),
          func = args.shift();
        for (var i = 0; i < sounds.length; i++) {
          sounds[i][func].apply(sounds[i], args);
        }
      }
      function argsToArray(array, args) {
        return array instanceof Array ? array : Array.prototype.slice.call(args);
      }
    },
    all: function all() {
      return new buzz.group(buzz.sounds);
    },
    isSupported: function isSupported() {
      return !!buzz.el.canPlayType;
    },
    isOGGSupported: function isOGGSupported() {
      return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/ogg; codecs="vorbis"');
    },
    isWAVSupported: function isWAVSupported() {
      return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/wav; codecs="1"');
    },
    isMP3Supported: function isMP3Supported() {
      return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/mpeg;');
    },
    isAACSupported: function isAACSupported() {
      return !!buzz.el.canPlayType && (buzz.el.canPlayType('audio/x-m4a;') || buzz.el.canPlayType('audio/aac;'));
    },
    toTimer: function toTimer(time, withHours) {
      var h, m, s;
      h = Math.floor(time / 3600);
      h = isNaN(h) ? '--' : h >= 10 ? h : '0' + h;
      m = withHours ? Math.floor(time / 60 % 60) : Math.floor(time / 60);
      m = isNaN(m) ? '--' : m >= 10 ? m : '0' + m;
      s = Math.floor(time % 60);
      s = isNaN(s) ? '--' : s >= 10 ? s : '0' + s;
      return withHours ? h + ':' + m + ':' + s : m + ':' + s;
    },
    fromTimer: function fromTimer(time) {
      var splits = time.toString().split(':');
      if (splits && splits.length === 3) {
        time = parseInt(splits[0], 10) * 3600 + parseInt(splits[1], 10) * 60 + parseInt(splits[2], 10);
      }
      if (splits && splits.length === 2) {
        time = parseInt(splits[0], 10) * 60 + parseInt(splits[1], 10);
      }
      return time;
    },
    toPercent: function toPercent(value, total, decimal) {
      var r = Math.pow(10, decimal || 0);
      return Math.round(value * 100 / total * r) / r;
    },
    fromPercent: function fromPercent(percent, total, decimal) {
      var r = Math.pow(10, decimal || 0);
      return Math.round(total / 100 * percent * r) / r;
    }
  };
  return buzz;
});

/***/ }),

/***/ "./client/js/util/chance.js":
/*!**********************************!*\
  !*** ./client/js/util/chance.js ***!
  \**********************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
//  Chance.js 0.7.6
//  http://chancejs.com
//  (c) 2013 Victor Quinn
//  Chance may be freely distributed or modified under the MIT license.

(function () {
  // Constants
  var MAX_INT = 9007199254740992;
  var MIN_INT = -MAX_INT;
  var NUMBERS = '0123456789';
  var CHARS_LOWER = 'abcdefghijklmnopqrstuvwxyz';
  var CHARS_UPPER = CHARS_LOWER.toUpperCase();
  var HEX_POOL = NUMBERS + "abcdef";

  // Cached array helpers
  var slice = Array.prototype.slice;

  // Constructor
  function Chance(seed) {
    if (!(this instanceof Chance)) {
      return seed == null ? new Chance() : new Chance(seed);
    }

    // if user has provided a function, use that as the generator
    if (typeof seed === 'function') {
      this.random = seed;
      return this;
    }
    var seedling;
    if (arguments.length) {
      // set a starting value of zero so we can add to it
      this.seed = 0;
    }
    // otherwise, leave this.seed blank so that MT will recieve a blank

    for (var i = 0; i < arguments.length; i++) {
      seedling = 0;
      if (typeof arguments[i] === 'string') {
        for (var j = 0; j < arguments[i].length; j++) {
          seedling += (arguments[i].length - j) * arguments[i].charCodeAt(j);
        }
      } else {
        seedling = arguments[i];
      }
      this.seed += (arguments.length - i) * seedling;
    }

    // If no generator function was provided, use our MT
    this.mt = this.mersenne_twister(this.seed);
    this.bimd5 = this.blueimp_md5();
    this.random = function () {
      return this.mt.random(this.seed);
    };
    return this;
  }
  Chance.prototype.VERSION = "0.7.6";

  // Random helper functions
  function initOptions(options, defaults) {
    options || (options = {});
    if (defaults) {
      for (var i in defaults) {
        if (typeof options[i] === 'undefined') {
          options[i] = defaults[i];
        }
      }
    }
    return options;
  }
  function testRange(test, errorMessage) {
    if (test) {
      throw new RangeError(errorMessage);
    }
  }

  /**
   * Encode the input string with Base64.
   */
  var base64 = function base64() {
    throw new Error('No Base64 encoder available.');
  };

  // Select proper Base64 encoder.
  (function determineBase64Encoder() {
    if (typeof btoa === 'function') {
      base64 = btoa;
    } else if (typeof Buffer === 'function') {
      base64 = function base64(input) {
        return new Buffer(input).toString('base64');
      };
    }
  })();

  // -- Basics --

  /**
   *  Return a random bool, either true or false
   *
   *  @param {Object} [options={ likelihood: 50 }] alter the likelihood of
   *    receiving a true or false value back.
   *  @throws {RangeError} if the likelihood is out of bounds
   *  @returns {Bool} either true or false
   */
  Chance.prototype.bool = function (options) {
    // likelihood of success (true)
    options = initOptions(options, {
      likelihood: 50
    });

    // Note, we could get some minor perf optimizations by checking range
    // prior to initializing defaults, but that makes code a bit messier
    // and the check more complicated as we have to check existence of
    // the object then existence of the key before checking constraints.
    // Since the options initialization should be minor computationally,
    // decision made for code cleanliness intentionally. This is mentioned
    // here as it's the first occurrence, will not be mentioned again.
    testRange(options.likelihood < 0 || options.likelihood > 100, "Chance: Likelihood accepts values from 0 to 100.");
    return this.random() * 100 < options.likelihood;
  };

  /**
   *  Return a random character.
   *
   *  @param {Object} [options={}] can specify a character pool, only alpha,
   *    only symbols, and casing (lower or upper)
   *  @returns {String} a single random character
   *  @throws {RangeError} Can only specify alpha or symbols, not both
   */
  Chance.prototype.character = function (options) {
    options = initOptions(options);
    testRange(options.alpha && options.symbols, "Chance: Cannot specify both alpha and symbols.");
    var symbols = "!@#$%^&*()[]",
      letters,
      pool;
    if (options.casing === 'lower') {
      letters = CHARS_LOWER;
    } else if (options.casing === 'upper') {
      letters = CHARS_UPPER;
    } else {
      letters = CHARS_LOWER + CHARS_UPPER;
    }
    if (options.pool) {
      pool = options.pool;
    } else if (options.alpha) {
      pool = letters;
    } else if (options.symbols) {
      pool = symbols;
    } else {
      pool = letters + NUMBERS + symbols;
    }
    return pool.charAt(this.natural({
      max: pool.length - 1
    }));
  };

  // Note, wanted to use "float" or "double" but those are both JS reserved words.

  // Note, fixed means N OR LESS digits after the decimal. This because
  // It could be 14.9000 but in JavaScript, when this is cast as a number,
  // the trailing zeroes are dropped. Left to the consumer if trailing zeroes are
  // needed
  /**
   *  Return a random floating point number
   *
   *  @param {Object} [options={}] can specify a fixed precision, min, max
   *  @returns {Number} a single floating point number
   *  @throws {RangeError} Can only specify fixed or precision, not both. Also
   *    min cannot be greater than max
   */
  Chance.prototype.floating = function (options) {
    options = initOptions(options, {
      fixed: 4
    });
    testRange(options.fixed && options.precision, "Chance: Cannot specify both fixed and precision.");
    var num;
    var fixed = Math.pow(10, options.fixed);
    var max = MAX_INT / fixed;
    var min = -max;
    testRange(options.min && options.fixed && options.min < min, "Chance: Min specified is out of range with fixed. Min should be, at least, " + min);
    testRange(options.max && options.fixed && options.max > max, "Chance: Max specified is out of range with fixed. Max should be, at most, " + max);
    options = initOptions(options, {
      min: min,
      max: max
    });

    // Todo - Make this work!
    // options.precision = (typeof options.precision !== "undefined") ? options.precision : false;

    num = this.integer({
      min: options.min * fixed,
      max: options.max * fixed
    });
    var num_fixed = (num / fixed).toFixed(options.fixed);
    return parseFloat(num_fixed);
  };

  /**
   *  Return a random integer
   *
   *  NOTE the max and min are INCLUDED in the range. So:
   *  chance.integer({min: 1, max: 3});
   *  would return either 1, 2, or 3.
   *
   *  @param {Object} [options={}] can specify a min and/or max
   *  @returns {Number} a single random integer number
   *  @throws {RangeError} min cannot be greater than max
   */
  Chance.prototype.integer = function (options) {
    // 9007199254740992 (2^53) is the max integer number in JavaScript
    // See: http://vq.io/132sa2j
    options = initOptions(options, {
      min: MIN_INT,
      max: MAX_INT
    });
    testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
    return Math.floor(this.random() * (options.max - options.min + 1) + options.min);
  };

  /**
   *  Return a random natural
   *
   *  NOTE the max and min are INCLUDED in the range. So:
   *  chance.natural({min: 1, max: 3});
   *  would return either 1, 2, or 3.
   *
   *  @param {Object} [options={}] can specify a min and/or max
   *  @returns {Number} a single random integer number
   *  @throws {RangeError} min cannot be greater than max
   */
  Chance.prototype.natural = function (options) {
    options = initOptions(options, {
      min: 0,
      max: MAX_INT
    });
    testRange(options.min < 0, "Chance: Min cannot be less than zero.");
    return this.integer(options);
  };

  /**
   *  Return a random string
   *
   *  @param {Object} [options={}] can specify a length
   *  @returns {String} a string of random length
   *  @throws {RangeError} length cannot be less than zero
   */
  Chance.prototype.string = function (options) {
    options = initOptions(options, {
      length: this.natural({
        min: 5,
        max: 20
      })
    });
    testRange(options.length < 0, "Chance: Length cannot be less than zero.");
    var length = options.length,
      text = this.n(this.character, length, options);
    return text.join("");
  };

  // -- End Basics --

  // -- Helpers --

  Chance.prototype.capitalize = function (word) {
    return word.charAt(0).toUpperCase() + word.substr(1);
  };
  Chance.prototype.mixin = function (obj) {
    for (var func_name in obj) {
      Chance.prototype[func_name] = obj[func_name];
    }
    return this;
  };

  /**
   *  Given a function that generates something random and a number of items to generate,
   *    return an array of items where none repeat.
   *
   *  @param {Function} fn the function that generates something random
   *  @param {Number} num number of terms to generate
   *  @param {Object} options any options to pass on to the generator function
   *  @returns {Array} an array of length `num` with every item generated by `fn` and unique
   *
   *  There can be more parameters after these. All additional parameters are provided to the given function
   */
  Chance.prototype.unique = function (fn, num, options) {
    testRange(typeof fn !== "function", "Chance: The first argument must be a function.");
    options = initOptions(options, {
      // Default comparator to check that val is not already in arr.
      // Should return `false` if item not in array, `true` otherwise
      comparator: function comparator(arr, val) {
        return arr.indexOf(val) !== -1;
      }
    });
    var arr = [],
      count = 0,
      result,
      MAX_DUPLICATES = num * 50,
      params = slice.call(arguments, 2);
    while (arr.length < num) {
      result = fn.apply(this, params);
      if (!options.comparator(arr, result)) {
        arr.push(result);
        // reset count when unique found
        count = 0;
      }
      if (++count > MAX_DUPLICATES) {
        throw new RangeError("Chance: num is likely too large for sample set");
      }
    }
    return arr;
  };

  /**
   *  Gives an array of n random terms
   *
   *  @param {Function} fn the function that generates something random
   *  @param {Number} n number of terms to generate
   *  @returns {Array} an array of length `n` with items generated by `fn`
   *
   *  There can be more parameters after these. All additional parameters are provided to the given function
   */
  Chance.prototype.n = function (fn, n) {
    testRange(typeof fn !== "function", "Chance: The first argument must be a function.");
    if (typeof n === 'undefined') {
      n = 1;
    }
    var i = n,
      arr = [],
      params = slice.call(arguments, 2);

    // Providing a negative count should result in a noop.
    i = Math.max(0, i);
    for (null; i--; null) {
      arr.push(fn.apply(this, params));
    }
    return arr;
  };

  // H/T to SO for this one: http://vq.io/OtUrZ5
  Chance.prototype.pad = function (number, width, pad) {
    // Default pad to 0 if none provided
    pad = pad || '0';
    // Convert number to a string
    number = number + '';
    return number.length >= width ? number : new Array(width - number.length + 1).join(pad) + number;
  };
  Chance.prototype.pick = function (arr, count) {
    if (arr.length === 0) {
      throw new RangeError("Chance: Cannot pick() from an empty array");
    }
    if (!count || count === 1) {
      return arr[this.natural({
        max: arr.length - 1
      })];
    } else {
      return this.shuffle(arr).slice(0, count);
    }
  };
  Chance.prototype.shuffle = function (arr) {
    var old_array = arr.slice(0),
      new_array = [],
      j = 0,
      length = Number(old_array.length);
    for (var i = 0; i < length; i++) {
      // Pick a random index from the array
      j = this.natural({
        max: old_array.length - 1
      });
      // Add it to the new array
      new_array[i] = old_array[j];
      // Remove that element from the original array
      old_array.splice(j, 1);
    }
    return new_array;
  };

  // Returns a single item from an array with relative weighting of odds
  Chance.prototype.weighted = function (arr, weights) {
    if (arr.length !== weights.length) {
      throw new RangeError("Chance: length of array and weights must match");
    }

    // Handle weights that are less or equal to zero.
    for (var weightIndex = weights.length - 1; weightIndex >= 0; --weightIndex) {
      // If the weight is less or equal to zero, remove it and the value.
      if (weights[weightIndex] <= 0) {
        arr.splice(weightIndex, 1);
        weights.splice(weightIndex, 1);
      }
    }

    // If any of the weights are less than 1, we want to scale them up to whole
    //   numbers for the rest of this logic to work
    if (weights.some(function (weight) {
      return weight < 1;
    })) {
      var min = weights.reduce(function (min, weight) {
        return weight < min ? weight : min;
      }, weights[0]);
      var scaling_factor = 1 / min;
      weights = weights.map(function (weight) {
        return weight * scaling_factor;
      });
    }
    var sum = weights.reduce(function (total, weight) {
      return total + weight;
    }, 0);

    // get an index
    var selected = this.natural({
      min: 1,
      max: sum
    });
    var total = 0;
    var chosen;
    // Using some() here so we can bail as soon as we get our match
    weights.some(function (weight, index) {
      if (selected <= total + weight) {
        chosen = arr[index];
        return true;
      }
      total += weight;
      return false;
    });
    return chosen;
  };

  // -- End Helpers --

  // -- Text --

  Chance.prototype.paragraph = function (options) {
    options = initOptions(options);
    var sentences = options.sentences || this.natural({
        min: 3,
        max: 7
      }),
      sentence_array = this.n(this.sentence, sentences);
    return sentence_array.join(' ');
  };

  // Could get smarter about this than generating random words and
  // chaining them together. Such as: http://vq.io/1a5ceOh
  Chance.prototype.sentence = function (options) {
    options = initOptions(options);
    var words = options.words || this.natural({
        min: 12,
        max: 18
      }),
      text,
      word_array = this.n(this.word, words);
    text = word_array.join(' ');

    // Capitalize first letter of sentence, add period at end
    text = this.capitalize(text) + '.';
    return text;
  };
  Chance.prototype.syllable = function (options) {
    options = initOptions(options);
    var length = options.length || this.natural({
        min: 2,
        max: 3
      }),
      consonants = 'bcdfghjklmnprstvwz',
      // consonants except hard to speak ones
      vowels = 'aeiou',
      // vowels
      all = consonants + vowels,
      // all
      text = '',
      chr;

    // I'm sure there's a more elegant way to do this, but this works
    // decently well.
    for (var i = 0; i < length; i++) {
      if (i === 0) {
        // First character can be anything
        chr = this.character({
          pool: all
        });
      } else if (consonants.indexOf(chr) === -1) {
        // Last character was a vowel, now we want a consonant
        chr = this.character({
          pool: consonants
        });
      } else {
        // Last character was a consonant, now we want a vowel
        chr = this.character({
          pool: vowels
        });
      }
      text += chr;
    }
    return text;
  };
  Chance.prototype.word = function (options) {
    options = initOptions(options);
    testRange(options.syllables && options.length, "Chance: Cannot specify both syllables AND length.");
    var syllables = options.syllables || this.natural({
        min: 1,
        max: 3
      }),
      text = '';
    if (options.length) {
      // Either bound word by length
      do {
        text += this.syllable();
      } while (text.length < options.length);
      text = text.substring(0, options.length);
    } else {
      // Or by number of syllables
      for (var i = 0; i < syllables; i++) {
        text += this.syllable();
      }
    }
    return text;
  };

  // -- End Text --

  // -- Person --

  Chance.prototype.age = function (options) {
    options = initOptions(options);
    var ageRange;
    switch (options.type) {
      case 'child':
        ageRange = {
          min: 1,
          max: 12
        };
        break;
      case 'teen':
        ageRange = {
          min: 13,
          max: 19
        };
        break;
      case 'adult':
        ageRange = {
          min: 18,
          max: 65
        };
        break;
      case 'senior':
        ageRange = {
          min: 65,
          max: 100
        };
        break;
      case 'all':
        ageRange = {
          min: 1,
          max: 100
        };
        break;
      default:
        ageRange = {
          min: 18,
          max: 65
        };
        break;
    }
    return this.natural(ageRange);
  };
  Chance.prototype.birthday = function (options) {
    options = initOptions(options, {
      year: new Date().getFullYear() - this.age(options)
    });
    return this.date(options);
  };

  // CPF; ID to identify taxpayers in Brazil
  Chance.prototype.cpf = function () {
    var n = this.n(this.natural, 9, {
      max: 9
    });
    var d1 = n[8] * 2 + n[7] * 3 + n[6] * 4 + n[5] * 5 + n[4] * 6 + n[3] * 7 + n[2] * 8 + n[1] * 9 + n[0] * 10;
    d1 = 11 - d1 % 11;
    if (d1 >= 10) {
      d1 = 0;
    }
    var d2 = d1 * 2 + n[8] * 3 + n[7] * 4 + n[6] * 5 + n[5] * 6 + n[4] * 7 + n[3] * 8 + n[2] * 9 + n[1] * 10 + n[0] * 11;
    d2 = 11 - d2 % 11;
    if (d2 >= 10) {
      d2 = 0;
    }
    return '' + n[0] + n[1] + n[2] + '.' + n[3] + n[4] + n[5] + '.' + n[6] + n[7] + n[8] + '-' + d1 + d2;
  };
  Chance.prototype.first = function (options) {
    options = initOptions(options, {
      gender: this.gender()
    });
    return this.pick(this.get("firstNames")[options.gender.toLowerCase()]);
  };
  Chance.prototype.gender = function () {
    return this.pick(['Male', 'Female']);
  };
  Chance.prototype.last = function () {
    return this.pick(this.get("lastNames"));
  };
  Chance.prototype.mrz = function (options) {
    var checkDigit = function checkDigit(input) {
      var alpha = "<ABCDEFGHIJKLMNOPQRSTUVWXYXZ".split(''),
        multipliers = [7, 3, 1],
        runningTotal = 0;
      if (typeof input !== 'string') {
        input = input.toString();
      }
      input.split('').forEach(function (character, idx) {
        var pos = alpha.indexOf(character);
        if (pos !== -1) {
          character = pos === 0 ? 0 : pos + 9;
        } else {
          character = parseInt(character, 10);
        }
        character *= multipliers[idx % multipliers.length];
        runningTotal += character;
      });
      return runningTotal % 10;
    };
    var generate = function generate(opts) {
      var pad = function pad(length) {
        return new Array(length + 1).join('<');
      };
      var number = ['P<', opts.issuer, opts.last.toUpperCase(), '<<', opts.first.toUpperCase(), pad(39 - (opts.last.length + opts.first.length + 2)), opts.passportNumber, checkDigit(opts.passportNumber), opts.nationality, opts.dob, checkDigit(opts.dob), opts.gender, opts.expiry, checkDigit(opts.expiry), pad(14), checkDigit(pad(14))].join('');
      return number + checkDigit(number.substr(44, 10) + number.substr(57, 7) + number.substr(65, 7));
    };
    var that = this;
    options = initOptions(options, {
      first: this.first(),
      last: this.last(),
      passportNumber: this.integer({
        min: 100000000,
        max: 999999999
      }),
      dob: function () {
        var date = that.birthday({
          type: 'adult'
        });
        return [date.getFullYear().toString().substr(2), that.pad(date.getMonth() + 1, 2), that.pad(date.getDate(), 2)].join('');
      }(),
      expiry: function () {
        var date = new Date();
        return [(date.getFullYear() + 5).toString().substr(2), that.pad(date.getMonth() + 1, 2), that.pad(date.getDate(), 2)].join('');
      }(),
      gender: this.gender() === 'Female' ? 'F' : 'M',
      issuer: 'GBR',
      nationality: 'GBR'
    });
    return generate(options);
  };
  Chance.prototype.name = function (options) {
    options = initOptions(options);
    var first = this.first(options),
      last = this.last(),
      name;
    if (options.middle) {
      name = first + ' ' + this.first(options) + ' ' + last;
    } else if (options.middle_initial) {
      name = first + ' ' + this.character({
        alpha: true,
        casing: 'upper'
      }) + '. ' + last;
    } else {
      name = first + ' ' + last;
    }
    if (options.prefix) {
      name = this.prefix(options) + ' ' + name;
    }
    if (options.suffix) {
      name = name + ' ' + this.suffix(options);
    }
    return name;
  };

  // Return the list of available name prefixes based on supplied gender.
  Chance.prototype.name_prefixes = function (gender) {
    gender = gender || "all";
    gender = gender.toLowerCase();
    var prefixes = [{
      name: 'Doctor',
      abbreviation: 'Dr.'
    }];
    if (gender === "male" || gender === "all") {
      prefixes.push({
        name: 'Mister',
        abbreviation: 'Mr.'
      });
    }
    if (gender === "female" || gender === "all") {
      prefixes.push({
        name: 'Miss',
        abbreviation: 'Miss'
      });
      prefixes.push({
        name: 'Misses',
        abbreviation: 'Mrs.'
      });
    }
    return prefixes;
  };

  // Alias for name_prefix
  Chance.prototype.prefix = function (options) {
    return this.name_prefix(options);
  };
  Chance.prototype.name_prefix = function (options) {
    options = initOptions(options, {
      gender: "all"
    });
    return options.full ? this.pick(this.name_prefixes(options.gender)).name : this.pick(this.name_prefixes(options.gender)).abbreviation;
  };
  Chance.prototype.ssn = function (options) {
    options = initOptions(options, {
      ssnFour: false,
      dashes: true
    });
    var ssn_pool = "1234567890",
      ssn,
      dash = options.dashes ? '-' : '';
    if (!options.ssnFour) {
      ssn = this.string({
        pool: ssn_pool,
        length: 3
      }) + dash + this.string({
        pool: ssn_pool,
        length: 2
      }) + dash + this.string({
        pool: ssn_pool,
        length: 4
      });
    } else {
      ssn = this.string({
        pool: ssn_pool,
        length: 4
      });
    }
    return ssn;
  };

  // Return the list of available name suffixes
  Chance.prototype.name_suffixes = function () {
    var suffixes = [{
      name: 'Doctor of Osteopathic Medicine',
      abbreviation: 'D.O.'
    }, {
      name: 'Doctor of Philosophy',
      abbreviation: 'Ph.D.'
    }, {
      name: 'Esquire',
      abbreviation: 'Esq.'
    }, {
      name: 'Junior',
      abbreviation: 'Jr.'
    }, {
      name: 'Juris Doctor',
      abbreviation: 'J.D.'
    }, {
      name: 'Master of Arts',
      abbreviation: 'M.A.'
    }, {
      name: 'Master of Business Administration',
      abbreviation: 'M.B.A.'
    }, {
      name: 'Master of Science',
      abbreviation: 'M.S.'
    }, {
      name: 'Medical Doctor',
      abbreviation: 'M.D.'
    }, {
      name: 'Senior',
      abbreviation: 'Sr.'
    }, {
      name: 'The Third',
      abbreviation: 'III'
    }, {
      name: 'The Fourth',
      abbreviation: 'IV'
    }, {
      name: 'Bachelor of Engineering',
      abbreviation: 'B.E'
    }, {
      name: 'Bachelor of Technology',
      abbreviation: 'B.TECH'
    }];
    return suffixes;
  };

  // Alias for name_suffix
  Chance.prototype.suffix = function (options) {
    return this.name_suffix(options);
  };
  Chance.prototype.name_suffix = function (options) {
    options = initOptions(options);
    return options.full ? this.pick(this.name_suffixes()).name : this.pick(this.name_suffixes()).abbreviation;
  };

  // -- End Person --

  // -- Mobile --
  // Android GCM Registration ID
  Chance.prototype.android_id = function () {
    return "APA91" + this.string({
      pool: "0123456789abcefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_",
      length: 178
    });
  };

  // Apple Push Token
  Chance.prototype.apple_token = function () {
    return this.string({
      pool: "abcdef1234567890",
      length: 64
    });
  };

  // Windows Phone 8 ANID2
  Chance.prototype.wp8_anid2 = function () {
    return base64(this.hash({
      length: 32
    }));
  };

  // Windows Phone 7 ANID
  Chance.prototype.wp7_anid = function () {
    return 'A=' + this.guid().replace(/-/g, '').toUpperCase() + '&E=' + this.hash({
      length: 3
    }) + '&W=' + this.integer({
      min: 0,
      max: 9
    });
  };

  // BlackBerry Device PIN
  Chance.prototype.bb_pin = function () {
    return this.hash({
      length: 8
    });
  };

  // -- End Mobile --

  // -- Web --
  Chance.prototype.avatar = function (options) {
    var url = null;
    var URL_BASE = '//www.gravatar.com/avatar/';
    var PROTOCOLS = {
      http: 'http',
      https: 'https'
    };
    var FILE_TYPES = {
      bmp: 'bmp',
      gif: 'gif',
      jpg: 'jpg',
      png: 'png'
    };
    var FALLBACKS = {
      '404': '404',
      // Return 404 if not found
      mm: 'mm',
      // Mystery man
      identicon: 'identicon',
      // Geometric pattern based on hash
      monsterid: 'monsterid',
      // A generated monster icon
      wavatar: 'wavatar',
      // A generated face
      retro: 'retro',
      // 8-bit icon
      blank: 'blank' // A transparent png
    };
    var RATINGS = {
      g: 'g',
      pg: 'pg',
      r: 'r',
      x: 'x'
    };
    var opts = {
      protocol: null,
      email: null,
      fileExtension: null,
      size: null,
      fallback: null,
      rating: null
    };
    if (!options) {
      // Set to a random email
      opts.email = this.email();
      options = {};
    } else if (typeof options === 'string') {
      opts.email = options;
      options = {};
    } else if (_typeof(options) !== 'object') {
      return null;
    } else if (options.constructor === 'Array') {
      return null;
    }
    opts = initOptions(options, opts);
    if (!opts.email) {
      // Set to a random email
      opts.email = this.email();
    }

    // Safe checking for params
    opts.protocol = PROTOCOLS[opts.protocol] ? opts.protocol + ':' : '';
    opts.size = parseInt(opts.size, 0) ? opts.size : '';
    opts.rating = RATINGS[opts.rating] ? opts.rating : '';
    opts.fallback = FALLBACKS[opts.fallback] ? opts.fallback : '';
    opts.fileExtension = FILE_TYPES[opts.fileExtension] ? opts.fileExtension : '';
    url = opts.protocol + URL_BASE + this.bimd5.md5(opts.email) + (opts.fileExtension ? '.' + opts.fileExtension : '') + (opts.size || opts.rating || opts.fallback ? '?' : '') + (opts.size ? '&s=' + opts.size.toString() : '') + (opts.rating ? '&r=' + opts.rating : '') + (opts.fallback ? '&d=' + opts.fallback : '');
    return url;
  };
  Chance.prototype.color = function (options) {
    function gray(value, delimiter) {
      return [value, value, value].join(delimiter || '');
    }
    options = initOptions(options, {
      format: this.pick(['hex', 'shorthex', 'rgb', 'rgba', '0x']),
      grayscale: false,
      casing: 'lower'
    });
    var isGrayscale = options.grayscale;
    var colorValue;
    if (options.format === 'hex') {
      colorValue = '#' + (isGrayscale ? gray(this.hash({
        length: 2
      })) : this.hash({
        length: 6
      }));
    } else if (options.format === 'shorthex') {
      colorValue = '#' + (isGrayscale ? gray(this.hash({
        length: 1
      })) : this.hash({
        length: 3
      }));
    } else if (options.format === 'rgb') {
      if (isGrayscale) {
        colorValue = 'rgb(' + gray(this.natural({
          max: 255
        }), ',') + ')';
      } else {
        colorValue = 'rgb(' + this.natural({
          max: 255
        }) + ',' + this.natural({
          max: 255
        }) + ',' + this.natural({
          max: 255
        }) + ')';
      }
    } else if (options.format === 'rgba') {
      if (isGrayscale) {
        colorValue = 'rgba(' + gray(this.natural({
          max: 255
        }), ',') + ',' + this.floating({
          min: 0,
          max: 1
        }) + ')';
      } else {
        colorValue = 'rgba(' + this.natural({
          max: 255
        }) + ',' + this.natural({
          max: 255
        }) + ',' + this.natural({
          max: 255
        }) + ',' + this.floating({
          min: 0,
          max: 1
        }) + ')';
      }
    } else if (options.format === '0x') {
      colorValue = '0x' + (isGrayscale ? gray(this.hash({
        length: 2
      })) : this.hash({
        length: 6
      }));
    } else {
      throw new RangeError('Invalid format provided. Please provide one of "hex", "shorthex", "rgb", "rgba", or "0x".');
    }
    if (options.casing === 'upper') {
      colorValue = colorValue.toUpperCase();
    }
    return colorValue;
  };
  Chance.prototype.domain = function (options) {
    options = initOptions(options);
    return this.word() + '.' + (options.tld || this.tld());
  };
  Chance.prototype.email = function (options) {
    options = initOptions(options);
    return this.word({
      length: options.length
    }) + '@' + (options.domain || this.domain());
  };
  Chance.prototype.fbid = function () {
    return parseInt('10000' + this.natural({
      max: 100000000000
    }), 10);
  };
  Chance.prototype.google_analytics = function () {
    var account = this.pad(this.natural({
      max: 999999
    }), 6);
    var property = this.pad(this.natural({
      max: 99
    }), 2);
    return 'UA-' + account + '-' + property;
  };
  Chance.prototype.hashtag = function () {
    return '#' + this.word();
  };
  Chance.prototype.ip = function () {
    // Todo: This could return some reserved IPs. See http://vq.io/137dgYy
    // this should probably be updated to account for that rare as it may be
    return this.natural({
      max: 255
    }) + '.' + this.natural({
      max: 255
    }) + '.' + this.natural({
      max: 255
    }) + '.' + this.natural({
      max: 255
    });
  };
  Chance.prototype.ipv6 = function () {
    var ip_addr = this.n(this.hash, 8, {
      length: 4
    });
    return ip_addr.join(":");
  };
  Chance.prototype.klout = function () {
    return this.natural({
      min: 1,
      max: 99
    });
  };
  Chance.prototype.tlds = function () {
    return ['com', 'org', 'edu', 'gov', 'co.uk', 'net', 'io'];
  };
  Chance.prototype.tld = function () {
    return this.pick(this.tlds());
  };
  Chance.prototype.twitter = function () {
    return '@' + this.word();
  };
  Chance.prototype.url = function (options) {
    options = initOptions(options, {
      protocol: "http",
      domain: this.domain(options),
      domain_prefix: "",
      path: this.word(),
      extensions: []
    });
    var extension = options.extensions.length > 0 ? "." + this.pick(options.extensions) : "";
    var domain = options.domain_prefix ? options.domain_prefix + "." + options.domain : options.domain;
    return options.protocol + "://" + domain + "/" + options.path + extension;
  };

  // -- End Web --

  // -- Location --

  Chance.prototype.address = function (options) {
    options = initOptions(options);
    return this.natural({
      min: 5,
      max: 2000
    }) + ' ' + this.street(options);
  };
  Chance.prototype.altitude = function (options) {
    options = initOptions(options, {
      fixed: 5,
      min: 0,
      max: 8848
    });
    return this.floating({
      min: options.min,
      max: options.max,
      fixed: options.fixed
    });
  };
  Chance.prototype.areacode = function (options) {
    options = initOptions(options, {
      parens: true
    });
    // Don't want area codes to start with 1, or have a 9 as the second digit
    var areacode = this.natural({
      min: 2,
      max: 9
    }).toString() + this.natural({
      min: 0,
      max: 8
    }).toString() + this.natural({
      min: 0,
      max: 9
    }).toString();
    return options.parens ? '(' + areacode + ')' : areacode;
  };
  Chance.prototype.city = function () {
    return this.capitalize(this.word({
      syllables: 3
    }));
  };
  Chance.prototype.coordinates = function (options) {
    return this.latitude(options) + ', ' + this.longitude(options);
  };
  Chance.prototype.countries = function () {
    return this.get("countries");
  };
  Chance.prototype.country = function (options) {
    options = initOptions(options);
    var country = this.pick(this.countries());
    return options.full ? country.name : country.abbreviation;
  };
  Chance.prototype.depth = function (options) {
    options = initOptions(options, {
      fixed: 5,
      min: -2550,
      max: 0
    });
    return this.floating({
      min: options.min,
      max: options.max,
      fixed: options.fixed
    });
  };
  Chance.prototype.geohash = function (options) {
    options = initOptions(options, {
      length: 7
    });
    return this.string({
      length: options.length,
      pool: '0123456789bcdefghjkmnpqrstuvwxyz'
    });
  };
  Chance.prototype.geojson = function (options) {
    return this.latitude(options) + ', ' + this.longitude(options) + ', ' + this.altitude(options);
  };
  Chance.prototype.latitude = function (options) {
    options = initOptions(options, {
      fixed: 5,
      min: -90,
      max: 90
    });
    return this.floating({
      min: options.min,
      max: options.max,
      fixed: options.fixed
    });
  };
  Chance.prototype.longitude = function (options) {
    options = initOptions(options, {
      fixed: 5,
      min: -180,
      max: 180
    });
    return this.floating({
      min: options.min,
      max: options.max,
      fixed: options.fixed
    });
  };
  Chance.prototype.phone = function (options) {
    var self = this,
      numPick,
      ukNum = function ukNum(parts) {
        var section = [];
        //fills the section part of the phone number with random numbers.
        parts.sections.forEach(function (n) {
          section.push(self.string({
            pool: '0123456789',
            length: n
          }));
        });
        return parts.area + section.join(' ');
      };
    options = initOptions(options, {
      formatted: true,
      country: 'us',
      mobile: false
    });
    if (!options.formatted) {
      options.parens = false;
    }
    var phone;
    switch (options.country) {
      case 'fr':
        if (!options.mobile) {
          numPick = this.pick([
          // Valid zone and département codes.
          '01' + this.pick(['30', '34', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '53', '55', '56', '58', '60', '64', '69', '70', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83']) + self.string({
            pool: '0123456789',
            length: 6
          }), '02' + this.pick(['14', '18', '22', '23', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '40', '41', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '56', '57', '61', '62', '69', '72', '76', '77', '78', '85', '90', '96', '97', '98', '99']) + self.string({
            pool: '0123456789',
            length: 6
          }), '03' + this.pick(['10', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '39', '44', '45', '51', '52', '54', '55', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90']) + self.string({
            pool: '0123456789',
            length: 6
          }), '04' + this.pick(['11', '13', '15', '20', '22', '26', '27', '30', '32', '34', '37', '42', '43', '44', '50', '56', '57', '63', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '88', '89', '90', '91', '92', '93', '94', '95', '97', '98']) + self.string({
            pool: '0123456789',
            length: 6
          }), '05' + this.pick(['08', '16', '17', '19', '24', '31', '32', '33', '34', '35', '40', '45', '46', '47', '49', '53', '55', '56', '57', '58', '59', '61', '62', '63', '64', '65', '67', '79', '81', '82', '86', '87', '90', '94']) + self.string({
            pool: '0123456789',
            length: 6
          }), '09' + self.string({
            pool: '0123456789',
            length: 8
          })]);
          phone = options.formatted ? numPick.match(/../g).join(' ') : numPick;
        } else {
          numPick = this.pick(['06', '07']) + self.string({
            pool: '0123456789',
            length: 8
          });
          phone = options.formatted ? numPick.match(/../g).join(' ') : numPick;
        }
        break;
      case 'uk':
        if (!options.mobile) {
          numPick = this.pick([
          //valid area codes of major cities/counties followed by random numbers in required format.
          {
            area: '01' + this.character({
              pool: '234569'
            }) + '1 ',
            sections: [3, 4]
          }, {
            area: '020 ' + this.character({
              pool: '378'
            }),
            sections: [3, 4]
          }, {
            area: '023 ' + this.character({
              pool: '89'
            }),
            sections: [3, 4]
          }, {
            area: '024 7',
            sections: [3, 4]
          }, {
            area: '028 ' + this.pick(['25', '28', '37', '71', '82', '90', '92', '95']),
            sections: [2, 4]
          }, {
            area: '012' + this.pick(['04', '08', '54', '76', '97', '98']) + ' ',
            sections: [5]
          }, {
            area: '013' + this.pick(['63', '64', '84', '86']) + ' ',
            sections: [5]
          }, {
            area: '014' + this.pick(['04', '20', '60', '61', '80', '88']) + ' ',
            sections: [5]
          }, {
            area: '015' + this.pick(['24', '27', '62', '66']) + ' ',
            sections: [5]
          }, {
            area: '016' + this.pick(['06', '29', '35', '47', '59', '95']) + ' ',
            sections: [5]
          }, {
            area: '017' + this.pick(['26', '44', '50', '68']) + ' ',
            sections: [5]
          }, {
            area: '018' + this.pick(['27', '37', '84', '97']) + ' ',
            sections: [5]
          }, {
            area: '019' + this.pick(['00', '05', '35', '46', '49', '63', '95']) + ' ',
            sections: [5]
          }]);
          phone = options.formatted ? ukNum(numPick) : ukNum(numPick).replace(' ', '', 'g');
        } else {
          numPick = this.pick([{
            area: '07' + this.pick(['4', '5', '7', '8', '9']),
            sections: [2, 6]
          }, {
            area: '07624 ',
            sections: [6]
          }]);
          phone = options.formatted ? ukNum(numPick) : ukNum(numPick).replace(' ', '');
        }
        break;
      case 'us':
        var areacode = this.areacode(options).toString();
        var exchange = this.natural({
          min: 2,
          max: 9
        }).toString() + this.natural({
          min: 0,
          max: 9
        }).toString() + this.natural({
          min: 0,
          max: 9
        }).toString();
        var subscriber = this.natural({
          min: 1000,
          max: 9999
        }).toString(); // this could be random [0-9]{4}
        phone = options.formatted ? areacode + ' ' + exchange + '-' + subscriber : areacode + exchange + subscriber;
    }
    return phone;
  };
  Chance.prototype.postal = function () {
    // Postal District
    var pd = this.character({
      pool: "XVTSRPNKLMHJGECBA"
    });
    // Forward Sortation Area (FSA)
    var fsa = pd + this.natural({
      max: 9
    }) + this.character({
      alpha: true,
      casing: "upper"
    });
    // Local Delivery Unut (LDU)
    var ldu = this.natural({
      max: 9
    }) + this.character({
      alpha: true,
      casing: "upper"
    }) + this.natural({
      max: 9
    });
    return fsa + " " + ldu;
  };
  Chance.prototype.provinces = function () {
    return this.get("provinces");
  };
  Chance.prototype.province = function (options) {
    return options && options.full ? this.pick(this.provinces()).name : this.pick(this.provinces()).abbreviation;
  };
  Chance.prototype.state = function (options) {
    return options && options.full ? this.pick(this.states(options)).name : this.pick(this.states(options)).abbreviation;
  };
  Chance.prototype.states = function (options) {
    options = initOptions(options);
    var states,
      us_states_and_dc = this.get("us_states_and_dc"),
      territories = this.get("territories"),
      armed_forces = this.get("armed_forces");
    states = us_states_and_dc;
    if (options.territories) {
      states = states.concat(territories);
    }
    if (options.armed_forces) {
      states = states.concat(armed_forces);
    }
    return states;
  };
  Chance.prototype.street = function (options) {
    options = initOptions(options);
    var street = this.word({
      syllables: 2
    });
    street = this.capitalize(street);
    street += ' ';
    street += options.short_suffix ? this.street_suffix().abbreviation : this.street_suffix().name;
    return street;
  };
  Chance.prototype.street_suffix = function () {
    return this.pick(this.street_suffixes());
  };
  Chance.prototype.street_suffixes = function () {
    // These are the most common suffixes.
    return this.get("street_suffixes");
  };

  // Note: only returning US zip codes, internationalization will be a whole
  // other beast to tackle at some point.
  Chance.prototype.zip = function (options) {
    var zip = this.n(this.natural, 5, {
      max: 9
    });
    if (options && options.plusfour === true) {
      zip.push('-');
      zip = zip.concat(this.n(this.natural, 4, {
        max: 9
      }));
    }
    return zip.join("");
  };

  // -- End Location --

  // -- Time

  Chance.prototype.ampm = function () {
    return this.bool() ? 'am' : 'pm';
  };
  Chance.prototype.date = function (options) {
    var date_string, date;

    // If interval is specified we ignore preset
    if (options && (options.min || options.max)) {
      options = initOptions(options, {
        american: true,
        string: false
      });
      var min = typeof options.min !== "undefined" ? options.min.getTime() : 1;
      // 100,000,000 days measured relative to midnight at the beginning of 01 January, 1970 UTC. http://es5.github.io/#x15.9.1.1
      var max = typeof options.max !== "undefined" ? options.max.getTime() : 8640000000000000;
      date = new Date(this.natural({
        min: min,
        max: max
      }));
    } else {
      var m = this.month({
        raw: true
      });
      var daysInMonth = m.days;
      if (options && options.month) {
        // Mod 12 to allow months outside range of 0-11 (not encouraged, but also not prevented).
        daysInMonth = this.get('months')[(options.month % 12 + 12) % 12].days;
      }
      options = initOptions(options, {
        year: parseInt(this.year(), 10),
        // Necessary to subtract 1 because Date() 0-indexes month but not day or year
        // for some reason.
        month: m.numeric - 1,
        day: this.natural({
          min: 1,
          max: daysInMonth
        }),
        hour: this.hour(),
        minute: this.minute(),
        second: this.second(),
        millisecond: this.millisecond(),
        american: true,
        string: false
      });
      date = new Date(options.year, options.month, options.day, options.hour, options.minute, options.second, options.millisecond);
    }
    if (options.american) {
      // Adding 1 to the month is necessary because Date() 0-indexes
      // months but not day for some odd reason.
      date_string = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
    } else {
      date_string = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }
    return options.string ? date_string : date;
  };
  Chance.prototype.hammertime = function (options) {
    return this.date(options).getTime();
  };
  Chance.prototype.hour = function (options) {
    options = initOptions(options, {
      min: 1,
      max: options && options.twentyfour ? 24 : 12
    });
    testRange(options.min < 1, "Chance: Min cannot be less than 1.");
    testRange(options.twentyfour && options.max > 24, "Chance: Max cannot be greater than 24 for twentyfour option.");
    testRange(!options.twentyfour && options.max > 12, "Chance: Max cannot be greater than 12.");
    testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
    return this.natural({
      min: options.min,
      max: options.max
    });
  };
  Chance.prototype.millisecond = function () {
    return this.natural({
      max: 999
    });
  };
  Chance.prototype.minute = Chance.prototype.second = function (options) {
    options = initOptions(options, {
      min: 0,
      max: 59
    });
    testRange(options.min < 0, "Chance: Min cannot be less than 0.");
    testRange(options.max > 59, "Chance: Max cannot be greater than 59.");
    testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
    return this.natural({
      min: options.min,
      max: options.max
    });
  };
  Chance.prototype.month = function (options) {
    options = initOptions(options, {
      min: 1,
      max: 12
    });
    testRange(options.min < 1, "Chance: Min cannot be less than 1.");
    testRange(options.max > 12, "Chance: Max cannot be greater than 12.");
    testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
    var month = this.pick(this.months().slice(options.min - 1, options.max));
    return options.raw ? month : month.name;
  };
  Chance.prototype.months = function () {
    return this.get("months");
  };
  Chance.prototype.second = function () {
    return this.natural({
      max: 59
    });
  };
  Chance.prototype.timestamp = function () {
    return this.natural({
      min: 1,
      max: parseInt(new Date().getTime() / 1000, 10)
    });
  };
  Chance.prototype.year = function (options) {
    // Default to current year as min if none specified
    options = initOptions(options, {
      min: new Date().getFullYear()
    });

    // Default to one century after current year as max if none specified
    options.max = typeof options.max !== "undefined" ? options.max : options.min + 100;
    return this.natural(options).toString();
  };

  // -- End Time

  // -- Finance --

  Chance.prototype.cc = function (options) {
    options = initOptions(options);
    var type, number, to_generate;
    type = options.type ? this.cc_type({
      name: options.type,
      raw: true
    }) : this.cc_type({
      raw: true
    });
    number = type.prefix.split("");
    to_generate = type.length - type.prefix.length - 1;

    // Generates n - 1 digits
    number = number.concat(this.n(this.integer, to_generate, {
      min: 0,
      max: 9
    }));

    // Generates the last digit according to Luhn algorithm
    number.push(this.luhn_calculate(number.join("")));
    return number.join("");
  };
  Chance.prototype.cc_types = function () {
    // http://en.wikipedia.org/wiki/Bank_card_number#Issuer_identification_number_.28IIN.29
    return this.get("cc_types");
  };
  Chance.prototype.cc_type = function (options) {
    options = initOptions(options);
    var types = this.cc_types(),
      type = null;
    if (options.name) {
      for (var i = 0; i < types.length; i++) {
        // Accept either name or short_name to specify card type
        if (types[i].name === options.name || types[i].short_name === options.name) {
          type = types[i];
          break;
        }
      }
      if (type === null) {
        throw new RangeError("Credit card type '" + options.name + "'' is not supported");
      }
    } else {
      type = this.pick(types);
    }
    return options.raw ? type : type.name;
  };

  //return all world currency by ISO 4217
  Chance.prototype.currency_types = function () {
    return this.get("currency_types");
  };

  //return random world currency by ISO 4217
  Chance.prototype.currency = function () {
    return this.pick(this.currency_types());
  };

  //Return random correct currency exchange pair (e.g. EUR/USD) or array of currency code
  Chance.prototype.currency_pair = function (returnAsString) {
    var currencies = this.unique(this.currency, 2, {
      comparator: function comparator(arr, val) {
        return arr.reduce(function (acc, item) {
          // If a match has been found, short circuit check and just return
          return acc || item.code === val.code;
        }, false);
      }
    });
    if (returnAsString) {
      return currencies[0].code + '/' + currencies[1].code;
    } else {
      return currencies;
    }
  };
  Chance.prototype.dollar = function (options) {
    // By default, a somewhat more sane max for dollar than all available numbers
    options = initOptions(options, {
      max: 10000,
      min: 0
    });
    var dollar = this.floating({
        min: options.min,
        max: options.max,
        fixed: 2
      }).toString(),
      cents = dollar.split('.')[1];
    if (cents === undefined) {
      dollar += '.00';
    } else if (cents.length < 2) {
      dollar = dollar + '0';
    }
    if (dollar < 0) {
      return '-$' + dollar.replace('-', '');
    } else {
      return '$' + dollar;
    }
  };
  Chance.prototype.exp = function (options) {
    options = initOptions(options);
    var exp = {};
    exp.year = this.exp_year();

    // If the year is this year, need to ensure month is greater than the
    // current month or this expiration will not be valid
    if (exp.year === new Date().getFullYear().toString()) {
      exp.month = this.exp_month({
        future: true
      });
    } else {
      exp.month = this.exp_month();
    }
    return options.raw ? exp : exp.month + '/' + exp.year;
  };
  Chance.prototype.exp_month = function (options) {
    options = initOptions(options);
    var month,
      month_int,
      // Date object months are 0 indexed
      curMonth = new Date().getMonth() + 1;
    if (options.future) {
      do {
        month = this.month({
          raw: true
        }).numeric;
        month_int = parseInt(month, 10);
      } while (month_int <= curMonth);
    } else {
      month = this.month({
        raw: true
      }).numeric;
    }
    return month;
  };
  Chance.prototype.exp_year = function () {
    return this.year({
      max: new Date().getFullYear() + 10
    });
  };

  // -- End Finance

  // -- Miscellaneous --

  // Dice - For all the board game geeks out there, myself included ;)
  function diceFn(range) {
    return function () {
      return this.natural(range);
    };
  }
  Chance.prototype.d4 = diceFn({
    min: 1,
    max: 4
  });
  Chance.prototype.d6 = diceFn({
    min: 1,
    max: 6
  });
  Chance.prototype.d8 = diceFn({
    min: 1,
    max: 8
  });
  Chance.prototype.d10 = diceFn({
    min: 1,
    max: 10
  });
  Chance.prototype.d12 = diceFn({
    min: 1,
    max: 12
  });
  Chance.prototype.d20 = diceFn({
    min: 1,
    max: 20
  });
  Chance.prototype.d30 = diceFn({
    min: 1,
    max: 30
  });
  Chance.prototype.d100 = diceFn({
    min: 1,
    max: 100
  });
  Chance.prototype.rpg = function (thrown, options) {
    options = initOptions(options);
    if (!thrown) {
      throw new RangeError("A type of die roll must be included");
    } else {
      var bits = thrown.toLowerCase().split("d"),
        rolls = [];
      if (bits.length !== 2 || !parseInt(bits[0], 10) || !parseInt(bits[1], 10)) {
        throw new Error("Invalid format provided. Please provide #d# where the first # is the number of dice to roll, the second # is the max of each die");
      }
      for (var i = bits[0]; i > 0; i--) {
        rolls[i - 1] = this.natural({
          min: 1,
          max: bits[1]
        });
      }
      return typeof options.sum !== 'undefined' && options.sum ? rolls.reduce(function (p, c) {
        return p + c;
      }) : rolls;
    }
  };

  // Guid
  Chance.prototype.guid = function (options) {
    options = initOptions(options, {
      version: 5
    });
    var guid_pool = "abcdef1234567890",
      variant_pool = "ab89",
      guid = this.string({
        pool: guid_pool,
        length: 8
      }) + '-' + this.string({
        pool: guid_pool,
        length: 4
      }) + '-' +
      // The Version
      options.version + this.string({
        pool: guid_pool,
        length: 3
      }) + '-' +
      // The Variant
      this.string({
        pool: variant_pool,
        length: 1
      }) + this.string({
        pool: guid_pool,
        length: 3
      }) + '-' + this.string({
        pool: guid_pool,
        length: 12
      });
    return guid;
  };

  // Hash
  Chance.prototype.hash = function (options) {
    options = initOptions(options, {
      length: 40,
      casing: 'lower'
    });
    var pool = options.casing === 'upper' ? HEX_POOL.toUpperCase() : HEX_POOL;
    return this.string({
      pool: pool,
      length: options.length
    });
  };
  Chance.prototype.luhn_check = function (num) {
    var str = num.toString();
    var checkDigit = +str.substring(str.length - 1);
    return checkDigit === this.luhn_calculate(+str.substring(0, str.length - 1));
  };
  Chance.prototype.luhn_calculate = function (num) {
    var digits = num.toString().split("").reverse();
    var sum = 0;
    var digit;
    for (var i = 0, l = digits.length; l > i; ++i) {
      digit = +digits[i];
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
    }
    return sum * 9 % 10;
  };

  // MD5 Hash
  Chance.prototype.md5 = function (options) {
    var opts = {
      str: '',
      key: null,
      raw: false
    };
    if (!options) {
      opts.str = this.string();
      options = {};
    } else if (typeof options === 'string') {
      opts.str = options;
      options = {};
    } else if (_typeof(options) !== 'object') {
      return null;
    } else if (options.constructor === 'Array') {
      return null;
    }
    opts = initOptions(options, opts);
    if (!opts.str) {
      throw new Error('A parameter is required to return an md5 hash.');
    }
    return this.bimd5.md5(opts.str, opts.key, opts.raw);
  };
  var data = {
    firstNames: {
      "male": ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Charles", "Thomas", "Christopher", "Daniel", "Matthew", "George", "Donald", "Anthony", "Paul", "Mark", "Edward", "Steven", "Kenneth", "Andrew", "Brian", "Joshua", "Kevin", "Ronald", "Timothy", "Jason", "Jeffrey", "Frank", "Gary", "Ryan", "Nicholas", "Eric", "Stephen", "Jacob", "Larry", "Jonathan", "Scott", "Raymond", "Justin", "Brandon", "Gregory", "Samuel", "Benjamin", "Patrick", "Jack", "Henry", "Walter", "Dennis", "Jerry", "Alexander", "Peter", "Tyler", "Douglas", "Harold", "Aaron", "Jose", "Adam", "Arthur", "Zachary", "Carl", "Nathan", "Albert", "Kyle", "Lawrence", "Joe", "Willie", "Gerald", "Roger", "Keith", "Jeremy", "Terry", "Harry", "Ralph", "Sean", "Jesse", "Roy", "Louis", "Billy", "Austin", "Bruce", "Eugene", "Christian", "Bryan", "Wayne", "Russell", "Howard", "Fred", "Ethan", "Jordan", "Philip", "Alan", "Juan", "Randy", "Vincent", "Bobby", "Dylan", "Johnny", "Phillip", "Victor", "Clarence", "Ernest", "Martin", "Craig", "Stanley", "Shawn", "Travis", "Bradley", "Leonard", "Earl", "Gabriel", "Jimmy", "Francis", "Todd", "Noah", "Danny", "Dale", "Cody", "Carlos", "Allen", "Frederick", "Logan", "Curtis", "Alex", "Joel", "Luis", "Norman", "Marvin", "Glenn", "Tony", "Nathaniel", "Rodney", "Melvin", "Alfred", "Steve", "Cameron", "Chad", "Edwin", "Caleb", "Evan", "Antonio", "Lee", "Herbert", "Jeffery", "Isaac", "Derek", "Ricky", "Marcus", "Theodore", "Elijah", "Luke", "Jesus", "Eddie", "Troy", "Mike", "Dustin", "Ray", "Adrian", "Bernard", "Leroy", "Angel", "Randall", "Wesley", "Ian", "Jared", "Mason", "Hunter", "Calvin", "Oscar", "Clifford", "Jay", "Shane", "Ronnie", "Barry", "Lucas", "Corey", "Manuel", "Leo", "Tommy", "Warren", "Jackson", "Isaiah", "Connor", "Don", "Dean", "Jon", "Julian", "Miguel", "Bill", "Lloyd", "Charlie", "Mitchell", "Leon", "Jerome", "Darrell", "Jeremiah", "Alvin", "Brett", "Seth", "Floyd", "Jim", "Blake", "Micheal", "Gordon", "Trevor", "Lewis", "Erik", "Edgar", "Vernon", "Devin", "Gavin", "Jayden", "Chris", "Clyde", "Tom", "Derrick", "Mario", "Brent", "Marc", "Herman", "Chase", "Dominic", "Ricardo", "Franklin", "Maurice", "Max", "Aiden", "Owen", "Lester", "Gilbert", "Elmer", "Gene", "Francisco", "Glen", "Cory", "Garrett", "Clayton", "Sam", "Jorge", "Chester", "Alejandro", "Jeff", "Harvey", "Milton", "Cole", "Ivan", "Andre", "Duane", "Landon"],
      "female": ["Mary", "Emma", "Elizabeth", "Minnie", "Margaret", "Ida", "Alice", "Bertha", "Sarah", "Annie", "Clara", "Ella", "Florence", "Cora", "Martha", "Laura", "Nellie", "Grace", "Carrie", "Maude", "Mabel", "Bessie", "Jennie", "Gertrude", "Julia", "Hattie", "Edith", "Mattie", "Rose", "Catherine", "Lillian", "Ada", "Lillie", "Helen", "Jessie", "Louise", "Ethel", "Lula", "Myrtle", "Eva", "Frances", "Lena", "Lucy", "Edna", "Maggie", "Pearl", "Daisy", "Fannie", "Josephine", "Dora", "Rosa", "Katherine", "Agnes", "Marie", "Nora", "May", "Mamie", "Blanche", "Stella", "Ellen", "Nancy", "Effie", "Sallie", "Nettie", "Della", "Lizzie", "Flora", "Susie", "Maud", "Mae", "Etta", "Harriet", "Sadie", "Caroline", "Katie", "Lydia", "Elsie", "Kate", "Susan", "Mollie", "Alma", "Addie", "Georgia", "Eliza", "Lulu", "Nannie", "Lottie", "Amanda", "Belle", "Charlotte", "Rebecca", "Ruth", "Viola", "Olive", "Amelia", "Hannah", "Jane", "Virginia", "Emily", "Matilda", "Irene", "Kathryn", "Esther", "Willie", "Henrietta", "Ollie", "Amy", "Rachel", "Sara", "Estella", "Theresa", "Augusta", "Ora", "Pauline", "Josie", "Lola", "Sophia", "Leona", "Anne", "Mildred", "Ann", "Beulah", "Callie", "Lou", "Delia", "Eleanor", "Barbara", "Iva", "Louisa", "Maria", "Mayme", "Evelyn", "Estelle", "Nina", "Betty", "Marion", "Bettie", "Dorothy", "Luella", "Inez", "Lela", "Rosie", "Allie", "Millie", "Janie", "Cornelia", "Victoria", "Ruby", "Winifred", "Alta", "Celia", "Christine", "Beatrice", "Birdie", "Harriett", "Mable", "Myra", "Sophie", "Tillie", "Isabel", "Sylvia", "Carolyn", "Isabelle", "Leila", "Sally", "Ina", "Essie", "Bertie", "Nell", "Alberta", "Katharine", "Lora", "Rena", "Mina", "Rhoda", "Mathilda", "Abbie", "Eula", "Dollie", "Hettie", "Eunice", "Fanny", "Ola", "Lenora", "Adelaide", "Christina", "Lelia", "Nelle", "Sue", "Johanna", "Lilly", "Lucinda", "Minerva", "Lettie", "Roxie", "Cynthia", "Helena", "Hilda", "Hulda", "Bernice", "Genevieve", "Jean", "Cordelia", "Marian", "Francis", "Jeanette", "Adeline", "Gussie", "Leah", "Lois", "Lura", "Mittie", "Hallie", "Isabella", "Olga", "Phoebe", "Teresa", "Hester", "Lida", "Lina", "Winnie", "Claudia", "Marguerite", "Vera", "Cecelia", "Bess", "Emilie", "John", "Rosetta", "Verna", "Myrtie", "Cecilia", "Elva", "Olivia", "Ophelia", "Georgie", "Elnora", "Violet", "Adele", "Lily", "Linnie", "Loretta", "Madge", "Polly", "Virgie", "Eugenia", "Lucile", "Lucille", "Mabelle", "Rosalie"]
    },
    lastNames: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole', 'West', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson', 'McDonald', 'Cruz', 'Marshall', 'Ortiz', 'Gomez', 'Murray', 'Freeman', 'Wells', 'Webb', 'Simpson', 'Stevens', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Crawford', 'Henry', 'Boyd', 'Mason', 'Morales', 'Kennedy', 'Warren', 'Dixon', 'Ramos', 'Reyes', 'Burns', 'Gordon', 'Shaw', 'Holmes', 'Rice', 'Robertson', 'Hunt', 'Black', 'Daniels', 'Palmer', 'Mills', 'Nichols', 'Grant', 'Knight', 'Ferguson', 'Rose', 'Stone', 'Hawkins', 'Dunn', 'Perkins', 'Hudson', 'Spencer', 'Gardner', 'Stephens', 'Payne', 'Pierce', 'Berry', 'Matthews', 'Arnold', 'Wagner', 'Willis', 'Ray', 'Watkins', 'Olson', 'Carroll', 'Duncan', 'Snyder', 'Hart', 'Cunningham', 'Bradley', 'Lane', 'Andrews', 'Ruiz', 'Harper', 'Fox', 'Riley', 'Armstrong', 'Carpenter', 'Weaver', 'Greene', 'Lawrence', 'Elliott', 'Chavez', 'Sims', 'Austin', 'Peters', 'Kelley', 'Franklin', 'Lawson', 'Fields', 'Gutierrez', 'Ryan', 'Schmidt', 'Carr', 'Vasquez', 'Castillo', 'Wheeler', 'Chapman', 'Oliver', 'Montgomery', 'Richards', 'Williamson', 'Johnston', 'Banks', 'Meyer', 'Bishop', 'McCoy', 'Howell', 'Alvarez', 'Morrison', 'Hansen', 'Fernandez', 'Garza', 'Harvey', 'Little', 'Burton', 'Stanley', 'Nguyen', 'George', 'Jacobs', 'Reid', 'Kim', 'Fuller', 'Lynch', 'Dean', 'Gilbert', 'Garrett', 'Romero', 'Welch', 'Larson', 'Frazier', 'Burke', 'Hanson', 'Day', 'Mendoza', 'Moreno', 'Bowman', 'Medina', 'Fowler', 'Brewer', 'Hoffman', 'Carlson', 'Silva', 'Pearson', 'Holland', 'Douglas', 'Fleming', 'Jensen', 'Vargas', 'Byrd', 'Davidson', 'Hopkins', 'May', 'Terry', 'Herrera', 'Wade', 'Soto', 'Walters', 'Curtis', 'Neal', 'Caldwell', 'Lowe', 'Jennings', 'Barnett', 'Graves', 'Jimenez', 'Horton', 'Shelton', 'Barrett', 'Obrien', 'Castro', 'Sutton', 'Gregory', 'McKinney', 'Lucas', 'Miles', 'Craig', 'Rodriquez', 'Chambers', 'Holt', 'Lambert', 'Fletcher', 'Watts', 'Bates', 'Hale', 'Rhodes', 'Pena', 'Beck', 'Newman', 'Haynes', 'McDaniel', 'Mendez', 'Bush', 'Vaughn', 'Parks', 'Dawson', 'Santiago', 'Norris', 'Hardy', 'Love', 'Steele', 'Curry', 'Powers', 'Schultz', 'Barker', 'Guzman', 'Page', 'Munoz', 'Ball', 'Keller', 'Chandler', 'Weber', 'Leonard', 'Walsh', 'Lyons', 'Ramsey', 'Wolfe', 'Schneider', 'Mullins', 'Benson', 'Sharp', 'Bowen', 'Daniel', 'Barber', 'Cummings', 'Hines', 'Baldwin', 'Griffith', 'Valdez', 'Hubbard', 'Salazar', 'Reeves', 'Warner', 'Stevenson', 'Burgess', 'Santos', 'Tate', 'Cross', 'Garner', 'Mann', 'Mack', 'Moss', 'Thornton', 'Dennis', 'McGee', 'Farmer', 'Delgado', 'Aguilar', 'Vega', 'Glover', 'Manning', 'Cohen', 'Harmon', 'Rodgers', 'Robbins', 'Newton', 'Todd', 'Blair', 'Higgins', 'Ingram', 'Reese', 'Cannon', 'Strickland', 'Townsend', 'Potter', 'Goodwin', 'Walton', 'Rowe', 'Hampton', 'Ortega', 'Patton', 'Swanson', 'Joseph', 'Francis', 'Goodman', 'Maldonado', 'Yates', 'Becker', 'Erickson', 'Hodges', 'Rios', 'Conner', 'Adkins', 'Webster', 'Norman', 'Malone', 'Hammond', 'Flowers', 'Cobb', 'Moody', 'Quinn', 'Blake', 'Maxwell', 'Pope', 'Floyd', 'Osborne', 'Paul', 'McCarthy', 'Guerrero', 'Lindsey', 'Estrada', 'Sandoval', 'Gibbs', 'Tyler', 'Gross', 'Fitzgerald', 'Stokes', 'Doyle', 'Sherman', 'Saunders', 'Wise', 'Colon', 'Gill', 'Alvarado', 'Greer', 'Padilla', 'Simon', 'Waters', 'Nunez', 'Ballard', 'Schwartz', 'McBride', 'Houston', 'Christensen', 'Klein', 'Pratt', 'Briggs', 'Parsons', 'McLaughlin', 'Zimmerman', 'French', 'Buchanan', 'Moran', 'Copeland', 'Roy', 'Pittman', 'Brady', 'McCormick', 'Holloway', 'Brock', 'Poole', 'Frank', 'Logan', 'Owen', 'Bass', 'Marsh', 'Drake', 'Wong', 'Jefferson', 'Park', 'Morton', 'Abbott', 'Sparks', 'Patrick', 'Norton', 'Huff', 'Clayton', 'Massey', 'Lloyd', 'Figueroa', 'Carson', 'Bowers', 'Roberson', 'Barton', 'Tran', 'Lamb', 'Harrington', 'Casey', 'Boone', 'Cortez', 'Clarke', 'Mathis', 'Singleton', 'Wilkins', 'Cain', 'Bryan', 'Underwood', 'Hogan', 'McKenzie', 'Collier', 'Luna', 'Phelps', 'McGuire', 'Allison', 'Bridges', 'Wilkerson', 'Nash', 'Summers', 'Atkins'],
    // Data taken from https://github.com/umpirsky/country-list/blob/master/country/cldr/en_US/country.json
    countries: [{
      "name": "Afghanistan",
      "abbreviation": "AF"
    }, {
      "name": "Albania",
      "abbreviation": "AL"
    }, {
      "name": "Algeria",
      "abbreviation": "DZ"
    }, {
      "name": "American Samoa",
      "abbreviation": "AS"
    }, {
      "name": "Andorra",
      "abbreviation": "AD"
    }, {
      "name": "Angola",
      "abbreviation": "AO"
    }, {
      "name": "Anguilla",
      "abbreviation": "AI"
    }, {
      "name": "Antarctica",
      "abbreviation": "AQ"
    }, {
      "name": "Antigua and Barbuda",
      "abbreviation": "AG"
    }, {
      "name": "Argentina",
      "abbreviation": "AR"
    }, {
      "name": "Armenia",
      "abbreviation": "AM"
    }, {
      "name": "Aruba",
      "abbreviation": "AW"
    }, {
      "name": "Australia",
      "abbreviation": "AU"
    }, {
      "name": "Austria",
      "abbreviation": "AT"
    }, {
      "name": "Azerbaijan",
      "abbreviation": "AZ"
    }, {
      "name": "Bahamas",
      "abbreviation": "BS"
    }, {
      "name": "Bahrain",
      "abbreviation": "BH"
    }, {
      "name": "Bangladesh",
      "abbreviation": "BD"
    }, {
      "name": "Barbados",
      "abbreviation": "BB"
    }, {
      "name": "Belarus",
      "abbreviation": "BY"
    }, {
      "name": "Belgium",
      "abbreviation": "BE"
    }, {
      "name": "Belize",
      "abbreviation": "BZ"
    }, {
      "name": "Benin",
      "abbreviation": "BJ"
    }, {
      "name": "Bermuda",
      "abbreviation": "BM"
    }, {
      "name": "Bhutan",
      "abbreviation": "BT"
    }, {
      "name": "Bolivia",
      "abbreviation": "BO"
    }, {
      "name": "Bosnia and Herzegovina",
      "abbreviation": "BA"
    }, {
      "name": "Botswana",
      "abbreviation": "BW"
    }, {
      "name": "Bouvet Island",
      "abbreviation": "BV"
    }, {
      "name": "Brazil",
      "abbreviation": "BR"
    }, {
      "name": "British Antarctic Territory",
      "abbreviation": "BQ"
    }, {
      "name": "British Indian Ocean Territory",
      "abbreviation": "IO"
    }, {
      "name": "British Virgin Islands",
      "abbreviation": "VG"
    }, {
      "name": "Brunei",
      "abbreviation": "BN"
    }, {
      "name": "Bulgaria",
      "abbreviation": "BG"
    }, {
      "name": "Burkina Faso",
      "abbreviation": "BF"
    }, {
      "name": "Burundi",
      "abbreviation": "BI"
    }, {
      "name": "Cambodia",
      "abbreviation": "KH"
    }, {
      "name": "Cameroon",
      "abbreviation": "CM"
    }, {
      "name": "Canada",
      "abbreviation": "CA"
    }, {
      "name": "Canton and Enderbury Islands",
      "abbreviation": "CT"
    }, {
      "name": "Cape Verde",
      "abbreviation": "CV"
    }, {
      "name": "Cayman Islands",
      "abbreviation": "KY"
    }, {
      "name": "Central African Republic",
      "abbreviation": "CF"
    }, {
      "name": "Chad",
      "abbreviation": "TD"
    }, {
      "name": "Chile",
      "abbreviation": "CL"
    }, {
      "name": "China",
      "abbreviation": "CN"
    }, {
      "name": "Christmas Island",
      "abbreviation": "CX"
    }, {
      "name": "Cocos [Keeling] Islands",
      "abbreviation": "CC"
    }, {
      "name": "Colombia",
      "abbreviation": "CO"
    }, {
      "name": "Comoros",
      "abbreviation": "KM"
    }, {
      "name": "Congo - Brazzaville",
      "abbreviation": "CG"
    }, {
      "name": "Congo - Kinshasa",
      "abbreviation": "CD"
    }, {
      "name": "Cook Islands",
      "abbreviation": "CK"
    }, {
      "name": "Costa Rica",
      "abbreviation": "CR"
    }, {
      "name": "Croatia",
      "abbreviation": "HR"
    }, {
      "name": "Cuba",
      "abbreviation": "CU"
    }, {
      "name": "Cyprus",
      "abbreviation": "CY"
    }, {
      "name": "Czech Republic",
      "abbreviation": "CZ"
    }, {
      "name": "Côte d’Ivoire",
      "abbreviation": "CI"
    }, {
      "name": "Denmark",
      "abbreviation": "DK"
    }, {
      "name": "Djibouti",
      "abbreviation": "DJ"
    }, {
      "name": "Dominica",
      "abbreviation": "DM"
    }, {
      "name": "Dominican Republic",
      "abbreviation": "DO"
    }, {
      "name": "Dronning Maud Land",
      "abbreviation": "NQ"
    }, {
      "name": "East Germany",
      "abbreviation": "DD"
    }, {
      "name": "Ecuador",
      "abbreviation": "EC"
    }, {
      "name": "Egypt",
      "abbreviation": "EG"
    }, {
      "name": "El Salvador",
      "abbreviation": "SV"
    }, {
      "name": "Equatorial Guinea",
      "abbreviation": "GQ"
    }, {
      "name": "Eritrea",
      "abbreviation": "ER"
    }, {
      "name": "Estonia",
      "abbreviation": "EE"
    }, {
      "name": "Ethiopia",
      "abbreviation": "ET"
    }, {
      "name": "Falkland Islands",
      "abbreviation": "FK"
    }, {
      "name": "Faroe Islands",
      "abbreviation": "FO"
    }, {
      "name": "Fiji",
      "abbreviation": "FJ"
    }, {
      "name": "Finland",
      "abbreviation": "FI"
    }, {
      "name": "France",
      "abbreviation": "FR"
    }, {
      "name": "French Guiana",
      "abbreviation": "GF"
    }, {
      "name": "French Polynesia",
      "abbreviation": "PF"
    }, {
      "name": "French Southern Territories",
      "abbreviation": "TF"
    }, {
      "name": "French Southern and Antarctic Territories",
      "abbreviation": "FQ"
    }, {
      "name": "Gabon",
      "abbreviation": "GA"
    }, {
      "name": "Gambia",
      "abbreviation": "GM"
    }, {
      "name": "Georgia",
      "abbreviation": "GE"
    }, {
      "name": "Germany",
      "abbreviation": "DE"
    }, {
      "name": "Ghana",
      "abbreviation": "GH"
    }, {
      "name": "Gibraltar",
      "abbreviation": "GI"
    }, {
      "name": "Greece",
      "abbreviation": "GR"
    }, {
      "name": "Greenland",
      "abbreviation": "GL"
    }, {
      "name": "Grenada",
      "abbreviation": "GD"
    }, {
      "name": "Guadeloupe",
      "abbreviation": "GP"
    }, {
      "name": "Guam",
      "abbreviation": "GU"
    }, {
      "name": "Guatemala",
      "abbreviation": "GT"
    }, {
      "name": "Guernsey",
      "abbreviation": "GG"
    }, {
      "name": "Guinea",
      "abbreviation": "GN"
    }, {
      "name": "Guinea-Bissau",
      "abbreviation": "GW"
    }, {
      "name": "Guyana",
      "abbreviation": "GY"
    }, {
      "name": "Haiti",
      "abbreviation": "HT"
    }, {
      "name": "Heard Island and McDonald Islands",
      "abbreviation": "HM"
    }, {
      "name": "Honduras",
      "abbreviation": "HN"
    }, {
      "name": "Hong Kong SAR China",
      "abbreviation": "HK"
    }, {
      "name": "Hungary",
      "abbreviation": "HU"
    }, {
      "name": "Iceland",
      "abbreviation": "IS"
    }, {
      "name": "India",
      "abbreviation": "IN"
    }, {
      "name": "Indonesia",
      "abbreviation": "ID"
    }, {
      "name": "Iran",
      "abbreviation": "IR"
    }, {
      "name": "Iraq",
      "abbreviation": "IQ"
    }, {
      "name": "Ireland",
      "abbreviation": "IE"
    }, {
      "name": "Isle of Man",
      "abbreviation": "IM"
    }, {
      "name": "Israel",
      "abbreviation": "IL"
    }, {
      "name": "Italy",
      "abbreviation": "IT"
    }, {
      "name": "Jamaica",
      "abbreviation": "JM"
    }, {
      "name": "Japan",
      "abbreviation": "JP"
    }, {
      "name": "Jersey",
      "abbreviation": "JE"
    }, {
      "name": "Johnston Island",
      "abbreviation": "JT"
    }, {
      "name": "Jordan",
      "abbreviation": "JO"
    }, {
      "name": "Kazakhstan",
      "abbreviation": "KZ"
    }, {
      "name": "Kenya",
      "abbreviation": "KE"
    }, {
      "name": "Kiribati",
      "abbreviation": "KI"
    }, {
      "name": "Kuwait",
      "abbreviation": "KW"
    }, {
      "name": "Kyrgyzstan",
      "abbreviation": "KG"
    }, {
      "name": "Laos",
      "abbreviation": "LA"
    }, {
      "name": "Latvia",
      "abbreviation": "LV"
    }, {
      "name": "Lebanon",
      "abbreviation": "LB"
    }, {
      "name": "Lesotho",
      "abbreviation": "LS"
    }, {
      "name": "Liberia",
      "abbreviation": "LR"
    }, {
      "name": "Libya",
      "abbreviation": "LY"
    }, {
      "name": "Liechtenstein",
      "abbreviation": "LI"
    }, {
      "name": "Lithuania",
      "abbreviation": "LT"
    }, {
      "name": "Luxembourg",
      "abbreviation": "LU"
    }, {
      "name": "Macau SAR China",
      "abbreviation": "MO"
    }, {
      "name": "Macedonia",
      "abbreviation": "MK"
    }, {
      "name": "Madagascar",
      "abbreviation": "MG"
    }, {
      "name": "Malawi",
      "abbreviation": "MW"
    }, {
      "name": "Malaysia",
      "abbreviation": "MY"
    }, {
      "name": "Maldives",
      "abbreviation": "MV"
    }, {
      "name": "Mali",
      "abbreviation": "ML"
    }, {
      "name": "Malta",
      "abbreviation": "MT"
    }, {
      "name": "Marshall Islands",
      "abbreviation": "MH"
    }, {
      "name": "Martinique",
      "abbreviation": "MQ"
    }, {
      "name": "Mauritania",
      "abbreviation": "MR"
    }, {
      "name": "Mauritius",
      "abbreviation": "MU"
    }, {
      "name": "Mayotte",
      "abbreviation": "YT"
    }, {
      "name": "Metropolitan France",
      "abbreviation": "FX"
    }, {
      "name": "Mexico",
      "abbreviation": "MX"
    }, {
      "name": "Micronesia",
      "abbreviation": "FM"
    }, {
      "name": "Midway Islands",
      "abbreviation": "MI"
    }, {
      "name": "Moldova",
      "abbreviation": "MD"
    }, {
      "name": "Monaco",
      "abbreviation": "MC"
    }, {
      "name": "Mongolia",
      "abbreviation": "MN"
    }, {
      "name": "Montenegro",
      "abbreviation": "ME"
    }, {
      "name": "Montserrat",
      "abbreviation": "MS"
    }, {
      "name": "Morocco",
      "abbreviation": "MA"
    }, {
      "name": "Mozambique",
      "abbreviation": "MZ"
    }, {
      "name": "Myanmar [Burma]",
      "abbreviation": "MM"
    }, {
      "name": "Namibia",
      "abbreviation": "NA"
    }, {
      "name": "Nauru",
      "abbreviation": "NR"
    }, {
      "name": "Nepal",
      "abbreviation": "NP"
    }, {
      "name": "Netherlands",
      "abbreviation": "NL"
    }, {
      "name": "Netherlands Antilles",
      "abbreviation": "AN"
    }, {
      "name": "Neutral Zone",
      "abbreviation": "NT"
    }, {
      "name": "New Caledonia",
      "abbreviation": "NC"
    }, {
      "name": "New Zealand",
      "abbreviation": "NZ"
    }, {
      "name": "Nicaragua",
      "abbreviation": "NI"
    }, {
      "name": "Niger",
      "abbreviation": "NE"
    }, {
      "name": "Nigeria",
      "abbreviation": "NG"
    }, {
      "name": "Niue",
      "abbreviation": "NU"
    }, {
      "name": "Norfolk Island",
      "abbreviation": "NF"
    }, {
      "name": "North Korea",
      "abbreviation": "KP"
    }, {
      "name": "North Vietnam",
      "abbreviation": "VD"
    }, {
      "name": "Northern Mariana Islands",
      "abbreviation": "MP"
    }, {
      "name": "Norway",
      "abbreviation": "NO"
    }, {
      "name": "Oman",
      "abbreviation": "OM"
    }, {
      "name": "Pacific Islands Trust Territory",
      "abbreviation": "PC"
    }, {
      "name": "Pakistan",
      "abbreviation": "PK"
    }, {
      "name": "Palau",
      "abbreviation": "PW"
    }, {
      "name": "Palestinian Territories",
      "abbreviation": "PS"
    }, {
      "name": "Panama",
      "abbreviation": "PA"
    }, {
      "name": "Panama Canal Zone",
      "abbreviation": "PZ"
    }, {
      "name": "Papua New Guinea",
      "abbreviation": "PG"
    }, {
      "name": "Paraguay",
      "abbreviation": "PY"
    }, {
      "name": "People's Democratic Republic of Yemen",
      "abbreviation": "YD"
    }, {
      "name": "Peru",
      "abbreviation": "PE"
    }, {
      "name": "Philippines",
      "abbreviation": "PH"
    }, {
      "name": "Pitcairn Islands",
      "abbreviation": "PN"
    }, {
      "name": "Poland",
      "abbreviation": "PL"
    }, {
      "name": "Portugal",
      "abbreviation": "PT"
    }, {
      "name": "Puerto Rico",
      "abbreviation": "PR"
    }, {
      "name": "Qatar",
      "abbreviation": "QA"
    }, {
      "name": "Romania",
      "abbreviation": "RO"
    }, {
      "name": "Russia",
      "abbreviation": "RU"
    }, {
      "name": "Rwanda",
      "abbreviation": "RW"
    }, {
      "name": "Réunion",
      "abbreviation": "RE"
    }, {
      "name": "Saint Barthélemy",
      "abbreviation": "BL"
    }, {
      "name": "Saint Helena",
      "abbreviation": "SH"
    }, {
      "name": "Saint Kitts and Nevis",
      "abbreviation": "KN"
    }, {
      "name": "Saint Lucia",
      "abbreviation": "LC"
    }, {
      "name": "Saint Martin",
      "abbreviation": "MF"
    }, {
      "name": "Saint Pierre and Miquelon",
      "abbreviation": "PM"
    }, {
      "name": "Saint Vincent and the Grenadines",
      "abbreviation": "VC"
    }, {
      "name": "Samoa",
      "abbreviation": "WS"
    }, {
      "name": "San Marino",
      "abbreviation": "SM"
    }, {
      "name": "Saudi Arabia",
      "abbreviation": "SA"
    }, {
      "name": "Senegal",
      "abbreviation": "SN"
    }, {
      "name": "Serbia",
      "abbreviation": "RS"
    }, {
      "name": "Serbia and Montenegro",
      "abbreviation": "CS"
    }, {
      "name": "Seychelles",
      "abbreviation": "SC"
    }, {
      "name": "Sierra Leone",
      "abbreviation": "SL"
    }, {
      "name": "Singapore",
      "abbreviation": "SG"
    }, {
      "name": "Slovakia",
      "abbreviation": "SK"
    }, {
      "name": "Slovenia",
      "abbreviation": "SI"
    }, {
      "name": "Solomon Islands",
      "abbreviation": "SB"
    }, {
      "name": "Somalia",
      "abbreviation": "SO"
    }, {
      "name": "South Africa",
      "abbreviation": "ZA"
    }, {
      "name": "South Georgia and the South Sandwich Islands",
      "abbreviation": "GS"
    }, {
      "name": "South Korea",
      "abbreviation": "KR"
    }, {
      "name": "Spain",
      "abbreviation": "ES"
    }, {
      "name": "Sri Lanka",
      "abbreviation": "LK"
    }, {
      "name": "Sudan",
      "abbreviation": "SD"
    }, {
      "name": "Suriname",
      "abbreviation": "SR"
    }, {
      "name": "Svalbard and Jan Mayen",
      "abbreviation": "SJ"
    }, {
      "name": "Swaziland",
      "abbreviation": "SZ"
    }, {
      "name": "Sweden",
      "abbreviation": "SE"
    }, {
      "name": "Switzerland",
      "abbreviation": "CH"
    }, {
      "name": "Syria",
      "abbreviation": "SY"
    }, {
      "name": "São Tomé and Príncipe",
      "abbreviation": "ST"
    }, {
      "name": "Taiwan",
      "abbreviation": "TW"
    }, {
      "name": "Tajikistan",
      "abbreviation": "TJ"
    }, {
      "name": "Tanzania",
      "abbreviation": "TZ"
    }, {
      "name": "Thailand",
      "abbreviation": "TH"
    }, {
      "name": "Timor-Leste",
      "abbreviation": "TL"
    }, {
      "name": "Togo",
      "abbreviation": "TG"
    }, {
      "name": "Tokelau",
      "abbreviation": "TK"
    }, {
      "name": "Tonga",
      "abbreviation": "TO"
    }, {
      "name": "Trinidad and Tobago",
      "abbreviation": "TT"
    }, {
      "name": "Tunisia",
      "abbreviation": "TN"
    }, {
      "name": "Turkey",
      "abbreviation": "TR"
    }, {
      "name": "Turkmenistan",
      "abbreviation": "TM"
    }, {
      "name": "Turks and Caicos Islands",
      "abbreviation": "TC"
    }, {
      "name": "Tuvalu",
      "abbreviation": "TV"
    }, {
      "name": "U.S. Minor Outlying Islands",
      "abbreviation": "UM"
    }, {
      "name": "U.S. Miscellaneous Pacific Islands",
      "abbreviation": "PU"
    }, {
      "name": "U.S. Virgin Islands",
      "abbreviation": "VI"
    }, {
      "name": "Uganda",
      "abbreviation": "UG"
    }, {
      "name": "Ukraine",
      "abbreviation": "UA"
    }, {
      "name": "Union of Soviet Socialist Republics",
      "abbreviation": "SU"
    }, {
      "name": "United Arab Emirates",
      "abbreviation": "AE"
    }, {
      "name": "United Kingdom",
      "abbreviation": "GB"
    }, {
      "name": "United States",
      "abbreviation": "US"
    }, {
      "name": "Unknown or Invalid Region",
      "abbreviation": "ZZ"
    }, {
      "name": "Uruguay",
      "abbreviation": "UY"
    }, {
      "name": "Uzbekistan",
      "abbreviation": "UZ"
    }, {
      "name": "Vanuatu",
      "abbreviation": "VU"
    }, {
      "name": "Vatican City",
      "abbreviation": "VA"
    }, {
      "name": "Venezuela",
      "abbreviation": "VE"
    }, {
      "name": "Vietnam",
      "abbreviation": "VN"
    }, {
      "name": "Wake Island",
      "abbreviation": "WK"
    }, {
      "name": "Wallis and Futuna",
      "abbreviation": "WF"
    }, {
      "name": "Western Sahara",
      "abbreviation": "EH"
    }, {
      "name": "Yemen",
      "abbreviation": "YE"
    }, {
      "name": "Zambia",
      "abbreviation": "ZM"
    }, {
      "name": "Zimbabwe",
      "abbreviation": "ZW"
    }, {
      "name": "Åland Islands",
      "abbreviation": "AX"
    }],
    provinces: [{
      name: 'Alberta',
      abbreviation: 'AB'
    }, {
      name: 'British Columbia',
      abbreviation: 'BC'
    }, {
      name: 'Manitoba',
      abbreviation: 'MB'
    }, {
      name: 'New Brunswick',
      abbreviation: 'NB'
    }, {
      name: 'Newfoundland and Labrador',
      abbreviation: 'NL'
    }, {
      name: 'Nova Scotia',
      abbreviation: 'NS'
    }, {
      name: 'Ontario',
      abbreviation: 'ON'
    }, {
      name: 'Prince Edward Island',
      abbreviation: 'PE'
    }, {
      name: 'Quebec',
      abbreviation: 'QC'
    }, {
      name: 'Saskatchewan',
      abbreviation: 'SK'
    },
    // The case could be made that the following are not actually provinces
    // since they are technically considered "territories" however they all
    // look the same on an envelope!
    {
      name: 'Northwest Territories',
      abbreviation: 'NT'
    }, {
      name: 'Nunavut',
      abbreviation: 'NU'
    }, {
      name: 'Yukon',
      abbreviation: 'YT'
    }],
    us_states_and_dc: [{
      name: 'Alabama',
      abbreviation: 'AL'
    }, {
      name: 'Alaska',
      abbreviation: 'AK'
    }, {
      name: 'Arizona',
      abbreviation: 'AZ'
    }, {
      name: 'Arkansas',
      abbreviation: 'AR'
    }, {
      name: 'California',
      abbreviation: 'CA'
    }, {
      name: 'Colorado',
      abbreviation: 'CO'
    }, {
      name: 'Connecticut',
      abbreviation: 'CT'
    }, {
      name: 'Delaware',
      abbreviation: 'DE'
    }, {
      name: 'District of Columbia',
      abbreviation: 'DC'
    }, {
      name: 'Florida',
      abbreviation: 'FL'
    }, {
      name: 'Georgia',
      abbreviation: 'GA'
    }, {
      name: 'Hawaii',
      abbreviation: 'HI'
    }, {
      name: 'Idaho',
      abbreviation: 'ID'
    }, {
      name: 'Illinois',
      abbreviation: 'IL'
    }, {
      name: 'Indiana',
      abbreviation: 'IN'
    }, {
      name: 'Iowa',
      abbreviation: 'IA'
    }, {
      name: 'Kansas',
      abbreviation: 'KS'
    }, {
      name: 'Kentucky',
      abbreviation: 'KY'
    }, {
      name: 'Louisiana',
      abbreviation: 'LA'
    }, {
      name: 'Maine',
      abbreviation: 'ME'
    }, {
      name: 'Maryland',
      abbreviation: 'MD'
    }, {
      name: 'Massachusetts',
      abbreviation: 'MA'
    }, {
      name: 'Michigan',
      abbreviation: 'MI'
    }, {
      name: 'Minnesota',
      abbreviation: 'MN'
    }, {
      name: 'Mississippi',
      abbreviation: 'MS'
    }, {
      name: 'Missouri',
      abbreviation: 'MO'
    }, {
      name: 'Montana',
      abbreviation: 'MT'
    }, {
      name: 'Nebraska',
      abbreviation: 'NE'
    }, {
      name: 'Nevada',
      abbreviation: 'NV'
    }, {
      name: 'New Hampshire',
      abbreviation: 'NH'
    }, {
      name: 'New Jersey',
      abbreviation: 'NJ'
    }, {
      name: 'New Mexico',
      abbreviation: 'NM'
    }, {
      name: 'New York',
      abbreviation: 'NY'
    }, {
      name: 'North Carolina',
      abbreviation: 'NC'
    }, {
      name: 'North Dakota',
      abbreviation: 'ND'
    }, {
      name: 'Ohio',
      abbreviation: 'OH'
    }, {
      name: 'Oklahoma',
      abbreviation: 'OK'
    }, {
      name: 'Oregon',
      abbreviation: 'OR'
    }, {
      name: 'Pennsylvania',
      abbreviation: 'PA'
    }, {
      name: 'Rhode Island',
      abbreviation: 'RI'
    }, {
      name: 'South Carolina',
      abbreviation: 'SC'
    }, {
      name: 'South Dakota',
      abbreviation: 'SD'
    }, {
      name: 'Tennessee',
      abbreviation: 'TN'
    }, {
      name: 'Texas',
      abbreviation: 'TX'
    }, {
      name: 'Utah',
      abbreviation: 'UT'
    }, {
      name: 'Vermont',
      abbreviation: 'VT'
    }, {
      name: 'Virginia',
      abbreviation: 'VA'
    }, {
      name: 'Washington',
      abbreviation: 'WA'
    }, {
      name: 'West Virginia',
      abbreviation: 'WV'
    }, {
      name: 'Wisconsin',
      abbreviation: 'WI'
    }, {
      name: 'Wyoming',
      abbreviation: 'WY'
    }],
    territories: [{
      name: 'American Samoa',
      abbreviation: 'AS'
    }, {
      name: 'Federated States of Micronesia',
      abbreviation: 'FM'
    }, {
      name: 'Guam',
      abbreviation: 'GU'
    }, {
      name: 'Marshall Islands',
      abbreviation: 'MH'
    }, {
      name: 'Northern Mariana Islands',
      abbreviation: 'MP'
    }, {
      name: 'Puerto Rico',
      abbreviation: 'PR'
    }, {
      name: 'Virgin Islands, U.S.',
      abbreviation: 'VI'
    }],
    armed_forces: [{
      name: 'Armed Forces Europe',
      abbreviation: 'AE'
    }, {
      name: 'Armed Forces Pacific',
      abbreviation: 'AP'
    }, {
      name: 'Armed Forces the Americas',
      abbreviation: 'AA'
    }],
    street_suffixes: [{
      name: 'Avenue',
      abbreviation: 'Ave'
    }, {
      name: 'Boulevard',
      abbreviation: 'Blvd'
    }, {
      name: 'Center',
      abbreviation: 'Ctr'
    }, {
      name: 'Circle',
      abbreviation: 'Cir'
    }, {
      name: 'Court',
      abbreviation: 'Ct'
    }, {
      name: 'Drive',
      abbreviation: 'Dr'
    }, {
      name: 'Extension',
      abbreviation: 'Ext'
    }, {
      name: 'Glen',
      abbreviation: 'Gln'
    }, {
      name: 'Grove',
      abbreviation: 'Grv'
    }, {
      name: 'Heights',
      abbreviation: 'Hts'
    }, {
      name: 'Highway',
      abbreviation: 'Hwy'
    }, {
      name: 'Junction',
      abbreviation: 'Jct'
    }, {
      name: 'Key',
      abbreviation: 'Key'
    }, {
      name: 'Lane',
      abbreviation: 'Ln'
    }, {
      name: 'Loop',
      abbreviation: 'Loop'
    }, {
      name: 'Manor',
      abbreviation: 'Mnr'
    }, {
      name: 'Mill',
      abbreviation: 'Mill'
    }, {
      name: 'Park',
      abbreviation: 'Park'
    }, {
      name: 'Parkway',
      abbreviation: 'Pkwy'
    }, {
      name: 'Pass',
      abbreviation: 'Pass'
    }, {
      name: 'Path',
      abbreviation: 'Path'
    }, {
      name: 'Pike',
      abbreviation: 'Pike'
    }, {
      name: 'Place',
      abbreviation: 'Pl'
    }, {
      name: 'Plaza',
      abbreviation: 'Plz'
    }, {
      name: 'Point',
      abbreviation: 'Pt'
    }, {
      name: 'Ridge',
      abbreviation: 'Rdg'
    }, {
      name: 'River',
      abbreviation: 'Riv'
    }, {
      name: 'Road',
      abbreviation: 'Rd'
    }, {
      name: 'Square',
      abbreviation: 'Sq'
    }, {
      name: 'Street',
      abbreviation: 'St'
    }, {
      name: 'Terrace',
      abbreviation: 'Ter'
    }, {
      name: 'Trail',
      abbreviation: 'Trl'
    }, {
      name: 'Turnpike',
      abbreviation: 'Tpke'
    }, {
      name: 'View',
      abbreviation: 'Vw'
    }, {
      name: 'Way',
      abbreviation: 'Way'
    }],
    months: [{
      name: 'January',
      short_name: 'Jan',
      numeric: '01',
      days: 31
    },
    // Not messing with leap years...
    {
      name: 'February',
      short_name: 'Feb',
      numeric: '02',
      days: 28
    }, {
      name: 'March',
      short_name: 'Mar',
      numeric: '03',
      days: 31
    }, {
      name: 'April',
      short_name: 'Apr',
      numeric: '04',
      days: 30
    }, {
      name: 'May',
      short_name: 'May',
      numeric: '05',
      days: 31
    }, {
      name: 'June',
      short_name: 'Jun',
      numeric: '06',
      days: 30
    }, {
      name: 'July',
      short_name: 'Jul',
      numeric: '07',
      days: 31
    }, {
      name: 'August',
      short_name: 'Aug',
      numeric: '08',
      days: 31
    }, {
      name: 'September',
      short_name: 'Sep',
      numeric: '09',
      days: 30
    }, {
      name: 'October',
      short_name: 'Oct',
      numeric: '10',
      days: 31
    }, {
      name: 'November',
      short_name: 'Nov',
      numeric: '11',
      days: 30
    }, {
      name: 'December',
      short_name: 'Dec',
      numeric: '12',
      days: 31
    }],
    // http://en.wikipedia.org/wiki/Bank_card_number#Issuer_identification_number_.28IIN.29
    cc_types: [{
      name: "American Express",
      short_name: 'amex',
      prefix: '34',
      length: 15
    }, {
      name: "Bankcard",
      short_name: 'bankcard',
      prefix: '5610',
      length: 16
    }, {
      name: "China UnionPay",
      short_name: 'chinaunion',
      prefix: '62',
      length: 16
    }, {
      name: "Diners Club Carte Blanche",
      short_name: 'dccarte',
      prefix: '300',
      length: 14
    }, {
      name: "Diners Club enRoute",
      short_name: 'dcenroute',
      prefix: '2014',
      length: 15
    }, {
      name: "Diners Club International",
      short_name: 'dcintl',
      prefix: '36',
      length: 14
    }, {
      name: "Diners Club United States & Canada",
      short_name: 'dcusc',
      prefix: '54',
      length: 16
    }, {
      name: "Discover Card",
      short_name: 'discover',
      prefix: '6011',
      length: 16
    }, {
      name: "InstaPayment",
      short_name: 'instapay',
      prefix: '637',
      length: 16
    }, {
      name: "JCB",
      short_name: 'jcb',
      prefix: '3528',
      length: 16
    }, {
      name: "Laser",
      short_name: 'laser',
      prefix: '6304',
      length: 16
    }, {
      name: "Maestro",
      short_name: 'maestro',
      prefix: '5018',
      length: 16
    }, {
      name: "Mastercard",
      short_name: 'mc',
      prefix: '51',
      length: 16
    }, {
      name: "Solo",
      short_name: 'solo',
      prefix: '6334',
      length: 16
    }, {
      name: "Switch",
      short_name: 'switch',
      prefix: '4903',
      length: 16
    }, {
      name: "Visa",
      short_name: 'visa',
      prefix: '4',
      length: 16
    }, {
      name: "Visa Electron",
      short_name: 'electron',
      prefix: '4026',
      length: 16
    }],
    //return all world currency by ISO 4217
    currency_types: [{
      'code': 'AED',
      'name': 'United Arab Emirates Dirham'
    }, {
      'code': 'AFN',
      'name': 'Afghanistan Afghani'
    }, {
      'code': 'ALL',
      'name': 'Albania Lek'
    }, {
      'code': 'AMD',
      'name': 'Armenia Dram'
    }, {
      'code': 'ANG',
      'name': 'Netherlands Antilles Guilder'
    }, {
      'code': 'AOA',
      'name': 'Angola Kwanza'
    }, {
      'code': 'ARS',
      'name': 'Argentina Peso'
    }, {
      'code': 'AUD',
      'name': 'Australia Dollar'
    }, {
      'code': 'AWG',
      'name': 'Aruba Guilder'
    }, {
      'code': 'AZN',
      'name': 'Azerbaijan New Manat'
    }, {
      'code': 'BAM',
      'name': 'Bosnia and Herzegovina Convertible Marka'
    }, {
      'code': 'BBD',
      'name': 'Barbados Dollar'
    }, {
      'code': 'BDT',
      'name': 'Bangladesh Taka'
    }, {
      'code': 'BGN',
      'name': 'Bulgaria Lev'
    }, {
      'code': 'BHD',
      'name': 'Bahrain Dinar'
    }, {
      'code': 'BIF',
      'name': 'Burundi Franc'
    }, {
      'code': 'BMD',
      'name': 'Bermuda Dollar'
    }, {
      'code': 'BND',
      'name': 'Brunei Darussalam Dollar'
    }, {
      'code': 'BOB',
      'name': 'Bolivia Boliviano'
    }, {
      'code': 'BRL',
      'name': 'Brazil Real'
    }, {
      'code': 'BSD',
      'name': 'Bahamas Dollar'
    }, {
      'code': 'BTN',
      'name': 'Bhutan Ngultrum'
    }, {
      'code': 'BWP',
      'name': 'Botswana Pula'
    }, {
      'code': 'BYR',
      'name': 'Belarus Ruble'
    }, {
      'code': 'BZD',
      'name': 'Belize Dollar'
    }, {
      'code': 'CAD',
      'name': 'Canada Dollar'
    }, {
      'code': 'CDF',
      'name': 'Congo/Kinshasa Franc'
    }, {
      'code': 'CHF',
      'name': 'Switzerland Franc'
    }, {
      'code': 'CLP',
      'name': 'Chile Peso'
    }, {
      'code': 'CNY',
      'name': 'China Yuan Renminbi'
    }, {
      'code': 'COP',
      'name': 'Colombia Peso'
    }, {
      'code': 'CRC',
      'name': 'Costa Rica Colon'
    }, {
      'code': 'CUC',
      'name': 'Cuba Convertible Peso'
    }, {
      'code': 'CUP',
      'name': 'Cuba Peso'
    }, {
      'code': 'CVE',
      'name': 'Cape Verde Escudo'
    }, {
      'code': 'CZK',
      'name': 'Czech Republic Koruna'
    }, {
      'code': 'DJF',
      'name': 'Djibouti Franc'
    }, {
      'code': 'DKK',
      'name': 'Denmark Krone'
    }, {
      'code': 'DOP',
      'name': 'Dominican Republic Peso'
    }, {
      'code': 'DZD',
      'name': 'Algeria Dinar'
    }, {
      'code': 'EGP',
      'name': 'Egypt Pound'
    }, {
      'code': 'ERN',
      'name': 'Eritrea Nakfa'
    }, {
      'code': 'ETB',
      'name': 'Ethiopia Birr'
    }, {
      'code': 'EUR',
      'name': 'Euro Member Countries'
    }, {
      'code': 'FJD',
      'name': 'Fiji Dollar'
    }, {
      'code': 'FKP',
      'name': 'Falkland Islands (Malvinas) Pound'
    }, {
      'code': 'GBP',
      'name': 'United Kingdom Pound'
    }, {
      'code': 'GEL',
      'name': 'Georgia Lari'
    }, {
      'code': 'GGP',
      'name': 'Guernsey Pound'
    }, {
      'code': 'GHS',
      'name': 'Ghana Cedi'
    }, {
      'code': 'GIP',
      'name': 'Gibraltar Pound'
    }, {
      'code': 'GMD',
      'name': 'Gambia Dalasi'
    }, {
      'code': 'GNF',
      'name': 'Guinea Franc'
    }, {
      'code': 'GTQ',
      'name': 'Guatemala Quetzal'
    }, {
      'code': 'GYD',
      'name': 'Guyana Dollar'
    }, {
      'code': 'HKD',
      'name': 'Hong Kong Dollar'
    }, {
      'code': 'HNL',
      'name': 'Honduras Lempira'
    }, {
      'code': 'HRK',
      'name': 'Croatia Kuna'
    }, {
      'code': 'HTG',
      'name': 'Haiti Gourde'
    }, {
      'code': 'HUF',
      'name': 'Hungary Forint'
    }, {
      'code': 'IDR',
      'name': 'Indonesia Rupiah'
    }, {
      'code': 'ILS',
      'name': 'Israel Shekel'
    }, {
      'code': 'IMP',
      'name': 'Isle of Man Pound'
    }, {
      'code': 'INR',
      'name': 'India Rupee'
    }, {
      'code': 'IQD',
      'name': 'Iraq Dinar'
    }, {
      'code': 'IRR',
      'name': 'Iran Rial'
    }, {
      'code': 'ISK',
      'name': 'Iceland Krona'
    }, {
      'code': 'JEP',
      'name': 'Jersey Pound'
    }, {
      'code': 'JMD',
      'name': 'Jamaica Dollar'
    }, {
      'code': 'JOD',
      'name': 'Jordan Dinar'
    }, {
      'code': 'JPY',
      'name': 'Japan Yen'
    }, {
      'code': 'KES',
      'name': 'Kenya Shilling'
    }, {
      'code': 'KGS',
      'name': 'Kyrgyzstan Som'
    }, {
      'code': 'KHR',
      'name': 'Cambodia Riel'
    }, {
      'code': 'KMF',
      'name': 'Comoros Franc'
    }, {
      'code': 'KPW',
      'name': 'Korea (North) Won'
    }, {
      'code': 'KRW',
      'name': 'Korea (South) Won'
    }, {
      'code': 'KWD',
      'name': 'Kuwait Dinar'
    }, {
      'code': 'KYD',
      'name': 'Cayman Islands Dollar'
    }, {
      'code': 'KZT',
      'name': 'Kazakhstan Tenge'
    }, {
      'code': 'LAK',
      'name': 'Laos Kip'
    }, {
      'code': 'LBP',
      'name': 'Lebanon Pound'
    }, {
      'code': 'LKR',
      'name': 'Sri Lanka Rupee'
    }, {
      'code': 'LRD',
      'name': 'Liberia Dollar'
    }, {
      'code': 'LSL',
      'name': 'Lesotho Loti'
    }, {
      'code': 'LTL',
      'name': 'Lithuania Litas'
    }, {
      'code': 'LYD',
      'name': 'Libya Dinar'
    }, {
      'code': 'MAD',
      'name': 'Morocco Dirham'
    }, {
      'code': 'MDL',
      'name': 'Moldova Leu'
    }, {
      'code': 'MGA',
      'name': 'Madagascar Ariary'
    }, {
      'code': 'MKD',
      'name': 'Macedonia Denar'
    }, {
      'code': 'MMK',
      'name': 'Myanmar (Burma) Kyat'
    }, {
      'code': 'MNT',
      'name': 'Mongolia Tughrik'
    }, {
      'code': 'MOP',
      'name': 'Macau Pataca'
    }, {
      'code': 'MRO',
      'name': 'Mauritania Ouguiya'
    }, {
      'code': 'MUR',
      'name': 'Mauritius Rupee'
    }, {
      'code': 'MVR',
      'name': 'Maldives (Maldive Islands) Rufiyaa'
    }, {
      'code': 'MWK',
      'name': 'Malawi Kwacha'
    }, {
      'code': 'MXN',
      'name': 'Mexico Peso'
    }, {
      'code': 'MYR',
      'name': 'Malaysia Ringgit'
    }, {
      'code': 'MZN',
      'name': 'Mozambique Metical'
    }, {
      'code': 'NAD',
      'name': 'Namibia Dollar'
    }, {
      'code': 'NGN',
      'name': 'Nigeria Naira'
    }, {
      'code': 'NIO',
      'name': 'Nicaragua Cordoba'
    }, {
      'code': 'NOK',
      'name': 'Norway Krone'
    }, {
      'code': 'NPR',
      'name': 'Nepal Rupee'
    }, {
      'code': 'NZD',
      'name': 'New Zealand Dollar'
    }, {
      'code': 'OMR',
      'name': 'Oman Rial'
    }, {
      'code': 'PAB',
      'name': 'Panama Balboa'
    }, {
      'code': 'PEN',
      'name': 'Peru Nuevo Sol'
    }, {
      'code': 'PGK',
      'name': 'Papua New Guinea Kina'
    }, {
      'code': 'PHP',
      'name': 'Philippines Peso'
    }, {
      'code': 'PKR',
      'name': 'Pakistan Rupee'
    }, {
      'code': 'PLN',
      'name': 'Poland Zloty'
    }, {
      'code': 'PYG',
      'name': 'Paraguay Guarani'
    }, {
      'code': 'QAR',
      'name': 'Qatar Riyal'
    }, {
      'code': 'RON',
      'name': 'Romania New Leu'
    }, {
      'code': 'RSD',
      'name': 'Serbia Dinar'
    }, {
      'code': 'RUB',
      'name': 'Russia Ruble'
    }, {
      'code': 'RWF',
      'name': 'Rwanda Franc'
    }, {
      'code': 'SAR',
      'name': 'Saudi Arabia Riyal'
    }, {
      'code': 'SBD',
      'name': 'Solomon Islands Dollar'
    }, {
      'code': 'SCR',
      'name': 'Seychelles Rupee'
    }, {
      'code': 'SDG',
      'name': 'Sudan Pound'
    }, {
      'code': 'SEK',
      'name': 'Sweden Krona'
    }, {
      'code': 'SGD',
      'name': 'Singapore Dollar'
    }, {
      'code': 'SHP',
      'name': 'Saint Helena Pound'
    }, {
      'code': 'SLL',
      'name': 'Sierra Leone Leone'
    }, {
      'code': 'SOS',
      'name': 'Somalia Shilling'
    }, {
      'code': 'SPL',
      'name': 'Seborga Luigino'
    }, {
      'code': 'SRD',
      'name': 'Suriname Dollar'
    }, {
      'code': 'STD',
      'name': 'São Tomé and Príncipe Dobra'
    }, {
      'code': 'SVC',
      'name': 'El Salvador Colon'
    }, {
      'code': 'SYP',
      'name': 'Syria Pound'
    }, {
      'code': 'SZL',
      'name': 'Swaziland Lilangeni'
    }, {
      'code': 'THB',
      'name': 'Thailand Baht'
    }, {
      'code': 'TJS',
      'name': 'Tajikistan Somoni'
    }, {
      'code': 'TMT',
      'name': 'Turkmenistan Manat'
    }, {
      'code': 'TND',
      'name': 'Tunisia Dinar'
    }, {
      'code': 'TOP',
      'name': 'Tonga Pa\'anga'
    }, {
      'code': 'TRY',
      'name': 'Turkey Lira'
    }, {
      'code': 'TTD',
      'name': 'Trinidad and Tobago Dollar'
    }, {
      'code': 'TVD',
      'name': 'Tuvalu Dollar'
    }, {
      'code': 'TWD',
      'name': 'Taiwan New Dollar'
    }, {
      'code': 'TZS',
      'name': 'Tanzania Shilling'
    }, {
      'code': 'UAH',
      'name': 'Ukraine Hryvnia'
    }, {
      'code': 'UGX',
      'name': 'Uganda Shilling'
    }, {
      'code': 'USD',
      'name': 'United States Dollar'
    }, {
      'code': 'UYU',
      'name': 'Uruguay Peso'
    }, {
      'code': 'UZS',
      'name': 'Uzbekistan Som'
    }, {
      'code': 'VEF',
      'name': 'Venezuela Bolivar'
    }, {
      'code': 'VND',
      'name': 'Viet Nam Dong'
    }, {
      'code': 'VUV',
      'name': 'Vanuatu Vatu'
    }, {
      'code': 'WST',
      'name': 'Samoa Tala'
    }, {
      'code': 'XAF',
      'name': 'Communauté Financière Africaine (BEAC) CFA Franc BEAC'
    }, {
      'code': 'XCD',
      'name': 'East Caribbean Dollar'
    }, {
      'code': 'XDR',
      'name': 'International Monetary Fund (IMF) Special Drawing Rights'
    }, {
      'code': 'XOF',
      'name': 'Communauté Financière Africaine (BCEAO) Franc'
    }, {
      'code': 'XPF',
      'name': 'Comptoirs Français du Pacifique (CFP) Franc'
    }, {
      'code': 'YER',
      'name': 'Yemen Rial'
    }, {
      'code': 'ZAR',
      'name': 'South Africa Rand'
    }, {
      'code': 'ZMW',
      'name': 'Zambia Kwacha'
    }, {
      'code': 'ZWD',
      'name': 'Zimbabwe Dollar'
    }]
  };
  var o_hasOwnProperty = Object.prototype.hasOwnProperty;
  var o_keys = Object.keys || function (obj) {
    var result = [];
    for (var key in obj) {
      if (o_hasOwnProperty.call(obj, key)) {
        result.push(key);
      }
    }
    return result;
  };
  function _copyObject(source, target) {
    var keys = o_keys(source);
    var key;
    for (var i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      target[key] = source[key] || target[key];
    }
  }
  function _copyArray(source, target) {
    for (var i = 0, l = source.length; i < l; i++) {
      target[i] = source[i];
    }
  }
  function copyObject(source, _target) {
    var isArray = Array.isArray(source);
    var target = _target || (isArray ? new Array(source.length) : {});
    if (isArray) {
      _copyArray(source, target);
    } else {
      _copyObject(source, target);
    }
    return target;
  }

  /** Get the data based on key**/
  Chance.prototype.get = function (name) {
    return copyObject(data[name]);
  };

  // Mac Address
  Chance.prototype.mac_address = function (options) {
    // typically mac addresses are separated by ":"
    // however they can also be separated by "-"
    // the network variant uses a dot every fourth byte

    options = initOptions(options);
    if (!options.separator) {
      options.separator = options.networkVersion ? "." : ":";
    }
    var mac_pool = "ABCDEF1234567890",
      mac = "";
    if (!options.networkVersion) {
      mac = this.n(this.string, 6, {
        pool: mac_pool,
        length: 2
      }).join(options.separator);
    } else {
      mac = this.n(this.string, 3, {
        pool: mac_pool,
        length: 4
      }).join(options.separator);
    }
    return mac;
  };
  Chance.prototype.normal = function (options) {
    options = initOptions(options, {
      mean: 0,
      dev: 1
    });

    // The Marsaglia Polar method
    var s,
      u,
      v,
      norm,
      mean = options.mean,
      dev = options.dev;
    do {
      // U and V are from the uniform distribution on (-1, 1)
      u = this.random() * 2 - 1;
      v = this.random() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1);

    // Compute the standard normal variate
    norm = u * Math.sqrt(-2 * Math.log(s) / s);

    // Shape and scale
    return dev * norm + mean;
  };
  Chance.prototype.radio = function (options) {
    // Initial Letter (Typically Designated by Side of Mississippi River)
    options = initOptions(options, {
      side: "?"
    });
    var fl = "";
    switch (options.side.toLowerCase()) {
      case "east":
      case "e":
        fl = "W";
        break;
      case "west":
      case "w":
        fl = "K";
        break;
      default:
        fl = this.character({
          pool: "KW"
        });
        break;
    }
    return fl + this.character({
      alpha: true,
      casing: "upper"
    }) + this.character({
      alpha: true,
      casing: "upper"
    }) + this.character({
      alpha: true,
      casing: "upper"
    });
  };

  // Set the data as key and data or the data map
  Chance.prototype.set = function (name, values) {
    if (typeof name === "string") {
      data[name] = values;
    } else {
      data = copyObject(name, data);
    }
  };
  Chance.prototype.tv = function (options) {
    return this.radio(options);
  };

  // ID number for Brazil companies
  Chance.prototype.cnpj = function () {
    var n = this.n(this.natural, 8, {
      max: 9
    });
    var d1 = 2 + n[7] * 6 + n[6] * 7 + n[5] * 8 + n[4] * 9 + n[3] * 2 + n[2] * 3 + n[1] * 4 + n[0] * 5;
    d1 = 11 - d1 % 11;
    if (d1 >= 10) {
      d1 = 0;
    }
    var d2 = d1 * 2 + 3 + n[7] * 7 + n[6] * 8 + n[5] * 9 + n[4] * 2 + n[3] * 3 + n[2] * 4 + n[1] * 5 + n[0] * 6;
    d2 = 11 - d2 % 11;
    if (d2 >= 10) {
      d2 = 0;
    }
    return '' + n[0] + n[1] + '.' + n[2] + n[3] + n[4] + '.' + n[5] + n[6] + n[7] + '/0001-' + d1 + d2;
  };

  // -- End Miscellaneous --

  Chance.prototype.mersenne_twister = function (seed) {
    return new MersenneTwister(seed);
  };
  Chance.prototype.blueimp_md5 = function () {
    return new BlueImpMD5();
  };

  // Mersenne Twister from https://gist.github.com/banksean/300494
  var MersenneTwister = function MersenneTwister(seed) {
    if (seed === undefined) {
      // kept random number same size as time used previously to ensure no unexpected results downstream
      seed = Math.floor(Math.random() * Math.pow(10, 13));
    }
    /* Period parameters */
    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 0x9908b0df; /* constant vector a */
    this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
    this.LOWER_MASK = 0x7fffffff; /* least significant r bits */

    this.mt = new Array(this.N); /* the array for the state vector */
    this.mti = this.N + 1; /* mti==N + 1 means mt[N] is not initialized */

    this.init_genrand(seed);
  };

  /* initializes mt[N] with a seed */
  MersenneTwister.prototype.init_genrand = function (s) {
    this.mt[0] = s >>> 0;
    for (this.mti = 1; this.mti < this.N; this.mti++) {
      s = this.mt[this.mti - 1] ^ this.mt[this.mti - 1] >>> 30;
      this.mt[this.mti] = (((s & 0xffff0000) >>> 16) * 1812433253 << 16) + (s & 0x0000ffff) * 1812433253 + this.mti;
      /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
      /* In the previous versions, MSBs of the seed affect   */
      /* only MSBs of the array mt[].                        */
      /* 2002/01/09 modified by Makoto Matsumoto             */
      this.mt[this.mti] >>>= 0;
      /* for >32 bit machines */
    }
  };

  /* initialize by an array with array-length */
  /* init_key is the array for initializing keys */
  /* key_length is its length */
  /* slight change for C++, 2004/2/26 */
  MersenneTwister.prototype.init_by_array = function (init_key, key_length) {
    var i = 1,
      j = 0,
      k,
      s;
    this.init_genrand(19650218);
    k = this.N > key_length ? this.N : key_length;
    for (; k; k--) {
      s = this.mt[i - 1] ^ this.mt[i - 1] >>> 30;
      this.mt[i] = (this.mt[i] ^ (((s & 0xffff0000) >>> 16) * 1664525 << 16) + (s & 0x0000ffff) * 1664525) + init_key[j] + j; /* non linear */
      this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
      i++;
      j++;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
      if (j >= key_length) {
        j = 0;
      }
    }
    for (k = this.N - 1; k; k--) {
      s = this.mt[i - 1] ^ this.mt[i - 1] >>> 30;
      this.mt[i] = (this.mt[i] ^ (((s & 0xffff0000) >>> 16) * 1566083941 << 16) + (s & 0x0000ffff) * 1566083941) - i; /* non linear */
      this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
      i++;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
    }
    this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
  };

  /* generates a random number on [0,0xffffffff]-interval */
  MersenneTwister.prototype.genrand_int32 = function () {
    var y;
    var mag01 = new Array(0x0, this.MATRIX_A);
    /* mag01[x] = x * MATRIX_A  for x=0,1 */

    if (this.mti >= this.N) {
      /* generate N words at one time */
      var kk;
      if (this.mti === this.N + 1) {
        /* if init_genrand() has not been called, */
        this.init_genrand(5489); /* a default initial seed is used */
      }
      for (kk = 0; kk < this.N - this.M; kk++) {
        y = this.mt[kk] & this.UPPER_MASK | this.mt[kk + 1] & this.LOWER_MASK;
        this.mt[kk] = this.mt[kk + this.M] ^ y >>> 1 ^ mag01[y & 0x1];
      }
      for (; kk < this.N - 1; kk++) {
        y = this.mt[kk] & this.UPPER_MASK | this.mt[kk + 1] & this.LOWER_MASK;
        this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ y >>> 1 ^ mag01[y & 0x1];
      }
      y = this.mt[this.N - 1] & this.UPPER_MASK | this.mt[0] & this.LOWER_MASK;
      this.mt[this.N - 1] = this.mt[this.M - 1] ^ y >>> 1 ^ mag01[y & 0x1];
      this.mti = 0;
    }
    y = this.mt[this.mti++];

    /* Tempering */
    y ^= y >>> 11;
    y ^= y << 7 & 0x9d2c5680;
    y ^= y << 15 & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  };

  /* generates a random number on [0,0x7fffffff]-interval */
  MersenneTwister.prototype.genrand_int31 = function () {
    return this.genrand_int32() >>> 1;
  };

  /* generates a random number on [0,1]-real-interval */
  MersenneTwister.prototype.genrand_real1 = function () {
    return this.genrand_int32() * (1.0 / 4294967295.0);
    /* divided by 2^32-1 */
  };

  /* generates a random number on [0,1)-real-interval */
  MersenneTwister.prototype.random = function () {
    return this.genrand_int32() * (1.0 / 4294967296.0);
    /* divided by 2^32 */
  };

  /* generates a random number on (0,1)-real-interval */
  MersenneTwister.prototype.genrand_real3 = function () {
    return (this.genrand_int32() + 0.5) * (1.0 / 4294967296.0);
    /* divided by 2^32 */
  };

  /* generates a random number on [0,1) with 53-bit resolution*/
  MersenneTwister.prototype.genrand_res53 = function () {
    var a = this.genrand_int32() >>> 5,
      b = this.genrand_int32() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  };

  // BlueImp MD5 hashing algorithm from https://github.com/blueimp/JavaScript-MD5
  var BlueImpMD5 = function BlueImpMD5() {};
  BlueImpMD5.prototype.VERSION = '1.0.1';

  /*
  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
  * to work around bugs in some JS interpreters.
  */
  BlueImpMD5.prototype.safe_add = function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 0xFFFF;
  };

  /*
  * Bitwise rotate a 32-bit number to the left.
  */
  BlueImpMD5.prototype.bit_roll = function (num, cnt) {
    return num << cnt | num >>> 32 - cnt;
  };

  /*
  * These functions implement the five basic operations the algorithm uses.
  */
  BlueImpMD5.prototype.md5_cmn = function (q, a, b, x, s, t) {
    return this.safe_add(this.bit_roll(this.safe_add(this.safe_add(a, q), this.safe_add(x, t)), s), b);
  };
  BlueImpMD5.prototype.md5_ff = function (a, b, c, d, x, s, t) {
    return this.md5_cmn(b & c | ~b & d, a, b, x, s, t);
  };
  BlueImpMD5.prototype.md5_gg = function (a, b, c, d, x, s, t) {
    return this.md5_cmn(b & d | c & ~d, a, b, x, s, t);
  };
  BlueImpMD5.prototype.md5_hh = function (a, b, c, d, x, s, t) {
    return this.md5_cmn(b ^ c ^ d, a, b, x, s, t);
  };
  BlueImpMD5.prototype.md5_ii = function (a, b, c, d, x, s, t) {
    return this.md5_cmn(c ^ (b | ~d), a, b, x, s, t);
  };

  /*
  * Calculate the MD5 of an array of little-endian words, and a bit length.
  */
  BlueImpMD5.prototype.binl_md5 = function (x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << len % 32;
    x[(len + 64 >>> 9 << 4) + 14] = len;
    var i,
      olda,
      oldb,
      oldc,
      oldd,
      a = 1732584193,
      b = -271733879,
      c = -1732584194,
      d = 271733878;
    for (i = 0; i < x.length; i += 16) {
      olda = a;
      oldb = b;
      oldc = c;
      oldd = d;
      a = this.md5_ff(a, b, c, d, x[i], 7, -680876936);
      d = this.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = this.md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = this.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = this.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = this.md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = this.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = this.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = this.md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = this.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = this.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
      b = this.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = this.md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = this.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = this.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = this.md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = this.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = this.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = this.md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = this.md5_gg(b, c, d, a, x[i], 20, -373897302);
      a = this.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = this.md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = this.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = this.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = this.md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = this.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = this.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = this.md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = this.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = this.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = this.md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = this.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = this.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
      d = this.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = this.md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = this.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = this.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = this.md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = this.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = this.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = this.md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = this.md5_hh(d, a, b, c, x[i], 11, -358537222);
      c = this.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = this.md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = this.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = this.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = this.md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = this.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = this.md5_ii(a, b, c, d, x[i], 6, -198630844);
      d = this.md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = this.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = this.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = this.md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = this.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = this.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = this.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = this.md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = this.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = this.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = this.md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = this.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = this.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = this.md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = this.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = this.safe_add(a, olda);
      b = this.safe_add(b, oldb);
      c = this.safe_add(c, oldc);
      d = this.safe_add(d, oldd);
    }
    return [a, b, c, d];
  };

  /*
  * Convert an array of little-endian words to a string
  */
  BlueImpMD5.prototype.binl2rstr = function (input) {
    var i,
      output = '';
    for (i = 0; i < input.length * 32; i += 8) {
      output += String.fromCharCode(input[i >> 5] >>> i % 32 & 0xFF);
    }
    return output;
  };

  /*
  * Convert a raw string to an array of little-endian words
  * Characters >255 have their high-byte silently ignored.
  */
  BlueImpMD5.prototype.rstr2binl = function (input) {
    var i,
      output = [];
    output[(input.length >> 2) - 1] = undefined;
    for (i = 0; i < output.length; i += 1) {
      output[i] = 0;
    }
    for (i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << i % 32;
    }
    return output;
  };

  /*
  * Calculate the MD5 of a raw string
  */
  BlueImpMD5.prototype.rstr_md5 = function (s) {
    return this.binl2rstr(this.binl_md5(this.rstr2binl(s), s.length * 8));
  };

  /*
  * Calculate the HMAC-MD5, of a key and some data (raw strings)
  */
  BlueImpMD5.prototype.rstr_hmac_md5 = function (key, data) {
    var i,
      bkey = this.rstr2binl(key),
      ipad = [],
      opad = [],
      hash;
    ipad[15] = opad[15] = undefined;
    if (bkey.length > 16) {
      bkey = this.binl_md5(bkey, key.length * 8);
    }
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }
    hash = this.binl_md5(ipad.concat(this.rstr2binl(data)), 512 + data.length * 8);
    return this.binl2rstr(this.binl_md5(opad.concat(hash), 512 + 128));
  };

  /*
  * Convert a raw string to a hex string
  */
  BlueImpMD5.prototype.rstr2hex = function (input) {
    var hex_tab = '0123456789abcdef',
      output = '',
      x,
      i;
    for (i = 0; i < input.length; i += 1) {
      x = input.charCodeAt(i);
      output += hex_tab.charAt(x >>> 4 & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
  };

  /*
  * Encode a string as utf-8
  */
  BlueImpMD5.prototype.str2rstr_utf8 = function (input) {
    return unescape(encodeURIComponent(input));
  };

  /*
  * Take string arguments and return either raw or hex encoded strings
  */
  BlueImpMD5.prototype.raw_md5 = function (s) {
    return this.rstr_md5(this.str2rstr_utf8(s));
  };
  BlueImpMD5.prototype.hex_md5 = function (s) {
    return this.rstr2hex(this.raw_md5(s));
  };
  BlueImpMD5.prototype.raw_hmac_md5 = function (k, d) {
    return this.rstr_hmac_md5(this.str2rstr_utf8(k), this.str2rstr_utf8(d));
  };
  BlueImpMD5.prototype.hex_hmac_md5 = function (k, d) {
    return this.rstr2hex(this.raw_hmac_md5(k, d));
  };
  BlueImpMD5.prototype.md5 = function (string, key, raw) {
    if (!key) {
      if (!raw) {
        return this.hex_md5(string);
      }
      return this.raw_md5(string);
    }
    if (!raw) {
      return this.hex_hmac_md5(key, string);
    }
    return this.raw_hmac_md5(key, string);
  };

  // CommonJS module
  if (true) {
    if ( true && module.exports) {
      exports = module.exports = Chance;
    }
    exports.Chance = Chance;
  }

  // Register as an anonymous AMD module
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      return Chance;
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }

  // if there is a importsScrips object define chance for worker
  if (typeof importScripts !== 'undefined') {
    chance = new Chance();
  }

  // If there is a window object, that at least has a document property,
  // instantiate and define chance on the window
  if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && _typeof(window.document) === "object") {
    window.Chance = Chance;
    window.chance = new Chance();
  }
})();

/***/ }),

/***/ "./client/js/util/colorconversions.js":
/*!********************************************!*\
  !*** ./client/js/util/colorconversions.js ***!
  \********************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(function (root, factory) {
  if (true) {
    // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(this, function () {
  //https://github.com/harthur/color-convert
  /* MIT license */

  return {
    rgb2hsl: rgb2hsl,
    rgb2hsv: rgb2hsv,
    rgb2hwb: rgb2hwb,
    rgb2cmyk: rgb2cmyk,
    rgb2keyword: rgb2keyword,
    rgb2xyz: rgb2xyz,
    rgb2lab: rgb2lab,
    rgb2lch: rgb2lch,
    hsl2rgb: hsl2rgb,
    hsl2hsv: hsl2hsv,
    hsl2hwb: hsl2hwb,
    hsl2cmyk: hsl2cmyk,
    hsl2keyword: hsl2keyword,
    hsv2rgb: hsv2rgb,
    hsv2hsl: hsv2hsl,
    hsv2hwb: hsv2hwb,
    hsv2cmyk: hsv2cmyk,
    hsv2keyword: hsv2keyword,
    hwb2rgb: hwb2rgb,
    hwb2hsl: hwb2hsl,
    hwb2hsv: hwb2hsv,
    hwb2cmyk: hwb2cmyk,
    hwb2keyword: hwb2keyword,
    cmyk2rgb: cmyk2rgb,
    cmyk2hsl: cmyk2hsl,
    cmyk2hsv: cmyk2hsv,
    cmyk2hwb: cmyk2hwb,
    cmyk2keyword: cmyk2keyword,
    keyword2rgb: keyword2rgb,
    keyword2hsl: keyword2hsl,
    keyword2hsv: keyword2hsv,
    keyword2hwb: keyword2hwb,
    keyword2cmyk: keyword2cmyk,
    keyword2lab: keyword2lab,
    keyword2xyz: keyword2xyz,
    xyz2rgb: xyz2rgb,
    xyz2lab: xyz2lab,
    xyz2lch: xyz2lch,
    lab2xyz: lab2xyz,
    lab2rgb: lab2rgb,
    lab2lch: lab2lch,
    lch2lab: lch2lab,
    lch2xyz: lch2xyz,
    lch2rgb: lch2rgb
  };
  function rgb2hsl(rgb) {
    var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h,
      s,
      l;
    if (max == min) h = 0;else if (r == max) h = (g - b) / delta;else if (g == max) h = 2 + (b - r) / delta;else if (b == max) h = 4 + (r - g) / delta;
    h = Math.min(h * 60, 360);
    if (h < 0) h += 360;
    l = (min + max) / 2;
    if (max == min) s = 0;else if (l <= 0.5) s = delta / (max + min);else s = delta / (2 - max - min);
    return [h, s * 100, l * 100];
  }
  function rgb2hsv(rgb) {
    var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h,
      s,
      v;
    if (max == 0) s = 0;else s = delta / max * 1000 / 10;
    if (max == min) h = 0;else if (r == max) h = (g - b) / delta;else if (g == max) h = 2 + (b - r) / delta;else if (b == max) h = 4 + (r - g) / delta;
    h = Math.min(h * 60, 360);
    if (h < 0) h += 360;
    v = max / 255 * 1000 / 10;
    return [h, s, v];
  }
  function rgb2hwb(rgb) {
    var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      h = rgb2hsl(rgb)[0],
      w = 1 / 255 * Math.min(r, Math.min(g, b)),
      b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
    return [h, w * 100, b * 100];
  }
  function rgb2cmyk(rgb) {
    var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      c,
      m,
      y,
      k;
    k = Math.min(1 - r, 1 - g, 1 - b);
    c = (1 - r - k) / (1 - k) || 0;
    m = (1 - g - k) / (1 - k) || 0;
    y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
  }
  function rgb2keyword(rgb) {
    return reverseKeywords[JSON.stringify(rgb)];
  }
  function rgb2xyz(rgb) {
    var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

    // assume sRGB
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    var z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x * 100, y * 100, z * 100];
  }
  function rgb2lab(rgb) {
    var xyz = rgb2xyz(rgb),
      x = xyz[0],
      y = xyz[1],
      z = xyz[2],
      l,
      a,
      b;
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);
    return [l, a, b];
  }
  function rgb2lch(args) {
    return lab2lch(rgb2lab(args));
  }
  function hsl2rgb(hsl) {
    var h = hsl[0] / 360,
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      t1,
      t2,
      t3,
      rgb,
      val;
    if (s == 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) t2 = l * (1 + s);else t2 = l + s - l * s;
    t1 = 2 * l - t2;
    rgb = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      t3 < 0 && t3++;
      t3 > 1 && t3--;
      if (6 * t3 < 1) val = t1 + (t2 - t1) * 6 * t3;else if (2 * t3 < 1) val = t2;else if (3 * t3 < 2) val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;else val = t1;
      rgb[i] = val * 255;
    }
    return rgb;
  }
  function hsl2hsv(hsl) {
    var h = hsl[0],
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      sv,
      v;
    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    v = (l + s) / 2;
    sv = 2 * s / (l + s);
    return [h, sv * 100, v * 100];
  }
  function hsl2hwb(args) {
    return rgb2hwb(hsl2rgb(args));
  }
  function hsl2cmyk(args) {
    return rgb2cmyk(hsl2rgb(args));
  }
  function hsl2keyword(args) {
    return rgb2keyword(hsl2rgb(args));
  }
  function hsv2rgb(hsv) {
    var h = hsv[0] / 60,
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      hi = Math.floor(h) % 6;
    var f = h - Math.floor(h),
      p = 255 * v * (1 - s),
      q = 255 * v * (1 - s * f),
      t = 255 * v * (1 - s * (1 - f)),
      v = 255 * v;
    switch (hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  }
  function hsv2hsl(hsv) {
    var h = hsv[0],
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      sl,
      l;
    l = (2 - s) * v;
    sl = s * v;
    sl /= l <= 1 ? l : 2 - l;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  }
  function hsv2hwb(args) {
    return rgb2hwb(hsv2rgb(args));
  }
  function hsv2cmyk(args) {
    return rgb2cmyk(hsv2rgb(args));
  }
  function hsv2keyword(args) {
    return rgb2keyword(hsv2rgb(args));
  }

  // http://dev.w3.org/csswg/css-color/#hwb-to-rgb
  function hwb2rgb(hwb) {
    var h = hwb[0] / 360,
      wh = hwb[1] / 100,
      bl = hwb[2] / 100,
      ratio = wh + bl,
      i,
      v,
      f,
      n;

    // wh + bl cant be > 1
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }
    i = Math.floor(6 * h);
    v = 1 - bl;
    f = 6 * h - i;
    if ((i & 0x01) != 0) {
      f = 1 - f;
    }
    n = wh + f * (v - wh); // linear interpolation

    switch (i) {
      default:
      case 6:
      case 0:
        r = v;
        g = n;
        b = wh;
        break;
      case 1:
        r = n;
        g = v;
        b = wh;
        break;
      case 2:
        r = wh;
        g = v;
        b = n;
        break;
      case 3:
        r = wh;
        g = n;
        b = v;
        break;
      case 4:
        r = n;
        g = wh;
        b = v;
        break;
      case 5:
        r = v;
        g = wh;
        b = n;
        break;
    }
    return [r * 255, g * 255, b * 255];
  }
  function hwb2hsl(args) {
    return rgb2hsl(hwb2rgb(args));
  }
  function hwb2hsv(args) {
    return rgb2hsv(hwb2rgb(args));
  }
  function hwb2cmyk(args) {
    return rgb2cmyk(hwb2rgb(args));
  }
  function hwb2keyword(args) {
    return rgb2keyword(hwb2rgb(args));
  }
  function cmyk2rgb(cmyk) {
    var c = cmyk[0] / 100,
      m = cmyk[1] / 100,
      y = cmyk[2] / 100,
      k = cmyk[3] / 100,
      r,
      g,
      b;
    r = 1 - Math.min(1, c * (1 - k) + k);
    g = 1 - Math.min(1, m * (1 - k) + k);
    b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  }
  function cmyk2hsl(args) {
    return rgb2hsl(cmyk2rgb(args));
  }
  function cmyk2hsv(args) {
    return rgb2hsv(cmyk2rgb(args));
  }
  function cmyk2hwb(args) {
    return rgb2hwb(cmyk2rgb(args));
  }
  function cmyk2keyword(args) {
    return rgb2keyword(cmyk2rgb(args));
  }
  function xyz2rgb(xyz) {
    var x = xyz[0] / 100,
      y = xyz[1] / 100,
      z = xyz[2] / 100,
      r,
      g,
      b;
    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    // assume sRGB
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 : r = r * 12.92;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 : g = g * 12.92;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055 : b = b * 12.92;
    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);
    return [r * 255, g * 255, b * 255];
  }
  function xyz2lab(xyz) {
    var x = xyz[0],
      y = xyz[1],
      z = xyz[2],
      l,
      a,
      b;
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);
    return [l, a, b];
  }
  function xyz2lch(args) {
    return lab2lch(xyz2lab(args));
  }
  function lab2xyz(lab) {
    var l = lab[0],
      a = lab[1],
      b = lab[2],
      x,
      y,
      z,
      y2;
    if (l <= 8) {
      y = l * 100 / 903.3;
      y2 = 7.787 * (y / 100) + 16 / 116;
    } else {
      y = 100 * Math.pow((l + 16) / 116, 3);
      y2 = Math.pow(y / 100, 1 / 3);
    }
    x = x / 95.047 <= 0.008856 ? x = 95.047 * (a / 500 + y2 - 16 / 116) / 7.787 : 95.047 * Math.pow(a / 500 + y2, 3);
    z = z / 108.883 <= 0.008859 ? z = 108.883 * (y2 - b / 200 - 16 / 116) / 7.787 : 108.883 * Math.pow(y2 - b / 200, 3);
    return [x, y, z];
  }
  function lab2lch(lab) {
    var l = lab[0],
      a = lab[1],
      b = lab[2],
      hr,
      h,
      c;
    hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;
    if (h < 0) {
      h += 360;
    }
    c = Math.sqrt(a * a + b * b);
    return [l, c, h];
  }
  function lab2rgb(args) {
    return xyz2rgb(lab2xyz(args));
  }
  function lch2lab(lch) {
    var l = lch[0],
      c = lch[1],
      h = lch[2],
      a,
      b,
      hr;
    hr = h / 360 * 2 * Math.PI;
    a = c * Math.cos(hr);
    b = c * Math.sin(hr);
    return [l, a, b];
  }
  function lch2xyz(args) {
    return lab2xyz(lch2lab(args));
  }
  function lch2rgb(args) {
    return lab2rgb(lch2lab(args));
  }
  function keyword2rgb(keyword) {
    return cssKeywords[keyword];
  }
  function keyword2hsl(args) {
    return rgb2hsl(keyword2rgb(args));
  }
  function keyword2hsv(args) {
    return rgb2hsv(keyword2rgb(args));
  }
  function keyword2hwb(args) {
    return rgb2hwb(keyword2rgb(args));
  }
  function keyword2cmyk(args) {
    return rgb2cmyk(keyword2rgb(args));
  }
  function keyword2lab(args) {
    return rgb2lab(keyword2rgb(args));
  }
  function keyword2xyz(args) {
    return rgb2xyz(keyword2rgb(args));
  }
  var cssKeywords = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };
  var reverseKeywords = {};
  for (var key in cssKeywords) {
    reverseKeywords[JSON.stringify(cssKeywords[key])] = key;
  }
});

/***/ }),

/***/ "./client/js/util/data-clone.js":
/*!**************************************!*\
  !*** ./client/js/util/data-clone.js ***!
  \**************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  var _ = __webpack_require__(/*! ./underscore */ "./client/js/util/underscore.js");
  function deepClone(data) {
    if (!data) return data;

    // Handle primitive types
    if (_typeof(data) !== 'object') return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(deepClone);
    }

    // Handle objects
    if (data instanceof Object) {
      var clone = {};
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          clone[key] = deepClone(data[key]);
        }
      }
      return clone;
    }

    // Handle other types (Date, RegExp, etc)
    return data;
  }
  return {
    clone: deepClone,
    cloneMessage: function cloneMessage(message, data) {
      return {
        message: message,
        data: deepClone(data),
        timestamp: Date.now()
      };
    }
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/util/listmap.js":
/*!***********************************!*\
  !*** ./client/js/util/listmap.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var mori__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mori */ "mori");
/* harmony import */ var mori__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mori__WEBPACK_IMPORTED_MODULE_0__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var ListMap = /*#__PURE__*/function () {
  function ListMap() {
    _classCallCheck(this, ListMap);
    this.map = (mori__WEBPACK_IMPORTED_MODULE_0___default()) ? (typeof (mori__WEBPACK_IMPORTED_MODULE_0___default().hashMap) === 'function' ? (mori__WEBPACK_IMPORTED_MODULE_0___default().hashMap) : (mori__WEBPACK_IMPORTED_MODULE_0___default().hash_map))() : {};
  }
  return _createClass(ListMap, [{
    key: "get",
    value: function get(key) {
      if ((mori__WEBPACK_IMPORTED_MODULE_0___default())) {
        return mori__WEBPACK_IMPORTED_MODULE_0___default().get(this.map, key);
      }
      return this.map[key];
    }
  }, {
    key: "has",
    value: function has(key) {
      if ((mori__WEBPACK_IMPORTED_MODULE_0___default())) {
        return mori__WEBPACK_IMPORTED_MODULE_0___default().has_key(this.map, key);
      }
      return key in this.map;
    }
  }, {
    key: "set",
    value: function set(key, value) {
      if ((mori__WEBPACK_IMPORTED_MODULE_0___default())) {
        this.map = mori__WEBPACK_IMPORTED_MODULE_0___default().assoc(this.map, key, value);
      } else {
        this.map[key] = value;
      }
      return this;
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      if ((mori__WEBPACK_IMPORTED_MODULE_0___default())) {
        this.map = mori__WEBPACK_IMPORTED_MODULE_0___default().dissoc(this.map, key);
      } else {
        delete this.map[key];
      }
      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      if ((mori__WEBPACK_IMPORTED_MODULE_0___default())) {
        this.map = mori__WEBPACK_IMPORTED_MODULE_0___default().hash_map();
      } else {
        this.map = {};
      }
      return this;
    }
  }, {
    key: "keys",
    value: function keys() {
      if ((mori__WEBPACK_IMPORTED_MODULE_0___default())) {
        return mori__WEBPACK_IMPORTED_MODULE_0___default().keys(this.map);
      }
      return Object.keys(this.map);
    }
  }, {
    key: "values",
    value: function values() {
      if ((mori__WEBPACK_IMPORTED_MODULE_0___default())) {
        return mori__WEBPACK_IMPORTED_MODULE_0___default().vals(this.map);
      }
      return Object.values(this.map);
    }
  }, {
    key: "entries",
    value: function entries() {
      if ((mori__WEBPACK_IMPORTED_MODULE_0___default())) {
        return mori__WEBPACK_IMPORTED_MODULE_0___default().seq(this.map);
      }
      return Object.entries(this.map);
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ListMap);

/***/ }),

/***/ "./client/js/util/mori.js":
/*!********************************!*\
  !*** ./client/js/util/mori.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Use the global mori object
var mori = window.mori;
if (!mori) {
  throw new Error('Mori library not loaded. Please ensure mori is properly included in your dependencies.');
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (mori);

/***/ }),

/***/ "./client/js/util/random.js":
/*!**********************************!*\
  !*** ./client/js/util/random.js ***!
  \**********************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
  return {
    /**
     * Returns a random integer between min and max (inclusive)
     * @param {number} min - The minimum value
     * @param {number} max - The maximum value
     * @returns {number} A random integer between min and max
     */
    random: function random(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    /**
     * Returns a random float between min and max
     * @param {number} min - The minimum value
     * @param {number} max - The maximum value
     * @returns {number} A random float between min and max
     */
    randomFloat: function randomFloat(min, max) {
      return Math.random() * (max - min) + min;
    },
    /**
     * Returns a random element from an array
     * @param {Array} array - The array to pick from
     * @returns {*} A random element from the array
     */
    pick: function pick(array) {
      return array[Math.floor(Math.random() * array.length)];
    },
    /**
     * Returns true with the given probability
     * @param {number} probability - Probability between 0 and 1
     * @returns {boolean} True with the given probability
     */
    chance: function chance(probability) {
      return Math.random() < probability;
    }
  };
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./client/js/util/tinycolor.js":
/*!*************************************!*\
  !*** ./client/js/util/tinycolor.js ***!
  \*************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// TinyColor v1.1.2
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

(function () {
  var trimLeft = /^[\s,#]+/,
    trimRight = /\s+$/,
    tinyCounter = 0,
    math = Math,
    mathRound = math.round,
    mathMin = math.min,
    mathMax = math.max,
    mathRandom = math.random;
  function tinycolor(color, opts) {
    color = color ? color : '';
    opts = opts || {};

    // If input is already a tinycolor, return itself
    if (color instanceof tinycolor) {
      return color;
    }
    // If we are called as a function, call using new instead
    if (!(this instanceof tinycolor)) {
      return new tinycolor(color, opts);
    }
    var rgb = inputToRGB(color);
    this._originalInput = color, this._r = rgb.r, this._g = rgb.g, this._b = rgb.b, this._a = rgb.a, this._roundA = mathRound(100 * this._a) / 100, this._format = opts.format || rgb.format;
    this._gradientType = opts.gradientType;

    // Don't let the range of [0,255] come back in [0,1].
    // Potentially lose a little bit of precision here, but will fix issues where
    // .5 gets interpreted as half of the total, instead of half of 1
    // If it was supposed to be 128, this was already taken care of by `inputToRgb`
    if (this._r < 1) {
      this._r = mathRound(this._r);
    }
    if (this._g < 1) {
      this._g = mathRound(this._g);
    }
    if (this._b < 1) {
      this._b = mathRound(this._b);
    }
    this._ok = rgb.ok;
    this._tc_id = tinyCounter++;
  }
  tinycolor.prototype = {
    isDark: function isDark() {
      return this.getBrightness() < 128;
    },
    isLight: function isLight() {
      return !this.isDark();
    },
    isValid: function isValid() {
      return this._ok;
    },
    getOriginalInput: function getOriginalInput() {
      return this._originalInput;
    },
    getFormat: function getFormat() {
      return this._format;
    },
    getAlpha: function getAlpha() {
      return this._a;
    },
    getBrightness: function getBrightness() {
      //http://www.w3.org/TR/AERT#color-contrast
      var rgb = this.toRgb();
      return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    },
    getLuminance: function getLuminance() {
      //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
      var rgb = this.toRgb();
      var RsRGB, GsRGB, BsRGB, R, G, B;
      RsRGB = rgb.r / 255;
      GsRGB = rgb.g / 255;
      BsRGB = rgb.b / 255;
      if (RsRGB <= 0.03928) {
        R = RsRGB / 12.92;
      } else {
        R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
      }
      if (GsRGB <= 0.03928) {
        G = GsRGB / 12.92;
      } else {
        G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
      }
      if (BsRGB <= 0.03928) {
        B = BsRGB / 12.92;
      } else {
        B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
      }
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    },
    setAlpha: function setAlpha(value) {
      this._a = boundAlpha(value);
      this._roundA = mathRound(100 * this._a) / 100;
      return this;
    },
    toHsv: function toHsv() {
      var hsv = rgbToHsv(this._r, this._g, this._b);
      return {
        h: hsv.h * 360,
        s: hsv.s,
        v: hsv.v,
        a: this._a
      };
    },
    toHsvString: function toHsvString() {
      var hsv = rgbToHsv(this._r, this._g, this._b);
      var h = mathRound(hsv.h * 360),
        s = mathRound(hsv.s * 100),
        v = mathRound(hsv.v * 100);
      return this._a == 1 ? 'hsv(' + h + ', ' + s + '%, ' + v + '%)' : 'hsva(' + h + ', ' + s + '%, ' + v + '%, ' + this._roundA + ')';
    },
    toHsl: function toHsl() {
      var hsl = rgbToHsl(this._r, this._g, this._b);
      return {
        h: hsl.h * 360,
        s: hsl.s,
        l: hsl.l,
        a: this._a
      };
    },
    toHslString: function toHslString() {
      var hsl = rgbToHsl(this._r, this._g, this._b);
      var h = mathRound(hsl.h * 360),
        s = mathRound(hsl.s * 100),
        l = mathRound(hsl.l * 100);
      return this._a == 1 ? 'hsl(' + h + ', ' + s + '%, ' + l + '%)' : 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + this._roundA + ')';
    },
    toHex: function toHex(allow3Char) {
      return rgbToHex(this._r, this._g, this._b, allow3Char);
    },
    toHexString: function toHexString(allow3Char) {
      return '#' + this.toHex(allow3Char);
    },
    toHex8: function toHex8() {
      return rgbaToHex(this._r, this._g, this._b, this._a);
    },
    toHex8String: function toHex8String() {
      return '#' + this.toHex8();
    },
    toRgb: function toRgb() {
      return {
        r: mathRound(this._r),
        g: mathRound(this._g),
        b: mathRound(this._b),
        a: this._a
      };
    },
    toRgbString: function toRgbString() {
      return this._a == 1 ? 'rgb(' + mathRound(this._r) + ', ' + mathRound(this._g) + ', ' + mathRound(this._b) + ')' : 'rgba(' + mathRound(this._r) + ', ' + mathRound(this._g) + ', ' + mathRound(this._b) + ', ' + this._roundA + ')';
    },
    toPercentageRgb: function toPercentageRgb() {
      return {
        r: mathRound(bound01(this._r, 255) * 100) + '%',
        g: mathRound(bound01(this._g, 255) * 100) + '%',
        b: mathRound(bound01(this._b, 255) * 100) + '%',
        a: this._a
      };
    },
    toPercentageRgbString: function toPercentageRgbString() {
      return this._a == 1 ? 'rgb(' + mathRound(bound01(this._r, 255) * 100) + '%, ' + mathRound(bound01(this._g, 255) * 100) + '%, ' + mathRound(bound01(this._b, 255) * 100) + '%)' : 'rgba(' + mathRound(bound01(this._r, 255) * 100) + '%, ' + mathRound(bound01(this._g, 255) * 100) + '%, ' + mathRound(bound01(this._b, 255) * 100) + '%, ' + this._roundA + ')';
    },
    toName: function toName() {
      if (this._a === 0) {
        return 'transparent';
      }
      if (this._a < 1) {
        return false;
      }
      return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
    },
    toFilter: function toFilter(secondColor) {
      var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
      var secondHex8String = hex8String;
      var gradientType = this._gradientType ? 'GradientType = 1, ' : '';
      if (secondColor) {
        var s = tinycolor(secondColor);
        secondHex8String = s.toHex8String();
      }
      return 'progid:DXImageTransform.Microsoft.gradient(' + gradientType + 'startColorstr=' + hex8String + ',endColorstr=' + secondHex8String + ')';
    },
    toString: function toString(format) {
      var formatSet = !!format;
      format = format || this._format;
      var formattedString = false;
      var hasAlpha = this._a < 1 && this._a >= 0;
      var needsAlphaFormat = !formatSet && hasAlpha && (format === 'hex' || format === 'hex6' || format === 'hex3' || format === 'name');
      if (needsAlphaFormat) {
        // Special case for 'transparent', all other non-alpha formats
        // will return rgba when there is transparency.
        if (format === 'name' && this._a === 0) {
          return this.toName();
        }
        return this.toRgbString();
      }
      if (format === 'rgb') {
        formattedString = this.toRgbString();
      }
      if (format === 'prgb') {
        formattedString = this.toPercentageRgbString();
      }
      if (format === 'hex' || format === 'hex6') {
        formattedString = this.toHexString();
      }
      if (format === 'hex3') {
        formattedString = this.toHexString(true);
      }
      if (format === 'hex8') {
        formattedString = this.toHex8String();
      }
      if (format === 'name') {
        formattedString = this.toName();
      }
      if (format === 'hsl') {
        formattedString = this.toHslString();
      }
      if (format === 'hsv') {
        formattedString = this.toHsvString();
      }
      return formattedString || this.toHexString();
    },
    _applyModification: function _applyModification(fn, args) {
      var color = fn.apply(null, [this].concat([].slice.call(args)));
      this._r = color._r;
      this._g = color._g;
      this._b = color._b;
      this.setAlpha(color._a);
      return this;
    },
    lighten: function lighten() {
      return this._applyModification(_lighten, arguments);
    },
    brighten: function brighten() {
      return this._applyModification(_brighten, arguments);
    },
    darken: function darken() {
      return this._applyModification(_darken, arguments);
    },
    desaturate: function desaturate() {
      return this._applyModification(_desaturate, arguments);
    },
    saturate: function saturate() {
      return this._applyModification(_saturate, arguments);
    },
    greyscale: function greyscale() {
      return this._applyModification(_greyscale, arguments);
    },
    spin: function spin() {
      return this._applyModification(_spin, arguments);
    },
    _applyCombination: function _applyCombination(fn, args) {
      return fn.apply(null, [this].concat([].slice.call(args)));
    },
    analogous: function analogous() {
      return this._applyCombination(_analogous, arguments);
    },
    complement: function complement() {
      return this._applyCombination(_complement, arguments);
    },
    monochromatic: function monochromatic() {
      return this._applyCombination(_monochromatic, arguments);
    },
    splitcomplement: function splitcomplement() {
      return this._applyCombination(_splitcomplement, arguments);
    },
    triad: function triad() {
      return this._applyCombination(_triad, arguments);
    },
    tetrad: function tetrad() {
      return this._applyCombination(_tetrad, arguments);
    }
  };

  // If input is an object, force 1 into '1.0' to handle ratios properly
  // String input requires '1.0' as input, so 1 will be treated as 1
  tinycolor.fromRatio = function (color, opts) {
    if (_typeof(color) == 'object') {
      var newColor = {};
      for (var i in color) {
        if (color.hasOwnProperty(i)) {
          if (i === 'a') {
            newColor[i] = color[i];
          } else {
            newColor[i] = convertToPercentage(color[i]);
          }
        }
      }
      color = newColor;
    }
    return tinycolor(color, opts);
  };

  // Given a string or object, convert that input to RGB
  // Possible string inputs:
  //
  //     'red'
  //     '#f00' or 'f00'
  //     '#ff0000' or 'ff0000'
  //     '#ff000000' or 'ff000000'
  //     'rgb 255 0 0' or 'rgb (255, 0, 0)'
  //     'rgb 1.0 0 0' or 'rgb (1, 0, 0)'
  //     'rgba (255, 0, 0, 1)' or 'rgba 255, 0, 0, 1'
  //     'rgba (1.0, 0, 0, 1)' or 'rgba 1.0, 0, 0, 1'
  //     'hsl(0, 100%, 50%)' or 'hsl 0 100% 50%'
  //     'hsla(0, 100%, 50%, 1)' or 'hsla 0 100% 50%, 1'
  //     'hsv(0, 100%, 100%)' or 'hsv 0 100% 100%'
  //
  function inputToRGB(color) {
    var rgb = {
      r: 0,
      g: 0,
      b: 0
    };
    var a = 1;
    var ok = false;
    var format = false;
    if (typeof color == 'string') {
      color = stringInputToObject(color);
    }
    if (_typeof(color) == 'object') {
      if (color.hasOwnProperty('r') && color.hasOwnProperty('g') && color.hasOwnProperty('b')) {
        rgb = rgbToRgb(color.r, color.g, color.b);
        ok = true;
        format = String(color.r).substr(-1) === '%' ? 'prgb' : 'rgb';
      } else if (color.hasOwnProperty('h') && color.hasOwnProperty('s') && color.hasOwnProperty('v')) {
        color.s = convertToPercentage(color.s);
        color.v = convertToPercentage(color.v);
        rgb = hsvToRgb(color.h, color.s, color.v);
        ok = true;
        format = 'hsv';
      } else if (color.hasOwnProperty('h') && color.hasOwnProperty('s') && color.hasOwnProperty('l')) {
        color.s = convertToPercentage(color.s);
        color.l = convertToPercentage(color.l);
        rgb = hslToRgb(color.h, color.s, color.l);
        ok = true;
        format = 'hsl';
      }
      if (color.hasOwnProperty('a')) {
        a = color.a;
      }
    }
    a = boundAlpha(a);
    return {
      ok: ok,
      format: color.format || format,
      r: mathMin(255, mathMax(rgb.r, 0)),
      g: mathMin(255, mathMax(rgb.g, 0)),
      b: mathMin(255, mathMax(rgb.b, 0)),
      a: a
    };
  }

  // Conversion Functions
  // --------------------

  // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
  // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

  // `rgbToRgb`
  // Handle bounds / percentage checking to conform to CSS color spec
  // <http://www.w3.org/TR/css3-color/>
  // *Assumes:* r, g, b in [0, 255] or [0, 1]
  // *Returns:* { r, g, b } in [0, 255]
  function rgbToRgb(r, g, b) {
    return {
      r: bound01(r, 255) * 255,
      g: bound01(g, 255) * 255,
      b: bound01(b, 255) * 255
    };
  }

  // `rgbToHsl`
  // Converts an RGB color value to HSL.
  // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
  // *Returns:* { h, s, l } in [0,1]
  function rgbToHsl(r, g, b) {
    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);
    var max = mathMax(r, g, b),
      min = mathMin(r, g, b);
    var h,
      s,
      l = (max + min) / 2;
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: h,
      s: s,
      l: l
    };
  }

  // `hslToRgb`
  // Converts an HSL color value to RGB.
  // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
  // *Returns:* { r, g, b } in the set [0, 255]
  function hslToRgb(h, s, l) {
    var r, g, b;
    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: r * 255,
      g: g * 255,
      b: b * 255
    };
  }

  // `rgbToHsv`
  // Converts an RGB color value to HSV
  // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
  // *Returns:* { h, s, v } in [0,1]
  function rgbToHsv(r, g, b) {
    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);
    var max = mathMax(r, g, b),
      min = mathMin(r, g, b);
    var h,
      s,
      v = max;
    var d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: h,
      s: s,
      v: v
    };
  }

  // `hsvToRgb`
  // Converts an HSV color value to RGB.
  // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
  // *Returns:* { r, g, b } in the set [0, 255]
  function hsvToRgb(h, s, v) {
    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);
    var i = math.floor(h),
      f = h - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s),
      mod = i % 6,
      r = [v, q, p, p, t, v][mod],
      g = [t, v, v, q, p, p][mod],
      b = [p, p, t, v, v, q][mod];
    return {
      r: r * 255,
      g: g * 255,
      b: b * 255
    };
  }

  // `rgbToHex`
  // Converts an RGB color to hex
  // Assumes r, g, and b are contained in the set [0, 255]
  // Returns a 3 or 6 character hex
  function rgbToHex(r, g, b, allow3Char) {
    var hex = [pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16))];

    // Return a 3 character hex if possible
    if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
      return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }
    return hex.join('');
  }
  // `rgbaToHex`
  // Converts an RGBA color plus alpha transparency to hex
  // Assumes r, g, b and a are contained in the set [0, 255]
  // Returns an 8 character hex
  function rgbaToHex(r, g, b, a) {
    var hex = [pad2(convertDecimalToHex(a)), pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16))];
    return hex.join('');
  }

  // `equals`
  // Can be called with any tinycolor input
  tinycolor.equals = function (color1, color2) {
    if (!color1 || !color2) {
      return false;
    }
    return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
  };
  tinycolor.random = function () {
    return tinycolor.fromRatio({
      r: mathRandom(),
      g: mathRandom(),
      b: mathRandom()
    });
  };

  // Modification Functions
  // ----------------------
  // Thanks to less.js for some of the basics here
  // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

  function _desaturate(color, amount) {
    amount = amount === 0 ? 0 : amount || 10;
    var hsl = tinycolor(color).toHsl();
    hsl.s -= amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
  }
  function _saturate(color, amount) {
    amount = amount === 0 ? 0 : amount || 10;
    var hsl = tinycolor(color).toHsl();
    hsl.s += amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
  }
  function _greyscale(color) {
    return tinycolor(color).desaturate(100);
  }
  function _lighten(color, amount) {
    amount = amount === 0 ? 0 : amount || 10;
    var hsl = tinycolor(color).toHsl();
    hsl.l += amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
  }
  function _brighten(color, amount) {
    amount = amount === 0 ? 0 : amount || 10;
    var rgb = tinycolor(color).toRgb();
    rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * -(amount / 100))));
    rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * -(amount / 100))));
    rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * -(amount / 100))));
    return tinycolor(rgb);
  }
  function _darken(color, amount) {
    amount = amount === 0 ? 0 : amount || 10;
    var hsl = tinycolor(color).toHsl();
    hsl.l -= amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
  }

  // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
  // Values outside of this range will be wrapped into this range.
  function _spin(color, amount) {
    var hsl = tinycolor(color).toHsl();
    var hue = (mathRound(hsl.h) + amount) % 360;
    hsl.h = hue < 0 ? 360 + hue : hue;
    return tinycolor(hsl);
  }

  // Combination Functions
  // ---------------------
  // Thanks to jQuery xColor for some of the ideas behind these
  // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

  function _complement(color) {
    var hsl = tinycolor(color).toHsl();
    hsl.h = (hsl.h + 180) % 360;
    return tinycolor(hsl);
  }
  function _triad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [tinycolor(color), tinycolor({
      h: (h + 120) % 360,
      s: hsl.s,
      l: hsl.l
    }), tinycolor({
      h: (h + 240) % 360,
      s: hsl.s,
      l: hsl.l
    })];
  }
  function _tetrad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [tinycolor(color), tinycolor({
      h: (h + 90) % 360,
      s: hsl.s,
      l: hsl.l
    }), tinycolor({
      h: (h + 180) % 360,
      s: hsl.s,
      l: hsl.l
    }), tinycolor({
      h: (h + 270) % 360,
      s: hsl.s,
      l: hsl.l
    })];
  }
  function _splitcomplement(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [tinycolor(color), tinycolor({
      h: (h + 72) % 360,
      s: hsl.s,
      l: hsl.l
    }), tinycolor({
      h: (h + 216) % 360,
      s: hsl.s,
      l: hsl.l
    })];
  }
  function _analogous(color, results, slices) {
    results = results || 6;
    slices = slices || 30;
    var hsl = tinycolor(color).toHsl();
    var part = 360 / slices;
    var ret = [tinycolor(color)];
    for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360; --results;) {
      hsl.h = (hsl.h + part) % 360;
      ret.push(tinycolor(hsl));
    }
    return ret;
  }
  function _monochromatic(color, results) {
    results = results || 6;
    var hsv = tinycolor(color).toHsv();
    var h = hsv.h,
      s = hsv.s,
      v = hsv.v;
    var ret = [];
    var modification = 1 / results;
    while (results--) {
      ret.push(tinycolor({
        h: h,
        s: s,
        v: v
      }));
      v = (v + modification) % 1;
    }
    return ret;
  }

  // Utility Functions
  // ---------------------

  tinycolor.mix = function (color1, color2, amount) {
    amount = amount === 0 ? 0 : amount || 50;
    var rgb1 = tinycolor(color1).toRgb();
    var rgb2 = tinycolor(color2).toRgb();
    var p = amount / 100;
    var w = p * 2 - 1;
    var a = rgb2.a - rgb1.a;
    var w1;
    if (w * a == -1) {
      w1 = w;
    } else {
      w1 = (w + a) / (1 + w * a);
    }
    w1 = (w1 + 1) / 2;
    var w2 = 1 - w1;
    var rgba = {
      r: rgb2.r * w1 + rgb1.r * w2,
      g: rgb2.g * w1 + rgb1.g * w2,
      b: rgb2.b * w1 + rgb1.b * w2,
      a: rgb2.a * p + rgb1.a * (1 - p)
    };
    return tinycolor(rgba);
  };

  // Readability Functions
  // ---------------------
  // <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

  // `contrast`
  // Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
  tinycolor.readability = function (color1, color2) {
    var c1 = tinycolor(color1);
    var c2 = tinycolor(color2);
    return (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) / (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05);
  };

  // `isReadable`
  // Ensure that foreground and background color combinations meet WCAG2 guidelines.
  // The third argument is an optional Object.
  //      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
  //      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
  // If the entire object is absent, isReadable defaults to {level:'AA',size:'small'}.

  // *Example*
  //    tinycolor.isReadable('#000', '#111') => false
  //    tinycolor.isReadable('#000', '#111',{level:'AA',size:'large'}) => false

  tinycolor.isReadable = function (color1, color2, wcag2) {
    var readability = tinycolor.readability(color1, color2);
    var wcag2Parms, out;
    out = false;
    wcag2Parms = validateWCAG2Parms(wcag2);
    switch (wcag2Parms.level + wcag2Parms.size) {
      case 'AAsmall':
      case 'AAAlarge':
        out = readability >= 4.5;
        break;
      case 'AAlarge':
        out = readability >= 3;
        break;
      case 'AAAsmall':
        out = readability >= 7;
        break;
    }
    return out;
  };

  // `mostReadable`
  // Given a base color and a list of possible foreground or background
  // colors for that base, returns the most readable color.
  // Optionally returns Black or White if the most readable color is unreadable.
  // *Example*
  //    tinycolor.mostReadable(tinycolor.mostReadable('#123', ['#124', '#125'],{includeFallbackColors:false}).toHexString(); // '#112255'
  //    tinycolor.mostReadable(tinycolor.mostReadable('#123', ['#124', '#125'],{includeFallbackColors:true}).toHexString();  // '#ffffff'
  //    tinycolor.mostReadable('#a8015a', ['#faf3f3'],{includeFallbackColors:true,level:'AAA',size:'large'}).toHexString(); // '#faf3f3'
  //    tinycolor.mostReadable('#a8015a', ['#faf3f3'],{includeFallbackColors:true,level:'AAA',size:'small'}).toHexString(); // '#ffffff'

  tinycolor.mostReadable = function (baseColor, colorList, args) {
    var bestColor = null;
    var bestScore = 0;
    var readability;
    var includeFallbackColors, level, size;
    args = args || {};
    includeFallbackColors = args.includeFallbackColors;
    level = args.level;
    size = args.size;
    for (var i = 0; i < colorList.length; i++) {
      readability = tinycolor.readability(baseColor, colorList[i]);
      if (readability > bestScore) {
        bestScore = readability;
        bestColor = tinycolor(colorList[i]);
      }
    }
    if (tinycolor.isReadable(baseColor, bestColor, {
      'level': level,
      'size': size
    }) || !includeFallbackColors) {
      return bestColor;
    } else {
      args.includeFallbackColors = false;
      return tinycolor.mostReadable(baseColor, ['#fff', '#000'], args);
    }
  };

  // Big List of Colors
  // ------------------
  // <http://www.w3.org/TR/css3-color/#svg-color>
  var names = tinycolor.names = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '0ff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000',
    blanchedalmond: 'ffebcd',
    blue: '00f',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    burntsienna: 'ea7e5d',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    cyan: '0ff',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkgrey: 'a9a9a9',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkslategrey: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dimgrey: '696969',
    dodgerblue: '1e90ff',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'f0f',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    grey: '808080',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgray: 'd3d3d3',
    lightgreen: '90ee90',
    lightgrey: 'd3d3d3',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslategray: '789',
    lightslategrey: '789',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '0f0',
    limegreen: '32cd32',
    linen: 'faf0e6',
    magenta: 'f0f',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370db',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'db7093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    rebeccapurple: '663399',
    red: 'f00',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    slategrey: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    wheat: 'f5deb3',
    white: 'fff',
    whitesmoke: 'f5f5f5',
    yellow: 'ff0',
    yellowgreen: '9acd32'
  };

  // Make it easy to access colors via `hexNames[hex]`
  var hexNames = tinycolor.hexNames = flip(names);

  // Utilities
  // ---------

  // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
  function flip(o) {
    var flipped = {};
    for (var i in o) {
      if (o.hasOwnProperty(i)) {
        flipped[o[i]] = i;
      }
    }
    return flipped;
  }

  // Return a valid alpha value [0,1] with all invalid values being set to 1
  function boundAlpha(a) {
    a = parseFloat(a);
    if (isNaN(a) || a < 0 || a > 1) {
      a = 1;
    }
    return a;
  }

  // Take input from [0, n] and return it as [0, 1]
  function bound01(n, max) {
    if (isOnePointZero(n)) {
      n = '100%';
    }
    var processPercent = isPercentage(n);
    n = mathMin(max, mathMax(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
      n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if (math.abs(n - max) < 0.000001) {
      return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return n % max / parseFloat(max);
  }

  // Force a number between 0 and 1
  function clamp01(val) {
    return mathMin(1, mathMax(0, val));
  }

  // Parse a base-16 hex value into a base-10 integer
  function parseIntFromHex(val) {
    return parseInt(val, 16);
  }

  // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
  // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
  function isOnePointZero(n) {
    return typeof n == 'string' && n.indexOf('.') != -1 && parseFloat(n) === 1;
  }

  // Check to see if string passed in is a percentage
  function isPercentage(n) {
    return typeof n === 'string' && n.indexOf('%') != -1;
  }

  // Force a hex value to have 2 characters
  function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
  }

  // Replace a decimal with it's percentage value
  function convertToPercentage(n) {
    if (n <= 1) {
      n = n * 100 + '%';
    }
    return n;
  }

  // Converts a decimal to a hex value
  function convertDecimalToHex(d) {
    return Math.round(parseFloat(d) * 255).toString(16);
  }
  // Converts a hex value to a decimal
  function convertHexToDecimal(h) {
    return parseIntFromHex(h) / 255;
  }
  var matchers = function () {
    // <http://www.w3.org/TR/css3-values/#integers>
    var CSS_INTEGER = '[-\\+]?\\d+%?';

    // <http://www.w3.org/TR/css3-values/#number-value>
    var CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?';

    // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
    var CSS_UNIT = '(?:' + CSS_NUMBER + ')|(?:' + CSS_INTEGER + ')';

    // Actual matching.
    // Parentheses and commas are optional, but not required.
    // Whitespace can take the place of commas or opening paren
    var PERMISSIVE_MATCH3 = '[\\s|\\(]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')\\s*\\)?';
    var PERMISSIVE_MATCH4 = '[\\s|\\(]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')\\s*\\)?';
    return {
      rgb: new RegExp('rgb' + PERMISSIVE_MATCH3),
      rgba: new RegExp('rgba' + PERMISSIVE_MATCH4),
      hsl: new RegExp('hsl' + PERMISSIVE_MATCH3),
      hsla: new RegExp('hsla' + PERMISSIVE_MATCH4),
      hsv: new RegExp('hsv' + PERMISSIVE_MATCH3),
      hsva: new RegExp('hsva' + PERMISSIVE_MATCH4),
      hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
      hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
      hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
    };
  }();

  // `stringInputToObject`
  // Permissive string parsing.  Take in a number of formats, and output an object
  // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
  function stringInputToObject(color) {
    color = color.replace(trimLeft, '').replace(trimRight, '').toLowerCase();
    var named = false;
    if (names[color]) {
      color = names[color];
      named = true;
    } else if (color == 'transparent') {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
        format: 'name'
      };
    }

    // Try to match string input using regular expressions.
    // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
    // Just return an object and let the conversion functions handle that.
    // This way the result will be the same whether the tinycolor is initialized with string or object.
    var match;
    if (match = matchers.rgb.exec(color)) {
      return {
        r: match[1],
        g: match[2],
        b: match[3]
      };
    }
    if (match = matchers.rgba.exec(color)) {
      return {
        r: match[1],
        g: match[2],
        b: match[3],
        a: match[4]
      };
    }
    if (match = matchers.hsl.exec(color)) {
      return {
        h: match[1],
        s: match[2],
        l: match[3]
      };
    }
    if (match = matchers.hsla.exec(color)) {
      return {
        h: match[1],
        s: match[2],
        l: match[3],
        a: match[4]
      };
    }
    if (match = matchers.hsv.exec(color)) {
      return {
        h: match[1],
        s: match[2],
        v: match[3]
      };
    }
    if (match = matchers.hsva.exec(color)) {
      return {
        h: match[1],
        s: match[2],
        v: match[3],
        a: match[4]
      };
    }
    if (match = matchers.hex8.exec(color)) {
      return {
        a: convertHexToDecimal(match[1]),
        r: parseIntFromHex(match[2]),
        g: parseIntFromHex(match[3]),
        b: parseIntFromHex(match[4]),
        format: named ? 'name' : 'hex8'
      };
    }
    if (match = matchers.hex6.exec(color)) {
      return {
        r: parseIntFromHex(match[1]),
        g: parseIntFromHex(match[2]),
        b: parseIntFromHex(match[3]),
        format: named ? 'name' : 'hex'
      };
    }
    if (match = matchers.hex3.exec(color)) {
      return {
        r: parseIntFromHex(match[1] + '' + match[1]),
        g: parseIntFromHex(match[2] + '' + match[2]),
        b: parseIntFromHex(match[3] + '' + match[3]),
        format: named ? 'name' : 'hex'
      };
    }
    return false;
  }
  function validateWCAG2Parms(parms) {
    // return valid WCAG2 parms for isReadable.
    // If input parms are invalid, return {'level':'AA', 'size':'small'}
    var level, size;
    parms = parms || {
      'level': 'AA',
      'size': 'small'
    };
    level = (parms.level || 'AA').toUpperCase();
    size = (parms.size || 'small').toLowerCase();
    if (level !== 'AA' && level !== 'AAA') {
      level = 'AA';
    }
    if (size !== 'small' && size !== 'large') {
      size = 'small';
    }
    return {
      'level': level,
      'size': size
    };
  }
  // Node: Export function
  if ( true && module.exports) {
    module.exports = tinycolor;
  }
  // AMD/requirejs: Define the module
  else if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      return tinycolor;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  // Browser: Expose to window
  else {}
})();

/***/ }),

/***/ "./client/js/util/underscore.js":
/*!**************************************!*\
  !*** ./client/js/util/underscore.js ***!
  \**************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function () {
  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind,
    nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function Ctor() {};

  // Create a safe reference to the Underscore object for use below.
  var _2 = function _(obj) {
    if (obj instanceof _2) return obj;
    if (!(this instanceof _2)) return new _2(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (true) {
    if ( true && module.exports) {
      exports = module.exports = _2;
    }
    exports._ = _2;
  } else {}

  // Current version.
  _2.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function optimizeCb(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1:
        return function (value) {
          return func.call(context, value);
        };
      case 2:
        return function (value, other) {
          return func.call(context, value, other);
        };
      case 3:
        return function (value, index, collection) {
          return func.call(context, value, index, collection);
        };
      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }
    return function () {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function cb(value, context, argCount) {
    if (value == null) return _2.identity;
    if (_2.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_2.isObject(value)) return _2.matcher(value);
    return _2.property(value);
  };
  _2.iteratee = function (value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function createAssigner(keysFunc, undefinedOnly) {
    return function (obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function baseCreate(prototype) {
    if (!_2.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor();
    Ctor.prototype = null;
    return result;
  };
  var property = function property(key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function isArrayLike(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _2.each = _2.forEach = function (obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _2.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _2.map = _2.collect = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _2.keys(obj),
      length = (keys || obj).length,
      results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }
    return function (obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _2.keys(obj),
        length = (keys || obj).length,
        index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _2.reduce = _2.foldl = _2.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _2.reduceRight = _2.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _2.find = _2.detect = function (obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _2.findIndex(obj, predicate, context);
    } else {
      key = _2.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _2.filter = _2.select = function (obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _2.each(obj, function (value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _2.reject = function (obj, predicate, context) {
    return _2.filter(obj, _2.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _2.every = _2.all = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _2.keys(obj),
      length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _2.some = _2.any = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _2.keys(obj),
      length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _2.contains = _2.includes = _2.include = function (obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _2.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _2.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _2.invoke = function (obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _2.isFunction(method);
    return _2.map(obj, function (value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _2.pluck = function (obj, key) {
    return _2.map(obj, _2.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _2.where = function (obj, attrs) {
    return _2.filter(obj, _2.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _2.findWhere = function (obj, attrs) {
    return _2.find(obj, _2.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _2.max = function (obj, iteratee, context) {
    var result = -Infinity,
      lastComputed = -Infinity,
      value,
      computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _2.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _2.each(obj, function (value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _2.min = function (obj, iteratee, context) {
    var result = Infinity,
      lastComputed = Infinity,
      value,
      computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _2.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _2.each(obj, function (value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _2.shuffle = function (obj) {
    var set = isArrayLike(obj) ? obj : _2.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _2.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _2.sample = function (obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _2.values(obj);
      return obj[_2.random(obj.length - 1)];
    }
    return _2.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _2.sortBy = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _2.pluck(_2.map(obj, function (value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function group(behavior) {
    return function (obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _2.each(obj, function (value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _2.groupBy = group(function (result, value, key) {
    if (_2.has(result, key)) result[key].push(value);else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _2.indexBy = group(function (result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _2.countBy = group(function (result, value, key) {
    if (_2.has(result, key)) result[key]++;else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _2.toArray = function (obj) {
    if (!obj) return [];
    if (_2.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _2.map(obj, _2.identity);
    return _2.values(obj);
  };

  // Return the number of elements in an object.
  _2.size = function (obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _2.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _2.partition = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [],
      fail = [];
    _2.each(obj, function (value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _2.first = _2.head = _2.take = function (array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _2.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _2.initial = function (array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _2.last = function (array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _2.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _2.rest = _2.tail = _2.drop = function (array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _2.compact = function (array) {
    return _2.filter(array, _2.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var _flatten = function flatten(input, shallow, strict, startIndex) {
    var output = [],
      idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_2.isArray(value) || _2.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = _flatten(value, shallow, strict);
        var j = 0,
          len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _2.flatten = function (array, shallow) {
    return _flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _2.without = function (array) {
    return _2.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _2.uniq = _2.unique = function (array, isSorted, iteratee, context) {
    if (!_2.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_2.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_2.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _2.union = function () {
    return _2.uniq(_flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _2.intersection = function (array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_2.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_2.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _2.difference = function (array) {
    var rest = _flatten(arguments, true, true, 1);
    return _2.filter(array, function (value) {
      return !_2.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _2.zip = function () {
    return _2.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _2.unzip = function (array) {
    var length = array && _2.max(array, getLength).length || 0;
    var result = Array(length);
    for (var index = 0; index < length; index++) {
      result[index] = _2.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _2.object = function (list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _2.findIndex = createPredicateIndexFinder(1);
  _2.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _2.sortedIndex = function (array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0,
      high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function (array, item, idx) {
      var i = 0,
        length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _2.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _2.indexOf = createIndexFinder(1, _2.findIndex, _2.sortedIndex);
  _2.lastIndexOf = createIndexFinder(-1, _2.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _2.range = function (start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;
    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);
    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }
    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_2.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _2.bind = function (func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_2.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var _bound = function bound() {
      return executeBound(func, _bound, context, this, args.concat(slice.call(arguments)));
    };
    return _bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _2.partial = function (func) {
    var boundArgs = slice.call(arguments, 1);
    var _bound2 = function bound() {
      var position = 0,
        length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _2 ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, _bound2, this, this, args);
    };
    return _bound2;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _2.bindAll = function (obj) {
    var i,
      length = arguments.length,
      key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _2.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _2.memoize = function (func, hasher) {
    var _memoize = function memoize(key) {
      var cache = _memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_2.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    _memoize.cache = {};
    return _memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _2.delay = function (func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _2.defer = _2.partial(_2.delay, _2, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _2.throttle = function (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function later() {
      previous = options.leading === false ? 0 : _2.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function () {
      var now = _2.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _2.debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    var _later = function later() {
      var last = _2.now() - timestamp;
      if (last < wait && last >= 0) {
        timeout = setTimeout(_later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };
    return function () {
      context = this;
      args = arguments;
      timestamp = _2.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(_later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _2.wrap = function (func, wrapper) {
    return _2.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _2.negate = function (predicate) {
    return function () {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _2.compose = function () {
    var args = arguments;
    var start = args.length - 1;
    return function () {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _2.after = function (times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _2.before = function (times, func) {
    var memo;
    return function () {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _2.once = _2.partial(_2.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{
    toString: null
  }.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _2.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_2.has(obj, prop) && !_2.contains(keys, prop)) keys.push(prop);
    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_2.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _2.keys = function (obj) {
    if (!_2.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_2.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _2.allKeys = function (obj) {
    if (!_2.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _2.values = function (obj) {
    var keys = _2.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _2.mapObject = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _2.keys(obj),
      length = keys.length,
      results = {},
      currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _2.pairs = function (obj) {
    var keys = _2.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _2.invert = function (obj) {
    var result = {};
    var keys = _2.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _2.functions = _2.methods = function (obj) {
    var names = [];
    for (var key in obj) {
      if (_2.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _2.extend = createAssigner(_2.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _2.extendOwn = _2.assign = createAssigner(_2.keys);

  // Returns the first key on an object that passes a predicate test
  _2.findKey = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _2.keys(obj),
      key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _2.pick = function (object, oiteratee, context) {
    var result = {},
      obj = object,
      iteratee,
      keys;
    if (obj == null) return result;
    if (_2.isFunction(oiteratee)) {
      keys = _2.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = _flatten(arguments, false, false, 1);
      iteratee = function iteratee(value, key, obj) {
        return key in obj;
      };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

  // Return a copy of the object without the blacklisted properties.
  _2.omit = function (obj, iteratee, context) {
    if (_2.isFunction(iteratee)) {
      iteratee = _2.negate(iteratee);
    } else {
      var keys = _2.map(_flatten(arguments, false, false, 1), String);
      iteratee = function iteratee(value, key) {
        return !_2.contains(keys, key);
      };
    }
    return _2.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _2.defaults = createAssigner(_2.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _2.create = function (prototype, props) {
    var result = baseCreate(prototype);
    if (props) _2.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _2.clone = function (obj) {
    if (!_2.isObject(obj)) return obj;
    return _2.isArray(obj) ? obj.slice() : _2.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _2.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _2.isMatch = function (object, attrs) {
    var keys = _2.keys(attrs),
      length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };

  // Internal recursive comparison function for `isEqual`.
  var _eq = function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _2) a = a._wrapped;
    if (b instanceof _2) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (_typeof(a) != 'object' || _typeof(b) != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor,
        bCtor = b.constructor;
      if (aCtor !== bCtor && !(_2.isFunction(aCtor) && aCtor instanceof aCtor && _2.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!_eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _2.keys(a),
        key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_2.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_2.has(b, key) && _eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _2.isEqual = function (a, b) {
    return _eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _2.isEmpty = function (obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_2.isArray(obj) || _2.isString(obj) || _2.isArguments(obj))) return obj.length === 0;
    return _2.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _2.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _2.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _2.isObject = function (obj) {
    var type = _typeof(obj);
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _2.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function (name) {
    _2['is' + name] = function (obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_2.isArguments(arguments)) {
    _2.isArguments = function (obj) {
      return _2.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if ( true && (typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array)) != 'object') {
    _2.isFunction = function (obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _2.isFinite = function (obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _2.isNaN = function (obj) {
    return _2.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _2.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _2.isNull = function (obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _2.isUndefined = function (obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _2.has = function (obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _2.noConflict = function () {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _2.identity = function (value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _2.constant = function (value) {
    return function () {
      return value;
    };
  };
  _2.noop = function () {};
  _2.property = property;

  // Generates a function for a given object that returns a given property.
  _2.propertyOf = function (obj) {
    return obj == null ? function () {} : function (key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _2.matcher = _2.matches = function (attrs) {
    attrs = _2.extendOwn({}, attrs);
    return function (obj) {
      return _2.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _2.times = function (n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _2.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _2.now = Date.now || function () {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _2.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function createEscaper(map) {
    var escaper = function escaper(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _2.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function (string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _2.escape = createEscaper(escapeMap);
  _2.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _2.result = function (object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _2.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _2.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _2.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    "\u2028": 'u2028',
    "\u2029": 'u2029'
  };
  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
  var escapeChar = function escapeChar(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _2.template = function (text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _2.defaults({}, settings, _2.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;
      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }
    var template = function template(data) {
      return render.call(this, data, _2);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';
    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _2.chain = function (obj) {
    var instance = _2(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function result(instance, obj) {
    return instance._chain ? _2(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _2.mixin = function (obj) {
    _2.each(_2.functions(obj), function (name) {
      var func = _2[name] = obj[name];
      _2.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_2, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _2.mixin(_2);

  // Add all mutator Array functions to the wrapper.
  _2.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
    var method = ArrayProto[name];
    _2.prototype[name] = function () {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _2.each(['concat', 'join', 'slice'], function (name) {
    var method = ArrayProto[name];
    _2.prototype[name] = function () {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _2.prototype.value = function () {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _2.prototype.valueOf = _2.prototype.toJSON = _2.prototype.value;
  _2.prototype.toString = function () {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      return _2;
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}).call(this);

/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars.runtime.js":
/*!****************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars.runtime.js ***!
  \****************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebarsBase = __webpack_require__(/*! ./handlebars/base */ "./node_modules/handlebars/dist/cjs/handlebars/base.js");

var base = _interopRequireWildcard(_handlebarsBase);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _handlebarsSafeString = __webpack_require__(/*! ./handlebars/safe-string */ "./node_modules/handlebars/dist/cjs/handlebars/safe-string.js");

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = __webpack_require__(/*! ./handlebars/exception */ "./node_modules/handlebars/dist/cjs/handlebars/exception.js");

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = __webpack_require__(/*! ./handlebars/utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = __webpack_require__(/*! ./handlebars/runtime */ "./node_modules/handlebars/dist/cjs/handlebars/runtime.js");

var runtime = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = __webpack_require__(/*! ./handlebars/no-conflict */ "./node_modules/handlebars/dist/cjs/handlebars/no-conflict.js");

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports["default"] = inst;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9oYW5kbGViYXJzLnJ1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OEJBQXNCLG1CQUFtQjs7SUFBN0IsSUFBSTs7Ozs7b0NBSU8sMEJBQTBCOzs7O21DQUMzQix3QkFBd0I7Ozs7K0JBQ3ZCLG9CQUFvQjs7SUFBL0IsS0FBSzs7aUNBQ1Esc0JBQXNCOztJQUFuQyxPQUFPOztvQ0FFSSwwQkFBMEI7Ozs7O0FBR2pELFNBQVMsTUFBTSxHQUFHO0FBQ2hCLE1BQUksRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0FBRTFDLE9BQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLElBQUUsQ0FBQyxVQUFVLG9DQUFhLENBQUM7QUFDM0IsSUFBRSxDQUFDLFNBQVMsbUNBQVksQ0FBQztBQUN6QixJQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNqQixJQUFFLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDOztBQUU3QyxJQUFFLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUNoQixJQUFFLENBQUMsUUFBUSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQzNCLFdBQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDbkMsQ0FBQzs7QUFFRixTQUFPLEVBQUUsQ0FBQztDQUNYOztBQUVELElBQUksSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUVyQixrQ0FBVyxJQUFJLENBQUMsQ0FBQzs7QUFFakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7cUJBRVIsSUFBSSIsImZpbGUiOiJoYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBiYXNlIGZyb20gJy4vaGFuZGxlYmFycy9iYXNlJztcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcbmltcG9ydCBTYWZlU3RyaW5nIGZyb20gJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4vaGFuZGxlYmFycy9leGNlcHRpb24nO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi9oYW5kbGViYXJzL3V0aWxzJztcbmltcG9ydCAqIGFzIHJ1bnRpbWUgZnJvbSAnLi9oYW5kbGViYXJzL3J1bnRpbWUnO1xuXG5pbXBvcnQgbm9Db25mbGljdCBmcm9tICcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IFNhZmVTdHJpbmc7XG4gIGhiLkV4Y2VwdGlvbiA9IEV4Y2VwdGlvbjtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgICByZXR1cm4gcnVudGltZS50ZW1wbGF0ZShzcGVjLCBoYik7XG4gIH07XG5cbiAgcmV0dXJuIGhiO1xufVxuXG5sZXQgaW5zdCA9IGNyZWF0ZSgpO1xuaW5zdC5jcmVhdGUgPSBjcmVhdGU7XG5cbm5vQ29uZmxpY3QoaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydCBkZWZhdWx0IGluc3Q7XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/base.js":
/*!*************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/base.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = __webpack_require__(/*! ./utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

var _exception = __webpack_require__(/*! ./exception */ "./node_modules/handlebars/dist/cjs/handlebars/exception.js");

var _exception2 = _interopRequireDefault(_exception);

var _helpers = __webpack_require__(/*! ./helpers */ "./node_modules/handlebars/dist/cjs/handlebars/helpers.js");

var _decorators = __webpack_require__(/*! ./decorators */ "./node_modules/handlebars/dist/cjs/handlebars/decorators.js");

var _logger = __webpack_require__(/*! ./logger */ "./node_modules/handlebars/dist/cjs/handlebars/logger.js");

var _logger2 = _interopRequireDefault(_logger);

var _internalProtoAccess = __webpack_require__(/*! ./internal/proto-access */ "./node_modules/handlebars/dist/cjs/handlebars/internal/proto-access.js");

var VERSION = '4.7.8';
exports.VERSION = VERSION;
var COMPILER_REVISION = 8;
exports.COMPILER_REVISION = COMPILER_REVISION;
var LAST_COMPATIBLE_COMPILER_REVISION = 7;

exports.LAST_COMPATIBLE_COMPILER_REVISION = LAST_COMPATIBLE_COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0 <4.3.0',
  8: '>= 4.3.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  },
  /**
   * Reset the memory of illegal property accesses that have already been logged.
   * @deprecated should only be used in handlebars test-cases
   */
  resetLoggedPropertyAccesses: function resetLoggedPropertyAccesses() {
    _internalProtoAccess.resetLoggedProperties();
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = _utils.createFrame;
exports.logger = _logger2['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7cUJBQThDLFNBQVM7O3lCQUNqQyxhQUFhOzs7O3VCQUNJLFdBQVc7OzBCQUNSLGNBQWM7O3NCQUNyQyxVQUFVOzs7O21DQUNTLHlCQUF5Qjs7QUFFeEQsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDOztBQUN4QixJQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQzs7QUFDNUIsSUFBTSxpQ0FBaUMsR0FBRyxDQUFDLENBQUM7OztBQUU1QyxJQUFNLGdCQUFnQixHQUFHO0FBQzlCLEdBQUMsRUFBRSxhQUFhO0FBQ2hCLEdBQUMsRUFBRSxlQUFlO0FBQ2xCLEdBQUMsRUFBRSxlQUFlO0FBQ2xCLEdBQUMsRUFBRSxVQUFVO0FBQ2IsR0FBQyxFQUFFLGtCQUFrQjtBQUNyQixHQUFDLEVBQUUsaUJBQWlCO0FBQ3BCLEdBQUMsRUFBRSxpQkFBaUI7QUFDcEIsR0FBQyxFQUFFLFVBQVU7Q0FDZCxDQUFDOzs7QUFFRixJQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQzs7QUFFOUIsU0FBUyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRTtBQUNuRSxNQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7QUFDN0IsTUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO0FBQy9CLE1BQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUUsQ0FBQzs7QUFFbkMsa0NBQXVCLElBQUksQ0FBQyxDQUFDO0FBQzdCLHdDQUEwQixJQUFJLENBQUMsQ0FBQztDQUNqQzs7QUFFRCxxQkFBcUIsQ0FBQyxTQUFTLEdBQUc7QUFDaEMsYUFBVyxFQUFFLHFCQUFxQjs7QUFFbEMsUUFBTSxxQkFBUTtBQUNkLEtBQUcsRUFBRSxvQkFBTyxHQUFHOztBQUVmLGdCQUFjLEVBQUUsd0JBQVMsSUFBSSxFQUFFLEVBQUUsRUFBRTtBQUNqQyxRQUFJLGdCQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEVBQUU7QUFDdEMsVUFBSSxFQUFFLEVBQUU7QUFDTixjQUFNLDJCQUFjLHlDQUF5QyxDQUFDLENBQUM7T0FDaEU7QUFDRCxvQkFBTyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzVCLE1BQU07QUFDTCxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUN6QjtHQUNGO0FBQ0Qsa0JBQWdCLEVBQUUsMEJBQVMsSUFBSSxFQUFFO0FBQy9CLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMzQjs7QUFFRCxpQkFBZSxFQUFFLHlCQUFTLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDdkMsUUFBSSxnQkFBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3RDLG9CQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDN0IsTUFBTTtBQUNMLFVBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFO0FBQ2xDLGNBQU0seUVBQ3dDLElBQUksb0JBQ2pELENBQUM7T0FDSDtBQUNELFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO0tBQy9CO0dBQ0Y7QUFDRCxtQkFBaUIsRUFBRSwyQkFBUyxJQUFJLEVBQUU7QUFDaEMsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzVCOztBQUVELG1CQUFpQixFQUFFLDJCQUFTLElBQUksRUFBRSxFQUFFLEVBQUU7QUFDcEMsUUFBSSxnQkFBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3RDLFVBQUksRUFBRSxFQUFFO0FBQ04sY0FBTSwyQkFBYyw0Q0FBNEMsQ0FBQyxDQUFDO09BQ25FO0FBQ0Qsb0JBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUMvQixNQUFNO0FBQ0wsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDNUI7R0FDRjtBQUNELHFCQUFtQixFQUFFLDZCQUFTLElBQUksRUFBRTtBQUNsQyxXQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDOUI7Ozs7O0FBS0QsNkJBQTJCLEVBQUEsdUNBQUc7QUFDNUIsZ0RBQXVCLENBQUM7R0FDekI7Q0FDRixDQUFDOztBQUVLLElBQUksR0FBRyxHQUFHLG9CQUFPLEdBQUcsQ0FBQzs7O1FBRW5CLFdBQVc7UUFBRSxNQUFNIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVGcmFtZSwgZXh0ZW5kLCB0b1N0cmluZyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuL2V4Y2VwdGlvbic7XG5pbXBvcnQgeyByZWdpc3RlckRlZmF1bHRIZWxwZXJzIH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7IHJlZ2lzdGVyRGVmYXVsdERlY29yYXRvcnMgfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyByZXNldExvZ2dlZFByb3BlcnRpZXMgfSBmcm9tICcuL2ludGVybmFsL3Byb3RvLWFjY2Vzcyc7XG5cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gJzQuNy44JztcbmV4cG9ydCBjb25zdCBDT01QSUxFUl9SRVZJU0lPTiA9IDg7XG5leHBvcnQgY29uc3QgTEFTVF9DT01QQVRJQkxFX0NPTVBJTEVSX1JFVklTSU9OID0gNztcblxuZXhwb3J0IGNvbnN0IFJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPT0gMS54LngnLFxuICA1OiAnPT0gMi4wLjAtYWxwaGEueCcsXG4gIDY6ICc+PSAyLjAuMC1iZXRhLjEnLFxuICA3OiAnPj0gNC4wLjAgPDQuMy4wJyxcbiAgODogJz49IDQuMy4wJ1xufTtcblxuY29uc3Qgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5leHBvcnQgZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzLCBkZWNvcmF0b3JzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcbiAgdGhpcy5kZWNvcmF0b3JzID0gZGVjb3JhdG9ycyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xuICByZWdpc3RlckRlZmF1bHREZWNvcmF0b3JzKHRoaXMpO1xufVxuXG5IYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZ2dlci5sb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTtcbiAgICAgIH1cbiAgICAgIGV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5oZWxwZXJzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24obmFtZSwgcGFydGlhbCkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBleHRlbmQodGhpcy5wYXJ0aWFscywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgcGFydGlhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcbiAgICAgICAgICBgQXR0ZW1wdGluZyB0byByZWdpc3RlciBhIHBhcnRpYWwgY2FsbGVkIFwiJHtuYW1lfVwiIGFzIHVuZGVmaW5lZGBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfSxcblxuICByZWdpc3RlckRlY29yYXRvcjogZnVuY3Rpb24obmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgZGVjb3JhdG9ycycpO1xuICAgICAgfVxuICAgICAgZXh0ZW5kKHRoaXMuZGVjb3JhdG9ycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVjb3JhdG9yc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckRlY29yYXRvcjogZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRvcnNbbmFtZV07XG4gIH0sXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgbWVtb3J5IG9mIGlsbGVnYWwgcHJvcGVydHkgYWNjZXNzZXMgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiBsb2dnZWQuXG4gICAqIEBkZXByZWNhdGVkIHNob3VsZCBvbmx5IGJlIHVzZWQgaW4gaGFuZGxlYmFycyB0ZXN0LWNhc2VzXG4gICAqL1xuICByZXNldExvZ2dlZFByb3BlcnR5QWNjZXNzZXMoKSB7XG4gICAgcmVzZXRMb2dnZWRQcm9wZXJ0aWVzKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBsZXQgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0IHsgY3JlYXRlRnJhbWUsIGxvZ2dlciB9O1xuIl19


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/decorators.js":
/*!*******************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/decorators.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = __webpack_require__(/*! ./decorators/inline */ "./node_modules/handlebars/dist/cjs/handlebars/decorators/inline.js");

var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2RlY29yYXRvcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Z0NBQTJCLHFCQUFxQjs7OztBQUV6QyxTQUFTLHlCQUF5QixDQUFDLFFBQVEsRUFBRTtBQUNsRCxnQ0FBZSxRQUFRLENBQUMsQ0FBQztDQUMxQiIsImZpbGUiOiJkZWNvcmF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlZ2lzdGVySW5saW5lIGZyb20gJy4vZGVjb3JhdG9ycy9pbmxpbmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0RGVjb3JhdG9ycyhpbnN0YW5jZSkge1xuICByZWdpc3RlcklubGluZShpbnN0YW5jZSk7XG59XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/decorators/inline.js":
/*!**************************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/decorators/inline.js ***!
  \**************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;

var _utils = __webpack_require__(/*! ../utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

exports["default"] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2RlY29yYXRvcnMvaW5saW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQXVCLFVBQVU7O3FCQUVsQixVQUFTLFFBQVEsRUFBRTtBQUNoQyxVQUFRLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFVBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQzNFLFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ25CLFdBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFNBQUcsR0FBRyxVQUFTLE9BQU8sRUFBRSxPQUFPLEVBQUU7O0FBRS9CLFlBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDbEMsaUJBQVMsQ0FBQyxRQUFRLEdBQUcsY0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRCxZQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLGlCQUFTLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUM5QixlQUFPLEdBQUcsQ0FBQztPQUNaLENBQUM7S0FDSDs7QUFFRCxTQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUU3QyxXQUFPLEdBQUcsQ0FBQztHQUNaLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6ImlubGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4dGVuZCB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJEZWNvcmF0b3IoJ2lubGluZScsIGZ1bmN0aW9uKGZuLCBwcm9wcywgY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgbGV0IHJldCA9IGZuO1xuICAgIGlmICghcHJvcHMucGFydGlhbHMpIHtcbiAgICAgIHByb3BzLnBhcnRpYWxzID0ge307XG4gICAgICByZXQgPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBwYXJ0aWFscyBzdGFjayBmcmFtZSBwcmlvciB0byBleGVjLlxuICAgICAgICBsZXQgb3JpZ2luYWwgPSBjb250YWluZXIucGFydGlhbHM7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGV4dGVuZCh7fSwgb3JpZ2luYWwsIHByb3BzLnBhcnRpYWxzKTtcbiAgICAgICAgbGV0IHJldCA9IGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBvcmlnaW5hbDtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvcHMucGFydGlhbHNbb3B0aW9ucy5hcmdzWzBdXSA9IG9wdGlvbnMuZm47XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cbiJdfQ==


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/exception.js":
/*!******************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/exception.js ***!
  \******************************************************************/
/***/ ((module, exports) => {

"use strict";


exports.__esModule = true;
var errorProps = ['description', 'fileName', 'lineNumber', 'endLineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      endLineNumber = undefined,
      column = undefined,
      endColumn = undefined;

  if (loc) {
    line = loc.start.line;
    endLineNumber = loc.end.line;
    column = loc.start.column;
    endColumn = loc.end.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  try {
    if (loc) {
      this.lineNumber = line;
      this.endLineNumber = endLineNumber;

      // Work around issue under safari where we can't directly set the column value
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(this, 'column', {
          value: column,
          enumerable: true
        });
        Object.defineProperty(this, 'endColumn', {
          value: endColumn,
          enumerable: true
        });
      } else {
        this.column = column;
        this.endColumn = endColumn;
      }
    }
  } catch (nop) {
    /* Ignore if the browser is very particular */
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxJQUFNLFVBQVUsR0FBRyxDQUNqQixhQUFhLEVBQ2IsVUFBVSxFQUNWLFlBQVksRUFDWixlQUFlLEVBQ2YsU0FBUyxFQUNULE1BQU0sRUFDTixRQUFRLEVBQ1IsT0FBTyxDQUNSLENBQUM7O0FBRUYsU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUNoQyxNQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUc7TUFDeEIsSUFBSSxZQUFBO01BQ0osYUFBYSxZQUFBO01BQ2IsTUFBTSxZQUFBO01BQ04sU0FBUyxZQUFBLENBQUM7O0FBRVosTUFBSSxHQUFHLEVBQUU7QUFDUCxRQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDdEIsaUJBQWEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztBQUM3QixVQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDMUIsYUFBUyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDOztBQUUzQixXQUFPLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0dBQ3hDOztBQUVELE1BQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7OztBQUcxRCxPQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtBQUNoRCxRQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzlDOzs7QUFHRCxNQUFJLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtBQUMzQixTQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQzFDOztBQUVELE1BQUk7QUFDRixRQUFJLEdBQUcsRUFBRTtBQUNQLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDOzs7O0FBSW5DLFVBQUksTUFBTSxDQUFDLGNBQWMsRUFBRTtBQUN6QixjQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDcEMsZUFBSyxFQUFFLE1BQU07QUFDYixvQkFBVSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO0FBQ0gsY0FBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO0FBQ3ZDLGVBQUssRUFBRSxTQUFTO0FBQ2hCLG9CQUFVLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7T0FDSixNQUFNO0FBQ0wsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsWUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7T0FDNUI7S0FDRjtHQUNGLENBQUMsT0FBTyxHQUFHLEVBQUU7O0dBRWI7Q0FDRjs7QUFFRCxTQUFTLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7O3FCQUVuQixTQUFTIiwiZmlsZSI6ImV4Y2VwdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGVycm9yUHJvcHMgPSBbXG4gICdkZXNjcmlwdGlvbicsXG4gICdmaWxlTmFtZScsXG4gICdsaW5lTnVtYmVyJyxcbiAgJ2VuZExpbmVOdW1iZXInLFxuICAnbWVzc2FnZScsXG4gICduYW1lJyxcbiAgJ251bWJlcicsXG4gICdzdGFjaydcbl07XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIGxldCBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgIGxpbmUsXG4gICAgZW5kTGluZU51bWJlcixcbiAgICBjb2x1bW4sXG4gICAgZW5kQ29sdW1uO1xuXG4gIGlmIChsb2MpIHtcbiAgICBsaW5lID0gbG9jLnN0YXJ0LmxpbmU7XG4gICAgZW5kTGluZU51bWJlciA9IGxvYy5lbmQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuICAgIGVuZENvbHVtbiA9IGxvYy5lbmQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICBsZXQgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKGxvYykge1xuICAgICAgdGhpcy5saW5lTnVtYmVyID0gbGluZTtcbiAgICAgIHRoaXMuZW5kTGluZU51bWJlciA9IGVuZExpbmVOdW1iZXI7XG5cbiAgICAgIC8vIFdvcmsgYXJvdW5kIGlzc3VlIHVuZGVyIHNhZmFyaSB3aGVyZSB3ZSBjYW4ndCBkaXJlY3RseSBzZXQgdGhlIGNvbHVtbiB2YWx1ZVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjb2x1bW4nLCB7XG4gICAgICAgICAgdmFsdWU6IGNvbHVtbixcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2VuZENvbHVtbicsIHtcbiAgICAgICAgICB2YWx1ZTogZW5kQ29sdW1uLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgICAgdGhpcy5lbmRDb2x1bW4gPSBlbmRDb2x1bW47XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChub3ApIHtcbiAgICAvKiBJZ25vcmUgaWYgdGhlIGJyb3dzZXIgaXMgdmVyeSBwYXJ0aWN1bGFyICovXG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnQgZGVmYXVsdCBFeGNlcHRpb247XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/helpers.js":
/*!****************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/helpers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
exports.moveHelperToHooks = moveHelperToHooks;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = __webpack_require__(/*! ./helpers/block-helper-missing */ "./node_modules/handlebars/dist/cjs/handlebars/helpers/block-helper-missing.js");

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = __webpack_require__(/*! ./helpers/each */ "./node_modules/handlebars/dist/cjs/handlebars/helpers/each.js");

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = __webpack_require__(/*! ./helpers/helper-missing */ "./node_modules/handlebars/dist/cjs/handlebars/helpers/helper-missing.js");

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = __webpack_require__(/*! ./helpers/if */ "./node_modules/handlebars/dist/cjs/handlebars/helpers/if.js");

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = __webpack_require__(/*! ./helpers/log */ "./node_modules/handlebars/dist/cjs/handlebars/helpers/log.js");

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = __webpack_require__(/*! ./helpers/lookup */ "./node_modules/handlebars/dist/cjs/handlebars/helpers/lookup.js");

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = __webpack_require__(/*! ./helpers/with */ "./node_modules/handlebars/dist/cjs/handlebars/helpers/with.js");

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}

function moveHelperToHooks(instance, helperName, keepHelper) {
  if (instance.helpers[helperName]) {
    instance.hooks[helperName] = instance.helpers[helperName];
    if (!keepHelper) {
      delete instance.helpers[helperName];
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3lDQUF1QyxnQ0FBZ0M7Ozs7MkJBQzlDLGdCQUFnQjs7OztvQ0FDUCwwQkFBMEI7Ozs7eUJBQ3JDLGNBQWM7Ozs7MEJBQ2IsZUFBZTs7Ozs2QkFDWixrQkFBa0I7Ozs7MkJBQ3BCLGdCQUFnQjs7OztBQUVsQyxTQUFTLHNCQUFzQixDQUFDLFFBQVEsRUFBRTtBQUMvQyx5Q0FBMkIsUUFBUSxDQUFDLENBQUM7QUFDckMsMkJBQWEsUUFBUSxDQUFDLENBQUM7QUFDdkIsb0NBQXNCLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLHlCQUFXLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLDBCQUFZLFFBQVEsQ0FBQyxDQUFDO0FBQ3RCLDZCQUFlLFFBQVEsQ0FBQyxDQUFDO0FBQ3pCLDJCQUFhLFFBQVEsQ0FBQyxDQUFDO0NBQ3hCOztBQUVNLFNBQVMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUU7QUFDbEUsTUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ2hDLFlBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxRCxRQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsYUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3JDO0dBQ0Y7Q0FDRiIsImZpbGUiOiJoZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlZ2lzdGVyQmxvY2tIZWxwZXJNaXNzaW5nIGZyb20gJy4vaGVscGVycy9ibG9jay1oZWxwZXItbWlzc2luZyc7XG5pbXBvcnQgcmVnaXN0ZXJFYWNoIGZyb20gJy4vaGVscGVycy9lYWNoJztcbmltcG9ydCByZWdpc3RlckhlbHBlck1pc3NpbmcgZnJvbSAnLi9oZWxwZXJzL2hlbHBlci1taXNzaW5nJztcbmltcG9ydCByZWdpc3RlcklmIGZyb20gJy4vaGVscGVycy9pZic7XG5pbXBvcnQgcmVnaXN0ZXJMb2cgZnJvbSAnLi9oZWxwZXJzL2xvZyc7XG5pbXBvcnQgcmVnaXN0ZXJMb29rdXAgZnJvbSAnLi9oZWxwZXJzL2xvb2t1cCc7XG5pbXBvcnQgcmVnaXN0ZXJXaXRoIGZyb20gJy4vaGVscGVycy93aXRoJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnMoaW5zdGFuY2UpIHtcbiAgcmVnaXN0ZXJCbG9ja0hlbHBlck1pc3NpbmcoaW5zdGFuY2UpO1xuICByZWdpc3RlckVhY2goaW5zdGFuY2UpO1xuICByZWdpc3RlckhlbHBlck1pc3NpbmcoaW5zdGFuY2UpO1xuICByZWdpc3RlcklmKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJMb2coaW5zdGFuY2UpO1xuICByZWdpc3Rlckxvb2t1cChpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyV2l0aChpbnN0YW5jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlSGVscGVyVG9Ib29rcyhpbnN0YW5jZSwgaGVscGVyTmFtZSwga2VlcEhlbHBlcikge1xuICBpZiAoaW5zdGFuY2UuaGVscGVyc1toZWxwZXJOYW1lXSkge1xuICAgIGluc3RhbmNlLmhvb2tzW2hlbHBlck5hbWVdID0gaW5zdGFuY2UuaGVscGVyc1toZWxwZXJOYW1lXTtcbiAgICBpZiAoIWtlZXBIZWxwZXIpIHtcbiAgICAgIGRlbGV0ZSBpbnN0YW5jZS5oZWxwZXJzW2hlbHBlck5hbWVdO1xuICAgIH1cbiAgfVxufVxuIl19


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/helpers/block-helper-missing.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/helpers/block-helper-missing.js ***!
  \*************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;

var _utils = __webpack_require__(/*! ../utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

exports["default"] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvYmxvY2staGVscGVyLW1pc3NpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztxQkFBd0QsVUFBVTs7cUJBRW5ELFVBQVMsUUFBUSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLEVBQUUsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3ZFLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPO1FBQzNCLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUVsQixRQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7QUFDcEIsYUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakIsTUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLElBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUMvQyxhQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN0QixNQUFNLElBQUksZUFBUSxPQUFPLENBQUMsRUFBRTtBQUMzQixVQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3RCLFlBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNmLGlCQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlCOztBQUVELGVBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ2hELE1BQU07QUFDTCxlQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN0QjtLQUNGLE1BQU07QUFDTCxVQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUMvQixZQUFJLElBQUksR0FBRyxtQkFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsWUFBSSxDQUFDLFdBQVcsR0FBRyx5QkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQ2IsQ0FBQztBQUNGLGVBQU8sR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztPQUMxQjs7QUFFRCxhQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDN0I7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJibG9jay1oZWxwZXItbWlzc2luZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFwcGVuZENvbnRleHRQYXRoLCBjcmVhdGVGcmFtZSwgaXNBcnJheSB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBsZXQgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIGxldCBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKFxuICAgICAgICAgIG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCxcbiAgICAgICAgICBvcHRpb25zLm5hbWVcbiAgICAgICAgKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/helpers/each.js":
/*!*********************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/helpers/each.js ***!
  \*********************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = __webpack_require__(/*! ../utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

var _exception = __webpack_require__(/*! ../exception */ "./node_modules/handlebars/dist/cjs/handlebars/exception.js");

var _exception2 = _interopRequireDefault(_exception);

exports["default"] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else if (typeof Symbol === 'function' && context[Symbol.iterator]) {
        var newContext = [];
        var iterator = context[Symbol.iterator]();
        for (var it = iterator.next(); !it.done; it = iterator.next()) {
          newContext.push(it.value);
        }
        context = newContext;
        for (var j = context.length; i < j; i++) {
          execIteration(i, i, i === context.length - 1);
        }
      } else {
        (function () {
          var priorKey = undefined;

          Object.keys(context).forEach(function (key) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          });
          if (priorKey !== undefined) {
            execIteration(priorKey, i - 1, true);
          }
        })();
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvZWFjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O3FCQU1PLFVBQVU7O3lCQUNLLGNBQWM7Ozs7cUJBRXJCLFVBQVMsUUFBUSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVMsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN6RCxRQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osWUFBTSwyQkFBYyw2QkFBNkIsQ0FBQyxDQUFDO0tBQ3BEOztBQUVELFFBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFO1FBQ2pCLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTztRQUN6QixDQUFDLEdBQUcsQ0FBQztRQUNMLEdBQUcsR0FBRyxFQUFFO1FBQ1IsSUFBSSxZQUFBO1FBQ0osV0FBVyxZQUFBLENBQUM7O0FBRWQsUUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7QUFDL0IsaUJBQVcsR0FDVCx5QkFBa0IsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUNyRTs7QUFFRCxRQUFJLGtCQUFXLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZCLGFBQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlCOztBQUVELFFBQUksT0FBTyxDQUFDLElBQUksRUFBRTtBQUNoQixVQUFJLEdBQUcsbUJBQVksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xDOztBQUVELGFBQVMsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0FBQ3pDLFVBQUksSUFBSSxFQUFFO0FBQ1IsWUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDakIsWUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsWUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQzs7QUFFbkIsWUFBSSxXQUFXLEVBQUU7QUFDZixjQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDeEM7T0FDRjs7QUFFRCxTQUFHLEdBQ0QsR0FBRyxHQUNILEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDakIsWUFBSSxFQUFFLElBQUk7QUFDVixtQkFBVyxFQUFFLG1CQUNYLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN2QixDQUFDLFdBQVcsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQzVCO09BQ0YsQ0FBQyxDQUFDO0tBQ047O0FBRUQsUUFBSSxPQUFPLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQzFDLFVBQUksZUFBUSxPQUFPLENBQUMsRUFBRTtBQUNwQixhQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN2QyxjQUFJLENBQUMsSUFBSSxPQUFPLEVBQUU7QUFDaEIseUJBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1dBQy9DO1NBQ0Y7T0FDRixNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDbkUsWUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFlBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztBQUM1QyxhQUFLLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRTtBQUM3RCxvQkFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDM0I7QUFDRCxlQUFPLEdBQUcsVUFBVSxDQUFDO0FBQ3JCLGFBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3ZDLHVCQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUMvQztPQUNGLE1BQU07O0FBQ0wsY0FBSSxRQUFRLFlBQUEsQ0FBQzs7QUFFYixnQkFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7Ozs7QUFJbEMsZ0JBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQiwyQkFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDaEM7QUFDRCxvQkFBUSxHQUFHLEdBQUcsQ0FBQztBQUNmLGFBQUMsRUFBRSxDQUFDO1dBQ0wsQ0FBQyxDQUFDO0FBQ0gsY0FBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLHlCQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7V0FDdEM7O09BQ0Y7S0FDRjs7QUFFRCxRQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDWCxTQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3JCOztBQUVELFdBQU8sR0FBRyxDQUFDO0dBQ1osQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiZWFjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGFwcGVuZENvbnRleHRQYXRoLFxuICBibG9ja1BhcmFtcyxcbiAgY3JlYXRlRnJhbWUsXG4gIGlzQXJyYXksXG4gIGlzRnVuY3Rpb25cbn0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuLi9leGNlcHRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgaSA9IDAsXG4gICAgICByZXQgPSAnJyxcbiAgICAgIGRhdGEsXG4gICAgICBjb250ZXh0UGF0aDtcblxuICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgIGNvbnRleHRQYXRoID1cbiAgICAgICAgYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSkgKyAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgICAgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY0l0ZXJhdGlvbihmaWVsZCwgaW5kZXgsIGxhc3QpIHtcbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIGRhdGEua2V5ID0gZmllbGQ7XG4gICAgICAgIGRhdGEuaW5kZXggPSBpbmRleDtcbiAgICAgICAgZGF0YS5maXJzdCA9IGluZGV4ID09PSAwO1xuICAgICAgICBkYXRhLmxhc3QgPSAhIWxhc3Q7XG5cbiAgICAgICAgaWYgKGNvbnRleHRQYXRoKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGNvbnRleHRQYXRoICsgZmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0ID1cbiAgICAgICAgcmV0ICtcbiAgICAgICAgZm4oY29udGV4dFtmaWVsZF0sIHtcbiAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyhcbiAgICAgICAgICAgIFtjb250ZXh0W2ZpZWxkXSwgZmllbGRdLFxuICAgICAgICAgICAgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdXG4gICAgICAgICAgKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICAgIGZvciAobGV0IGogPSBjb250ZXh0Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgIGlmIChpIGluIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGV4ZWNJdGVyYXRpb24oaSwgaSwgaSA9PT0gY29udGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBjb250ZXh0W1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgY29uc3QgbmV3Q29udGV4dCA9IFtdO1xuICAgICAgICBjb25zdCBpdGVyYXRvciA9IGNvbnRleHRbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgICAgICBmb3IgKGxldCBpdCA9IGl0ZXJhdG9yLm5leHQoKTsgIWl0LmRvbmU7IGl0ID0gaXRlcmF0b3IubmV4dCgpKSB7XG4gICAgICAgICAgbmV3Q29udGV4dC5wdXNoKGl0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0ID0gbmV3Q29udGV4dDtcbiAgICAgICAgZm9yIChsZXQgaiA9IGNvbnRleHQubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihpLCBpLCBpID09PSBjb250ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcHJpb3JLZXk7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIC8vIFdlJ3JlIHJ1bm5pbmcgdGhlIGl0ZXJhdGlvbnMgb25lIHN0ZXAgb3V0IG9mIHN5bmMgc28gd2UgY2FuIGRldGVjdFxuICAgICAgICAgIC8vIHRoZSBsYXN0IGl0ZXJhdGlvbiB3aXRob3V0IGhhdmUgdG8gc2NhbiB0aGUgb2JqZWN0IHR3aWNlIGFuZCBjcmVhdGVcbiAgICAgICAgICAvLyBhbiBpdGVybWVkaWF0ZSBrZXlzIGFycmF5LlxuICAgICAgICAgIGlmIChwcmlvcktleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByaW9yS2V5ID0ga2V5O1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChwcmlvcktleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/helpers/helper-missing.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/helpers/helper-missing.js ***!
  \*******************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = __webpack_require__(/*! ../exception */ "./node_modules/handlebars/dist/cjs/handlebars/exception.js");

var _exception2 = _interopRequireDefault(_exception);

exports["default"] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaGVscGVyLW1pc3NpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozt5QkFBc0IsY0FBYzs7OztxQkFFckIsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsaUNBQWdDO0FBQ3ZFLFFBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRTFCLGFBQU8sU0FBUyxDQUFDO0tBQ2xCLE1BQU07O0FBRUwsWUFBTSwyQkFDSixtQkFBbUIsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUNqRSxDQUFDO0tBQ0g7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJoZWxwZXItbWlzc2luZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi4vZXhjZXB0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbigvKiBbYXJncywgXW9wdGlvbnMgKi8pIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHJ1Y3QuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTb21lb25lIGlzIGFjdHVhbGx5IHRyeWluZyB0byBjYWxsIHNvbWV0aGluZywgYmxvdyB1cC5cbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXG4gICAgICAgICdNaXNzaW5nIGhlbHBlcjogXCInICsgYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXS5uYW1lICsgJ1wiJ1xuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufVxuIl19


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/helpers/if.js":
/*!*******************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/helpers/if.js ***!
  \*******************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = __webpack_require__(/*! ../utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

var _exception = __webpack_require__(/*! ../exception */ "./node_modules/handlebars/dist/cjs/handlebars/exception.js");

var _exception2 = _interopRequireDefault(_exception);

exports["default"] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (arguments.length != 2) {
      throw new _exception2['default']('#if requires exactly one argument');
    }
    if (_utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    if (arguments.length != 2) {
      throw new _exception2['default']('#unless requires exactly one argument');
    }
    return instance.helpers['if'].call(this, conditional, {
      fn: options.inverse,
      inverse: options.fn,
      hash: options.hash
    });
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaWYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztxQkFBb0MsVUFBVTs7eUJBQ3hCLGNBQWM7Ozs7cUJBRXJCLFVBQVMsUUFBUSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVMsV0FBVyxFQUFFLE9BQU8sRUFBRTtBQUMzRCxRQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ3pCLFlBQU0sMkJBQWMsbUNBQW1DLENBQUMsQ0FBQztLQUMxRDtBQUNELFFBQUksa0JBQVcsV0FBVyxDQUFDLEVBQUU7QUFDM0IsaUJBQVcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3RDOzs7OztBQUtELFFBQUksQUFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxJQUFLLGVBQVEsV0FBVyxDQUFDLEVBQUU7QUFDdkUsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlCLE1BQU07QUFDTCxhQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDekI7R0FDRixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBUyxXQUFXLEVBQUUsT0FBTyxFQUFFO0FBQy9ELFFBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7QUFDekIsWUFBTSwyQkFBYyx1Q0FBdUMsQ0FBQyxDQUFDO0tBQzlEO0FBQ0QsV0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO0FBQ3BELFFBQUUsRUFBRSxPQUFPLENBQUMsT0FBTztBQUNuQixhQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFDbkIsVUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO0tBQ25CLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6ImlmLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNFbXB0eSwgaXNGdW5jdGlvbiB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi4vZXhjZXB0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPSAyKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCcjaWYgcmVxdWlyZXMgZXhhY3RseSBvbmUgYXJndW1lbnQnKTtcbiAgICB9XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7XG4gICAgICBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoKCFvcHRpb25zLmhhc2guaW5jbHVkZVplcm8gJiYgIWNvbmRpdGlvbmFsKSB8fCBpc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPSAyKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCcjdW5sZXNzIHJlcXVpcmVzIGV4YWN0bHkgb25lIGFyZ3VtZW50Jyk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtcbiAgICAgIGZuOiBvcHRpb25zLmludmVyc2UsXG4gICAgICBpbnZlcnNlOiBvcHRpb25zLmZuLFxuICAgICAgaGFzaDogb3B0aW9ucy5oYXNoXG4gICAgfSk7XG4gIH0pO1xufVxuIl19


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/helpers/log.js":
/*!********************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/helpers/log.js ***!
  \********************************************************************/
/***/ ((module, exports) => {

"use strict";


exports.__esModule = true;

exports["default"] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQWUsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsa0NBQWlDO0FBQzlELFFBQUksSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ3BCLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0MsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN6Qjs7QUFFRCxRQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxRQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtBQUM5QixXQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDNUIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3JELFdBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztLQUM1QjtBQUNELFFBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7O0FBRWhCLFlBQVEsQ0FBQyxHQUFHLE1BQUEsQ0FBWixRQUFRLEVBQVEsSUFBSSxDQUFDLENBQUM7R0FDdkIsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKC8qIG1lc3NhZ2UsIG9wdGlvbnMgKi8pIHtcbiAgICBsZXQgYXJncyA9IFt1bmRlZmluZWRdLFxuICAgICAgb3B0aW9ucyA9IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgbGV2ZWwgPSAxO1xuICAgIGlmIChvcHRpb25zLmhhc2gubGV2ZWwgIT0gbnVsbCkge1xuICAgICAgbGV2ZWwgPSBvcHRpb25zLmhhc2gubGV2ZWw7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwpIHtcbiAgICAgIGxldmVsID0gb3B0aW9ucy5kYXRhLmxldmVsO1xuICAgIH1cbiAgICBhcmdzWzBdID0gbGV2ZWw7XG5cbiAgICBpbnN0YW5jZS5sb2coLi4uYXJncyk7XG4gIH0pO1xufVxuIl19


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/helpers/lookup.js":
/*!***********************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/helpers/lookup.js ***!
  \***********************************************************************/
/***/ ((module, exports) => {

"use strict";


exports.__esModule = true;

exports["default"] = function (instance) {
  instance.registerHelper('lookup', function (obj, field, options) {
    if (!obj) {
      // Note for 5.0: Change to "obj == null" in 5.0
      return obj;
    }
    return options.lookupProperty(obj, field);
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvbG9va3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUJBQWUsVUFBUyxRQUFRLEVBQUU7QUFDaEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBUyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUM5RCxRQUFJLENBQUMsR0FBRyxFQUFFOztBQUVSLGFBQU8sR0FBRyxDQUFDO0tBQ1o7QUFDRCxXQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQzNDLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6Imxvb2t1cC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb29rdXAnLCBmdW5jdGlvbihvYmosIGZpZWxkLCBvcHRpb25zKSB7XG4gICAgaWYgKCFvYmopIHtcbiAgICAgIC8vIE5vdGUgZm9yIDUuMDogQ2hhbmdlIHRvIFwib2JqID09IG51bGxcIiBpbiA1LjBcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zLmxvb2t1cFByb3BlcnR5KG9iaiwgZmllbGQpO1xuICB9KTtcbn1cbiJdfQ==


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/helpers/with.js":
/*!*********************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/helpers/with.js ***!
  \*********************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = __webpack_require__(/*! ../utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

var _exception = __webpack_require__(/*! ../exception */ "./node_modules/handlebars/dist/cjs/handlebars/exception.js");

var _exception2 = _interopRequireDefault(_exception);

exports["default"] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (arguments.length != 2) {
      throw new _exception2['default']('#with requires exactly one argument');
    }
    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!_utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: _utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvd2l0aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O3FCQU1PLFVBQVU7O3lCQUNLLGNBQWM7Ozs7cUJBRXJCLFVBQVMsUUFBUSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVMsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN6RCxRQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ3pCLFlBQU0sMkJBQWMscUNBQXFDLENBQUMsQ0FBQztLQUM1RDtBQUNELFFBQUksa0JBQVcsT0FBTyxDQUFDLEVBQUU7QUFDdkIsYUFBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDOUI7O0FBRUQsUUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQzs7QUFFcEIsUUFBSSxDQUFDLGVBQVEsT0FBTyxDQUFDLEVBQUU7QUFDckIsVUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUN4QixVQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUMvQixZQUFJLEdBQUcsbUJBQVksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFlBQUksQ0FBQyxXQUFXLEdBQUcseUJBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUNmLENBQUM7T0FDSDs7QUFFRCxhQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUU7QUFDakIsWUFBSSxFQUFFLElBQUk7QUFDVixtQkFBVyxFQUFFLG1CQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ2hFLENBQUMsQ0FBQztLQUNKLE1BQU07QUFDTCxhQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDOUI7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJ3aXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgYXBwZW5kQ29udGV4dFBhdGgsXG4gIGJsb2NrUGFyYW1zLFxuICBjcmVhdGVGcmFtZSxcbiAgaXNFbXB0eSxcbiAgaXNGdW5jdGlvblxufSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4uL2V4Y2VwdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICE9IDIpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJyN3aXRoIHJlcXVpcmVzIGV4YWN0bHkgb25lIGFyZ3VtZW50Jyk7XG4gICAgfVxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoIWlzRW1wdHkoY29udGV4dCkpIHtcbiAgICAgIGxldCBkYXRhID0gb3B0aW9ucy5kYXRhO1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKFxuICAgICAgICAgIG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCxcbiAgICAgICAgICBvcHRpb25zLmlkc1swXVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwge1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBibG9ja1BhcmFtczogYmxvY2tQYXJhbXMoW2NvbnRleHRdLCBbZGF0YSAmJiBkYXRhLmNvbnRleHRQYXRoXSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/internal/create-new-lookup-object.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/internal/create-new-lookup-object.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.createNewLookupObject = createNewLookupObject;

var _utils = __webpack_require__(/*! ../utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

/**
 * Create a new object with "null"-prototype to avoid truthy results on prototype properties.
 * The resulting object can be used with "object[property]" to check if a property exists
 * @param {...object} sources a varargs parameter of source objects that will be merged
 * @returns {object}
 */

function createNewLookupObject() {
  for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
    sources[_key] = arguments[_key];
  }

  return _utils.extend.apply(undefined, [Object.create(null)].concat(sources));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2ludGVybmFsL2NyZWF0ZS1uZXctbG9va3VwLW9iamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztxQkFBdUIsVUFBVTs7Ozs7Ozs7O0FBUTFCLFNBQVMscUJBQXFCLEdBQWE7b0NBQVQsT0FBTztBQUFQLFdBQU87OztBQUM5QyxTQUFPLGdDQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQUssT0FBTyxFQUFDLENBQUM7Q0FDaEQiLCJmaWxlIjoiY3JlYXRlLW5ldy1sb29rdXAtb2JqZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBvYmplY3Qgd2l0aCBcIm51bGxcIi1wcm90b3R5cGUgdG8gYXZvaWQgdHJ1dGh5IHJlc3VsdHMgb24gcHJvdG90eXBlIHByb3BlcnRpZXMuXG4gKiBUaGUgcmVzdWx0aW5nIG9iamVjdCBjYW4gYmUgdXNlZCB3aXRoIFwib2JqZWN0W3Byb3BlcnR5XVwiIHRvIGNoZWNrIGlmIGEgcHJvcGVydHkgZXhpc3RzXG4gKiBAcGFyYW0gey4uLm9iamVjdH0gc291cmNlcyBhIHZhcmFyZ3MgcGFyYW1ldGVyIG9mIHNvdXJjZSBvYmplY3RzIHRoYXQgd2lsbCBiZSBtZXJnZWRcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZXdMb29rdXBPYmplY3QoLi4uc291cmNlcykge1xuICByZXR1cm4gZXh0ZW5kKE9iamVjdC5jcmVhdGUobnVsbCksIC4uLnNvdXJjZXMpO1xufVxuIl19


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/internal/proto-access.js":
/*!******************************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/internal/proto-access.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.createProtoAccessControl = createProtoAccessControl;
exports.resultIsAllowed = resultIsAllowed;
exports.resetLoggedProperties = resetLoggedProperties;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _createNewLookupObject = __webpack_require__(/*! ./create-new-lookup-object */ "./node_modules/handlebars/dist/cjs/handlebars/internal/create-new-lookup-object.js");

var _logger = __webpack_require__(/*! ../logger */ "./node_modules/handlebars/dist/cjs/handlebars/logger.js");

var _logger2 = _interopRequireDefault(_logger);

var loggedProperties = Object.create(null);

function createProtoAccessControl(runtimeOptions) {
  var defaultMethodWhiteList = Object.create(null);
  defaultMethodWhiteList['constructor'] = false;
  defaultMethodWhiteList['__defineGetter__'] = false;
  defaultMethodWhiteList['__defineSetter__'] = false;
  defaultMethodWhiteList['__lookupGetter__'] = false;

  var defaultPropertyWhiteList = Object.create(null);
  // eslint-disable-next-line no-proto
  defaultPropertyWhiteList['__proto__'] = false;

  return {
    properties: {
      whitelist: _createNewLookupObject.createNewLookupObject(defaultPropertyWhiteList, runtimeOptions.allowedProtoProperties),
      defaultValue: runtimeOptions.allowProtoPropertiesByDefault
    },
    methods: {
      whitelist: _createNewLookupObject.createNewLookupObject(defaultMethodWhiteList, runtimeOptions.allowedProtoMethods),
      defaultValue: runtimeOptions.allowProtoMethodsByDefault
    }
  };
}

function resultIsAllowed(result, protoAccessControl, propertyName) {
  if (typeof result === 'function') {
    return checkWhiteList(protoAccessControl.methods, propertyName);
  } else {
    return checkWhiteList(protoAccessControl.properties, propertyName);
  }
}

function checkWhiteList(protoAccessControlForType, propertyName) {
  if (protoAccessControlForType.whitelist[propertyName] !== undefined) {
    return protoAccessControlForType.whitelist[propertyName] === true;
  }
  if (protoAccessControlForType.defaultValue !== undefined) {
    return protoAccessControlForType.defaultValue;
  }
  logUnexpecedPropertyAccessOnce(propertyName);
  return false;
}

function logUnexpecedPropertyAccessOnce(propertyName) {
  if (loggedProperties[propertyName] !== true) {
    loggedProperties[propertyName] = true;
    _logger2['default'].log('error', 'Handlebars: Access has been denied to resolve the property "' + propertyName + '" because it is not an "own property" of its parent.\n' + 'You can add a runtime option to disable the check or this warning:\n' + 'See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details');
  }
}

function resetLoggedProperties() {
  Object.keys(loggedProperties).forEach(function (propertyName) {
    delete loggedProperties[propertyName];
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2ludGVybmFsL3Byb3RvLWFjY2Vzcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3FDQUFzQyw0QkFBNEI7O3NCQUMvQyxXQUFXOzs7O0FBRTlCLElBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFdEMsU0FBUyx3QkFBd0IsQ0FBQyxjQUFjLEVBQUU7QUFDdkQsTUFBSSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELHdCQUFzQixDQUFDLGFBQWEsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUM5Qyx3QkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNuRCx3QkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNuRCx3QkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEtBQUssQ0FBQzs7QUFFbkQsTUFBSSx3QkFBd0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVuRCwwQkFBd0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxLQUFLLENBQUM7O0FBRTlDLFNBQU87QUFDTCxjQUFVLEVBQUU7QUFDVixlQUFTLEVBQUUsNkNBQ1Qsd0JBQXdCLEVBQ3hCLGNBQWMsQ0FBQyxzQkFBc0IsQ0FDdEM7QUFDRCxrQkFBWSxFQUFFLGNBQWMsQ0FBQyw2QkFBNkI7S0FDM0Q7QUFDRCxXQUFPLEVBQUU7QUFDUCxlQUFTLEVBQUUsNkNBQ1Qsc0JBQXNCLEVBQ3RCLGNBQWMsQ0FBQyxtQkFBbUIsQ0FDbkM7QUFDRCxrQkFBWSxFQUFFLGNBQWMsQ0FBQywwQkFBMEI7S0FDeEQ7R0FDRixDQUFDO0NBQ0g7O0FBRU0sU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRTtBQUN4RSxNQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsRUFBRTtBQUNoQyxXQUFPLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7R0FDakUsTUFBTTtBQUNMLFdBQU8sY0FBYyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztHQUNwRTtDQUNGOztBQUVELFNBQVMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLFlBQVksRUFBRTtBQUMvRCxNQUFJLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxTQUFTLEVBQUU7QUFDbkUsV0FBTyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssSUFBSSxDQUFDO0dBQ25FO0FBQ0QsTUFBSSx5QkFBeUIsQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO0FBQ3hELFdBQU8seUJBQXlCLENBQUMsWUFBWSxDQUFDO0dBQy9DO0FBQ0QsZ0NBQThCLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0MsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxTQUFTLDhCQUE4QixDQUFDLFlBQVksRUFBRTtBQUNwRCxNQUFJLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxLQUFLLElBQUksRUFBRTtBQUMzQyxvQkFBZ0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDdEMsd0JBQU8sR0FBRyxDQUNSLE9BQU8sRUFDUCxpRUFBK0QsWUFBWSxvSUFDSCxvSEFDMkMsQ0FDcEgsQ0FBQztHQUNIO0NBQ0Y7O0FBRU0sU0FBUyxxQkFBcUIsR0FBRztBQUN0QyxRQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsWUFBWSxFQUFJO0FBQ3BELFdBQU8sZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDdkMsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoicHJvdG8tYWNjZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlTmV3TG9va3VwT2JqZWN0IH0gZnJvbSAnLi9jcmVhdGUtbmV3LWxvb2t1cC1vYmplY3QnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuXG5jb25zdCBsb2dnZWRQcm9wZXJ0aWVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb3RvQWNjZXNzQ29udHJvbChydW50aW1lT3B0aW9ucykge1xuICBsZXQgZGVmYXVsdE1ldGhvZFdoaXRlTGlzdCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGRlZmF1bHRNZXRob2RXaGl0ZUxpc3RbJ2NvbnN0cnVjdG9yJ10gPSBmYWxzZTtcbiAgZGVmYXVsdE1ldGhvZFdoaXRlTGlzdFsnX19kZWZpbmVHZXR0ZXJfXyddID0gZmFsc2U7XG4gIGRlZmF1bHRNZXRob2RXaGl0ZUxpc3RbJ19fZGVmaW5lU2V0dGVyX18nXSA9IGZhbHNlO1xuICBkZWZhdWx0TWV0aG9kV2hpdGVMaXN0WydfX2xvb2t1cEdldHRlcl9fJ10gPSBmYWxzZTtcblxuICBsZXQgZGVmYXVsdFByb3BlcnR5V2hpdGVMaXN0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvXG4gIGRlZmF1bHRQcm9wZXJ0eVdoaXRlTGlzdFsnX19wcm90b19fJ10gPSBmYWxzZTtcblxuICByZXR1cm4ge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHdoaXRlbGlzdDogY3JlYXRlTmV3TG9va3VwT2JqZWN0KFxuICAgICAgICBkZWZhdWx0UHJvcGVydHlXaGl0ZUxpc3QsXG4gICAgICAgIHJ1bnRpbWVPcHRpb25zLmFsbG93ZWRQcm90b1Byb3BlcnRpZXNcbiAgICAgICksXG4gICAgICBkZWZhdWx0VmFsdWU6IHJ1bnRpbWVPcHRpb25zLmFsbG93UHJvdG9Qcm9wZXJ0aWVzQnlEZWZhdWx0XG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICB3aGl0ZWxpc3Q6IGNyZWF0ZU5ld0xvb2t1cE9iamVjdChcbiAgICAgICAgZGVmYXVsdE1ldGhvZFdoaXRlTGlzdCxcbiAgICAgICAgcnVudGltZU9wdGlvbnMuYWxsb3dlZFByb3RvTWV0aG9kc1xuICAgICAgKSxcbiAgICAgIGRlZmF1bHRWYWx1ZTogcnVudGltZU9wdGlvbnMuYWxsb3dQcm90b01ldGhvZHNCeURlZmF1bHRcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXN1bHRJc0FsbG93ZWQocmVzdWx0LCBwcm90b0FjY2Vzc0NvbnRyb2wsIHByb3BlcnR5TmFtZSkge1xuICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBjaGVja1doaXRlTGlzdChwcm90b0FjY2Vzc0NvbnRyb2wubWV0aG9kcywgcHJvcGVydHlOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY2hlY2tXaGl0ZUxpc3QocHJvdG9BY2Nlc3NDb250cm9sLnByb3BlcnRpZXMsIHByb3BlcnR5TmFtZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tXaGl0ZUxpc3QocHJvdG9BY2Nlc3NDb250cm9sRm9yVHlwZSwgcHJvcGVydHlOYW1lKSB7XG4gIGlmIChwcm90b0FjY2Vzc0NvbnRyb2xGb3JUeXBlLndoaXRlbGlzdFtwcm9wZXJ0eU5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcHJvdG9BY2Nlc3NDb250cm9sRm9yVHlwZS53aGl0ZWxpc3RbcHJvcGVydHlOYW1lXSA9PT0gdHJ1ZTtcbiAgfVxuICBpZiAocHJvdG9BY2Nlc3NDb250cm9sRm9yVHlwZS5kZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBwcm90b0FjY2Vzc0NvbnRyb2xGb3JUeXBlLmRlZmF1bHRWYWx1ZTtcbiAgfVxuICBsb2dVbmV4cGVjZWRQcm9wZXJ0eUFjY2Vzc09uY2UocHJvcGVydHlOYW1lKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBsb2dVbmV4cGVjZWRQcm9wZXJ0eUFjY2Vzc09uY2UocHJvcGVydHlOYW1lKSB7XG4gIGlmIChsb2dnZWRQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gIT09IHRydWUpIHtcbiAgICBsb2dnZWRQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB0cnVlO1xuICAgIGxvZ2dlci5sb2coXG4gICAgICAnZXJyb3InLFxuICAgICAgYEhhbmRsZWJhcnM6IEFjY2VzcyBoYXMgYmVlbiBkZW5pZWQgdG8gcmVzb2x2ZSB0aGUgcHJvcGVydHkgXCIke3Byb3BlcnR5TmFtZX1cIiBiZWNhdXNlIGl0IGlzIG5vdCBhbiBcIm93biBwcm9wZXJ0eVwiIG9mIGl0cyBwYXJlbnQuXFxuYCArXG4gICAgICAgIGBZb3UgY2FuIGFkZCBhIHJ1bnRpbWUgb3B0aW9uIHRvIGRpc2FibGUgdGhlIGNoZWNrIG9yIHRoaXMgd2FybmluZzpcXG5gICtcbiAgICAgICAgYFNlZSBodHRwczovL2hhbmRsZWJhcnNqcy5jb20vYXBpLXJlZmVyZW5jZS9ydW50aW1lLW9wdGlvbnMuaHRtbCNvcHRpb25zLXRvLWNvbnRyb2wtcHJvdG90eXBlLWFjY2VzcyBmb3IgZGV0YWlsc2BcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldExvZ2dlZFByb3BlcnRpZXMoKSB7XG4gIE9iamVjdC5rZXlzKGxvZ2dlZFByb3BlcnRpZXMpLmZvckVhY2gocHJvcGVydHlOYW1lID0+IHtcbiAgICBkZWxldGUgbG9nZ2VkUHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuICB9KTtcbn1cbiJdfQ==


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/internal/wrapHelper.js":
/*!****************************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/internal/wrapHelper.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.__esModule = true;
exports.wrapHelper = wrapHelper;

function wrapHelper(helper, transformOptionsFn) {
  if (typeof helper !== 'function') {
    // This should not happen, but apparently it does in https://github.com/wycats/handlebars.js/issues/1639
    // We try to make the wrapper least-invasive by not wrapping it, if the helper is not a function.
    return helper;
  }
  var wrapper = function wrapper() /* dynamic arguments */{
    var options = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = transformOptionsFn(options);
    return helper.apply(this, arguments);
  };
  return wrapper;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2ludGVybmFsL3dyYXBIZWxwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBTyxTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLEVBQUU7QUFDckQsTUFBSSxPQUFPLE1BQU0sS0FBSyxVQUFVLEVBQUU7OztBQUdoQyxXQUFPLE1BQU0sQ0FBQztHQUNmO0FBQ0QsTUFBSSxPQUFPLEdBQUcsU0FBVixPQUFPLDBCQUFxQztBQUM5QyxRQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoRCxhQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5RCxXQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQ3RDLENBQUM7QUFDRixTQUFPLE9BQU8sQ0FBQztDQUNoQiIsImZpbGUiOiJ3cmFwSGVscGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHdyYXBIZWxwZXIoaGVscGVyLCB0cmFuc2Zvcm1PcHRpb25zRm4pIHtcbiAgaWYgKHR5cGVvZiBoZWxwZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBidXQgYXBwYXJlbnRseSBpdCBkb2VzIGluIGh0dHBzOi8vZ2l0aHViLmNvbS93eWNhdHMvaGFuZGxlYmFycy5qcy9pc3N1ZXMvMTYzOVxuICAgIC8vIFdlIHRyeSB0byBtYWtlIHRoZSB3cmFwcGVyIGxlYXN0LWludmFzaXZlIGJ5IG5vdCB3cmFwcGluZyBpdCwgaWYgdGhlIGhlbHBlciBpcyBub3QgYSBmdW5jdGlvbi5cbiAgICByZXR1cm4gaGVscGVyO1xuICB9XG4gIGxldCB3cmFwcGVyID0gZnVuY3Rpb24oLyogZHluYW1pYyBhcmd1bWVudHMgKi8pIHtcbiAgICBjb25zdCBvcHRpb25zID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiAgICBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdID0gdHJhbnNmb3JtT3B0aW9uc0ZuKG9wdGlvbnMpO1xuICAgIHJldHVybiBoZWxwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/logger.js":
/*!***************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/logger.js ***!
  \***************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;

var _utils = __webpack_require__(/*! ./utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      // eslint-disable-next-line no-console
      if (!console[method]) {
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports["default"] = logger;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2xvZ2dlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3FCQUF3QixTQUFTOztBQUVqQyxJQUFJLE1BQU0sR0FBRztBQUNYLFdBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztBQUM3QyxPQUFLLEVBQUUsTUFBTTs7O0FBR2IsYUFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRTtBQUMzQixRQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUM3QixVQUFJLFFBQVEsR0FBRyxlQUFRLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDOUQsVUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO0FBQ2pCLGFBQUssR0FBRyxRQUFRLENBQUM7T0FDbEIsTUFBTTtBQUNMLGFBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQzdCO0tBQ0Y7O0FBRUQsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsS0FBRyxFQUFFLGFBQVMsS0FBSyxFQUFjO0FBQy9CLFNBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVsQyxRQUNFLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFDOUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxFQUN6QztBQUNBLFVBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXJDLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDcEIsY0FBTSxHQUFHLEtBQUssQ0FBQztPQUNoQjs7d0NBWG1CLE9BQU87QUFBUCxlQUFPOzs7QUFZM0IsYUFBTyxDQUFDLE1BQU0sT0FBQyxDQUFmLE9BQU8sRUFBWSxPQUFPLENBQUMsQ0FBQztLQUM3QjtHQUNGO0NBQ0YsQ0FBQzs7cUJBRWEsTUFBTSIsImZpbGUiOiJsb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbmRleE9mIH0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBsb2dnZXIgPSB7XG4gIG1ldGhvZE1hcDogWydkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSxcbiAgbGV2ZWw6ICdpbmZvJyxcblxuICAvLyBNYXBzIGEgZ2l2ZW4gbGV2ZWwgdmFsdWUgdG8gdGhlIGBtZXRob2RNYXBgIGluZGV4ZXMgYWJvdmUuXG4gIGxvb2t1cExldmVsOiBmdW5jdGlvbihsZXZlbCkge1xuICAgIGlmICh0eXBlb2YgbGV2ZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICBsZXQgbGV2ZWxNYXAgPSBpbmRleE9mKGxvZ2dlci5tZXRob2RNYXAsIGxldmVsLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKGxldmVsTWFwID49IDApIHtcbiAgICAgICAgbGV2ZWwgPSBsZXZlbE1hcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldmVsID0gcGFyc2VJbnQobGV2ZWwsIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGV2ZWw7XG4gIH0sXG5cbiAgLy8gQ2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgLi4ubWVzc2FnZSkge1xuICAgIGxldmVsID0gbG9nZ2VyLmxvb2t1cExldmVsKGxldmVsKTtcblxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgbG9nZ2VyLmxvb2t1cExldmVsKGxvZ2dlci5sZXZlbCkgPD0gbGV2ZWxcbiAgICApIHtcbiAgICAgIGxldCBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAoIWNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBtZXRob2QgPSAnbG9nJztcbiAgICAgIH1cbiAgICAgIGNvbnNvbGVbbWV0aG9kXSguLi5tZXNzYWdlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBsb2dnZXI7XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/no-conflict.js":
/*!********************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/no-conflict.js ***!
  \********************************************************************/
/***/ ((module, exports) => {

"use strict";
/* global globalThis */


exports.__esModule = true;

exports["default"] = function (Handlebars) {
  /* istanbul ignore next */
  // https://mathiasbynens.be/notes/globalthis
  (function () {
    if (typeof globalThis === 'object') return;
    Object.prototype.__defineGetter__('__magic__', function () {
      return this;
    });
    __magic__.globalThis = __magic__; // eslint-disable-line no-undef
    delete Object.prototype.__magic__;
  })();

  var $Handlebars = globalThis.Handlebars;

  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (globalThis.Handlebars === Handlebars) {
      globalThis.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL25vLWNvbmZsaWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O3FCQUNlLFVBQVMsVUFBVSxFQUFFOzs7QUFHbEMsR0FBQyxZQUFXO0FBQ1YsUUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLEVBQUUsT0FBTztBQUMzQyxVQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxZQUFXO0FBQ3hELGFBQU8sSUFBSSxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0FBQ0gsYUFBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDakMsV0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztHQUNuQyxDQUFBLEVBQUcsQ0FBQzs7QUFFTCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDOzs7QUFHMUMsWUFBVSxDQUFDLFVBQVUsR0FBRyxZQUFXO0FBQ2pDLFFBQUksVUFBVSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7QUFDeEMsZ0JBQVUsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDO0tBQ3JDO0FBQ0QsV0FBTyxVQUFVLENBQUM7R0FDbkIsQ0FBQztDQUNIIiwiZmlsZSI6Im5vLWNvbmZsaWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIGdsb2JhbFRoaXMgKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgLy8gaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2dsb2JhbHRoaXNcbiAgKGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybjtcbiAgICBPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lR2V0dGVyX18oJ19fbWFnaWNfXycsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSk7XG4gICAgX19tYWdpY19fLmdsb2JhbFRoaXMgPSBfX21hZ2ljX187IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiAgICBkZWxldGUgT2JqZWN0LnByb3RvdHlwZS5fX21hZ2ljX187XG4gIH0pKCk7XG5cbiAgY29uc3QgJEhhbmRsZWJhcnMgPSBnbG9iYWxUaGlzLkhhbmRsZWJhcnM7XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgSGFuZGxlYmFycy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGdsb2JhbFRoaXMuSGFuZGxlYmFycyA9PT0gSGFuZGxlYmFycykge1xuICAgICAgZ2xvYmFsVGhpcy5IYW5kbGViYXJzID0gJEhhbmRsZWJhcnM7XG4gICAgfVxuICAgIHJldHVybiBIYW5kbGViYXJzO1xuICB9O1xufVxuIl19


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/runtime.js":
/*!****************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/runtime.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = __webpack_require__(/*! ./utils */ "./node_modules/handlebars/dist/cjs/handlebars/utils.js");

var Utils = _interopRequireWildcard(_utils);

var _exception = __webpack_require__(/*! ./exception */ "./node_modules/handlebars/dist/cjs/handlebars/exception.js");

var _exception2 = _interopRequireDefault(_exception);

var _base = __webpack_require__(/*! ./base */ "./node_modules/handlebars/dist/cjs/handlebars/base.js");

var _helpers = __webpack_require__(/*! ./helpers */ "./node_modules/handlebars/dist/cjs/handlebars/helpers.js");

var _internalWrapHelper = __webpack_require__(/*! ./internal/wrapHelper */ "./node_modules/handlebars/dist/cjs/handlebars/internal/wrapHelper.js");

var _internalProtoAccess = __webpack_require__(/*! ./internal/proto-access */ "./node_modules/handlebars/dist/cjs/handlebars/internal/proto-access.js");

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision >= _base.LAST_COMPATIBLE_COMPILER_REVISION && compilerRevision <= _base.COMPILER_REVISION) {
    return;
  }

  if (compilerRevision < _base.LAST_COMPATIBLE_COMPILER_REVISION) {
    var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
        compilerVersions = _base.REVISION_CHANGES[compilerRevision];
    throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
  } else {
    // Use the embedded version info since the runtime doesn't know about this revision yet
    throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as pseudo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  // backwards compatibility for precompiled templates with compiler-version 7 (<4.3.0)
  var templateWasPrecompiledWithCompilerV7 = templateSpec.compiler && templateSpec.compiler[0] === 7;

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }
    partial = env.VM.resolvePartial.call(this, partial, context, options);

    var extendedOptions = Utils.extend({}, options, {
      hooks: this.hooks,
      protoAccessControl: this.protoAccessControl
    });

    var result = env.VM.invokePartial.call(this, partial, context, extendedOptions);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, extendedOptions);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name, loc) {
      if (!obj || !(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj, {
          loc: loc
        });
      }
      return container.lookupProperty(obj, name);
    },
    lookupProperty: function lookupProperty(parent, propertyName) {
      var result = parent[propertyName];
      if (result == null) {
        return result;
      }
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return result;
      }

      if (_internalProtoAccess.resultIsAllowed(result, container.protoAccessControl, propertyName)) {
        return result;
      }
      return undefined;
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        var result = depths[i] && container.lookupProperty(depths[i], name);
        if (result != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    mergeIfNeeded: function mergeIfNeeded(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },
    // An empty object to use as replacement for null-contexts
    nullContext: Object.seal({}),

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }

    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }

  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      var mergedHelpers = Utils.extend({}, env.helpers, options.helpers);
      wrapHelpersToPassLookupProperty(mergedHelpers, container);
      container.helpers = mergedHelpers;

      if (templateSpec.usePartial) {
        // Use mergeIfNeeded here to prevent compiling global partials multiple times
        container.partials = container.mergeIfNeeded(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = Utils.extend({}, env.decorators, options.decorators);
      }

      container.hooks = {};
      container.protoAccessControl = _internalProtoAccess.createProtoAccessControl(options);

      var keepHelperInHelpers = options.allowCallsToHelperMissing || templateWasPrecompiledWithCompilerV7;
      _helpers.moveHelperToHooks(container, 'helperMissing', keepHelperInHelpers);
      _helpers.moveHelperToHooks(container, 'blockHelperMissing', keepHelperInHelpers);
    } else {
      container.protoAccessControl = options.protoAccessControl; // internal option
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
      container.hooks = options.hooks;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

/**
 * This is currently part of the official API, therefore implementation details should not be changed.
 */

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  // Use the current closure context to save the partial-block if this partial
  var currentPartialBlock = options.data && options.data['partial-block'];
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    (function () {
      options.data = _base.createFrame(options.data);
      // Wrapper function to get access to currentPartialBlock from the closure
      var fn = options.fn;
      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // Restore the partial-block from the closure for the execution of the block
        // i.e. the part inside the block of the partial call.
        options.data = _base.createFrame(options.data);
        options.data['partial-block'] = currentPartialBlock;
        return fn(context, options);
      };
      if (fn.partials) {
        options.partials = Utils.extend({}, options.partials, fn.partials);
      }
    })();
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}

function wrapHelpersToPassLookupProperty(mergedHelpers, container) {
  Object.keys(mergedHelpers).forEach(function (helperName) {
    var helper = mergedHelpers[helperName];
    mergedHelpers[helperName] = passLookupPropertyOption(helper, container);
  });
}

function passLookupPropertyOption(helper, container) {
  var lookupProperty = container.lookupProperty;
  return _internalWrapHelper.wrapHelper(helper, function (options) {
    return Utils.extend({ lookupProperty: lookupProperty }, options);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBQXVCLFNBQVM7O0lBQXBCLEtBQUs7O3lCQUNLLGFBQWE7Ozs7b0JBTTVCLFFBQVE7O3VCQUNtQixXQUFXOztrQ0FDbEIsdUJBQXVCOzttQ0FJM0MseUJBQXlCOztBQUV6QixTQUFTLGFBQWEsQ0FBQyxZQUFZLEVBQUU7QUFDMUMsTUFBTSxnQkFBZ0IsR0FBRyxBQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUssQ0FBQztNQUM3RCxlQUFlLDBCQUFvQixDQUFDOztBQUV0QyxNQUNFLGdCQUFnQiwyQ0FBcUMsSUFDckQsZ0JBQWdCLDJCQUFxQixFQUNyQztBQUNBLFdBQU87R0FDUjs7QUFFRCxNQUFJLGdCQUFnQiwwQ0FBb0MsRUFBRTtBQUN4RCxRQUFNLGVBQWUsR0FBRyx1QkFBaUIsZUFBZSxDQUFDO1FBQ3ZELGdCQUFnQixHQUFHLHVCQUFpQixnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hELFVBQU0sMkJBQ0oseUZBQXlGLEdBQ3ZGLHFEQUFxRCxHQUNyRCxlQUFlLEdBQ2YsbURBQW1ELEdBQ25ELGdCQUFnQixHQUNoQixJQUFJLENBQ1AsQ0FBQztHQUNILE1BQU07O0FBRUwsVUFBTSwyQkFDSix3RkFBd0YsR0FDdEYsaURBQWlELEdBQ2pELFlBQVksQ0FBQyxDQUFDLENBQUMsR0FDZixJQUFJLENBQ1AsQ0FBQztHQUNIO0NBQ0Y7O0FBRU0sU0FBUyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTs7QUFFMUMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNSLFVBQU0sMkJBQWMsbUNBQW1DLENBQUMsQ0FBQztHQUMxRDtBQUNELE1BQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQ3ZDLFVBQU0sMkJBQWMsMkJBQTJCLEdBQUcsT0FBTyxZQUFZLENBQUMsQ0FBQztHQUN4RTs7QUFFRCxjQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDOzs7O0FBSWxELEtBQUcsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7O0FBRzVDLE1BQU0sb0NBQW9DLEdBQ3hDLFlBQVksQ0FBQyxRQUFRLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTFELFdBQVMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDdkQsUUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQ2hCLGFBQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xELFVBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNmLGVBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO09BQ3ZCO0tBQ0Y7QUFDRCxXQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUV0RSxRQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUU7QUFDOUMsV0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO0FBQ2pCLHdCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7S0FDNUMsQ0FBQyxDQUFDOztBQUVILFFBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDcEMsSUFBSSxFQUNKLE9BQU8sRUFDUCxPQUFPLEVBQ1AsZUFBZSxDQUNoQixDQUFDOztBQUVGLFFBQUksTUFBTSxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFO0FBQ2pDLGFBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQzFDLE9BQU8sRUFDUCxZQUFZLENBQUMsZUFBZSxFQUM1QixHQUFHLENBQ0osQ0FBQztBQUNGLFlBQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7S0FDbkU7QUFDRCxRQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFDbEIsVUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ2xCLFlBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM1QyxjQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzVCLGtCQUFNO1dBQ1A7O0FBRUQsZUFBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO0FBQ0QsY0FBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDM0I7QUFDRCxhQUFPLE1BQU0sQ0FBQztLQUNmLE1BQU07QUFDTCxZQUFNLDJCQUNKLGNBQWMsR0FDWixPQUFPLENBQUMsSUFBSSxHQUNaLDBEQUEwRCxDQUM3RCxDQUFDO0tBQ0g7R0FDRjs7O0FBR0QsTUFBSSxTQUFTLEdBQUc7QUFDZCxVQUFNLEVBQUUsZ0JBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDL0IsVUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUksSUFBSSxHQUFHLENBQUEsQUFBQyxFQUFFO0FBQzFCLGNBQU0sMkJBQWMsR0FBRyxHQUFHLElBQUksR0FBRyxtQkFBbUIsR0FBRyxHQUFHLEVBQUU7QUFDMUQsYUFBRyxFQUFFLEdBQUc7U0FDVCxDQUFDLENBQUM7T0FDSjtBQUNELGFBQU8sU0FBUyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDNUM7QUFDRCxrQkFBYyxFQUFFLHdCQUFTLE1BQU0sRUFBRSxZQUFZLEVBQUU7QUFDN0MsVUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2xDLFVBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixlQUFPLE1BQU0sQ0FBQztPQUNmO0FBQ0QsVUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxFQUFFO0FBQzlELGVBQU8sTUFBTSxDQUFDO09BQ2Y7O0FBRUQsVUFBSSxxQ0FBZ0IsTUFBTSxFQUFFLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLENBQUMsRUFBRTtBQUN2RSxlQUFPLE1BQU0sQ0FBQztPQUNmO0FBQ0QsYUFBTyxTQUFTLENBQUM7S0FDbEI7QUFDRCxVQUFNLEVBQUUsZ0JBQVMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUM3QixVQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzFCLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUIsWUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BFLFlBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixpQkFBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7T0FDRjtLQUNGO0FBQ0QsVUFBTSxFQUFFLGdCQUFTLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDakMsYUFBTyxPQUFPLE9BQU8sS0FBSyxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUM7S0FDeEU7O0FBRUQsb0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtBQUN4QyxpQkFBYSxFQUFFLG9CQUFvQjs7QUFFbkMsTUFBRSxFQUFFLFlBQVMsQ0FBQyxFQUFFO0FBQ2QsVUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFNBQUcsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN2QyxhQUFPLEdBQUcsQ0FBQztLQUNaOztBQUVELFlBQVEsRUFBRSxFQUFFO0FBQ1osV0FBTyxFQUFFLGlCQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTtBQUNuRSxVQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztVQUNuQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixVQUFJLElBQUksSUFBSSxNQUFNLElBQUksV0FBVyxJQUFJLG1CQUFtQixFQUFFO0FBQ3hELHNCQUFjLEdBQUcsV0FBVyxDQUMxQixJQUFJLEVBQ0osQ0FBQyxFQUNELEVBQUUsRUFDRixJQUFJLEVBQ0osbUJBQW1CLEVBQ25CLFdBQVcsRUFDWCxNQUFNLENBQ1AsQ0FBQztPQUNILE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUMxQixzQkFBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FDOUQ7QUFDRCxhQUFPLGNBQWMsQ0FBQztLQUN2Qjs7QUFFRCxRQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQzNCLGFBQU8sS0FBSyxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQ3ZCLGFBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO09BQ3ZCO0FBQ0QsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELGlCQUFhLEVBQUUsdUJBQVMsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUNyQyxVQUFJLEdBQUcsR0FBRyxLQUFLLElBQUksTUFBTSxDQUFDOztBQUUxQixVQUFJLEtBQUssSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sRUFBRTtBQUN2QyxXQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ3ZDOztBQUVELGFBQU8sR0FBRyxDQUFDO0tBQ1o7O0FBRUQsZUFBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUU1QixRQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQ2pCLGdCQUFZLEVBQUUsWUFBWSxDQUFDLFFBQVE7R0FDcEMsQ0FBQzs7QUFFRixXQUFTLEdBQUcsQ0FBQyxPQUFPLEVBQWdCO1FBQWQsT0FBTyx5REFBRyxFQUFFOztBQUNoQyxRQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDOztBQUV4QixPQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDNUMsVUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDaEM7QUFDRCxRQUFJLE1BQU0sWUFBQTtRQUNSLFdBQVcsR0FBRyxZQUFZLENBQUMsY0FBYyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7QUFDN0QsUUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFO0FBQzFCLFVBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNsQixjQUFNLEdBQ0osT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQ3hCLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FDaEMsT0FBTyxDQUFDLE1BQU0sQ0FBQztPQUN0QixNQUFNO0FBQ0wsY0FBTSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDcEI7S0FDRjs7QUFFRCxhQUFTLElBQUksQ0FBQyxPQUFPLGdCQUFnQjtBQUNuQyxhQUNFLEVBQUUsR0FDRixZQUFZLENBQUMsSUFBSSxDQUNmLFNBQVMsRUFDVCxPQUFPLEVBQ1AsU0FBUyxDQUFDLE9BQU8sRUFDakIsU0FBUyxDQUFDLFFBQVEsRUFDbEIsSUFBSSxFQUNKLFdBQVcsRUFDWCxNQUFNLENBQ1AsQ0FDRDtLQUNIOztBQUVELFFBQUksR0FBRyxpQkFBaUIsQ0FDdEIsWUFBWSxDQUFDLElBQUksRUFDakIsSUFBSSxFQUNKLFNBQVMsRUFDVCxPQUFPLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFDcEIsSUFBSSxFQUNKLFdBQVcsQ0FDWixDQUFDO0FBQ0YsV0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQy9COztBQUVELEtBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUVqQixLQUFHLENBQUMsTUFBTSxHQUFHLFVBQVMsT0FBTyxFQUFFO0FBQzdCLFFBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3BCLFVBQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25FLHFDQUErQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMxRCxlQUFTLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQzs7QUFFbEMsVUFBSSxZQUFZLENBQUMsVUFBVSxFQUFFOztBQUUzQixpQkFBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUMxQyxPQUFPLENBQUMsUUFBUSxFQUNoQixHQUFHLENBQUMsUUFBUSxDQUNiLENBQUM7T0FDSDtBQUNELFVBQUksWUFBWSxDQUFDLFVBQVUsSUFBSSxZQUFZLENBQUMsYUFBYSxFQUFFO0FBQ3pELGlCQUFTLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQ2pDLEVBQUUsRUFDRixHQUFHLENBQUMsVUFBVSxFQUNkLE9BQU8sQ0FBQyxVQUFVLENBQ25CLENBQUM7T0FDSDs7QUFFRCxlQUFTLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNyQixlQUFTLENBQUMsa0JBQWtCLEdBQUcsOENBQXlCLE9BQU8sQ0FBQyxDQUFDOztBQUVqRSxVQUFJLG1CQUFtQixHQUNyQixPQUFPLENBQUMseUJBQXlCLElBQ2pDLG9DQUFvQyxDQUFDO0FBQ3ZDLGlDQUFrQixTQUFTLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDbkUsaUNBQWtCLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0tBQ3pFLE1BQU07QUFDTCxlQUFTLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDO0FBQzFELGVBQVMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUNwQyxlQUFTLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDdEMsZUFBUyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQzFDLGVBQVMsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztLQUNqQztHQUNGLENBQUM7O0FBRUYsS0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTtBQUNsRCxRQUFJLFlBQVksQ0FBQyxjQUFjLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDL0MsWUFBTSwyQkFBYyx3QkFBd0IsQ0FBQyxDQUFDO0tBQy9DO0FBQ0QsUUFBSSxZQUFZLENBQUMsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3JDLFlBQU0sMkJBQWMseUJBQXlCLENBQUMsQ0FBQztLQUNoRDs7QUFFRCxXQUFPLFdBQVcsQ0FDaEIsU0FBUyxFQUNULENBQUMsRUFDRCxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2YsSUFBSSxFQUNKLENBQUMsRUFDRCxXQUFXLEVBQ1gsTUFBTSxDQUNQLENBQUM7R0FDSCxDQUFDO0FBQ0YsU0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFTSxTQUFTLFdBQVcsQ0FDekIsU0FBUyxFQUNULENBQUMsRUFDRCxFQUFFLEVBQ0YsSUFBSSxFQUNKLG1CQUFtQixFQUNuQixXQUFXLEVBQ1gsTUFBTSxFQUNOO0FBQ0EsV0FBUyxJQUFJLENBQUMsT0FBTyxFQUFnQjtRQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDakMsUUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDO0FBQzNCLFFBQ0UsTUFBTSxJQUNOLE9BQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQ3BCLEVBQUUsT0FBTyxLQUFLLFNBQVMsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQSxBQUFDLEVBQzFEO0FBQ0EsbUJBQWEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQzs7QUFFRCxXQUFPLEVBQUUsQ0FDUCxTQUFTLEVBQ1QsT0FBTyxFQUNQLFNBQVMsQ0FBQyxPQUFPLEVBQ2pCLFNBQVMsQ0FBQyxRQUFRLEVBQ2xCLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUNwQixXQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUN4RCxhQUFhLENBQ2QsQ0FBQztHQUNIOztBQUVELE1BQUksR0FBRyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDOztBQUV6RSxNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixNQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QyxNQUFJLENBQUMsV0FBVyxHQUFHLG1CQUFtQixJQUFJLENBQUMsQ0FBQztBQUM1QyxTQUFPLElBQUksQ0FBQztDQUNiOzs7Ozs7QUFLTSxTQUFTLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN4RCxNQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osUUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLGdCQUFnQixFQUFFO0FBQ3JDLGFBQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3pDLE1BQU07QUFDTCxhQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUM7R0FDRixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTs7QUFFekMsV0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7QUFDdkIsV0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDckM7QUFDRCxTQUFPLE9BQU8sQ0FBQztDQUNoQjs7QUFFTSxTQUFTLGFBQWEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTs7QUFFdkQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUUsU0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQ2YsV0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztHQUN2RTs7QUFFRCxNQUFJLFlBQVksWUFBQSxDQUFDO0FBQ2pCLE1BQUksT0FBTyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksRUFBRTs7QUFDckMsYUFBTyxDQUFDLElBQUksR0FBRyxrQkFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXpDLFVBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDcEIsa0JBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLFNBQVMsbUJBQW1CLENBQ3pFLE9BQU8sRUFFUDtZQURBLE9BQU8seURBQUcsRUFBRTs7OztBQUlaLGVBQU8sQ0FBQyxJQUFJLEdBQUcsa0JBQVksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLGVBQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsbUJBQW1CLENBQUM7QUFDcEQsZUFBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQzdCLENBQUM7QUFDRixVQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7QUFDZixlQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3BFOztHQUNGOztBQUVELE1BQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxZQUFZLEVBQUU7QUFDekMsV0FBTyxHQUFHLFlBQVksQ0FBQztHQUN4Qjs7QUFFRCxNQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7QUFDekIsVUFBTSwyQkFBYyxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxDQUFDO0dBQzVFLE1BQU0sSUFBSSxPQUFPLFlBQVksUUFBUSxFQUFFO0FBQ3RDLFdBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztHQUNsQztDQUNGOztBQUVNLFNBQVMsSUFBSSxHQUFHO0FBQ3JCLFNBQU8sRUFBRSxDQUFDO0NBQ1g7O0FBRUQsU0FBUyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUMvQixNQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsTUFBTSxJQUFJLElBQUksQ0FBQSxBQUFDLEVBQUU7QUFDOUIsUUFBSSxHQUFHLElBQUksR0FBRyxrQkFBWSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDckMsUUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7R0FDckI7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7QUFDekUsTUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFO0FBQ2hCLFFBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNmLFFBQUksR0FBRyxFQUFFLENBQUMsU0FBUyxDQUNqQixJQUFJLEVBQ0osS0FBSyxFQUNMLFNBQVMsRUFDVCxNQUFNLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUNuQixJQUFJLEVBQ0osV0FBVyxFQUNYLE1BQU0sQ0FDUCxDQUFDO0FBQ0YsU0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDM0I7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsK0JBQStCLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRTtBQUNqRSxRQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUMvQyxRQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkMsaUJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDekUsQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFO0FBQ25ELE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFDaEQsU0FBTywrQkFBVyxNQUFNLEVBQUUsVUFBQSxPQUFPLEVBQUk7QUFDbkMsV0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsY0FBYyxFQUFkLGNBQWMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ2xELENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6InJ1bnRpbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi9leGNlcHRpb24nO1xuaW1wb3J0IHtcbiAgQ09NUElMRVJfUkVWSVNJT04sXG4gIGNyZWF0ZUZyYW1lLFxuICBMQVNUX0NPTVBBVElCTEVfQ09NUElMRVJfUkVWSVNJT04sXG4gIFJFVklTSU9OX0NIQU5HRVNcbn0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IG1vdmVIZWxwZXJUb0hvb2tzIH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7IHdyYXBIZWxwZXIgfSBmcm9tICcuL2ludGVybmFsL3dyYXBIZWxwZXInO1xuaW1wb3J0IHtcbiAgY3JlYXRlUHJvdG9BY2Nlc3NDb250cm9sLFxuICByZXN1bHRJc0FsbG93ZWRcbn0gZnJvbSAnLi9pbnRlcm5hbC9wcm90by1hY2Nlc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tSZXZpc2lvbihjb21waWxlckluZm8pIHtcbiAgY29uc3QgY29tcGlsZXJSZXZpc2lvbiA9IChjb21waWxlckluZm8gJiYgY29tcGlsZXJJbmZvWzBdKSB8fCAxLFxuICAgIGN1cnJlbnRSZXZpc2lvbiA9IENPTVBJTEVSX1JFVklTSU9OO1xuXG4gIGlmIChcbiAgICBjb21waWxlclJldmlzaW9uID49IExBU1RfQ09NUEFUSUJMRV9DT01QSUxFUl9SRVZJU0lPTiAmJlxuICAgIGNvbXBpbGVyUmV2aXNpb24gPD0gQ09NUElMRVJfUkVWSVNJT05cbiAgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBMQVNUX0NPTVBBVElCTEVfQ09NUElMRVJfUkVWSVNJT04pIHtcbiAgICBjb25zdCBydW50aW1lVmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICBjb21waWxlclZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFxuICAgICAgJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgK1xuICAgICAgICAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArXG4gICAgICAgIHJ1bnRpbWVWZXJzaW9ucyArXG4gICAgICAgICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArXG4gICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgK1xuICAgICAgICAnKS4nXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFxuICAgICAgJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArXG4gICAgICAgICdQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKCcgK1xuICAgICAgICBjb21waWxlckluZm9bMV0gK1xuICAgICAgICAnKS4nXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGUodGVtcGxhdGVTcGVjLCBlbnYpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKCFlbnYpIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdVbmtub3duIHRlbXBsYXRlIG9iamVjdDogJyArIHR5cGVvZiB0ZW1wbGF0ZVNwZWMpO1xuICB9XG5cbiAgdGVtcGxhdGVTcGVjLm1haW4uZGVjb3JhdG9yID0gdGVtcGxhdGVTcGVjLm1haW5fZDtcblxuICAvLyBOb3RlOiBVc2luZyBlbnYuVk0gcmVmZXJlbmNlcyByYXRoZXIgdGhhbiBsb2NhbCB2YXIgcmVmZXJlbmNlcyB0aHJvdWdob3V0IHRoaXMgc2VjdGlvbiB0byBhbGxvd1xuICAvLyBmb3IgZXh0ZXJuYWwgdXNlcnMgdG8gb3ZlcnJpZGUgdGhlc2UgYXMgcHNldWRvLXN1cHBvcnRlZCBBUElzLlxuICBlbnYuVk0uY2hlY2tSZXZpc2lvbih0ZW1wbGF0ZVNwZWMuY29tcGlsZXIpO1xuXG4gIC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGZvciBwcmVjb21waWxlZCB0ZW1wbGF0ZXMgd2l0aCBjb21waWxlci12ZXJzaW9uIDcgKDw0LjMuMClcbiAgY29uc3QgdGVtcGxhdGVXYXNQcmVjb21waWxlZFdpdGhDb21waWxlclY3ID1cbiAgICB0ZW1wbGF0ZVNwZWMuY29tcGlsZXIgJiYgdGVtcGxhdGVTcGVjLmNvbXBpbGVyWzBdID09PSA3O1xuXG4gIGZ1bmN0aW9uIGludm9rZVBhcnRpYWxXcmFwcGVyKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgICBjb250ZXh0ID0gVXRpbHMuZXh0ZW5kKHt9LCBjb250ZXh0LCBvcHRpb25zLmhhc2gpO1xuICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIG9wdGlvbnMuaWRzWzBdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgbGV0IGV4dGVuZGVkT3B0aW9ucyA9IFV0aWxzLmV4dGVuZCh7fSwgb3B0aW9ucywge1xuICAgICAgaG9va3M6IHRoaXMuaG9va3MsXG4gICAgICBwcm90b0FjY2Vzc0NvbnRyb2w6IHRoaXMucHJvdG9BY2Nlc3NDb250cm9sXG4gICAgfSk7XG5cbiAgICBsZXQgcmVzdWx0ID0gZW52LlZNLmludm9rZVBhcnRpYWwuY2FsbChcbiAgICAgIHRoaXMsXG4gICAgICBwYXJ0aWFsLFxuICAgICAgY29udGV4dCxcbiAgICAgIGV4dGVuZGVkT3B0aW9uc1xuICAgICk7XG5cbiAgICBpZiAocmVzdWx0ID09IG51bGwgJiYgZW52LmNvbXBpbGUpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXSA9IGVudi5jb21waWxlKFxuICAgICAgICBwYXJ0aWFsLFxuICAgICAgICB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLFxuICAgICAgICBlbnZcbiAgICAgICk7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0oY29udGV4dCwgZXh0ZW5kZWRPcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbmRlbnQpIHtcbiAgICAgICAgbGV0IGxpbmVzID0gcmVzdWx0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoIWxpbmVzW2ldICYmIGkgKyAxID09PSBsKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lc1tpXSA9IG9wdGlvbnMuaW5kZW50ICsgbGluZXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gbGluZXMuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFxuICAgICAgICAnVGhlIHBhcnRpYWwgJyArXG4gICAgICAgICAgb3B0aW9ucy5uYW1lICtcbiAgICAgICAgICAnIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGUnXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEp1c3QgYWRkIHdhdGVyXG4gIGxldCBjb250YWluZXIgPSB7XG4gICAgc3RyaWN0OiBmdW5jdGlvbihvYmosIG5hbWUsIGxvYykge1xuICAgICAgaWYgKCFvYmogfHwgIShuYW1lIGluIG9iaikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqLCB7XG4gICAgICAgICAgbG9jOiBsb2NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGFpbmVyLmxvb2t1cFByb3BlcnR5KG9iaiwgbmFtZSk7XG4gICAgfSxcbiAgICBsb29rdXBQcm9wZXJ0eTogZnVuY3Rpb24ocGFyZW50LCBwcm9wZXJ0eU5hbWUpIHtcbiAgICAgIGxldCByZXN1bHQgPSBwYXJlbnRbcHJvcGVydHlOYW1lXTtcbiAgICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwYXJlbnQsIHByb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlc3VsdElzQWxsb3dlZChyZXN1bHQsIGNvbnRhaW5lci5wcm90b0FjY2Vzc0NvbnRyb2wsIHByb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uKGRlcHRocywgbmFtZSkge1xuICAgICAgY29uc3QgbGVuID0gZGVwdGhzLmxlbmd0aDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGRlcHRoc1tpXSAmJiBjb250YWluZXIubG9va3VwUHJvcGVydHkoZGVwdGhzW2ldLCBuYW1lKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbihjdXJyZW50LCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGN1cnJlbnQgPT09ICdmdW5jdGlvbicgPyBjdXJyZW50LmNhbGwoY29udGV4dCkgOiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuXG4gICAgZm46IGZ1bmN0aW9uKGkpIHtcbiAgICAgIGxldCByZXQgPSB0ZW1wbGF0ZVNwZWNbaV07XG4gICAgICByZXQuZGVjb3JhdG9yID0gdGVtcGxhdGVTcGVjW2kgKyAnX2QnXTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcblxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICBsZXQgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICBmbiA9IHRoaXMuZm4oaSk7XG4gICAgICBpZiAoZGF0YSB8fCBkZXB0aHMgfHwgYmxvY2tQYXJhbXMgfHwgZGVjbGFyZWRCbG9ja1BhcmFtcykge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHdyYXBQcm9ncmFtKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgaSxcbiAgICAgICAgICBmbixcbiAgICAgICAgICBkYXRhLFxuICAgICAgICAgIGRlY2xhcmVkQmxvY2tQYXJhbXMsXG4gICAgICAgICAgYmxvY2tQYXJhbXMsXG4gICAgICAgICAgZGVwdGhzXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgfSxcblxuICAgIGRhdGE6IGZ1bmN0aW9uKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2VJZk5lZWRlZDogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgbGV0IG9iaiA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbiAmJiBwYXJhbSAhPT0gY29tbW9uKSB7XG4gICAgICAgIG9iaiA9IFV0aWxzLmV4dGVuZCh7fSwgY29tbW9uLCBwYXJhbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICAvLyBBbiBlbXB0eSBvYmplY3QgdG8gdXNlIGFzIHJlcGxhY2VtZW50IGZvciBudWxsLWNvbnRleHRzXG4gICAgbnVsbENvbnRleHQ6IE9iamVjdC5zZWFsKHt9KSxcblxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogdGVtcGxhdGVTcGVjLmNvbXBpbGVyXG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0KGNvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBkYXRhID0gb3B0aW9ucy5kYXRhO1xuXG4gICAgcmV0Ll9zZXR1cChvcHRpb25zKTtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCAmJiB0ZW1wbGF0ZVNwZWMudXNlRGF0YSkge1xuICAgICAgZGF0YSA9IGluaXREYXRhKGNvbnRleHQsIGRhdGEpO1xuICAgIH1cbiAgICBsZXQgZGVwdGhzLFxuICAgICAgYmxvY2tQYXJhbXMgPSB0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgPyBbXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocykge1xuICAgICAgaWYgKG9wdGlvbnMuZGVwdGhzKSB7XG4gICAgICAgIGRlcHRocyA9XG4gICAgICAgICAgY29udGV4dCAhPSBvcHRpb25zLmRlcHRoc1swXVxuICAgICAgICAgICAgPyBbY29udGV4dF0uY29uY2F0KG9wdGlvbnMuZGVwdGhzKVxuICAgICAgICAgICAgOiBvcHRpb25zLmRlcHRocztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlcHRocyA9IFtjb250ZXh0XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWluKGNvbnRleHQgLyosIG9wdGlvbnMqLykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgJycgK1xuICAgICAgICB0ZW1wbGF0ZVNwZWMubWFpbihcbiAgICAgICAgICBjb250YWluZXIsXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBjb250YWluZXIuaGVscGVycyxcbiAgICAgICAgICBjb250YWluZXIucGFydGlhbHMsXG4gICAgICAgICAgZGF0YSxcbiAgICAgICAgICBibG9ja1BhcmFtcyxcbiAgICAgICAgICBkZXB0aHNcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBtYWluID0gZXhlY3V0ZURlY29yYXRvcnMoXG4gICAgICB0ZW1wbGF0ZVNwZWMubWFpbixcbiAgICAgIG1haW4sXG4gICAgICBjb250YWluZXIsXG4gICAgICBvcHRpb25zLmRlcHRocyB8fCBbXSxcbiAgICAgIGRhdGEsXG4gICAgICBibG9ja1BhcmFtc1xuICAgICk7XG4gICAgcmV0dXJuIG1haW4oY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cblxuICByZXQuaXNUb3AgPSB0cnVlO1xuXG4gIHJldC5fc2V0dXAgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGxldCBtZXJnZWRIZWxwZXJzID0gVXRpbHMuZXh0ZW5kKHt9LCBlbnYuaGVscGVycywgb3B0aW9ucy5oZWxwZXJzKTtcbiAgICAgIHdyYXBIZWxwZXJzVG9QYXNzTG9va3VwUHJvcGVydHkobWVyZ2VkSGVscGVycywgY29udGFpbmVyKTtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gbWVyZ2VkSGVscGVycztcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIC8vIFVzZSBtZXJnZUlmTmVlZGVkIGhlcmUgdG8gcHJldmVudCBjb21waWxpbmcgZ2xvYmFsIHBhcnRpYWxzIG11bHRpcGxlIHRpbWVzXG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZUlmTmVlZGVkKFxuICAgICAgICAgIG9wdGlvbnMucGFydGlhbHMsXG4gICAgICAgICAgZW52LnBhcnRpYWxzXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAodGVtcGxhdGVTcGVjLnVzZVBhcnRpYWwgfHwgdGVtcGxhdGVTcGVjLnVzZURlY29yYXRvcnMpIHtcbiAgICAgICAgY29udGFpbmVyLmRlY29yYXRvcnMgPSBVdGlscy5leHRlbmQoXG4gICAgICAgICAge30sXG4gICAgICAgICAgZW52LmRlY29yYXRvcnMsXG4gICAgICAgICAgb3B0aW9ucy5kZWNvcmF0b3JzXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRhaW5lci5ob29rcyA9IHt9O1xuICAgICAgY29udGFpbmVyLnByb3RvQWNjZXNzQ29udHJvbCA9IGNyZWF0ZVByb3RvQWNjZXNzQ29udHJvbChvcHRpb25zKTtcblxuICAgICAgbGV0IGtlZXBIZWxwZXJJbkhlbHBlcnMgPVxuICAgICAgICBvcHRpb25zLmFsbG93Q2FsbHNUb0hlbHBlck1pc3NpbmcgfHxcbiAgICAgICAgdGVtcGxhdGVXYXNQcmVjb21waWxlZFdpdGhDb21waWxlclY3O1xuICAgICAgbW92ZUhlbHBlclRvSG9va3MoY29udGFpbmVyLCAnaGVscGVyTWlzc2luZycsIGtlZXBIZWxwZXJJbkhlbHBlcnMpO1xuICAgICAgbW92ZUhlbHBlclRvSG9va3MoY29udGFpbmVyLCAnYmxvY2tIZWxwZXJNaXNzaW5nJywga2VlcEhlbHBlckluSGVscGVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5wcm90b0FjY2Vzc0NvbnRyb2wgPSBvcHRpb25zLnByb3RvQWNjZXNzQ29udHJvbDsgLy8gaW50ZXJuYWwgb3B0aW9uXG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgICBjb250YWluZXIuZGVjb3JhdG9ycyA9IG9wdGlvbnMuZGVjb3JhdG9ycztcbiAgICAgIGNvbnRhaW5lci5ob29rcyA9IG9wdGlvbnMuaG9va3M7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbihpLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyAmJiAhYmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ211c3QgcGFzcyBibG9jayBwYXJhbXMnKTtcbiAgICB9XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMgJiYgIWRlcHRocykge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oXG4gICAgICBjb250YWluZXIsXG4gICAgICBpLFxuICAgICAgdGVtcGxhdGVTcGVjW2ldLFxuICAgICAgZGF0YSxcbiAgICAgIDAsXG4gICAgICBibG9ja1BhcmFtcyxcbiAgICAgIGRlcHRoc1xuICAgICk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUHJvZ3JhbShcbiAgY29udGFpbmVyLFxuICBpLFxuICBmbixcbiAgZGF0YSxcbiAgZGVjbGFyZWRCbG9ja1BhcmFtcyxcbiAgYmxvY2tQYXJhbXMsXG4gIGRlcHRoc1xuKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGN1cnJlbnREZXB0aHMgPSBkZXB0aHM7XG4gICAgaWYgKFxuICAgICAgZGVwdGhzICYmXG4gICAgICBjb250ZXh0ICE9IGRlcHRoc1swXSAmJlxuICAgICAgIShjb250ZXh0ID09PSBjb250YWluZXIubnVsbENvbnRleHQgJiYgZGVwdGhzWzBdID09PSBudWxsKVxuICAgICkge1xuICAgICAgY3VycmVudERlcHRocyA9IFtjb250ZXh0XS5jb25jYXQoZGVwdGhzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm4oXG4gICAgICBjb250YWluZXIsXG4gICAgICBjb250ZXh0LFxuICAgICAgY29udGFpbmVyLmhlbHBlcnMsXG4gICAgICBjb250YWluZXIucGFydGlhbHMsXG4gICAgICBvcHRpb25zLmRhdGEgfHwgZGF0YSxcbiAgICAgIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLFxuICAgICAgY3VycmVudERlcHRoc1xuICAgICk7XG4gIH1cblxuICBwcm9nID0gZXhlY3V0ZURlY29yYXRvcnMoZm4sIHByb2csIGNvbnRhaW5lciwgZGVwdGhzLCBkYXRhLCBibG9ja1BhcmFtcyk7XG5cbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IGRlcHRocyA/IGRlcHRocy5sZW5ndGggOiAwO1xuICBwcm9nLmJsb2NrUGFyYW1zID0gZGVjbGFyZWRCbG9ja1BhcmFtcyB8fCAwO1xuICByZXR1cm4gcHJvZztcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGN1cnJlbnRseSBwYXJ0IG9mIHRoZSBvZmZpY2lhbCBBUEksIHRoZXJlZm9yZSBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzIHNob3VsZCBub3QgYmUgY2hhbmdlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgaWYgKCFwYXJ0aWFsKSB7XG4gICAgaWYgKG9wdGlvbnMubmFtZSA9PT0gJ0BwYXJ0aWFsLWJsb2NrJykge1xuICAgICAgcGFydGlhbCA9IG9wdGlvbnMuZGF0YVsncGFydGlhbC1ibG9jayddO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdO1xuICAgIH1cbiAgfSBlbHNlIGlmICghcGFydGlhbC5jYWxsICYmICFvcHRpb25zLm5hbWUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwYXJ0aWFsIHRoYXQgcmV0dXJuZWQgYSBzdHJpbmdcbiAgICBvcHRpb25zLm5hbWUgPSBwYXJ0aWFsO1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW3BhcnRpYWxdO1xuICB9XG4gIHJldHVybiBwYXJ0aWFsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIC8vIFVzZSB0aGUgY3VycmVudCBjbG9zdXJlIGNvbnRleHQgdG8gc2F2ZSB0aGUgcGFydGlhbC1ibG9jayBpZiB0aGlzIHBhcnRpYWxcbiAgY29uc3QgY3VycmVudFBhcnRpYWxCbG9jayA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGFbJ3BhcnRpYWwtYmxvY2snXTtcbiAgb3B0aW9ucy5wYXJ0aWFsID0gdHJ1ZTtcbiAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgb3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoID0gb3B0aW9ucy5pZHNbMF0gfHwgb3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoO1xuICB9XG5cbiAgbGV0IHBhcnRpYWxCbG9jaztcbiAgaWYgKG9wdGlvbnMuZm4gJiYgb3B0aW9ucy5mbiAhPT0gbm9vcCkge1xuICAgIG9wdGlvbnMuZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgLy8gV3JhcHBlciBmdW5jdGlvbiB0byBnZXQgYWNjZXNzIHRvIGN1cnJlbnRQYXJ0aWFsQmxvY2sgZnJvbSB0aGUgY2xvc3VyZVxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm47XG4gICAgcGFydGlhbEJsb2NrID0gb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ10gPSBmdW5jdGlvbiBwYXJ0aWFsQmxvY2tXcmFwcGVyKFxuICAgICAgY29udGV4dCxcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgICkge1xuICAgICAgLy8gUmVzdG9yZSB0aGUgcGFydGlhbC1ibG9jayBmcm9tIHRoZSBjbG9zdXJlIGZvciB0aGUgZXhlY3V0aW9uIG9mIHRoZSBibG9ja1xuICAgICAgLy8gaS5lLiB0aGUgcGFydCBpbnNpZGUgdGhlIGJsb2NrIG9mIHRoZSBwYXJ0aWFsIGNhbGwuXG4gICAgICBvcHRpb25zLmRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ10gPSBjdXJyZW50UGFydGlhbEJsb2NrO1xuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH07XG4gICAgaWYgKGZuLnBhcnRpYWxzKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzID0gVXRpbHMuZXh0ZW5kKHt9LCBvcHRpb25zLnBhcnRpYWxzLCBmbi5wYXJ0aWFscyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCAmJiBwYXJ0aWFsQmxvY2spIHtcbiAgICBwYXJ0aWFsID0gcGFydGlhbEJsb2NrO1xuICB9XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICB9IGVsc2UgaWYgKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub29wKCkge1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhKGNvbnRleHQsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICEoJ3Jvb3QnIGluIGRhdGEpKSB7XG4gICAgZGF0YSA9IGRhdGEgPyBjcmVhdGVGcmFtZShkYXRhKSA6IHt9O1xuICAgIGRhdGEucm9vdCA9IGNvbnRleHQ7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIGV4ZWN1dGVEZWNvcmF0b3JzKGZuLCBwcm9nLCBjb250YWluZXIsIGRlcHRocywgZGF0YSwgYmxvY2tQYXJhbXMpIHtcbiAgaWYgKGZuLmRlY29yYXRvcikge1xuICAgIGxldCBwcm9wcyA9IHt9O1xuICAgIHByb2cgPSBmbi5kZWNvcmF0b3IoXG4gICAgICBwcm9nLFxuICAgICAgcHJvcHMsXG4gICAgICBjb250YWluZXIsXG4gICAgICBkZXB0aHMgJiYgZGVwdGhzWzBdLFxuICAgICAgZGF0YSxcbiAgICAgIGJsb2NrUGFyYW1zLFxuICAgICAgZGVwdGhzXG4gICAgKTtcbiAgICBVdGlscy5leHRlbmQocHJvZywgcHJvcHMpO1xuICB9XG4gIHJldHVybiBwcm9nO1xufVxuXG5mdW5jdGlvbiB3cmFwSGVscGVyc1RvUGFzc0xvb2t1cFByb3BlcnR5KG1lcmdlZEhlbHBlcnMsIGNvbnRhaW5lcikge1xuICBPYmplY3Qua2V5cyhtZXJnZWRIZWxwZXJzKS5mb3JFYWNoKGhlbHBlck5hbWUgPT4ge1xuICAgIGxldCBoZWxwZXIgPSBtZXJnZWRIZWxwZXJzW2hlbHBlck5hbWVdO1xuICAgIG1lcmdlZEhlbHBlcnNbaGVscGVyTmFtZV0gPSBwYXNzTG9va3VwUHJvcGVydHlPcHRpb24oaGVscGVyLCBjb250YWluZXIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcGFzc0xvb2t1cFByb3BlcnR5T3B0aW9uKGhlbHBlciwgY29udGFpbmVyKSB7XG4gIGNvbnN0IGxvb2t1cFByb3BlcnR5ID0gY29udGFpbmVyLmxvb2t1cFByb3BlcnR5O1xuICByZXR1cm4gd3JhcEhlbHBlcihoZWxwZXIsIG9wdGlvbnMgPT4ge1xuICAgIHJldHVybiBVdGlscy5leHRlbmQoeyBsb29rdXBQcm9wZXJ0eSB9LCBvcHRpb25zKTtcbiAgfSk7XG59XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/safe-string.js":
/*!********************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/safe-string.js ***!
  \********************************************************************/
/***/ ((module, exports) => {

"use strict";
// Build out our basic SafeString type


exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports["default"] = SafeString;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUU7QUFDMUIsTUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Q0FDdEI7O0FBRUQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUN2RSxTQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0NBQ3pCLENBQUM7O3FCQUVhLFVBQVUiLCJmaWxlIjoic2FmZS1zdHJpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnJyArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2FmZVN0cmluZztcbiJdfQ==


/***/ }),

/***/ "./node_modules/handlebars/dist/cjs/handlebars/utils.js":
/*!**************************************************************!*\
  !*** ./node_modules/handlebars/dist/cjs/handlebars/utils.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNLE1BQU0sR0FBRztBQUNiLEtBQUcsRUFBRSxPQUFPO0FBQ1osS0FBRyxFQUFFLE1BQU07QUFDWCxLQUFHLEVBQUUsTUFBTTtBQUNYLEtBQUcsRUFBRSxRQUFRO0FBQ2IsS0FBRyxFQUFFLFFBQVE7QUFDYixLQUFHLEVBQUUsUUFBUTtBQUNiLEtBQUcsRUFBRSxRQUFRO0NBQ2QsQ0FBQzs7QUFFRixJQUFNLFFBQVEsR0FBRyxZQUFZO0lBQzNCLFFBQVEsR0FBRyxXQUFXLENBQUM7O0FBRXpCLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRTtBQUN2QixTQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQjs7QUFFTSxTQUFTLE1BQU0sQ0FBQyxHQUFHLG9CQUFvQjtBQUM1QyxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxTQUFLLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM1QixVQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7QUFDM0QsV0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUM5QjtLQUNGO0dBQ0Y7O0FBRUQsU0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFTSxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzs7Ozs7O0FBS2hELElBQUksVUFBVSxHQUFHLG9CQUFTLEtBQUssRUFBRTtBQUMvQixTQUFPLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztDQUNwQyxDQUFDOzs7QUFHRixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNuQixVQU9PLFVBQVUsR0FQakIsVUFBVSxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQzNCLFdBQ0UsT0FBTyxLQUFLLEtBQUssVUFBVSxJQUMzQixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLG1CQUFtQixDQUM1QztHQUNILENBQUM7Q0FDSDtRQUNRLFVBQVUsR0FBVixVQUFVOzs7OztBQUlaLElBQU0sT0FBTyxHQUNsQixLQUFLLENBQUMsT0FBTyxJQUNiLFVBQVMsS0FBSyxFQUFFO0FBQ2QsU0FBTyxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxHQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGdCQUFnQixHQUN6QyxLQUFLLENBQUM7Q0FDWCxDQUFDOzs7OztBQUdHLFNBQVMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDcEMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoRCxRQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7QUFDdEIsYUFBTyxDQUFDLENBQUM7S0FDVjtHQUNGO0FBQ0QsU0FBTyxDQUFDLENBQUMsQ0FBQztDQUNYOztBQUVNLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0FBQ3ZDLE1BQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFOztBQUU5QixRQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQzNCLGFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3hCLE1BQU0sSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ3pCLGFBQU8sRUFBRSxDQUFDO0tBQ1gsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2xCLGFBQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQztLQUNwQjs7Ozs7QUFLRCxVQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQztHQUN0Qjs7QUFFRCxNQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMxQixXQUFPLE1BQU0sQ0FBQztHQUNmO0FBQ0QsU0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztDQUM3Qzs7QUFFTSxTQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDN0IsTUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFDO0dBQ2IsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMvQyxXQUFPLElBQUksQ0FBQztHQUNiLE1BQU07QUFDTCxXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0Y7O0FBRU0sU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQ2xDLE1BQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0IsT0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdkIsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFTSxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0FBQ3ZDLFFBQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRU0sU0FBUyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFO0FBQ2pELFNBQU8sQ0FBQyxXQUFXLEdBQUcsV0FBVyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUEsR0FBSSxFQUFFLENBQUM7Q0FDcEQiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnLFxuICAnPSc6ICcmI3gzRDsnXG59O1xuXG5jb25zdCBiYWRDaGFycyA9IC9bJjw+XCInYD1dL2csXG4gIHBvc3NpYmxlID0gL1smPD5cIidgPV0vO1xuXG5mdW5jdGlvbiBlc2NhcGVDaGFyKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQob2JqIC8qICwgLi4uc291cmNlICovKSB7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmd1bWVudHNbaV0sIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5leHBvcnQgbGV0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyogZXNsaW50LWRpc2FibGUgZnVuYy1zdHlsZSAqL1xubGV0IGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSdcbiAgICApO1xuICB9O1xufVxuZXhwb3J0IHsgaXNGdW5jdGlvbiB9O1xuLyogZXNsaW50LWVuYWJsZSBmdW5jLXN0eWxlICovXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5leHBvcnQgY29uc3QgaXNBcnJheSA9XG4gIEFycmF5LmlzQXJyYXkgfHxcbiAgZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0J1xuICAgICAgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuLy8gT2xkZXIgSUUgdmVyc2lvbnMgZG8gbm90IGRpcmVjdGx5IHN1cHBvcnQgaW5kZXhPZiBzbyB3ZSBtdXN0IGltcGxlbWVudCBvdXIgb3duLCBzYWRseS5cbmV4cG9ydCBmdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRnJhbWUob2JqZWN0KSB7XG4gIGxldCBmcmFtZSA9IGV4dGVuZCh7fSwgb2JqZWN0KTtcbiAgZnJhbWUuX3BhcmVudCA9IG9iamVjdDtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tQYXJhbXMocGFyYW1zLCBpZHMpIHtcbiAgcGFyYW1zLnBhdGggPSBpZHM7XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59XG4iXX0=


/***/ }),

/***/ "./node_modules/handlebars/runtime.js":
/*!********************************************!*\
  !*** ./node_modules/handlebars/runtime.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = __webpack_require__(/*! ./dist/cjs/handlebars.runtime */ "./node_modules/handlebars/dist/cjs/handlebars.runtime.js")["default"];


/***/ }),

/***/ "./node_modules/jquery.transit/jquery.transit.js":
/*!*******************************************************!*\
  !*** ./node_modules/jquery.transit/jquery.transit.js ***!
  \*******************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2014 Rico Sta. Cruz
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */

/* jshint expr: true */

;(function (root, factory) {

  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! jquery */ "jquery")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}

}(this, function($) {

  $.transit = {
    version: "0.9.12",

    // Map of $.css() keys to values for 'transitionProperty'.
    // See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
    propertyMap: {
      marginLeft    : 'margin',
      marginRight   : 'margin',
      marginBottom  : 'margin',
      marginTop     : 'margin',
      paddingLeft   : 'padding',
      paddingRight  : 'padding',
      paddingBottom : 'padding',
      paddingTop    : 'padding'
    },

    // Will simply transition "instantly" if false
    enabled: true,

    // Set this to false if you don't want to use the transition end property.
    useTransitionEnd: false
  };

  var div = document.createElement('div');
  var support = {};

  // Helper function to get the proper vendor property name.
  // (`transition` => `WebkitTransition`)
  function getVendorPropertyName(prop) {
    // Handle unprefixed versions (FF16+, for example)
    if (prop in div.style) return prop;

    var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
    var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

    for (var i=0; i<prefixes.length; ++i) {
      var vendorProp = prefixes[i] + prop_;
      if (vendorProp in div.style) { return vendorProp; }
    }
  }

  // Helper function to check if transform3D is supported.
  // Should return true for Webkits and Firefox 10+.
  function checkTransform3dSupport() {
    div.style[support.transform] = '';
    div.style[support.transform] = 'rotateY(90deg)';
    return div.style[support.transform] !== '';
  }

  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

  // Check for the browser's transitions support.
  support.transition      = getVendorPropertyName('transition');
  support.transitionDelay = getVendorPropertyName('transitionDelay');
  support.transform       = getVendorPropertyName('transform');
  support.transformOrigin = getVendorPropertyName('transformOrigin');
  support.filter          = getVendorPropertyName('Filter');
  support.transform3d     = checkTransform3dSupport();

  var eventNames = {
    'transition':       'transitionend',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  // Detect the 'transitionend' event needed.
  var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

  // Populate jQuery's `$.support` with the vendor prefixes we know.
  // As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
  // we set $.support.transition to a string of the actual property name used.
  for (var key in support) {
    if (support.hasOwnProperty(key) && typeof $.support[key] === 'undefined') {
      $.support[key] = support[key];
    }
  }

  // Avoid memory leak in IE.
  div = null;

  // ## $.cssEase
  // List of easing aliases that you can use with `$.fn.transition`.
  $.cssEase = {
    '_default':       'ease',
    'in':             'ease-in',
    'out':            'ease-out',
    'in-out':         'ease-in-out',
    'snap':           'cubic-bezier(0,1,.5,1)',
    // Penner equations
    'easeInCubic':    'cubic-bezier(.550,.055,.675,.190)',
    'easeOutCubic':   'cubic-bezier(.215,.61,.355,1)',
    'easeInOutCubic': 'cubic-bezier(.645,.045,.355,1)',
    'easeInCirc':     'cubic-bezier(.6,.04,.98,.335)',
    'easeOutCirc':    'cubic-bezier(.075,.82,.165,1)',
    'easeInOutCirc':  'cubic-bezier(.785,.135,.15,.86)',
    'easeInExpo':     'cubic-bezier(.95,.05,.795,.035)',
    'easeOutExpo':    'cubic-bezier(.19,1,.22,1)',
    'easeInOutExpo':  'cubic-bezier(1,0,0,1)',
    'easeInQuad':     'cubic-bezier(.55,.085,.68,.53)',
    'easeOutQuad':    'cubic-bezier(.25,.46,.45,.94)',
    'easeInOutQuad':  'cubic-bezier(.455,.03,.515,.955)',
    'easeInQuart':    'cubic-bezier(.895,.03,.685,.22)',
    'easeOutQuart':   'cubic-bezier(.165,.84,.44,1)',
    'easeInOutQuart': 'cubic-bezier(.77,0,.175,1)',
    'easeInQuint':    'cubic-bezier(.755,.05,.855,.06)',
    'easeOutQuint':   'cubic-bezier(.23,1,.32,1)',
    'easeInOutQuint': 'cubic-bezier(.86,0,.07,1)',
    'easeInSine':     'cubic-bezier(.47,0,.745,.715)',
    'easeOutSine':    'cubic-bezier(.39,.575,.565,1)',
    'easeInOutSine':  'cubic-bezier(.445,.05,.55,.95)',
    'easeInBack':     'cubic-bezier(.6,-.28,.735,.045)',
    'easeOutBack':    'cubic-bezier(.175, .885,.32,1.275)',
    'easeInOutBack':  'cubic-bezier(.68,-.55,.265,1.55)'
  };

  // ## 'transform' CSS hook
  // Allows you to use the `transform` property in CSS.
  //
  //     $("#hello").css({ transform: "rotate(90deg)" });
  //
  //     $("#hello").css('transform');
  //     //=> { rotate: '90deg' }
  //
  $.cssHooks['transit:transform'] = {
    // The getter returns a `Transform` object.
    get: function(elem) {
      return $(elem).data('transform') || new Transform();
    },

    // The setter accepts a `Transform` object or a string.
    set: function(elem, v) {
      var value = v;

      if (!(value instanceof Transform)) {
        value = new Transform(value);
      }

      // We've seen the 3D version of Scale() not work in Chrome when the
      // element being scaled extends outside of the viewport.  Thus, we're
      // forcing Chrome to not use the 3d transforms as well.  Not sure if
      // translate is affectede, but not risking it.  Detection code from
      // http://davidwalsh.name/detecting-google-chrome-javascript
      if (support.transform === 'WebkitTransform' && !isChrome) {
        elem.style[support.transform] = value.toString(true);
      } else {
        elem.style[support.transform] = value.toString();
      }

      $(elem).data('transform', value);
    }
  };

  // Add a CSS hook for `.css({ transform: '...' })`.
  // In jQuery 1.8+, this will intentionally override the default `transform`
  // CSS hook so it'll play well with Transit. (see issue #62)
  $.cssHooks.transform = {
    set: $.cssHooks['transit:transform'].set
  };

  // ## 'filter' CSS hook
  // Allows you to use the `filter` property in CSS.
  //
  //     $("#hello").css({ filter: 'blur(10px)' });
  //
  $.cssHooks.filter = {
    get: function(elem) {
      return elem.style[support.filter];
    },
    set: function(elem, value) {
      elem.style[support.filter] = value;
    }
  };

  // jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
  // be necessary.
  if ($.fn.jquery < "1.8") {
    // ## 'transformOrigin' CSS hook
    // Allows the use for `transformOrigin` to define where scaling and rotation
    // is pivoted.
    //
    //     $("#hello").css({ transformOrigin: '0 0' });
    //
    $.cssHooks.transformOrigin = {
      get: function(elem) {
        return elem.style[support.transformOrigin];
      },
      set: function(elem, value) {
        elem.style[support.transformOrigin] = value;
      }
    };

    // ## 'transition' CSS hook
    // Allows you to use the `transition` property in CSS.
    //
    //     $("#hello").css({ transition: 'all 0 ease 0' });
    //
    $.cssHooks.transition = {
      get: function(elem) {
        return elem.style[support.transition];
      },
      set: function(elem, value) {
        elem.style[support.transition] = value;
      }
    };
  }

  // ## Other CSS hooks
  // Allows you to rotate, scale and translate.
  registerCssHook('scale');
  registerCssHook('scaleX');
  registerCssHook('scaleY');
  registerCssHook('translate');
  registerCssHook('rotate');
  registerCssHook('rotateX');
  registerCssHook('rotateY');
  registerCssHook('rotate3d');
  registerCssHook('perspective');
  registerCssHook('skewX');
  registerCssHook('skewY');
  registerCssHook('x', true);
  registerCssHook('y', true);

  // ## Transform class
  // This is the main class of a transformation property that powers
  // `$.fn.css({ transform: '...' })`.
  //
  // This is, in essence, a dictionary object with key/values as `-transform`
  // properties.
  //
  //     var t = new Transform("rotate(90) scale(4)");
  //
  //     t.rotate             //=> "90deg"
  //     t.scale              //=> "4,4"
  //
  // Setters are accounted for.
  //
  //     t.set('rotate', 4)
  //     t.rotate             //=> "4deg"
  //
  // Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
  // functions.
  //
  //     t.toString()         //=> "rotate(90deg) scale(4,4)"
  //     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
  //
  function Transform(str) {
    if (typeof str === 'string') { this.parse(str); }
    return this;
  }

  Transform.prototype = {
    // ### setFromString()
    // Sets a property from a string.
    //
    //     t.setFromString('scale', '2,4');
    //     // Same as set('scale', '2', '4');
    //
    setFromString: function(prop, val) {
      var args =
        (typeof val === 'string')  ? val.split(',') :
        (val.constructor === Array) ? val :
        [ val ];

      args.unshift(prop);

      Transform.prototype.set.apply(this, args);
    },

    // ### set()
    // Sets a property.
    //
    //     t.set('scale', 2, 4);
    //
    set: function(prop) {
      var args = Array.prototype.slice.apply(arguments, [1]);
      if (this.setter[prop]) {
        this.setter[prop].apply(this, args);
      } else {
        this[prop] = args.join(',');
      }
    },

    get: function(prop) {
      if (this.getter[prop]) {
        return this.getter[prop].apply(this);
      } else {
        return this[prop] || 0;
      }
    },

    setter: {
      // ### rotate
      //
      //     .css({ rotate: 30 })
      //     .css({ rotate: "30" })
      //     .css({ rotate: "30deg" })
      //     .css({ rotate: "30deg" })
      //
      rotate: function(theta) {
        this.rotate = unit(theta, 'deg');
      },

      rotateX: function(theta) {
        this.rotateX = unit(theta, 'deg');
      },

      rotateY: function(theta) {
        this.rotateY = unit(theta, 'deg');
      },

      // ### scale
      //
      //     .css({ scale: 9 })      //=> "scale(9,9)"
      //     .css({ scale: '3,2' })  //=> "scale(3,2)"
      //
      scale: function(x, y) {
        if (y === undefined) { y = x; }
        this.scale = x + "," + y;
      },

      // ### skewX + skewY
      skewX: function(x) {
        this.skewX = unit(x, 'deg');
      },

      skewY: function(y) {
        this.skewY = unit(y, 'deg');
      },

      // ### perspectvie
      perspective: function(dist) {
        this.perspective = unit(dist, 'px');
      },

      // ### x / y
      // Translations. Notice how this keeps the other value.
      //
      //     .css({ x: 4 })       //=> "translate(4px, 0)"
      //     .css({ y: 10 })      //=> "translate(4px, 10px)"
      //
      x: function(x) {
        this.set('translate', x, null);
      },

      y: function(y) {
        this.set('translate', null, y);
      },

      // ### translate
      // Notice how this keeps the other value.
      //
      //     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
      //
      translate: function(x, y) {
        if (this._translateX === undefined) { this._translateX = 0; }
        if (this._translateY === undefined) { this._translateY = 0; }

        if (x !== null && x !== undefined) { this._translateX = unit(x, 'px'); }
        if (y !== null && y !== undefined) { this._translateY = unit(y, 'px'); }

        this.translate = this._translateX + "," + this._translateY;
      }
    },

    getter: {
      x: function() {
        return this._translateX || 0;
      },

      y: function() {
        return this._translateY || 0;
      },

      scale: function() {
        var s = (this.scale || "1,1").split(',');
        if (s[0]) { s[0] = parseFloat(s[0]); }
        if (s[1]) { s[1] = parseFloat(s[1]); }

        // "2.5,2.5" => 2.5
        // "2.5,1" => [2.5,1]
        return (s[0] === s[1]) ? s[0] : s;
      },

      rotate3d: function() {
        var s = (this.rotate3d || "0,0,0,0deg").split(',');
        for (var i=0; i<=3; ++i) {
          if (s[i]) { s[i] = parseFloat(s[i]); }
        }
        if (s[3]) { s[3] = unit(s[3], 'deg'); }

        return s;
      }
    },

    // ### parse()
    // Parses from a string. Called on constructor.
    parse: function(str) {
      var self = this;
      str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
        self.setFromString(prop, val);
      });
    },

    // ### toString()
    // Converts to a `transition` CSS property string. If `use3d` is given,
    // it converts to a `-webkit-transition` CSS property string instead.
    toString: function(use3d) {
      var re = [];

      for (var i in this) {
        if (this.hasOwnProperty(i)) {
          // Don't use 3D transformations if the browser can't support it.
          if ((!support.transform3d) && (
            (i === 'rotateX') ||
            (i === 'rotateY') ||
            (i === 'perspective') ||
            (i === 'transformOrigin'))) { continue; }

          if (i[0] !== '_') {
            if (use3d && (i === 'scale')) {
              re.push(i + "3d(" + this[i] + ",1)");
            } else if (use3d && (i === 'translate')) {
              re.push(i + "3d(" + this[i] + ",0)");
            } else {
              re.push(i + "(" + this[i] + ")");
            }
          }
        }
      }

      return re.join(" ");
    }
  };

  function callOrQueue(self, queue, fn) {
    if (queue === true) {
      self.queue(fn);
    } else if (queue) {
      self.queue(queue, fn);
    } else {
      self.each(function () {
                fn.call(this);
            });
    }
  }

  // ### getProperties(dict)
  // Returns properties (for `transition-property`) for dictionary `props`. The
  // value of `props` is what you would expect in `$.css(...)`.
  function getProperties(props) {
    var re = [];

    $.each(props, function(key) {
      key = $.camelCase(key); // Convert "text-align" => "textAlign"
      key = $.transit.propertyMap[key] || $.cssProps[key] || key;
      key = uncamel(key); // Convert back to dasherized

      // Get vendor specify propertie
      if (support[key])
        key = uncamel(support[key]);

      if ($.inArray(key, re) === -1) { re.push(key); }
    });

    return re;
  }

  // ### getTransition()
  // Returns the transition string to be used for the `transition` CSS property.
  //
  // Example:
  //
  //     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
  //     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
  //
  function getTransition(properties, duration, easing, delay) {
    // Get the CSS properties needed.
    var props = getProperties(properties);

    // Account for aliases (`in` => `ease-in`).
    if ($.cssEase[easing]) { easing = $.cssEase[easing]; }

    // Build the duration/easing/delay attributes for it.
    var attribs = '' + toMS(duration) + ' ' + easing;
    if (parseInt(delay, 10) > 0) { attribs += ' ' + toMS(delay); }

    // For more properties, add them this way:
    // "margin 200ms ease, padding 200ms ease, ..."
    var transitions = [];
    $.each(props, function(i, name) {
      transitions.push(name + ' ' + attribs);
    });

    return transitions.join(', ');
  }

  // ## $.fn.transition
  // Works like $.fn.animate(), but uses CSS transitions.
  //
  //     $("...").transition({ opacity: 0.1, scale: 0.3 });
  //
  //     // Specific duration
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
  //
  //     // With duration and easing
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
  //
  //     // With callback
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
  //
  //     // With everything
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
  //
  //     // Alternate syntax
  //     $("...").transition({
  //       opacity: 0.1,
  //       duration: 200,
  //       delay: 40,
  //       easing: 'in',
  //       complete: function() { /* ... */ }
  //      });
  //
  $.fn.transition = $.fn.transit = function(properties, duration, easing, callback) {
    var self  = this;
    var delay = 0;
    var queue = true;

    var theseProperties = $.extend(true, {}, properties);

    // Account for `.transition(properties, callback)`.
    if (typeof duration === 'function') {
      callback = duration;
      duration = undefined;
    }

    // Account for `.transition(properties, options)`.
    if (typeof duration === 'object') {
      easing = duration.easing;
      delay = duration.delay || 0;
      queue = typeof duration.queue === "undefined" ? true : duration.queue;
      callback = duration.complete;
      duration = duration.duration;
    }

    // Account for `.transition(properties, duration, callback)`.
    if (typeof easing === 'function') {
      callback = easing;
      easing = undefined;
    }

    // Alternate syntax.
    if (typeof theseProperties.easing !== 'undefined') {
      easing = theseProperties.easing;
      delete theseProperties.easing;
    }

    if (typeof theseProperties.duration !== 'undefined') {
      duration = theseProperties.duration;
      delete theseProperties.duration;
    }

    if (typeof theseProperties.complete !== 'undefined') {
      callback = theseProperties.complete;
      delete theseProperties.complete;
    }

    if (typeof theseProperties.queue !== 'undefined') {
      queue = theseProperties.queue;
      delete theseProperties.queue;
    }

    if (typeof theseProperties.delay !== 'undefined') {
      delay = theseProperties.delay;
      delete theseProperties.delay;
    }

    // Set defaults. (`400` duration, `ease` easing)
    if (typeof duration === 'undefined') { duration = $.fx.speeds._default; }
    if (typeof easing === 'undefined')   { easing = $.cssEase._default; }

    duration = toMS(duration);

    // Build the `transition` property.
    var transitionValue = getTransition(theseProperties, duration, easing, delay);

    // Compute delay until callback.
    // If this becomes 0, don't bother setting the transition property.
    var work = $.transit.enabled && support.transition;
    var i = work ? (parseInt(duration, 10) + parseInt(delay, 10)) : 0;

    // If there's nothing to do...
    if (i === 0) {
      var fn = function(next) {
        self.css(theseProperties);
        if (callback) { callback.apply(self); }
        if (next) { next(); }
      };

      callOrQueue(self, queue, fn);
      return self;
    }

    // Save the old transitions of each element so we can restore it later.
    var oldTransitions = {};

    var run = function(nextCall) {
      var bound = false;

      // Prepare the callback.
      var cb = function() {
        if (bound) { self.unbind(transitionEnd, cb); }

        if (i > 0) {
          self.each(function() {
            this.style[support.transition] = (oldTransitions[this] || null);
          });
        }

        if (typeof callback === 'function') { callback.apply(self); }
        if (typeof nextCall === 'function') { nextCall(); }
      };

      if ((i > 0) && (transitionEnd) && ($.transit.useTransitionEnd)) {
        // Use the 'transitionend' event if it's available.
        bound = true;
        self.bind(transitionEnd, cb);
      } else {
        // Fallback to timers if the 'transitionend' event isn't supported.
        window.setTimeout(cb, i);
      }

      // Apply transitions.
      self.each(function() {
        if (i > 0) {
          this.style[support.transition] = transitionValue;
        }
        $(this).css(theseProperties);
      });
    };

    // Defer running. This allows the browser to paint any pending CSS it hasn't
    // painted yet before doing the transitions.
    var deferredRun = function(next) {
        this.offsetWidth; // force a repaint
        run(next);
    };

    // Use jQuery's fx queue.
    callOrQueue(self, queue, deferredRun);

    // Chainability.
    return this;
  };

  function registerCssHook(prop, isPixels) {
    // For certain properties, the 'px' should not be implied.
    if (!isPixels) { $.cssNumber[prop] = true; }

    $.transit.propertyMap[prop] = support.transform;

    $.cssHooks[prop] = {
      get: function(elem) {
        var t = $(elem).css('transit:transform');
        return t.get(prop);
      },

      set: function(elem, value) {
        var t = $(elem).css('transit:transform');
        t.setFromString(prop, value);

        $(elem).css({ 'transit:transform': t });
      }
    };

  }

  // ### uncamel(str)
  // Converts a camelcase string to a dasherized string.
  // (`marginLeft` => `margin-left`)
  function uncamel(str) {
    return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
  }

  // ### unit(number, unit)
  // Ensures that number `number` has a unit. If no unit is found, assume the
  // default is `unit`.
  //
  //     unit(2, 'px')          //=> "2px"
  //     unit("30deg", 'rad')   //=> "30deg"
  //
  function unit(i, units) {
    if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
      return i;
    } else {
      return "" + i + units;
    }
  }

  // ### toMS(duration)
  // Converts given `duration` to a millisecond string.
  //
  // toMS('fast') => $.fx.speeds[i] => "200ms"
  // toMS('normal') //=> $.fx.speeds._default => "400ms"
  // toMS(10) //=> '10ms'
  // toMS('100ms') //=> '100ms'  
  //
  function toMS(duration) {
    var i = duration;

    // Allow string durations like 'fast' and 'slow', without overriding numeric values.
    if (typeof i === 'string' && (!i.match(/^[\-0-9\.]+/))) { i = $.fx.speeds[i] || $.fx.speeds._default; }

    return unit(i, 'ms');
  }

  // Export some functions for testable-ness.
  $.transit.getTransitionValue = getTransition;

  return $;
}));


/***/ }),

/***/ "jquery":
/*!*************************!*\
  !*** external "jQuery" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jquery__;

/***/ }),

/***/ "mori":
/*!***********************!*\
  !*** external "mori" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_mori__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!******************************!*\
  !*** ./client/js/context.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _rogue_scroll__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rogue-scroll */ "./client/js/rogue-scroll.js");
/* provided dependency */ var jQuery = __webpack_require__(/*! jquery */ "jquery");
/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


// Wait for both DOM and all resources to be loaded
window.addEventListener('load', function () {
  // Ensure jQuery is available
  if (typeof jQuery === 'undefined') {
    console.error('jQuery is not loaded');
    return;
  }

  // Ensure PIXI is available
  if (typeof PIXI === 'undefined') {
    console.error('PIXI is not loaded');
    return;
  }

  // Ensure RogueScroll is available
  if (typeof _rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"] === 'undefined') {
    console.error('RogueScroll is not loaded');
    return;
  }
  jQuery(function () {
    // Initialize RogueScroll
    var game = _rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"].init().then(function () {
      // Bind the game context
      var boundGame = _objectSpread(_objectSpread({}, _rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"]), {}, {
        pause: _rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"].pause.bind(_rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"]),
        play: _rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"].play.bind(_rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"]),
        cleanup: _rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"].cleanup.bind(_rogue_scroll__WEBPACK_IMPORTED_MODULE_0__["default"])
      });

      // Set up event handlers
      $("a[href='#menu']").click(function () {
        $("li a[href='#game']").parent().removeClass("active");
        $(this).parent().addClass('active');
      });
      $("a[href='#game']").click(function () {
        $("li a[href='#menu']").parent().removeClass("active");
        $(this).parent().addClass('active');
      });
      $('#nav').on('activate.bs.scrollspy', function () {
        if ($(".active [href='#menu']").length) {
          if (boundGame.game && typeof boundGame.game.pause === 'function') {
            boundGame.pause();
          }
        }
        if ($(".active [href='#game']").length) {
          if (boundGame.game && typeof boundGame.game.play === 'function') {
            if (boundGame.engine.findEntityByTag('game-manager').data.gameState === 'in-play') {
              boundGame.play();
            }
          }
        }
      });

      // Initial pause
      if (boundGame.game && typeof boundGame.game.pause === 'function') {
        boundGame.pause();
      }

      // Set up cleanup
      window.addEventListener('unload', function () {
        if (boundGame.cleanup && typeof boundGame.cleanup === 'function') {
          boundGame.cleanup();
        }
      });
      return boundGame;
    })["catch"](function (error) {
      console.error('Failed to initialize RogueScroll:', error);
    });
  });
});
})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=main.bundle.js.map