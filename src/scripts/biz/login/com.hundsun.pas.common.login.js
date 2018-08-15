/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 07/20/17  mengjq  新增
 * ========    =======  ============================================
*/
//请求cas参数
var casParams = '';

function getCasParams() {
    //TODO 判断验证码开启关闭
    $.ajax({
        url: '/Artemis/rest/uam/casParams',
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (data) {
            casParams = data.msg_result;
        }
    });
}

//密码加密
function reasParams(reasNo, password) {
    $.ajax({
        url: '/Artemis/rest/uam/rsaParams',
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (data) {
            var info = data.msg_result;
            //获取加密算法的系数和指数
            var modulus = info.modulus;
            var exponent = info.exponent;
            //是否加密
            var isEncrypted = info.encrypted;
            //获取加密公钥
            var publicKey = RSAUtils.getKeyPair(exponent, reasNo, modulus);
            if (isEncrypted == "true") {
                //判断传入进来的password的数据类型
                if (typeof(password) == "object") {
                    for (var key in password) {
                        password[key] = RSAUtils.encryptedString(publicKey, password[key]);
                    }
                } else {
                    password = RSAUtils.encryptedString(publicKey, password);
                }
            }
        }
    });
    return password;
};

// TODO case 单点登录
function _caseLogin() {
};

//登录按钮
export function submitLogin(successHandler) {

    //TODO 判断是否存在验证码功能
    var autoLogin = $.cookie('auto_login'), login_no, user_password;
    // auto_login为"0"时自动登录
    if (autoLogin === "0") {
        login_no = $.cookie('login_no');
        user_password = $.cookie("password");
        $.removeCookie("auto_login");
        $.removeCookie("password");
        $("#login-info").html("自动登录中...");
    } else {
        login_no = this.loginUserName;
        user_password = this.loginPassword;
        //用户名密码不能为空
        if ($.trim(login_no) == '') {
            $("#login-info").html('用户名不能为空');
            return;
        }
        if ($.trim(user_password) == '') {
            $("#login-info").html('密码不能为空');
            return;
        }
        $("#login-info").html('login...');
    }
    var reasPassword = reasParams('', user_password);
    getCasParams();
    //判断是否为case 单点登录
    if ('true' == casParams.casenabled) {
        _caseLogin();
        return;
    } else {
        $("#login-info").html('');
        $.ajax({
            url: '/Artemis/rest/uam/userlogin',
            type: "PUT",
            // 加这个参数才可以跨域时设置和携带cookie
            xhrFields: {withCredentials:true},
            data: {
                'login_no': login_no,
                'password': reasPassword
            },
            dataType: 'json',
            success: function (data) {
                //TODO 强密码验证 需要修改login_strongPsw.js
                if (data) {
                    if (data.msg_no == 10) {
                    } else if (data.msg_no == 0) {
                        if ($.isFunction(successHandler)) {
                            return successHandler();
                        }
                    } else {
                        $("#login-info").html(data.msg_info);
                    }
                }
            },
            error: function (data) {
                $("#login-info").html(data.msg_info);
            }
        });
    }
    return true;
};

//回车
export function keydown(event) {
    //回车
    if (event.which == 13) {
        $("#login-btn").click();
    }
};