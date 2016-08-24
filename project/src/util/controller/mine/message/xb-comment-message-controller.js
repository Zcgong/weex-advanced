/**
 * Created by walid on 16/7/30.
 * 官方通知UI controller
 */

var utils = require('util/utils')
var constants = require('util/constants')

var data = {
    icBackUrl: constants.imageUrl.BACK_BLACK,
    commentMessages: [],
    commentMessage1: {
        id: 10,
        nickName: 'walidwalidwalidwalidwalidwalidwalidwalid',
        iconUrl: utils.getBaseImageUrl() + 'ic_market_normal.png',
        messageContent: "三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操",
        date: "昨天",
    },
    commentMessage2: {
        id: 20,
        nickName: '王永迪王永迪王永迪王永迪王永迪王永迪',
        iconUrl: utils.getBaseImageUrl() + 'ic_market_normal.png',
        messageContent: "三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操",
        date: "2016.6.24",
    },
}

exports.vm = {
    data: data
}

exports.getCommentMessageDate = function() {
    data.commentMessages = data.commentMessages.concat(data.commentMessage1)
    data.commentMessages = data.commentMessages.concat(data.commentMessage2)
}

exports.clearAllDatas = function() {
    data.commentMessages = []
}
