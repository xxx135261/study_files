<template src="../../html/login.html"></template>
<script>
    import RSAUtils from '../../../scripts/core/securitiy/com.hundsun.common.security.js'
    import {submitLogin, keydown} from '../../../scripts/biz/login/com.hundsun.pas.common.login.js'

    export default {
        name: 'login',
        data() {
            return {
                /*切换登录页和注册页*/
                isLogin: true,
                showMsg: false,
                msg: '',
                newUsername: '',
                newPassword: '',
                rePassword: '',
                loginUserName: '',
                loginPassword: ''
            }
        },
        mounted() {
            let _self = this;

            $(this.$el).on('show.bs.modal', function () {
                _self.init();
            });

            if (this.$store.state.adapter.name == "smzj") {
                this.autoLogin();
            }
        },
        destroyed() {
            $(this.$el).off('show.bs.modal');
        },
        methods: {
            getHomePage() {
                // TODO: 回到登录前的页面
                this.$router.push({path: this.$store.getters.cachingLastVisit});
                setTimeout(function () {
                    window.location.reload();
                }, 0);
            },
            login() {
                submitLogin.call(this, this.getHomePage);
            },
            handleKeydown(event) {
                keydown(event);
            },
            autoLogin() {
                let autoLogin = $.cookie('auto_login');
                if (autoLogin === "0") {
                    let login_no = $.cookie('login_no'), pwd = $.cookie('password');
                    if ((login_no && $.trim(login_no) === '') || (pwd && $.trim(pwd) === '')) {
                        $("#login-info").html('自动登录失败：参数缺失');
                    } else {
                        submitLogin(this.getHomePage);
                    }
                } else if (this.$store.state.adapter.enabled) {
                    window.location.href = this.$store.state.adapter.smzj_login;
                }
            },
            //新用户注册步骤
            register(event) {
                var el = $(event.currentTarget);

                let valid = this.formValidate();
                if (valid) {
                    let data = {'username': this.newUsername, 'password': this.newPassword}

                    // 注册
                    console.log("注册");
                }
            },
            formValidate() {
                var userNameRegex = /^[\w\u4e00-\u9fa5]{3,10}$/g;//账号
                var pwdRegex = /^\S{3,20}$/g;//密码
                let valid;
                if ($.trim(this.newUsername) == "" || $.trim(this.newPassword) == "") {
                    valid = false;
                    this.msg = "账号和密码不能为空";
                } else if (!userNameRegex.test(this.newUsername)) {
                    valid = false;
                    this.msg = "请输入账号为3-10个字母/汉字/数字/下划线";
                } else if (!pwdRegex.test(this.newPassword)) {
                    valid = false;
                    this.msg = "请输入的密码为3-20个非空白字符";
                } else if (this.newPassword != this.rePassword) {
                    valid = false;
                    this.msg = "两次输入的密码不一致";
                } else {
                    valid = true;
                }
                this.showMsg = !valid;

                return valid;
            },
            init() {
                this.isLogin = true;
                this.showMsg = false;
                this.newUsername = '';
                this.newPassword = '';
                this.rePassword = '';
                this.loginUserName = '';
                this.loginPassword = '';
            }
        }
    }
</script>
<style scoped type="text/css">
    @import "../../../styles/default1/LogonCss/login.css";
</style>
