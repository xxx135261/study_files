import * as types from './mutation-types';
import Base64 from './../scripts/core/util/com.hundsun.pas.common.base64';

export const setSelectGroup = ({commit}, payload) => {
    commit(types.SET_SELECT_GROUP, payload)
}

export const passScode = ({commit}, payload) => {
    commit(types.SET_SCODE, payload);
}

/*加载当前登录用户的信息*/
export const loadUserInfo = ({commit}) => {
    var uk = $.cookie('uk');
    if (!uk) {
        return;
    }
    $.ajax({
        url: "/Artemis/rest/uam/user/" + new Base64().decode(uk),
        type: "GET",
        async: false,
        dataType: "json",
        success: function (data) {
            if (!data || data.length == 0) {
                //清空cookie
                var cookies = $.cookie();
                for (var key in cookies) {
                    $.removeCookie(key, {path: '/'});
                }
            }
            if (data.length == 1) {
                var user = data[0];
                var userInfo = {
                    loginId: user.login_id,
                    userId: user.user_id,
                    loginName: user.login_name,
                    userName: ''
                };
                userInfo.loginName = user.login_name;
                userInfo.userName = userInfo.loginName;
                commit({
                    type: types.SET_USER_INFO,
                    userInfo: userInfo
                });
            }
        },
        error: function (data) {
            console.warn('请求用户信息失败');
        }
    });
}


