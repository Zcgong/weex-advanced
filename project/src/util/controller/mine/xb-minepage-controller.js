/**
 * Created by walid on 16/7/30.
 * 个人中心 controller
 */

var utils = require('util/utils')
var constants = require('util/constants')
var bridge = require('util/xb-bridge')

var data = {
    userInfo: {
        iconUrl: constants.imageUrl.DEFAULT,
        userName: "匿名康小白",
        brief: "您还未设置简介，让大家认识下你吧~"
    },
}

exports.getUserInfo = function() {
    bridge.getSP(constants.spEnum.AVATAR, function(ref) {
        data.userInfo.iconUrl = ref.data
    })
    bridge.getSP(constants.spEnum.NICK_NAME, function(ref) {
        data.userInfo.userName = ref.data
    })
    bridge.getSP(constants.spEnum.BRIEF, function(ref) {
        data.userInfo.brief = ref.data
    })
    return data.userInfo
}

exports.setUserInfo = function() {
    data.userInfo.userName = "dashabi"
}
