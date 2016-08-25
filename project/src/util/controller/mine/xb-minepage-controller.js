/**
 * Created by walid on 16/7/30.
 * 个人中心 controller
 */

var utils = require('util/utils')
var constants = require('util/constants')

var data = {
    userInfo: {
        iconUrl: constants.imageUrl.DEFAULT,
        userName: "匿名康小白",
        brief: "您还未设置简介，让大家认识下你吧~"
    },
}

exports.getUserInfo = function() {
    return data.userInfo
}

exports.setUserInfo = function() {
    data.userInfo.userName = "dashabi"
}
