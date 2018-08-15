<template src="../html/mainframe.html">
</template>
<script>
    import "../../scripts";
    import Vue from "vue";
    import { PASTable } from "./../../scripts/widgets/pasTable/index";

    Vue.use(PASTable);

    //引入登录界面
    const utils = $.pasUtils();

    import CommonTools from "../../scripts/core/util/com.hundsun.pas.common.util.public_methods.js";

    const commonTools = new CommonTools();
    export default {
        name: "main",
        data() {
            return {
                items: [],
                realTimeStock: null,
                realIndex: 0,
                realTimeGrid: [],
                inputType: "main",
                loginName: "",
                visioninfo: [
                    {
                        year: "2018",
                        month: "6月23日",
                        title: "V1.2.2",
                        content: ["优化主题显示效果", "优化页面示例-团队协作-知识库部分页面", "删除标签页相关无用代码"]
                    },
                    {
                        year: "2017",
                        month: "4月27日",
                        title: "V1.2.1",
                        content: ["优化主题显示效果", "优化页面示例-团队协作-知识库部分页面", "删除标签页相关无用代码"]
                    },
                    { year: "2016", month: "1月10日", title: "V1.2.0", content: ["优化主题显示效果", "删除标签页相关无用代码"] }
                ],
                isOpen: false,//主题切换
                isScreen: false,//全屏切换
                isSimuhome: this.$store.state.adapter.enabled//是否打开私募之家
            };
        },
        components: {},
        computed: {
            selectGroup() {
                return this.$store.state.selectGroup;
            },
            userInfo() {
                return this.$store.state.userInfo;
            },
            isLogin() {
                return this.$store.state.auth;
            }
        },
        created() {
            this.$store.dispatch("loadUserInfo");
            commonTools.loadUserViewsRoutes(this.$router, this.$store);
            //加载上一次的主题
            this.loadLastVisit();
            this.changeColor();
            this.getPortfolio();
            this.$root.eventHub.$on("unauthorizedOperation", this.openLoginWindow);
        },
        destroyed() {
            this.$root.eventHub.$off("unauthorizedOperation", this.openLoginWindow);
        },
        methods: {
            loadLastVisit() {
                try {
                    let lastVisit = window.sessionStorage.getItem("lastVisit");
                    if (lastVisit && lastVisit != "") {
                        this.$store.commit({
                            type: "setLastVisit",
                            lastVisit: lastVisit
                        });
                    }
                } catch (e) {
                    console.warn("localStorage is not supported by your browser.");
                }
            },
            //折叠左边栏
            btnClick(event) {
                $("#collapse_btn").children(".fa").toggleClass("active");
                $("body").toggleClass("left-side-collapsed");
                //触发窗口改变事件
                setTimeout(function() {
                    $(window).resize();
                }, 0);
            },
            //刷新按钮点击
            refresh(event) {
                var el = $(event.currentTarget);
                var a = el.parents("a") || el.parent() || el;
                a.attr("aria-expanded", "false");
                var scope = this;
                var sCode = this.$store.state.selectGroup.id;
                this.$children.forEach(function(val, index) {
                    if ($(val.$el).hasClass("realTime")) {
                        if (val.loadData && $.isFunction(val.loadData)) {
                            if ($.inArray(scope.$router.currentRoute.name, ["attriBution", "profitAndLoss", "riskAnalysis", "siloAnalysis"]) >= 0) {
                                val.loadData(sCode, "changePrt");
                            } else {
                                val.loadData(sCode);
                            }
                        }
                    }
                });
            },
            //加载不同的主题
            changeColor() {
                let theme = "gray";
                let style = $("<link/>");
                style.attr("rel", "stylesheet");
                if (localStorage.getItem("theme")) {
                    theme = localStorage.getItem("theme");
                    style.attr("href", "/static/themes/" + theme + ".css");
                }
                var heads = $("#col_cc");
                heads.append(style);
            },
            //更改主题
            changeTheme(event) {
                var el = $(event.currentTarget);
                localStorage.setItem("theme", el.attr("class"));
                this.changeColor();
            },
            loginOut() {
                let scope = this;
                $.ajax({
                    url: "/Artemis/rest/uam/casParams",
                    type: "GET",
                    dataType: "json",
                    data: {
                        action: "logout"
                    }
                }).then(function(data) {
                    var info = data.msg_result;
                    $.ajax({
                        url: "/Artemis/rest/uam/userlogout",
                        type: "GET",
                        dataType: "json",
                        xhrFields: { withCredentials: true },
                        data: {
                            login_id: $.cookie("una")
                        },
                        success: function() {
                            var cookies = $.cookie();
                            for (var key in cookies) {
                                $.removeCookie(key, { path: "/" });
                            }
                            scope.$store.commit({
                                type: "setAuth",
                                auth: false
                            });
                            //cas登录
                            if ("true" == info.casenabled) {
                                //TODO cas登陆
                            }
                            // 登出成功，移除本地存储
                            try {
                                sessionStorage.removeItem("lastVisit");
                                // 移除用户视图（菜单）缓存
                                sessionStorage.removeItem("userViews");
                            } catch (e) {
                                console.warn("localStorage is not supported by your browser.");
                            }
                            window.location.reload();
                        }
                    });
                });
            },
            loadUserFolder() {
                if (!this.isSimuhome) {
                    var $scope = this;
                    $.ajax({
                        type: "GET",
                        url: "/Artemis/rest/uam/userfolder",
                        dataType: "json",
                        xhrFields: { withCredentials: true },
                        success: function(data) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].type != "menu") {
                                    data.splice(i--, 1);
                                }
                            }
                            $scope.items = data;

                        },
                        error: function(data) {
                            $.showNotice("获取用户菜单失败！" + data, "warn");
                        }
                    });
                }
            },
            /*打开用户菜单下的个人信息*/
            openUserInfo() {
                if (this.isSimuhome) {
                    // 用户离开系统时清除全部cookie
                    let cookies = $.cookie();
                    for (var key in cookies) {
                        $.removeCookie(key, { path: "/" });
                    }
                    window.location = this.$store.state.adapter.private_pas;
                }
            },
            userMenuClick(item) {
                //判断是否新打开窗口
                if (item.page.indexOf("#") > -1) {
                    var href = item.page.replace("#", "");
                    window.open("http://" + window.location.host + href);
                } else {
                    this.$router.push({ name: (item.page.indexOf("/") > 0 ? item.page.substr(4) : item.page) });
                }
            },
            /**
             * 获取组合
             */
            getPortfolio() {
                let $this = this;
                utils.getPortfolio(function(result) {
                    let data = result.data;
                    if (result && data) {
                        var portfolio = {
                            id: (data.KEY_SCHEME || data._scheme) + "~" + (data.KEY_VALUE || data._value),
                            name: data.NAME
                        };
                        if (portfolio) {
                            $this.$store.dispatch({ type: "setSelectGroup", portfolio: portfolio });
                        }
                    }
                });
            },
            //版本信息的出现与否
            visionBlock(event) {
                var e = event ? event : window.event;
                var elHeight = $(".vision").height();
                $(".vision").slideToggle(elHeight);
                window.event ? window.event.cancelBubble = true : e.stopPropagation();
                //添加滚动条
                $(".vision").niceScroll({
                    cursorcolor: "#c7c6c6",
                    cursoropacitymax: 1,
                    touchbehavior: false,
                    cursorwidth: "4px",
                    cursorborder: "0",
                    cursorborderradius: "4px",
                    oneaxismousemode: false,
                    smoothscroll: true,
                    railoffset: true
                }).resize();
            },
            //版本信息时间轴
            down(event) {
                var el = $(event.currentTarget);
                $(".year .info").each(function(e, target) {
                    var $target = $(target),
                        $ul = $target.find("ul");
                    $target.height($ul.outerHeight()), $ul.css("position", "relative");
                });
                el.parent(".year").toggleClass("shrink");
                return false;
            },
            //新手引导触发
            introStart(event, flag) {
                var el = $(event.currentTarget);
                if (flag == "on") {
                    var mask = $("<div class='maskDiv'></div>");
                    $(".main_Wrap").append(mask);
                    $(".stepA").fadeIn();
                }
                if (flag == "off") {
                    el.parents(".newstep").fadeOut(300);
                    $(".maskDiv").remove();
                }
            },
            //下一步按钮
            nextBtn(event, flag, up) {
                var aStep = $(".newstep .next");
                for (var i = 0; i < aStep.length; i++) {
                    if (flag == i && up == "down") {
                        aStep.eq(i).parents(".newstep").fadeOut();
                        aStep.eq(i + 1).parents(".newstep").fadeIn();
                    }
                    if (flag == i && up == "up") {
                        aStep.eq(i).parents(".newstep").fadeOut();
                        aStep.eq(i - 1).parents(".newstep").fadeIn();
                    }
                    if (flag == aStep.length - 1) {
                        $(".maskDiv").remove();
                    }
                }
            },
            //是否显示全屏
            fullScreen(event) {
                this.isScreen = !this.isScreen;
                var elem = document.body;
                if (this.isScreen == true) {
                    if (elem.webkitRequestFullScreen) {
                        elem.webkitRequestFullScreen();
                    } else if (elem.mozRequestFullScreen) {
                        elem.mozRequestFullScreen();
                    } else if (elem.requestFullScreen) {
                        elem.requestFullscreen();
                    } else if (elem.msRequestFullscreen) {//ie11
                        elem.msRequestFullscreen();
                    } else {
                        console.log("浏览器不支持全屏API或已被禁用  ");
                    }
                } else {
                    document.exitFullscreen ? document.exitFullscreen() :
                        document.mozCancelFullScreen ? document.mozCancelFullScreen() :
                            document.webkitExitFullscreen ? document.webkitExitFullscreen() :
                                document.msExitFullscreen ? document.msExitFullscreen() : "";
                }
            },
            // 打开登录/注册窗口
            openLoginWindow() {
                $("#homePage").modal();
            }
        }
    };
</script>
<style scoped rel="stylesheet/css" id="col_color">
	/*导入公共样式*/
	@import "./../../styles/common/bootstrap/bootstrap.min.css";
    @import "../../scripts/base/jquery/toastr/toastr.min.css";
    @import "./../../styles/common/zTreeStyle/zTreeStyle.css";
    @import "./../../styles/common/jquery/layout-default-latest.css";
    @import "./../../styles/common/jquery/jquery-confirm.css";
    @import "./../../styles/default1/plugins/gedgets/og-gadgets-analytics.css";
    @import "./../../styles/default1/main.css";
	@import "./../../styles/default1/core.css";
	@import "./../../styles/default1/style.css";
	@import "../../../static/themes/gray.css";
    @import "./../../styles/default1/HeaderCss/headerSection.css";
    @import "./../../styles/default1/SearchInput/searchInput.css";
    @import "./../../styles/default1/Table/default.css";
    @import "./../../styles/default1/simuStyle.css";
</style>