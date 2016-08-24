/**
 * Created by walid on 16/6/13.
 *  封装utils工具类使用
 */

var strUtil = require('util/str-util')

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
