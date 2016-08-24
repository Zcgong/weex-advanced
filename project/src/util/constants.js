/**
 * Created by walid on 16/7/29.
 *  常量封装
 */

var datas = {
    baseImageUrl: 'http://xiaobaiossdevortest.oss-cn-beijing.aliyuncs.com/icon/',
}

// color
exports.color = {
    MAIN: '#ff6b43',
}

exports.spEnum = {
    TELEPHONE: 'TELEPHONE',
    AVATAR: 'AVATAR',
    NICK_NAME: 'NICK_NAME',
    BRIEF: 'BRIEF',
    OPEN_3G4G: 'OPEN_3G4G',
}

exports.imageUrl = {
    BACK_BLACK: datas.baseImageUrl + 'back_black.png',
    BACK_WDITE: datas.baseImageUrl + 'back_white.png',
    MINE_FAVORITE: datas.baseImageUrl + 'mine_favorite.png',
    IC_MINE_MESSAGE: datas.baseImageUrl + 'ic_mine_message.png',
    MINE_SETTING: datas.baseImageUrl + 'mine_setting.png',
    MINE_EDIT: datas.baseImageUrl + 'mine_edit.png',
    IC_RIGHT_ARROW: datas.baseImageUrl + 'ic_right_arrow.png',
    DEFAULT: datas.baseImageUrl + 'ic_market_normal.png',
    IC_MINE_PHOTO: datas.baseImageUrl + 'ic_mine_photo.png',
    IC_HER_VIDEO: datas.baseImageUrl + 'ic_her_video.png',
    IC_MESSAGE_LEFT_ARROW: datas.baseImageUrl + 'ic_message_left_arrow.png',
    IC_OFFICAL_MESSAGE: datas.baseImageUrl + 'ic_offical_message.png',
    IC_MESSAGE_COMMENT: datas.baseImageUrl + 'ic_message_comment.png',
    IC_MINE_NAVIGATION: datas.baseImageUrl + 'ic_mine_navigation.png',
    IC_MINE_BACKGROUND: datas.baseImageUrl + 'ic_mine_background.png',
}

exports.pageUrl = {
    SETTING_URL: 'mine/setting/xb-setting.js',
    SETTING_BINGPHONE: 'mine/setting/xb-setting-bindphone.js',
    OTHER_PERSON_PAGE: 'mine/xb-other-person-page.js',
    MINE_PAGE: 'mine/xb-minepage.js',
    MINE_MESSAGE: 'mine/message/xb-mine-message.js',
    MINE_TEST_PARAMS: 'mine/test-params.js',
    MINE_OFFICAL_MESSAGE: 'mine/message/xb-offical-message.js',
    MINE_COMMENT_MESSAGE: 'mine/message/xb-comment-message.js',
    ABOUTUS_URL: 'mine/setting/xb-about-us.js',
    SETTING_AGREEMENT: 'mine/setting/xb-agreement.js',
    SETTING_APP_INTRODUCE: 'mine/setting/xb-app-introduce.js',
    UPDATE_USERINFO: 'mine/xb-update-userinfo.js',
    SETTING_COLLECT: 'mine/xb-collect.js',
}
