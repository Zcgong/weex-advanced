/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	;__weex_define__("@weex-component/f4388b28dcdc37030e20484e907785ae", [], function(__weex_require__, exports, __weex_module__){

	;
	    __webpack_require__(1)
	    __webpack_require__(18)
	    __webpack_require__(35)
	    var utils = __webpack_require__(15)
	    var constants = __webpack_require__(13)
	    var weexApis = __webpack_require__(30)
	    var xbBridge = __webpack_require__(23)
	    __weex_module__.exports = {
	        data: function () {return {
	            cameraUrl: constants.imageUrl.IC_MINE_PHOTO,
	            icBack: constants.imageUrl.BACK_BLACK,
	            divTopPaddingTop: 80,
	            divTopPaddingBottom: 90,
	            userInfo: {
	                iconUrl: constants.imageUrl.IC_MARKET_NORMAL,
	                userName: "王永迪222222222222",
	                brief: "我是walid，Android开发程序员。。。。。。。我是walid，Android开发程序员。。。。。。。我是walid，Android开发程序员。。。。。。。我是walid，Android开发程序员。。。。。。。"
	            },
	        }},
	        created: function() {
	            var self = this
	            if (weexApis.isIosPlatform(self)) {
	                var deviceHeight = weexApis.getDeviceInfo(self).deviceHeight
	                if (deviceHeight < 1334) {
	                    self.divTopPaddingTop = 40
	                    self.divTopPaddingBottom = 45
	                }
	            }
	            self.$on('titleBar.leftItemClick', function(ref) {
	                utils.pop(self)
	            })
	            self.$on('titleBar.rightItemClick', function(ref) {
	                utils.toast(self, "保存")
	            })
	        },
	        methods: {
	            iconClick: function(ref) {
	                xbBridge.updateAvatar()
	            },
	            briefClick: function(ret) {
	                utils.toast(this, "briefClick")
	            },
	        },
	    }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "scroller",
	  "id": "root-view",
	  "classList": [
	    "root-view"
	  ],
	  "children": [
	    {
	      "type": "xb-title-bar",
	      "attr": {
	        "leftItemSrc": function () {return this.icBack},
	        "title": "修改资料",
	        "backgroundColor": "#ffffff",
	        "titleColor": "#333333",
	        "rightItemTitle": "保存"
	      }
	    },
	    {
	      "type": "div",
	      "classList": [
	        "div-top"
	      ],
	      "style": {
	        "paddingTop": function () {return this.divTopPaddingTop},
	        "paddingBottom": function () {return this.divTopPaddingBottom}
	      },
	      "children": [
	        {
	          "type": "image",
	          "classList": [
	            "img-user-icon"
	          ],
	          "attr": {
	            "src": function () {return this.userInfo.iconUrl}
	          },
	          "events": {
	            "click": "iconClick"
	          }
	        },
	        {
	          "type": "image",
	          "classList": [
	            "img-camera"
	          ],
	          "attr": {
	            "src": function () {return this.cameraUrl}
	          }
	        }
	      ]
	    },
	    {
	      "type": "wxui-cell-input",
	      "attr": {
	        "leftItemTitle": "昵称",
	        "cellContent": function () {return this.userInfo.userName}
	      }
	    },
	    {
	      "type": "wxui-cell-input",
	      "attr": {
	        "cellContentMaxLength": "64",
	        "height": "210",
	        "cellContentMaxWidth": "600",
	        "cellContentLines": "3",
	        "showBottomLine": "false",
	        "leftItemTitle": "简介",
	        "cellContent": function () {return this.userInfo.brief}
	      }
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "root-view": {
	    "width": 750,
	    "backgroundColor": "#f6f7f8"
	  },
	  "div-top": {
	    "width": 750,
	    "paddingTop": 80,
	    "paddingBottom": 90,
	    "borderTopWidth": 1,
	    "borderTopColor": "#cccccc",
	    "position": "relative",
	    "alignItems": "center"
	  },
	  "img-user-icon": {
	    "width": 160,
	    "height": 160,
	    "borderWidth": 2,
	    "borderColor": "#62c4aa",
	    "borderRadius": 80
	  },
	  "img-camera": {
	    "position": "absolute",
	    "width": 50,
	    "height": 50,
	    "bottom": 90,
	    "right": 285,
	    "marginTop": 2
	  }
	})
	})
	;__weex_bootstrap__("@weex-component/f4388b28dcdc37030e20484e907785ae", {
	  "transformerVersion": "0.3.1"
	},undefined)

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	;__weex_define__("@weex-component/index", [], function(__weex_require__, exports, __weex_module__){

	;
	  __webpack_require__(2);
	  __webpack_require__(3);
	  __webpack_require__(4);
	  __webpack_require__(5);
	  __webpack_require__(6);
	  __webpack_require__(7);
	  __webpack_require__(8);
	  __webpack_require__(9);
	  __webpack_require__(10);
	  __webpack_require__(11);
	  __webpack_require__(12);

	})

/***/ },
/* 2 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-button", [], function(__weex_require__, exports, __weex_module__){

	;
	  __weex_module__.exports = {
	    data: function () {return {
	      type: 'default',
	      size: 'large',
	      value: ''
	    }},
	    methods: {
	    }
	  }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": function () {return ['btn', 'btn-' + (this.type), 'btn-sz-' + (this.size)]},
	  "children": [
	    {
	      "type": "text",
	      "classList": function () {return ['btn-txt', 'btn-txt-' + (this.type), 'btn-txt-sz-' + (this.size)]},
	      "attr": {
	        "value": function () {return this.value}
	      }
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "btn": {
	    "marginBottom": 0,
	    "alignItems": "center",
	    "justifyContent": "center",
	    "borderWidth": 1,
	    "borderStyle": "solid",
	    "borderColor": "#333333"
	  },
	  "btn-default": {
	    "color": "rgb(51,51,51)"
	  },
	  "btn-primary": {
	    "backgroundColor": "rgb(40,96,144)",
	    "borderColor": "rgb(40,96,144)"
	  },
	  "btn-success": {
	    "backgroundColor": "rgb(92,184,92)",
	    "borderColor": "rgb(76,174,76)"
	  },
	  "btn-info": {
	    "backgroundColor": "rgb(91,192,222)",
	    "borderColor": "rgb(70,184,218)"
	  },
	  "btn-warning": {
	    "backgroundColor": "rgb(240,173,78)",
	    "borderColor": "rgb(238,162,54)"
	  },
	  "btn-danger": {
	    "backgroundColor": "rgb(217,83,79)",
	    "borderColor": "rgb(212,63,58)"
	  },
	  "btn-link": {
	    "borderColor": "rgba(0,0,0,0)",
	    "borderRadius": 0
	  },
	  "btn-txt-default": {
	    "color": "rgb(51,51,51)"
	  },
	  "btn-txt-primary": {
	    "color": "rgb(255,255,255)"
	  },
	  "btn-txt-success": {
	    "color": "rgb(255,255,255)"
	  },
	  "btn-txt-info": {
	    "color": "rgb(255,255,255)"
	  },
	  "btn-txt-warning": {
	    "color": "rgb(255,255,255)"
	  },
	  "btn-txt-danger": {
	    "color": "rgb(255,255,255)"
	  },
	  "btn-txt-link": {
	    "color": "rgb(51,122,183)"
	  },
	  "btn-sz-large": {
	    "width": 300,
	    "height": 100,
	    "paddingTop": 25,
	    "paddingBottom": 25,
	    "paddingLeft": 40,
	    "paddingRight": 40,
	    "borderRadius": 15
	  },
	  "btn-sz-middle": {
	    "width": 240,
	    "height": 80,
	    "paddingTop": 15,
	    "paddingBottom": 15,
	    "paddingLeft": 30,
	    "paddingRight": 30,
	    "borderRadius": 10
	  },
	  "btn-sz-small": {
	    "width": 170,
	    "height": 60,
	    "paddingTop": 12,
	    "paddingBottom": 12,
	    "paddingLeft": 25,
	    "paddingRight": 25,
	    "borderRadius": 7
	  },
	  "btn-txt-sz-large": {
	    "fontSize": 45
	  },
	  "btn-txt-sz-middle": {
	    "fontSize": 35
	  },
	  "btn-txt-sz-small": {
	    "fontSize": 30
	  }
	})
	})

/***/ },
/* 3 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-hn", [], function(__weex_require__, exports, __weex_module__){

	;
	  __weex_module__.exports = {
	    data: function () {return {
	      level: 1,
	      value: ''
	    }},
	    methods: {}
	  }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": function () {return ['h' + (this.level)]},
	  "style": {
	    "justifyContent": "center"
	  },
	  "children": [
	    {
	      "type": "text",
	      "classList": function () {return ['txt-h' + (this.level)]},
	      "attr": {
	        "value": function () {return this.value}
	      }
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "h1": {
	    "height": 110,
	    "paddingTop": 20,
	    "paddingBottom": 20
	  },
	  "h2": {
	    "height": 110,
	    "paddingTop": 20,
	    "paddingBottom": 20
	  },
	  "h3": {
	    "height": 110,
	    "paddingTop": 20,
	    "paddingBottom": 20
	  },
	  "txt-h1": {
	    "fontSize": 70
	  },
	  "txt-h2": {
	    "fontSize": 52
	  },
	  "txt-h3": {
	    "fontSize": 42
	  }
	})
	})

/***/ },
/* 4 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-list-item", [], function(__weex_require__, exports, __weex_module__){

	;
	  __weex_module__.exports = {
	    data: function () {return {
	      bgColor: '#ffffff'
	    }},
	    methods: {
	      touchstart: function() {
	        // FIXME android touch
	        // TODO adaptive opposite bgColor
	//        this.bgColor = '#e6e6e6';
	      },
	      touchend: function() {
	        // FIXME android touchend not triggered
	//        this.bgColor = '#ffffff';
	      }
	    }
	  }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": [
	    "item"
	  ],
	  "events": {
	    "touchstart": "touchstart",
	    "touchend": "touchend"
	  },
	  "style": {
	    "backgroundColor": function () {return this.bgColor}
	  },
	  "children": [
	    {
	      "type": "content"
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "item": {
	    "paddingTop": 25,
	    "paddingBottom": 25,
	    "paddingLeft": 35,
	    "paddingRight": 35,
	    "height": 160,
	    "justifyContent": "center",
	    "borderBottomWidth": 1,
	    "borderColor": "#dddddd"
	  }
	})
	})

/***/ },
/* 5 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-panel", [], function(__weex_require__, exports, __weex_module__){

	;
	  __weex_module__.exports = {
	    data: function () {return {
	      type: 'default',
	      title: '',
	      paddingBody: 20,
	      paddingHead: 20,
	      dataClass: '', // FIXME transfer class
	      border: 0
	    }},
	    ready: function() {
	    }
	  }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": function () {return ['panel', 'panel-' + (this.type)]},
	  "style": {
	    "borderWidth": function () {return this.border}
	  },
	  "children": [
	    {
	      "type": "text",
	      "classList": function () {return ['panel-header', 'panel-header-' + (this.type)]},
	      "style": {
	        "paddingTop": function () {return this.paddingHead},
	        "paddingBottom": function () {return this.paddingHead},
	        "paddingLeft": function () {return this.paddingHead*1.5},
	        "paddingRight": function () {return this.paddingHead*1.5}
	      },
	      "attr": {
	        "value": function () {return this.title}
	      }
	    },
	    {
	      "type": "div",
	      "classList": function () {return ['panel-body', 'panel-body-' + (this.type)]},
	      "style": {
	        "paddingTop": function () {return this.paddingBody},
	        "paddingBottom": function () {return this.paddingBody},
	        "paddingLeft": function () {return this.paddingBody*1.5},
	        "paddingRight": function () {return this.paddingBody*1.5}
	      },
	      "children": [
	        {
	          "type": "content"
	        }
	      ]
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "panel": {
	    "marginBottom": 20,
	    "backgroundColor": "#ffffff",
	    "borderColor": "#dddddd",
	    "borderWidth": 1
	  },
	  "panel-primary": {
	    "borderColor": "rgb(40,96,144)"
	  },
	  "panel-success": {
	    "borderColor": "rgb(76,174,76)"
	  },
	  "panel-info": {
	    "borderColor": "rgb(70,184,218)"
	  },
	  "panel-warning": {
	    "borderColor": "rgb(238,162,54)"
	  },
	  "panel-danger": {
	    "borderColor": "rgb(212,63,58)"
	  },
	  "panel-header": {
	    "backgroundColor": "#f5f5f5",
	    "fontSize": 40,
	    "color": "#333333"
	  },
	  "panel-header-primary": {
	    "backgroundColor": "rgb(40,96,144)",
	    "color": "#ffffff"
	  },
	  "panel-header-success": {
	    "backgroundColor": "rgb(92,184,92)",
	    "color": "#ffffff"
	  },
	  "panel-header-info": {
	    "backgroundColor": "rgb(91,192,222)",
	    "color": "#ffffff"
	  },
	  "panel-header-warning": {
	    "backgroundColor": "rgb(240,173,78)",
	    "color": "#ffffff"
	  },
	  "panel-header-danger": {
	    "backgroundColor": "rgb(217,83,79)",
	    "color": "#ffffff"
	  },
	  "panel-body": {}
	})
	})

/***/ },
/* 6 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-tip", [], function(__weex_require__, exports, __weex_module__){

	;
	  __weex_module__.exports = {
	    data: function () {return {
	      type: 'success',
	      value: ''
	    }}
	  }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": function () {return ['tip', 'tip-' + (this.type)]},
	  "children": [
	    {
	      "type": "text",
	      "classList": function () {return ['tip-txt', 'tip-txt-' + (this.type)]},
	      "attr": {
	        "value": function () {return this.value}
	      }
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "tip": {
	    "paddingLeft": 36,
	    "paddingRight": 36,
	    "paddingTop": 36,
	    "paddingBottom": 36,
	    "borderRadius": 10
	  },
	  "tip-txt": {
	    "fontSize": 28
	  },
	  "tip-success": {
	    "backgroundColor": "#dff0d8",
	    "borderColor": "#d6e9c6"
	  },
	  "tip-txt-success": {
	    "color": "#3c763d"
	  },
	  "tip-info": {
	    "backgroundColor": "#d9edf7",
	    "borderColor": "#bce8f1"
	  },
	  "tip-txt-info": {
	    "color": "#31708f"
	  },
	  "tip-warning": {
	    "backgroundColor": "#fcf8e3",
	    "borderColor": "#faebcc"
	  },
	  "tip-txt-warning": {
	    "color": "#8a6d3b"
	  },
	  "tip-danger": {
	    "backgroundColor": "#f2dede",
	    "borderColor": "#ebccd1"
	  },
	  "tip-txt-danger": {
	    "color": "#a94442"
	  }
	})
	})

/***/ },
/* 7 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-countdown", [], function(__weex_require__, exports, __weex_module__){

	;
	__weex_module__.exports = {
	    data: function () {return {
	        now: 0,
	        remain: 0,
	        time: {
	            elapse: 0,
	            D: '0',
	            DD: '0',
	            h: '0',
	            hh: '00',
	            H: '0',
	            HH: '0',
	            m: '0',
	            mm: '00',
	            M: '0',
	            MM: '0',
	            s: '0',
	            ss: '00',
	            S: '0',
	            SS: '0'
	        },
	        outofview: false
	    }},
	    ready: function() {
	        if (this.remain <= 0) {
	            return;
	        }
	        // this.isWeb = this.$getConfig().env.platform === 'Web';
	        this.now = Date.now();
	        this.nextTick();
	    },
	    methods: {
	        nextTick: function() {
	            if (this.outofview) {
	                setTimeout(this.nextTick.bind(this), 1000);
	            } else {
	                this.time.elapse = parseInt((Date.now() - this.now) / 1000);

	                if (this.calc()) {
	                    this.$emit('tick', Object.assign({}, this.time));
	                    setTimeout(this.nextTick.bind(this), 1000);
	                } else {
	                    this.$emit('alarm', Object.assign({}, this.time));
	                }
	                this._app.updateActions(); 
	            }
	        },
	        format: function(str) {
	            if (str.length >= 2) {
	                return str;
	            } else {
	                return '0' + str;
	            }
	        },
	        calc: function() {
	            var remain = this.remain - this.time.elapse;
	            if (remain < 0) {
	                remain = 0;
	            }
	            this.time.D = String(parseInt(remain / 86400));
	            this.time.DD = this.format(this.time.D);
	            this.time.h = String(parseInt((remain - parseInt(this.time.D) * 86400) / 3600));
	            this.time.hh = this.format(this.time.h);
	            this.time.H = String(parseInt(remain / 3600));
	            this.time.HH = this.format(this.time.H);
	            this.time.m = String(parseInt((remain - parseInt(this.time.H) * 3600) / 60));
	            this.time.mm = this.format(this.time.m);
	            this.time.M = String(parseInt(remain / 60));
	            this.time.MM = this.format(this.time.M);
	            this.time.s = String(remain - parseInt(this.time.M) * 60);
	            this.time.ss = this.format(this.time.s);
	            this.time.S = String(remain);
	            this.time.SS = this.format(this.time.S);
	            // console.log(remain, this.D, this.h, this.hh, this.H, this.HH, this.m, this.MM, this.s, this.ss, this.S, this.SS);
	            return remain > 0;
	        },
	        appeared: function() {
	            this.outofview = false;
	        },
	        disappeared: function() {
	            this.outofview = true;
	        }
	    }
	}

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "style": {
	    "overflow": "hidden",
	    "flexDirection": "row"
	  },
	  "events": {
	    "appear": "appeared",
	    "disappear": "disappeared"
	  },
	  "children": [
	    {
	      "type": "content"
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "wrap": {
	    "overflow": "hidden"
	  }
	})
	})

/***/ },
/* 8 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-marquee", [], function(__weex_require__, exports, __weex_module__){

	;
	__weex_module__.exports = {
	    data: function () {return {
	        step: 0,
	        count: 0,
	        index: 1,
	        duration: 0,
	        interval: 0,
	        outofview: false
	    }},
	    ready: function () {
	        if (this.interval > 0
	                && this.step > 0
	                && this.duration > 0) {
	            this.nextTick();    
	        }
	    },
	    methods: {
	        nextTick: function() {
	            var self = this;
	            if (this.outofview) {
	                setTimeout(self.nextTick.bind(self), self.interval);
	            } else {
	                setTimeout(function() {
	                    self.animation(self.nextTick.bind(self));
	                }, self.interval);
	            }
	        },
	        animation: function(cb) {
	            var self = this;
	            var offset = -self.step * self.index;
	            var $animation = __weex_require__('@weex-module/animation');
	            $animation.transition(this.$el('anim'), {
	              styles: {
	                transform: 'translateY(' + String(offset) + 'px) translateZ(0)'
	              },
	              timingFunction: 'ease',
	              duration: self.duration
	            }, function() {
	                self.index = (self.index + 1) % (self.count);
	                self.$emit('change', {
	                    index: self.index,
	                    count: self.count
	                });
	                cb && cb();
	            });
	        },
	        appeared: function() {
	            this.outofview = false;
	        },
	        disappeared: function() {
	            this.outofview = true;
	        }
	    }
	}

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": [
	    "wrap"
	  ],
	  "events": {
	    "appear": "appeared",
	    "disappear": "disappeared"
	  },
	  "children": [
	    {
	      "type": "div",
	      "id": "anim",
	      "classList": [
	        "anim"
	      ],
	      "children": [
	        {
	          "type": "content"
	        }
	      ]
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "wrap": {
	    "overflow": "hidden",
	    "position": "relative"
	  },
	  "anim": {
	    "flexDirection": "column",
	    "position": "absolute",
	    "transform": "translateY(0) translateZ(0)"
	  }
	})
	})

/***/ },
/* 9 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-navbar", [], function(__weex_require__, exports, __weex_module__){

	;
	    __weex_module__.exports = {
	        data: function () {return {
	          dataRole: 'navbar',

	          //导航条背景色
	          backgroundColor: 'black',

	          //导航条高度
	          height: 88,

	          //导航条标题 
	          title: "",

	          //导航条标题颜色
	          titleColor: 'black',

	          //右侧按钮图片
	          rightItemSrc: '',

	          //右侧按钮标题
	          rightItemTitle: '',

	          //右侧按钮标题颜色
	          rightItemColor: 'black',

	          //左侧按钮图片
	          leftItemSrc: '',

	          //左侧按钮标题
	          leftItemTitle: '',

	          //左侧按钮颜色
	          leftItemColor: 'black',
	        }},
	        methods: {
	          onclickrightitem: function (e) {
	            this.$dispatch('naviBar.rightItem.click', {});
	          },
	          onclickleftitem: function (e) {
	            this.$dispatch('naviBar.leftItem.click', {});
	          }
	        }
	    }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": [
	    "container"
	  ],
	  "style": {
	    "height": function () {return this.height},
	    "backgroundColor": function () {return this.backgroundColor}
	  },
	  "attr": {
	    "dataRole": function () {return this.dataRole}
	  },
	  "children": [
	    {
	      "type": "text",
	      "classList": [
	        "right-text"
	      ],
	      "style": {
	        "color": function () {return this.rightItemColor}
	      },
	      "attr": {
	        "naviItemPosition": "right",
	        "value": function () {return this.rightItemTitle}
	      },
	      "shown": function () {return !this.rightItemSrc},
	      "events": {
	        "click": "onclickrightitem"
	      }
	    },
	    {
	      "type": "image",
	      "classList": [
	        "right-image"
	      ],
	      "attr": {
	        "naviItemPosition": "right",
	        "src": function () {return this.rightItemSrc}
	      },
	      "shown": function () {return this.rightItemSrc},
	      "events": {
	        "click": "onclickrightitem"
	      }
	    },
	    {
	      "type": "text",
	      "classList": [
	        "left-text"
	      ],
	      "style": {
	        "color": function () {return this.leftItemColor}
	      },
	      "attr": {
	        "naviItemPosition": "left",
	        "value": function () {return this.leftItemTitle}
	      },
	      "shown": function () {return !this.leftItemSrc},
	      "events": {
	        "click": "onclickleftitem"
	      }
	    },
	    {
	      "type": "image",
	      "classList": [
	        "left-image"
	      ],
	      "attr": {
	        "naviItemPosition": "left",
	        "src": function () {return this.leftItemSrc}
	      },
	      "shown": function () {return this.leftItemSrc},
	      "events": {
	        "click": "onclickleftitem"
	      }
	    },
	    {
	      "type": "text",
	      "classList": [
	        "center-text"
	      ],
	      "style": {
	        "color": function () {return this.titleColor}
	      },
	      "attr": {
	        "naviItemPosition": "center",
	        "value": function () {return this.title}
	      }
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "container": {
	    "flexDirection": "row",
	    "position": "fixed",
	    "top": 0,
	    "left": 0,
	    "right": 0,
	    "width": 750
	  },
	  "right-text": {
	    "position": "absolute",
	    "bottom": 28,
	    "right": 32,
	    "textAlign": "right",
	    "fontSize": 32,
	    "fontFamily": "'Open Sans', sans-serif"
	  },
	  "left-text": {
	    "position": "absolute",
	    "bottom": 28,
	    "left": 32,
	    "textAlign": "left",
	    "fontSize": 32,
	    "fontFamily": "'Open Sans', sans-serif"
	  },
	  "center-text": {
	    "position": "absolute",
	    "bottom": 25,
	    "left": 172,
	    "right": 172,
	    "textAlign": "center",
	    "fontSize": 36,
	    "fontWeight": "bold"
	  },
	  "left-image": {
	    "position": "absolute",
	    "bottom": 20,
	    "left": 28,
	    "width": 50,
	    "height": 50
	  },
	  "right-image": {
	    "position": "absolute",
	    "bottom": 20,
	    "right": 28,
	    "width": 50,
	    "height": 50
	  }
	})
	})

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	;__weex_define__("@weex-component/wxc-navpage", [], function(__weex_require__, exports, __weex_module__){
	__webpack_require__(9);

	;
	    __weex_module__.exports = {
	        data: function () {return {
	          dataRole: 'navbar',
	          backgroundColor: 'black',
	          height: 88,
	          title: "",
	          titleColor: 'black',
	          rightItemSrc: '',
	          rightItemTitle: '',
	          rightItemColor: 'black',
	          leftItemSrc: '',
	          leftItemTitle: '',
	          leftItemColor: 'black',
	        }}
	    }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": [
	    "wrapper"
	  ],
	  "children": [
	    {
	      "type": "wxc-navbar",
	      "attr": {
	        "dataRole": function () {return this.dataRole},
	        "height": function () {return this.height},
	        "backgroundColor": function () {return this.backgroundColor},
	        "title": function () {return this.title},
	        "titleColor": function () {return this.titleColor},
	        "leftItemSrc": function () {return this.leftItemSrc},
	        "leftItemTitle": function () {return this.leftItemTitle},
	        "leftItemColor": function () {return this.leftItemColor},
	        "rightItemSrc": function () {return this.rightItemSrc},
	        "rightItemTitle": function () {return this.rightItemTitle},
	        "rightItemColor": function () {return this.rightItemColor}
	      }
	    },
	    {
	      "type": "div",
	      "classList": [
	        "wrapper"
	      ],
	      "style": {
	        "marginTop": function () {return this.height}
	      },
	      "children": [
	        {
	          "type": "content"
	        }
	      ]
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "wrapper": {
	    "position": "absolute",
	    "top": 0,
	    "left": 0,
	    "right": 0,
	    "bottom": 0,
	    "width": 750
	  }
	})
	})

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	;__weex_define__("@weex-component/wxc-tabbar", [], function(__weex_require__, exports, __weex_module__){
	__webpack_require__(12);

	;
	    __weex_module__.exports = {
	        data: function () {return {
	          tabItems: [ ],
	          selectedIndex: 0,
	          selectedColor: '#ff0000',
	          unselectedColor: '#000000',
	        }},
	        created: function () {
	          this.selected(this.selectedIndex);

	          this.$on('tabItem.onClick',function(e){
	            var detail= e.detail;
	            this.selectedIndex = detail.index;
	            this.selected(detail.index);

	            var params = {
	              index: detail.index
	            };
	            this.$dispatch('tabBar.onClick', params);
	          });
	        },
	        methods: {
	            selected: function(index) {
	              for(var i = 0; i < this.tabItems.length; i++) {
	                var tabItem = this.tabItems[i];
	                if(i == index){
	                  tabItem.icon = tabItem.selectedImage;
	                  tabItem.titleColor = this.selectedColor;
	                  tabItem.visibility = 'visible';
	                }
	                else {
	                  tabItem.icon = tabItem.image;
	                  tabItem.titleColor = this.unselectedColor;
	                  tabItem.visibility = 'hidden';
	                }
	              }
	            },  
	        }
	    }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": [
	    "wrapper"
	  ],
	  "children": [
	    {
	      "type": "embed",
	      "classList": [
	        "content"
	      ],
	      "style": {
	        "visibility": function () {return this.visibility}
	      },
	      "repeat": function () {return this.tabItems},
	      "attr": {
	        "src": function () {return this.src},
	        "type": "weex"
	      }
	    },
	    {
	      "type": "div",
	      "classList": [
	        "tabbar"
	      ],
	      "append": "tree",
	      "children": [
	        {
	          "type": "wxc-tabitem",
	          "repeat": function () {return this.tabItems},
	          "attr": {
	            "index": function () {return this.index},
	            "icon": function () {return this.icon},
	            "title": function () {return this.title},
	            "titleColor": function () {return this.titleColor}
	          }
	        }
	      ]
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "wrapper": {
	    "width": 750,
	    "position": "absolute",
	    "top": 0,
	    "left": 0,
	    "right": 0,
	    "bottom": 0
	  },
	  "content": {
	    "position": "absolute",
	    "top": 0,
	    "left": 0,
	    "right": 0,
	    "bottom": 0,
	    "marginTop": 0,
	    "marginBottom": 88
	  },
	  "tabbar": {
	    "flexDirection": "row",
	    "position": "fixed",
	    "bottom": 0,
	    "left": 0,
	    "right": 0,
	    "height": 88
	  }
	})
	})

/***/ },
/* 12 */
/***/ function(module, exports) {

	;__weex_define__("@weex-component/wxc-tabitem", [], function(__weex_require__, exports, __weex_module__){

	;
	    __weex_module__.exports = {
	        data: function () {return {
	          index: 0,
	          title: '',
	          titleColor: '#000000',
	          icon: '',
	          backgroundColor: '#ffffff',
	        }},
	        methods: {
	          onclickitem: function (e) {
	            var vm = this;
	            var params = {
	              index: vm.index
	            };
	            vm.$dispatch('tabItem.onClick', params);
	          }
	        }
	    }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": [
	    "container"
	  ],
	  "style": {
	    "backgroundColor": function () {return this.backgroundColor}
	  },
	  "events": {
	    "click": "onclickitem"
	  },
	  "children": [
	    {
	      "type": "image",
	      "classList": [
	        "top-line"
	      ],
	      "attr": {
	        "src": "http://gtms03.alicdn.com/tps/i3/TB1mdsiMpXXXXXpXXXXNw4JIXXX-640-4.png"
	      }
	    },
	    {
	      "type": "image",
	      "classList": [
	        "tab-icon"
	      ],
	      "attr": {
	        "src": function () {return this.icon}
	      }
	    },
	    {
	      "type": "text",
	      "classList": [
	        "tab-text"
	      ],
	      "style": {
	        "color": function () {return this.titleColor}
	      },
	      "attr": {
	        "value": function () {return this.title}
	      }
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "container": {
	    "flex": 1,
	    "flexDirection": "column",
	    "alignItems": "center",
	    "justifyContent": "center",
	    "height": 88
	  },
	  "top-line": {
	    "position": "absolute",
	    "top": 0,
	    "left": 0,
	    "right": 0,
	    "height": 2
	  },
	  "tab-icon": {
	    "marginTop": 5,
	    "width": 40,
	    "height": 40
	  },
	  "tab-text": {
	    "marginTop": 5,
	    "textAlign": "center",
	    "fontSize": 20
	  }
	})
	})

/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * Created by walid on 16/7/29.
	 *  常量封装
	 */

	var datas = {
	    baseImageUrl: 'http://xiaobaiossdevortest.oss-cn-beijing.aliyuncs.com/icon/',
	}

	// color
	exports.color = {
	    MAIN: '#ff6b43',
	}

	exports.spEnum = {
	    TELEPHONE: 'TELEPHONE',
	    AVATAR: 'AVATAR',
	    NICK_NAME: 'NICK_NAME',
	    BRIEF: 'BRIEF',
	    OPEN_3G4G: 'OPEN_3G4G',
	}

	exports.imageUrl = {
	    BACK_BLACK: datas.baseImageUrl + 'back_black.png',
	    BACK_WDITE: datas.baseImageUrl + 'back_white.png',
	    MINE_FAVORITE: datas.baseImageUrl + 'mine_favorite.png',
	    IC_MINE_MESSAGE: datas.baseImageUrl + 'ic_mine_message.png',
	    MINE_SETTING: datas.baseImageUrl + 'mine_setting.png',
	    MINE_EDIT: datas.baseImageUrl + 'mine_edit.png',
	    IC_RIGHT_ARROW: datas.baseImageUrl + 'ic_right_arrow.png',
	    DEFAULT: datas.baseImageUrl + 'ic_market_normal.png',
	    IC_MINE_PHOTO: datas.baseImageUrl + 'ic_mine_photo.png',
	    IC_HER_VIDEO: datas.baseImageUrl + 'ic_her_video.png',
	    IC_MESSAGE_LEFT_ARROW: datas.baseImageUrl + 'ic_message_left_arrow.png',
	    IC_OFFICAL_MESSAGE: datas.baseImageUrl + 'ic_offical_message.png',
	    IC_MESSAGE_COMMENT: datas.baseImageUrl + 'ic_message_comment.png',
	    IC_MINE_NAVIGATION: datas.baseImageUrl + 'ic_mine_navigation.png',
	    IC_MINE_BACKGROUND: datas.baseImageUrl + 'ic_mine_background.png',
	}

	exports.pageUrl = {
	    SETTING_URL: 'mine/setting/xb-setting.js',
	    SETTING_BINGPHONE: 'mine/setting/xb-setting-bindphone.js',
	    OTHER_PERSON_PAGE: 'mine/xb-other-person-page.js',
	    MINE_PAGE: 'mine/xb-minepage.js',
	    MINE_MESSAGE: 'mine/message/xb-mine-message.js',
	    MINE_TEST_PARAMS: 'mine/test-params.js',
	    MINE_OFFICAL_MESSAGE: 'mine/message/xb-offical-message.js',
	    MINE_COMMENT_MESSAGE: 'mine/message/xb-comment-message.js',
	    ABOUTUS_URL: 'mine/setting/xb-about-us.js',
	    SETTING_AGREEMENT: 'mine/setting/xb-agreement.js',
	    SETTING_APP_INTRODUCE: 'mine/setting/xb-app-introduce.js',
	    UPDATE_USERINFO: 'mine/xb-update-userinfo.js',
	    SETTING_COLLECT: 'mine/xb-collect.js',
	}


/***/ },
/* 14 */,
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by walid on 16/6/13.
	 *  封装utils工具类使用
	 */

	var strUtil = __webpack_require__(16)

	var modal
	__weex_define__('@weex-temp/x', function(__weex_require__) {
	    modal = __weex_require__('@weex-module/modal')
	})

	var navigator
	__weex_define__('@weex-temp/x', function(__weex_require__) {
	    navigator = __weex_require__('@weex-module/navigator')
	})

	var data = {
	    baseurl: 'http://192.168.1.57:12580/project/build/src/ui/',
	    // baseurl: 'http://192.168.0.111:12580/project/build/src/ui/',
	    baseImageUrl: 'http://xiaobaiossdevortest.oss-cn-beijing.aliyuncs.com/common/',
	    baseh5url: 'http://192.168.1.57:12580/index.html?page=./project/build/src/ui/',
	    debug: true
	};

	function push(self, url) {
	    var filterUrl = strUtil.trim(url, true)
	    var params = {
	        'url': getBaseUrl() + filterUrl,
	        'animated': 'true',
	    }
	    // nativeLog('xbBridge' + xbBridge)
	    toastDebug(self, getBaseUrl() + filterUrl);
	    navigator.push(params, function(e) {
	        //callback
	    });
	}

	function pop(self) {
	    var params = {
	        'animated': 'true',
	    }
	    navigator.pop(params, function(e) {
	        //callback
	    });
	}

	function toastDebug(self, content) {
	    if (data.debug) {
	        toast(self, content);
	    }
	}

	function toast(self, content) {
	    self.$call('modal', 'toast', {
	        'message': content,
	        'duration': 2.0
	    });
	}

	function getParameterByName(name, url) {
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	function getBaseUrl() {
	    // in Native
	    var base = data.baseurl;
	    if (typeof window === 'object') {
	        // in Browser or WebView
	        base = data.baseh5url;
	    }
	    return base;
	}

	function getBaseImageUrl() {
	    return data.baseImageUrl;
	}

	exports.push = push
	exports.pop = pop
	exports.toastDebug = toastDebug
	exports.toast = toast
	exports.getParameterByName = getParameterByName
	exports.getBaseUrl = getBaseUrl
	exports.getBaseImageUrl = getBaseImageUrl


/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * Created by walid on 16/6/13.
	 *  str操作工具类使用
	 */

	function trim(str, isGlobal) {
	    var result;
	    result = str.replace(/(^\s+)|(\s+$)/g, "");
	    if (isGlobal) {
	        result = result.replace(/\s/g, "");
	    }
	    return result;
	}

	exports.trim = trim


/***/ },
/* 17 */,
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	;__weex_define__("@weex-component/xb-title-bar", [], function(__weex_require__, exports, __weex_module__){

	;
	    __webpack_require__(1);
	    var constants = __webpack_require__(13);
	    __weex_module__.exports = {
	        data: function () {return {
	            navBarHeight: 88,
	            paddingTop: 0,
	            title: '',
	            leftItemSrc: '',
	            rightItemSrc: '',
	            backgroundColor: '#ff6b43',
	            titleColor: '#ffffff',
	            leftItemTitle: '',
	            rightItemTitle: '',
	        }},
	        created: function() {
	            var self = this;
	            self.$getConfig(function(config) {
	                var env = config.env;
	                if (env.platform == 'iOS') {
	                    var scale = env.scale
	                    var deviceWidth = env.deviceWidth / scale
	                    self.navBarHeight = 64.0 * 750.0 / deviceWidth
	                    self.paddingTop = 20.0 * 750.0 / deviceWidth
	                }
	            }.bind(self))
	        },
	        methods: {
	            onLeftClick: function(e) {
	                this.$dispatch('titleBar.leftItemClick', {})
	            },
	            onRightClick: function(e) {
	                this.$dispatch('titleBar.rightItemClick', {})
	            },
	        },
	    }

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": [
	    "title-bar"
	  ],
	  "style": {
	    "backgroundColor": function () {return this.backgroundColor},
	    "height": function () {return this.navBarHeight},
	    "paddingTop": function () {return this.paddingTop}
	  },
	  "children": [
	    {
	      "type": "div",
	      "style": {
	        "flex": 1,
	        "paddingLeft": 20,
	        "alignItems": "flex-start"
	      },
	      "events": {
	        "click": "onLeftClick"
	      },
	      "children": [
	        {
	          "type": "image",
	          "style": {
	            "width": 48,
	            "height": 48
	          },
	          "shown": function () {return this.leftItemSrc},
	          "attr": {
	            "src": function () {return this.leftItemSrc}
	          }
	        }
	      ]
	    },
	    {
	      "type": "div",
	      "style": {
	        "flex": 3
	      },
	      "children": [
	        {
	          "type": "text",
	          "classList": [
	            "txt-title"
	          ],
	          "style": {
	            "color": function () {return this.titleColor}
	          },
	          "attr": {
	            "value": function () {return this.title}
	          }
	        }
	      ]
	    },
	    {
	      "type": "div",
	      "style": {
	        "flex": 1,
	        "paddingRight": 20,
	        "alignItems": "flex-end"
	      },
	      "events": {
	        "click": "onRightClick"
	      },
	      "children": [
	        {
	          "type": "image",
	          "style": {
	            "width": 48,
	            "height": 48
	          },
	          "shown": function () {return this.rightItemSrc},
	          "events": {
	            "click": "onRightClick"
	          },
	          "attr": {
	            "src": function () {return this.rightItemSrc}
	          }
	        },
	        {
	          "type": "text",
	          "classList": [
	            "txt-right"
	          ],
	          "shown": function () {return !this.rightItemSrc},
	          "attr": {
	            "value": function () {return this.rightItemTitle}
	          }
	        }
	      ]
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "title-bar": {
	    "flexDirection": "row",
	    "alignItems": "center"
	  },
	  "txt-title": {
	    "textAlign": "center",
	    "fontSize": 36,
	    "marginLeft": 10
	  },
	  "txt-right": {
	    "fontSize": 28,
	    "color": "#666666"
	  }
	})
	})

/***/ },
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ function(module, exports) {

	/**
	 * Created by walid on 16/7/29.
	 *  桥接封装类
	 */

	 var bridge
	 __weex_define__('@weex-temp/x', function(__weex_require__) {
	     bridge = __weex_require__('@weex-module/bridge')
	 })

	// var bridge = require('@weex-module/bridge')

	function jumpSendLivePage() {
	    bridge.jumpSendLivePage()
	}

	function jumpFeedBackPage() {
	    bridge.jumpFeedBackPage()
	}

	function clearMemory() {
	    bridge.clearMemory()
	}

	function exitlogin() {
	    bridge.exitlogin()
	}

	function logger(content) {
	    bridge.logger(content)
	}

	function registerCallBack(eventKey, func) {
	    bridge.registerCallBack(eventKey, func)
	}

	// 保存SP数据
	function saveSP(key, value) {
	    bridge.saveSP(key, value)
	}

	// 获取SP数据
	function getSP(key, callback) {
	    bridge.getSP(key, callback)
	}

	//更新头像
	function updateAvatar() {
	    bridge.updateAvatar()
	}

	//loading画面
	function showLoading() {
	    bridge.showLoading()
	}

	// 获取SP bool 数据
	exports.getSPBool = function(key, callback) {
	    getSP(key, function(ref) {
	        ref.data = ref.data == 'true' || ref.data == '1'
	        callback(ref)
	    })
	}

	exports.showLoading = showLoading
	exports.saveSP = saveSP
	exports.getSP = getSP
	exports.jumpSendLivePage = jumpSendLivePage
	exports.jumpFeedBackPage = jumpFeedBackPage
	exports.clearMemory = clearMemory
	exports.exitlogin = exitlogin
	exports.logger = logger
	exports.registerCallBack = registerCallBack
	exports.updateAvatar = updateAvatar


/***/ },
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */
/***/ function(module, exports) {

	/**
	 * Created by walid on 16/6/13.
	 * 封装utils工具类使用
	 */

	var data = {
	    baseurl: 'http://192.168.1.18:12580/project/build/src/ui/',
	    baseImageUrl: 'http://xiaobaiossdevortest.oss-cn-beijing.aliyuncs.com/common/',
	    baseh5url: 'http://192.168.1.18:12580/index.html?page=./project/build/src/ui/',
	    debug: false
	};

	function isIosPlatform(self) {
	    var platform = self.$getConfig().env.platform
	    return platform === "iOS"
	}

	function getDeviceInfo(self) {
	    var env = self.$getConfig().env
	    var deviceWidth = env.deviceWidth
	    var deviceHeight = env.deviceHeight
	    var deviceInfo = {
	        deviceWidth: deviceWidth,
	        deviceHeight: deviceHeight
	    }
	    return deviceInfo
	}

	exports.isIosPlatform = isIosPlatform
	exports.getDeviceInfo = getDeviceInfo


/***/ },
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	;__weex_define__("@weex-component/wxui-cell-input", [], function(__weex_require__, exports, __weex_module__){

	;
	    __webpack_require__(1);
	    var constants = __webpack_require__(13);
	    __weex_module__.exports = {
	        data: function () {return {

	            // 左侧控件图片
	            leftItemSrc: '',

	            // 左侧控件内容
	            leftItemTitle: '',

	            // 右侧控件图片
	            itemRightSrc: constants.imageUrl.IC_RIGHT_ARROW,

	            // cell name
	            cellContent: 'cell',
	            // name 最大宽度
	            cellContentMaxWidth: '480',
	            cellContentMaxLength: 16,
	            cellContentAutofocus: false,

	            // cell height
	            height: 88,

	            // showBottomLine
	            showBottomLine: 'true',

	            // 显示右侧内容
	            showRight: 'false',
	        }},
	        methods: {
	            onInput: function(event) {
	                this.$dispatch('onInputCode', event.value)
	            },
	        }
	    };

	;__weex_module__.exports.template = __weex_module__.exports.template || {}
	;Object.assign(__weex_module__.exports.template, {
	  "type": "div",
	  "classList": [
	    "div"
	  ],
	  "style": {
	    "height": function () {return this.height}
	  },
	  "children": [
	    {
	      "type": "div",
	      "classList": [
	        "div-left"
	      ],
	      "children": [
	        {
	          "type": "image",
	          "id": "img-left",
	          "classList": [
	            "img-left"
	          ],
	          "shown": function () {return this.leftItemSrc},
	          "attr": {
	            "src": function () {return this.leftItemSrc}
	          }
	        },
	        {
	          "type": "text",
	          "classList": [
	            "txt-left"
	          ],
	          "shown": function () {return !this.leftItemSrc},
	          "attr": {
	            "value": function () {return this.leftItemTitle}
	          }
	        }
	      ]
	    },
	    {
	      "type": "input",
	      "events": {
	        "input": "onInput"
	      },
	      "classList": [
	        "input-cell-content"
	      ],
	      "style": {
	        "width": function () {return this.cellContentMaxWidth}
	      },
	      "attr": {
	        "singleline": function () {return this.cellContentSingleLine},
	        "maxlength": function () {return this.cellContentMaxLength},
	        "autofocus": function () {return this.cellContentAutofocus},
	        "placeholder": "...",
	        "value": function () {return this.cellContent}
	      }
	    },
	    {
	      "type": "image",
	      "classList": [
	        "arrow"
	      ],
	      "shown": function () {return this.showRight=='true'},
	      "attr": {
	        "src": function () {return this.itemRightSrc}
	      }
	    },
	    {
	      "type": "div",
	      "shown": function () {return this.showBottomLine=='true'},
	      "classList": [
	        "div-bottom-line"
	      ]
	    }
	  ]
	})
	;__weex_module__.exports.style = __weex_module__.exports.style || {}
	;Object.assign(__weex_module__.exports.style, {
	  "div": {
	    "flexDirection": "row",
	    "width": 750,
	    "position": "relative",
	    "paddingLeft": 20,
	    "paddingRight": 20,
	    "backgroundColor": "#ffffff"
	  },
	  "div-bottom-line": {
	    "width": 710,
	    "height": 2,
	    "position": "absolute",
	    "bottom": 0,
	    "left": 20,
	    "backgroundColor": "#cccccc"
	  },
	  "div-left": {
	    "height": 88,
	    "position": "relative",
	    "marginLeft": 10,
	    "marginRight": 30,
	    "alignItems": "center",
	    "justifyContent": "center"
	  },
	  "img-left": {
	    "width": 48,
	    "height": 48
	  },
	  "txt-left": {
	    "fontSize": 30,
	    "color": "#666666",
	    "textAlign": "center"
	  },
	  "arrow": {
	    "width": 24,
	    "height": 32,
	    "position": "absolute",
	    "right": 20,
	    "top": 24
	  },
	  "input-cell-content": {
	    "fontSize": 30,
	    "color": "#666666",
	    "textOverflow": "ellipsis"
	  }
	})
	})

/***/ }
/******/ ]);