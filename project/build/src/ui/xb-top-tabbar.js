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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	;__weex_define__("@weex-component/62757554449cec5031c1b20d556d4da6", [], function(__weex_require__, exports, __weex_module__){
	__webpack_require__(32);

	;
	    __weex_module__.exports = {
	        data: function () {return {
	          tabItems: [],
	          selectedIndex: 0,
	          selectedColor: '#ff6b43',
	          unselectedColor: '#262525',
	          selectLineColor:'#ff6b43',
	          unselectLineColor:'#cccccc',
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
	              var length = this.tabItems.length;
	              for(var positon = 0; positon < length; positon++) {
	                var tabItem = this.tabItems[positon];
	                if(positon == index){
	                  tabItem.titleColor = this.selectedColor;
	                  tabItem.lineColor = this.selectLineColor;
	                  tabItem.visibility = 'visible';
	                }else {
	                  tabItem.titleColor = this.unselectedColor;
	                  tabItem.lineColor = this.unselectLineColor;
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
	      "type": "div",
	      "classList": [
	        "tabbar"
	      ],
	      "append": "tree",
	      "children": [
	        {
	          "type": "xb-top-tabitem",
	          "repeat": function () {return this.tabItems},
	          "attr": {
	            "index": function () {return this.index},
	            "title": function () {return this.title},
	            "titleColor": function () {return this.titleColor},
	            "lineColor": function () {return this.lineColor}
	          }
	        }
	      ]
	    },
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
	  "tabbar": {
	    "flexDirection": "row",
	    "height": 88
	  },
	  "content": {
	    "position": "absolute",
	    "top": 88,
	    "left": 0,
	    "right": 0,
	    "bottom": 0,
	    "marginTop": 0
	  }
	})
	})
	;__weex_bootstrap__("@weex-component/62757554449cec5031c1b20d556d4da6", {
	  "transformerVersion": "0.3.1"
	},undefined)

/***/ },

/***/ 32:
/***/ function(module, exports) {

	;__weex_define__("@weex-component/xb-top-tabitem", [], function(__weex_require__, exports, __weex_module__){

	;
	    __weex_module__.exports = {
	        data: function () {return {
	          index: 0,
	          title: '',
	          titleColor: '#000000',
	          lineColor: '#cccccc',
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
	    },
	    {
	      "type": "div",
	      "classList": [
	        "bottom-line"
	      ],
	      "style": {
	        "backgroundColor": function () {return this.lineColor}
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
	  "bottom-line": {
	    "position": "absolute",
	    "bottom": 0,
	    "left": 0,
	    "right": 0,
	    "height": 5
	  },
	  "tab-text": {
	    "marginTop": 5,
	    "textAlign": "center",
	    "fontSize": 30
	  }
	})
	})

/***/ }

/******/ });