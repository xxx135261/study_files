import {RSAUtils} from './../../../scripts/core/securitiy/com.hundsun.common.security.js';
(function ($) {
    $.extend({
        frameCheckTimer: function () {
            let _self = this;
            this.onLoad = function (loginOut) {
                //获取页面锁定时间
                this._setLockTime();
                //页面事件触发，更新最后操作时间
                this._documentEvent();
                //创建定时器
                this._checkTimer();
                //重新登录框相关事件绑定
                this._connectDomEvent(loginOut);
            };
            //设置屏锁时间
            this._setLockTime = function () {
                $.ajax({
                    url: "/Artemis/rest/uam/timeoutParam",
                    type: "GET",
                    data: {
                        action: "logout"
                    },
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        window._lockTime = data[0] ? data[0].config_value * 60 * 1000 : 1200000;
                    },
                    error: function(data) {
                        //二十分钟没动就锁定
                        window._lockTime = 1200000;
                        console.warn(data);
                    }
                });
            };
            //页面事件触发，更新最后操作时间
            this._documentEvent = function () {
                this._updateLastTime();
                $(document).bind('mousemove mousewheel click', _self._updateLastTime);
            };
            //设置定时器
            this._checkTimer = function () {
                this.checkTimer = setInterval(function() {
                    var now = new Date().getTime();
                    // 超时
                    if (now - window._lastMoveTime > window._lockTime) {
                        _self._reLoginDialogShow();
                    }
                }, 2000);
            };
            //设置最后操作时间
            this._updateLastTime = function () {
                window._lastMoveTime = new Date().getTime();
            };
            //弹出重新登录提示框
            this._reLoginDialogShow = function () {
                $.ajax({
                    url: '/Artemis/rest/uam/casParams',
                    type: "GET",
                    dataType: 'json',
                    data: {},
                    success: function(data) {
                        var info = data.msg_result;
                        var cookies = $.cookie();
                        for (var key in cookies) {
                            $.removeCookie(key, {path: '/'});
                        }
                        //cas登录 和 普通登录
                        if ('true' == info.casenabled) {
                            //TODO cas登陆 frameBase.reLoginByCas(info);
                        } else {
                            _self._reLogin();
                        }
                    }
                });
            };
            //普通登录：弹出重新登陆提示框
            this._reLogin = function () {
                //恢复居中
                $('#login-panel').css({
                    'position': 'fixed',
                    'left': '50%',
                    // 'margin-left': '-180px',
                    'top': '50%',
                    // 'margin-top': '-130px'
                });
                $("#re-login-bg").fadeIn(200);
                $("#login-panel").fadeIn(200);
                $("#password").focus().val("");
                clearInterval(this.checkTimer);
            };
            //隐藏重新登录框
            this._reLoginDialogHide = function () {
                $("#re-login-bg").fadeOut(200);
                $("#login-panel").fadeOut(200);
                this._checkTimer();
            };
            //登录框登录事件
            this.loginFormSubmit = function () {
                var login_no = $("#username").val();
                var password = $("#password").val();
                $("#login-info").html('login...');
                //验证用户名、密码是否填写
                if (!_self._validateLoginInfo(login_no, password)) {
                    return;
                }
                //请求密码加密
                password = _self._encryptPassword(password);
                //发送登录请求，登录
                _self._loginSubmit(login_no, password);
            };
            //验证登录信息
            this._validateLoginInfo = function (login_no, password) {
                if ($.trim(login_no) == '') {
                    $("#login-info").html('用户名不能为空');
                    return false;
                }
                if ($.trim(password) == '') {
                    $("#login-info").html('密码不能为空');
                    return false;
                }
                return true;
            };
            //加密密码
            this._encryptPassword = function (password) {
                $.ajax({
                    url: '/Artemis/rest/uam/rsaParams',
                    type: "GET",
                    dataType: 'json',
                    async: false,
                    success: function(data) {
                        var info = data.msg_result;
                        //根据算法的系数和指数获取加密公钥
                        var publicKey = RSAUtils.getKeyPair(info.exponent, '', info.modulus);
                        //是否对密码加密
                        if (info.encrypted == "true")
                            password = RSAUtils.encryptedString(publicKey, password);
                    }
                });
                return password;
            };
            //发送登录请求，登录
            this._loginSubmit = function (login_no, password) {
                $.ajax({
                    url: '/Artemis/rest/uam/userlogin',
                    type: "PUT",
                    xhrFields: {withCredentials:true},
                    data: {
                        'login_no': login_no,
                        'password': password
                    },
                    dataType: 'json',
                    success: function(data) {
                        if (data.msg_no == 0) {
                            $("#login-info").html('');
                            _self._reLoginDialogHide();
                        } else {
                            $("#login-info").html(data.msg_info);
                        }
                    },
                    error: function(data) {
                        $("#login-info").html(data.msg_info);
                    }
                });
            };
            //登录框事件绑定
            this._connectDomEvent = function (loginOut) {
                $("#re-exit-btn").click(loginOut);
                $("#re-login-btn").click(this.loginFormSubmit);
                $("#login-form input").keydown(function(event) {
                    //回车
                    if (event.which == 13) {
                        $("#re-login-btn").click();
                    }
                });
            };
            return this;
        }
    });
})(jQuery);