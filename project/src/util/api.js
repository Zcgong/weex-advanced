/**
 * Created by walid on 16/6/13.
 * params : {method:POST/GET,url:http://xxx,header:{key:value},
 *                 body:{key:value}}
 */

var stream
__weex_define__('@weex-temp/x', function(__weex_require__) {
    stream = __weex_require__('@weex-module/stream')
})

var modal
__weex_define__('@weex-temp/x', function(__weex_require__) {
    modal = __weex_require__('@weex-module/modal')
})

var apiURL = {
    baseXbUrl: 'http://api.hailedao.com',
}

function requestGet(url, callback) {
    requestGetWithBody(url, null, callback);
}

function requestGetWithBody(url, body, callback) {

    stream.fetch({
        method: 'GET',
        url: apiURL.baseXbUrl + url,
        type: 'json',
        body: body
    }, function(ret) {
        var resultObj = ret;
        nativeLog('resultObj  = ' + ret);
        if (typeof resultObj == 'string') {
            resultObj = JSON.parse(resultObj);
        }
        var serverResultData = resultObj.data;
        if (typeof serverResultData == 'string') {
            serverResultData = JSON.parse(serverResultData);
        }
        nativeLog('serverResultData  = ' + serverResultData);
        callback(serverResultData);
    }, function(progress) {
        nativeLog('get in progress:' + progress.length);
    })

    // stream.sendHttp({
    //     method: 'GET',
    //     url: apiURL.baseXbUrl + url,
    //     type:'json',
    //     body: body
    // }, function(ret) {
    //     nativeLog('retdata  = ' + ret);
    //     var resultData = JSON.parse(ret);
    //     callback(resultData);
    // });
}

function requestPost(url, callback) {
    requestPostWithBody(url, null, callback);
}

function requestPostWithBody(url, body, callback) {

    stream.fetch({
        method: 'POST',
        url: apiURL.baseXbUrl + url,
        type: 'json',
        body: body
    }, function(ret) {
        var resultObj = ret;
        nativeLog('resultObj  = ' + ret);
        if (typeof resultObj == 'string') {
            resultObj = JSON.parse(resultObj);
        }
        var serverResultData = resultObj.data;
        if (typeof serverResultData == 'string') {
            serverResultData = JSON.parse(serverResultData);
        }
        nativeLog('serverResultData  = ' + serverResultData);
        callback(serverResultData);
    }, function(progress) {
        nativeLog('get in progress:' + progress.length);
    })

    // stream.sendHttp({
    //     method: 'POST',
    //     url: apiURL.baseXbUrl + url,
    //     type: 'json',
    //     body: body
    // }, function(ret) {
    //     if (typeof ret === 'string') {
    //         ret = JSON.parse(ret);
    //     }
    //     var resultData = JSON.parse(ret);
    //     callback(resultData);
    // });
}

exports.requestGet = requestGet
exports.requestGetWithBody = requestGetWithBody
exports.requestPost = requestPost
exports.requestPostWithBody = requestPostWithBody
