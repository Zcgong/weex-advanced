(this.nativeLog || function(s) {console.log(s)})('START WEEX HTML5: 0.2.23 Build 20160824');
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/* global lib, WebSocket */
	
	'use strict';
	
	__webpack_require__(1);
	
	__webpack_require__(2);
	
	// require('./polyfill')
	
	const config = __webpack_require__(6);
	const Loader = __webpack_require__(7);
	const utils = __webpack_require__(8);
	const protocol = __webpack_require__(9);
	const ComponentManager = __webpack_require__(10);
	const Component = __webpack_require__(17);
	const Sender = __webpack_require__(21);
	const receiver = __webpack_require__(22);
	
	// Components and apis.
	const components = __webpack_require__(23);
	const api = __webpack_require__(85);
	__webpack_require__(120);
	__webpack_require__(97);
	
	// gesture
	__webpack_require__(46);
	
	const WEAPP_STYLE_ID = 'weapp-style';
	
	const DEFAULT_DESIGN_WIDTH = 750;
	const DEFAULT_SCALE = window.innerWidth / DEFAULT_DESIGN_WIDTH;
	const DEFAULT_ROOT_ID = 'weex';
	const DEFAULT_JSONP_CALLBACK_NAME = 'weexJsonpCallback';
	
	window.WXEnvironment = {
	  weexVersion: config.weexVersion,
	  appName: lib.env.aliapp ? lib.env.aliapp.appname : null,
	  appVersion: lib.env.aliapp ? lib.env.aliapp.version.val : null,
	  platform: 'Web',
	  osName: lib.env.browser ? lib.env.browser.name : null,
	  osVersion: lib.env.browser ? lib.env.browser.version.val : null,
	  deviceWidth: DEFAULT_DESIGN_WIDTH,
	  deviceHeight: window.innerHeight / DEFAULT_SCALE
	};
	
	const _instanceMap = {};
	const _downgrades = {};
	
	const downgradable = ['list', 'scroller'];
	
	function initializeWithUrlParams() {
	  // in casperjs the protocol is file.
	  if (location.protocol.match(/file/)) {
	    return;
	  }
	
	  const params = lib.httpurl(location.href).params;
	  for (const k in params) {
	    // Get global _downgrades from url's params.
	    const match = k.match(/downgrade_(\w+)/);
	    if (!match || !match[1]) {
	      continue;
	    }
	    if (params[k] !== true && params[k] !== 'true') {
	      continue;
	    }
	    const downk = match[1];
	    if (downk && downgradable.indexOf(downk) !== -1) {
	      _downgrades[downk] = true;
	    }
	  }
	
	  // set global 'debug' config to true if there's a debug flag in current url.
	  const debug = params['debug'];
	  if (debug === true || debug === 'true') {
	    config.debug = true;
	  }
	}
	
	initializeWithUrlParams();
	
	const logger = __webpack_require__(25);
	logger.init();
	
	function Weex(options) {
	  if (!(this instanceof Weex)) {
	    return new Weex(options);
	  }
	
	  // Width of the root container. Default is window.innerWidth.
	  this.width = options.width || window.innerWidth;
	  this.bundleUrl = options.bundleUrl || location.href;
	  this.instanceId = options.appId;
	  this.rootId = options.rootId || DEFAULT_ROOT_ID + utils.getRandom(10);
	  this.designWidth = options.designWidth || DEFAULT_DESIGN_WIDTH;
	  this.jsonpCallback = options.jsonpCallback || DEFAULT_JSONP_CALLBACK_NAME;
	  this.source = options.source;
	  this.loader = options.loader;
	  this.embed = options.embed;
	
	  this.data = options.data;
	
	  this.initDowngrades(options.downgrade);
	  this.initScale();
	  this.initComponentManager();
	  this.initBridge();
	  Weex.addInstance(this);
	
	  protocol.injectWeexInstance(this);
	
	  this.loadBundle(function (err, appCode) {
	    if (!err) {
	      this.createApp(config, appCode);
	    } else {
	      console.error('load bundle err:', err);
	    }
	  }.bind(this));
	}
	
	Weex.init = function (options) {
	  if (utils.isArray(options)) {
	    options.forEach(function (config) {
	      new Weex(config);
	    });
	  } else if (utils.getType(options) === 'object') {
	    new Weex(options);
	  }
	};
	
	Weex.addInstance = function (instance) {
	  _instanceMap[instance.instanceId] = instance;
	};
	
	Weex.getInstance = function (instanceId) {
	  return _instanceMap[instanceId];
	};
	
	Weex.prototype = {
	
	  initDowngrades: function (dg) {
	    this.downgrades = utils.extend({}, _downgrades);
	    // Get downgrade component type from user's specification
	    // in weex's init options.
	    if (!utils.isArray(dg)) {
	      return;
	    }
	    for (let i = 0, l = dg.length; i < l; i++) {
	      const downk = dg[i];
	      if (downgradable.indexOf(downk) !== -1) {
	        this.downgrades[downk] = true;
	      }
	    }
	  },
	
	  initBridge: function () {
	    receiver.init(this);
	    this.sender = new Sender(this);
	  },
	
	  loadBundle: function (cb) {
	    Loader.load({
	      jsonpCallback: this.jsonpCallback,
	      source: this.source,
	      loader: this.loader
	    }, cb);
	  },
	
	  createApp: function (config, appCode) {
	    let root = document.querySelector('#' + this.rootId);
	    if (!root) {
	      root = document.createElement('div');
	      root.id = this.rootId;
	      document.body.appendChild(root);
	    }
	
	    const promise = window.createInstance(this.instanceId, appCode, {
	      bundleUrl: this.bundleUrl,
	      debug: config.debug
	    }, this.data);
	
	    if (Promise && promise instanceof Promise) {
	      promise.then(function () {
	        // Weex._instances[this.instanceId] = this.root
	      }).catch(function (err) {
	        if (err && config.debug) {
	          console.error(err);
	        }
	      });
	    }
	
	    // Do not destroy instance here, because in most browser
	    // press back button to back to this page will not refresh
	    // the window and the instance will not be recreated then.
	    // window.addEventListener('beforeunload', function (e) {
	    // })
	  },
	
	  initScale: function () {
	    this.scale = this.width / this.designWidth;
	  },
	
	  initComponentManager: function () {
	    this._componentManager = new ComponentManager(this);
	  },
	
	  getComponentManager: function () {
	    return this._componentManager;
	  },
	
	  getRoot: function () {
	    return document.querySelector('#' + this.rootId);
	  }
	};
	
	Weex.appendStyle = function (css) {
	  utils.appendStyle(css, WEAPP_STYLE_ID);
	};
	
	// Register a new component with the specified name.
	Weex.registerComponent = function (name, comp) {
	  ComponentManager.registerComponent(name, comp);
	};
	
	// Register a new api module.
	// If the module already exists, just add methods from the
	// new module to the old one.
	Weex.registerApiModule = function (name, module, meta) {
	  if (!protocol.apiModule[name]) {
	    protocol.apiModule[name] = module;
	  } else {
	    for (const key in module) {
	      if (module.hasOwnProperty(key)) {
	        protocol.apiModule[name][key] = module[key];
	      }
	    }
	  }
	  // register API module's meta info to jsframework
	  if (meta) {
	    protocol.setApiModuleMeta(meta);
	    window.registerModules(protocol.getApiModuleMeta(name), true);
	  }
	};
	
	// Register a new api method for the specified module.
	// opts:
	//  - args: type of arguments the API method takes such
	//    as ['string', 'function']
	Weex.registerApi = function (moduleName, name, method, args) {
	  if (typeof method !== 'function') {
	    return;
	  }
	  if (!protocol.apiModule[moduleName]) {
	    protocol.apiModule[moduleName] = {};
	    protocol._meta[moduleName] = [];
	  }
	  protocol.apiModule[moduleName][name] = method;
	  if (!args) {
	    return;
	  }
	  // register API meta info to jsframework
	  protocol.setApiMeta(moduleName, {
	    name: name,
	    args: args
	  });
	  window.registerModules(protocol.getApiModuleMeta(moduleName), true);
	};
	
	// Register a new weex-bundle-loader.
	Weex.registerLoader = function (name, loaderFunc) {
	  Loader.registerLoader(name, loaderFunc);
	};
	
	// To install components and plugins.
	Weex.install = function (mod) {
	  mod.init(Weex);
	};
	
	Weex.stopTheWorld = function () {
	  for (const instanceId in _instanceMap) {
	    if (_instanceMap.hasOwnProperty(instanceId)) {
	      window.destroyInstance(instanceId);
	    }
	  }
	};
	
	function startRefreshController() {
	  if (location.protocol.match(/file/)) {
	    return;
	  }
	  if (location.search.indexOf('hot-reload_controller') === -1) {
	    return;
	  }
	  if (typeof WebSocket === 'undefined') {
	    console.info('auto refresh need WebSocket support');
	    return;
	  }
	  const host = location.hostname;
	  const port = 8082;
	  const client = new WebSocket('ws://' + host + ':' + port + '/', 'echo-protocol');
	  client.onerror = function () {
	    console.log('refresh controller websocket connection error');
	  };
	  client.onmessage = function (e) {
	    console.log('Received: \'' + e.data + '\'');
	    if (e.data === 'refresh') {
	      location.reload();
	    }
	  };
	}
	
	startRefreshController();
	
	// Weex.install(require('weex-components'))
	Weex.install(components);
	Weex.install(api);
	
	Weex.Component = Component;
	Weex.ComponentManager = ComponentManager;
	Weex.utils = utils;
	Weex.config = config;
	
	global.weex = Weex;
	module.exports = Weex;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {import '../shared';
	import runtime from '../runtime';
	import { subversion } from '../../package.json';
	import * as methods from '../default/api/methods';
	
	const { native, transformer } = subversion;
	
	// register instance management APIs
	for (const methodName in runtime) {
	  global[methodName] = (...args) => {
	    const ret = runtime[methodName](...args);
	    if (ret instanceof Error) {
	      console.error(ret.toString());
	    }
	    return ret;
	  };
	}
	
	// register framework meta info
	global.frameworkVersion = native;
	global.transformerVersion = transformer;
	
	// register special methods for Weex framework
	global.registerMethods(methods);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(3);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./base.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./base.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, "* {\n  margin: 0;\n  padding: 0;\n  text-size-adjust: none;\n}\n\nul, ol {\n  list-style: none;\n}\n", ""]);
	
	// exports


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function () {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
				if (item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function (modules, mediaQuery) {
			if (typeof modules === "string") modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for (var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if (typeof id === "number") alreadyImportedModules[id] = true;
			}
			for (i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if (mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if (mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	const config = {
	
	  weexVersion: '0.5.0',
	
	  debug: false
	
	};
	
	module.exports = config;

/***/ },
/* 7 */
/***/ function(module, exports) {

	/* global XMLHttpRequest */
	
	'use strict';
	
	function loadByXHR(config, callback) {
	  if (!config.source) {
	    callback(new Error('xhr loader: missing config.source.'));
	  }
	  const xhr = new XMLHttpRequest();
	  xhr.open('GET', config.source);
	  xhr.onload = function () {
	    callback(null, this.responseText);
	  };
	  xhr.onerror = function (error) {
	    callback(error);
	  };
	  xhr.send();
	}
	
	function loadByJsonp(config, callback) {
	  if (!config.source) {
	    callback(new Error('jsonp loader: missing config.source.'));
	  }
	  const callbackName = config.jsonpCallback || 'weexJsonpCallback';
	  window[callbackName] = function (code) {
	    if (code) {
	      callback(null, code);
	    } else {
	      callback(new Error('load by jsonp error'));
	    }
	  };
	  const script = document.createElement('script');
	  script.src = decodeURIComponent(config.source);
	  script.type = 'text/javascript';
	  document.body.appendChild(script);
	}
	
	function loadBySourceCode(config, callback) {
	  // src is the jsbundle.
	  // no need to fetch from anywhere.
	  if (config.source) {
	    callback(null, config.source);
	  } else {
	    callback(new Error('source code laoder: missing config.source.'));
	  }
	}
	
	const callbackMap = {
	  xhr: loadByXHR,
	  jsonp: loadByJsonp,
	  source: loadBySourceCode
	};
	
	function load(options, callback) {
	  const loadFn = callbackMap[options.loader];
	  loadFn(options, callback);
	}
	
	function registerLoader(name, loaderFunc) {
	  if (typeof loaderFunc === 'function') {
	    callbackMap[name] = loaderFunc;
	  }
	}
	
	module.exports = {
	  load: load,
	  registerLoader: registerLoader
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	/* global Image */
	
	'use strict';
	
	// const WEAPP_STYLE_ID = 'weapp-style'
	
	let _isWebpSupported = false;(function isSupportWebp() {
	  try {
	    const webP = new Image();
	    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdA' + 'SoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
	    webP.onload = function () {
	      if (webP.height === 2) {
	        _isWebpSupported = true;
	      }
	    };
	  } catch (e) {
	    // do nothing.
	  }
	})();
	
	function extend(to, from) {
	  for (const key in from) {
	    to[key] = from[key];
	  }
	  return to;
	}
	
	function isArray(arr) {
	  return Array.isArray ? Array.isArray(arr) : Object.prototype.toString.call(arr) === '[object Array]';
	}
	
	function isPlainObject(obj) {
	  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() === 'object';
	}
	
	function getType(obj) {
	  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
	}
	
	function appendStyle(css, styleId, replace) {
	  let style = document.getElementById(styleId);
	  if (style && replace) {
	    style.parentNode.removeChild(style);
	    style = null;
	  }
	  if (!style) {
	    style = document.createElement('style');
	    style.type = 'text/css';
	    styleId && (style.id = styleId);
	    document.getElementsByTagName('head')[0].appendChild(style);
	  }
	  style.appendChild(document.createTextNode(css));
	}
	
	function getUniqueFromArray(arr) {
	  if (!isArray(arr)) {
	    return [];
	  }
	  const res = [];
	  const unique = {};
	  let val;
	  for (let i = 0, l = arr.length; i < l; i++) {
	    val = arr[i];
	    if (unique[val]) {
	      continue;
	    }
	    unique[val] = true;
	    res.push(val);
	  }
	  return res;
	}
	
	function transitionize(element, props) {
	  const transitions = [];
	  for (const key in props) {
	    transitions.push(key + ' ' + props[key]);
	  }
	  element.style.transition = transitions.join(', ');
	  element.style.webkitTransition = transitions.join(', ');
	}
	
	function detectWebp() {
	  return _isWebpSupported;
	}
	
	function getRandom(num) {
	  const _defaultNum = 10;
	  if (typeof num !== 'number' || num <= 0) {
	    num = _defaultNum;
	  }
	  const _max = Math.pow(10, num);
	  return Math.floor(Date.now() + Math.random() * _max) % _max;
	}
	
	function getRgb(color) {
	  let match;
	  color = color + '';
	  match = color.match(/#(\d{2})(\d{2})(\d{2})/);
	  if (match) {
	    return {
	      r: parseInt(match[1], 16),
	      g: parseInt(match[2], 16),
	      b: parseInt(match[3], 16)
	    };
	  }
	  match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
	  if (match) {
	    return {
	      r: parseInt(match[1]),
	      g: parseInt(match[2]),
	      b: parseInt(match[3])
	    };
	  }
	}
	
	// direction: 'l' | 'r', default is 'r'
	// num: how many times to loop, should be a positive integer
	function loopArray(arr, num, direction) {
	  if (!isArray(arr)) {
	    return;
	  }
	  let isLeft = (direction + '').toLowerCase() === 'l';
	  const len = arr.length;
	  num = num % len;
	  if (num < 0) {
	    num = -num;
	    isLeft = !isLeft;
	  }
	  if (num === 0) {
	    return arr;
	  }
	  let lp, rp;
	  if (isLeft) {
	    lp = arr.slice(0, num);
	    rp = arr.slice(num);
	  } else {
	    lp = arr.slice(0, len - num);
	    rp = arr.slice(len - num);
	  }
	  return rp.concat(lp);
	}
	
	module.exports = {
	  extend: extend,
	  isArray: isArray,
	  isPlainObject: isPlainObject,
	  getType: getType,
	  appendStyle: appendStyle,
	  getUniqueFromArray: getUniqueFromArray,
	  transitionize: transitionize,
	  detectWebp: detectWebp,
	  getRandom: getRandom,
	  getRgb: getRgb,
	  loopArray: loopArray
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	// const extend = require('./utils').extend
	
	const isArray = __webpack_require__(8).isArray;
	// const ComponentManager = require('./componentManager')
	
	// for jsframework to register modules.
	const _registerModules = function (config) {
	  if (isArray(config)) {
	    for (let i = 0, l = config.length; i < l; i++) {
	      window.registerModules(config[i]);
	    }
	  } else {
	    window.registerModules(config);
	  }
	};
	
	const protocol = {
	
	  // weex instances
	  _instances: {},
	
	  // api meta info
	  _meta: {},
	
	  // Weex.registerApiModule used this to register and access apiModules.
	  apiModule: {},
	
	  injectWeexInstance: function (instance) {
	    this._instances[instance.instanceId] = instance;
	  },
	
	  getWeexInstance: function (instanceId) {
	    return this._instances[instanceId];
	  },
	
	  // get the api method meta info array for the module.
	  getApiModuleMeta: function (moduleName) {
	    const metaObj = {};
	    metaObj[moduleName] = this._meta[moduleName];
	    return metaObj;
	  },
	
	  // Set meta info for a api module.
	  // If there is a same named api, just replace it.
	  // opts:
	  // - metaObj: meta object like
	  // {
	  //    dom: [{
	  //      name: 'addElement',
	  //      args: ['string', 'object']
	  //    }]
	  // }
	  setApiModuleMeta: function (metaObj) {
	    let moduleName;
	    for (const k in metaObj) {
	      if (metaObj.hasOwnProperty(k)) {
	        moduleName = k;
	      }
	    }
	    const metaArray = this._meta[moduleName];
	    if (!metaArray) {
	      this._meta[moduleName] = metaObj[moduleName];
	    } else {
	      const nameObj = {};
	      metaObj[moduleName].forEach(function (api) {
	        nameObj[api.name] = api;
	      });
	      metaArray.forEach(function (api, i) {
	        if (nameObj[api.name]) {
	          metaArray[i] = nameObj[api.name];
	          delete nameObj[api.name];
	        }
	      });
	      for (const k in metaObj) {
	        if (metaObj.hasOwnProperty(k)) {
	          metaArray.push(metaObj[k]);
	        }
	      }
	    }
	    this._meta[moduleName] = metaObj[moduleName];
	  },
	
	  // Set meta info for a single api.
	  // opts:
	  //  - moduleName: api module name.
	  //  - meta: a meta object like:
	  //  {
	  //    name: 'addElement',
	  //    args: ['string', 'object']
	  //  }
	  setApiMeta: function (moduleName, meta) {
	    const metaArray = this._meta[moduleName];
	    if (!metaArray) {
	      this._meta[moduleName] = [meta];
	    } else {
	      let metaIdx = -1;
	      metaArray.forEach(function (api, i) {
	        let name; // todo
	        if (meta.name === name) {
	          metaIdx = i;
	        }
	      });
	      if (metaIdx !== -1) {
	        metaArray[metaIdx] = meta;
	      } else {
	        metaArray.push(meta);
	      }
	    }
	  }
	};
	
	_registerModules([{
	  modal: [{
	    name: 'toast',
	    args: ['object', 'function']
	  }, {
	    name: 'alert',
	    args: ['object', 'function']
	  }, {
	    name: 'confirm',
	    args: ['object', 'function']
	  }, {
	    name: 'prompt',
	    args: ['object', 'function']
	  }]
	}, {
	  animation: [{
	    name: 'transition',
	    args: ['string', 'object', 'function']
	  }]
	}]);
	
	module.exports = protocol;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* global Event */
	
	'use strict';
	
	const FrameUpdater = __webpack_require__(11);
	const AppearWatcher = __webpack_require__(12);
	const utils = __webpack_require__(8);
	const LazyLoad = __webpack_require__(13);
	const animation = __webpack_require__(16);
	
	const RENDERING_INDENT = 800;
	
	const _instanceMap = {};
	const typeMap = {};
	const scrollableTypes = ['scroller', 'hscroller', 'vscroller', 'list', 'hlist', 'vlist'];
	
	function ComponentManager(instance) {
	  this.instanceId = instance.instanceId;
	  this.weexInstance = instance;
	  this.componentMap = {};
	  _instanceMap[this.instanceId] = this;
	}
	
	ComponentManager.getInstance = function (instanceId) {
	  return _instanceMap[instanceId];
	};
	
	ComponentManager.getWeexInstance = function (instanceId) {
	  return _instanceMap[instanceId].weexInstance;
	};
	
	ComponentManager.registerComponent = function (type, definition) {
	  typeMap[type] = definition;
	};
	
	ComponentManager.getScrollableTypes = function () {
	  return scrollableTypes;
	};
	
	ComponentManager.prototype = {
	
	  // Fire a event 'renderbegin'/'renderend' on body element.
	  rendering: function () {
	    function _renderingEnd() {
	      // get weex instance root
	      window.dispatchEvent(new Event('renderend'));
	      this._renderingTimer = null;
	    }
	    if (this._renderingTimer) {
	      clearTimeout(this._renderingTimer);
	      this._renderingTimer = setTimeout(_renderingEnd.bind(this), RENDERING_INDENT);
	    } else {
	      window.dispatchEvent(new Event('renderbegin'));
	      this._renderingTimer = setTimeout(_renderingEnd.bind(this), RENDERING_INDENT);
	    }
	  },
	
	  getElementByRef: function (ref) {
	    return this.componentMap[ref];
	  },
	
	  removeElementByRef: function (ref) {
	    const self = this;
	    if (!ref || !this.componentMap[ref]) {
	      return;
	    }
	    // remove from this.componentMap cursively
	    (function _removeCursively(_ref) {
	      const child = self.componentMap[_ref];
	      const listeners = child._listeners;
	      const children = child.data.children;
	      if (children && children.length) {
	        for (let i = 0, l = children.length; i < l; i++) {
	          _removeCursively(children[i].ref);
	        }
	      }
	      // remove events from _ref component
	      if (listeners) {
	        for (const type in listeners) {
	          child.node.removeEventListener(type, listeners[type]);
	        }
	      }
	      delete child._listeners;
	      delete child.node._listeners;
	      // remove _ref component
	      delete self.componentMap[_ref];
	    })(ref);
	  },
	
	  createElement: function (data, nodeType) {
	    let ComponentType = typeMap[data.type];
	    if (!ComponentType) {
	      ComponentType = typeMap['container'];
	    }
	
	    const ref = data.ref;
	    const component = new ComponentType(data, nodeType);
	
	    this.componentMap[ref] = component;
	    component.node.setAttribute('data-ref', ref);
	
	    return component;
	  },
	
	  /**
	   * createBody: generate root component
	   * @param  {object} element
	   */
	  createBody: function (element) {
	    // TODO: creatbody on document.body
	    // no need to create a extra div
	    if (this.componentMap['_root']) {
	      return;
	    }
	
	    const nodeType = element.type;
	    element.type = 'root';
	    element.rootId = this.weexInstance.rootId;
	    element.ref = '_root';
	
	    const root = this.createElement(element, nodeType);
	    const body = document.querySelector('#' + this.weexInstance.rootId) || document.body;
	    body.appendChild(root.node);
	    root._appended = true;
	
	    this.handleAppend(root);
	  },
	
	  appendChild: function (parentRef, data) {
	    let parent = this.componentMap[parentRef];
	
	    if (this.componentMap[data.ref] || !parent) {
	      return;
	    }
	
	    if (parentRef === '_root' && !parent) {
	      parent = this.createElement({
	        type: 'root',
	        rootId: this.weexInstance.rootId,
	        ref: '_root'
	      });
	      parent._appended = true;
	    }
	
	    const child = parent.appendChild(data);
	
	    // In some parent component the implementation of method
	    // appendChild didn't return the component at all, therefor
	    // child maybe a undefined object.
	    if (child) {
	      child.parentRef = parentRef;
	    }
	
	    if (child && parent._appended) {
	      this.handleAppend(child);
	    }
	  },
	
	  appendChildren: function (ref, elements) {
	    for (let i = 0; i < elements.length; i++) {
	      this.appendChild(ref, elements[i]);
	    }
	  },
	
	  removeElement: function (ref) {
	    const component = this.componentMap[ref];
	
	    // fire event for rendering dom on body elment.
	    this.rendering();
	
	    if (component && component.parentRef) {
	      const parent = this.componentMap[component.parentRef];
	      component.onRemove && component.onRemove();
	      parent.removeChild(component);
	    } else {
	      console.warn('ref: ', ref);
	    }
	  },
	
	  moveElement: function (ref, parentRef, index) {
	    const component = this.componentMap[ref];
	    const newParent = this.componentMap[parentRef];
	    const oldParentRef = component.parentRef;
	    let children, before, i, l;
	    if (!component || !newParent) {
	      console.warn('ref: ', ref);
	      return;
	    }
	
	    // fire event for rendering.
	    this.rendering();
	
	    if (index < -1) {
	      index = -1;
	      console.warn('index cannot be less than -1.');
	    }
	
	    children = newParent.data.children;
	    if (children && children.length && index !== -1 && index < children.length) {
	      before = this.componentMap[newParent.data.children[index].ref];
	    }
	
	    // remove from oldParent.data.children
	    if (oldParentRef && this.componentMap[oldParentRef]) {
	      children = this.componentMap[oldParentRef].data.children;
	      if (children && children.length) {
	        for (i = 0, l = children.length; i < l; i++) {
	          if (children[i].ref === ref) {
	            break;
	          }
	        }
	        if (l > i) {
	          children.splice(i, 1);
	        }
	      }
	    }
	
	    newParent.insertBefore(component, before);
	
	    component.onMove && component.onMove(parentRef, index);
	  },
	
	  insertBefore: function (ref, data) {
	    let child, parent;
	    const before = this.componentMap[ref];
	    child = this.componentMap[data.ref];
	    before && (parent = this.componentMap[before.parentRef]);
	    if (child || !parent || !before) {
	      return;
	    }
	
	    child = this.createElement(data);
	    if (child) {
	      child.parentRef = before.parentRef;
	      parent.insertBefore(child, before);
	    } else {
	      return;
	    }
	
	    if (this.componentMap[before.parentRef]._appended) {
	      this.handleAppend(child);
	    }
	  },
	
	  /**
	   * addElement
	   * If index is larget than any child's index, the
	   * element will be appended behind.
	   * @param {string} parentRef
	   * @param {obj} element (data of the component)
	   * @param {number} index
	   */
	  addElement: function (parentRef, element, index) {
	    // fire event for rendering dom on body elment.
	    this.rendering();
	
	    const parent = this.componentMap[parentRef];
	    if (!parent) {
	      return;
	    }
	    const children = parent.data.children;
	    // -1 means append as the last.
	    if (index < -1) {
	      index = -1;
	      console.warn('index cannot be less than -1.');
	    }
	    if (children && children.length && children.length > index && index !== -1) {
	      this.insertBefore(children[index].ref, element);
	    } else {
	      this.appendChild(parentRef, element);
	    }
	  },
	
	  clearChildren: function (ref) {
	    const component = this.componentMap[ref];
	    if (component) {
	      component.node.innerHTML = '';
	      if (component.data) {
	        component.data.children = null;
	      }
	    }
	  },
	
	  addEvent: function (ref, type, func) {
	    let component;
	    if (typeof ref === 'string' || typeof ref === 'number') {
	      component = this.componentMap[ref];
	    } else if (utils.getType(ref) === 'object') {
	      component = ref;
	      ref = component.data.ref;
	    }
	    if (component && component.node) {
	      const sender = this.weexInstance.sender;
	      const listener = function (e) {
	        // do stop bubbling.
	        // do not prevent default, otherwise the touchstart
	        // event will no longer trigger a click event
	        if (e._alreadyTriggered) {
	          return;
	        }
	        e._alreadyTriggered = true;
	        const evt = utils.extend({}, e);
	        evt.target = component.data;
	        sender.fireEvent(ref, type, func || {}, evt);
	      };
	      component.node.addEventListener(type, listener, false, false);
	      let listeners = component._listeners;
	      if (!listeners) {
	        listeners = component._listeners = {};
	        component.node._listeners = {};
	      }
	      listeners[type] = listener;
	      component.node._listeners[type] = listener;
	    }
	  },
	
	  removeEvent: function (ref, type) {
	    const component = this.componentMap[ref];
	    const listener = component._listeners[type];
	    if (component && listener) {
	      component.node.removeEventListener(type, listener);
	      component._listeners[type] = null;
	      component.node._listeners[type] = null;
	    }
	  },
	
	  updateAttrs: function (ref, attr) {
	    const component = this.componentMap[ref];
	    if (component) {
	      component.updateAttrs(attr);
	      if (component.data.type === 'image' && attr.src) {
	        LazyLoad.startIfNeeded(component);
	      }
	    }
	  },
	
	  updateStyle: function (ref, style) {
	    const component = this.componentMap[ref];
	    if (component) {
	      component.updateStyle(style);
	    }
	  },
	
	  updateFullAttrs: function (ref, attr) {
	    const component = this.componentMap[ref];
	    if (component) {
	      component.clearAttr();
	      component.updateAttrs(attr);
	      if (component.data.type === 'image' && attr.src) {
	        LazyLoad.startIfNeeded(component);
	      }
	    }
	  },
	
	  updateFullStyle: function (ref, style) {
	    const component = this.componentMap[ref];
	    if (component) {
	      component.clearStyle();
	      component.updateStyle(style);
	    }
	  },
	
	  handleAppend: function (component) {
	    component._appended = true;
	    component.onAppend && component.onAppend();
	
	    // invoke onAppend on children recursively
	    const children = component.data.children;
	    if (children) {
	      for (let i = 0; i < children.length; i++) {
	        const child = this.componentMap[children[i].ref];
	        if (child) {
	          this.handleAppend(child);
	        }
	      }
	    }
	
	    // watch appear/disappear of the component if needed
	    AppearWatcher.watchIfNeeded(component);
	
	    // do lazyload if needed
	    LazyLoad.startIfNeeded(component);
	  },
	
	  transition: function (ref, config, callback) {
	    const component = this.componentMap[ref];
	    animation.transitionOnce(component, config, callback);
	  },
	
	  renderFinish: function () {
	    FrameUpdater.pause();
	  }
	};
	
	module.exports = ComponentManager;

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (calllback) {
	  setTimeout(calllback, 16);
	};
	
	let rafId;
	const observers = [];
	let paused = false;
	
	const FrameUpdater = {
	  start: function () {
	    if (rafId) {
	      return;
	    }
	
	    rafId = raf(function runLoop() {
	      if (!paused) {
	        for (let i = 0; i < observers.length; i++) {
	          observers[i]();
	        }
	        raf(runLoop);
	      }
	    });
	  },
	
	  isActive: function () {
	    return !paused;
	  },
	
	  pause: function () {
	    paused = true;
	    rafId = undefined;
	  },
	
	  resume: function () {
	    paused = false;
	    this.start();
	  },
	
	  addUpdateObserver: function (observeMethod) {
	    observers.push(observeMethod);
	  }
	};
	
	module.exports = FrameUpdater;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const utils = __webpack_require__(8);
	
	const componentsInScroller = [];
	const componentsOutOfScroller = [];
	let listened = false;
	let direction = 'up';
	let scrollY = 0;
	
	const AppearWatcher = {
	  watchIfNeeded: function (component) {
	    if (needWatch(component)) {
	      if (component.isInScrollable()) {
	        componentsInScroller.push(component);
	      } else {
	        componentsOutOfScroller.push(component);
	      }
	      if (!listened) {
	        listened = true;
	        // const handler = throttle(onScroll, 25)
	        const handler = throttle(onScroll, 100);
	        window.addEventListener('scroll', handler, false);
	      }
	    }
	  }
	};
	
	function needWatch(component) {
	  const events = component.data.event;
	  if (events && (events.indexOf('appear') !== -1 || events.indexOf('disappear') !== -1)) {
	    return true;
	  }
	  return false;
	}
	
	function onScroll(e) {
	  // If the scroll event is dispatched from a scrollable component
	  // implemented through scrollerjs, then the appear/disappear events
	  // should be treated specially by handleScrollerScroll.
	  if (e.originalType === 'scrolling') {
	    handleScrollerScroll(e);
	  } else {
	    handleWindowScroll();
	  }
	}
	
	function handleScrollerScroll(e) {
	  const cmps = componentsInScroller;
	  const len = cmps.length;
	  direction = e.direction;
	  for (let i = 0; i < len; i++) {
	    const component = cmps[i];
	    const appear = isComponentInScrollerAppear(component);
	    if (appear && !component._appear) {
	      component._appear = true;
	      fireEvent(component, 'appear');
	    } else if (!appear && component._appear) {
	      component._appear = false;
	      fireEvent(component, 'disappear');
	    }
	  }
	}
	
	function handleWindowScroll() {
	  const y = window.scrollY;
	  direction = y >= scrollY ? 'up' : 'down';
	  scrollY = y;
	
	  const len = componentsOutOfScroller.length;
	  if (len === 0) {
	    return;
	  }
	  for (let i = 0; i < len; i++) {
	    const component = componentsOutOfScroller[i];
	    const appear = isComponentInWindow(component);
	    if (appear && !component._appear) {
	      component._appear = true;
	      fireEvent(component, 'appear');
	    } else if (!appear && component._appear) {
	      component._appear = false;
	      fireEvent(component, 'disappear');
	    }
	  }
	}
	
	function isComponentInScrollerAppear(component) {
	  let parentScroller = component._parentScroller;
	  const cmpRect = component.node.getBoundingClientRect();
	  if (!isComponentInWindow(component)) {
	    return false;
	  }
	  while (parentScroller) {
	    const parentRect = parentScroller.node.getBoundingClientRect();
	    if (!(cmpRect.right > parentRect.left && cmpRect.left < parentRect.right && cmpRect.bottom > parentRect.top && cmpRect.top < parentRect.bottom)) {
	      return false;
	    }
	    parentScroller = parentScroller._parentScroller;
	  }
	  return true;
	}
	
	function isComponentInWindow(component) {
	  const rect = component.node.getBoundingClientRect();
	  return rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight;
	}
	
	function fireEvent(component, type) {
	  const evt = document.createEvent('HTMLEvents');
	  const data = { direction: direction };
	  evt.initEvent(type, false, false);
	  evt.data = data;
	  utils.extend(evt, data);
	  component.node.dispatchEvent(evt);
	}
	
	function throttle(func, wait) {
	  let context, args, result;
	  let timeout = null;
	  let previous = 0;
	  const later = function () {
	    previous = Date.now();
	    timeout = null;
	    result = func.apply(context, args);
	  };
	  return function () {
	    const now = Date.now();
	    const remaining = wait - (now - previous);
	    context = this;
	    args = arguments;
	    if (remaining <= 0) {
	      clearTimeout(timeout);
	      timeout = null;
	      previous = now;
	      result = func.apply(context, args);
	    } else if (!timeout) {
	      timeout = setTimeout(later, remaining);
	    }
	    return result;
	  };
	}
	
	module.exports = AppearWatcher;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* global lib */
	
	'use strict';
	
	__webpack_require__(14);
	
	let lazyloadTimer;
	
	const LazyLoad = {
	  makeImageLazy: function (image, src) {
	    image.removeAttribute('img-src');
	    image.removeAttribute('i-lazy-src');
	    image.removeAttribute('src');
	    image.setAttribute('img-src', src);
	    // should replace 'src' with 'img-src'. but for now lib.img.fire is
	    // not working for the situation that the appear event has been
	    // already triggered.
	    // image.setAttribute('src', src)
	    // image.setAttribute('img-src', src)
	    this.fire();
	  },
	
	  // we don't know when all image are appended
	  // just use setTimeout to do delay lazyload
	  //
	  // -- actually everytime we add a element or update styles,
	  // the component manager will call startIfNeed to fire
	  // lazyload once again in the handleAppend function. so there
	  // is no way that any image element can miss it. See source
	  // code in componentMangager.js.
	  startIfNeeded: function (component) {
	    const that = this;
	    if (component.data.type === 'image') {
	      if (!lazyloadTimer) {
	        lazyloadTimer = setTimeout(function () {
	          that.fire();
	          clearTimeout(lazyloadTimer);
	          lazyloadTimer = null;
	        }, 16);
	      }
	    }
	  },
	
	  loadIfNeeded: function (elementScope) {
	    const notPreProcessed = elementScope.querySelectorAll('[img-src]');
	    const that = this;
	    // image elements which have attribute 'i-lazy-src' were elements
	    // that had been preprocessed by lib-img-core, but not loaded yet, and
	    // must be loaded when 'appear' events were fired. It turns out the
	    // 'appear' event was not fired correctly in the css-translate-transition
	    // situation, so 'i-lazy-src' must be checked and lazyload must be
	    // fired manually.
	    const preProcessed = elementScope.querySelectorAll('[i-lazy-src]');
	    if (notPreProcessed.length > 0 || preProcessed.length > 0) {
	      that.fire();
	    }
	  },
	
	  // fire lazyload.
	  fire: function () {
	    lib.img.fire();
	  }
	
	};
	
	module.exports = LazyLoad;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/*
	    lib-img-adpter 
	    Author: kongshi.wl@alibaba-inc.com 
	    Date:   Dec,2015
	*/
	;
	
	(function (win, lib) {
	    __webpack_require__(15);
	
	    var adapter = {};
	    var appearInstance;
	    var runtimeFlags = {};
	
	    var config = {
	        'dataSrc': 'img-src', //指定图片地址的attribute名, 兼做lazy-class的作用
	        'lazyHeight': 0, //以此高度提前触发懒加载
	        'lazyWidth': 0 //以此宽度提前触发懒加载
	    };
	
	    function extendStrict(main, sub) {
	        var ret = {};
	        for (var k in main) {
	            if (main.hasOwnProperty(k)) {
	                ret[k] = sub.hasOwnProperty(k) ? sub[k] : main[k];
	            }
	        }
	        return ret;
	    }
	
	    function applySrc(item, processedSrc) {
	        if (!processedSrc) {
	            return;
	        }
	        if (item.nodeName.toUpperCase() == 'IMG') {
	            item.setAttribute('src', processedSrc);
	        } else {
	            item.style.backgroundImage = 'url("' + processedSrc + '")';
	        }
	    }
	
	    function init() {
	        appearInstance = lib.appear.init({
	            cls: 'imgtmp', //可选，需要遍历的元素
	            once: true, //可选，是否只触发一次
	            x: config.lazyWidth, //可选，容器右边距离x以内的元素加载，默认为0
	            y: config.lazyHeight, //可选，容器底部距离y以内的元素加载，默认为0
	            onAppear: function (evt) {
	                var item = this;
	                applySrc(item, item.getAttribute('i-lazy-src'));
	                item.removeAttribute('i-lazy-src');
	            }
	        });
	    }
	
	    adapter.logConfig = function () {
	        console.log('lib-img Config\n', config);
	    };
	
	    adapter.fire = function () {
	
	        if (!appearInstance) {
	            init();
	        }
	
	        var label = 'i_' + Date.now() % 100000;
	        var domList = document.querySelectorAll('[' + config.dataSrc + ']');
	
	        [].forEach.call(domList, function (item) {
	            if (item.dataset.lazy == 'false' && item.dataset.lazy != 'true') {
	                applySrc(item, processSrc(item, item.getAttribute(config.dataSrc)));
	            } else {
	                item.classList.add(label);
	                item.setAttribute('i-lazy-src', item.getAttribute(config.dataSrc));
	            }
	            item.removeAttribute(config.dataSrc);
	        });
	
	        appearInstance.bind('.' + label);
	        appearInstance.fire();
	    };
	
	    adapter.defaultSrc = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==';
	
	    lib.img = adapter;
	
	    module.exports = adapter;
	})(window, window['lib'] || (window['lib'] = {}));

/***/ },
/* 15 */
/***/ function(module, exports) {

	;
	(function (win, lib) {
	  var doc = document;
	  var appearEvt;
	  var disappearEvt;
	
	  function createEvent() {
	    appearEvt = doc.createEvent("HTMLEvents"); //创建自定义显示事件  
	    disappearEvt = doc.createEvent("HTMLEvents"); //创建自定义消失事件  
	    appearEvt.initEvent('_appear', false, true);
	    disappearEvt.initEvent('_disappear', false, true);
	  }
	
	  /**
	   * [throttle 节流函数]
	   * @param  {[function]} func [执行函数]
	   * @param  {[int]} wait [等待时长]
	   * @return {[type]}      [description]
	   */
	  function throttle(func, wait) {
	    var latest = Date.now(),
	        previous = 0,
	        //上次执行的时间
	    timeout = null,
	        //setTimout任务
	    context,
	        //上下文
	    args,
	        //参数
	    result; //结果
	    var later = function () {
	      previous = Date.now();
	      timeout = null; //清空计时器
	      func.apply(context, args);
	    };
	    return function () {
	      var now = Date.now();
	      context = this;
	      args = arguments;
	
	      var remaining = wait - (now - previous);
	      if (remaining <= 0 || remaining >= wait) {
	        //如果没有剩余时间，或者存在修改过系统时间导致剩余时间增大的情况，则执行
	        clearTimeout(timeout);
	        timeout = null;
	        result = func.apply(context, args);
	      } else if (timeout == null) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  }
	
	  /**
	   * [getOffset 获取边距尺寸]
	   * @param  {[type]} el   [description]
	   * @param  {[type]} param [description]
	   * @return {[type]}       [description]
	   */
	  function getOffset(el, param) {
	    var el, l, r, b, t;
	    if (!el) {
	      return;
	    }
	    if (!param) {
	      param = { x: 0, y: 0 };
	    }
	
	    if (el != window) {
	      el = el.getBoundingClientRect();
	      l = el.left;
	      t = el.top;
	      r = el.right;
	      b = el.bottom;
	    } else {
	      l = 0;
	      t = 0;
	      r = l + el.innerWidth;
	      b = t + el.innerHeight;
	    }
	    return {
	      'left': l,
	      'top': t,
	      'right': r + param.x,
	      'bottom': b + param.y
	    };
	  }
	  //元素位置比较
	  function compareOffset(d1, d2) {
	    var left = d2.right > d1.left && d2.left < d1.right;
	    var top = d2.bottom > d1.top && d2.top < d1.bottom;
	    return left && top;
	  }
	  //获取移动方向
	  function getDirection(beforeOffset, nowOffset) {
	    var direction = 'none';
	    var horizental = beforeOffset.left - nowOffset.left;
	    var vertical = beforeOffset.top - nowOffset.top;
	    if (vertical == 0) {
	      if (horizental != 0) {
	        direction = horizental > 0 ? 'left' : 'right';
	      } else {
	        direction = 'none';
	      }
	    }
	    if (horizental == 0) {
	      if (vertical != 0) {
	        direction = vertical > 0 ? 'up' : 'down';
	      } else {
	        direction = 'none';
	      }
	    }
	    return direction;
	  }
	
	  function extend(target, el) {
	    for (var k in el) {
	      if (el.hasOwnProperty(k)) {
	        target[k] = el[k];
	      }
	    }
	    return target;
	  }
	
	  /**
	   * [__bindEvent 绑定事件，包括滚动、touchmove、transform、resize等]
	   * @return {[type]}      [description]
	   */
	  function __bindEvent() {
	    var self = this;
	    var handle = throttle(function () {
	      __fire.apply(self, arguments);
	    }, this.options.wait);
	    if (this.__handle) {
	      //避免重复绑定
	      this.container.removeEventListener('scroll', this.__handle);
	      this.__handle = null;
	    }
	    this.__handle = handle;
	    this.container.addEventListener('scroll', handle, false);
	    this.container.addEventListener('resize', function (ev) {
	      __fire.apply(self, arguments);
	    }, false);
	    this.container.addEventListener('animationEnd', function () {
	      __fire.apply(self, arguments);
	    }, false);
	    // android4.0以下
	    this.container.addEventListener('webkitAnimationEnd', function () {
	      __fire.apply(self, arguments);
	    }, false);
	    this.container.addEventListener('transitionend', function () {
	      __fire.apply(self, arguments);
	    }, false);
	  }
	
	  //获取容器内所有的加载元素
	  function __getElements(selector) {
	    var self = this;
	    //获取容器
	    var container = this.options.container;
	    if (typeof container == 'string') {
	      //如果是字符串，则选择器
	      this.container = doc.querySelector(container);
	    } else {
	      //对象传值
	      this.container = container;
	    }
	    //获取容器内的所有目标元素
	    if (this.container == window) {
	      var appearWatchElements = doc.querySelectorAll(selector);
	    } else {
	      var appearWatchElements = this.container.querySelectorAll(selector);
	    }
	    var appearWatchElements = [].slice.call(appearWatchElements, null);
	
	    appearWatchElements = appearWatchElements.filter(function (ele) {
	      // 如果已经绑定过，清除appear状态，不再加入到数组里
	      if (ele.dataset['bind'] == '1') {
	        delete ele._hasAppear;
	        delete ele._hasDisAppear;
	        delete ele._appear;
	        ele.classList.remove(self.options.cls);
	        return false;
	      } else {
	        return true;
	      }
	    });
	
	    return appearWatchElements;
	  }
	
	  function __initBoundingRect(elements) {
	    var self = this;
	    if (elements && elements.length > 0) {
	      [].forEach.call(elements, function (ele) {
	        ele._eleOffset = getOffset(ele);
	        //移除类名
	        ele.classList.remove(self.options.cls);
	        // 标志已经绑定
	        ele.dataset['bind'] = 1;
	      });
	    }
	  }
	
	  // 触发加载
	  function __fire() {
	    var container = this.container,
	        elements = this.appearWatchElements,
	        appearCallback = this.options.onAppear,
	        //appear的执行函数
	    disappearCallback = this.options.onDisappear,
	        //disappear的执行函数
	    containerOffset = getOffset(container, {
	      x: this.options.x,
	      y: this.options.y
	    }),
	        isOnce = this.options.once,
	        //是否只执行一次
	    ev = arguments[0] || {};
	    if (elements && elements.length > 0) {
	      [].forEach.call(elements, function (ele, i) {
	        //获取左右距离
	        var eleOffset = getOffset(ele);
	        var direction = getDirection(ele._eleOffset, eleOffset);
	        //保存上个时段的位置信息
	        ele._eleOffset = eleOffset;
	        //查看是否在可视区域范围内
	        var isInView = compareOffset(containerOffset, eleOffset);
	        var appear = ele._appear;
	        var _hasAppear = ele._hasAppear;
	        var _hasDisAppear = ele._hasDisAppear;
	        appearEvt.data = {
	          direction: direction
	        };
	        disappearEvt.data = {
	          direction: direction
	        };
	        if (isInView && !appear) {
	          if (isOnce && !_hasAppear || !isOnce) {
	            //如果只触发一次并且没有触发过或者允许触发多次
	            //如果在可视区域内，并且是从disppear进入appear，则执行回调
	            appearCallback && appearCallback.call(ele, ev);
	            //触发自定义事件
	            ele.dispatchEvent(appearEvt);
	            ele._hasAppear = true;
	            ele._appear = true;
	          }
	        } else if (!isInView && appear) {
	          if (isOnce && !_hasDisAppear || !isOnce) {
	            //如果不在可视区域内，并且是从appear进入disappear，执行disappear回调
	            disappearCallback && disappearCallback.call(ele, ev);
	            //触发自定义事件
	            ele.dispatchEvent(disappearEvt);
	            ele._hasDisAppear = true;
	            ele._appear = false;
	          }
	        }
	      });
	    }
	  }
	
	  // proto = extend(proto, listener);
	
	  function __init(opts) {
	    //扩展参数
	    extend(this.options, opts || (opts = {}));
	    //获取目标元素
	    this.appearWatchElements = this.appearWatchElements || __getElements.call(this, '.' + this.options.cls);
	    //初始化位置信息
	    __initBoundingRect.call(this, this.appearWatchElements);
	    //绑定事件
	    __bindEvent.call(this);
	  }
	
	  var Appear = function () {
	    __init.apply(this, arguments);
	  };
	
	  var appear = {
	    instances: [],
	    init: function (opts) {
	      var proto = {
	        //默认参数
	        options: {
	          container: window,
	          wait: 100,
	          x: 0,
	          y: 0,
	          cls: 'lib-appear',
	          once: false,
	          onReset: function () {},
	          onAppear: function () {},
	          onDisappear: function () {}
	        },
	        container: null,
	        appearWatchElements: null,
	        bind: function (node) {
	          var cls = this.options.cls;
	          // 添加需要绑定的appear元素
	          if (typeof node == 'string') {
	            var elements = __getElements.call(this, node);
	            [].forEach.call(elements, function (ele, i) {
	              if (!ele.classList.contains(cls)) {
	                ele.classList.add(cls);
	              }
	            });
	          } else if (node.nodeType == 1 && this.container.contains(node)) {
	            //如果传入的是元素并且在包含在容器中，直接添加类名
	            if (!node.classList.contains(cls)) {
	              //添加类名
	              node.classList.add(cls);
	            }
	          } else {
	            return this;
	          }
	          //新增的子元素
	          var newElements = __getElements.call(this, '.' + this.options.cls);
	          //对缓存的子元素做增量
	          this.appearWatchElements = this.appearWatchElements.concat(newElements);
	          //初始化新子元素的位置信息
	          __initBoundingRect.call(this, newElements);
	          return this;
	        },
	        // 重置函数
	        reset: function (opts) {
	          __init.call(this, opts);
	          this.appearWatchElements.forEach(function (ele) {
	            delete ele._hasAppear;
	            delete ele._hasDisAppear;
	            delete ele._appear;
	          });
	          return this;
	        },
	        fire: function () {
	          if (!this.appearWatchElements) {
	            this.appearWatchElements = [];
	          }
	          var newElements = __getElements.call(this, '.' + this.options.cls);
	          this.appearWatchElements = this.appearWatchElements.concat(newElements);
	          //初始化位置信息
	          __initBoundingRect.call(this, newElements);
	          __fire.call(this);
	          return this;
	        }
	      };
	      Appear.prototype = proto;
	      var instance = new Appear(opts);
	      this.instances.push(instance);
	      return instance;
	    },
	    fireAll: function () {
	      var instances = this.instances;
	      instances.forEach(function (instance) {
	        instance.fire();
	      });
	    }
	  };
	  //注册事件
	  createEvent();
	
	  lib.appear = appear;
	})(window, window.lib || (window.lib = {}));

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = {
	
	  /**
	   * config:
	   *   - styles
	   *   - duration [Number] milliseconds(ms)
	   *   - timingFunction [string]
	   *   - dealy [Number] milliseconds(ms)
	   */
	  transitionOnce: function (comp, config, callback) {
	    const styles = config.styles || {};
	    const duration = config.duration || 1000; // ms
	    const timingFunction = config.timingFunction || 'ease';
	    const delay = config.delay || 0; // ms
	    const transitionValue = 'all ' + duration + 'ms ' + timingFunction + ' ' + delay + 'ms';
	    const dom = comp.node;
	    const transitionEndHandler = function (e) {
	      e.stopPropagation();
	      dom.removeEventListener('webkitTransitionEnd', transitionEndHandler);
	      dom.removeEventListener('transitionend', transitionEndHandler);
	      dom.style.transition = '';
	      dom.style.webkitTransition = '';
	      callback();
	    };
	    dom.style.transition = transitionValue;
	    dom.style.webkitTransition = transitionValue;
	    dom.addEventListener('webkitTransitionEnd', transitionEndHandler);
	    dom.addEventListener('transitionend', transitionEndHandler);
	    comp.updateStyle(styles);
	  }
	
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* global lib */
	
	'use strict';
	
	// const config = require('../config')
	
	const utils = __webpack_require__(8);
	const ComponentManager = __webpack_require__(10);
	const flexbox = __webpack_require__(18);
	const valueFilter = __webpack_require__(19);
	__webpack_require__(20);
	
	function Component(data, nodeType) {
	  this.data = data;
	  this.node = this.create(nodeType);
	
	  this.createChildren();
	  this.updateAttrs(this.data.attr);
	  // issue: when add element to a list in lifetime hook 'ready', the
	  // styles is set to the classStyle, not style. This is a issue
	  // that jsframework should do something about.
	  const classStyle = this.data.classStyle;
	  classStyle && this.updateStyle(this.data.classStyle);
	  this.updateStyle(this.data.style);
	  this.bindEvents(this.data.event);
	}
	
	Component.prototype = {
	
	  create: function (nodeType) {
	    const node = document.createElement(nodeType || 'div');
	    return node;
	  },
	
	  getComponentManager: function () {
	    return ComponentManager.getInstance(this.data.instanceId);
	  },
	
	  getParent: function () {
	    return this.getComponentManager().componentMap[this.parentRef];
	  },
	
	  getParentScroller: function () {
	    if (this.isInScrollable()) {
	      return this._parentScroller;
	    }
	    return null;
	  },
	
	  getRootScroller: function () {
	    if (this.isInScrollable()) {
	      let scroller = this._parentScroller;
	      let parent = scroller._parentScroller;
	      while (parent) {
	        scroller = parent;
	        parent = scroller._parentScroller;
	      }
	      return scroller;
	    }
	    return null;
	  },
	
	  getRootContainer: function () {
	    const root = this.getComponentManager().weexInstance.getRoot() || document.body;
	    return root;
	  },
	
	  isScrollable: function () {
	    const t = this.data.type;
	    return ComponentManager.getScrollableTypes().indexOf(t) !== -1;
	  },
	
	  isInScrollable: function () {
	    if (typeof this._isInScrollable === 'boolean') {
	      return this._isInScrollable;
	    }
	    const parent = this.getParent();
	    if (parent && typeof parent._isInScrollable !== 'boolean' && !parent.isScrollable()) {
	      if (parent.data.ref === '_root') {
	        this._isInScrollable = false;
	        return false;
	      }
	      this._isInScrollable = parent.isInScrollable();
	      this._parentScroller = parent._parentScroller;
	      return this._isInScrollable;
	    }
	    if (parent && typeof parent._isInScrollable === 'boolean') {
	      this._isInScrollable = parent._isInScrollable;
	      this._parentScroller = parent._parentScroller;
	      return this._isInScrollable;
	    }
	    if (parent && parent.isScrollable()) {
	      this._isInScrollable = true;
	      this._parentScroller = parent;
	      return true;
	    }
	    if (!parent) {
	      console && console.error('isInScrollable - parent not exist.');
	      return;
	    }
	  },
	
	  createChildren: function () {
	    const children = this.data.children;
	    const parentRef = this.data.ref;
	    const componentManager = this.getComponentManager();
	    if (children && children.length) {
	      const fragment = document.createDocumentFragment();
	      let isFlex = false;
	      for (let i = 0; i < children.length; i++) {
	        children[i].instanceId = this.data.instanceId;
	        children[i].scale = this.data.scale;
	        const child = componentManager.createElement(children[i]);
	        fragment.appendChild(child.node);
	        child.parentRef = parentRef;
	        if (!isFlex && child.data.style && child.data.style.hasOwnProperty('flex')) {
	          isFlex = true;
	        }
	      }
	      this.node.appendChild(fragment);
	    }
	  },
	
	  // @todo: changed param data to child
	  appendChild: function (data) {
	    const children = this.data.children;
	    const componentManager = this.getComponentManager();
	    const child = componentManager.createElement(data);
	    this.node.appendChild(child.node);
	    // update this.data.children
	    if (!children || !children.length) {
	      this.data.children = [data];
	    } else {
	      children.push(data);
	    }
	
	    return child;
	  },
	
	  insertBefore: function (child, before) {
	    const children = this.data.children;
	    let i = 0;
	    let l;
	    let isAppend = false;
	
	    // update this.data.children
	    if (!children || !children.length || !before) {
	      isAppend = true;
	    } else {
	      for (l = children.length; i < l; i++) {
	        if (children[i].ref === before.data.ref) {
	          break;
	        }
	      }
	      if (i === l) {
	        isAppend = true;
	      }
	    }
	
	    if (isAppend) {
	      this.node.appendChild(child.node);
	      children.push(child.data);
	    } else {
	      if (before.fixedPlaceholder) {
	        this.node.insertBefore(child.node, before.fixedPlaceholder);
	      } else {
	        this.node.insertBefore(child.node, before.node);
	      }
	      children.splice(i, 0, child.data);
	    }
	  },
	
	  removeChild: function (child) {
	    const children = this.data.children;
	    // remove from this.data.children
	    let i = 0;
	    const componentManager = this.getComponentManager();
	    if (children && children.length) {
	      let l;
	      for (l = children.length; i < l; i++) {
	        if (children[i].ref === child.data.ref) {
	          break;
	        }
	      }
	      if (i < l) {
	        children.splice(i, 1);
	      }
	    }
	    // remove from componentMap recursively
	    componentManager.removeElementByRef(child.data.ref);
	    if (child.fixedPlaceholder) {
	      this.node.removeChild(child.fixedPlaceholder);
	    }
	    child.node.parentNode.removeChild(child.node);
	  },
	
	  updateAttrs: function (attrs) {
	    // Note：attr must be injected into the dom element because
	    // it will be accessed from the outside developer by event.target.attr.
	    if (!this.node.attr) {
	      this.node.attr = {};
	    }
	    for (const key in attrs) {
	      const value = attrs[key];
	      const attrSetter = this.attr[key];
	      if (typeof attrSetter === 'function') {
	        attrSetter.call(this, value);
	      } else {
	        if (typeof value === 'boolean') {
	          this.node[key] = value;
	        } else {
	          this.node.setAttribute(key, value);
	        }
	        this.node.attr[key] = value;
	      }
	    }
	  },
	
	  updateStyle: function (style) {
	    for (const key in style) {
	      let value = style[key];
	      const styleSetter = this.style[key];
	      if (typeof styleSetter === 'function') {
	        styleSetter.call(this, value);
	        continue;
	      }
	      const parser = valueFilter.getFilters(key, { scale: this.data.scale })[typeof value];
	      if (typeof parser === 'function') {
	        value = parser(value);
	      }
	      this.node.style[key] = value;
	    }
	  },
	
	  bindEvents: function (evts) {
	    const componentManager = this.getComponentManager();
	    if (evts && utils.isArray(evts)) {
	      for (let i = 0, l = evts.length; i < l; i++) {
	        const evt = evts[i];
	        const func = this.event[evt] || {};
	        const setter = func.setter;
	        if (setter) {
	          this.node.addEventListener(evt, setter);
	          continue;
	        }
	        componentManager.addEvent(this, evt, func && {
	          extra: func.extra && func.extra.bind(this),
	          updator: func.updator && func.updator.bind(this)
	        });
	      }
	    }
	  },
	
	  // dispatch a specified event on this.node
	  //  - type: event type
	  //  - data: event data
	  //  - config: event config object
	  //     - bubbles
	  //     - cancelable
	  dispatchEvent: function (type, data, config) {
	    const event = document.createEvent('HTMLEvents');
	    config = config || {};
	    event.initEvent(type, config.bubbles || false, config.cancelable || false);
	    !data && (data = {});
	    event.data = utils.extend({}, data);
	    utils.extend(event, data);
	    this.node.dispatchEvent(event);
	  },
	
	  updateRecursiveAttr: function (data) {
	    this.updateAttrs(data.attr);
	    const componentManager = this.getComponentManager();
	    const children = this.data.children;
	    if (children) {
	      for (let i = 0; i < children.length; i++) {
	        const child = componentManager.getElementByRef(children[i].ref);
	        if (child) {
	          child.updateRecursiveAttr(data.children[i]);
	        }
	      }
	    }
	  },
	
	  updateRecursiveStyle: function (data) {
	    this.updateStyle(data.style);
	    const componentManager = this.getComponentManager();
	    const children = this.data.children;
	    if (children) {
	      for (let i = 0; i < children.length; i++) {
	        const child = componentManager.getElementByRef(children[i].ref);
	        if (child) {
	          child.updateRecursiveStyle(data.children[i]);
	        }
	      }
	    }
	  },
	
	  updateRecursiveAll: function (data) {
	    this.updateAttrs(data.attr);
	    this.updateStyle(data.style);
	    const componentManager = this.getComponentManager();
	
	    // const oldRef = this.data.ref
	    // if (componentMap[oldRef]) {
	    //   delete componentMap[oldRef]
	    // }
	    // this.data.ref = data.ref
	    // componentMap[data.ref] = this
	
	    const children = this.data.children;
	    if (children) {
	      for (let i = 0; i < children.length; i++) {
	        const child = componentManager.getElementByRef(children[i].ref);
	        if (child) {
	          child.updateRecursiveAll(data.children[i]);
	        }
	      }
	    }
	  },
	
	  attr: {}, // attr setters
	
	  style: Object.create(flexbox), // style setters
	
	  // event funcs
	  //  - 1. 'updator' for updating attrs or styles with out triggering messages.
	  //  - 2. 'extra' for binding extra data.
	  //  - 3. 'setter' set a specified event handler.
	  // funcs should be functions like this: (take 'change' event as a example)
	  // {
	  //   change: {
	  //     updator () {
	  //       return {
	  //         attrs: {
	  //           checked: this.checked
	  //         }
	  //       }
	  //     },
	  //     extra () {
	  //       return {
	  //         value: this.checked
	  //       }
	  //     }
	  //   }
	  // }
	  event: {},
	
	  clearAttr: function () {},
	
	  clearStyle: function () {
	    this.node.cssText = '';
	  }
	};
	
	Component.prototype.style.position = function (value) {
	  // For the elements who are fixed elements before, now
	  // are not fixed: the fixedPlaceholder has to be replaced
	  // by this element.
	  // This is a peace of hacking to fix the problem about
	  // mixing fixed and transform. See 'http://stackoverflo
	  // w.com/questions/15194313/webkit-css-transform3d-posi
	  // tion-fixed-issue' for more info.
	  if (value !== 'fixed') {
	    if (this.fixedPlaceholder) {
	      const parent = this.fixedPlaceholder.parentNode;
	      parent.insertBefore(this.node, this.fixedPlaceholder);
	      parent.removeChild(this.fixedPlaceholder);
	      this.fixedPlaceholder = null;
	    }
	  } else {
	    // value === 'fixed'
	    // For the elements who are fixed: this fixedPlaceholder
	    // shoud be inserted, and the fixed element itself should
	    // be placed out in root container.
	    this.node.style.position = 'fixed';
	    let parent = this.node.parentNode;
	    const replaceWithFixedPlaceholder = function () {
	      this.fixedPlaceholder = document.createElement('div');
	      this.fixedPlaceholder.classList.add('weex-fixed-placeholder');
	      this.fixedPlaceholder.style.display = 'none';
	      this.fixedPlaceholder.style.width = '0px';
	      this.fixedPlaceholder.style.height = '0px';
	      parent.insertBefore(this.fixedPlaceholder, this.node);
	      this.getRootContainer().appendChild(this.node);
	    }.bind(this);
	    if (!parent) {
	      let pre;
	      if (this.onAppend) {
	        pre = this.onAppend.bind(this);
	      }
	      this.onAppend = function () {
	        parent = this.node.parentNode;
	        replaceWithFixedPlaceholder();
	        pre && pre();
	      }.bind(this);
	    } else {
	      replaceWithFixedPlaceholder();
	    }
	    return;
	  }
	
	  if (value === 'sticky') {
	    this.node.style.zIndex = 100;
	    setTimeout(function () {
	      const Sticky = lib.sticky;
	      this.sticky = new Sticky(this.node, {
	        top: 0
	      });
	    }.bind(this), 0);
	  } else {
	    this.node.style.position = value;
	  }
	};
	
	module.exports = Component;

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';
	
	// Flexbox polyfill
	
	const flexboxSetters = function () {
	  const BOX_ALIGN = {
	    stretch: 'stretch',
	    'flex-start': 'start',
	    'flex-end': 'end',
	    center: 'center'
	  };
	  const BOX_ORIENT = {
	    row: 'horizontal',
	    column: 'vertical'
	  };
	  const BOX_PACK = {
	    'flex-start': 'start',
	    'flex-end': 'end',
	    center: 'center',
	    'space-between': 'justify',
	    'space-around': 'justify' // Just same as `space-between`
	  };
	  return {
	    flex: function (value) {
	      this.node.style.webkitBoxFlex = value;
	      this.node.style.webkitFlex = value;
	      this.node.style.flex = value;
	    },
	    alignItems: function (value) {
	      this.node.style.webkitBoxAlign = BOX_ALIGN[value];
	      this.node.style.webkitAlignItems = value;
	      this.node.style.alignItems = value;
	    },
	    alignSelf: function (value) {
	      this.node.style.webkitAlignSelf = value;
	      this.node.style.alignSelf = value;
	    },
	    flexDirection: function (value) {
	      this.node.style.webkitBoxOrient = BOX_ORIENT[value];
	      this.node.style.webkitFlexDirection = value;
	      this.node.style.flexDirection = value;
	    },
	    justifyContent: function (value) {
	      this.node.style.webkitBoxPack = BOX_PACK[value];
	      this.node.style.webkitJustifyContent = value;
	      this.node.style.justifyContent = value;
	    }
	  };
	}();
	
	module.exports = flexboxSetters;

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';
	
	const NOT_PX_NUMBER_PROPERTIES = ['flex', 'opacity', 'zIndex', 'fontWeight'];
	
	const valueFilter = {
	
	  filterStyles: function (styles, config) {
	    for (const key in styles) {
	      const value = styles[key];
	      const parser = this.getFilters(key, config)[typeof value];
	      if (typeof parser === 'function') {
	        styles[key] = parser(value);
	      }
	    }
	  },
	
	  getFilters: function (key, config) {
	    if (NOT_PX_NUMBER_PROPERTIES.indexOf(key) !== -1) {
	      return {};
	    }
	    return {
	      number: function (val) {
	        return val * config.scale + 'px';
	      },
	      string: function (val) {
	        // string of a pure number or a number suffixed with a 'px' unit
	        if (val.match(/^\-?\d*\.?\d+(?:px)?$/)) {
	          return parseFloat(val) * config.scale + 'px';
	        }
	        if (key.match(/transform/) && val.match(/translate/)) {
	          return val.replace(/\d*\.?\d+px/g, function (match) {
	            return parseInt(parseFloat(match) * config.scale) + 'px';
	          });
	        }
	        return val;
	      }
	    };
	  }
	};
	
	module.exports = valueFilter;

/***/ },
/* 20 */
/***/ function(module, exports) {

	typeof window === 'undefined' && (window = { ctrl: {}, lib: {} });!window.ctrl && (window.ctrl = {});!window.lib && (window.lib = {});!function (a, b, c) {
	  function d(a) {
	    return null != a && "object" == typeof a && Object.getPrototypeOf(a) == Object.prototype;
	  }function e(a, b) {
	    var c,
	        d,
	        e,
	        f = null,
	        g = 0,
	        h = function () {
	      g = Date.now(), f = null, e = a.apply(c, d);
	    };return function () {
	      var i = Date.now(),
	          j = b - (i - g);return c = this, d = arguments, 0 >= j ? (clearTimeout(f), f = null, g = i, e = a.apply(c, d)) : f || (f = setTimeout(h, j)), e;
	    };
	  }function f(a) {
	    var b = "";return Object.keys(a).forEach(function (c) {
	      b += c + ":" + a[c] + ";";
	    }), b;
	  }function g(a, c) {
	    !c && d(a) && (c = a, a = c.element), c = c || {}, a.nodeType != b.ELEMENT_NODE && "string" == typeof a && (a = b.querySelector(a));var e = this;e.element = a, e.top = c.top || 0, e.withinParent = void 0 == c.withinParent ? !1 : c.withinParent, e.init();
	  }var h = a.parseInt,
	      i = navigator.userAgent,
	      j = !!i.match(/Firefox/i),
	      k = !!i.match(/IEMobile/i),
	      l = j ? "-moz-" : k ? "-ms-" : "-webkit-",
	      m = j ? "Moz" : k ? "ms" : "webkit",
	      n = function () {
	    var a = b.createElement("div"),
	        c = a.style;return c.cssText = "position:" + l + "sticky;position:sticky;", -1 != c.position.indexOf("sticky");
	  }();g.prototype = { constructor: g, init: function () {
	      var a = this,
	          b = a.element,
	          c = b.style;c[m + "Transform"] = "translateZ(0)", c.transform = "translateZ(0)", a._originCssText = c.cssText, n ? (c.position = l + "sticky", c.position = "sticky", c.top = a.top + "px") : (a._simulateSticky(), a._bindResize());
	    }, _bindResize: function () {
	      var b = this,
	          c = /android/gi.test(navigator.appVersion),
	          d = b._resizeEvent = "onorientationchange" in a ? "orientationchange" : "resize",
	          e = b._resizeHandler = function () {
	        setTimeout(function () {
	          b.refresh();
	        }, c ? 200 : 0);
	      };a.addEventListener(d, e, !1);
	    }, refresh: function () {
	      var a = this;n || (a._detach(), a._simulateSticky());
	    }, _addPlaceholder: function (a) {
	      var c,
	          d = this,
	          e = d.element,
	          g = a.position;if (-1 != ["static", "relative"].indexOf(g)) {
	        c = d._placeholderElement = b.createElement("div");var i = h(a.width) + h(a.marginLeft) + h(a.marginRight),
	            j = h(a.height);"border-box" != a.boxSizing && (i += h(a.borderLeftWidth) + h(a.borderRightWidth) + h(a.paddingLeft) + h(a.paddingRight), j += h(a.borderTopWidth) + h(a.borderBottomWidth) + h(a.paddingTop) + h(a.paddingBottom)), c.style.cssText = f({ display: "none", visibility: "hidden", width: i + "px", height: j + "px", margin: 0, "margin-top": a.marginTop, "margin-bottom": a.marginBottom, border: 0, padding: 0, "float": a["float"] || a.cssFloat }), e.parentNode.insertBefore(c, e);
	      }return c;
	    }, _simulateSticky: function () {
	      var c = this,
	          d = c.element,
	          g = c.top,
	          i = d.style,
	          j = d.getBoundingClientRect(),
	          k = getComputedStyle(d, ""),
	          l = d.parentNode,
	          m = getComputedStyle(l, ""),
	          n = c._addPlaceholder(k),
	          o = c.withinParent,
	          p = c._originCssText,
	          q = j.top - g + a.pageYOffset,
	          r = l.getBoundingClientRect().bottom - h(m.paddingBottom) - h(m.borderBottomWidth) - h(k.marginBottom) - j.height - g + a.pageYOffset,
	          s = p + f({ position: "fixed", top: g + "px", width: k.width, "margin-top": 0 }),
	          t = p + f({ position: "absolute", top: r + "px", width: k.width }),
	          u = 1,
	          v = c._scrollHandler = e(function () {
	        var b = a.pageYOffset;q > b ? 1 != u && (i.cssText = p, n && (n.style.display = "none"), u = 1) : !o && b >= q || o && b >= q && r > b ? 2 != u && (i.cssText = s, n && 3 != u && (n.style.display = "block"), u = 2) : o && 3 != u && (i.cssText = t, n && 2 != u && (n.style.display = "block"), u = 3);
	      }, 100);if (a.addEventListener("scroll", v, !1), a.pageYOffset >= q) {
	        var w = b.createEvent("HTMLEvents");w.initEvent("scroll", !0, !0), a.dispatchEvent(w);
	      }
	    }, _detach: function () {
	      var b = this,
	          c = b.element;if (c.style.cssText = b._originCssText, !n) {
	        var d = b._placeholderElement;d && c.parentNode.removeChild(d), a.removeEventListener("scroll", b._scrollHandler, !1);
	      }
	    }, destroy: function () {
	      var b = this;b._detach();var c = b.element.style;c.removeProperty(l + "transform"), c.removeProperty("transform"), n || a.removeEventListener(b._resizeEvent, b._resizeHandler, !1);
	    } }, c.sticky = g;
	}(window, document, window.lib || (window.lib = {}));;module.exports = window.lib['sticky'];

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const utils = __webpack_require__(8);
	
	const _senderMap = {};
	
	function Sender(instance) {
	  if (!(this instanceof Sender)) {
	    return new Sender(instance);
	  }
	  this.instanceId = instance.instanceId;
	  this.weexInstance = instance;
	  _senderMap[this.instanceId] = this;
	}
	
	function _send(instanceId, msg) {
	  callJS(instanceId, [msg]);
	}
	
	Sender.getSender = function (instanceId) {
	  return _senderMap[instanceId];
	};
	
	Sender.prototype = {
	
	  // perform a callback to jsframework.
	  performCallback: function (callbackId, data, keepAlive) {
	    const args = [callbackId];
	    data && args.push(data);
	    keepAlive && args.push(keepAlive);
	    _send(this.instanceId, {
	      method: 'callback',
	      args: args
	    });
	  },
	
	  fireEvent: function (ref, type, func, event) {
	    func.extra && utils.extend(event, func.extra());
	    _send(this.instanceId, {
	      method: 'fireEvent',
	      args: [ref, type, event, func.updator && func.updator()]
	    });
	  }
	
	};
	
	module.exports = Sender;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	const config = __webpack_require__(6);
	const utils = __webpack_require__(8);
	const protocol = __webpack_require__(9);
	const FrameUpdater = __webpack_require__(11);
	const Sender = __webpack_require__(21);
	
	const callQueue = [];
	// Need a task counter?
	// When FrameUpdater is not activated, tasks will not be push
	// into callQueue and there will be no trace for situation of
	// execution of tasks.
	
	// give 10ms for call handling, and rest 6ms for others
	const MAX_TIME_FOR_EACH_FRAME = 10;
	
	// callNative: jsFramework will call this method to talk to
	// this renderer.
	// params:
	//  - instanceId: string.
	//  - tasks: array of object.
	//  - callbackId: number.
	function callNative(instanceId, tasks, callbackId) {
	  let calls = [];
	  if (typeof tasks === 'string') {
	    try {
	      calls = JSON.parse(tasks);
	    } catch (e) {
	      console.error('invalid tasks:', tasks);
	    }
	  } else if (utils.isArray(tasks)) {
	    calls = tasks;
	  }
	  const len = calls.length;
	  calls[len - 1].callbackId = !callbackId && callbackId !== 0 ? -1 : callbackId;
	  // To solve the problem of callapp, the two-way time loop rule must
	  // be replaced by calling directly except the situation of page loading.
	  // 2015-11-03
	  for (let i = 0; i < len; i++) {
	    if (FrameUpdater.isActive()) {
	      callQueue.push({
	        instanceId: instanceId,
	        call: calls[i]
	      });
	    } else {
	      processCall(instanceId, calls[i]);
	    }
	  }
	}
	
	function processCallQueue() {
	  let len = callQueue.length;
	  if (len === 0) {
	    return;
	  }
	  const start = Date.now();
	  let elapsed = 0;
	
	  while (--len >= 0 && elapsed < MAX_TIME_FOR_EACH_FRAME) {
	    const callObj = callQueue.shift();
	    processCall(callObj.instanceId, callObj.call);
	    elapsed = Date.now() - start;
	  }
	}
	
	function processCall(instanceId, call) {
	  const moduleName = call.module;
	  const methodName = call.method;
	  let module, method;
	  const args = call.args || call.arguments || [];
	
	  if (!(module = protocol.apiModule[moduleName])) {
	    return;
	  }
	  if (!(method = module[methodName])) {
	    return;
	  }
	
	  method.apply(protocol.getWeexInstance(instanceId), args);
	
	  const callbackId = call.callbackId;
	  if ((callbackId || callbackId === 0 || callbackId === '0') && callbackId !== '-1' && callbackId !== -1) {
	    performNextTick(instanceId, callbackId);
	  }
	}
	
	function performNextTick(instanceId, callbackId) {
	  Sender.getSender(instanceId).performCallback(callbackId);
	}
	
	function nativeLog() {
	  if (config.debug) {
	    if (arguments[0].match(/^perf/)) {
	      console.info.apply(console, arguments);
	      return;
	    }
	    console.debug.apply(console, arguments);
	  }
	}
	
	function exportsBridgeMethodsToGlobal() {
	  global.callNative = callNative;
	  global.nativeLog = nativeLog;
	}
	
	module.exports = {
	  init: function () {
	    // process callQueue every 16 milliseconds.
	    FrameUpdater.addUpdateObserver(processCallQueue);
	    FrameUpdater.start();
	
	    // exports methods to global(window).
	    exportsBridgeMethodsToGlobal();
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	const RootComponent = __webpack_require__(24);
	const Container = __webpack_require__(26);
	const Image = __webpack_require__(29);
	const Text = __webpack_require__(33);
	const Vlist = __webpack_require__(34);
	const Hlist = __webpack_require__(40);
	const Countdown = __webpack_require__(41);
	const Marquee = __webpack_require__(43);
	const Slider = __webpack_require__(44);
	const Indicator = __webpack_require__(54);
	const Tabheader = __webpack_require__(57);
	const Scroller = __webpack_require__(60);
	const Input = __webpack_require__(63);
	const Select = __webpack_require__(64);
	const Datepicker = __webpack_require__(65);
	const Timepicker = __webpack_require__(66);
	const Video = __webpack_require__(67);
	const Switch = __webpack_require__(70);
	const A = __webpack_require__(73);
	const Embed = __webpack_require__(74);
	const Refresh = __webpack_require__(75);
	const Loading = __webpack_require__(78);
	const Spinner = __webpack_require__(81);
	const Web = __webpack_require__(84);
	
	const components = {
	  init: function (Weex) {
	    Weex.registerComponent('root', RootComponent);
	    Weex.registerComponent('container', Container);
	    Weex.registerComponent('div', Container);
	    Weex.registerComponent('image', Image);
	    Weex.registerComponent('text', Text);
	    Weex.registerComponent('list', Vlist);
	    Weex.registerComponent('vlist', Vlist);
	    Weex.registerComponent('hlist', Hlist);
	    Weex.registerComponent('countdown', Countdown);
	    Weex.registerComponent('marquee', Marquee);
	    Weex.registerComponent('slider', Slider);
	    Weex.registerComponent('indicator', Indicator);
	    Weex.registerComponent('tabheader', Tabheader);
	    Weex.registerComponent('scroller', Scroller);
	    Weex.registerComponent('input', Input);
	    Weex.registerComponent('select', Select);
	    Weex.registerComponent('datepicker', Datepicker);
	    Weex.registerComponent('timepicker', Timepicker);
	    Weex.registerComponent('video', Video);
	    Weex.registerComponent('switch', Switch);
	    Weex.registerComponent('a', A);
	    Weex.registerComponent('embed', Embed);
	    Weex.registerComponent('refresh', Refresh);
	    Weex.registerComponent('loading', Loading);
	    Weex.registerComponent('spinner', Spinner);
	    Weex.registerComponent('loading-indicator', Spinner);
	    Weex.registerComponent('web', Web);
	  }
	};
	
	module.exports = components;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const ComponentManager = __webpack_require__(10);
	const Component = __webpack_require__(17);
	// const utils = require('../utils')
	const logger = __webpack_require__(25);
	
	const rootCandidates = ['div', 'list', 'vlist', 'scroller'];
	
	function RootComponent(data, nodeType) {
	  const id = data.rootId + '-root';
	  const componentManager = ComponentManager.getInstance(data.instanceId);
	
	  // If nodeType is in the downgrades map, just ignore it and
	  // replace it with a div component.
	  const downgrades = componentManager.weexInstance.downgrades;
	  this.data = data;
	
	  // In some situation the root component should be implemented as
	  // its own type, otherwise it has to be a div component as a root.
	  if (!nodeType) {
	    nodeType = 'div';
	  } else if (rootCandidates.indexOf(nodeType) === -1) {
	    logger.warn('the root component type \'' + nodeType + '\' is not one of ' + 'the types in [' + rootCandidates + '] list. It is auto downgraded ' + 'to \'div\'.');
	    nodeType = 'div';
	  } else if (downgrades[nodeType]) {
	    logger.warn('Thanks to the downgrade flags for [' + Object.keys(downgrades) + '], the root component type \'' + nodeType + '\' is auto downgraded to \'div\'.');
	    nodeType = 'div';
	  } else {
	    // If the root component is not a embed element in a webpage, then
	    // the html and body height should be fixed to the max height
	    // of viewport.
	    if (!componentManager.weexInstance.embed) {
	      window.addEventListener('renderend', function () {
	        this.detectRootHeight();
	      }.bind(this));
	    }
	    if (nodeType !== 'div') {
	      logger.warn('the root component type \'' + nodeType + '\' may have ' + 'some performance issue on some of the android devices when there ' + 'is a huge amount of dom elements. Try to add downgrade ' + 'flags by adding param \'downgrade_' + nodeType + '=true\' in the ' + 'url or setting downgrade config to a array contains \'' + nodeType + '\' in the \'weex.init\' function. This will downgrade the root \'' + nodeType + '\' to a \'div\', and may elevate the level of ' + 'performance, although it has some other issues.');
	    }
	    !this.data.style.height && (this.data.style.height = '100%');
	  }
	
	  data.type = nodeType;
	  const cmp = componentManager.createElement(data);
	  cmp.node.id = id;
	  return cmp;
	}
	
	RootComponent.prototype = Object.create(Component.prototype);
	
	RootComponent.prototype.detectRootHeight = function () {
	  const rootQuery = '#' + this.getComponentManager().weexInstance.rootId;
	  const rootContainer = document.querySelector(rootQuery) || document.body;
	  const height = rootContainer.getBoundingClientRect().height;
	  if (height > window.innerHeight) {
	    logger.warn(['for scrollable root like \'list\' and \'scroller\', the height of ', 'the root container must be a user-specified value. Otherwise ', 'the scrollable element may not be able to work correctly. ', 'Current height of the root element \'' + rootQuery + '\' is ', height + 'px, and mostly its height should be less than the ', 'viewport\'s height ' + window.innerHeight + 'px. Please ', 'make sure the height is correct.'].join(''));
	  }
	};
	
	module.exports = RootComponent;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	const config = __webpack_require__(6);
	const utils = __webpack_require__(8);
	
	let _initialized = false;
	
	const logger = {
	  log: function () {},
	  warn: function () {},
	  error: function () {}
	};
	
	function hijack(k) {
	  if (utils.isArray(k)) {
	    k.forEach(function (key) {
	      hijack(key);
	    });
	  } else {
	    if (console[k]) {
	      logger[k] = function () {
	        console[k].apply(console, ['[h5-render]'].concat(Array.prototype.slice.call(arguments, 0)));
	      };
	    }
	  }
	}
	
	logger.init = function () {
	  if (_initialized) {
	    return;
	  }
	  _initialized = true;
	  if (config.debug && console) {
	    hijack(['log', 'warn', 'error']);
	  }
	};
	
	module.exports = logger;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(27);
	
	const Component = __webpack_require__(17);
	
	function Container(data, nodeType) {
	  Component.call(this, data, nodeType);
	  this.node.classList.add('weex-container');
	}
	
	Container.prototype = Object.create(Component.prototype);
	
	module.exports = Container;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(28);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./container.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./container.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".weex-container {\n  box-sizing: border-box;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-flex-direction: column;\n  flex-direction: column;\n  flex-shrink: 0;\n  align-items: stretch;\n  box-align: stretch;\n  align-content: flex-start;\n  position: relative;\n  border: 0 solid black;\n  margin: 0;\n  padding: 0;\n  min-width: 0;\n}\n\n.weex-element {\n  box-sizing: border-box;\n  position: relative;\n  flex-shrink: 0;\n  border: 0 solid black;\n  margin: 0;\n  padding: 0;\n  min-width: 0;\n}\n", ""]);
	
	// exports


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* global lib */
	
	'use strict';
	
	const Atomic = __webpack_require__(30);
	const LazyLoad = __webpack_require__(13);
	// const config = require('../config')
	const utils = __webpack_require__(8);
	
	__webpack_require__(31);
	
	const DEFAULT_SIZE = 200;
	const RESIZE_MODES = ['stretch', 'cover', 'contain'];
	const DEFAULT_RESIZE_MODE = 'stretch';
	
	/**
	 * resize: 'cover' | 'contain' | 'stretch', default is 'stretch'
	 * src: url
	 */
	
	function Image(data) {
	  this.resize = DEFAULT_RESIZE_MODE;
	  Atomic.call(this, data);
	}
	
	Image.prototype = Object.create(Atomic.prototype);
	
	Image.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('weex-img', 'weex-element');
	  return node;
	};
	
	Image.prototype.attr = {
	  src: function (val) {
	    if (!this.src) {
	      this.src = lib.img.defaultSrc;
	      this.node.style.backgroundImage = 'url(' + this.src + ')';
	    }
	    LazyLoad.makeImageLazy(this.node, val);
	  },
	
	  resize: function (val) {
	    if (RESIZE_MODES.indexOf(val) === -1) {
	      val = 'stretch';
	    }
	    this.node.style.backgroundSize = val === 'stretch' ? '100% 100%' : val;
	  }
	};
	
	Image.prototype.style = utils.extend(Object.create(Atomic.prototype.style), {
	  width: function (val) {
	    val = parseFloat(val) * this.data.scale;
	    if (val < 0 || isNaN(val)) {
	      val = DEFAULT_SIZE;
	    }
	    this.node.style.width = val + 'px';
	  },
	
	  height: function (val) {
	    val = parseFloat(val) * this.data.scale;
	    if (val < 0 || isNaN(val)) {
	      val = DEFAULT_SIZE;
	    }
	    this.node.style.height = val + 'px';
	  }
	});
	
	Image.prototype.clearAttr = function () {
	  this.src = '';
	  this.node.style.backgroundImage = '';
	};
	
	module.exports = Image;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Component = __webpack_require__(17);
	
	// Component which can have no subcomponents.
	// This component should not be instantiated directly, since
	// it is designed to be used as a base class to extend from.
	function Atomic(data) {
	  Component.call(this, data);
	}
	
	Atomic.prototype = Object.create(Component.prototype);
	
	Atomic.prototype.appendChild = function (data) {
	  // do nothing
	  return;
	};
	
	Atomic.prototype.insertBefore = function (child, before) {
	  // do nothing
	  return;
	};
	
	Atomic.prototype.removeChild = function (child) {
	  // do nothing
	  return;
	};
	
	module.exports = Atomic;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(32);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./image.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./image.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".weex-img {\n  background-repeat: no-repeat;\n  background-size: 100% 100%;\n  background-position: 50%;\n}", ""]);
	
	// exports


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(17);
	const utils = __webpack_require__(8);
	
	const DEFAULT_FONT_SIZE = 32;
	const DEFAULT_TEXT_OVERFLOW = 'ellipsis';
	
	// attr
	//  - value: text content.
	//  - lines: maximum lines of the text.
	function Text(data) {
	  Atomic.call(this, data);
	}
	
	Text.prototype = Object.create(Atomic.prototype);
	
	Text.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('weex-container');
	  node.style.fontSize = DEFAULT_FONT_SIZE * this.data.scale + 'px';
	  this.textNode = document.createElement('span');
	  // Give the developers the ability to control space
	  // and line-breakers.
	  this.textNode.style.whiteSpace = 'pre-wrap';
	  this.textNode.style.wordWrap = 'break-word';
	  this.textNode.style.display = '-webkit-box';
	  this.textNode.style.webkitBoxOrient = 'vertical';
	  this.style.lines.call(this, this.data.style.lines);
	  node.appendChild(this.textNode);
	  return node;
	};
	
	Text.prototype.attr = {
	  value: function (value) {
	    const span = this.node.firstChild;
	    span.innerHTML = '';
	    if (value == null || value === '') {
	      return;
	    }
	    span.textContent = value;
	    /**
	     * Developers are supposed to have the ability to break text
	     * lines manually. Using ``&nbsp;`` to replace text space is
	     * not compatible with the ``-webkit-line-clamp``. Therefor
	     * we use ``white-space: no-wrap`` instead (instead of the
	     * code bellow).
	       const frag = document.createDocumentFragment()
	        text.split(' ').forEach(function(str) {
	          const textNode = document.createTextNode(str)
	          const space = document.createElement('i')
	          space.innerHTML = '&nbsp;'
	          frag.appendChild(space)
	          frag.appendChild(textNode)
	        })
	        frag.removeChild(frag.firstChild)
	        span.appendChild(document.createElement('br'))
	        span.appendChild(frag)
	      })
	      span.removeChild(span.firstChild)
	     */
	  }
	};
	
	Text.prototype.clearAttr = function () {
	  this.node.firstChild.textContent = '';
	};
	
	Text.prototype.style = utils.extend(Object.create(Atomic.prototype.style), {
	
	  lines: function (val) {
	    val = parseInt(val);
	    if (isNaN(val)) {
	      return;
	    }
	    if (val <= 0) {
	      this.textNode.style.textOverflow = '';
	      this.textNode.style.overflow = 'visible';
	      this.textNode.style.webkitLineClamp = '';
	    } else {
	      const style = this.data ? this.data.style : null;
	      this.textNode.style.overflow = 'hidden';
	      this.textNode.style.textOverflow = style ? style.textOverflow : DEFAULT_TEXT_OVERFLOW;
	      this.textNode.style.webkitLineClamp = val;
	    }
	  },
	
	  textOverflow: function (val) {
	    this.textNode.style.textOverflow = val;
	  }
	
	});
	
	module.exports = Text;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	const List = __webpack_require__(35);
	
	function Vlist(data, nodeType) {
	  data.attr.direction = 'v';
	  List.call(this, data, nodeType);
	}
	
	Vlist.prototype = Object.create(List.prototype);
	
	module.exports = Vlist;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* global lib */
	
	'use strict';
	
	__webpack_require__(36);
	__webpack_require__(38);
	
	const Component = __webpack_require__(17);
	
	const DEFAULT_LOAD_MORE_OFFSET = 0;
	
	const directionMap = {
	  h: ['row', 'horizontal', 'h', 'x'],
	  v: ['column', 'vertical', 'v', 'y']
	};
	
	// direction: 'v' or 'h', default is 'v'
	function List(data, nodeType) {
	  this.loadmoreoffset = DEFAULT_LOAD_MORE_OFFSET;
	  this.isAvailableToFireloadmore = true;
	  this.direction = directionMap.h.indexOf(data.attr.direction) === -1 ? 'v' : 'h';
	  Component.call(this, data, nodeType);
	}
	
	List.prototype = Object.create(Component.prototype);
	
	List.prototype.create = function (nodeType) {
	  const Scroll = lib.scroll;
	  const node = Component.prototype.create.call(this, nodeType);
	  node.classList.add('weex-container', 'list-wrap');
	  this.listElement = document.createElement('div');
	  this.listElement.classList.add('weex-container', 'list-element', this.direction + '-list');
	
	  this.listElement.style.webkitBoxOrient = directionMap[this.direction][1];
	  this.listElement.style.webkitFlexDirection = directionMap[this.direction][0];
	  this.listElement.style.flexDirection = directionMap[this.direction][0];
	
	  node.appendChild(this.listElement);
	  this.scroller = new Scroll({
	    // if the direction is x, then the bounding rect of the scroll element
	    // should be got by the 'Range' API other than the 'getBoundingClientRect'
	    // API, because the width outside the viewport won't be count in by
	    // 'getBoundingClientRect'.
	    // Otherwise should use the element rect in case there is a child scroller
	    // or list in this scroller. If using 'Range', the whole scroll element
	    // including the hiding part will be count in the rect.
	    useElementRect: this.direction === 'v',
	    scrollElement: this.listElement,
	    direction: this.direction === 'h' ? 'x' : 'y'
	  });
	  this.scroller.init();
	  this.offset = 0;
	  return node;
	};
	
	List.prototype.bindEvents = function (evts) {
	  Component.prototype.bindEvents.call(this, evts);
	  // to enable lazyload for Images.
	  this.scroller.addEventListener('scrolling', function (e) {
	    const so = e.scrollObj;
	    const scrollTop = so.getScrollTop();
	    const scrollLeft = so.getScrollLeft();
	    const offset = this.direction === 'v' ? scrollTop : scrollLeft;
	    const diff = offset - this.offset;
	    let dir;
	    if (diff >= 0) {
	      dir = this.direction === 'v' ? 'up' : 'left';
	    } else {
	      dir = this.direction === 'v' ? 'down' : 'right';
	    }
	    this.dispatchEvent('scroll', {
	      originalType: 'scrolling',
	      scrollTop: so.getScrollTop(),
	      scrollLeft: so.getScrollLeft(),
	      offset: offset,
	      direction: dir
	    }, {
	      bubbles: true
	    });
	    this.offset = offset;
	
	    // fire loadmore event.
	    const leftDist = Math.abs(so.maxScrollOffset) - this.offset;
	    if (leftDist <= this.loadmoreoffset && this.isAvailableToFireloadmore) {
	      this.isAvailableToFireloadmore = false;
	      this.dispatchEvent('loadmore');
	    } else if (leftDist > this.loadmoreoffset && !this.isAvailableToFireloadmore) {
	      this.isAvailableToFireloadmore = true;
	    }
	  }.bind(this));
	};
	
	List.prototype.createChildren = function () {
	  const children = this.data.children;
	  const parentRef = this.data.ref;
	  const componentManager = this.getComponentManager();
	  if (children && children.length) {
	    const fragment = document.createDocumentFragment();
	    let isFlex = false;
	    for (let i = 0; i < children.length; i++) {
	      children[i].instanceId = this.data.instanceId;
	      children[i].scale = this.data.scale;
	      const child = componentManager.createElement(children[i]);
	      fragment.appendChild(child.node);
	      child.parentRef = parentRef;
	      if (!isFlex && child.data.style && child.data.style.hasOwnProperty('flex')) {
	        isFlex = true;
	      }
	    }
	    this.listElement.appendChild(fragment);
	  }
	  // wait for fragment to appended on listElement on UI thread.
	  setTimeout(function () {
	    this.scroller.refresh();
	  }.bind(this), 0);
	};
	
	List.prototype.appendChild = function (data) {
	  const children = this.data.children;
	  const componentManager = this.getComponentManager();
	  const child = componentManager.createElement(data);
	  this.listElement.appendChild(child.node);
	
	  // wait for UI thread to update.
	  setTimeout(function () {
	    this.scroller.refresh();
	  }.bind(this), 0);
	
	  // update this.data.children
	  if (!children || !children.length) {
	    this.data.children = [data];
	  } else {
	    children.push(data);
	  }
	
	  return child;
	};
	
	List.prototype.insertBefore = function (child, before) {
	  const children = this.data.children;
	  let i = 0;
	  let isAppend = false;
	
	  // update this.data.children
	  if (!children || !children.length || !before) {
	    isAppend = true;
	  } else {
	    let l;
	    for (l = children.length; i < l; i++) {
	      if (children[i].ref === before.data.ref) {
	        break;
	      }
	    }
	    if (i === l) {
	      isAppend = true;
	    }
	  }
	
	  if (isAppend) {
	    this.listElement.appendChild(child.node);
	    children.push(child.data);
	  } else {
	    const refreshLoadingPlaceholder = before.refreshPlaceholder || before.loadingPlaceholder;
	    if (refreshLoadingPlaceholder) {
	      this.listElement.insertBefore(child.node, refreshLoadingPlaceholder);
	    } else if (before.fixedPlaceholder) {
	      this.listElement.insertBefore(child.node, before.fixedPlaceholder);
	    } else {
	      this.listElement.insertBefore(child.node, before.node);
	    }
	    children.splice(i, 0, child.data);
	  }
	
	  // wait for UI thread to update.
	  setTimeout(function () {
	    this.scroller.refresh();
	  }.bind(this), 0);
	};
	
	List.prototype.removeChild = function (child) {
	  const children = this.data.children;
	  // remove from this.data.children
	  let i = 0;
	  const componentManager = this.getComponentManager();
	  if (children && children.length) {
	    let l;
	    for (l = children.length; i < l; i++) {
	      if (children[i].ref === child.data.ref) {
	        break;
	      }
	    }
	    if (i < l) {
	      children.splice(i, 1);
	    }
	  }
	  // remove from componentMap recursively
	  componentManager.removeElementByRef(child.data.ref);
	  const refreshLoadingPlaceholder = child.refreshPlaceholder || child.loadingPlaceholder;
	  if (child.refreshPlaceholder) {
	    this.listElement.removeChild(refreshLoadingPlaceholder);
	  }
	  if (child.fixedPlaceholder) {
	    this.listElement.removeChild(child.fixedPlaceholder);
	  }
	  child.node.parentNode.removeChild(child.node);
	
	  // wait for UI thread to update.
	  setTimeout(function () {
	    this.scroller.refresh();
	  }.bind(this), 0);
	};
	
	List.prototype.onAppend = function () {
	  this._refreshWhenDomRenderend();
	};
	
	List.prototype.onRemove = function () {
	  this._removeEvents();
	};
	
	List.prototype._refreshWhenDomRenderend = function () {
	  const self = this;
	  if (!this.renderendHandler) {
	    this.renderendHandler = function () {
	      self.scroller.refresh();
	    };
	  }
	  window.addEventListener('renderend', this.renderendHandler);
	};
	
	List.prototype._removeEvents = function () {
	  if (this.renderendHandler) {
	    window.removeEventListener('renderend', this.renderendHandler);
	  }
	};
	
	List.prototype.attr = {
	  loadmoreoffset: function (val) {
	    val = parseFloat(val);
	    if (val < 0 || isNaN(val)) {
	      return;
	    }
	    this.loadmoreoffset = val;
	  }
	};
	
	module.exports = List;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(37);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./list.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./list.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".list-wrap {\n  display: block;\n  overflow: hidden;\n}\n\n.list-element {\n  -webkit-box-orient: vertical;\n  -webkit-flex-direction: column;\n  flex-direction: column;\n}\n", ""]);
	
	// exports


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-disable */
	
	__webpack_require__(39);
	
	var logger = __webpack_require__(25);
	
	var doc = window.document;
	var ua = window.navigator.userAgent;
	var scrollObjs = {};
	var plugins = {};
	var dpr = window.dpr || (!!window.navigator.userAgent.match(/iPhone|iPad|iPod/) ? document.documentElement.clientWidth / window.screen.availWidth : 1);
	var inertiaCoefficient = {
	  normal: [2 * dpr, 0.0015 * dpr],
	  slow: [1.5 * dpr, 0.003 * dpr],
	  veryslow: [1.5 * dpr, 0.005 * dpr]
	};
	var timeFunction = {
	  ease: [.25, .1, .25, 1],
	  liner: [0, 0, 1, 1],
	  'ease-in': [.42, 0, 1, 1],
	  'ease-out': [0, 0, .58, 1],
	  'ease-in-out': [.42, 0, .58, 1]
	};
	var Firefox = !!ua.match(/Firefox/i);
	var IEMobile = !!ua.match(/IEMobile/i);
	var cssPrefix = Firefox ? '-moz-' : IEMobile ? '-ms-' : '-webkit-';
	var stylePrefix = Firefox ? 'Moz' : IEMobile ? 'ms' : 'webkit';
	
	function debugLog() {
	  if (lib.scroll.outputDebugLog) {
	    logger.log.apply(logger, arguments);
	  }
	}
	
	function getBoundingClientRect(el) {
	  var rect = el.getBoundingClientRect();
	  if (!rect) {
	    rect = {};
	    rect.width = el.offsetWidth;
	    rect.height = el.offsetHeight;
	
	    rect.left = el.offsetLeft;
	    rect.top = el.offsetTop;
	    var parent = el.offsetParent;
	    while (parent) {
	      rect.left += parent.offsetLeft;
	      rect.top += parent.offsetTop;
	      parent = parent.offsetParent;
	    }
	
	    rect.right = rect.left + rect.width;
	    rect.bottom = rect.top + rect.height;
	  }
	  return rect;
	}
	
	function getMinScrollOffset(scrollObj) {
	  return 0 - scrollObj.options[scrollObj.axis + 'PaddingTop'];
	}
	
	function getMaxScrollOffset(scrollObj) {
	  var rect = getBoundingClientRect(scrollObj.element);
	  var pRect = getBoundingClientRect(scrollObj.viewport);
	  var min = getMinScrollOffset(scrollObj);
	  if (scrollObj.axis === 'y') {
	    var max = 0 - rect.height + pRect.height;
	  } else {
	    var max = 0 - rect.width + pRect.width;
	  }
	  return Math.min(max + scrollObj.options[scrollObj.axis + 'PaddingBottom'], min);
	}
	
	function getBoundaryOffset(scrollObj, offset) {
	  if (offset > scrollObj.minScrollOffset) {
	    return offset - scrollObj.minScrollOffset;
	  }
	  if (offset < scrollObj.maxScrollOffset) {
	    return offset - scrollObj.maxScrollOffset;
	  }
	}
	
	function touchBoundary(scrollObj, offset) {
	  if (offset > scrollObj.minScrollOffset) {
	    offset = scrollObj.minScrollOffset;
	  } else if (offset < scrollObj.maxScrollOffset) {
	    offset = scrollObj.maxScrollOffset;
	  }
	  return offset;
	}
	
	function fireEvent(scrollObj, eventName, extra) {
	  debugLog(scrollObj.element.scrollId, eventName, extra);
	  var event = doc.createEvent('HTMLEvents');
	  event.initEvent(eventName, false, true);
	  event.scrollObj = scrollObj;
	  if (extra) {
	    for (var key in extra) {
	      event[key] = extra[key];
	    }
	  }
	  scrollObj.element.dispatchEvent(event);
	  scrollObj.viewport.dispatchEvent(event);
	}
	
	function getTransformOffset(scrollObj) {
	  var offset = { x: 0, y: 0 };
	  var transform = getComputedStyle(scrollObj.element)[stylePrefix + 'Transform'];
	  var matched;
	  var reg1 = new RegExp('^matrix3d' + '\\((?:[-\\d.]+,\\s*){12}([-\\d.]+),' + '\\s*([-\\d.]+)(?:,\\s*[-\\d.]+){2}\\)');
	  var reg2 = new RegExp('^matrix' + '\\((?:[-\\d.]+,\\s*){4}([-\\d.]+),\\s*([-\\d.]+)\\)$');
	  if (transform !== 'none') {
	    if (matched = transform.match(reg1) || transform.match(reg2)) {
	      offset.x = parseFloat(matched[1]) || 0;
	      offset.y = parseFloat(matched[2]) || 0;
	    }
	  }
	
	  return offset;
	}
	
	var CSSMatrix = IEMobile ? 'MSCSSMatrix' : 'WebKitCSSMatrix';
	var has3d = !!Firefox || CSSMatrix in window && 'm11' in new window[CSSMatrix]();
	function getTranslate(x, y) {
	  x = parseFloat(x);
	  y = parseFloat(y);
	
	  if (x != 0) {
	    x += 'px';
	  }
	
	  if (y != 0) {
	    y += 'px';
	  }
	
	  if (has3d) {
	    return 'translate3d(' + x + ', ' + y + ', 0)';
	  }
	  return 'translate(' + x + ', ' + y + ')';
	}
	
	function setTransitionStyle(scrollObj, duration, timingFunction) {
	  if (duration === '' && timingFunction === '') {
	    scrollObj.element.style[stylePrefix + 'Transition'] = '';
	  } else {
	    scrollObj.element.style[stylePrefix + 'Transition'] = cssPrefix + 'transform ' + duration + ' ' + timingFunction + ' 0s';
	  }
	}
	
	function setTransformStyle(scrollObj, offset) {
	  var x = 0;
	  var y = 0;
	  if (typeof offset === 'object') {
	    x = offset.x;
	    y = offset.y;
	  } else {
	    if (scrollObj.axis === 'y') {
	      y = offset;
	    } else {
	      x = offset;
	    }
	  }
	  scrollObj.element.style[stylePrefix + 'Transform'] = getTranslate(x, y);
	}
	
	var panning = false;
	doc.addEventListener('touchmove', function (e) {
	  if (panning) {
	    e.preventDefault();
	    return false;
	  }
	  return true;
	}, false);
	
	function Scroll(element, options) {
	  var that = this;
	
	  options = options || {};
	  options.noBounce = !!options.noBounce;
	  options.padding = options.padding || {};
	
	  if (options.isPrevent == null) {
	    options.isPrevent = true;
	  } else {
	    options.isPrevent = !!options.isPrevent;
	  }
	
	  if (options.isFixScrollendClick == null) {
	    options.isFixScrollendClick = true;
	  } else {
	    options.isFixScrollendClick = !!options.isFixScrollendClick;
	  }
	
	  if (options.padding) {
	    options.yPaddingTop = -options.padding.top || 0;
	    options.yPaddingBottom = -options.padding.bottom || 0;
	    options.xPaddingTop = -options.padding.left || 0;
	    options.xPaddingBottom = -options.padding.right || 0;
	  } else {
	    options.yPaddingTop = 0;
	    options.yPaddingBottom = 0;
	    options.xPaddingTop = 0;
	    options.xPaddingBottom = 0;
	  }
	
	  options.direction = options.direction || 'y';
	  options.inertia = options.inertia || 'normal';
	
	  this.options = options;
	  that.axis = options.direction;
	  this.element = element;
	  this.viewport = element.parentNode;
	  this.plugins = {};
	
	  this.element.scrollId = setTimeout(function () {
	    scrollObjs[that.element.scrollId + ''] = that;
	  }, 1);
	
	  this.viewport.addEventListener('touchstart', touchstartHandler, false);
	  this.viewport.addEventListener('touchend', touchendHandler, false);
	  this.viewport.addEventListener('touchcancel', touchendHandler, false);
	  this.viewport.addEventListener('panstart', panstartHandler, false);
	  this.viewport.addEventListener('panmove', panHandler, false);
	  this.viewport.addEventListener('panend', panendHandler, false);
	
	  if (options.isPrevent) {
	    this.viewport.addEventListener('touchstart', function (e) {
	      panning = true;
	    }, false);
	    that.viewport.addEventListener('touchend', function (e) {
	      panning = false;
	    }, false);
	  }
	
	  // if (options.isPrevent) {
	  //   var d = this.axis === 'y'?'vertical':'horizontal'
	  //   this.viewport.addEventListener(d + 'panstart', function (e) {
	  //     panning = true
	  //   }, false)
	  //   that.viewport.addEventListener('panend', function (e) {
	  //     panning = false
	  //   }, false)
	  // }
	
	  if (options.isFixScrollendClick) {
	    var preventScrollendClick;
	    var fixScrollendClickTimeoutId;
	
	    this.viewport.addEventListener('scrolling', function () {
	      preventScrollendClick = true;
	      fixScrollendClickTimeoutId && clearTimeout(fixScrollendClickTimeoutId);
	      fixScrollendClickTimeoutId = setTimeout(function (e) {
	        preventScrollendClick = false;
	      }, 400);
	    }, false);
	
	    function preventScrollendClickHandler(e) {
	      if (preventScrollendClick || isScrolling) {
	        e.preventDefault();
	        e.stopPropagation();
	        return false;
	      }
	      return true;
	    }
	
	    function fireNiceTapEventHandler(e) {
	      if (!preventScrollendClick && !isScrolling) {
	        setTimeout(function () {
	          var niceTapEvent = document.createEvent('HTMLEvents');
	          niceTapEvent.initEvent('niceclick', true, true);
	          e.target.dispatchEvent(niceTapEvent);
	        }, 300);
	      }
	    }
	
	    this.viewport.addEventListener('click', preventScrollendClickHandler);
	    this.viewport.addEventListener('tap', fireNiceTapEventHandler);
	  }
	
	  function setTransitionEndHandler(h, t) {
	    if (options.useFrameAnimation) {
	      return;
	    }
	    transitionEndHandler = null;
	    clearTimeout(transitionEndTimeoutId);
	
	    transitionEndTimeoutId = setTimeout(function () {
	      if (transitionEndHandler) {
	        transitionEndHandler = null;
	        lib.animation.requestFrame(h);
	      }
	    }, t || 400);
	
	    transitionEndHandler = h;
	  }
	
	  if (options.useFrameAnimation) {
	    var scrollAnimation;
	
	    Object.defineProperty(this, 'animation', {
	      get: function () {
	        return scrollAnimation;
	      }
	    });
	  } else {
	    var transitionEndHandler;
	    var transitionEndTimeoutId = 0;
	
	    element.addEventListener(Firefox ? 'transitionend' : stylePrefix + 'TransitionEnd', function (e) {
	      if (transitionEndHandler) {
	        var handler = transitionEndHandler;
	
	        transitionEndHandler = null;
	        clearTimeout(transitionEndTimeoutId);
	
	        lib.animation.requestFrame(function () {
	          handler(e);
	        });
	      }
	    }, false);
	  }
	
	  var panFixRatio;
	  var isScrolling;
	  var isFlickScrolling;
	  var cancelScrollEnd;
	
	  Object.defineProperty(this, 'isScrolling', {
	    get: function () {
	      return !!isScrolling;
	    }
	  });
	
	  function isEnabled(e) {
	    if (!that.enabled) {
	      return false;
	    }
	
	    if (typeof e.isVertical != 'undefined') {
	      if (that.axis === 'y' && e.isVertical || that.axis === 'x' && !e.isVertical) {
	        // gesture in same direction, stop bubbling up
	        e.stopPropagation();
	      } else {
	        // gesture in different direction, bubbling up
	        // to the top, without any other process
	        return false;
	      }
	    }
	
	    return true;
	  }
	
	  function touchstartHandler(e) {
	    if (!isEnabled(e)) {
	      return;
	    }
	
	    if (isScrolling) {
	      scrollEnd();
	    }
	
	    if (options.useFrameAnimation) {
	      scrollAnimation && scrollAnimation.stop();
	      scrollAnimation = null;
	    } else {
	      var transform = getTransformOffset(that);
	      setTransformStyle(that, transform);
	      setTransitionStyle(that, '', '');
	      transitionEndHandler = null;
	      clearTimeout(transitionEndTimeoutId);
	    }
	  }
	
	  function touchendHandler(e) {
	    if (!isEnabled(e)) {
	      return;
	    }
	
	    var s0 = getTransformOffset(that)[that.axis];
	    var boundaryOffset = getBoundaryOffset(that, s0);
	
	    if (boundaryOffset) {
	      // dragging out of boundray, bounce is needed
	      var s1 = touchBoundary(that, s0);
	
	      if (options.useFrameAnimation) {
	        // frame
	        var _s = s1 - s0;
	        scrollAnimation = new lib.animation(400, lib.cubicbezier.ease, 0, function (i1, i2) {
	          var offset = (s0 + _s * i2).toFixed(2);
	          setTransformStyle(that, offset);
	          fireEvent(that, 'scrolling');
	        });
	        scrollAnimation.onend(scrollEnd);
	        scrollAnimation.play();
	      } else {
	        // css
	        var offset = s1.toFixed(0);
	        setTransitionEndHandler(scrollEnd, 400);
	        setTransitionStyle(that, '0.4s', 'ease');
	        setTransformStyle(that, offset);
	
	        lib.animation.requestFrame(function doScroll() {
	          if (isScrolling && that.enabled) {
	            fireEvent(that, 'scrolling');
	            lib.animation.requestFrame(doScroll);
	          }
	        });
	      }
	
	      if (boundaryOffset > 0) {
	        fireEvent(that, that.axis === 'y' ? 'pulldownend' : 'pullrightend');
	      } else if (boundaryOffset < 0) {
	        fireEvent(that, that.axis === 'y' ? 'pullupend' : 'pullleftend');
	      }
	    } else if (isScrolling) {
	      // without exceeding the boundary, just end it
	      scrollEnd();
	    }
	  }
	
	  var lastDisplacement;
	  function panstartHandler(e) {
	    if (!isEnabled(e)) {
	      return;
	    }
	
	    that.transformOffset = getTransformOffset(that);
	    that.minScrollOffset = getMinScrollOffset(that);
	    that.maxScrollOffset = getMaxScrollOffset(that);
	    panFixRatio = 2.5;
	    cancelScrollEnd = true;
	    isScrolling = true;
	    isFlickScrolling = false;
	    fireEvent(that, 'scrollstart');
	
	    lastDisplacement = e['displacement' + that.axis.toUpperCase()];
	  }
	
	  function panHandler(e) {
	    if (!isEnabled(e)) {
	      return;
	    }
	
	    // finger move less than 5 px. just ignore that.
	    var displacement = e['displacement' + that.axis.toUpperCase()];
	    if (Math.abs(displacement - lastDisplacement) < 5) {
	      e.stopPropagation();
	      return;
	    }
	    lastDisplacement = displacement;
	
	    var offset = that.transformOffset[that.axis] + displacement;
	    if (offset > that.minScrollOffset) {
	      offset = that.minScrollOffset + (offset - that.minScrollOffset) / panFixRatio;
	      panFixRatio *= 1.003;
	    } else if (offset < that.maxScrollOffset) {
	      offset = that.maxScrollOffset - (that.maxScrollOffset - offset) / panFixRatio;
	      panFixRatio *= 1.003;
	    }
	    if (panFixRatio > 4) {
	      panFixRatio = 4;
	    }
	
	    // tell whether or not reach the fringe
	    var boundaryOffset = getBoundaryOffset(that, offset);
	    if (boundaryOffset) {
	      fireEvent(that, boundaryOffset > 0 ? that.axis === 'y' ? 'pulldown' : 'pullright' : that.axis === 'y' ? 'pullup' : 'pullleft', {
	        boundaryOffset: Math.abs(boundaryOffset)
	      });
	      if (that.options.noBounce) {
	        offset = touchBoundary(that, offset);
	      }
	    }
	
	    setTransformStyle(that, offset.toFixed(2));
	    fireEvent(that, 'scrolling');
	  }
	
	  function panendHandler(e) {
	    if (!isEnabled(e)) {
	      return;
	    }
	
	    if (e.isSwipe) {
	      flickHandler(e);
	    }
	  }
	
	  function flickHandler(e) {
	    cancelScrollEnd = true;
	
	    var v0, a0, t0, s0, s, motion0;
	    var v1, a1, t1, s1, motion1, sign;
	    var v2, a2, t2, s2, motion2, ft;
	
	    s0 = getTransformOffset(that)[that.axis];
	    var boundaryOffset0 = getBoundaryOffset(that, s0);
	    if (!boundaryOffset0) {
	      // when fingers left the range of screen, let touch end handler
	      // to deal with it.
	      // when fingers left the screen, but still in the range of
	      // screen, calculate the intertia.
	      v0 = e['velocity' + that.axis.toUpperCase()];
	
	      var maxV = 2;
	      var friction = 0.0015;
	      if (options.inertia && inertiaCoefficient[options.inertia]) {
	        maxV = inertiaCoefficient[options.inertia][0];
	        friction = inertiaCoefficient[options.inertia][1];
	      }
	
	      if (v0 > maxV) {
	        v0 = maxV;
	      }
	      if (v0 < -maxV) {
	        v0 = -maxV;
	      }
	      a0 = friction * (v0 / Math.abs(v0));
	      motion0 = new lib.motion({
	        v: v0,
	        a: -a0
	      });
	      t0 = motion0.t;
	      s = s0 + motion0.s;
	
	      var boundaryOffset1 = getBoundaryOffset(that, s);
	      if (boundaryOffset1) {
	        debugLog('inertial calculation has exceeded the boundary', boundaryOffset1);
	
	        v1 = v0;
	        a1 = a0;
	        if (boundaryOffset1 > 0) {
	          s1 = that.minScrollOffset;
	          sign = 1;
	        } else {
	          s1 = that.maxScrollOffset;
	          sign = -1;
	        }
	        motion1 = new lib.motion({
	          v: sign * v1,
	          a: -sign * a1,
	          s: Math.abs(s1 - s0)
	        });
	        t1 = motion1.t;
	        var timeFunction1 = motion1.generateCubicBezier();
	
	        v2 = v1 - a1 * t1;
	        a2 = 0.03 * (v2 / Math.abs(v2));
	        motion2 = new lib.motion({
	          v: v2,
	          a: -a2
	        });
	        t2 = motion2.t;
	        s2 = s1 + motion2.s;
	        var timeFunction2 = motion2.generateCubicBezier();
	
	        if (options.noBounce) {
	          debugLog('no bounce effect');
	
	          if (s0 !== s1) {
	            if (options.useFrameAnimation) {
	              // frame
	              var _s = s1 - s0;
	              var bezier = lib.cubicbezier(timeFunction1[0][0], timeFunction1[0][1], timeFunction1[1][0], timeFunction1[1][1]);
	              scrollAnimation = new lib.animation(t1.toFixed(0), bezier, 0, function (i1, i2) {
	                var offset = s0 + _s * i2;
	                getTransformOffset(that, offset.toFixed(2));
	                fireEvent(that, 'scrolling', {
	                  afterFlick: true
	                });
	              });
	
	              scrollAnimation.onend(scrollEnd);
	
	              scrollAnimation.play();
	            } else {
	              // css
	              var offset = s1.toFixed(0);
	              setTransitionEndHandler(scrollEnd, (t1 / 1000).toFixed(2) * 1000);
	              setTransitionStyle(that, (t1 / 1000).toFixed(2) + 's', 'cubic-bezier(' + timeFunction1 + ')');
	              setTransformStyle(that, offset);
	            }
	          } else {
	            scrollEnd();
	          }
	        } else if (s0 !== s2) {
	          debugLog('scroll for inertia', 's=' + s2.toFixed(0), 't=' + ((t1 + t2) / 1000).toFixed(2));
	
	          if (options.useFrameAnimation) {
	            var _s = s2 - s0;
	            var bezier = lib.cubicbezier.easeOut;
	            scrollAnimation = new lib.animation((t1 + t2).toFixed(0), bezier, 0, function (i1, i2) {
	              var offset = s0 + _s * i2;
	              setTransformStyle(that, offset.toFixed(2));
	              fireEvent(that, 'scrolling', {
	                afterFlick: true
	              });
	            });
	
	            scrollAnimation.onend(function () {
	              if (!that.enabled) {
	                return;
	              }
	
	              var _s = s1 - s2;
	              var bezier = lib.cubicbezier.ease;
	              scrollAnimation = new lib.animation(400, bezier, 0, function (i1, i2) {
	                var offset = s2 + _s * i2;
	                setTransformStyle(that, offset.toFixed(2));
	                fireEvent(that, 'scrolling', {
	                  afterFlick: true
	                });
	              });
	
	              scrollAnimation.onend(scrollEnd);
	
	              scrollAnimation.play();
	            });
	
	            scrollAnimation.play();
	          } else {
	            var offset = s2.toFixed(0);
	            setTransitionEndHandler(function (e) {
	              if (!that.enabled) {
	                return;
	              }
	
	              debugLog('inertial bounce', 's=' + s1.toFixed(0), 't=400');
	
	              if (s2 !== s1) {
	                var offset = s1.toFixed(0);
	                setTransitionStyle(that, '0.4s', 'ease');
	                setTransformStyle(that, offset);
	                setTransitionEndHandler(scrollEnd, 400);
	              } else {
	                scrollEnd();
	              }
	            }, ((t1 + t2) / 1000).toFixed(2) * 1000);
	
	            setTransitionStyle(that, ((t1 + t2) / 1000).toFixed(2) + 's', 'ease-out');
	            setTransformStyle(that, offset);
	          }
	        } else {
	          scrollEnd();
	        }
	      } else {
	        debugLog('inertial calculation hasn\'t exceeded the boundary');
	        var timeFunction = motion0.generateCubicBezier();
	
	        if (options.useFrameAnimation) {
	          // frame
	          var _s = s - s0;
	          var bezier = lib.cubicbezier(timeFunction[0][0], timeFunction[0][1], timeFunction[1][0], timeFunction[1][1]);
	          scrollAnimation = new lib.animation(t0.toFixed(0), bezier, 0, function (i1, i2) {
	            var offset = (s0 + _s * i2).toFixed(2);
	            setTransformStyle(that, offset);
	            fireEvent(that, 'scrolling', {
	              afterFlick: true
	            });
	          });
	
	          scrollAnimation.onend(scrollEnd);
	
	          scrollAnimation.play();
	        } else {
	          // css
	          var offset = s.toFixed(0);
	          setTransitionEndHandler(scrollEnd, (t0 / 1000).toFixed(2) * 1000);
	          setTransitionStyle(that, (t0 / 1000).toFixed(2) + 's', 'cubic-bezier(' + timeFunction + ')');
	          setTransformStyle(that, offset);
	        }
	      }
	
	      isFlickScrolling = true;
	      if (!options.useFrameAnimation) {
	        lib.animation.requestFrame(function doScroll() {
	          if (isScrolling && isFlickScrolling && that.enabled) {
	            fireEvent(that, 'scrolling', {
	              afterFlick: true
	            });
	            lib.animation.requestFrame(doScroll);
	          }
	        });
	      }
	    }
	  }
	
	  function scrollEnd() {
	    if (!that.enabled) {
	      return;
	    }
	
	    cancelScrollEnd = false;
	
	    setTimeout(function () {
	      if (!cancelScrollEnd && isScrolling) {
	        isScrolling = false;
	        isFlickScrolling = false;
	
	        if (options.useFrameAnimation) {
	          scrollAnimation && scrollAnimation.stop();
	          scrollAnimation = null;
	        } else {
	          setTransitionStyle(that, '', '');
	        }
	        fireEvent(that, 'scrollend');
	      }
	    }, 50);
	  }
	
	  var proto = {
	    init: function () {
	      this.enable();
	      this.refresh();
	      this.scrollTo(0);
	      return this;
	    },
	
	    enable: function () {
	      this.enabled = true;
	      return this;
	    },
	
	    disable: function () {
	      var el = this.element;
	      this.enabled = false;
	
	      if (this.options.useFrameAnimation) {
	        scrollAnimation && scrollAnimation.stop();
	      } else {
	        lib.animation.requestFrame(function () {
	          el.style[stylePrefix + 'Transform'] = getComputedStyle(el)[stylePrefix + 'Transform'];
	        });
	      }
	
	      return this;
	    },
	
	    getScrollWidth: function () {
	      return getBoundingClientRect(this.element).width;
	    },
	
	    getScrollHeight: function () {
	      return getBoundingClientRect(this.element).height;
	    },
	
	    getScrollLeft: function () {
	      return -getTransformOffset(this).x - this.options.xPaddingTop;
	    },
	
	    getScrollTop: function () {
	      return -getTransformOffset(this).y - this.options.yPaddingTop;
	    },
	
	    getMaxScrollLeft: function () {
	      return -that.maxScrollOffset - this.options.xPaddingTop;
	    },
	
	    getMaxScrollTop: function () {
	      return -that.maxScrollOffset - this.options.yPaddingTop;
	    },
	
	    getBoundaryOffset: function () {
	      return Math.abs(getBoundaryOffset(this, getTransformOffset(this)[this.axis]) || 0);
	    },
	
	    refresh: function () {
	      var el = this.element;
	      var isVertical = this.axis === 'y';
	      var type = isVertical ? 'height' : 'width';
	      var size, rect, extraSize;
	
	      function getExtraSize(el, isVertical) {
	        var extraType = isVertical ? ['top', 'bottom'] : ['left', 'right'];
	        return parseFloat(getComputedStyle(el.firstElementChild)['margin-' + extraType[0]]) + parseFloat(getComputedStyle(el.lastElementChild)['margin-' + extraType[1]]);
	      }
	
	      if (this.options[type] != null) {
	        // use options
	        size = this.options[type];
	      } else if (el.childElementCount <= 0) {
	        el.style[type] = 'auto';
	        size = null;
	      } else if (!!this.options.useElementRect) {
	        el.style[type] = 'auto';
	        rect = getBoundingClientRect(el);
	        size = rect[type];
	        size += getExtraSize(el, isVertical);
	      } else {
	        var range, rect;
	        var firstEl = el.firstElementChild;
	        var lastEl = el.lastElementChild;
	
	        if (document.createRange && !this.options.ignoreOverflow) {
	          // use range
	          range = document.createRange();
	          range.selectNodeContents(el);
	          rect = getBoundingClientRect(range);
	        }
	
	        if (rect) {
	          size = rect[type];
	        } else {
	          // use child offsets
	          while (firstEl) {
	            if (getBoundingClientRect(firstEl)[type] === 0 && firstEl.nextElementSibling) {
	              firstEl = firstEl.nextElementSibling;
	            } else {
	              break;
	            }
	          }
	
	          while (lastEl && lastEl !== firstEl) {
	            if (getBoundingClientRect(lastEl)[type] === 0 && lastEl.previousElementSibling) {
	              lastEl = lastEl.previousElementSibling;
	            } else {
	              break;
	            }
	          }
	
	          size = getBoundingClientRect(lastEl)[isVertical ? 'bottom' : 'right'] - getBoundingClientRect(firstEl)[isVertical ? 'top' : 'left'];
	        }
	
	        size += getExtraSize(el, isVertical);
	      }
	
	      el.style[type] = size ? size + 'px' : 'auto';
	
	      this.transformOffset = getTransformOffset(this);
	      this.minScrollOffset = getMinScrollOffset(this);
	      this.maxScrollOffset = getMaxScrollOffset(this);
	
	      this.scrollTo(-this.transformOffset[this.axis] - this.options[this.axis + 'PaddingTop']);
	      fireEvent(this, 'contentrefresh');
	
	      return this;
	    },
	
	    offset: function (childEl) {
	      var elRect = getBoundingClientRect(this.element);
	      var childRect = getBoundingClientRect(childEl);
	      if (this.axis === 'y') {
	        var offsetRect = {
	          top: childRect.top - elRect.top - this.options.yPaddingTop,
	          left: childRect.left - elRect.left,
	          right: elRect.right - childRect.right,
	          width: childRect.width,
	          height: childRect.height
	        };
	
	        offsetRect.bottom = offsetRect.top + offsetRect.height;
	      } else {
	        var offsetRect = {
	          top: childRect.top - elRect.top,
	          bottom: elRect.bottom - childRect.bottom,
	          left: childRect.left - elRect.left - this.options.xPaddingTop,
	          width: childRect.width,
	          height: childRect.height
	        };
	
	        offsetRect.right = offsetRect.left + offsetRect.width;
	      }
	      return offsetRect;
	    },
	
	    getRect: function (childEl) {
	      var viewRect = getBoundingClientRect(this.viewport);
	      var childRect = getBoundingClientRect(childEl);
	      if (this.axis === 'y') {
	        var offsetRect = {
	          top: childRect.top - viewRect.top,
	          left: childRect.left - viewRect.left,
	          right: viewRect.right - childRect.right,
	          width: childRect.width,
	          height: childRect.height
	        };
	
	        offsetRect.bottom = offsetRect.top + offsetRect.height;
	      } else {
	        var offsetRect = {
	          top: childRect.top - viewRect.top,
	          bottom: viewRect.bottom - childRect.bottom,
	          left: childRect.left - viewRect.left,
	          width: childRect.width,
	          height: childRect.height
	        };
	
	        offsetRect.right = offsetRect.left + offsetRect.width;
	      }
	      return offsetRect;
	    },
	
	    isInView: function (childEl) {
	      var viewRect = this.getRect(this.viewport);
	      var childRect = this.getRect(childEl);
	      if (this.axis === 'y') {
	        return viewRect.top < childRect.bottom && viewRect.bottom > childRect.top;
	      }
	      return viewRect.left < childRect.right && viewRect.right > childRect.left;
	    },
	
	    scrollTo: function (offset, isSmooth) {
	      var that = this;
	      var element = this.element;
	
	      offset = -offset - this.options[this.axis + 'PaddingTop'];
	      offset = touchBoundary(this, offset);
	
	      isScrolling = true;
	      if (isSmooth === true) {
	        if (this.options.useFrameAnimation) {
	          var s0 = getTransformOffset(that)[this.axis];
	          var _s = offset - s0;
	          scrollAnimation = new lib.animation(400, lib.cubicbezier.easeInOut, 0, function (i1, i2) {
	            var offset = (s0 + _s * i2).toFixed(2);
	            setTransformStyle(that, offset);
	            fireEvent(that, 'scrolling');
	          });
	
	          scrollAnimation.onend(scrollEnd);
	
	          scrollAnimation.play();
	        } else {
	          setTransitionEndHandler(scrollEnd, 400);
	          setTransitionStyle(that, '0.4s', 'ease-in-out');
	          setTransformStyle(that, offset);
	
	          lib.animation.requestFrame(function () {
	            if (isScrolling && that.enabled) {
	              fireEvent(that, 'scrolling');
	              lib.animation.requestFrame(arguments.callee);
	            }
	          });
	        }
	      } else {
	        if (!this.options.useFrameAnimation) {
	          setTransitionStyle(that, '', '');
	        }
	        setTransformStyle(that, offset);
	        scrollEnd();
	      }
	
	      return this;
	    },
	
	    scrollToElement: function (childEl, isSmooth, topOffset) {
	      var offset = this.offset(childEl);
	      offset = offset[this.axis === 'y' ? 'top' : 'left'];
	      topOffset && (offset += topOffset);
	      return this.scrollTo(offset, isSmooth);
	    },
	
	    getViewWidth: function () {
	      return getBoundingClientRect(this.viewport).width;
	    },
	
	    getViewHeight: function () {
	      return getBoundingClientRect(this.viewport).height;
	    },
	
	    addPulldownHandler: function (handler) {
	      var that = this;
	      this.element.addEventListener('pulldownend', function (e) {
	        that.disable();
	        handler.call(that, e, function () {
	          that.scrollTo(0, true);
	          that.refresh();
	          that.enable();
	        });
	      }, false);
	
	      return this;
	    },
	
	    addPullupHandler: function (handler) {
	      var that = this;
	
	      this.element.addEventListener('pullupend', function (e) {
	        that.disable();
	        handler.call(that, e, function () {
	          that.scrollTo(that.getScrollHeight(), true);
	          that.refresh();
	          that.enable();
	        });
	      }, false);
	
	      return this;
	    },
	
	    addScrollstartHandler: function (handler) {
	      var that = this;
	      this.element.addEventListener('scrollstart', function (e) {
	        handler.call(that, e);
	      }, false);
	
	      return this;
	    },
	
	    addScrollingHandler: function (handler) {
	      var that = this;
	      this.element.addEventListener('scrolling', function (e) {
	        handler.call(that, e);
	      }, false);
	
	      return this;
	    },
	
	    addScrollendHandler: function (handler) {
	      var that = this;
	      this.element.addEventListener('scrollend', function (e) {
	        handler.call(that, e);
	      }, false);
	
	      return this;
	    },
	
	    addContentrenfreshHandler: function (handler) {
	      var that = this;
	      this.element.addEventListener('contentrefresh', function (e) {
	        handler.call(that, e);
	      }, false);
	    },
	
	    addEventListener: function (name, handler, useCapture) {
	      var that = this;
	      this.element.addEventListener(name, function (e) {
	        handler.call(that, e);
	      }, !!useCapture);
	    },
	
	    removeEventListener: function (name, handler) {
	      var that = this;
	      this.element.removeEventListener(name, function (e) {
	        handler.call(that, e);
	      });
	    },
	
	    enablePlugin: function (name, options) {
	      var plugin = plugins[name];
	      if (plugin && !this.plugins[name]) {
	        this.plugins[name] = true;
	        options = options || {};
	        plugin.call(this, name, options);
	      }
	      return this;
	    }
	  };
	
	  for (var k in proto) {
	    this[k] = proto[k];
	  }
	  // delete proto
	}
	
	lib.scroll = function (el, options) {
	  if (arguments.length === 1 && !(arguments[0] instanceof HTMLElement)) {
	    options = arguments[0];
	    if (options.scrollElement) {
	      el = options.scrollElement;
	    } else if (options.scrollWrap) {
	      el = options.scrollWrap.firstElementChild;
	    } else {
	      throw new Error('no scroll element');
	    }
	  }
	
	  if (!el.parentNode) {
	    throw new Error('wrong dom tree');
	  }
	  if (options && options.direction && ['x', 'y'].indexOf(options.direction) < 0) {
	    throw new Error('wrong direction');
	  }
	
	  var scroll;
	  if (options.downgrade === true && lib.scroll.downgrade) {
	    scroll = lib.scroll.downgrade(el, options);
	  } else {
	    if (el.scrollId) {
	      scroll = scrollObjs[el.scrollId];
	    } else {
	      scroll = new Scroll(el, options);
	    }
	  }
	  return scroll;
	};
	
	lib.scroll.plugin = function (name, constructor) {
	  if (constructor) {
	    name = name.split(',');
	    name.forEach(function (n) {
	      plugins[n] = constructor;
	    });
	  } else {
	    return plugins[name];
	  }
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	/* global lib: true */
	
	'use strict';
	
	/**
	 * transfer Quadratic Bezier Curve to Cubic Bezier Curve
	 *
	 * @param  {number} a abscissa of p1
	 * @param  {number} b ordinate of p1
	 * @return {Array} parameter matrix for cubic bezier curve
	 *   like [[p1x, p1y], [p2x, p2y]]
	 */
	
	function quadratic2cubicBezier(a, b) {
	  return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)], [(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
	}
	
	/**
	 * derive position data from knowing motion parameters
	 * base on Newton's second law: s = vt + at^2/2
	 *
	 * @param {object} config object of { v, a, s, t }
	 *   - v: initial velocity
	 *   - a: accelerate speed
	 *   - t: time
	 *   - s: shifting
	 */
	function Motion(config) {
	  this.v = config.v || 0;
	  this.a = config.a || 0;
	
	  if (typeof config.t !== 'undefined') {
	    this.t = config.t;
	  }
	
	  if (typeof config.s !== 'undefined') {
	    this.s = config.s;
	  }
	
	  // derive time from shifting
	  if (typeof this.t === 'undefined') {
	    if (typeof this.s === 'undefined') {
	      this.t = -this.v / this.a;
	    } else {
	      const t1 = (Math.sqrt(this.v * this.v + 2 * this.a * this.s) - this.v) / this.a;
	      const t2 = (-Math.sqrt(this.v * this.v + 2 * this.a * this.s) - this.v) / this.a;
	      this.t = Math.min(t1, t2);
	    }
	  }
	
	  // derive shifting from time
	  if (typeof this.s === 'undefined') {
	    this.s = this.a * this.t * this.t / 2 + this.v * this.t;
	  }
	}
	
	/**
	 * derive cubic bezier parameters from motion parameters
	 * @return {Array} parameter matrix for cubic bezier curve
	 *   like [[p1x, p1y], [p2x, p2y]]
	 */
	Motion.prototype.generateCubicBezier = function () {
	  return quadratic2cubicBezier(this.v / this.a, this.t + this.v / this.a);
	};
	
	!lib && (lib = {});
	lib.motion = Motion;
	
	module.exports = Motion;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	const List = __webpack_require__(35);
	
	function Hlist(data, nodeType) {
	  data.attr.direction = 'h';
	  List.call(this, data, nodeType);
	}
	
	Hlist.prototype = Object.create(List.prototype);
	
	module.exports = Hlist;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(30);
	const Kountdown = __webpack_require__(42);
	
	const FORMATTER_REGEXP = /(\\)?(dd*|hh?|mm?|ss?)/gi;
	
	function formatDateTime(data, formatter, timeColor) {
	  return formatter.replace(FORMATTER_REGEXP, function (m) {
	    const len = m.length;
	    const firstChar = m.charAt(0);
	    // escape character
	    if (firstChar === '\\') {
	      return m.replace('\\', '');
	    }
	    const value = (firstChar === 'd' ? data.days : firstChar === 'h' ? data.hours : firstChar === 'm' ? data.minutes : firstChar === 's' ? data.seconds : 0) + '';
	
	    // 5 zero should be enough
	    return '<span style="margin:4px;color:' + timeColor + '" >' + ('00000' + value).substr(-Math.max(value.length, len)) + '</span>';
	  });
	}
	
	function Countdown(data) {
	  Atomic.call(this, data);
	}
	
	Countdown.prototype = Object.create(Atomic.prototype);
	
	Countdown.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('weex-element');
	  const data = this.data;
	  const time = Number(data.attr.countdownTime) || 0;
	  const endTime = Date.now() / 1000 + time;
	  Kountdown({
	    endDate: endTime,
	    onUpdate: function (time) {
	      const timeColor = data.style.timeColor || '#000';
	      const result = formatDateTime(time, data.attr.formatterValue, timeColor);
	      node.innerHTML = result;
	    },
	    onEnd: function () {}
	  }).start();
	
	  return node;
	};
	
	Countdown.prototype.style = {
	  textColor: function (value) {
	    this.node.style.color = value;
	  }
	};
	
	module.exports = Countdown;

/***/ },
/* 42 */
/***/ function(module, exports) {

	var DAY_SECONDS = 86400,
	    HOUR_SECONDS = 3600,
	    MINUTE_SECONDS = 60,
	    FORMATTER_DEFAULT = 'd天hh时mm分ss秒',
	    FORMATTER_REGEXP = /(\\)?(dd*|hh?|mm?|ss?)/gi;
	
	/**
	 * 倒计时。此类无法直接实例化，请使用 lib.countdown(options) 进行实例化。
	 * @class CountDown
	 * @param {Object} options 倒计时参数。
	 * @param {CountDown~DateSource} options.endDate 倒计时的结束时间点。倒计时必需有此属性，否则会抛错。
	 * @param {CountDown~StringFormatter} options.stringFormatter 倒计时数据的字符串格式。
	 * @param {Int} options.interval 倒计时更新的间隔频率。单位为毫秒。 默认值为：1000，即1秒。
	 * @param {Int} options.correctDateOffset 修正倒计时的时间偏差值。单位为秒。此属性可用来修正服务端与客户端的时间差。
	 * @param {CountDown~onUpdate} options.onUpdate 倒计时每次更新的回调函数。
	 * @param {HTMLElement} options.updateElement 倒计时的更新元素。可快捷的把倒计时结果通过innerHTML更新到此元素中。
	 * @param {Function} options.onEnd 倒计时结束时的回调函数。
	 */
	var CountDown = function (options) {
	    options = options || {};
	
	    //parse end date
	    var me = this,
	        endDate = parseDate(options.endDate);
	    if (!endDate || !endDate.getTime()) {
	        throw new Error('Invalid endDate');
	    } else {
	        me.endDate = endDate;
	    }
	
	    me.onUpdate = options.onUpdate;
	    me.onEnd = options.onEnd;
	    me.interval = options.interval || 1000;
	    me.stringFormatter = options.stringFormatter || FORMATTER_DEFAULT;
	    me.correctDateOffset = options.correctDateOffset || 0;
	    me.updateElement = options.updateElement;
	
	    //internal use
	    me._data = { days: 0, hours: 0, minutes: 0, seconds: 0 };
	};
	
	CountDown.prototype = {
	    /**
	     * 启动倒计时。
	     * @memberOf CountDown.prototype
	     */
	    start: function () {
	        var me = this;
	        me.stop();
	
	        if (me._update()) {
	            me._intervalId = setInterval(function () {
	                me._update();
	            }, me.interval);
	        }
	
	        return me;
	    },
	
	    /**
	     * @private
	     */
	    _update: function () {
	        var me = this,
	            data = me._data,
	            elem = me.updateElement,
	            callback,
	            now = +new Date() + me.correctDateOffset * 1000,
	            diff = Math.max(0, Math.round((me.endDate.getTime() - now) / 1000)),
	            ended = diff <= 0;
	
	        //calc diff segment
	        data.totalSeconds = diff;
	        diff -= (data.days = Math.floor(diff / DAY_SECONDS)) * DAY_SECONDS;
	        diff -= (data.hours = Math.floor(diff / HOUR_SECONDS)) * HOUR_SECONDS;
	        diff -= (data.minutes = Math.floor(diff / MINUTE_SECONDS)) * MINUTE_SECONDS;
	        data.seconds = diff;
	
	        //format string value
	        data.stringValue = formatDateTime(data, me.stringFormatter);
	
	        //simple way to update element's content
	        if (elem) elem.innerHTML = data.stringValue;
	
	        //callback
	        (callback = me.onUpdate) && callback.call(me, data);
	        if (ended) {
	            me.stop();
	            (callback = me.onEnd) && callback.call(me);
	            return false;
	        }
	
	        return true;
	    },
	
	    /**
	     * 停止计时器。
	     * @memberOf CountDown.prototype
	     */
	    stop: function () {
	        var me = this;
	        if (me._intervalId) {
	            clearInterval(me._intervalId);
	            me._intervalId = null;
	        }
	        return me;
	    },
	
	    /**
	     * 设置结束时间。
	     * @memberOf CountDown.prototype
	     * @param {CountDown~DateSource} date 要设置的结束时间。 
	     */
	    setEndDate: function (date) {
	        var me = this;
	        me.endDate = parseDate(date);
	        return me;
	    }
	};
	
	function parseDate(source) {
	    var date;
	
	    if (typeof source === 'number') {
	        date = new Date(source * 1000);
	    } else if (typeof source === 'string') {
	        var firstChar = source.charAt(0),
	            plus = firstChar === '+',
	            minus = firstChar === '-';
	
	        if (plus || minus) {
	            //offset date formate
	            var value = source.substr(1),
	                offsetValue,
	                arr = value.split(':'),
	                time = [0, 0, 0, 0],
	                index = 4;
	
	            while (arr.length && --index >= 0) {
	                time[index] = parseInt(arr.pop()) || 0;
	            }
	            offsetValue = DAY_SECONDS * time[0] + HOUR_SECONDS * time[1] + MINUTE_SECONDS * time[2] + time[3];
	
	            date = new Date();
	            date.setSeconds(date.getSeconds() + offsetValue * (minus ? -1 : 1));
	            date.setMilliseconds(0);
	        }
	    }
	
	    if (!date) date = new Date(source);
	
	    return date;
	}
	
	function formatDateTime(data, formatter) {
	    return formatter.replace(FORMATTER_REGEXP, function (m) {
	        var len = m.length,
	            firstChar = m.charAt(0);
	        //escape character
	        if (firstChar === '\\') return m.replace('\\', '');
	        var value = (firstChar === 'd' ? data.days : firstChar === 'h' ? data.hours : firstChar === 'm' ? data.minutes : firstChar === 's' ? data.seconds : 0) + '';
	
	        //5 zero should be enough
	        return ('00000' + value).substr(-Math.max(value.length, len));
	    });
	}
	
	/**
	 * 倒计时的日期源数据。
	 * @typedef {(Date|String|Number)} CountDown~DateSource
	 * @desc 当日期源数据类型为：
	 * <ul>
	 * <li>Date - 标准值。</li>
	 * <li>Number - 表示结束时间点相对于January 1, 1970, 00:00:00 UTC的绝对值，单位是秒。比如：new Date('2014-12-30 23:00:00').getTime() / 1000。</li>
	 * <li>String - 当为字符串时，则：
	 * <ul>
	 * <li>若以+或-开始，则结束时间点以当前时间即new Date()为相对时间点，再加上或减去字符串后半部分所表示的时长。后半部分，若是一个数值则为秒数，或为字符串，则会按照日:小时:分钟:秒的格式进行解析。</li>
	 * <li>其他，则尝试直接通过new Date(endDate)转换为Date。</li>
	 * </ul></li>
	 * <li>其他情况，则尝试直接通过new Date(endDate)转换为Date。</li>
	 * </ul>
	 */
	
	/**
	 * 倒计时数据的字符串格式。
	 * @typedef {String} CountDown~StringFormatter
	 * @desc 跟大多数语言的日期格式化类似，比如：dd:hh:mm:ss。 此字串中的特殊字符有：
	 * <ul>
	 * <li>d - 天数。</li>
	 * <li>h - 小时。</li>
	 * <li>m - 分钟。</li>
	 * <li>s - 秒。</li>
	 * </ul>
	 * 其中，多个相同的字符表示数值的位数，若最高位不够，则用0补齐。注意：若要格式字串里加入特殊字符，需要用\\进行转义。比如：d\\day\\s, hh\\hour\\s, mm\\minute\\s, ss\\secon\\d\\s。 默认值为：d天hh时mm分ss秒。
	 */
	
	/**
	 * 倒计时每次更新的回调函数。
	 * @callback CountDown~onUpdate
	 * @param {Object} data 更新回调的参数。
	 * @param {String} data.stringValue 通过stringFormatter格式化后的倒计时字符串值。
	 * @param {Int} data.totalSeconds 倒计时的总秒数。
	 * @param {Int} data.days 倒计时的天数部分。
	 * @param {Int} data.hours 倒计时的小时部分。
	 * @param {Int} data.minutes 倒计时的分钟部分。
	 * @param {Int} data.seconds 倒计时的秒数部分。
	 */
	
	/**
	 * 返回一个倒计时 {@link CountDown} 对象。
	 * @memberOf lib
	 * @function
	 * @param {Object} options 倒计时参数，与 {@link CountDown} 构造函数参数一致。
	 * @example
	 * var cd = lib.countdown({
	 *   endDate: '2014-12-30 23:00:00',
	 *   stringFormatter: 'd天 hh小时mm分ss秒',
	 *   onUpdate: function(data){
	 *     elem.innerHTML = data.stringValue;
	 *   },
	 *   onEnd: function(){
	 *       console.log('countdown ended');
	 *   }
	 * }).start();
	 */
	if (typeof window.lib === 'undefined') {
	    lib = {};
	}
	lib.countdown = function (options) {
	    return new CountDown(options);
	};
	
	module.exports = lib.countdown;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	// const config = require('../config')
	
	const Component = __webpack_require__(17);
	const ComponentManager = __webpack_require__(10);
	const LazyLoad = __webpack_require__(13);
	
	function Marquee(data) {
	  this.interval = Number(data.attr.interval) || 5 * 1000;
	  this.transitionDuration = Number(data.attr.transitionDuration) || 500;
	  this.delay = Number(data.attr.delay) || 0;
	  Component.call(this, data);
	}
	
	Marquee.prototype = Object.create(Component.prototype);
	
	Marquee.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('weex-container');
	  node.style.overflow = 'hidden';
	  // fix page shaking during slider's playing
	  node.style.webkitTransform = 'translate3D(0,0,0)';
	  node.addEventListener('webkitTransitionEnd', this.end.bind(this), false);
	  return node;
	};
	
	Marquee.prototype.createChildren = function () {
	  // first run:
	  // - create each child
	  // - append to parentNode
	  // - find current and next
	  // - set current and next shown and others hidden
	  const children = this.data.children;
	  const parentRef = this.data.ref;
	  const instanceId = this.data.instanceId;
	  const items = [];
	  const componentManager = this.getComponentManager();
	
	  let fragment, isFlex, child, i;
	
	  if (children && children.length) {
	    fragment = document.createDocumentFragment();
	    isFlex = false;
	    for (i = 0; i < children.length; i++) {
	      children[i].scale = this.data.scale;
	      children[i].instanceId = instanceId;
	      child = componentManager.createElement(children[i]);
	      child.parentRef = parentRef;
	      this.initChild(child);
	      // append and push
	      items.push(child);
	      fragment.appendChild(child.node);
	      if (!isFlex && child.data.style.hasOwnProperty('flex')) {
	        isFlex = true;
	      }
	    }
	    this.node.appendChild(fragment);
	  }
	
	  // set items
	  this.items = items;
	
	  // reset the clock for first transition
	  this.reset();
	};
	
	Marquee.prototype.initChild = function (child) {
	  const node = child.node;
	  node.style.position = 'absolute';
	  node.style.top = '0';
	  node.style.left = '0';
	};
	
	Marquee.prototype.appendChild = function (data) {
	  // dom + items
	  const componentManager = ComponentManager.getInstance(this.data.instanceId);
	  const child = componentManager.createElement(data);
	  this.initChild(child);
	  this.node.appendChild(child.node);
	  this.items.push(child);
	  this.reset();
	  return child; // @todo redesign Component#appendChild(component)
	};
	
	Marquee.prototype.insertBefore = function (child, before) {
	  // dom + items
	  const index = this.items.indexOf(before);
	  this.items.splice(index, 0, child);
	  this.initChild(child);
	  this.node.insertBefore(child.node, before.node);
	  this.reset();
	};
	
	Marquee.prototype.removeChild = function (child) {
	  // dom + items
	  const index = this.items.indexOf(child);
	  this.items.splice(index, 1);
	  this.node.removeChild(child.node);
	  this.reset();
	};
	
	/**
	 * status: {
	 *   current: {translateY: 0, shown: true},
	 *   next: {translateY: height, shown: true},
	 *   others[]: {shown: false}
	 *   index: index
	 * }
	 */
	Marquee.prototype.reset = function () {
	  const interval = this.interval - 0;
	  const delay = this.delay - 0;
	  const items = this.items;
	  const self = this;
	
	  const loop = function () {
	    self.next();
	    self.timerId = setTimeout(loop, self.interval);
	  };
	
	  // reset display and transform
	  items.forEach(function (item, index) {
	    const node = item.node;
	    // set non-current(0)|next(1) item hidden
	    node.style.display = index > 1 ? 'none' : '';
	    // set next(1) item translateY
	    // TODO: it supposed to use item.data.style
	    // but somehow the style object is empty.
	    // This problem relies on jsframework's bugfix.
	
	    // node.style.transform = index === 1
	    //     ? 'translate3D(0,' + config.scale * item.data.style.height + 'px,0)'
	    //     : ''
	    // node.style.webkitTransform = index === 1
	    //     ? 'translate3D(0,' + config.scale * item.data.style.height + 'px,0)'
	    //     : ''
	    node.style.transform = index === 1 ? 'translate3D(0,' + self.data.scale * self.data.style.height + 'px,0)' : '';
	    node.style.webkitTransform = index === 1 ? 'translate3D(0,' + self.data.scale * self.data.style.height + 'px,0)' : '';
	  });
	
	  setTimeout(function () {
	    // reset current, next, index
	    self.currentItem = items[0];
	    self.nextItem = items[1];
	    self.currentIndex = 0;
	
	    items.forEach(function (item, index) {
	      const node = item.node;
	      // set transition
	      node.style.transition = 'transform ' + self.transitionDuration + 'ms ease';
	      node.style.webkitTransition = '-webkit-transform ' + self.transitionDuration + 'ms ease';
	    });
	
	    clearTimeout(self.timerId);
	
	    if (items.length > 1) {
	      self.timerId = setTimeout(loop, delay + interval);
	    }
	  }, 13);
	};
	
	/**
	 * next:
	 * - current: {translateY: -height}
	 * - next: {translateY: 0}
	 */
	Marquee.prototype.next = function () {
	  // - update state
	  //   - set current and next transition
	  //   - hide current when transition end
	  //   - set next to current
	  //   - find new next
	  const next = this.nextItem.node;
	  const current = this.currentItem.node;
	  this.transitionIndex = this.currentIndex;
	
	  // Use setTimeout to fix the problem that when the
	  // page recover from backstage, the slider will
	  // not work any longer.
	  setTimeout(function () {
	    next.style.transform = 'translate3D(0,0,0)';
	    next.style.webkitTransform = 'translate3D(0,0,0)';
	    current.style.transform = 'translate3D(0,-' + this.data.scale * this.data.style.height + 'px,0)';
	    current.style.webkitTransform = 'translate3D(0,-' + this.data.scale * this.data.style.height + 'px,0)';
	    this.fireEvent('change');
	  }.bind(this), 300);
	};
	
	Marquee.prototype.fireEvent = function (type) {
	  const length = this.items.length;
	  const nextIndex = (this.currentIndex + 1) % length;
	  const evt = document.createEvent('HTMLEvents');
	  evt.initEvent(type, false, false);
	  evt.data = {
	    prevIndex: this.currentIndex,
	    index: nextIndex
	  };
	  this.node.dispatchEvent(evt);
	};
	
	/**
	 * end:
	 * - old current: {shown: false}
	 * - old current: {translateY: 0}
	 * - index++ % length
	 * - new current = old next
	 * - new next = items[index+1 % length]
	 * - new next: {translateY: height}
	 * - new next: {shown: true}
	 */
	Marquee.prototype.end = function (e) {
	  const items = this.items;
	  const length = items.length;
	  let currentIndex;
	
	  currentIndex = this.transitionIndex;
	
	  if (isNaN(currentIndex)) {
	    return;
	  }
	  delete this.transitionIndex;
	
	  const current = this.currentItem.node;
	  current.style.display = 'none';
	  current.style.webkitTransform = '';
	
	  currentIndex = (currentIndex + 1) % length;
	  const nextIndex = (currentIndex + 1) % length;
	
	  this.currentIndex = currentIndex;
	  this.currentItem = this.nextItem;
	  this.nextItem = items[nextIndex];
	
	  setTimeout(function () {
	    const next = this.nextItem.node;
	    // TODO: it supposed to use this.nextItem.data.style
	    // but somehow the style object is empty.
	    // This problem relies on jsframework's bugfix.
	
	    next.style.webkitTransform = 'translate3D(0,' + this.data.scale * this.data.style.height + 'px,0)';
	    next.style.display = '';
	    LazyLoad.loadIfNeeded(next);
	  }.bind(this));
	};
	
	Marquee.prototype.attr = {
	  interval: function (value) {
	    this.interval = value;
	  },
	  transitionDuration: function (value) {
	    this.transitionDuration = value;
	  },
	  delay: function (value) {
	    this.delay = value;
	  }
	};
	
	Marquee.prototype.clearAttr = function () {
	  this.interval = 5 * 1000;
	  this.transitionDuration = 500;
	  this.delay = 0;
	};
	
	module.exports = Marquee;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* global lib */
	
	'use strict';
	
	const extend = __webpack_require__(8).extend;
	// const config = require('../config')
	const Component = __webpack_require__(17);
	// const ComponentManager = require('../componentManager')
	// const LazyLoad = require('../lazyLoad')
	__webpack_require__(45);
	__webpack_require__(52);
	
	const DEFAULT_INTERVAL = 3000;
	
	function Slider(data) {
	  this.autoPlay = false; // default value is false.
	  this.interval = DEFAULT_INTERVAL;
	  this.direction = 'row'; // 'column' is not temporarily supported.
	  this.children = [];
	  this.isPageShow = true;
	  this.isDomRendering = true;
	
	  // bind event 'pageshow', 'pagehide' and 'visibilitychange' on window.
	  this._idleWhenPageDisappear();
	  // bind event 'renderBegin' and 'renderEnd' on window.
	  this._idleWhenDomRendering();
	
	  Component.call(this, data);
	}
	
	Slider.prototype = Object.create(Component.prototype);
	
	Slider.prototype._idleWhenPageDisappear = function () {
	  const _this = this;
	  function handlePageShow() {
	    _this.isPageShow = true;
	    _this.autoPlay && !_this.isDomRendering && _this.play();
	  }
	  function handlePageHide() {
	    _this.isPageShow = false;
	    _this.stop();
	  }
	  window.addEventListener('pageshow', handlePageShow);
	  window.addEventListener('pagehide', handlePageHide);
	  document.addEventListener('visibilitychange', function () {
	    if (document.visibilityState === 'visible') {
	      handlePageShow();
	    } else if (document.visibilityState === 'hidden') {
	      handlePageHide();
	    }
	  });
	};
	
	Slider.prototype._idleWhenDomRendering = function () {
	  const _this = this;
	  window.addEventListener('renderend', function () {
	    _this.isDomRendering = false;
	    _this.autoPlay && _this.isPageShow && _this.play();
	  });
	  window.addEventListener('renderbegin', function () {
	    _this.isDomRendering = true;
	    _this.stop();
	  });
	};
	
	Slider.prototype.attr = {
	  interval: function (val) {
	    this.interval = parseInt(val) || DEFAULT_INTERVAL;
	    if (this.carrousel) {
	      this.carrousel.playInterval = this.interval;
	    }
	  },
	
	  playstatus: function (val) {
	    this.playstatus = val && val !== 'false';
	    this.autoPlay = this.playstatus;
	    if (this.carrousel) {
	      if (this.playstatus) {
	        this.play();
	      } else {
	        this.stop();
	      }
	    }
	  },
	
	  // support playstatus' alias auto-play for compatibility
	  autoPlay: function (val) {
	    this.attr.playstatus.call(this, val);
	  }
	};
	
	Slider.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('slider');
	  node.style.position = 'relative';
	  node.style.overflow = 'hidden';
	  return node;
	};
	
	Slider.prototype._doRender = function () {
	  const _this = this;
	  _this.createChildren();
	  _this.onAppend();
	};
	
	Slider.prototype.removeChild = function (child) {
	  const children = this.data.children;
	  if (children) {
	    for (let i = 0; i < children.length; i++) {
	      if (child.data.ref === children[i].ref) {
	        children.splice(i, 1);
	        break;
	      }
	    }
	  }
	
	  this._doRender();
	};
	
	Slider.prototype.insertBefore = function (child, before) {
	  const children = this.data.children;
	  let childIndex = -1;
	  for (let i = 0, l = children.length; i < l; i++) {
	    if (children[i].ref === before.data.ref) {
	      childIndex = i;
	      break;
	    }
	  }
	  children.splice(childIndex, 0, child.data);
	
	  this._doRender();
	  if (this.children.length > 0) {
	    return this.children[this.children.length - 1];
	  }
	};
	
	Slider.prototype.appendChild = function (data) {
	  const children = this.data.children || (this.data.children = []);
	  children.push(data);
	  this._doRender();
	  if (this.children.length > 0) {
	    return this.children[this.children.length - 1];
	  }
	};
	
	Slider.prototype.createChildren = function () {
	  const componentManager = this.getComponentManager();
	
	  // recreate slider container.
	  if (this.sliderContainer) {
	    this.node.removeChild(this.sliderContainer);
	  }
	  if (this.indicator) {
	    this.indicator.node.parentNode.removeChild(this.indicator.node);
	  }
	  this.children = [];
	
	  const sliderContainer = document.createElement('ul');
	  sliderContainer.style.listStyle = 'none';
	  this.node.appendChild(sliderContainer);
	  this.sliderContainer = sliderContainer;
	
	  const children = this.data.children;
	  const scale = this.data.scale;
	  const fragment = document.createDocumentFragment();
	  let indicatorData, width, height;
	  let childWidth = 0;
	  let childHeight = 0;
	
	  if (children && children.length) {
	    for (let i = 0; i < children.length; i++) {
	      let child;
	      children[i].scale = this.data.scale;
	      children[i].instanceId = this.data.instanceId;
	      if (children[i].type === 'indicator') {
	        indicatorData = extend(children[i], {
	          extra: {
	            amount: children.length - 1,
	            index: 0
	          }
	        });
	      } else {
	        child = componentManager.createElement(children[i], 'li');
	        this.children.push(child);
	        fragment.appendChild(child.node);
	        width = child.data.style.width || 0;
	        height = child.data.style.height || 0;
	        width > childWidth && (childWidth = width);
	        height > childHeight && (childHeight = height);
	        child.parentRef = this.data.ref;
	      }
	    }
	    // append indicator
	    if (indicatorData) {
	      indicatorData.extra.width = this.data.style.width || childWidth;
	      indicatorData.extra.height = this.data.style.height || childHeight;
	      this.indicator = componentManager.createElement(indicatorData);
	      this.indicator.parentRef = this.data.ref;
	      this.indicator.slider = this;
	      this.node.appendChild(this.indicator.node);
	    }
	
	    sliderContainer.style.height = scale * this.data.style.height + 'px';
	    sliderContainer.appendChild(fragment);
	  }
	};
	
	Slider.prototype.onAppend = function () {
	  if (this.carrousel) {
	    this.carrousel.removeEventListener('change', this._getSliderChangeHandler());
	    this.carrousel.stop();
	    this.carrousel = null;
	  }
	  const Carrousel = lib.carrousel;
	  this.carrousel = new Carrousel(this.sliderContainer, {
	    autoplay: this.autoPlay,
	    useGesture: true
	  });
	
	  this.carrousel.playInterval = this.interval;
	  this.carrousel.addEventListener('change', this._getSliderChangeHandler());
	  this.currentIndex = 0;
	
	  // preload all images for slider
	  // because:
	  // 1. lib-img doesn't listen to event transitionend
	  // 2. even if we fire lazy load in slider's change event handler,
	  //    the next image still won't be preloaded utill the moment it
	  //    slides into the view, which is too late.
	  if (this.preloadImgsTimer) {
	    clearTimeout(this.preloadImgsTimer);
	  }
	  // The time just before the second slide appear and enough
	  // for all child elements to append is ok.
	  const preloadTime = 0.8;
	  this.preloadImgsTimer = setTimeout(function () {
	    const imgs = this.carrousel.element.querySelectorAll('.weex-img');
	    for (let i = 0, l = imgs.length; i < l; i++) {
	      const img = imgs[i];
	      const iLazySrc = img.getAttribute('i-lazy-src');
	      const imgSrc = img.getAttribute('img-src');
	      if (iLazySrc) {
	        img.style.backgroundImage = 'url(' + iLazySrc + ')';
	      } else if (imgSrc) {
	        img.style.backgroundImage = 'url(' + imgSrc + ')';
	      }
	      img.removeAttribute('i-lazy-src');
	      img.removeAttribute('img-src');
	    }
	  }.bind(this), preloadTime * 1000);
	
	  // avoid page scroll when panning
	  let panning = false;
	  this.carrousel.element.addEventListener('panstart', function (e) {
	    if (!e.isVertical) {
	      panning = true;
	    }
	  });
	  this.carrousel.element.addEventListener('panend', function (e) {
	    if (!e.isVertical) {
	      panning = false;
	    }
	  });
	
	  document.addEventListener('touchmove', function (e) {
	    if (panning) {
	      e.preventDefault();
	      return false;
	    }
	    return true;
	  });
	};
	
	Slider.prototype._updateIndicators = function () {
	  this.indicator && this.indicator.setIndex(this.currentIndex);
	};
	
	Slider.prototype._getSliderChangeHandler = function (e) {
	  if (!this.sliderChangeHandler) {
	    this.sliderChangeHandler = function (e) {
	      const index = this.carrousel.items.index;
	      this.currentIndex = index;
	
	      // updateIndicators
	      this._updateIndicators();
	
	      this.dispatchEvent('change', { index: index });
	    }.bind(this);
	  }
	  return this.sliderChangeHandler;
	};
	
	Slider.prototype.play = function () {
	  this.carrousel.play();
	};
	
	Slider.prototype.stop = function () {
	  this.carrousel.stop();
	};
	
	Slider.prototype.slideTo = function (index) {
	  const offset = index - this.currentIndex;
	  this.carrousel.items.slide(offset);
	};
	
	module.exports = Slider;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-disable */
	
	'use strict';
	
	__webpack_require__(46);
	__webpack_require__(47);
	__webpack_require__(48);
	__webpack_require__(49);
	
	var doc = window.document;
	var ua = window.navigator.userAgent;
	var Firefox = !!ua.match(/Firefox/i);
	var IEMobile = !!ua.match(/IEMobile/i);
	var cssPrefix = Firefox ? '-moz-' : IEMobile ? '-ms-' : '-webkit-';
	var stylePrefix = Firefox ? 'Moz' : IEMobile ? 'ms' : 'webkit';
	
	var timer = __webpack_require__(51);
	var setTimeout = timer.setTimeout;
	var clearTimeout = timer.clearTimeout;
	
	function getTransformOffset(element) {
	  var offset = { x: 0, y: 0 };
	  var transform = getComputedStyle(element)[stylePrefix + 'Transform'];
	  var regMatrix3d = new RegExp('^matrix3d\\((?:[-\\d.]+,\\s*){12}([-\\d.]+),' + '\\s*([-\\d.]+)(?:,\\s*[-\\d.]+){2}\\)');
	  var regMatrix = /^matrix\((?:[-\d.]+,\s*){4}([-\d.]+),\s*([-\d.]+)\)$/;
	  var matched;
	
	  if (transform !== 'none') {
	    if (matched = transform.match(regMatrix3d) || transform.match(regMatrix)) {
	      offset.x = parseFloat(matched[1]) || 0;
	      offset.y = parseFloat(matched[2]) || 0;
	    }
	  }
	
	  return offset;
	}
	
	var CSSMatrix = IEMobile ? 'MSCSSMatrix' : 'WebKitCSSMatrix';
	var has3d = !!Firefox || CSSMatrix in window && 'm11' in new window[CSSMatrix]();
	function getTranslate(x, y) {
	  x = parseFloat(x);
	  y = parseFloat(y);
	
	  if (x != 0) {
	    x += 'px';
	  }
	
	  if (y != 0) {
	    y += 'px';
	  }
	
	  if (has3d) {
	    return 'translate3d(' + x + ', ' + y + ', 0)';
	  }
	
	  return 'translate(' + x + ', ' + y + ')';
	}
	
	var slice = Array.prototype.slice;
	function ArrayFrom(a) {
	  return slice.call(a);
	}
	
	var incId = 0;
	function Carrousel(element, options) {
	  var that = this;
	  var views = [];
	  var pages = {};
	  var id = Date.now() + '-' + ++incId;
	  var root = document.createDocumentFragment();
	
	  if (arguments.length === 1 && !(arguments[0] instanceof HTMLElement)) {
	    options = arguments[0];
	    element = null;
	  }
	
	  if (!element) {
	    element = document.createElement('ul');
	    root.appendChild(element);
	  }
	  options = options || {};
	
	  element.setAttribute('data-ctrl-name', 'carrousel');
	  element.setAttribute('data-ctrl-id', id);
	
	  function fireEvent(name, extra) {
	    var ev = doc.createEvent('HTMLEvents');
	    ev.initEvent(name, false, false);
	    if (extra) {
	      for (var key in extra) {
	        ev[key] = extra[key];
	      }
	    }
	    root.dispatchEvent(ev);
	  }
	
	  element.style.position = 'relative';
	  element.style[stylePrefix + 'Transform'] = getTranslate(0, 0);
	
	  var transformOffset = 0;
	  var items = {};
	  var itemLength = 0;
	  var itemStep = options.step || element.getBoundingClientRect().width;
	  var itemIndex = 0;
	
	  items.add = function (html) {
	    var li = document.createElement('li');
	    li.style.display = 'none';
	    li.style.float = 'left';
	    li.index = itemLength;
	    if (typeof html === 'string') {
	      li.innerHTML = html;
	    } else if (html instanceof HTMLElement) {
	      li.appendChild(html);
	    }
	    element.appendChild(li);
	
	    Object.defineProperty(items, itemLength + '', {
	      get: function () {
	        return li;
	      }
	    });
	
	    itemLength++;
	    return li;
	  };
	
	  function normalizeIndex(index) {
	    while (index < 0) {
	      index += itemLength;
	    }
	
	    while (index >= itemLength) {
	      index -= itemLength;
	    }
	
	    return index;
	  }
	
	  items.get = function (index) {
	    return items[normalizeIndex(index)];
	  };
	
	  items.getCloned = function (index) {
	    var index = normalizeIndex(index);
	    var item = element.querySelector('[cloned="cloned-' + index + '"]');
	    var originalItem = items[index];
	
	    // If there a _listeners attribute on the dom element
	    // then clone the _listeners as well for the events' binding
	    function cloneEvents(origin, clone, deep) {
	      var listeners = origin._listeners;
	      if (listeners) {
	        clone._listeners = listeners;
	        for (var type in listeners) {
	          clone.addEventListener(type, listeners[type]);
	        }
	      }
	      if (deep && origin.children && origin.children.length) {
	        for (var i = 0, l = origin.children.length; i < l; i++) {
	          cloneEvents(origin.children[i], clone.children[i], deep);
	        }
	      }
	    }
	
	    if (!item) {
	      item = originalItem.cloneNode(true);
	      cloneEvents(originalItem, item, true);
	
	      element.appendChild(item);
	      item.setAttribute('cloned', 'cloned-' + index);
	      item.index = index;
	    }
	
	    return item;
	  };
	
	  function activate(index) {
	    if (itemLength === 0) {
	      return;
	    }
	
	    var curItem = items.get(index);
	    var prevItem;
	    var nextItem;
	
	    if (itemLength > 1) {
	      prevItem = items.get(index - 1);
	
	      if (itemLength === 2) {
	        nextItem = items.getCloned(index + 1);
	      } else {
	        nextItem = items.get(index + 1);
	      }
	
	      curItem.style.left = -transformOffset + 'px';
	      prevItem.style.left = -transformOffset - itemStep + 'px';
	      nextItem.style.left = -transformOffset + itemStep + 'px';
	    }
	
	    itemIndex = curItem.index;
	
	    fireEvent('change', {
	      prevItem: prevItem,
	      curItem: curItem,
	      nextItem: nextItem
	    });
	  }
	
	  items.slide = function (index) {
	    if (itemLength === 0) {
	      return;
	    }
	
	    if (itemLength === 1) {
	      index = 0;
	    }
	
	    var startOffset = getTransformOffset(element).x;
	    var endOffset = transformOffset + itemStep * -index;
	    var interOffset = endOffset - startOffset;
	
	    if (interOffset === 0) {
	      return;
	    }
	
	    var anim = new lib.animation(400, lib.cubicbezier.ease, function (i1, i2) {
	      element.style[stylePrefix + 'Transform'] = getTranslate(startOffset + interOffset * i2, 0);
	    }).play().then(function () {
	      transformOffset = endOffset;
	      element.style[stylePrefix + 'Transform'] = getTranslate(endOffset, 0);
	      index && activate(itemIndex + index);
	    });
	  };
	
	  items.next = function () {
	    items.slide(1);
	  };
	
	  items.prev = function () {
	    items.slide(-1);
	  };
	
	  ArrayFrom(element.children).forEach(function (el) {
	    el.style.position = 'absolute';
	    el.style.top = '0';
	    el.style.left = itemLength * itemStep + 'px';
	    el.style.float = 'left';
	    el.index = itemLength;
	    Object.defineProperty(items, itemLength + '', {
	      get: function () {
	        return el;
	      }
	    });
	
	    itemLength++;
	  });
	
	  Object.defineProperty(this, 'items', {
	    get: function () {
	      return items;
	    }
	  });
	
	  Object.defineProperty(items, 'length', {
	    get: function () {
	      return itemLength;
	    }
	  });
	
	  Object.defineProperty(items, 'index', {
	    get: function () {
	      return itemIndex;
	    }
	  });
	
	  Object.defineProperty(items, 'step', {
	    get: function () {
	      return itemStep;
	    },
	
	    set: function (v) {
	      itemStep = v;
	    }
	  });
	
	  var starting = false;
	  var playing = false;
	  var isSliding = false;
	  this.play = function () {
	    if (!starting) {
	      starting = true;
	      return activate(0);
	    }
	
	    if (!!playing) {
	      return;
	    }
	
	    playing = setTimeout(function play() {
	      isSliding = true;
	      items.next();
	      setTimeout(function () {
	        isSliding = false;
	      }, 500);
	      playing = setTimeout(play, 400 + playInterval);
	    }, 400 + playInterval);
	  };
	
	  this.stop = function () {
	    if (!playing) {
	      return;
	    }
	    clearTimeout(playing);
	    setTimeout(function () {
	      playing = false;
	    }, 500);
	  };
	
	  var autoplay = false;
	  var readyToPlay = false;
	  Object.defineProperty(this, 'autoplay', {
	    get: function () {
	      return autoplay;
	    },
	    set: function (v) {
	      autoplay = !!v;
	      if (readyToPlay) {
	        clearTimeout(readyToPlay);
	        readyToPlay = false;
	      }
	      if (autoplay) {
	        readyToPlay = setTimeout(function () {
	          that.play();
	        }, 2000);
	      } else {
	        that.stop();
	      }
	    }
	  });
	  this.autoplay = !!options.autoplay;
	
	  var playInterval = 1500;
	  Object.defineProperty(this, 'playInterval', {
	    get: function () {
	      return playInterval;
	    },
	    set: function (n) {
	      playInterval = n;
	    }
	  });
	  this.playInterval = !!options.playInterval || 1500;
	
	  if (options.useGesture) {
	    var panning = false;
	    var displacement;
	    element.addEventListener('panstart', function (e) {
	      if (!e.isVertical && !(panning && isSliding)) {
	        e.preventDefault();
	        e.stopPropagation();
	
	        if (autoplay) {
	          that.stop();
	        }
	
	        displacement = 0;
	        panning = true;
	      }
	    });
	
	    element.addEventListener('panmove', function (e) {
	      if (!e.isVertical && panning) {
	        e.preventDefault();
	        e.stopPropagation();
	        displacement = e.displacementX;
	        element.style[stylePrefix + 'Transform'] = getTranslate(transformOffset + displacement, 0);
	      }
	    });
	
	    element.addEventListener('panend', function (e) {
	      if (!e.isVertical && panning) {
	        e.preventDefault();
	        e.stopPropagation();
	        panning = false;
	        if (e.isSwipe) {
	          if (displacement < 0) {
	            items.next();
	          } else {
	            items.prev();
	          }
	        } else {
	          if (Math.abs(displacement) < itemStep / 2) {
	            items.slide(0);
	          } else {
	            items.slide(displacement < 0 ? 1 : -1);
	          }
	        }
	
	        if (autoplay) {
	          setTimeout(function () {
	            that.play();
	          }, 2000);
	        }
	      }
	    }, false);
	
	    element.addEventListener('swipe', function (e) {
	      if (!e.isVertical) {
	        e.preventDefault();
	        e.stopPropagation();
	      }
	    });
	  }
	
	  this.addEventListener = function (name, handler) {
	    this.root.addEventListener(name, handler, false);
	  };
	
	  this.removeEventListener = function (name, handler) {
	    this.root.removeEventListener(name, handler, false);
	  };
	
	  this.root = root;
	  this.element = element;
	}
	
	!lib && (lib = {});
	lib.carrousel = Carrousel;

/***/ },
/* 46 */
/***/ function(module, exports) {

	/* eslint-disable */
	
	'use strict';
	
	var isInitialized = false;
	
	// major events supported:
	//   panstart
	//   panmove
	//   panend
	//   swipe
	//   longpress
	// extra events supported:
	//   dualtouchstart
	//   dualtouch
	//   dualtouchend
	//   tap
	//   doubletap
	//   pressend
	
	var doc = window.document;
	var docEl = doc.documentElement;
	var slice = Array.prototype.slice;
	var gestures = {};
	var lastTap = null;
	
	/**
	 * find the closest common ancestor
	 * if there's no one, return null
	 *
	 * @param  {Element} el1 first element
	 * @param  {Element} el2 second element
	 * @return {Element}     common ancestor
	 */
	function getCommonAncestor(el1, el2) {
	  var el = el1;
	  while (el) {
	    if (el.contains(el2) || el == el2) {
	      return el;
	    }
	    el = el.parentNode;
	  }
	  return null;
	}
	
	/**
	 * fire a HTMLEvent
	 *
	 * @param  {Element} element which element to fire a event on
	 * @param  {string}  type    type of event
	 * @param  {object}  extra   extra data for the event object
	 */
	function fireEvent(element, type, extra) {
	  var event = doc.createEvent('HTMLEvents');
	  event.initEvent(type, true, true);
	
	  if (typeof extra === 'object') {
	    for (var p in extra) {
	      event[p] = extra[p];
	    }
	  }
	
	  element.dispatchEvent(event);
	}
	
	/**
	 * calc the transform
	 * assume 4 points ABCD on the coordinate system
	 * > rotate：angle rotating from AB to CD
	 * > scale：scale ratio from AB to CD
	 * > translate：translate shift from A to C
	 *
	 * @param  {number} x1 abscissa of A
	 * @param  {number} y1 ordinate of A
	 * @param  {number} x2 abscissa of B
	 * @param  {number} y2 ordinate of B
	 * @param  {number} x3 abscissa of C
	 * @param  {number} y3 ordinate of C
	 * @param  {number} x4 abscissa of D
	 * @param  {number} y4 ordinate of D
	 * @return {object}    transform object like
	 *   {rotate, scale, translate[2], matrix[3][3]}
	 */
	function calc(x1, y1, x2, y2, x3, y3, x4, y4) {
	  var rotate = Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y2 - y1, x2 - x1);
	  var scale = Math.sqrt((Math.pow(y4 - y3, 2) + Math.pow(x4 - x3, 2)) / (Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)));
	  var translate = [x3 - scale * x1 * Math.cos(rotate) + scale * y1 * Math.sin(rotate), y3 - scale * y1 * Math.cos(rotate) - scale * x1 * Math.sin(rotate)];
	
	  return {
	    rotate: rotate,
	    scale: scale,
	    translate: translate,
	    matrix: [[scale * Math.cos(rotate), -scale * Math.sin(rotate), translate[0]], [scale * Math.sin(rotate), scale * Math.cos(rotate), translate[1]], [0, 0, 1]]
	  };
	}
	
	/**
	 * take over the touchstart events. Add new touches to the gestures.
	 * If there is no previous records, then bind touchmove, tochend
	 * and touchcancel events.
	 * new touches initialized with state 'tapping', and within 500 milliseconds
	 * if the state is still tapping, then trigger gesture 'press'.
	 * If there are two touche points, then the 'dualtouchstart' is triggerd. The
	 * node of the touch gesture is their cloest common ancestor.
	 *
	 * @event
	 * @param  {event} event
	 */
	function touchstartHandler(event) {
	
	  if (Object.keys(gestures).length === 0) {
	    docEl.addEventListener('touchmove', touchmoveHandler, false);
	    docEl.addEventListener('touchend', touchendHandler, false);
	    docEl.addEventListener('touchcancel', touchcancelHandler, false);
	  }
	
	  // record every touch
	  for (var i = 0; i < event.changedTouches.length; i++) {
	    var touch = event.changedTouches[i];
	    var touchRecord = {};
	
	    for (var p in touch) {
	      touchRecord[p] = touch[p];
	    }
	
	    var gesture = {
	      startTouch: touchRecord,
	      startTime: Date.now(),
	      status: 'tapping',
	      element: event.srcElement || event.target,
	      pressingHandler: setTimeout(function (element, touch) {
	        return function () {
	          if (gesture.status === 'tapping') {
	            gesture.status = 'pressing';
	
	            fireEvent(element, 'longpress', {
	              // add touch data for weex
	              touch: touch,
	              touches: event.touches,
	              changedTouches: event.changedTouches,
	              touchEvent: event
	            });
	          }
	
	          clearTimeout(gesture.pressingHandler);
	          gesture.pressingHandler = null;
	        };
	      }(event.srcElement || event.target, event.changedTouches[i]), 500)
	    };
	    gestures[touch.identifier] = gesture;
	  }
	
	  if (Object.keys(gestures).length == 2) {
	    var elements = [];
	
	    for (var p in gestures) {
	      elements.push(gestures[p].element);
	    }
	
	    fireEvent(getCommonAncestor(elements[0], elements[1]), 'dualtouchstart', {
	      touches: slice.call(event.touches),
	      touchEvent: event
	    });
	  }
	}
	
	/**
	 * take over touchmove events, and handle pan and dual related gestures.
	 *
	 * 1. traverse every touch point：
	 * > if 'tapping' and the shift is over 10 pixles, then it's a 'panning'.
	 * 2. if there are two touch points, then calc the tranform and trigger
	 *   'dualtouch'.
	 *
	 * @event
	 * @param  {event} event
	 */
	function touchmoveHandler(event) {
	  for (var i = 0; i < event.changedTouches.length; i++) {
	    var touch = event.changedTouches[i];
	    var gesture = gestures[touch.identifier];
	
	    if (!gesture) {
	      return;
	    }
	
	    if (!gesture.lastTouch) {
	      gesture.lastTouch = gesture.startTouch;
	    }
	    if (!gesture.lastTime) {
	      gesture.lastTime = gesture.startTime;
	    }
	    if (!gesture.velocityX) {
	      gesture.velocityX = 0;
	    }
	    if (!gesture.velocityY) {
	      gesture.velocityY = 0;
	    }
	    if (!gesture.duration) {
	      gesture.duration = 0;
	    }
	
	    var time = Date.now() - gesture.lastTime;
	    var vx = (touch.clientX - gesture.lastTouch.clientX) / time;
	    var vy = (touch.clientY - gesture.lastTouch.clientY) / time;
	
	    var RECORD_DURATION = 70;
	    if (time > RECORD_DURATION) {
	      time = RECORD_DURATION;
	    }
	    if (gesture.duration + time > RECORD_DURATION) {
	      gesture.duration = RECORD_DURATION - time;
	    }
	
	    gesture.velocityX = (gesture.velocityX * gesture.duration + vx * time) / (gesture.duration + time);
	    gesture.velocityY = (gesture.velocityY * gesture.duration + vy * time) / (gesture.duration + time);
	    gesture.duration += time;
	
	    gesture.lastTouch = {};
	
	    for (var p in touch) {
	      gesture.lastTouch[p] = touch[p];
	    }
	    gesture.lastTime = Date.now();
	
	    var displacementX = touch.clientX - gesture.startTouch.clientX;
	    var displacementY = touch.clientY - gesture.startTouch.clientY;
	    var distance = Math.sqrt(Math.pow(displacementX, 2) + Math.pow(displacementY, 2));
	    var isVertical = !(Math.abs(displacementX) > Math.abs(displacementY));
	    var direction = isVertical ? displacementY >= 0 ? 'down' : 'up' : displacementX >= 0 ? 'right' : 'left';
	
	    // magic number 10: moving 10px means pan, not tap
	    if ((gesture.status === 'tapping' || gesture.status === 'pressing') && distance > 10) {
	      gesture.status = 'panning';
	      gesture.isVertical = isVertical;
	      gesture.direction = direction;
	
	      fireEvent(gesture.element, 'panstart', {
	        touch: touch,
	        touches: event.touches,
	        changedTouches: event.changedTouches,
	        touchEvent: event,
	        isVertical: gesture.isVertical,
	        direction: direction
	      });
	    }
	
	    if (gesture.status === 'panning') {
	      gesture.panTime = Date.now();
	
	      fireEvent(gesture.element, 'panmove', {
	        displacementX: displacementX,
	        displacementY: displacementY,
	        touch: touch,
	        touches: event.touches,
	        changedTouches: event.changedTouches,
	        touchEvent: event,
	        isVertical: gesture.isVertical,
	        direction: direction
	      });
	    }
	  }
	
	  if (Object.keys(gestures).length == 2) {
	    var position = [];
	    var current = [];
	    var elements = [];
	    var transform;
	
	    for (var i = 0; i < event.touches.length; i++) {
	      var touch = event.touches[i];
	      var gesture = gestures[touch.identifier];
	      position.push([gesture.startTouch.clientX, gesture.startTouch.clientY]);
	      current.push([touch.clientX, touch.clientY]);
	    }
	
	    for (var p in gestures) {
	      elements.push(gestures[p].element);
	    }
	
	    transform = calc(position[0][0], position[0][1], position[1][0], position[1][1], current[0][0], current[0][1], current[1][0], current[1][1]);
	    fireEvent(getCommonAncestor(elements[0], elements[1]), 'dualtouch', {
	      transform: transform,
	      touches: event.touches,
	      touchEvent: event
	    });
	  }
	}
	
	/**
	 * handle touchend event
	 *
	 * 1. if there are tow touch points, then trigger 'dualtouchend'如
	 *
	 * 2. traverse every touch piont：
	 * > if tapping, then trigger 'tap'.
	 * If there is a tap 300 milliseconds before, then it's a 'doubletap'.
	 * > if padding, then decide to trigger 'panend' or 'swipe'
	 * > if pressing, then trigger 'pressend'.
	 *
	 * 3. remove listeners.
	 *
	 * @event
	 * @param  {event} event
	 */
	function touchendHandler(event) {
	
	  if (Object.keys(gestures).length == 2) {
	    var elements = [];
	    for (var p in gestures) {
	      elements.push(gestures[p].element);
	    }
	    fireEvent(getCommonAncestor(elements[0], elements[1]), 'dualtouchend', {
	      touches: slice.call(event.touches),
	      touchEvent: event
	    });
	  }
	
	  for (var i = 0; i < event.changedTouches.length; i++) {
	    var touch = event.changedTouches[i];
	    var id = touch.identifier;
	    var gesture = gestures[id];
	
	    if (!gesture) {
	      continue;
	    }
	
	    if (gesture.pressingHandler) {
	      clearTimeout(gesture.pressingHandler);
	      gesture.pressingHandler = null;
	    }
	
	    if (gesture.status === 'tapping') {
	      gesture.timestamp = Date.now();
	      fireEvent(gesture.element, 'tap', {
	        touch: touch,
	        touchEvent: event
	      });
	
	      if (lastTap && gesture.timestamp - lastTap.timestamp < 300) {
	        fireEvent(gesture.element, 'doubletap', {
	          touch: touch,
	          touchEvent: event
	        });
	      }
	
	      lastTap = gesture;
	    }
	
	    if (gesture.status === 'panning') {
	      var now = Date.now();
	      var duration = now - gesture.startTime;
	      var displacementX = touch.clientX - gesture.startTouch.clientX;
	      var displacementY = touch.clientY - gesture.startTouch.clientY;
	
	      var velocity = Math.sqrt(gesture.velocityY * gesture.velocityY + gesture.velocityX * gesture.velocityX);
	      var isSwipe = velocity > 0.5 && now - gesture.lastTime < 100;
	      var extra = {
	        duration: duration,
	        isSwipe: isSwipe,
	        velocityX: gesture.velocityX,
	        velocityY: gesture.velocityY,
	        displacementX: displacementX,
	        displacementY: displacementY,
	        touch: touch,
	        touches: event.touches,
	        changedTouches: event.changedTouches,
	        touchEvent: event,
	        isVertical: gesture.isVertical,
	        direction: gesture.direction
	      };
	
	      fireEvent(gesture.element, 'panend', extra);
	      if (isSwipe) {
	        fireEvent(gesture.element, 'swipe', extra);
	      }
	    }
	
	    if (gesture.status === 'pressing') {
	      fireEvent(gesture.element, 'pressend', {
	        touch: touch,
	        touchEvent: event
	      });
	    }
	
	    delete gestures[id];
	  }
	
	  if (Object.keys(gestures).length === 0) {
	    docEl.removeEventListener('touchmove', touchmoveHandler, false);
	    docEl.removeEventListener('touchend', touchendHandler, false);
	    docEl.removeEventListener('touchcancel', touchcancelHandler, false);
	  }
	}
	
	/**
	 * handle touchcancel
	 *
	 * 1. if there are two touch points, then trigger 'dualtouchend'
	 *
	 * 2. traverse everty touch point:
	 * > if pannnig, then trigger 'panend'
	 * > if pressing, then trigger 'pressend'
	 *
	 * 3. remove listeners
	 *
	 * @event
	 * @param  {event} event
	 */
	function touchcancelHandler(event) {
	
	  if (Object.keys(gestures).length == 2) {
	    var elements = [];
	    for (var p in gestures) {
	      elements.push(gestures[p].element);
	    }
	    fireEvent(getCommonAncestor(elements[0], elements[1]), 'dualtouchend', {
	      touches: slice.call(event.touches),
	      touchEvent: event
	    });
	  }
	
	  for (var i = 0; i < event.changedTouches.length; i++) {
	    var touch = event.changedTouches[i];
	    var id = touch.identifier;
	    var gesture = gestures[id];
	
	    if (!gesture) {
	      continue;
	    }
	
	    if (gesture.pressingHandler) {
	      clearTimeout(gesture.pressingHandler);
	      gesture.pressingHandler = null;
	    }
	
	    if (gesture.status === 'panning') {
	      fireEvent(gesture.element, 'panend', {
	        touch: touch,
	        touches: event.touches,
	        changedTouches: event.changedTouches,
	        touchEvent: event
	      });
	    }
	    if (gesture.status === 'pressing') {
	      fireEvent(gesture.element, 'pressend', {
	        touch: touch,
	        touchEvent: event
	      });
	    }
	    delete gestures[id];
	  }
	
	  if (Object.keys(gestures).length === 0) {
	    docEl.removeEventListener('touchmove', touchmoveHandler, false);
	    docEl.removeEventListener('touchend', touchendHandler, false);
	    docEl.removeEventListener('touchcancel', touchcancelHandler, false);
	  }
	}
	
	if (!isInitialized) {
	  docEl.addEventListener('touchstart', touchstartHandler, false);
	  isInitialized = true;
	}

/***/ },
/* 47 */
/***/ function(module, exports) {

	typeof window === 'undefined' && (window = { ctrl: {}, lib: {} });!window.ctrl && (window.ctrl = {});!window.lib && (window.lib = {});!function (a, b) {
	  function c(a, b, c, d) {
	    function e(a) {
	      return (3 * k * a + 2 * l) * a + m;
	    }function f(a) {
	      return ((k * a + l) * a + m) * a;
	    }function g(a) {
	      return ((n * a + o) * a + p) * a;
	    }function h(a) {
	      for (var b, c, d = a, g = 0; 8 > g; g++) {
	        if (c = f(d) - a, Math.abs(c) < j) return d;if (b = e(d), Math.abs(b) < j) break;d -= c / b;
	      }var h = 1,
	          i = 0;for (d = a; h > i;) {
	        if (c = f(d) - a, Math.abs(c) < j) return d;c > 0 ? h = d : i = d, d = (h + i) / 2;
	      }return d;
	    }function i(a) {
	      return g(h(a));
	    }var j = 1e-6,
	        k = 3 * a - 3 * c + 1,
	        l = 3 * c - 6 * a,
	        m = 3 * a,
	        n = 3 * b - 3 * d + 1,
	        o = 3 * d - 6 * b,
	        p = 3 * b;return i;
	  }b.cubicbezier = c, b.cubicbezier.linear = c(0, 0, 1, 1), b.cubicbezier.ease = c(.25, .1, .25, 1), b.cubicbezier.easeIn = c(.42, 0, 1, 1), b.cubicbezier.easeOut = c(0, 0, .58, 1), b.cubicbezier.easeInOut = c(.42, 0, .58, 1);
	}(window, window.lib || (window.lib = {}));;module.exports = window.lib['cubicbezier'];

/***/ },
/* 48 */
/***/ function(module, exports) {

	typeof window === 'undefined' && (window = { ctrl: {}, lib: {} });!window.ctrl && (window.ctrl = {});!window.lib && (window.lib = {});!function (a, b) {
	  function c(a) {
	    return setTimeout(a, l);
	  }function d(a) {
	    clearTimeout(a);
	  }function e() {
	    var a = {},
	        b = new m(function (b, c) {
	      a.resolve = b, a.reject = c;
	    });return a.promise = b, a;
	  }function f(a, b) {
	    return ["then", "catch"].forEach(function (c) {
	      b[c] = function () {
	        return a[c].apply(a, arguments);
	      };
	    }), b;
	  }function g(b) {
	    var c,
	        d,
	        h = !1;this.request = function () {
	      h = !1;var g = arguments;return c = e(), f(c.promise, this), d = n(function () {
	        h || c && c.resolve(b.apply(a, g));
	      }), this;
	    }, this.cancel = function () {
	      return d && (h = !0, o(d), c && c.reject("CANCEL")), this;
	    }, this.clone = function () {
	      return new g(b);
	    };
	  }function h(a, b) {
	    "function" == typeof b && (b = { 0: b });for (var c = a / l, d = 1 / c, e = [], f = Object.keys(b).map(function (a) {
	      return parseInt(a);
	    }), h = 0; c > h; h++) {
	      var i = f[0],
	          j = d * h;if (null != i && 100 * j >= i) {
	        var k = b["" + i];k instanceof g || (k = new g(k)), e.push(k), f.shift();
	      } else e.length && e.push(e[e.length - 1].clone());
	    }return e;
	  }function i(a) {
	    var c;return "string" == typeof a || a instanceof Array ? b.cubicbezier ? "string" == typeof a ? b.cubicbezier[a] && (c = b.cubicbezier[a]) : a instanceof Array && 4 === a.length && (c = b.cubicbezier.apply(b.cubicbezier, a)) : console.error("require lib.cubicbezier") : "function" == typeof a && (c = a), c;
	  }function j(a, b, c) {
	    var d,
	        g = h(a, c),
	        j = 1 / (a / l),
	        k = 0,
	        m = i(b);if (!m) throw new Error("unexcept timing function");var n = !1;this.play = function () {
	      function a() {
	        var c = j * (k + 1).toFixed(10),
	            e = g[k];e.request(c.toFixed(10), b(c).toFixed(10)).then(function () {
	          n && (k === g.length - 1 ? (n = !1, d && d.resolve("FINISH"), d = null) : (k++, a()));
	        }, function () {});
	      }if (!n) return n = !0, d || (d = e(), f(d.promise, this)), a(), this;
	    }, this.stop = function () {
	      return n ? (n = !1, g[k] && g[k].cancel(), this) : void 0;
	    };
	  }var k = 60,
	      l = 1e3 / k,
	      m = a.Promise || b.promise && b.promise.ES6Promise,
	      n = window.requestAnimationFrame || window.msRequestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || c,
	      o = window.cancelAnimationFrame || window.msCancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || d;(n === c || o === d) && (n = c, o = d), b.animation = function (a, b, c) {
	    return new j(a, b, c);
	  }, b.animation.frame = function (a) {
	    return new g(a);
	  }, b.animation.requestFrame = function (a) {
	    var b = new g(a);return b.request();
	  };
	}(window, window.lib || (window.lib = {}));;module.exports = window.lib['animation'];

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(50);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./carrousel.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./carrousel.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, "[data-ctrl-name=\"carrousel\"] {\n  position: relative;\n  -webkit-transform: translateZ(1px);\n  -ms-transform: translateZ(1px);\n  transform: translateZ(1px);\n}", ""]);
	
	// exports


/***/ },
/* 51 */
/***/ function(module, exports) {

	/* eslint-disable */
	
	'use strict';
	
	var _fallback = false;
	
	var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	if (!raf) {
	  _fallback = true;
	  raf = function (callback) {
	    return setTimeout(callback, 16);
	  };
	}
	var caf = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
	if (!caf && _fallback) {
	  caf = function (id) {
	    return clearTimeout(id);
	  };
	} else if (!caf) {
	  caf = function () {};
	}
	
	var MAX = (Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1) - 1;
	
	var _idMap = {};
	var _globalId = 0;
	
	function _getGlobalId() {
	  _globalId = (_globalId + 1) % MAX;
	  if (_idMap[_globalId]) {
	    return _getGlobalId();
	  }
	  return _globalId;
	}
	
	var timer = {
	
	  setTimeout: function (cb, ms) {
	    var id = _getGlobalId();
	    var start = Date.now();
	    _idMap[id] = raf(function loop() {
	      if (!_idMap[id] && _idMap[id] !== 0) {
	        return;
	      }
	      var ind = Date.now() - start;
	      if (ind < ms) {
	        _idMap[id] = raf(loop);
	      } else {
	        delete _idMap[id];
	        cb();
	      }
	    });
	    return id;
	  },
	
	  clearTimeout: function (id) {
	    var tid = _idMap[id];
	    tid && caf(tid);
	    delete _idMap[id];
	  }
	
	};
	
	module.exports = timer;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(53);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./slider.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./slider.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".slider {\n  position: relative;\n}\n\n.slider .indicator-container {\n  position: absolute;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-align: center;\n  box-align: center;\n  -webkit-align-items: center;\n  align-items: center;\n  -webkit-box-pack: center;\n  box-pack: center;\n  -webkit-justify-content: center;\n  justify-content: center;\n  font-size: 0;\n}\n.slider .indicator-container .indicator {\n  border-radius: 50%;\n}\n.slider .indicator-container.row {\n  -webkit-box-orient: horizontal;\n  box-orient: horizontal;\n  -webkit-flex-direction: row;\n  flex-direction: row;\n}\n.slider .indicator-container.column {\n  -webkit-box-orient: vertical;\n  box-orient: vertical;\n  -webkit-flex-direction: column;\n  flex-direction: column;\n}\n", ""]);
	
	// exports


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const extend = __webpack_require__(8).extend;
	// const config = require('../config')
	const Atomic = __webpack_require__(30);
	// const Component = require('./component')
	
	__webpack_require__(55);
	
	const DEFAULT_ITEM_COLOR = '#999';
	const DEFAULT_ITEM_SELECTED_COLOR = '#0000ff';
	const DEFAULT_ITEM_SIZE = 20;
	const DEFAULT_MARGIN_SIZE = 10;
	
	// Style supported:
	//   position: (default - absolute)
	//   itemColor: color of indicator dots
	//   itemSelectedColor: color of the selected indicator dot
	//   itemSize: size of indicators
	//   other layout styles
	function Indicator(data) {
	  this.direction = 'row'; // 'column' is not temporarily supported.
	  this.amount = data.extra.amount;
	  this.index = data.extra.index;
	  this.sliderWidth = data.extra.width;
	  this.sliderHeight = data.extra.height;
	  const styles = data.style || {};
	  this.data = data;
	  this.style.width.call(this, styles.width);
	  this.style.height.call(this, styles.height);
	  this.itemColor = styles.itemColor || DEFAULT_ITEM_COLOR;
	  this.itemSelectedColor = styles.itemSelectedColor || DEFAULT_ITEM_SELECTED_COLOR;
	  this.items = [];
	  Atomic.call(this, data);
	}
	
	Indicator.prototype = Object.create(Atomic.prototype);
	
	Indicator.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('weex-indicators');
	  node.classList.add('weex-element');
	  node.style.position = 'absolute';
	  this.node = node;
	  this.style.itemSize.call(this, 0);
	  this.updateStyle({
	    left: 0,
	    top: 0,
	    itemSize: 0
	  });
	  return node;
	};
	
	Indicator.prototype.createChildren = function () {
	  const root = document.createDocumentFragment();
	  for (let i = 0; i < this.amount; i++) {
	    const indicator = document.createElement('div');
	    indicator.classList.add('weex-indicator');
	    indicator.style.boxSizing = 'border-box';
	    indicator.style.margin = '0 ' + DEFAULT_MARGIN_SIZE * this.data.scale + 'px';
	    indicator.style.width = this.itemSize + 'px';
	    indicator.style.height = this.itemSize + 'px';
	    indicator.setAttribute('index', i);
	    if (this.index === i) {
	      indicator.classList.add('active');
	      indicator.style.backgroundColor = this.itemSelectedColor;
	    } else {
	      indicator.style.backgroundColor = this.itemColor;
	    }
	    indicator.addEventListener('click', this._clickHandler.bind(this, i));
	    this.items[i] = indicator;
	    root.appendChild(indicator);
	  }
	  this.node.appendChild(root);
	};
	
	Indicator.prototype.resetColor = function () {
	  const len = this.items.length;
	  if (typeof this.index !== 'undefined' && len > this.index) {
	    for (let i = 0; i < len; i++) {
	      const item = this.items[i];
	      if (this.index === i) {
	        item.classList.add('active');
	        item.style.backgroundColor = this.itemSelectedColor;
	      } else {
	        item.style.backgroundColor = this.itemColor;
	      }
	    }
	  }
	};
	
	Indicator.prototype.style = extend(Object.create(Atomic.prototype.style), {
	  itemColor: function (val) {
	    this.itemColor = val || DEFAULT_ITEM_COLOR;
	    this.resetColor();
	  },
	
	  itemSelectedColor: function (val) {
	    this.itemSelectedColor = val || DEFAULT_ITEM_SELECTED_COLOR;
	    this.resetColor();
	  },
	
	  itemSize: function (val) {
	    val = parseInt(val) * this.data.scale || DEFAULT_ITEM_SIZE * this.data.scale;
	    this.itemSize = val;
	    this.node.style.height = val + 'px';
	    for (let i = 0, l = this.items.length; i < l; i++) {
	      this.items[i].style.width = val + 'px';
	      this.items[i].style.height = val + 'px';
	    }
	  },
	
	  width: function (val) {
	    val = parseInt(val) * this.data.scale || parseInt(this.sliderWidth);
	    this.virtualWrapperWidth = val;
	  },
	
	  height: function (val) {
	    val = parseInt(val) * this.data.scale || parseInt(this.sliderHeight);
	    this.virtualWrapperHeight = val;
	  },
	
	  top: function (val) {
	    val = this.virtualWrapperHeight / 2 - this.itemSize / 2 + val * this.data.scale;
	    this.node.style.bottom = '';
	    this.node.style.top = val + 'px';
	  },
	
	  bottom: function (val) {
	    val = this.virtualWrapperHeight / 2 - this.itemSize / 2 + val * this.data.scale;
	    this.node.style.top = '';
	    this.node.style.bottom = val + 'px';
	  },
	
	  left: function (val) {
	    val = this.virtualWrapperWidth / 2 - (this.itemSize + 2 * DEFAULT_MARGIN_SIZE * this.data.scale) * this.amount / 2 + val * this.data.scale;
	    this.node.style.right = '';
	    this.node.style.left = val + 'px';
	  },
	
	  right: function (val) {
	    val = this.virtualWrapperWidth / 2 - (this.itemSize + 2 * DEFAULT_MARGIN_SIZE * this.data.scale) * this.amount / 2 + val * this.data.scale;
	    this.node.style.left = '';
	    this.node.style.right = val + 'px';
	  }
	});
	
	Indicator.prototype.setIndex = function (idx) {
	  if (idx >= this.amount) {
	    return;
	  }
	  const prev = this.items[this.index];
	  const cur = this.items[idx];
	  prev.classList.remove('active');
	  prev.style.backgroundColor = this.itemColor;
	  cur.classList.add('active');
	  cur.style.backgroundColor = this.itemSelectedColor;
	  this.index = idx;
	};
	
	Indicator.prototype._clickHandler = function (idx) {
	  this.slider.slideTo(idx);
	};
	
	module.exports = Indicator;

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(56);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./indicator.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./indicator.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".weex-indicators {\n  position: absolute;\n  white-space: nowrap;\n}\n.weex-indicators .weex-indicator {\n  float: left;\n  border-radius: 50%;\n}\n", ""]);
	
	// exports


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(30);
	// const config = require('../config')
	const utils = __webpack_require__(8);
	
	// TODO: refactor this scss code since this is strongly
	// dependent on lib.flexible other than the value of
	// scale.
	__webpack_require__(58);
	
	function TabHeader(data) {
	  Atomic.call(this, data);
	}
	
	const proto = TabHeader.prototype = Object.create(Atomic.prototype);
	
	proto.create = function () {
	  // outside container.
	  const node = document.createElement('div');
	  node.className = 'tab-header';
	  // tip on the top.
	  const bar = document.createElement('div');
	  bar.className = 'header-bar';
	  bar.textContent = 'CHANGE FLOOR';
	  // middle layer.
	  const body = document.createElement('div');
	  body.className = 'header-body';
	  const box = document.createElement('ul');
	  box.className = 'tabheader';
	
	  body.appendChild(box);
	  node.appendChild(bar);
	  node.appendChild(body);
	  this._bar = bar;
	  this._body = body;
	  this.box = box;
	  this.node = node;
	  // init events.
	  this._initFoldBtn();
	  this._initEvent();
	  return node;
	};
	
	proto._initFoldBtn = function () {
	  const _this = this;
	  const node = this.node;
	  const btn = document.createElement('span');
	  btn.className = 'fold-toggle iconfont';
	  btn.innerHTML = '&#xe661;';
	  node.appendChild(btn);
	
	  btn.addEventListener('click', function () {
	    if (_this.unfolding) {
	      _this._folding();
	    } else {
	      _this._unfolding();
	    }
	  });
	};
	
	proto._initMask = function () {
	  const mask = document.createElement('div');
	  mask.className = 'tabheader-mask';
	  this.mask = mask;
	  // stop default behavior: page moving.
	  mask.addEventListener('touchmove', function (evt) {
	    evt.preventDefault();
	  });
	  // click to unfold.
	  const _this = this;
	  mask.addEventListener('click', function () {
	    _this._folding();
	  });
	
	  document.body.appendChild(mask);
	};
	
	proto._unfolding = function () {
	  // mark the initial posiiton of tabheader
	  if (!this.flag) {
	    const flag = document.createComment('tabheader');
	    this.flag = flag;
	    this.node.parentNode.insertBefore(flag, this.node);
	  }
	  if (!this.mask) {
	    this._initMask();
	  }
	
	  // record the scroll position.
	  this._scrollVal = this._body.scrollLeft;
	  // record the position in document.
	  this._topVal = this.node.getBoundingClientRect().top;
	  this._styleTop = this.node.style.top;
	
	  document.body.appendChild(this.node);
	  this.node.classList.add('unfold-header');
	  this.node.style.height = 'auto';
	  // recalc the position when it is unfolded.
	  const thHeight = this.node.getBoundingClientRect().height;
	  if (thHeight + this._topVal > window.innerHeight) {
	    this._topVal = this._topVal + (window.innerHeight - thHeight - this._topVal);
	  }
	
	  this.node.style.top = this._topVal + 'px';
	  // process mask style
	  this.mask.classList.add('unfold-header');
	  this.mask.style.height = window.innerHeight + 'px';
	  this.unfolding = true;
	};
	
	proto._folding = function () {
	  if (this.unfolding !== true) {
	    return;
	  }
	
	  this.mask.classList.remove('unfold-header');
	  this.node.classList.remove('unfold-header');
	
	  this.node.style.height = '';
	  this.node.style.top = this._styleTop;
	
	  // recover the position of tabheader.
	  this.flag.parentNode.insertBefore(this.node, this.flag);
	  // recover the position of scoller.
	  this._body.scrollLeft = this._scrollVal;
	
	  this._scrollToView();
	  this.unfolding = false;
	};
	
	proto._initEvent = function () {
	  this._initClickEvent();
	  this._initSelectEvent();
	};
	
	// init events.
	proto._initClickEvent = function () {
	  const box = this.box;
	  const _this = this;
	
	  box.addEventListener('click', function (evt) {
	    let target = evt.target;
	    if (target.nodeName === 'UL') {
	      return;
	    }
	
	    if (target.parentNode.nodeName === 'LI') {
	      target = target.parentNode;
	    }
	
	    const floor = target.getAttribute('data-floor');
	    /* eslint-disable eqeqeq */
	    if (_this.data.attr.selectedIndex == floor) {
	      // Duplicated clicking, not to trigger select event.
	      return;
	    }
	    /* eslint-enable eqeqeq */
	
	    fireEvent(target, 'select', { index: floor });
	  });
	};
	
	proto._initSelectEvent = function () {
	  const node = this.node;
	  const _this = this;
	  node.addEventListener('select', function (evt) {
	    let index;
	    if (evt.index !== undefined) {
	      index = evt.index;
	    } else if (evt.data && evt.data.index !== undefined) {
	      index = evt.data.index;
	    }
	
	    if (index === undefined) {
	      return;
	    }
	
	    _this.attr.selectedIndex.call(_this, index);
	  });
	};
	
	proto.attr = {
	  highlightIcon: function () {
	    return createHighlightIcon();
	  },
	  data: function () {
	    const attr = this.data.attr;
	    // Ensure there is a default selected value.
	    if (attr.selectedIndex === undefined) {
	      attr.selectedIndex = 0;
	    }
	
	    const list = attr.data || [];
	    const curItem = attr.selectedIndex;
	
	    const ret = [];
	    const itemTmpl = '<li class="th-item" data-floor="{{floor}}">' + '{{hlIcon}}{{floorName}}</li>';
	
	    list.forEach(function (item, idx) {
	      let html = itemTmpl.replace('{{floor}}', idx);
	      /* eslint-disable eqeqeq */
	      if (curItem == idx) {
	        html = html.replace('{{hlIcon}}', createHighlightIcon());
	      } else {
	        html = html.replace('{{hlIcon}}', '');
	      }
	      /* eslint-enable eqeqeq */
	
	      html = html.replace('{{floorName}}', item);
	
	      ret.push(html);
	    }, this);
	
	    this.box.innerHTML = ret.join('');
	  },
	  selectedIndex: function (val) {
	    const attr = this.data.attr;
	
	    if (val === undefined) {
	      val = 0;
	    }
	
	    // if (val == attr.selectedIndex) {
	    //   return
	    // }
	
	    attr.selectedIndex = val;
	
	    this.attr.data.call(this);
	
	    this._folding();
	    this.style.textHighlightColor.call(this, this.textHighlightColor);
	  }
	};
	
	proto.style = Object.create(Atomic.prototype.style);
	
	proto.style.opacity = function (val) {
	  if (val === undefined || val < 0 || val > 1) {
	    val = 1;
	  }
	
	  this.node.style.opacity = val;
	};
	
	proto.style.textColor = function (val) {
	  if (!isValidColor(val)) {
	    return;
	  }
	
	  this.node.style.color = val;
	};
	
	proto.style.textHighlightColor = function (val) {
	  if (!isValidColor(val)) {
	    return;
	  }
	  this.textHighlightColor = val;
	  const attr = this.data.attr;
	
	  const node = this.node.querySelector('[data-floor="' + attr.selectedIndex + '"]');
	  if (node) {
	    node.style.color = val;
	    this._scrollToView(node);
	  }
	};
	
	proto._scrollToView = function (node) {
	  if (!node) {
	    const attr = this.data.attr;
	    node = this.node.querySelector('[data-floor="' + attr.selectedIndex + '"]');
	  }
	  if (!node) {
	    return;
	  }
	
	  // const defaultVal = this._body.scrollLeft
	  // const leftVal = defaultVal - node.offsetLeft + 300
	
	  const scrollVal = getScrollVal(this._body.getBoundingClientRect(), node);
	  doScroll(this._body, scrollVal);
	};
	
	// scroll the tabheader.
	// positive val means to scroll right.
	// negative val means to scroll left.
	function doScroll(node, val, finish) {
	  if (!val) {
	    return;
	  }
	  if (finish === undefined) {
	    finish = Math.abs(val);
	  }
	
	  if (finish <= 0) {
	    return;
	  }
	
	  setTimeout(function () {
	    if (val > 0) {
	      node.scrollLeft += 2;
	    } else {
	      node.scrollLeft -= 2;
	    }
	    finish -= 2;
	
	    doScroll(node, val, finish);
	  });
	}
	
	// get scroll distance.
	function getScrollVal(rect, node) {
	  const left = node.previousSibling;
	  const right = node.nextSibling;
	  let scrollVal;
	
	  // process left-side element first.
	  if (left) {
	    const leftRect = left.getBoundingClientRect();
	    // only need to compare the value of left.
	    if (leftRect.left < rect.left) {
	      scrollVal = leftRect.left;
	      return scrollVal;
	    }
	  }
	
	  if (right) {
	    const rightRect = right.getBoundingClientRect();
	    // compare the value of right.
	    if (rightRect.right > rect.right) {
	      scrollVal = rightRect.right - rect.right;
	      return scrollVal;
	    }
	  }
	
	  // process current node, from left to right.
	  const nodeRect = node.getBoundingClientRect();
	  if (nodeRect.left < rect.left) {
	    scrollVal = nodeRect.left;
	  } else if (nodeRect.right > rect.right) {
	    scrollVal = nodeRect.right - rect.right;
	  }
	
	  return scrollVal;
	}
	
	// trigger and broadcast events.
	function fireEvent(element, type, data) {
	  const evt = document.createEvent('Event');
	  evt.data = data;
	  utils.extend(evt, data);
	  // need bubble.
	  evt.initEvent(type, true, true);
	
	  element.dispatchEvent(evt);
	}
	
	function createHighlightIcon(code) {
	  const html = '<i class="hl-icon iconfont">' + '&#xe650' + '</i>';
	  return html;
	}
	
	function isValidColor(color) {
	  if (!color) {
	    return false;
	  }
	
	  if (color.charAt(0) !== '#') {
	    return false;
	  }
	
	  if (color.length !== 7) {
	    return false;
	  }
	
	  return true;
	}
	
	module.exports = TabHeader;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(59);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./tabheader.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./tabheader.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".tab-header {\n  position: relative;\n  width: 10rem;\n  font-size: 14px;\n  color: #333;\n}\n.tab-header .header-bar {\n  height: 1.17rem;\n  line-height: 1.17rem;\n  display: none;\n  color: #999;\n  padding-left: 0.4rem;\n}\n.tab-header .header-body {\n  margin-right: 1.07rem;\n  overflow-x: auto;\n  overflow-y: hidden;\n}\n.tab-header .header-body::-webkit-scrollbar {\n  width: 0;\n  height: 0;\n  overflow: hidden;\n}\n.tab-header .fold-toggle {\n  position: absolute;\n  top: 0.59rem;\n  -webkit-transform: translateY(-50%);\n  right: 0.29rem;\n  width: 0.48rem;\n  height: 0.48rem;\n  line-height: 0.48rem;\n  text-align: center;\n  z-index: 99;\n  font-size: 14px;\n}\n.tab-header.unfold-header {\n  position: fixed !important;\n  top: 0;\n  left: 0;\n  overflow: hidden;\n}\n\n.tabheader {\n  list-style: none;\n  white-space: nowrap;\n  height: 1.17rem;\n  line-height: 1.17rem;\n}\n.tabheader .th-item {\n  padding-left: 0.72rem;\n  position: relative;\n  display: inline-block;\n}\n.tabheader .hl-icon {\n  width: 0.4rem;\n  height: 0.4rem;\n  line-height: 0.4rem;\n  text-align: center;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translateY(-50%);\n  left: 0.24rem;\n  font-size: 14px;\n}\n\n.unfold-header .header-bar {\n  display: block;\n}\n.unfold-header .fold-toggle {\n  -webkit-transform: translateY(-50%) rotate(180deg);\n}\n.unfold-header .header-body {\n  margin-right: 0;\n  padding: 0.24rem;\n}\n.unfold-header .tabheader {\n  display: block;\n  height: auto;\n}\n.unfold-header .th-item {\n  box-sizing: border-box;\n  float: left;\n  width: 33.3333%;\n  height: 1.01rem;\n  line-height: 1.01rem;\n}\n.unfold-header .hl-icon {\n  margin-right: 0;\n  position: absolute;\n}\n.unfold-header.tabheader-mask {\n  display: block;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(0, 0, 0, 0.6);\n}\n\n.tabheader-mask {\n  display: none;\n  position: fixed;\n  left: 0;\n  top: 0;\n}\n\n@font-face {\n  font-family: \"iconfont\";\n  src: url(\"data:application/x-font-ttf;charset=utf-8;base64,AAEAAAAPAIAAAwBwRkZUTXBD98UAAAD8AAAAHE9TLzJXL1zIAAABGAAAAGBjbWFws6IHbgAAAXgAAAFaY3Z0IAyV/swAAApQAAAAJGZwZ20w956VAAAKdAAACZZnYXNwAAAAEAAACkgAAAAIZ2x5ZuxoPFIAAALUAAAEWGhlYWQHA5h3AAAHLAAAADZoaGVhBzIDcgAAB2QAAAAkaG10eAs2AW0AAAeIAAAAGGxvY2EDcAQeAAAHoAAAABBtYXhwASkKKwAAB7AAAAAgbmFtZQl/3hgAAAfQAAACLnBvc3Tm7f0bAAAKAAAAAEhwcmVwpbm+ZgAAFAwAAACVAAAAAQAAAADMPaLPAAAAANIDKnoAAAAA0gMqewAEA/oB9AAFAAACmQLMAAAAjwKZAswAAAHrADMBCQAAAgAGAwAAAAAAAAAAAAEQAAAAAAAAAAAAAABQZkVkAMAAeObeAyz/LABcAxgAlAAAAAEAAAAAAxgAAAAAACAAAQAAAAMAAAADAAAAHAABAAAAAABUAAMAAQAAABwABAA4AAAACgAIAAIAAgB45lDmYebe//8AAAB45lDmYebe////ixm0GaQZKAABAAAAAAAAAAAAAAAAAQYAAAEAAAAAAAAAAQIAAAACAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACACIAAAEyAqoAAwAHAClAJgAAAAMCAANXAAIBAQJLAAICAU8EAQECAUMAAAcGBQQAAwADEQUPKzMRIREnMxEjIgEQ7szMAqr9ViICZgAAAAUALP/hA7wDGAAWADAAOgBSAF4Bd0uwE1BYQEoCAQANDg0ADmYAAw4BDgNeAAEICAFcEAEJCAoGCV4RAQwGBAYMXgALBAtpDwEIAAYMCAZYAAoHBQIECwoEWRIBDg4NUQANDQoOQhtLsBdQWEBLAgEADQ4NAA5mAAMOAQ4DXgABCAgBXBABCQgKCAkKZhEBDAYEBgxeAAsEC2kPAQgABgwIBlgACgcFAgQLCgRZEgEODg1RAA0NCg5CG0uwGFBYQEwCAQANDg0ADmYAAw4BDgNeAAEICAFcEAEJCAoICQpmEQEMBgQGDARmAAsEC2kPAQgABgwIBlgACgcFAgQLCgRZEgEODg1RAA0NCg5CG0BOAgEADQ4NAA5mAAMOAQ4DAWYAAQgOAQhkEAEJCAoICQpmEQEMBgQGDARmAAsEC2kPAQgABgwIBlgACgcFAgQLCgRZEgEODg1RAA0NCg5CWVlZQChTUzs7MjEXF1NeU15bWDtSO1JLQzc1MToyOhcwFzBRETEYESgVQBMWKwEGKwEiDgIdASE1NCY1NC4CKwEVIQUVFBYUDgIjBiYrASchBysBIiciLgI9ARciBhQWMzI2NCYXBgcOAx4BOwYyNicuAScmJwE1ND4COwEyFh0BARkbGlMSJRwSA5ABChgnHoX+SgKiARUfIw4OHw4gLf5JLB0iFBkZIBMIdwwSEgwNEhKMCAYFCwQCBA8OJUNRUEAkFxYJBQkFBQb+pAUPGhW8HykCHwEMGScaTCkQHAQNIBsSYYg0Fzo6JRcJAQGAgAETGyAOpz8RGhERGhF8GhYTJA4QDQgYGg0jERMUAXfkCxgTDB0m4wAAAgCg/2wDYALsABIAGgAhQB4AAAADAgADWQACAQECTQACAgFRAAECAUUTFjkQBBIrACAGFRQeAxcWOwEyPwESNTQAIiY0NjIWFAKS/tzORFVvMRAJDgEOCW3b/uKEXl6EXgLszpI1lXyJNhEKC30BDIyS/s5ehF5ehAAAAAEAggBJA4QB6AAdABtAGBIRAgEAAUAFAQA+AAABAGgAAQFfEx8CECsBJgcGBwkBLgEGBwYUFwEwMxcVFjI3AT4DLgIDehEWAwP+uP60BhEQBgoKAWEBAQoaCQFeAwQCAQECBAHhEg0DAv61AUkHBAUGCRsJ/qIBAQkJAWICBwYHCAYGAAEAfwCLA4ECJwAhAB1AGhYPAgEAAUAFAQA+AAABAGgCAQEBXyQuEwMRKyUBMCcjNSYHBgcBDgEUFhceAjMyNwkBFjMyNjc+Ai4BA3f+nwEBEhUEAv6iBQUFBQMHCAQOCQFIAUwKDQYMBQMFAQEFwwFeAQERDQID/p8FDAwMBAMEAgkBS/62CQUFAwoJCgkAAAEAAAABAAALIynoXw889QALBAAAAAAA0gMqewAAAADSAyp7ACL/bAO8AxgAAAAIAAIAAAAAAAAAAQAAAxj/bABcBAAAAAAAA7wAAQAAAAAAAAAAAAAAAAAAAAUBdgAiAAAAAAFVAAAD6QAsBAAAoACCAH8AAAAoACgAKAFkAaIB5AIsAAEAAAAHAF8ABQAAAAAAAgAmADQAbAAAAIoJlgAAAAAAAAAMAJYAAQAAAAAAAQAIAAAAAQAAAAAAAgAGAAgAAQAAAAAAAwAkAA4AAQAAAAAABAAIADIAAQAAAAAABQBGADoAAQAAAAAABgAIAIAAAwABBAkAAQAQAIgAAwABBAkAAgAMAJgAAwABBAkAAwBIAKQAAwABBAkABAAQAOwAAwABBAkABQCMAPwAAwABBAkABgAQAYhpY29uZm9udE1lZGl1bUZvbnRGb3JnZSAyLjAgOiBpY29uZm9udCA6IDI2LTgtMjAxNWljb25mb250VmVyc2lvbiAxLjAgOyB0dGZhdXRvaGludCAodjAuOTQpIC1sIDggLXIgNTAgLUcgMjAwIC14IDE0IC13ICJHIiAtZiAtc2ljb25mb250AGkAYwBvAG4AZgBvAG4AdABNAGUAZABpAHUAbQBGAG8AbgB0AEYAbwByAGcAZQAgADIALgAwACAAOgAgAGkAYwBvAG4AZgBvAG4AdAAgADoAIAAyADYALQA4AC0AMgAwADEANQBpAGMAbwBuAGYAbwBuAHQAVgBlAHIAcwBpAG8AbgAgADEALgAwACAAOwAgAHQAdABmAGEAdQB0AG8AaABpAG4AdAAgACgAdgAwAC4AOQA0ACkAIAAtAGwAIAA4ACAALQByACAANQAwACAALQBHACAAMgAwADAAIAAtAHgAIAAxADQAIAAtAHcAIAAiAEcAIgAgAC0AZgAgAC0AcwBpAGMAbwBuAGYAbwBuAHQAAAACAAAAAAAA/4MAMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAABAAIAWwECAQMBBAd1bmlFNjUwB3VuaUU2NjEHdW5pRTZERQABAAH//wAPAAAAAAAAAAAAAAAAAAAAAAAyADIDGP/hAxj/bAMY/+EDGP9ssAAssCBgZi2wASwgZCCwwFCwBCZasARFW1ghIyEbilggsFBQWCGwQFkbILA4UFghsDhZWSCwCkVhZLAoUFghsApFILAwUFghsDBZGyCwwFBYIGYgiophILAKUFhgGyCwIFBYIbAKYBsgsDZQWCGwNmAbYFlZWRuwACtZWSOwAFBYZVlZLbACLCBFILAEJWFkILAFQ1BYsAUjQrAGI0IbISFZsAFgLbADLCMhIyEgZLEFYkIgsAYjQrIKAAIqISCwBkMgiiCKsAArsTAFJYpRWGBQG2FSWVgjWSEgsEBTWLAAKxshsEBZI7AAUFhlWS2wBCywCCNCsAcjQrAAI0KwAEOwB0NRWLAIQyuyAAEAQ2BCsBZlHFktsAUssABDIEUgsAJFY7ABRWJgRC2wBiywAEMgRSCwACsjsQQEJWAgRYojYSBkILAgUFghsAAbsDBQWLAgG7BAWVkjsABQWGVZsAMlI2FERC2wByyxBQVFsAFhRC2wCCywAWAgILAKQ0qwAFBYILAKI0JZsAtDSrAAUlggsAsjQlktsAksILgEAGIguAQAY4ojYbAMQ2AgimAgsAwjQiMtsAosS1RYsQcBRFkksA1lI3gtsAssS1FYS1NYsQcBRFkbIVkksBNlI3gtsAwssQANQ1VYsQ0NQ7ABYUKwCStZsABDsAIlQrIAAQBDYEKxCgIlQrELAiVCsAEWIyCwAyVQWLAAQ7AEJUKKiiCKI2GwCCohI7ABYSCKI2GwCCohG7AAQ7ACJUKwAiVhsAgqIVmwCkNHsAtDR2CwgGIgsAJFY7ABRWJgsQAAEyNEsAFDsAA+sgEBAUNgQi2wDSyxAAVFVFgAsA0jQiBgsAFhtQ4OAQAMAEJCimCxDAQrsGsrGyJZLbAOLLEADSstsA8ssQENKy2wECyxAg0rLbARLLEDDSstsBIssQQNKy2wEyyxBQ0rLbAULLEGDSstsBUssQcNKy2wFiyxCA0rLbAXLLEJDSstsBgssAcrsQAFRVRYALANI0IgYLABYbUODgEADABCQopgsQwEK7BrKxsiWS2wGSyxABgrLbAaLLEBGCstsBsssQIYKy2wHCyxAxgrLbAdLLEEGCstsB4ssQUYKy2wHyyxBhgrLbAgLLEHGCstsCEssQgYKy2wIiyxCRgrLbAjLCBgsA5gIEMjsAFgQ7ACJbACJVFYIyA8sAFgI7ASZRwbISFZLbAkLLAjK7AjKi2wJSwgIEcgILACRWOwAUViYCNhOCMgilVYIEcgILACRWOwAUViYCNhOBshWS2wJiyxAAVFVFgAsAEWsCUqsAEVMBsiWS2wJyywByuxAAVFVFgAsAEWsCUqsAEVMBsiWS2wKCwgNbABYC2wKSwAsANFY7ABRWKwACuwAkVjsAFFYrAAK7AAFrQAAAAAAEQ+IzixKAEVKi2wKiwgPCBHILACRWOwAUViYLAAQ2E4LbArLC4XPC2wLCwgPCBHILACRWOwAUViYLAAQ2GwAUNjOC2wLSyxAgAWJSAuIEewACNCsAIlSYqKRyNHI2EgWGIbIVmwASNCsiwBARUUKi2wLiywABawBCWwBCVHI0cjYbAGRStlii4jICA8ijgtsC8ssAAWsAQlsAQlIC5HI0cjYSCwBCNCsAZFKyCwYFBYILBAUVizAiADIBuzAiYDGllCQiMgsAlDIIojRyNHI2EjRmCwBEOwgGJgILAAKyCKimEgsAJDYGQjsANDYWRQWLACQ2EbsANDYFmwAyWwgGJhIyAgsAQmI0ZhOBsjsAlDRrACJbAJQ0cjRyNhYCCwBEOwgGJgIyCwACsjsARDYLAAK7AFJWGwBSWwgGKwBCZhILAEJWBkI7ADJWBkUFghGyMhWSMgILAEJiNGYThZLbAwLLAAFiAgILAFJiAuRyNHI2EjPDgtsDEssAAWILAJI0IgICBGI0ewACsjYTgtsDIssAAWsAMlsAIlRyNHI2GwAFRYLiA8IyEbsAIlsAIlRyNHI2EgsAUlsAQlRyNHI2GwBiWwBSVJsAIlYbABRWMjIFhiGyFZY7ABRWJgIy4jICA8ijgjIVktsDMssAAWILAJQyAuRyNHI2EgYLAgYGawgGIjICA8ijgtsDQsIyAuRrACJUZSWCA8WS6xJAEUKy2wNSwjIC5GsAIlRlBYIDxZLrEkARQrLbA2LCMgLkawAiVGUlggPFkjIC5GsAIlRlBYIDxZLrEkARQrLbA3LLAuKyMgLkawAiVGUlggPFkusSQBFCstsDgssC8riiAgPLAEI0KKOCMgLkawAiVGUlggPFkusSQBFCuwBEMusCQrLbA5LLAAFrAEJbAEJiAuRyNHI2GwBkUrIyA8IC4jOLEkARQrLbA6LLEJBCVCsAAWsAQlsAQlIC5HI0cjYSCwBCNCsAZFKyCwYFBYILBAUVizAiADIBuzAiYDGllCQiMgR7AEQ7CAYmAgsAArIIqKYSCwAkNgZCOwA0NhZFBYsAJDYRuwA0NgWbADJbCAYmGwAiVGYTgjIDwjOBshICBGI0ewACsjYTghWbEkARQrLbA7LLAuKy6xJAEUKy2wPCywLyshIyAgPLAEI0IjOLEkARQrsARDLrAkKy2wPSywABUgR7AAI0KyAAEBFRQTLrAqKi2wPiywABUgR7AAI0KyAAEBFRQTLrAqKi2wPyyxAAEUE7ArKi2wQCywLSotsEEssAAWRSMgLiBGiiNhOLEkARQrLbBCLLAJI0KwQSstsEMssgAAOistsEQssgABOistsEUssgEAOistsEYssgEBOistsEcssgAAOystsEgssgABOystsEkssgEAOystsEossgEBOystsEsssgAANystsEwssgABNystsE0ssgEANystsE4ssgEBNystsE8ssgAAOSstsFAssgABOSstsFEssgEAOSstsFIssgEBOSstsFMssgAAPCstsFQssgABPCstsFUssgEAPCstsFYssgEBPCstsFcssgAAOCstsFgssgABOCstsFkssgEAOCstsFossgEBOCstsFsssDArLrEkARQrLbBcLLAwK7A0Ky2wXSywMCuwNSstsF4ssAAWsDArsDYrLbBfLLAxKy6xJAEUKy2wYCywMSuwNCstsGEssDErsDUrLbBiLLAxK7A2Ky2wYyywMisusSQBFCstsGQssDIrsDQrLbBlLLAyK7A1Ky2wZiywMiuwNistsGcssDMrLrEkARQrLbBoLLAzK7A0Ky2waSywMyuwNSstsGossDMrsDYrLbBrLCuwCGWwAyRQeLABFTAtAABLuADIUlixAQGOWbkIAAgAYyCwASNEILADI3CwDkUgIEu4AA5RS7AGU1pYsDQbsChZYGYgilVYsAIlYbABRWMjYrACI0SzCgkFBCuzCgsFBCuzDg8FBCtZsgQoCUVSRLMKDQYEK7EGAUSxJAGIUViwQIhYsQYDRLEmAYhRWLgEAIhYsQYBRFlZWVm4Af+FsASNsQUARAAAAA==\") format(\"truetype\");\n}\n.iconfont {\n  font-family: iconfont !important;\n  font-size: 16px;\n  font-style: normal;\n  -webkit-font-smoothing: antialiased;\n  -webkit-text-stroke-width: 0.2px;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n[data-dpr=\"2\"] .tab-header {\n  font-size: 28px;\n}\n\n[data-dpr=\"3\"] .tab-header {\n  font-size: 42px;\n}\n\n[data-dpr=\"2\"] .tabheader .hl-icon {\n  font-size: 28px;\n}\n\n[data-dpr=\"3\"] .tabheader .hl-icon {\n  font-size: 42px;\n}\n\n[data-dpr=\"2\"] .tab-header .fold-toggle {\n  font-size: 28px;\n}\n\n[data-dpr=\"3\"] .tab-header .fold-toggle {\n  font-size: 42px;\n}\n", ""]);
	
	// exports


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/* global lib */
	
	'use strict';
	
	__webpack_require__(61);
	__webpack_require__(38);
	
	// lib.scroll events:
	//  - scrollstart
	//  - scrolling
	//  - pulldownend
	//  - pullupend
	//  - pullleftend
	//  - pullrightend
	//  - pulldown
	//  - pullup
	//  - pullleft
	//  - pullright
	//  - contentrefresh
	
	const Component = __webpack_require__(17);
	// const utils = require('../utils')
	
	const directionMap = {
	  h: ['row', 'horizontal', 'h', 'x'],
	  v: ['column', 'vertical', 'v', 'y']
	};
	
	const DEFAULT_DIRECTION = 'column';
	
	// attrs:
	//  - scroll-direciton: none|vertical|horizontal (default is vertical)
	//  - show-scrollbar: true|false (default is true)
	function Scroller(data, nodeType) {
	  const attrs = data.attr || {};
	  const direction = attrs.scrollDirection || attrs.direction || DEFAULT_DIRECTION;
	  this.direction = directionMap.h.indexOf(direction) === -1 ? 'v' : 'h';
	  this.showScrollbar = attrs.showScrollbar || true;
	  Component.call(this, data, nodeType);
	}
	
	Scroller.prototype = Object.create(Component.prototype);
	
	Scroller.prototype.create = function (nodeType) {
	  const Scroll = lib.scroll;
	  const node = Component.prototype.create.call(this, nodeType);
	  node.classList.add('weex-container', 'scroll-wrap');
	  this.scrollElement = document.createElement('div');
	  this.scrollElement.classList.add('weex-container', 'scroll-element', this.direction + '-scroller');
	
	  this.scrollElement.style.webkitBoxOrient = directionMap[this.direction][1];
	  this.scrollElement.style.webkitFlexDirection = directionMap[this.direction][0];
	  this.scrollElement.style.flexDirection = directionMap[this.direction][0];
	
	  node.appendChild(this.scrollElement);
	  this.scroller = new Scroll({
	    // if the direction is x, then the bounding rect of the scroll element
	    // should be got by the 'Range' API other than the 'getBoundingClientRect'
	    // API, because the width outside the viewport won't be count in by
	    // 'getBoundingClientRect'.
	    // Otherwise should use the element rect in case there is a child scroller
	    // or list in this scroller. If using 'Range', the whole scroll element
	    // including the hiding part will be count in the rect.
	    useElementRect: this.direction === 'v',
	    scrollElement: this.scrollElement,
	    direction: this.direction === 'h' ? 'x' : 'y'
	  });
	  this.scroller.init();
	  this.offset = 0;
	  return node;
	};
	
	Scroller.prototype.bindEvents = function (evts) {
	  Component.prototype.bindEvents.call(this, evts);
	  // to enable lazyload for Images
	  this.scroller.addEventListener('scrolling', function (e) {
	    const so = e.scrollObj;
	    const scrollTop = so.getScrollTop();
	    const scrollLeft = so.getScrollLeft();
	    const offset = this.direction === 'v' ? scrollTop : scrollLeft;
	    const diff = offset - this.offset;
	    let dir;
	    if (diff >= 0) {
	      dir = this.direction === 'v' ? 'up' : 'left';
	    } else {
	      dir = this.direction === 'v' ? 'down' : 'right';
	    }
	    this.dispatchEvent('scroll', {
	      originalType: 'scrolling',
	      scrollTop: so.getScrollTop(),
	      scrollLeft: so.getScrollLeft(),
	      offset: offset,
	      direction: dir
	    }, {
	      bubbles: true
	    });
	    this.offset = offset;
	  }.bind(this));
	
	  const pullendEvent = 'pull' + { v: 'up', h: 'left' }[this.direction] + 'end';
	  this.scroller.addEventListener(pullendEvent, function (e) {
	    this.dispatchEvent('loadmore');
	  }.bind(this));
	};
	
	Scroller.prototype.createChildren = function () {
	  const children = this.data.children;
	  const parentRef = this.data.ref;
	  const componentManager = this.getComponentManager();
	  if (children && children.length) {
	    const fragment = document.createDocumentFragment();
	    let isFlex = false;
	    for (let i = 0; i < children.length; i++) {
	      children[i].instanceId = this.data.instanceId;
	      children[i].scale = this.data.scale;
	      const child = componentManager.createElement(children[i]);
	      fragment.appendChild(child.node);
	      child.parentRef = parentRef;
	      if (!isFlex && child.data.style && child.data.style.hasOwnProperty('flex')) {
	        isFlex = true;
	      }
	    }
	    this.scrollElement.appendChild(fragment);
	  }
	  // wait for fragment to appended on scrollElement on UI thread.
	  setTimeout(function () {
	    this.scroller.refresh();
	  }.bind(this), 0);
	};
	
	Scroller.prototype.appendChild = function (data) {
	  const children = this.data.children;
	  const componentManager = this.getComponentManager();
	  const child = componentManager.createElement(data);
	  this.scrollElement.appendChild(child.node);
	
	  // wait for UI thread to update.
	  setTimeout(function () {
	    this.scroller.refresh();
	  }.bind(this), 0);
	
	  // update this.data.children
	  if (!children || !children.length) {
	    this.data.children = [data];
	  } else {
	    children.push(data);
	  }
	
	  return child;
	};
	
	Scroller.prototype.insertBefore = function (child, before) {
	  const children = this.data.children;
	  let i = 0;
	  let isAppend = false;
	
	  // update this.data.children
	  if (!children || !children.length || !before) {
	    isAppend = true;
	  } else {
	    let l;
	    for (l = children.length; i < l; i++) {
	      if (children[i].ref === before.data.ref) {
	        break;
	      }
	    }
	    if (i === l) {
	      isAppend = true;
	    }
	  }
	
	  if (isAppend) {
	    this.scrollElement.appendChild(child.node);
	    children.push(child.data);
	  } else {
	    const refreshLoadingPlaceholder = before.refreshPlaceholder || before.loadingPlaceholder;
	    if (refreshLoadingPlaceholder) {
	      this.scrollElement.insertBefore(child.node, refreshLoadingPlaceholder);
	    } else if (before.fixedPlaceholder) {
	      this.scrollElement.insertBefore(child.node, before.fixedPlaceholder);
	    } else {
	      this.scrollElement.insertBefore(child.node, before.node);
	    }
	    children.splice(i, 0, child.data);
	  }
	
	  // wait for UI thread to update.
	  setTimeout(function () {
	    this.scroller.refresh();
	  }.bind(this), 0);
	};
	
	Scroller.prototype.removeChild = function (child) {
	  const children = this.data.children;
	  // remove from this.data.children
	  let i = 0;
	  const componentManager = this.getComponentManager();
	  if (children && children.length) {
	    let l;
	    for (l = children.length; i < l; i++) {
	      if (children[i].ref === child.data.ref) {
	        break;
	      }
	    }
	    if (i < l) {
	      children.splice(i, 1);
	    }
	  }
	  // remove from componentMap recursively
	  componentManager.removeElementByRef(child.data.ref);
	  const refreshLoadingPlaceholder = child.refreshPlaceholder || child.loadingPlaceholder;
	  if (refreshLoadingPlaceholder) {
	    this.scrollElement.removeChild(refreshLoadingPlaceholder);
	  }
	  if (child.fixedPlaceholder) {
	    this.scrollElement.removeChild(child.fixedPlaceholder);
	  }
	  child.node.parentNode.removeChild(child.node);
	
	  // wait for UI thread to update.
	  setTimeout(function () {
	    this.scroller.refresh();
	  }.bind(this), 0);
	};
	
	Scroller.prototype.onAppend = function () {
	  this._refreshWhenDomRenderend();
	};
	
	Scroller.prototype.onRemove = function () {
	  this._removeEvents();
	};
	
	Scroller.prototype._refreshWhenDomRenderend = function () {
	  const self = this;
	  if (!this.renderendHandler) {
	    this.renderendHandler = function () {
	      self.scroller.refresh();
	    };
	  }
	  window.addEventListener('renderend', this.renderendHandler);
	};
	
	Scroller.prototype._removeEvents = function () {
	  if (this.renderendHandler) {
	    window.removeEventListener('renderend', this.renderendHandler);
	  }
	};
	
	module.exports = Scroller;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(62);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./scroller.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./scroller.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".scroll-wrap {\n  display: block;\n  overflow: hidden;\n}\n\n.scroll-element.horizontal {\n  -webkit-box-orient: horizontal;\n  -webkit-flex-direction: row;\n  flex-direction: row;\n}\n.scroll-element.vertical {\n  -webkit-box-orient: vertical;\n  -webkit-flex-direction: column;\n  flex-direction: column;\n}\n", ""]);
	
	// exports


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(30);
	import { appendStyle, extend } from '../utils';
	
	const availableTypes = ['text', 'password', 'tel', 'email', 'url'];
	const DEFAULT_TYPE = 'text';
	
	// attrs:
	//   - type: text|password|tel|email|url
	//   - value
	//   - placeholder
	//   - disabled
	//   - autofocus
	function Input(data) {
	  Atomic.call(this, data);
	}
	
	Input.prototype = Object.create(Atomic.prototype);
	
	Input.prototype.create = function () {
	  const node = document.createElement('input');
	  const uuid = Math.floor(10000000000000 * Math.random()) + Date.now();
	  this.className = 'weex-ipt-' + uuid;
	  this.styleId = 'weex-style-' + uuid;
	  node.classList.add(this.className);
	  node.classList.add('weex-element');
	  this.placeholder && (node.placeholder = this.placeholder);
	  return node;
	};
	
	// updatable attributes
	Input.prototype.attr = {
	  disabled(val) {
	    this.node.disabled = !!val;
	  },
	
	  placeholder(val) {
	    this.node.placeholder = val || '';
	  },
	
	  value(val) {
	    this.node.value = val || '';
	  },
	
	  autofocus(val) {
	    this.node.autofocus = !!val;
	  },
	
	  type(val) {
	    this.node.type = availableTypes.indexOf(val) !== -1 ? val : DEFAULT_TYPE;
	  }
	};
	
	// updatable styles
	Input.prototype.style = extend(Object.create(Atomic.prototype.style, {
	  placeholderColor: function (val) {
	    this.setPlaceholderColor(val);
	  }
	}));
	
	// events configurations
	Input.prototype.event = {
	  input: {
	    updator() {
	      return {
	        attrs: {
	          value: this.node.value
	        }
	      };
	    },
	    extra() {
	      return {
	        value: this.node.value,
	        timestamp: Date.now()
	      };
	    }
	  },
	
	  change: {
	    updator: function () {
	      return {
	        attrs: {
	          value: this.node.value
	        }
	      };
	    },
	    extra: function () {
	      return {
	        value: this.node.value,
	        timestamp: Date.now()
	      };
	    }
	  }
	};
	
	Input.prototype.setPlaceholderColor = function (placeholderColor) {
	  if (!placeholderColor) {
	    return;
	  }
	  const vendors = ['::-webkit-input-placeholder', ':-moz-placeholder', '::-moz-placeholder', ':-ms-input-placeholder', ':placeholder-shown'];
	  let css = '';
	  const cssRule = 'color: ' + placeholderColor + ';';
	  for (let i = 0, l = vendors.length; i < l; i++) {
	    css += '.' + this.className + vendors[i] + '{' + cssRule + '}';
	  }
	  appendStyle(css, this.styleId, true);
	};
	
	module.exports = Input;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(17);
	const sender = __webpack_require__(21);
	const utils = __webpack_require__(8);
	
	// attrs:
	//   - options: the options to be listed, as a array of strings.
	//   - selectedIndex: the selected options' index number.
	//   - disabled
	function Select(data) {
	  this.options = [];
	  this.selectedIndex = 0;
	  Atomic.call(this, data);
	}
	
	Select.prototype = Object.create(Atomic.prototype);
	
	Select.prototype.create = function () {
	  const node = document.createElement('select');
	  const uuid = Math.floor(10000000000000 * Math.random()) + Date.now();
	  this.className = 'weex-slct-' + uuid;
	  this.styleId = 'weex-style-' + uuid;
	  node.classList.add(this.className);
	  // For the consistency of input component's width.
	  // The date and time type of input will have a bigger width
	  // when the 'box-sizing' is not set to 'border-box'
	  node.style['box-sizing'] = 'border-box';
	  return node;
	};
	
	Select.prototype.attr = {
	  disabled: function (val) {
	    this.node.disabled = val && val !== 'false';
	  },
	  options: function (val) {
	    if (!utils.isArray(val)) {
	      return;
	    }
	    this.options = val;
	    this.node.innerHTML = '';
	    this.createOptions(val);
	  },
	  selectedIndex: function (val) {
	    val = parseInt(val);
	    if (typeof val !== 'number' || isNaN(val) || val >= this.options.length) {
	      return;
	    }
	    this.node.value = this.options[val];
	  }
	};
	
	Select.prototype.bindEvents = function (evts) {
	  let isListenToChange = false;
	  Atomic.prototype.bindEvents.call(this, evts.filter(function (val) {
	    const pass = val !== 'change';
	    !pass && (isListenToChange = true);
	    return pass;
	  }));
	  if (isListenToChange) {
	    this.node.addEventListener('change', function (e) {
	      e.index = this.options.indexOf(this.node.value);
	      sender.fireEvent(this.data.ref, 'change', e);
	    }.bind(this));
	  }
	};
	
	Select.prototype.createOptions = function (opts) {
	  const optDoc = document.createDocumentFragment();
	  for (let i = 0, l = opts.length; i < l; i++) {
	    const opt = document.createElement('option');
	    opt.appendChild(document.createTextNode(opts[i]));
	    optDoc.appendChild(opt);
	  }
	  this.node.appendChild(optDoc);
	};
	
	module.exports = Select;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(30);
	
	// attrs:
	//   - value
	//   - disabled
	function Datepicker(data) {
	  Atomic.call(this, data);
	}
	
	Datepicker.prototype = Object.create(Atomic.prototype);
	
	Datepicker.prototype.create = function () {
	  const node = document.createElement('input');
	  const uuid = Math.floor(10000000000000 * Math.random()) + Date.now();
	  this.className = 'weex-ipt-' + uuid;
	  this.styleId = 'weex-style-' + uuid;
	  node.classList.add(this.className);
	  node.setAttribute('type', 'date');
	  node.type = 'date';
	  // For the consistency of input component's width.
	  // The date and time type of input will have a bigger width
	  // when the 'box-sizing' is not set to 'border-box'
	  node.classList.add('weex-element');
	  return node;
	};
	
	Datepicker.prototype.attr = {
	  disabled: function (val) {
	    this.node.disabled = val && val !== 'false';
	  }
	};
	
	module.exports = Datepicker;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(30);
	
	// attrs:
	//   - value
	//   - disabled
	function Timepicker(data) {
	  Atomic.call(this, data);
	}
	
	Timepicker.prototype = Object.create(Atomic.prototype);
	
	Timepicker.prototype.create = function () {
	  const node = document.createElement('input');
	  const uuid = Math.floor(10000000000000 * Math.random()) + Date.now();
	  this.className = 'weex-ipt-' + uuid;
	  this.styleId = 'weex-style-' + uuid;
	  node.classList.add(this.className);
	  node.setAttribute('type', 'time');
	  node.type = 'time';
	  // For the consistency of input component's width.
	  // The date and time type of input will have a bigger width
	  // when the 'box-sizing' is not set to 'border-box'
	  node.classList.add('weex-element');
	  return node;
	};
	
	Timepicker.prototype.attr = {
	  disabled: function (val) {
	    this.node.disabled = val && val !== 'false';
	  }
	};
	
	module.exports = Timepicker;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(30);
	// const utils = require('../utils')
	__webpack_require__(68);
	
	// attrs:
	//   - autoPlay: true | false (default: false)
	//   - playStatus: play | pause | stop
	//   - src: {string}
	//   - poster: {string}
	//   - loop: true | false (default: false)
	//   - muted: true | false (default: false)
	// events:
	//   - start
	//   - pause
	//   - finish
	//   - fail
	function Video(data) {
	  const autoPlay = data.attr.autoPlay;
	  const playStatus = data.attr.playStatus;
	  this.autoPlay = autoPlay === true || autoPlay === 'true';
	  if (playStatus !== 'play' && playStatus !== 'stop' && playStatus !== 'pause') {
	    this.playStatus = 'pause';
	  } else {
	    this.playStatus = playStatus;
	  }
	  Atomic.call(this, data);
	}
	
	Video.prototype = Object.create(Atomic.prototype);
	
	Video.prototype.attr = {
	  playStatus: function (val) {
	    if (val !== 'play' && val !== 'stop' && val !== 'pause') {
	      val = 'pause';
	    }
	    if (this.playStatus === val) {
	      return;
	    }
	    this.playStatus = val;
	    this.node.setAttribute('play-status', val);
	    this[this.playStatus]();
	  },
	  autoPlay: function (val) {
	    // DO NOTHING
	  }
	};
	
	Video.prototype.create = function () {
	  const node = document.createElement('video');
	  node.classList.add('weex-video', 'weex-element');
	  node.controls = true;
	  node.autoplay = this.autoPlay;
	  node.setAttribute('play-status', this.playStatus);
	  this.node = node;
	  if (this.autoPlay && this.playStatus === 'play') {
	    this.play();
	  }
	  return node;
	};
	
	Video.prototype.bindEvents = function (evts) {
	  Atomic.prototype.bindEvents.call(this, evts);
	
	  // convert w3c-video events to weex-video events.
	  const evtsMap = {
	    start: 'play',
	    finish: 'ended',
	    fail: 'error'
	  };
	  for (const evtName in evtsMap) {
	    this.node.addEventListener(evtsMap[evtName], function (type, e) {
	      this.dispatchEvent(type, e.data);
	    }.bind(this, evtName));
	  }
	};
	
	Video.prototype.play = function () {
	  let src = this.node.getAttribute('src');
	  if (!src) {
	    src = this.node.getAttribute('data-src');
	    src && this.node.setAttribute('src', src);
	  }
	  this.node.play();
	};
	
	Video.prototype.pause = function () {
	  this.node.pause();
	};
	
	Video.prototype.stop = function () {
	  this.node.pause();
	  this.node.autoplay = false;
	  this.node.setAttribute('data-src', this.node.src);
	  this.node.src = '';
	};
	
	module.exports = Video;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(69);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./video.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./video.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".weex-video {\n\tbackground-color: #000;\n}", ""]);
	
	// exports


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(30);
	const utils = __webpack_require__(8);
	__webpack_require__(71);
	
	const defaults = {
	  color: '#64bd63',
	  secondaryColor: '#dfdfdf',
	  jackColor: '#fff',
	  jackSecondaryColor: null,
	  className: 'weex-switch',
	  disabledOpacity: 0.5,
	  speed: '0.4s',
	  width: 100,
	  height: 60,
	  // is width and height scalable ?
	  scalable: false
	};
	
	// attrs:
	//   - checked: if is checked.
	//   - disabled: if true, this component is not available for interaction.
	function Switch(data) {
	  this.options = utils.extend({}, defaults);
	  this.checked = data.attr.checked && data.attr.checked !== 'false';
	  this.data = data;
	  this.width = this.options.width * data.scale;
	  this.height = this.options.height * data.scale;
	  Atomic.call(this, data);
	}
	
	Switch.prototype = Object.create(Atomic.prototype);
	
	Switch.prototype.create = function () {
	  const node = document.createElement('span');
	  this.jack = document.createElement('small');
	  node.appendChild(this.jack);
	  node.className = this.options.className;
	  this.node = node;
	  this.attr.disabled.call(this, this.data.attr.disabled);
	  return node;
	};
	
	Switch.prototype.onAppend = function () {
	  this.setSize();
	  this.setPosition();
	};
	
	Switch.prototype.attr = {
	  disabled: function (val) {
	    this.disabled = val && val !== 'false';
	    this.disabled ? this.disable() : this.enable();
	  }
	};
	
	Switch.prototype.setSize = function () {
	  const min = Math.min(this.width, this.height);
	  const max = Math.max(this.width, this.height);
	  this.node.style.width = max + 'px';
	  this.node.style.height = min + 'px';
	  this.node.style.borderRadius = min / 2 + 'px';
	  this.jack.style.width = this.jack.style.height = min + 'px';
	};
	
	Switch.prototype.setPosition = function (clicked) {
	  let checked = this.checked;
	  const node = this.node;
	  const jack = this.jack;
	
	  if (clicked && checked) {
	    checked = false;
	  } else if (clicked && !checked) {
	    checked = true;
	  }
	
	  if (checked === true) {
	    this.checked = true;
	
	    if (window.getComputedStyle) {
	      jack.style.left = parseInt(window.getComputedStyle(node).width) - parseInt(window.getComputedStyle(jack).width) + 'px';
	    } else {
	      jack.style.left = parseInt(node.currentStyle['width']) - parseInt(jack.currentStyle['width']) + 'px';
	    }
	
	    this.options.color && this.colorize();
	    this.setSpeed();
	  } else {
	    this.checked = false;
	    jack.style.left = 0;
	    node.style.boxShadow = 'inset 0 0 0 0 ' + this.options.secondaryColor;
	    node.style.borderColor = this.options.secondaryColor;
	    node.style.backgroundColor = this.options.secondaryColor !== defaults.secondaryColor ? this.options.secondaryColor : '#fff';
	    jack.style.backgroundColor = this.options.jackSecondaryColor !== this.options.jackColor ? this.options.jackSecondaryColor : this.options.jackColor;
	    this.setSpeed();
	  }
	};
	
	Switch.prototype.colorize = function () {
	  const nodeHeight = this.node.offsetHeight / 2;
	
	  this.node.style.backgroundColor = this.options.color;
	  this.node.style.borderColor = this.options.color;
	  this.node.style.boxShadow = 'inset 0 0 0 ' + nodeHeight + 'px ' + this.options.color;
	  this.jack.style.backgroundColor = this.options.jackColor;
	};
	
	Switch.prototype.setSpeed = function () {
	  let switcherProp = {};
	  const jackProp = {
	    'background-color': this.options.speed,
	    left: this.options.speed.replace(/[a-z]/, '') / 2 + 's'
	  };
	
	  if (this.checked) {
	    switcherProp = {
	      border: this.options.speed,
	      'box-shadow': this.options.speed,
	      'background-color': this.options.speed.replace(/[a-z]/, '') * 3 + 's'
	    };
	  } else {
	    switcherProp = {
	      border: this.options.speed,
	      'box-shadow': this.options.speed
	    };
	  }
	
	  utils.transitionize(this.node, switcherProp);
	  utils.transitionize(this.jack, jackProp);
	};
	
	Switch.prototype.disable = function () {
	  !this.disabled && (this.disabled = true);
	  this.node.style.opacity = defaults.disabledOpacity;
	  this.node.removeEventListener('click', this.getClickHandler());
	};
	
	Switch.prototype.enable = function () {
	  this.disabled && (this.disabled = false);
	  this.node.style.opacity = 1;
	  this.node.addEventListener('click', this.getClickHandler());
	};
	
	Switch.prototype.getClickHandler = function () {
	  if (!this._clickHandler) {
	    this._clickHandler = function () {
	      this.setPosition(true);
	      this.dispatchEvent('change', {
	        value: this.checked
	      });
	    }.bind(this);
	  }
	  return this._clickHandler;
	};
	
	Switch.prototype.style = utils.extend(Object.create(Atomic.prototype.style), {
	  width: function (val) {
	    if (!this.options.scalable) {
	      return;
	    }
	    val = parseFloat(val);
	    if (isNaN(val) || val < 0) {
	      val = this.options.width;
	    }
	    this.width = val * this.data.scale;
	    this.setSize();
	  },
	
	  height: function (val) {
	    if (!this.options.scalable) {
	      return;
	    }
	    val = parseFloat(val);
	    if (isNaN(val) || val < 0) {
	      val = this.options.height;
	    }
	    this.height = val * this.data.scale;
	    this.setSize();
	  }
	});
	
	Switch.prototype.event = {
	  change: {
	    updator() {
	      return {
	        attrs: {
	          checked: this.checked
	        }
	      };
	    },
	    extra() {
	      return {
	        value: this.checked
	      };
	    }
	  }
	};
	
	module.exports = Switch;

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(72);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./switch.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./switch.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, "/* switch defaults. */\n.weex-switch {\n  background-color: #fff;\n  border: 1px solid #dfdfdf;\n  cursor: pointer;\n  display: inline-block;\n  position: relative;\n  vertical-align: middle;\n  -moz-user-select: none;\n  -khtml-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  box-sizing: content-box;\n  background-clip: content-box;\n}\n\n.weex-switch > small {\n  background: #fff;\n  border-radius: 100%;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);\n  position: absolute;\n  top: 0;\n}\n", ""]);
	
	// exports


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const logger = __webpack_require__(25);
	const Component = __webpack_require__(17);
	
	// attrs:
	//   - href
	function A(data) {
	  Component.call(this, data);
	}
	
	A.prototype = Object.create(Component.prototype);
	
	A.prototype.create = function () {
	  const node = document.createElement('a');
	  node.classList.add('weex-container');
	  node.style.textDecoration = 'none';
	  return node;
	};
	
	A.prototype.attr = {
	  href: function (val) {
	    if (!val) {
	      return logger.warn('href of <a> should not be a null value.');
	    }
	    this.href = val;
	    this.node.setAttribute('data-href', val);
	  }
	};
	
	A.prototype.bindEvents = function (evts) {
	  // event handler for click event will be processed
	  // before the url redirection.
	  Component.prototype.bindEvents.call(this, evts);
	  this.node.addEventListener('click', function (evt) {
	    if (evt._alreadyFired && evt.target !== this.node) {
	      // if the event target is this.node, then this is
	      // just another click event handler for the same
	      // target, not a handler for a bubbling up event,
	      // otherwise it is a bubbling up event, and it
	      // should be disregarded.
	      return;
	    }
	    evt._alreadyFired = true;
	    location.href = this.href;
	  }.bind(this));
	};
	
	module.exports = A;

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Component = __webpack_require__(17);
	const utils = __webpack_require__(8);
	
	const ID_PREFIX = 'weex_embed_';
	
	function _generateId() {
	  return ID_PREFIX + utils.getRandom(10);
	}
	
	function Embed(data, nodeType) {
	  const attr = data.attr;
	  if (attr) {
	    this.source = attr.src;
	    this.loader = attr.loader || 'xhr';
	    this.jsonpCallback = attr.jsonpCallback;
	  }
	  Component.call(this, data, nodeType);
	}
	
	Embed.prototype = Object.create(Component.prototype);
	
	Embed.prototype.create = function () {
	  const node = document.createElement('div');
	  node.id = this.id;
	  node.style.overflow = 'scroll';
	  return node;
	};
	
	Embed.prototype.initWeex = function () {
	  this.id = _generateId();
	  this.node.id = this.id;
	  const config = {
	    appId: this.id,
	    source: this.source,
	    bundleUrl: this.source,
	    loader: this.loader,
	    jsonpCallback: this.jsonpCallback,
	    width: this.node.getBoundingClientRect().width,
	    rootId: this.id,
	    embed: true
	  };
	  window.weex.init(config);
	};
	
	Embed.prototype.destroyWeex = function () {
	  this.id && window.destroyInstance(this.id);
	  // TODO: unbind events and clear doms.
	  this.node.innerHTML = '';
	};
	
	Embed.prototype.reloadWeex = function () {
	  if (this.id) {
	    this.destroyWeex();
	    this.id = null;
	    this.node.id = null;
	    this.node.innerHTML = '';
	  }
	  this.initWeex();
	};
	
	// not recommended, because of the leak of memory.
	Embed.prototype.attr = {
	  src: function (value) {
	    this.source = value;
	    this.reloadWeex();
	  }
	};
	
	module.exports = Embed;

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Component = __webpack_require__(17);
	const utils = __webpack_require__(8);
	const logger = __webpack_require__(25);
	
	__webpack_require__(76);
	
	const parents = ['scroller', 'list', 'vlist'];
	
	// Only if pulldown offset is larger than this value can this
	// component trigger the 'refresh' event, otherwise just recover
	// to the start point.
	const DEFAULT_CLAMP = 130;
	const DEFAULT_ALIGN_ITEMS = 'center';
	const DEFAULT_JUSTIFY_CONTENT = 'center';
	
	function Refresh(data) {
	  this.isRefreshing = false;
	  this.clamp = (data.style.height || DEFAULT_CLAMP) * data.scale;
	  !data.style.alignItems && (data.style.alignItems = DEFAULT_ALIGN_ITEMS);
	  !data.style.justifyContent && (data.style.justifyContent = DEFAULT_JUSTIFY_CONTENT);
	  Component.call(this, data);
	}
	
	Refresh.prototype = Object.create(Component.prototype);
	
	Refresh.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('weex-container', 'weex-refresh');
	  return node;
	};
	
	Refresh.prototype.onAppend = function () {
	  const parent = this.getParent();
	  const self = this;
	  if (parents.indexOf(parent.data.type) === -1) {
	    // not in a scroller or a list
	    return;
	  }
	  this.refreshPlaceholder = document.createElement('div');
	  this.refreshPlaceholder.classList.add('weex-refresh-placeholder');
	  this.refreshPlaceholder.style.display = 'none';
	  this.refreshPlaceholder.style.width = '0px';
	  this.refreshPlaceholder.style.height = '0px';
	  const scrollElement = parent.scrollElement || parent.listElement;
	  scrollElement.insertBefore(this.refreshPlaceholder, this.node);
	  parent.node.appendChild(this.node);
	  parent.scroller.addEventListener('pulldown', function (e) {
	    if (self.isRefreshing) {
	      return;
	    }
	    self.adjustHeight(Math.abs(e.scrollObj.getScrollTop()));
	    if (!self.display) {
	      self.show();
	    }
	  });
	  parent.scroller.addEventListener('pulldownend', function (e) {
	    if (self.isRefreshing) {
	      return;
	    }
	    const top = Math.abs(e.scrollObj.getScrollTop());
	    if (top > self.clamp) {
	      self.handleRefresh(e);
	    } else {
	      self.hide();
	    }
	  });
	};
	
	Refresh.prototype.adjustHeight = function (val) {
	  this.node.style.height = val + 'px';
	};
	
	Refresh.prototype.adJustPosition = function (val) {
	  this.node.style.top = -val + 'px';
	};
	
	Refresh.prototype.handleRefresh = function (e) {
	  this.node.style.height = this.clamp + 'px';
	  this.dispatchEvent('refresh');
	  this.isRefreshing = true;
	};
	
	Refresh.prototype.show = function () {
	  this.display = true;
	  this.node.style.display = '-webkit-box';
	  this.node.style.display = '-webkit-flex';
	  this.node.style.display = 'flex';
	};
	
	Refresh.prototype.hide = function () {
	  this.display = false;
	  this.node.style.display = 'none';
	  this.isRefreshing = false;
	};
	
	Refresh.prototype.attr = {
	  display: function (val) {
	    if (val === 'show') {
	      setTimeout(function () {
	        this.show();
	      }.bind(this), 0);
	    } else if (val === 'hide') {
	      setTimeout(function () {
	        this.hide();
	      }.bind(this), 0);
	    } else {
	      logger.error('attr \'display\' of <refresh>\': value ' + val + ' is invalid. Should be \'show\' or \'hide\'');
	    }
	  }
	};
	
	Refresh.prototype.style = utils.extend(Object.create(Component.prototype.style), {
	  height: function (val) {
	    val = parseFloat(val);
	    if (isNaN(val) || val < 0) {
	      return logger.warn('<refresh>\'s height (' + val + ') is invalid.');
	    }
	    this.clamp = val * this.data.scale;
	  }
	});
	
	module.exports = Refresh;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(77);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./refresh.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./refresh.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".weex-refresh {\n  // -webkit-box-align: center;\n  // -webkit-align-items: center;\n  // align-items: center;\n  // -webkit-box-pack: center;\n  // -webkit-justify-content: center;\n  // justify-content: center;\n  overflow: hidden;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 0;\n  z-index: 999999;\n  background-color: #666;\n}", ""]);
	
	// exports


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Component = __webpack_require__(17);
	const utils = __webpack_require__(8);
	const logger = __webpack_require__(25);
	
	__webpack_require__(79);
	
	const parents = ['scroller', 'list', 'vlist'];
	
	const DEFAULT_CLAMP = 130;
	const DEFAULT_ALIGN_ITEMS = 'center';
	const DEFAULT_JUSTIFY_CONTENT = 'center';
	
	function Loading(data) {
	  this.clamp = (data.style.height || DEFAULT_CLAMP) * data.scale;
	  !data.style.alignItems && (data.style.alignItems = DEFAULT_ALIGN_ITEMS);
	  !data.style.justifyContent && (data.style.justifyContent = DEFAULT_JUSTIFY_CONTENT);
	  Component.call(this, data);
	}
	
	Loading.prototype = Object.create(Component.prototype);
	
	Loading.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('weex-container', 'weex-loading');
	  return node;
	};
	
	Loading.prototype.onAppend = function () {
	  const parent = this.getParent();
	  const self = this;
	  const scrollWrapHeight = parent.node.getBoundingClientRect().height;
	  if (parents.indexOf(parent.data.type) === -1) {
	    // not in a scroller or a list
	    return;
	  }
	  this.loadingPlaceholder = document.createElement('div');
	  this.loadingPlaceholder.classList.add('weex-loading-placeholder');
	  this.loadingPlaceholder.style.display = 'none';
	  this.loadingPlaceholder.style.width = '0px';
	  this.loadingPlaceholder.style.height = '0px';
	  const scrollElement = parent.scrollElement || parent.listElement;
	  scrollElement.insertBefore(this.loadingPlaceholder, this.node);
	  parent.node.appendChild(this.node);
	  parent.scroller.addEventListener('pullup', function (e) {
	    if (self.isLoading) {
	      return;
	    }
	    const obj = e.scrollObj;
	    self.adjustHeight(Math.abs(obj.getScrollHeight() - obj.getScrollTop() - scrollWrapHeight));
	    if (!self.display) {
	      self.show();
	    }
	  });
	  parent.scroller.addEventListener('pullupend', function (e) {
	    if (self.isLoading) {
	      return;
	    }
	    self.handleLoading(e);
	  });
	};
	
	Loading.prototype.adjustHeight = function (val) {
	  this.node.style.height = val + 'px';
	};
	
	Loading.prototype.handleLoading = function (e) {
	  this.node.style.height = this.clamp + 'px';
	  this.dispatchEvent('loading');
	  this.isLoading = true;
	};
	
	Loading.prototype.show = function () {
	  this.display = true;
	  this.node.style.display = '-webkit-box';
	  this.node.style.display = '-webkit-flex';
	  this.node.style.display = 'flex';
	};
	
	Loading.prototype.hide = function () {
	  this.display = false;
	  this.node.style.display = 'none';
	  this.isLoading = false;
	};
	
	Loading.prototype.attr = {
	  display: function (val) {
	    if (val === 'show') {
	      setTimeout(function () {
	        this.show();
	      }.bind(this), 0);
	    } else if (val === 'hide') {
	      setTimeout(function () {
	        this.hide();
	      }.bind(this), 0);
	    } else {
	      logger.error('attr \'display\' of <refresh>\': value ' + val + ' is invalid. Should be \'show\' or \'hide\'');
	    }
	  }
	};
	
	Loading.prototype.style = utils.extend(Object.create(Component.prototype.style), {
	  height: function (val) {
	    val = parseFloat(val);
	    if (Number.isNaN(val) || val < 0) {
	      return logger.warn('<loading>\'s height (' + val + ') is invalid.');
	    }
	    this.clamp = val * this.data.scale;
	  }
	});
	
	module.exports = Loading;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(80);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./loading.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./loading.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".weex-loading {\n  // -webkit-box-align: center;\n  // -webkit-align-items: center;\n  // align-items: center;\n  // -webkit-box-pack: center;\n  // -webkit-justify-content: center;\n  // justify-content: center;\n  overflow: hidden;\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 0;\n  background-color: #666;\n}", ""]);
	
	// exports


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	/* global CSSRule */
	
	'use strict';
	
	const Atomic = __webpack_require__(30);
	const utils = __webpack_require__(8);
	
	__webpack_require__(82);
	
	function Spinner(data) {
	  Atomic.call(this, data);
	}
	
	Spinner.prototype = Object.create(Atomic.prototype);
	
	Spinner.prototype.create = function () {
	  const node = document.createElement('div');
	  node.classList.add('weex-container', 'weex-spinner-wrap');
	  this.spinner = document.createElement('div');
	  this.spinner.classList.add('weex-element', 'weex-spinner');
	  node.appendChild(this.spinner);
	  return node;
	};
	
	Spinner.prototype.updateStyle = function (style) {
	  Atomic.prototype.updateStyle.call(this, style);
	  if (style && style.color) {
	    this.setKeyframeColor(utils.getRgb(this.node.style.color));
	  }
	};
	
	Spinner.prototype.getStyleSheet = function () {
	  if (this.styleSheet) {
	    return;
	  }
	  const styles = document.styleSheets;
	  let i, l, j, m;
	  /* eslint-disable no-labels */
	  outer: for (i = 0, l = styles.length; i < l; i++) {
	    const rules = styles[i].rules;
	    for (j = 0, m = rules.length; j < m; j++) {
	      const item = rules.item(j);
	      if ((item.type === CSSRule.KEYFRAMES_RULE || item.type === CSSRule.WEBKIT_KEYFRAMES_RULE) && item.name === 'spinner') {
	        break outer;
	      }
	    }
	  }
	  /* eslint-enable no-labels */
	  this.styleSheet = styles[i];
	};
	
	Spinner.prototype.setKeyframeColor = function (val) {
	  this.getStyleSheet();
	  const keyframeRules = this.computeKeyFrameRules(val);
	  const rules = this.styleSheet.rules;
	  for (let i = 0, l = rules.length; i < l; i++) {
	    const item = rules.item(i);
	    if ((item.type === CSSRule.KEYFRAMES_RULE || item.type === CSSRule.WEBKIT_KEYFRAMES_RULE) && item.name === 'spinner') {
	      const cssRules = item.cssRules;
	      for (let j = 0, m = cssRules.length; j < m; j++) {
	        const keyframe = cssRules[j];
	        if (keyframe.type === CSSRule.KEYFRAME_RULE || keyframe.type === CSSRule.WEBKIT_KEYFRAME_RULE) {
	          keyframe.style.boxShadow = keyframeRules[j];
	        }
	      }
	    }
	  }
	};
	
	Spinner.prototype.computeKeyFrameRules = function (rgb) {
	  if (!rgb) {
	    return;
	  }
	  const scaleArr = ['0em -2.6em 0em 0em', '1.8em -1.8em 0 0em', '2.5em 0em 0 0em', '1.75em 1.75em 0 0em', '0em 2.5em 0 0em', '-1.8em 1.8em 0 0em', '-2.6em 0em 0 0em', '-1.8em -1.8em 0 0em'];
	  const colorArr = ['1', '0.2', '0.2', '0.2', '0.2', '0.2', '0.5', '0.7'].map(function (e) {
	    return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + e + ')';
	  });
	  const rules = [];
	  for (let i = 0; i < scaleArr.length; i++) {
	    const tmpColorArr = utils.loopArray(colorArr, i, 'r');
	    rules.push(scaleArr.map(function (scaleStr, i) {
	      return scaleStr + ' ' + tmpColorArr[i];
	    }).join(', '));
	  }
	  return rules;
	};
	
	module.exports = Spinner;

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(83);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./spinner.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./spinner.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".weex-spinner-wrap {\n  width: 1.013333rem; /* 76px */\n  height: 1.013333rem;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  align-items: center;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  justify-content: center;\n  overflow: visible;\n}\n\n.weex-spinner {\n  font-size: 0.16rem; /* 12px */\n  width: 1em;\n  height: 1em;\n  border-radius: 50%;\n  position: relative;\n  text-indent: -9999em;\n  -webkit-animation: spinner 1.1s infinite ease;\n  animation: spinner 1.1s infinite ease;\n  -webkit-transform: translateZ(0);\n  -ms-transform: translateZ(0);\n  transform: translateZ(0);\n}\n@-webkit-keyframes spinner {\n  0%,\n  100% {\n    box-shadow: 0em -2.6em 0em 0em #ffffff, 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.5), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7);\n  }\n  12.5% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.7), 1.8em -1.8em 0 0em #ffffff, 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5);\n  }\n  25% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.5), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7), 2.5em 0em 0 0em #ffffff, 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  37.5% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5), 2.5em 0em 0 0em rgba(255, 255, 255, 0.7), 1.75em 1.75em 0 0em #ffffff, 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  50% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.5), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.7), 0em 2.5em 0 0em #ffffff, -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  62.5% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.5), 0em 2.5em 0 0em rgba(255, 255, 255, 0.7), -1.8em 1.8em 0 0em #ffffff, -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  75% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.5), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.7), -2.6em 0em 0 0em #ffffff, -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  87.5% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.5), -2.6em 0em 0 0em rgba(255, 255, 255, 0.7), -1.8em -1.8em 0 0em #ffffff;\n  }\n}\n@keyframes spinner {\n  0%,\n  100% {\n    box-shadow: 0em -2.6em 0em 0em #ffffff, 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.5), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7);\n  }\n  12.5% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.7), 1.8em -1.8em 0 0em #ffffff, 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5);\n  }\n  25% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.5), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.7), 2.5em 0em 0 0em #ffffff, 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  37.5% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.5), 2.5em 0em 0 0em rgba(255, 255, 255, 0.7), 1.75em 1.75em 0 0em #ffffff, 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  50% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.5), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.7), 0em 2.5em 0 0em #ffffff, -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.2), -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  62.5% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.5), 0em 2.5em 0 0em rgba(255, 255, 255, 0.7), -1.8em 1.8em 0 0em #ffffff, -2.6em 0em 0 0em rgba(255, 255, 255, 0.2), -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  75% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.5), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.7), -2.6em 0em 0 0em #ffffff, -1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2);\n  }\n  87.5% {\n    box-shadow: 0em -2.6em 0em 0em rgba(255, 255, 255, 0.2), 1.8em -1.8em 0 0em rgba(255, 255, 255, 0.2), 2.5em 0em 0 0em rgba(255, 255, 255, 0.2), 1.75em 1.75em 0 0em rgba(255, 255, 255, 0.2), 0em 2.5em 0 0em rgba(255, 255, 255, 0.2), -1.8em 1.8em 0 0em rgba(255, 255, 255, 0.5), -2.6em 0em 0 0em rgba(255, 255, 255, 0.7), -1.8em -1.8em 0 0em #ffffff;\n  }\n}\n", ""]);
	
	// exports


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const Atomic = __webpack_require__(30);
	const utils = __webpack_require__(8);
	const logger = __webpack_require__(25);
	
	// A component to import web pages, which works like
	// a iframe element or a webview.
	// attrs:
	//   - src
	// events:
	//   - pagestart
	//   - pagefinish
	//   - error
	function Web(data) {
	  Atomic.call(this, data);
	}
	
	Web.prototype = Object.create(Atomic.prototype);
	
	Web.prototype.create = function () {
	  // Iframe's defect: can't use position:absolute and top, left, right,
	  // bottom all setting to zero and use margin to leave specified
	  // height for a blank area, and have to use 100% to fill the parent
	  // container, otherwise it will use a unwanted default size instead.
	  // Therefore a div as a iframe wrapper is needed here.
	  const node = document.createElement('div');
	  node.classList.add('weex-container');
	  this.web = document.createElement('iframe');
	  node.appendChild(this.web);
	  this.web.classList.add('weex-element');
	  this.web.style.width = '100%';
	  this.web.style.height = '100%';
	  this.web.style.border = 'none';
	  return node;
	};
	
	Web.prototype.bindEvents = function (evts) {
	  Atomic.prototype.bindEvents.call(this, evts);
	  const that = this;
	  this.web.addEventListener('load', function (e) {
	    that.dispatchEvent('pagefinish', utils.extend({
	      url: that.web.src
	    }));
	  });
	  window.addEventListener('message', this.msgHandler.bind(this));
	};
	
	Web.prototype.msgHandler = function (evt) {
	  let msg = evt.data;
	  if (typeof msg === 'string') {
	    try {
	      msg = JSON.parse(msg);
	    } catch (e) {}
	  }
	  if (!msg) {
	    return;
	  }
	  if (msg.type === 'weex') {
	    if (!utils.isArray(msg.content)) {
	      return logger.error('weex msg received by web component. msg.content' + ' should be a array:', msg.content);
	    }
	    callNative(this.getComponentManager().instanceId, msg.content);
	  }
	};
	
	Web.prototype.attr = {
	  src: function (val) {
	    this.web.src = val;
	    setTimeout(function () {
	      this.dispatchEvent('pagestart', { url: val });
	    }.bind(this), 0);
	  }
	};
	
	Web.prototype.goBack = function () {
	  this.web.contentWindow.history.back();
	};
	
	Web.prototype.goForward = function () {
	  this.web.contentWindow.history.forward();
	};
	
	Web.prototype.reload = function () {
	  this.web.contentWindow.location.reload();
	};
	
	module.exports = Web;

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	const dom = __webpack_require__(86);
	const event = __webpack_require__(94);
	const pageInfo = __webpack_require__(95);
	const stream = __webpack_require__(96);
	const modal = __webpack_require__(98);
	const animation = __webpack_require__(115);
	const webview = __webpack_require__(116);
	const timer = __webpack_require__(117);
	const navigator = __webpack_require__(118);
	const clipboard = __webpack_require__(119);
	
	const api = {
	  init: function (Weex) {
	    Weex.registerApiModule('dom', dom, dom._meta);
	    Weex.registerApiModule('event', event, event._meta);
	    Weex.registerApiModule('pageInfo', pageInfo, pageInfo._meta);
	    Weex.registerApiModule('stream', stream, stream._meta);
	    Weex.registerApiModule('modal', modal, modal._meta);
	    Weex.registerApiModule('animation', animation, animation._meta);
	    Weex.registerApiModule('webview', webview, webview._meta);
	    Weex.registerApiModule('timer', timer, timer._meta);
	    Weex.registerApiModule('navigator', navigator, navigator._meta);
	    Weex.registerApiModule('clipboard', clipboard, clipboard._meta);
	  }
	};
	
	module.exports = api;

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	// const FrameUpdater = require('../frameUpdater')
	// const Component = require('../components/component')
	
	const scroll = __webpack_require__(87);
	// const config = require('../config')
	const logger = __webpack_require__(25);
	
	const dom = {
	
	  /**
	   * createBody: create root component
	   * @param  {object} element
	   *    container|listview|scrollview
	   * @return {[type]}      [description]
	   */
	  createBody: function (element) {
	    const componentManager = this.getComponentManager();
	    element.scale = this.scale;
	    element.instanceId = componentManager.instanceId;
	    return componentManager.createBody(element);
	  },
	
	  addElement: function (parentRef, element, index) {
	    const componentManager = this.getComponentManager();
	    element.scale = this.scale;
	    element.instanceId = componentManager.instanceId;
	    return componentManager.addElement(parentRef, element, index);
	  },
	
	  removeElement: function (ref) {
	    const componentManager = this.getComponentManager();
	    return componentManager.removeElement(ref);
	  },
	
	  moveElement: function (ref, parentRef, index) {
	    const componentManager = this.getComponentManager();
	    return componentManager.moveElement(ref, parentRef, index);
	  },
	
	  addEvent: function (ref, type) {
	    const componentManager = this.getComponentManager();
	    return componentManager.addEvent(ref, type);
	  },
	
	  removeEvent: function (ref, type) {
	    const componentManager = this.getComponentManager();
	    return componentManager.removeEvent(ref, type);
	  },
	
	  /**
	   * updateAttrs: update attributes of component
	   * @param  {string} ref
	   * @param  {obj} attr
	   */
	  updateAttrs: function (ref, attr) {
	    const componentManager = this.getComponentManager();
	    return componentManager.updateAttrs(ref, attr);
	  },
	
	  /**
	   * updateStyle: udpate style of component
	   * @param {string} ref
	   * @param {obj} style
	   */
	  updateStyle: function (ref, style) {
	    const componentManager = this.getComponentManager();
	    return componentManager.updateStyle(ref, style);
	  },
	
	  createFinish: function () {
	    // TODO
	    // FrameUpdater.pause()
	  },
	
	  refreshFinish: function () {
	    // TODO
	  },
	
	  /**
	   * scrollToElement
	   * @param  {string} ref
	   * @param  {obj} options {offset:Number}
	   *   ps: scroll-to has 'ease' and 'duration'(ms) as options.
	   */
	  scrollToElement: function (ref, options) {
	    !options && (options = {});
	    const offset = (Number(options.offset) || 0) * this.scale;
	    const componentManager = this.getComponentManager();
	    const elem = componentManager.getElementByRef(ref);
	    if (!elem) {
	      return logger.error('component of ref ' + ref + ' doesn\'t exist.');
	    }
	    const parentScroller = elem.getParentScroller();
	    if (parentScroller) {
	      parentScroller.scroller.scrollToElement(elem.node, true, offset);
	    } else {
	      const offsetTop = elem.node.getBoundingClientRect().top + document.body.scrollTop;
	      const tween = scroll(0, offsetTop + offset, options);
	      tween.on('end', function () {
	        logger.log('scroll end.');
	      });
	    }
	  }
	
	};
	
	dom._meta = {
	  dom: [{
	    name: 'createBody',
	    args: ['object']
	  }, {
	    name: 'addElement',
	    args: ['string', 'object', 'number']
	  }, {
	    name: 'removeElement',
	    args: ['string']
	  }, {
	    name: 'moveElement',
	    args: ['string', 'string', 'number']
	  }, {
	    name: 'addEvent',
	    args: ['string', 'string']
	  }, {
	    name: 'removeEvent',
	    args: ['string', 'string']
	  }, {
	    name: 'updateAttrs',
	    args: ['string', 'object']
	  }, {
	    name: 'updateStyle',
	    args: ['string', 'object']
	  }, {
	    name: 'createFinish',
	    args: []
	  }, {
	    name: 'refreshFinish',
	    args: []
	  }, {
	    name: 'scrollToElement',
	    args: ['string', 'object']
	  }]
	};
	
	module.exports = dom;

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var Tween = __webpack_require__(88);
	var raf = __webpack_require__(93);
	
	/**
	 * Expose `scrollTo`.
	 */
	
	module.exports = scrollTo;
	
	/**
	 * Scroll to `(x, y)`.
	 *
	 * @param {Number} x
	 * @param {Number} y
	 * @api public
	 */
	
	function scrollTo(x, y, options) {
	  options = options || {};
	
	  // start position
	  var start = scroll();
	
	  // setup tween
	  var tween = Tween(start).ease(options.ease || 'out-circ').to({ top: y, left: x }).duration(options.duration || 1000);
	
	  // scroll
	  tween.update(function (o) {
	    window.scrollTo(o.left | 0, o.top | 0);
	  });
	
	  // handle end
	  tween.on('end', function () {
	    animate = function () {};
	  });
	
	  // animate
	  function animate() {
	    raf(animate);
	    tween.update();
	  }
	
	  animate();
	
	  return tween;
	}
	
	/**
	 * Return scroll position.
	 *
	 * @return {Object}
	 * @api private
	 */
	
	function scroll() {
	  var y = window.pageYOffset || document.documentElement.scrollTop;
	  var x = window.pageXOffset || document.documentElement.scrollLeft;
	  return { top: y, left: x };
	}

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var Emitter = __webpack_require__(89);
	var clone = __webpack_require__(90);
	var type = __webpack_require__(91);
	var ease = __webpack_require__(92);
	
	/**
	 * Expose `Tween`.
	 */
	
	module.exports = Tween;
	
	/**
	 * Initialize a new `Tween` with `obj`.
	 *
	 * @param {Object|Array} obj
	 * @api public
	 */
	
	function Tween(obj) {
	  if (!(this instanceof Tween)) return new Tween(obj);
	  this._from = obj;
	  this.ease('linear');
	  this.duration(500);
	}
	
	/**
	 * Mixin emitter.
	 */
	
	Emitter(Tween.prototype);
	
	/**
	 * Reset the tween.
	 *
	 * @api public
	 */
	
	Tween.prototype.reset = function () {
	  this.isArray = 'array' === type(this._from);
	  this._curr = clone(this._from);
	  this._done = false;
	  this._start = Date.now();
	  return this;
	};
	
	/**
	 * Tween to `obj` and reset internal state.
	 *
	 *    tween.to({ x: 50, y: 100 })
	 *
	 * @param {Object|Array} obj
	 * @return {Tween} self
	 * @api public
	 */
	
	Tween.prototype.to = function (obj) {
	  this.reset();
	  this._to = obj;
	  return this;
	};
	
	/**
	 * Set duration to `ms` [500].
	 *
	 * @param {Number} ms
	 * @return {Tween} self
	 * @api public
	 */
	
	Tween.prototype.duration = function (ms) {
	  this._duration = ms;
	  return this;
	};
	
	/**
	 * Set easing function to `fn`.
	 *
	 *    tween.ease('in-out-sine')
	 *
	 * @param {String|Function} fn
	 * @return {Tween}
	 * @api public
	 */
	
	Tween.prototype.ease = function (fn) {
	  fn = 'function' == typeof fn ? fn : ease[fn];
	  if (!fn) throw new TypeError('invalid easing function');
	  this._ease = fn;
	  return this;
	};
	
	/**
	 * Stop the tween and immediately emit "stop" and "end".
	 *
	 * @return {Tween}
	 * @api public
	 */
	
	Tween.prototype.stop = function () {
	  this.stopped = true;
	  this._done = true;
	  this.emit('stop');
	  this.emit('end');
	  return this;
	};
	
	/**
	 * Perform a step.
	 *
	 * @return {Tween} self
	 * @api private
	 */
	
	Tween.prototype.step = function () {
	  if (this._done) return;
	
	  // duration
	  var duration = this._duration;
	  var now = Date.now();
	  var delta = now - this._start;
	  var done = delta >= duration;
	
	  // complete
	  if (done) {
	    this._from = this._to;
	    this._update(this._to);
	    this._done = true;
	    this.emit('end');
	    return this;
	  }
	
	  // tween
	  var from = this._from;
	  var to = this._to;
	  var curr = this._curr;
	  var fn = this._ease;
	  var p = (now - this._start) / duration;
	  var n = fn(p);
	
	  // array
	  if (this.isArray) {
	    for (var i = 0; i < from.length; ++i) {
	      curr[i] = from[i] + (to[i] - from[i]) * n;
	    }
	
	    this._update(curr);
	    return this;
	  }
	
	  // objech
	  for (var k in from) {
	    curr[k] = from[k] + (to[k] - from[k]) * n;
	  }
	
	  this._update(curr);
	  return this;
	};
	
	/**
	 * Set update function to `fn` or
	 * when no argument is given this performs
	 * a "step".
	 *
	 * @param {Function} fn
	 * @return {Tween} self
	 * @api public
	 */
	
	Tween.prototype.update = function (fn) {
	  if (0 == arguments.length) return this.step();
	  this._update = fn;
	  return this;
	};

/***/ },
/* 89 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	module.exports = Emitter;
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function (event, fn) {
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function (event) {
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1),
	      callbacks = this._callbacks['$' + event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function (event) {
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function (event) {
	  return !!this.listeners(event).length;
	};

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var type;
	try {
	  type = __webpack_require__(91);
	} catch (_) {
	  type = __webpack_require__(91);
	}
	
	/**
	 * Module exports.
	 */
	
	module.exports = clone;
	
	/**
	 * Clones objects.
	 *
	 * @param {Mixed} any object
	 * @api public
	 */
	
	function clone(obj) {
	  switch (type(obj)) {
	    case 'object':
	      var copy = {};
	      for (var key in obj) {
	        if (obj.hasOwnProperty(key)) {
	          copy[key] = clone(obj[key]);
	        }
	      }
	      return copy;
	
	    case 'array':
	      var copy = new Array(obj.length);
	      for (var i = 0, l = obj.length; i < l; i++) {
	        copy[i] = clone(obj[i]);
	      }
	      return copy;
	
	    case 'regexp':
	      // from millermedeiros/amd-utils - MIT
	      var flags = '';
	      flags += obj.multiline ? 'm' : '';
	      flags += obj.global ? 'g' : '';
	      flags += obj.ignoreCase ? 'i' : '';
	      return new RegExp(obj.source, flags);
	
	    case 'date':
	      return new Date(obj.getTime());
	
	    default:
	      // string, number, boolean, …
	      return obj;
	  }
	}

/***/ },
/* 91 */
/***/ function(module, exports) {

	/**
	 * toString ref.
	 */
	
	var toString = Object.prototype.toString;
	
	/**
	 * Return the type of `val`.
	 *
	 * @param {Mixed} val
	 * @return {String}
	 * @api public
	 */
	
	module.exports = function (val) {
	  switch (toString.call(val)) {
	    case '[object Date]':
	      return 'date';
	    case '[object RegExp]':
	      return 'regexp';
	    case '[object Arguments]':
	      return 'arguments';
	    case '[object Array]':
	      return 'array';
	    case '[object Error]':
	      return 'error';
	  }
	
	  if (val === null) return 'null';
	  if (val === undefined) return 'undefined';
	  if (val !== val) return 'nan';
	  if (val && val.nodeType === 1) return 'element';
	
	  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val);
	
	  return typeof val;
	};

/***/ },
/* 92 */
/***/ function(module, exports) {

	
	// easing functions from "Tween.js"
	
	exports.linear = function (n) {
	  return n;
	};
	
	exports.inQuad = function (n) {
	  return n * n;
	};
	
	exports.outQuad = function (n) {
	  return n * (2 - n);
	};
	
	exports.inOutQuad = function (n) {
	  n *= 2;
	  if (n < 1) return 0.5 * n * n;
	  return -0.5 * (--n * (n - 2) - 1);
	};
	
	exports.inCube = function (n) {
	  return n * n * n;
	};
	
	exports.outCube = function (n) {
	  return --n * n * n + 1;
	};
	
	exports.inOutCube = function (n) {
	  n *= 2;
	  if (n < 1) return 0.5 * n * n * n;
	  return 0.5 * ((n -= 2) * n * n + 2);
	};
	
	exports.inQuart = function (n) {
	  return n * n * n * n;
	};
	
	exports.outQuart = function (n) {
	  return 1 - --n * n * n * n;
	};
	
	exports.inOutQuart = function (n) {
	  n *= 2;
	  if (n < 1) return 0.5 * n * n * n * n;
	  return -0.5 * ((n -= 2) * n * n * n - 2);
	};
	
	exports.inQuint = function (n) {
	  return n * n * n * n * n;
	};
	
	exports.outQuint = function (n) {
	  return --n * n * n * n * n + 1;
	};
	
	exports.inOutQuint = function (n) {
	  n *= 2;
	  if (n < 1) return 0.5 * n * n * n * n * n;
	  return 0.5 * ((n -= 2) * n * n * n * n + 2);
	};
	
	exports.inSine = function (n) {
	  return 1 - Math.cos(n * Math.PI / 2);
	};
	
	exports.outSine = function (n) {
	  return Math.sin(n * Math.PI / 2);
	};
	
	exports.inOutSine = function (n) {
	  return .5 * (1 - Math.cos(Math.PI * n));
	};
	
	exports.inExpo = function (n) {
	  return 0 == n ? 0 : Math.pow(1024, n - 1);
	};
	
	exports.outExpo = function (n) {
	  return 1 == n ? n : 1 - Math.pow(2, -10 * n);
	};
	
	exports.inOutExpo = function (n) {
	  if (0 == n) return 0;
	  if (1 == n) return 1;
	  if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1);
	  return .5 * (-Math.pow(2, -10 * (n - 1)) + 2);
	};
	
	exports.inCirc = function (n) {
	  return 1 - Math.sqrt(1 - n * n);
	};
	
	exports.outCirc = function (n) {
	  return Math.sqrt(1 - --n * n);
	};
	
	exports.inOutCirc = function (n) {
	  n *= 2;
	  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);
	  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);
	};
	
	exports.inBack = function (n) {
	  var s = 1.70158;
	  return n * n * ((s + 1) * n - s);
	};
	
	exports.outBack = function (n) {
	  var s = 1.70158;
	  return --n * n * ((s + 1) * n + s) + 1;
	};
	
	exports.inOutBack = function (n) {
	  var s = 1.70158 * 1.525;
	  if ((n *= 2) < 1) return 0.5 * (n * n * ((s + 1) * n - s));
	  return 0.5 * ((n -= 2) * n * ((s + 1) * n + s) + 2);
	};
	
	exports.inBounce = function (n) {
	  return 1 - exports.outBounce(1 - n);
	};
	
	exports.outBounce = function (n) {
	  if (n < 1 / 2.75) {
	    return 7.5625 * n * n;
	  } else if (n < 2 / 2.75) {
	    return 7.5625 * (n -= 1.5 / 2.75) * n + 0.75;
	  } else if (n < 2.5 / 2.75) {
	    return 7.5625 * (n -= 2.25 / 2.75) * n + 0.9375;
	  } else {
	    return 7.5625 * (n -= 2.625 / 2.75) * n + 0.984375;
	  }
	};
	
	exports.inOutBounce = function (n) {
	  if (n < .5) return exports.inBounce(n * 2) * .5;
	  return exports.outBounce(n * 2 - 1) * .5 + .5;
	};
	
	// aliases
	
	exports['in-quad'] = exports.inQuad;
	exports['out-quad'] = exports.outQuad;
	exports['in-out-quad'] = exports.inOutQuad;
	exports['in-cube'] = exports.inCube;
	exports['out-cube'] = exports.outCube;
	exports['in-out-cube'] = exports.inOutCube;
	exports['in-quart'] = exports.inQuart;
	exports['out-quart'] = exports.outQuart;
	exports['in-out-quart'] = exports.inOutQuart;
	exports['in-quint'] = exports.inQuint;
	exports['out-quint'] = exports.outQuint;
	exports['in-out-quint'] = exports.inOutQuint;
	exports['in-sine'] = exports.inSine;
	exports['out-sine'] = exports.outSine;
	exports['in-out-sine'] = exports.inOutSine;
	exports['in-expo'] = exports.inExpo;
	exports['out-expo'] = exports.outExpo;
	exports['in-out-expo'] = exports.inOutExpo;
	exports['in-circ'] = exports.inCirc;
	exports['out-circ'] = exports.outCirc;
	exports['in-out-circ'] = exports.inOutCirc;
	exports['in-back'] = exports.inBack;
	exports['out-back'] = exports.outBack;
	exports['in-out-back'] = exports.inOutBack;
	exports['in-bounce'] = exports.inBounce;
	exports['out-bounce'] = exports.outBounce;
	exports['in-out-bounce'] = exports.inOutBounce;

/***/ },
/* 93 */
/***/ function(module, exports) {

	/**
	 * Expose `requestAnimationFrame()`.
	 */
	
	exports = module.exports = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || fallback;
	
	/**
	 * Fallback implementation.
	 */
	
	var prev = new Date().getTime();
	function fallback(fn) {
	  var curr = new Date().getTime();
	  var ms = Math.max(0, 16 - (curr - prev));
	  var req = setTimeout(fn, ms);
	  prev = curr;
	  return req;
	}
	
	/**
	 * Cancel.
	 */
	
	var cancel = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.clearTimeout;
	
	exports.cancel = function (id) {
	  cancel.call(window, id);
	};

/***/ },
/* 94 */
/***/ function(module, exports) {

	'use strict';
	
	const event = {
	  /**
	   * openUrl
	   * @param  {string} url
	   */
	  openURL: function (url) {
	    location.href = url;
	  }
	
	};
	
	event._meta = {
	  event: [{
	    name: 'openURL',
	    args: ['string']
	  }]
	};
	
	module.exports = event;

/***/ },
/* 95 */
/***/ function(module, exports) {

	'use strict';
	
	const pageInfo = {
	
	  setTitle: function (title) {
	    title = title || 'Weex HTML5';
	    try {
	      title = decodeURIComponent(title);
	    } catch (e) {}
	    document.title = title;
	  }
	};
	
	pageInfo._meta = {
	  pageInfo: [{
	    name: 'setTitle',
	    args: ['string']
	  }]
	};
	
	module.exports = pageInfo;

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/* global lib, XMLHttpRequest */
	
	'use strict';
	
	const utils = __webpack_require__(8);
	const logger = __webpack_require__(25);
	
	__webpack_require__(97);
	
	let jsonpCnt = 0;
	const ERROR_STATE = -1;
	
	const TYPE_JSON = 'application/json;charset=UTF-8';
	const TYPE_FORM = 'application/x-www-form-urlencoded';
	
	const REG_FORM = /^(?:[^&=]+=[^&=]+)(?:&[^&=]+=[^&=]+)*$/;
	
	function _jsonp(config, callback, progressCallback) {
	  const cbName = 'jsonp_' + ++jsonpCnt;
	  let url;
	
	  if (!config.url) {
	    logger.error('config.url should be set in _jsonp for \'fetch\' API.');
	  }
	
	  global[cbName] = function (cb) {
	    return function (response) {
	      callback(response);
	      delete global[cb];
	    };
	  }(cbName);
	
	  const script = document.createElement('script');
	  try {
	    url = lib.httpurl(config.url);
	  } catch (err) {
	    logger.error('invalid config.url in _jsonp for \'fetch\' API: ' + config.url);
	  }
	  url.params.callback = cbName;
	  script.type = 'text/javascript';
	  script.src = url.toString();
	  // script.onerror is not working on IE or safari.
	  // but they are not considered here.
	  script.onerror = function (cb) {
	    return function (err) {
	      logger.error('unexpected error in _jsonp for \'fetch\' API', err);
	      callback(err);
	      delete global[cb];
	    };
	  }(cbName);
	  const head = document.getElementsByTagName('head')[0];
	  head.insertBefore(script, null);
	}
	
	function _xhr(config, callback, progressCallback) {
	  const xhr = new XMLHttpRequest();
	  xhr.responseType = config.type;
	  xhr.open(config.method, config.url, true);
	
	  const headers = config.headers || {};
	  for (const k in headers) {
	    xhr.setRequestHeader(k, headers[k]);
	  }
	
	  xhr.onload = function (res) {
	    callback({
	      status: xhr.status,
	      ok: xhr.status >= 200 && xhr.status < 300,
	      statusText: xhr.statusText,
	      data: xhr.response,
	      headers: xhr.getAllResponseHeaders().split('\n').reduce(function (obj, headerStr) {
	        const headerArr = headerStr.match(/(.+): (.+)/);
	        if (headerArr) {
	          obj[headerArr[1]] = headerArr[2];
	        }
	        return obj;
	      }, {})
	    });
	  };
	
	  if (progressCallback) {
	    xhr.onprogress = function (e) {
	      progressCallback({
	        readyState: xhr.readyState,
	        status: xhr.status,
	        length: e.loaded,
	        total: e.total,
	        statusText: xhr.statusText,
	        headers: xhr.getAllResponseHeaders().split('\n').reduce(function (obj, headerStr) {
	          const headerArr = headerStr.match(/(.+): (.+)/);
	          if (headerArr) {
	            obj[headerArr[1]] = headerArr[2];
	          }
	          return obj;
	        }, {})
	      });
	    };
	  }
	
	  xhr.onerror = function (err) {
	    logger.error('unexpected error in _xhr for \'fetch\' API', err);
	    callback({
	      status: ERROR_STATE,
	      ok: false,
	      statusText: '',
	      data: '',
	      headers: {}
	    });
	  };
	
	  xhr.send(config.body);
	}
	
	const stream = {
	
	  /**
	   * sendHttp
	   * @deprecated
	   * Note: This API is deprecated. Please use stream.fetch instead.
	   * send a http request through XHR.
	   * @param  {obj} params
	   *  - method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH',
	   *  - url: url requested
	   * @param  {string} callbackId
	   */
	  sendHttp: function (param, callbackId) {
	    if (typeof param === 'string') {
	      try {
	        param = JSON.parse(param);
	      } catch (e) {
	        return;
	      }
	    }
	    if (typeof param !== 'object' || !param.url) {
	      return logger.error('invalid config or invalid config.url for sendHttp API');
	    }
	
	    const sender = this.sender;
	    const method = param.method || 'GET';
	    const xhr = new XMLHttpRequest();
	    xhr.open(method, param.url, true);
	    xhr.onload = function () {
	      sender.performCallback(callbackId, this.responseText);
	    };
	    xhr.onerror = function (error) {
	      return logger.error('unexpected error in sendHttp API', error);
	      // sender.performCallback(
	      //   callbackId,
	      //   new Error('unexpected error in sendHttp API')
	      // )
	    };
	    xhr.send();
	  },
	
	  /**
	   * fetch
	   * use stream.fetch to request for a json file, a plain text file or
	   * a arraybuffer for a file stream. (You can use Blob and FileReader
	   * API implemented by most modern browsers to read a arraybuffer.)
	   * @param  {object} options config options
	   *   - method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH'
	   *   - headers {obj}
	   *   - url {string}
	   *   - mode {string} 'cors' | 'no-cors' | 'same-origin' | 'navigate'
	   *   - body
	   *   - type {string} 'json' | 'jsonp' | 'text'
	   * @param  {string} callbackId
	   * @param  {string} progressCallbackId
	   */
	  fetch: function (options, callbackId, progressCallbackId) {
	    const DEFAULT_METHOD = 'GET';
	    const DEFAULT_MODE = 'cors';
	    const DEFAULT_TYPE = 'text';
	
	    const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH'];
	    const modeOptions = ['cors', 'no-cors', 'same-origin', 'navigate'];
	    const typeOptions = ['text', 'json', 'jsonp', 'arraybuffer'];
	
	    // const fallback = false  // fallback from 'fetch' API to XHR.
	    const sender = this.sender;
	
	    const config = utils.extend({}, options);
	
	    // validate options.method
	    if (typeof config.method === 'undefined') {
	      config.method = DEFAULT_METHOD;
	      logger.warn('options.method for \'fetch\' API has been set to ' + 'default value \'' + config.method + '\'');
	    } else if (methodOptions.indexOf((config.method + '').toUpperCase()) === -1) {
	      return logger.error('options.method \'' + config.method + '\' for \'fetch\' API should be one of ' + methodOptions + '.');
	    }
	
	    // validate options.url
	    if (!config.url) {
	      return logger.error('options.url should be set for \'fetch\' API.');
	    }
	
	    // validate options.mode
	    if (typeof config.mode === 'undefined') {
	      config.mode = DEFAULT_MODE;
	    } else if (modeOptions.indexOf((config.mode + '').toLowerCase()) === -1) {
	      return logger.error('options.mode \'' + config.mode + '\' for \'fetch\' API should be one of ' + modeOptions + '.');
	    }
	
	    // validate options.type
	    if (typeof config.type === 'undefined') {
	      config.type = DEFAULT_TYPE;
	      logger.warn('options.type for \'fetch\' API has been set to ' + 'default value \'' + config.type + '\'.');
	    } else if (typeOptions.indexOf((config.type + '').toLowerCase()) === -1) {
	      return logger.error('options.type \'' + config.type + '\' for \'fetch\' API should be one of ' + typeOptions + '.');
	    }
	
	    // validate options.headers
	    config.headers = config.headers || {};
	    if (!utils.isPlainObject(config.headers)) {
	      return logger.error('options.headers should be a plain object');
	    }
	
	    // validate options.body
	    const body = config.body;
	    if (!config.headers['Content-Type'] && body) {
	      if (utils.isPlainObject(body)) {
	        // is a json data
	        try {
	          config.body = JSON.stringify(body);
	          config.headers['Content-Type'] = TYPE_JSON;
	        } catch (e) {}
	      } else if (utils.getType(body) === 'string' && body.match(REG_FORM)) {
	        // is form-data
	        config.body = encodeURI(body);
	        config.headers['Content-Type'] = TYPE_FORM;
	      }
	    }
	
	    // validate options.timeout
	    config.timeout = parseInt(config.timeout, 10) || 2500;
	
	    const _callArgs = [config, function (res) {
	      sender.performCallback(callbackId, res);
	    }];
	    if (progressCallbackId) {
	      _callArgs.push(function (res) {
	        // Set 'keepAlive' to true for sending continuous callbacks
	        sender.performCallback(progressCallbackId, res, true);
	      });
	    }
	
	    if (config.type === 'jsonp') {
	      _jsonp.apply(this, _callArgs);
	    } else {
	      _xhr.apply(this, _callArgs);
	    }
	  }
	
	};
	
	stream._meta = {
	  stream: [{
	    name: 'sendHttp',
	    args: ['object', 'function']
	  }, {
	    name: 'fetch',
	    args: ['object', 'function', 'function']
	  }]
	};
	
	module.exports = stream;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 97 */
/***/ function(module, exports) {

	typeof window === 'undefined' && (window = { ctrl: {}, lib: {} });!window.ctrl && (window.ctrl = {});!window.lib && (window.lib = {});!function (a, b) {
	  function c(a) {
	    var b = {};Object.defineProperty(this, "params", { set: function (a) {
	        if ("object" == typeof a) {
	          for (var c in b) delete b[c];for (var c in a) b[c] = a[c];
	        }
	      }, get: function () {
	        return b;
	      }, enumerable: !0 }), Object.defineProperty(this, "search", { set: function (a) {
	        if ("string" == typeof a) {
	          0 === a.indexOf("?") && (a = a.substr(1));var c = a.split("&");for (var d in b) delete b[d];for (var e = 0; e < c.length; e++) {
	            var f = c[e].split("=");if (void 0 !== f[1] && (f[1] = f[1].toString()), f[0]) try {
	              b[decodeURIComponent(f[0])] = decodeURIComponent(f[1]);
	            } catch (g) {
	              b[f[0]] = f[1];
	            }
	          }
	        }
	      }, get: function () {
	        var a = [];for (var c in b) if (void 0 !== b[c]) if ("" !== b[c]) try {
	          a.push(encodeURIComponent(c) + "=" + encodeURIComponent(b[c]));
	        } catch (d) {
	          a.push(c + "=" + b[c]);
	        } else try {
	          a.push(encodeURIComponent(c));
	        } catch (d) {
	          a.push(c);
	        }return a.length ? "?" + a.join("&") : "";
	      }, enumerable: !0 });var c;Object.defineProperty(this, "hash", { set: function (a) {
	        "string" == typeof a && (a && a.indexOf("#") < 0 && (a = "#" + a), c = a || "");
	      }, get: function () {
	        return c;
	      }, enumerable: !0 }), this.set = function (a) {
	      a = a || "";var b;if (!(b = a.match(new RegExp("^([a-z0-9-]+:)?[/]{2}(?:([^@/:?]+)(?::([^@/:]+))?@)?([^:/?#]+)(?:[:]([0-9]+))?([/][^?#;]*)?(?:[?]([^#]*))?([#][^?]*)?$", "i")))) throw new Error("Wrong uri scheme.");this.protocol = b[1] || ("object" == typeof location ? location.protocol : ""), this.username = b[2] || "", this.password = b[3] || "", this.hostname = this.host = b[4], this.port = b[5] || "", this.pathname = b[6] || "/", this.search = b[7] || "", this.hash = b[8] || "", this.origin = this.protocol + "//" + this.hostname;
	    }, this.toString = function () {
	      var a = this.protocol + "//";return this.username && (a += this.username, this.password && (a += ":" + this.password), a += "@"), a += this.host, this.port && "80" !== this.port && (a += ":" + this.port), this.pathname && (a += this.pathname), this.search && (a += this.search), this.hash && (a += this.hash), a;
	    }, a && this.set(a.toString());
	  }b.httpurl = function (a) {
	    return new c(a);
	  };
	}(window, window.lib || (window.lib = {}));;module.exports = window.lib['httpurl'];

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const modal = __webpack_require__(99);
	
	const msg = {
	
	  // duration: default is 0.8 seconds.
	  toast: function (config) {
	    modal.toast(config.message, config.duration);
	  },
	
	  // config:
	  //  - message: string
	  //  - okTitle: title of ok button
	  //  - callback
	  alert: function (config, callbackId) {
	    const sender = this.sender;
	    config.callback = function () {
	      sender.performCallback(callbackId);
	    };
	    modal.alert(config);
	  },
	
	  // config:
	  //  - message: string
	  //  - okTitle: title of ok button
	  //  - cancelTitle: title of cancel button
	  //  - callback
	  confirm: function (config, callbackId) {
	    const sender = this.sender;
	    config.callback = function (val) {
	      sender.performCallback(callbackId, val);
	    };
	    modal.confirm(config);
	  },
	
	  // config:
	  //  - message: string
	  //  - okTitle: title of ok button
	  //  - cancelTitle: title of cancel button
	  //  - callback
	  prompt: function (config, callbackId) {
	    const sender = this.sender;
	    config.callback = function (val) {
	      sender.performCallback(callbackId, val);
	    };
	    modal.prompt(config);
	  }
	
	};
	
	msg._meta = {
	  modal: [{
	    name: 'toast',
	    args: ['object']
	  }, {
	    name: 'alert',
	    args: ['object', 'string']
	  }, {
	    name: 'confirm',
	    args: ['object', 'string']
	  }, {
	    name: 'prompt',
	    args: ['object', 'string']
	  }]
	};
	
	module.exports = msg;

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Alert = __webpack_require__(100);
	var Confirm = __webpack_require__(106);
	var Prompt = __webpack_require__(109);
	var toast = __webpack_require__(112);
	
	var modal = {
	
	  toast: function (msg, duration) {
	    toast.push(msg, duration);
	  },
	
	  alert: function (config) {
	    new Alert(config).show();
	  },
	
	  prompt: function (config) {
	    new Prompt(config).show();
	  },
	
	  confirm: function (config) {
	    new Confirm(config).show();
	  }
	
	};
	
	!window.lib && (window.lib = {});
	window.lib.modal = modal;
	
	module.exports = modal;

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Modal = __webpack_require__(101);
	__webpack_require__(104);
	
	var CONTENT_CLASS = 'content';
	var MSG_CLASS = 'content-msg';
	var BUTTON_GROUP_CLASS = 'btn-group';
	var BUTTON_CLASS = 'btn';
	
	function Alert(config) {
	  this.msg = config.message || '';
	  this.callback = config.callback;
	  this.okTitle = config.okTitle || 'OK';
	  Modal.call(this);
	  this.node.classList.add('amfe-alert');
	}
	
	Alert.prototype = Object.create(Modal.prototype);
	
	Alert.prototype.createNodeContent = function () {
	  var content = document.createElement('div');
	  content.classList.add(CONTENT_CLASS);
	  this.node.appendChild(content);
	
	  var msg = document.createElement('div');
	  msg.classList.add(MSG_CLASS);
	  msg.appendChild(document.createTextNode(this.msg));
	  content.appendChild(msg);
	
	  var buttonGroup = document.createElement('div');
	  buttonGroup.classList.add(BUTTON_GROUP_CLASS);
	  this.node.appendChild(buttonGroup);
	  var button = document.createElement('div');
	  button.classList.add(BUTTON_CLASS, 'alert-ok');
	  button.appendChild(document.createTextNode(this.okTitle));
	  buttonGroup.appendChild(button);
	};
	
	Alert.prototype.bindEvents = function () {
	  Modal.prototype.bindEvents.call(this);
	  var button = this.node.querySelector('.' + BUTTON_CLASS);
	  button.addEventListener('click', function () {
	    this.destroy();
	    this.callback && this.callback();
	  }.bind(this));
	};
	
	module.exports = Alert;

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(102);
	
	// there will be only one instance of modal.
	var MODAL_WRAP_CLASS = 'amfe-modal-wrap';
	var MODAL_NODE_CLASS = 'amfe-modal-node';
	
	function Modal() {
	  this.wrap = document.querySelector(MODAL_WRAP_CLASS);
	  this.node = document.querySelector(MODAL_NODE_CLASS);
	  if (!this.wrap) {
	    this.createWrap();
	  }
	  if (!this.node) {
	    this.createNode();
	  }
	  this.clearNode();
	  this.createNodeContent();
	  this.bindEvents();
	}
	
	Modal.prototype = {
	
	  show: function () {
	    this.wrap.style.display = 'block';
	    this.node.classList.remove('hide');
	  },
	
	  destroy: function () {
	    document.body.removeChild(this.wrap);
	    document.body.removeChild(this.node);
	    this.wrap = null;
	    this.node = null;
	  },
	
	  createWrap: function () {
	    this.wrap = document.createElement('div');
	    this.wrap.className = MODAL_WRAP_CLASS;
	    document.body.appendChild(this.wrap);
	  },
	
	  createNode: function () {
	    this.node = document.createElement('div');
	    this.node.classList.add(MODAL_NODE_CLASS, 'hide');
	    document.body.appendChild(this.node);
	  },
	
	  clearNode: function () {
	    this.node.innerHTML = '';
	  },
	
	  createNodeContent: function () {
	
	    // do nothing.
	    // child classes can override this method.
	  },
	
	  bindEvents: function () {
	    this.wrap.addEventListener('click', function (e) {
	      e.preventDefault();
	      e.stopPropagation();
	    });
	  }
	};
	
	module.exports = Modal;

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(103);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./modal.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./modal.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".amfe-modal-wrap {\n  display: none;\n  position: fixed;\n  z-index: 999999999;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background-color: #000;\n  opacity: 0.5;\n}\n\n.amfe-modal-node {\n  position: fixed;\n  z-index: 9999999999;\n  top: 50%;\n  left: 50%;\n  width: 6.666667rem;\n  min-height: 2.666667rem;\n  border-radius: 0.066667rem;\n  -webkit-transform: translate(-50%, -50%);\n  transform: translate(-50%, -50%);\n  background-color: #fff;\n}\n.amfe-modal-node.hide {\n  display: none;\n}\n.amfe-modal-node .content {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-flex-direction: column;\n  flex-direction: column;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  align-items: center;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 1.866667rem;\n  box-sizing: border-box;\n  font-size: 0.32rem;\n  line-height: 0.426667rem;\n  padding: 0.213333rem;\n  border-bottom: 1px solid #ddd;\n}\n.amfe-modal-node .btn-group {\n  width: 100%;\n  height: 0.8rem;\n  font-size: 0.373333rem;\n  text-align: center;\n  margin: 0;\n  padding: 0;\n  border: none;\n}\n.amfe-modal-node .btn-group .btn {\n  box-sizing: border-box;\n  height: 0.8rem;\n  line-height: 0.8rem;\n  margin: 0;\n  padding: 0;\n  border: none;\n  background: none;\n}\n", ""]);
	
	// exports


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(105);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./alert.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./alert.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".amfe-alert .amfe-alert-ok {\n  width: 100%;\n}\n", ""]);
	
	// exports


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Modal = __webpack_require__(101);
	__webpack_require__(107);
	
	var CONTENT_CLASS = 'content';
	var MSG_CLASS = 'content-msg';
	var BUTTON_GROUP_CLASS = 'btn-group';
	var BUTTON_CLASS = 'btn';
	
	function Confirm(config) {
	  this.msg = config.message || '';
	  this.callback = config.callback;
	  this.okTitle = config.okTitle || 'OK';
	  this.cancelTitle = config.cancelTitle || 'Cancel';
	  Modal.call(this);
	  this.node.classList.add('amfe-confirm');
	}
	
	Confirm.prototype = Object.create(Modal.prototype);
	
	Confirm.prototype.createNodeContent = function () {
	  var content = document.createElement('div');
	  content.classList.add(CONTENT_CLASS);
	  this.node.appendChild(content);
	
	  var msg = document.createElement('div');
	  msg.classList.add(MSG_CLASS);
	  msg.appendChild(document.createTextNode(this.msg));
	  content.appendChild(msg);
	
	  var buttonGroup = document.createElement('div');
	  buttonGroup.classList.add(BUTTON_GROUP_CLASS);
	  this.node.appendChild(buttonGroup);
	  var btnOk = document.createElement('div');
	  btnOk.appendChild(document.createTextNode(this.okTitle));
	  btnOk.classList.add('btn-ok', BUTTON_CLASS);
	  var btnCancel = document.createElement('div');
	  btnCancel.appendChild(document.createTextNode(this.cancelTitle));
	  btnCancel.classList.add('btn-cancel', BUTTON_CLASS);
	  buttonGroup.appendChild(btnOk);
	  buttonGroup.appendChild(btnCancel);
	  this.node.appendChild(buttonGroup);
	};
	
	Confirm.prototype.bindEvents = function () {
	  Modal.prototype.bindEvents.call(this);
	  var btnOk = this.node.querySelector('.' + BUTTON_CLASS + '.btn-ok');
	  var btnCancel = this.node.querySelector('.' + BUTTON_CLASS + '.btn-cancel');
	  btnOk.addEventListener('click', function () {
	    this.destroy();
	    this.callback && this.callback(this.okTitle);
	  }.bind(this));
	  btnCancel.addEventListener('click', function () {
	    this.destroy();
	    this.callback && this.callback(this.cancelTitle);
	  }.bind(this));
	};
	
	module.exports = Confirm;

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(108);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./confirm.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./confirm.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".amfe-confirm .btn-group .btn {\n  float: left;\n  width: 50%;\n}\n.amfe-confirm .btn-group .btn.btn-ok {\n  border-right: 1px solid #ddd;\n}\n", ""]);
	
	// exports


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Modal = __webpack_require__(101);
	__webpack_require__(110);
	
	var CONTENT_CLASS = 'content';
	var MSG_CLASS = 'content-msg';
	var BUTTON_GROUP_CLASS = 'btn-group';
	var BUTTON_CLASS = 'btn';
	var INPUT_WRAP_CLASS = 'input-wrap';
	var INPUT_CLASS = 'input';
	
	function Prompt(config) {
	  this.msg = config.message || '';
	  this.defaultMsg = config.default || '';
	  this.callback = config.callback;
	  this.okTitle = config.okTitle || 'OK';
	  this.cancelTitle = config.cancelTitle || 'Cancel';
	  Modal.call(this);
	  this.node.classList.add('amfe-prompt');
	}
	
	Prompt.prototype = Object.create(Modal.prototype);
	
	Prompt.prototype.createNodeContent = function () {
	
	  var content = document.createElement('div');
	  content.classList.add(CONTENT_CLASS);
	  this.node.appendChild(content);
	
	  var msg = document.createElement('div');
	  msg.classList.add(MSG_CLASS);
	  msg.appendChild(document.createTextNode(this.msg));
	  content.appendChild(msg);
	
	  var inputWrap = document.createElement('div');
	  inputWrap.classList.add(INPUT_WRAP_CLASS);
	  content.appendChild(inputWrap);
	  var input = document.createElement('input');
	  input.classList.add(INPUT_CLASS);
	  input.type = 'text';
	  input.autofocus = true;
	  input.placeholder = this.defaultMsg;
	  inputWrap.appendChild(input);
	
	  var buttonGroup = document.createElement('div');
	  buttonGroup.classList.add(BUTTON_GROUP_CLASS);
	  var btnOk = document.createElement('div');
	  btnOk.appendChild(document.createTextNode(this.okTitle));
	  btnOk.classList.add('btn-ok', BUTTON_CLASS);
	  var btnCancel = document.createElement('div');
	  btnCancel.appendChild(document.createTextNode(this.cancelTitle));
	  btnCancel.classList.add('btn-cancel', BUTTON_CLASS);
	  buttonGroup.appendChild(btnOk);
	  buttonGroup.appendChild(btnCancel);
	  this.node.appendChild(buttonGroup);
	};
	
	Prompt.prototype.bindEvents = function () {
	  Modal.prototype.bindEvents.call(this);
	  var btnOk = this.node.querySelector('.' + BUTTON_CLASS + '.btn-ok');
	  var btnCancel = this.node.querySelector('.' + BUTTON_CLASS + '.btn-cancel');
	  var that = this;
	  btnOk.addEventListener('click', function () {
	    var val = document.querySelector('input').value;
	    this.destroy();
	    this.callback && this.callback({
	      result: that.okTitle,
	      data: val
	    });
	  }.bind(this));
	  btnCancel.addEventListener('click', function () {
	    var val = document.querySelector('input').value;
	    this.destroy();
	    this.callback && this.callback({
	      result: that.cancelTitle,
	      data: val
	    });
	  }.bind(this));
	};
	
	module.exports = Prompt;

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(111);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./prompt.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./prompt.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".amfe-prompt .input-wrap {\n  box-sizing: border-box;\n  width: 100%;\n  margin-top: 0.133333rem;\n  // padding: 0.24rem 0.213333rem 0.213333rem;\n  height: 0.96rem;\n}\n.amfe-prompt .input-wrap .input {\n  box-sizing: border-box;\n  width: 100%;\n  height: 0.56rem;\n  line-height: 0.56rem;\n  font-size: 0.32rem;\n  border: 1px solid #999;\n}\n.amfe-prompt .btn-group .btn {\n  float: left;\n  width: 50%;\n}\n.amfe-prompt .btn-group .btn.btn-ok {\n  border-right: 1px solid #ddd;\n}\n", ""]);
	
	// exports


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(113);
	
	var queue = [];
	var timer;
	var isProcessing = false;
	var toastWin;
	var TOAST_WIN_CLASS_NAME = 'amfe-toast';
	
	var DEFAULT_DURATION = 0.8;
	
	function showToastWindow(msg, callback) {
	  var handleTransitionEnd = function () {
	    toastWin.removeEventListener('transitionend', handleTransitionEnd);
	    callback && callback();
	  };
	  if (!toastWin) {
	    toastWin = document.createElement('div');
	    toastWin.classList.add(TOAST_WIN_CLASS_NAME, 'hide');
	    document.body.appendChild(toastWin);
	  }
	  toastWin.innerHTML = msg;
	  toastWin.addEventListener('transitionend', handleTransitionEnd);
	  setTimeout(function () {
	    toastWin.classList.remove('hide');
	  }, 0);
	}
	
	function hideToastWindow(callback) {
	  var handleTransitionEnd = function () {
	    toastWin.removeEventListener('transitionend', handleTransitionEnd);
	    callback && callback();
	  };
	  if (!toastWin) {
	    return;
	  }
	  toastWin.addEventListener('transitionend', handleTransitionEnd);
	  toastWin.classList.add('hide');
	}
	
	var toast = {
	
	  push: function (msg, duration) {
	    queue.push({
	      msg: msg,
	      duration: duration || DEFAULT_DURATION
	    });
	    this.show();
	  },
	
	  show: function () {
	    var that = this;
	
	    // All messages had been toasted already, so remove the toast window,
	    if (!queue.length) {
	      toastWin && toastWin.parentNode.removeChild(toastWin);
	      toastWin = null;
	      return;
	    }
	
	    // the previous toast is not ended yet.
	    if (isProcessing) {
	      return;
	    }
	    isProcessing = true;
	
	    var toastInfo = queue.shift();
	    showToastWindow(toastInfo.msg, function () {
	      timer = setTimeout(function () {
	        timer = null;
	        hideToastWindow(function () {
	          isProcessing = false;
	          that.show();
	        });
	      }, toastInfo.duration * 1000);
	    });
	  }
	
	};
	
	module.exports = {
	  push: toast.push.bind(toast)
	};

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(114);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./toast.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./toast.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".amfe-toast {\n  font-size: 0.32rem;\n  line-height: 0.426667rem;\n  position: fixed;\n  box-sizing: border-box;\n  max-width: 80%;\n  bottom: 2.666667rem;\n  left: 50%;\n  padding: 0.213333rem;\n  background-color: #000;\n  color: #fff;\n  text-align: center;\n  opacity: 0.6;\n  transition: all 0.4s ease-in-out;\n  border-radius: 0.066667rem;\n  -webkit-transform: translateX(-50%);\n  transform: translateX(-50%);\n}\n\n.amfe-toast.hide {\n  opacity: 0;\n}\n", ""]);
	
	// exports


/***/ },
/* 115 */
/***/ function(module, exports) {

	'use strict';
	
	const _data = {};
	
	const animation = {
	
	  /**
	   * transition
	   * @param  {string} ref        [description]
	   * @param  {obj} config     [description]
	   * @param  {string} callbackId [description]
	   */
	  transition: function (ref, config, callbackId) {
	    let refData = _data[ref];
	    const stylesKey = JSON.stringify(config.styles);
	    const weexInstance = this;
	    // If the same component perform a animation with exactly the same
	    // styles in a sequence with so short interval that the prev animation
	    // is still in playing, then the next animation should be ignored.
	    if (refData && refData[stylesKey]) {
	      return;
	    }
	    if (!refData) {
	      refData = _data[ref] = {};
	    }
	    refData[stylesKey] = true;
	    return this.getComponentManager().transition(ref, config, function () {
	      // Remove the stylesKey in refData so that the same animation
	      // can be played again after current animation is already finished.
	      delete refData[stylesKey];
	      weexInstance.sender.performCallback(callbackId);
	    });
	  }
	
	};
	
	animation._meta = {
	  animation: [{
	    name: 'transition',
	    args: ['string', 'object', 'string']
	  }]
	};
	
	module.exports = animation;

/***/ },
/* 116 */
/***/ function(module, exports) {

	'use strict';
	
	const webview = {
	
	  // ref: ref of the web component.
	  goBack: function (ref) {
	    const webComp = this.getComponentManager().getElementByRef(ref);
	    if (!webComp.goBack) {
	      console.error('error: the specified component has no method of' + ' goBack. Please make sure it is a webview component.');
	      return;
	    }
	    webComp.goBack();
	  },
	
	  // ref: ref of the web component.
	  goForward: function (ref) {
	    const webComp = this.getComponentManager().getElementByRef(ref);
	    if (!webComp.goForward) {
	      console.error('error: the specified component has no method of' + ' goForward. Please make sure it is a webview component.');
	      return;
	    }
	    webComp.goForward();
	  },
	
	  // ref: ref of the web component.
	  reload: function (ref) {
	    const webComp = this.getComponentManager().getElementByRef(ref);
	    if (!webComp.reload) {
	      console.error('error: the specified component has no method of' + ' reload. Please make sure it is a webview component.');
	      return;
	    }
	    webComp.reload();
	  }
	
	};
	
	webview._meta = {
	  webview: [{
	    name: 'goBack',
	    args: ['string']
	  }, {
	    name: 'goForward',
	    args: ['string']
	  }, {
	    name: 'reload',
	    args: ['string']
	  }]
	};
	
	module.exports = webview;

/***/ },
/* 117 */
/***/ function(module, exports) {

	'use strict';
	
	const funcIdToTimerIdMap = {};
	const funcIdToIntervalIdMap = {};
	
	const timer = {
	
	  setTimeout(funcId, delay) {
	    const sender = this.sender;
	    delay < 0 && (delay = 0);
	    const timerId = setTimeout(function () {
	      delete funcIdToTimerIdMap[funcId];
	      sender.performCallback(funcId);
	    }, delay);
	    funcIdToTimerIdMap[funcId] = timerId;
	    return funcId;
	  },
	
	  clearTimeout(funcId) {
	    clearTimeout(funcIdToTimerIdMap[funcId]);
	    delete funcIdToTimerIdMap[funcId];
	  },
	
	  setInterval(funcId, interval) {
	    const sender = this.sender;
	    interval < 0 && (interval = 0);
	    const timerId = setInterval(function () {
	      delete funcIdToIntervalIdMap[funcId];
	      sender.performCallback(funcId, null, true);
	    });
	    funcIdToIntervalIdMap[funcId] = timerId;
	    return funcId;
	  },
	
	  clearInterval(funcId) {
	    clearInterval(funcIdToIntervalIdMap[funcId]);
	    delete funcIdToIntervalIdMap[funcId];
	  }
	
	};
	
	timer._meta = {
	  timer: [{
	    name: 'setTimeout',
	    args: ['function', 'number']
	  }, {
	    name: 'clearTimeout',
	    args: ['number']
	  }, {
	    name: 'setInterval',
	    args: ['function', 'number']
	  }, {
	    name: 'clearInterval',
	    args: ['number']
	  }]
	};
	
	module.exports = timer;

/***/ },
/* 118 */
/***/ function(module, exports) {

	'use strict';
	
	const navigator = {
	
	  // config
	  //  - url: the url to push
	  //  - animated: this configuration item is native only
	  //  callback is not currently supported
	  push: function (config, callbackId) {
	    window.location.href = config.url;
	    this.sender.performCallback(callbackId);
	  },
	
	  // config
	  //  - animated: this configuration item is native only
	  //  callback is note currently supported
	  pop: function (config, callbackId) {
	    window.history.back();
	    this.sender.performCallback(callbackId);
	  }
	
	};
	
	navigator._meta = {
	  navigator: [{
	    name: 'push',
	    args: ['object', 'function']
	  }, {
	    name: 'pop',
	    args: ['object', 'function']
	  }]
	};
	
	module.exports = navigator;

/***/ },
/* 119 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	
	AUCTION:
	taskQueue
	Clipboard.setString()  NOW not works, facing to user-act lose of taskQueue.
	
	works in Chrome Firefox Opera. but not in Safari.
	@see https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand#Browser_compatibility
	
	Clipboard.getString() unimplemented. There is no easy way to do paste from clipboard to js variable.
	
	So look out your app behavior, when downgrade to html5 render.
	Any idea is welcome.
	**/
	
	const WEEX_CLIPBOARD_ID = '__weex_clipboard_id__';
	
	const clipboard = {
	
	  getString: function (callbackId) {
	    // not supported in html5
	    console.log('clipboard.getString() is not supported now.');
	  },
	
	  setString: function (text) {
	    // not support safari
	    if (typeof text === 'string' && text !== '' && document.execCommand) {
	      const tempInput = element();
	      tempInput.value = text;
	
	      tempInput.select();
	      document.execCommand('copy');
	      // var out = document.execCommand('copy');
	      // console.log("execCommand out is " + out);
	      tempInput.value = '';
	      tempInput.blur();
	    } else {
	      console.log('only support string input now');
	    }
	  }
	
	};
	
	function element() {
	  let tempInput = document.getElementById(WEEX_CLIPBOARD_ID);
	  if (tempInput === undefined) {
	    tempInput = document.createElement('input');
	    tempInput.setAttribute('id', WEEX_CLIPBOARD_ID);
	    tempInput.style.cssText = 'height:1px;width:1px;border:none;';
	    // tempInput.style.cssText = "height:40px;width:300px;border:solid;"
	    document.body.appendChild(tempInput);
	  }
	  return tempInput;
	}
	
	clipboard._meta = {
	  clipboard: [{
	    name: 'getString',
	    args: ['function']
	  }, {
	    name: 'setString',
	    args: ['string']
	  }]
	};
	
	module.exports = clipboard;

/***/ },
/* 120 */
/***/ function(module, exports) {

	typeof window === 'undefined' && (window = { ctrl: {}, lib: {} });!window.ctrl && (window.ctrl = {});!window.lib && (window.lib = {});!function (a, b) {
	  function c(a) {
	    Object.defineProperty(this, "val", { value: a.toString(), enumerable: !0 }), this.gt = function (a) {
	      return c.compare(this, a) > 0;
	    }, this.gte = function (a) {
	      return c.compare(this, a) >= 0;
	    }, this.lt = function (a) {
	      return c.compare(this, a) < 0;
	    }, this.lte = function (a) {
	      return c.compare(this, a) <= 0;
	    }, this.eq = function (a) {
	      return 0 === c.compare(this, a);
	    };
	  }b.env = b.env || {}, c.prototype.toString = function () {
	    return this.val;
	  }, c.prototype.valueOf = function () {
	    for (var a = this.val.split("."), b = [], c = 0; c < a.length; c++) {
	      var d = parseInt(a[c], 10);isNaN(d) && (d = 0);var e = d.toString();e.length < 5 && (e = Array(6 - e.length).join("0") + e), b.push(e), 1 === b.length && b.push(".");
	    }return parseFloat(b.join(""));
	  }, c.compare = function (a, b) {
	    a = a.toString().split("."), b = b.toString().split(".");for (var c = 0; c < a.length || c < b.length; c++) {
	      var d = parseInt(a[c], 10),
	          e = parseInt(b[c], 10);if (window.isNaN(d) && (d = 0), window.isNaN(e) && (e = 0), e > d) return -1;if (d > e) return 1;
	    }return 0;
	  }, b.version = function (a) {
	    return new c(a);
	  };
	}(window, window.lib || (window.lib = {})), function (a, b) {
	  b.env = b.env || {};var c = a.location.search.replace(/^\?/, "");if (b.env.params = {}, c) for (var d = c.split("&"), e = 0; e < d.length; e++) {
	    d[e] = d[e].split("=");try {
	      b.env.params[d[e][0]] = decodeURIComponent(d[e][1]);
	    } catch (f) {
	      b.env.params[d[e][0]] = d[e][1];
	    }
	  }
	}(window, window.lib || (window.lib = {})), function (a, b) {
	  b.env = b.env || {};var c,
	      d = a.navigator.userAgent;if (c = d.match(/Windows\sPhone\s(?:OS\s)?([\d\.]+)/)) b.env.os = { name: "Windows Phone", isWindowsPhone: !0, version: c[1] };else if (d.match(/Safari/) && (c = d.match(/Android[\s\/]([\d\.]+)/))) b.env.os = { version: c[1] }, d.match(/Mobile\s+Safari/) ? (b.env.os.name = "Android", b.env.os.isAndroid = !0) : (b.env.os.name = "AndroidPad", b.env.os.isAndroidPad = !0);else if (c = d.match(/(iPhone|iPad|iPod)/)) {
	    var e = c[1];c = d.match(/OS ([\d_\.]+) like Mac OS X/), b.env.os = { name: e, isIPhone: "iPhone" === e || "iPod" === e, isIPad: "iPad" === e, isIOS: !0, version: c[1].split("_").join(".") };
	  } else b.env.os = { name: "unknown", version: "0.0.0" };b.version && (b.env.os.version = b.version(b.env.os.version));
	}(window, window.lib || (window.lib = {})), function (a, b) {
	  b.env = b.env || {};var c,
	      d = a.navigator.userAgent;(c = d.match(/(?:UCWEB|UCBrowser\/)([\d\.]+)/)) ? b.env.browser = { name: "UC", isUC: !0, version: c[1] } : (c = d.match(/MQQBrowser\/([\d\.]+)/)) ? b.env.browser = { name: "QQ", isQQ: !0, version: c[1] } : (c = d.match(/Firefox\/([\d\.]+)/)) ? b.env.browser = { name: "Firefox", isFirefox: !0, version: c[1] } : (c = d.match(/MSIE\s([\d\.]+)/)) || (c = d.match(/IEMobile\/([\d\.]+)/)) ? (b.env.browser = { version: c[1] }, d.match(/IEMobile/) ? (b.env.browser.name = "IEMobile", b.env.browser.isIEMobile = !0) : (b.env.browser.name = "IE", b.env.browser.isIE = !0), d.match(/Android|iPhone/) && (b.env.browser.isIELikeWebkit = !0)) : (c = d.match(/(?:Chrome|CriOS)\/([\d\.]+)/)) ? (b.env.browser = { name: "Chrome", isChrome: !0, version: c[1] }, d.match(/Version\/[\d+\.]+\s*Chrome/) && (b.env.browser.name = "Chrome Webview", b.env.browser.isWebview = !0)) : d.match(/Safari/) && (c = d.match(/Android[\s\/]([\d\.]+)/)) ? b.env.browser = { name: "Android", isAndroid: !0, version: c[1] } : d.match(/iPhone|iPad|iPod/) ? d.match(/Safari/) ? (c = d.match(/Version\/([\d\.]+)/), b.env.browser = { name: "Safari", isSafari: !0, version: c[1] }) : (c = d.match(/OS ([\d_\.]+) like Mac OS X/), b.env.browser = { name: "iOS Webview", isWebview: !0, version: c[1].replace(/\_/g, ".") }) : b.env.browser = { name: "unknown", version: "0.0.0" }, b.version && (b.env.browser.version = b.version(b.env.browser.version));
	}(window, window.lib || (window.lib = {})), function (a, b) {
	  b.env = b.env || {};var c = a.navigator.userAgent;c.match(/Weibo/i) ? b.env.thirdapp = { appname: "Weibo", isWeibo: !0 } : c.match(/MicroMessenger/i) ? b.env.thirdapp = { appname: "Weixin", isWeixin: !0 } : b.env.thirdapp = !1;
	}(window, window.lib || (window.lib = {})), function (a, b) {
	  b.env = b.env || {};var c,
	      d,
	      e = a.navigator.userAgent;(d = e.match(/WindVane[\/\s]([\d\.\_]+)/)) && (c = d[1]);var f = !1,
	      g = "",
	      h = "",
	      i = "";(d = e.match(/AliApp\(([A-Z\-]+)\/([\d\.]+)\)/i)) && (f = !0, g = d[1], i = d[2], h = g.indexOf("-PD") > 0 ? b.env.os.isIOS ? "iPad" : b.env.os.isAndroid ? "AndroidPad" : b.env.os.name : b.env.os.name), !g && e.indexOf("TBIOS") > 0 && (g = "TB"), f ? b.env.aliapp = { windvane: b.version(c || "0.0.0"), appname: g || "unkown", version: b.version(i || "0.0.0"), platform: h || b.env.os.name } : b.env.aliapp = !1, b.env.taobaoApp = b.env.aliapp;
	}(window, window.lib || (window.lib = {}));;module.exports = window.lib['env'];

/***/ }
/******/ ]);