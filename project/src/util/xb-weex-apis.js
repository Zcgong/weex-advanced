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
