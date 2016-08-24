/**
 * Created by walid on 16/7/30.
 * 官方通知UI controller
 */

var utils = require('util/utils')

var constants = require('util/constants')

var data = {
    icBackUrl: constants.imageUrl.BACK_BLACK,
    officalNotices: [],
    officalNotice1: {
        id: 10,
        iconUrl: utils.getBaseImageUrl() + 'ic_market_normal.png',
        messageContent: "三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操",
        date: "昨天",
    },
    officalNotice2: {
        id: 10,
        iconUrl: utils.getBaseImageUrl() + 'ic_market_normal.png',
        messageContent: "三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操三个月宝宝健身操",
        date: "2016.6.24",
    },
}

exports.vm = {
    data: data
}

exports.getOfficalNoticeData = function(self) {
    data.officalNotices = data.officalNotices.concat(data.officalNotice1)
    data.officalNotices = data.officalNotices.concat(data.officalNotice2)
}

exports.clearAllDatas = function() {
    data.officalNotices = []
}
