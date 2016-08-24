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
