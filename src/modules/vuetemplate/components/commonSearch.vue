<script>
    import Vue from 'vue';

    Vue.component('common-search', {
        template: "<div>\n" +
        "        <input class=\"search-ipt\" placeholder=\"点击搜索股票、组合\" @click=\"searchIptClick($event)\" " +
        "@keydown.up.prevent=\"onKeyUp\" @keydown.down.prevent=\"onKeyDown\" @keyup.enter.prevent=\"onKeyEnter\"><i\n" +
        "            class=\"fa fa-search gsearch\"  @click=\"clickSearch($event)\"></i>\n" +
        "        <ul class=\"search-list\">\n" +
        "            <li class=\"title\" v-show=\"stockTitle\">股票</li>\n" +
        "            <li v-for=\"(stock, i) in stocks\" :key=\"i\" :s-code=\"stock.code\" :s-name=\"stock.name\" @click=\"selectResult($event.currentTarget)\">{{stock.name}}（{{stock.code}}）</li>\n" +
        "            <li class=\"title\" v-show=\"combinationTitle\">组合</li>\n" +
        "            <li v-for=\"(combination, j) in combinations\" :key=\"j\" :s-code=\"combination.code\"\n" +
        "                :s-name=\"combination.name\" @click=\"selectResult($event.currentTarget)\"> {{combination.name}}（{{combination.code}}）\n" +
        "            </li>\n" +
        "            <li class=\"title\" v-show=\"notHaveTitle\" style=\"text-align: center\">无搜索结果</li>\n" +
        "        </ul>\n" +
        "    </div>",
        data() {
            return {
                stockTitle: false,
                stocks: [],
                combinationTitle: false,
                combinations: [],
                notHaveTitle: false,
                index: 0,
                num: 0,
                searchIpt: null,
                clearBtn: null,
                searchList: null
            }
        },
        props: {
            sType: {
                type: String,
                required: true
            }
        },
        mounted() {
            var el = this.$el;
            this.searchIpt = $(el).children(".search-ipt");
            this.clearBtn = $(el).children(".clear-search");
            this.searchList = $(el).children(".search-list");

            var scope = this;
            //搜索框请求
            this.searchIpt.bind('input propertychange', function () {
                var keyword = $.trim(scope.searchIpt.val());
                if (keyword.length > 0) {
                    scope.clearBtn.fadeIn(200);
                    scope.doSearch(keyword);
                } else {
                    scope.searchList.slideUp(200);
                    scope.clearBtn.fadeOut(200);
                }
            });

            //输入框失去焦点隐藏搜索提示
            $(document).click(function (event) {
                //点击自己不会隐藏
                if (event.target == scope.searchIpt[0]) {
                    return;
                }
                scope.searchIpt.removeClass("focus");
                scope.searchList.hide();
                scope.clearBtn.hide();
            });
        },
        methods: {
            //选择搜索结果
            selectResult: function (el) {
                this.searchIpt.val($(el).text().split("（")[0]);
                this.searchList.hide();
                var sCode = $(el).attr("s-code");
                var sName = $(el).attr("s-name");
                if (this.sType == 'main') {
                    this.frameAddFnc(sCode, sName);
                } else if (this.sType == 'myConcern') {
                    this.myConcernAddFnc(sCode, sName);
                } else if (this.sType == 'recentVisit') {
                    this.recentVisitAddFnc(sCode, sName);
                }
            },
            /**
             * 监听键盘“Up”键的按下事件
             */
            onKeyUp() {
                if (this.num > 1) {
                    this.index = (this.index + (this.num - 1)) % this.num;
                    if (this.searchList.children("li").eq(this.index).hasClass("title"))
                        this.index = (this.index + (this.num - 1)) % this.num;
                    this.index = this.index % this.num;
                    this.searchList.children("li").removeClass("active");
                    this.searchList.children("li").eq(this.index).addClass("active");
                }
            },
            /**
             * 监听键盘“Down”键的按下事件
             */
            onKeyDown() {
                if (this.num > 1) {
                    this.index = (this.index + 1) % this.num;
                    if (this.searchList.children("li").eq(this.index).hasClass("title"))
                        this.index = (this.index + 1) % this.num;
                    this.index = this.index % this.num;
                    this.searchList.children("li").removeClass("active");
                    this.searchList.children("li").eq(this.index).addClass("active");
                }
            },
            /**
             * 监听键盘“Enter”键的松开事件
             */
            onKeyEnter() {
                if (this.searchList.children("li.active").length > 0) {
                    this.selectResult(this.searchList.children("li.active")[0]);
                }
            },
            //点击搜索按钮进行搜索
            clickSearch: function () {
                var searchIpt = $(".search-ipt");
                var opi = $.trim(searchIpt.val());
                for (var i = 0; i < this.stocks.length; i++) {
                    if (opi != this.stocks[i].name) {
                        $.showNotice("！不存在此股票", 'info');
                    }
                    for (var j = 0; j < this.searchList.children("li").length; j++) {
                        if (opi == this.searchList.children("li").eq(j).attr("s-name")) {
                            this.selectResult(this.searchList.children("li").eq(j));
                        }
                    }
                }
                var el = this.searchList.children("li.active")[0];
                this.selectResult(el);
            },
            //进行搜索
            doSearch: function (keyword) {
                var scope = this;
                this.searchList.children("li").removeClass("active");
                og.api.rest.searchtext.get({
                    searchtext: keyword,
                    stype: (this.sType.indexOf("recentVisit") != -1 || this.sType.indexOf("myConcern") != -1) ? "0" : "-1"
                }).pipe(function (result) {
                        //数据绑定
                        var result = result.data;
                        if ($.isArray(result)) {
                            var length = result.length;
                            switch (length) {
                                case 1:
                                    scope.stocks = result[0];
                                    scope.stockTitle = result[0].length > 0;
                                    break;
                                case 2:
                                    scope.stocks = result[0];
                                    scope.combinations = result[1];
                                    scope.stockTitle = result[0].length > 0;
                                    scope.combinationTitle = result[1].length > 0;
                                    break;
                                default: {
                                }
                            }
                        }
                        //没有搜索结果时的提示
                        scope.notHaveTitle = (!scope.stockTitle && !scope.combinationTitle) ? true : false;
                        //显示搜索结果
                        scope.searchList.slideDown(200);
                        //选择搜索结果
                        // scope.searchList.children("li").click(function (event) {
                        //     event.stopPropagation();
                        // });
                        // scope.searchList.children("li:not(.title)").click(function (event) {
                        //     event.stopPropagation();
                        //     event.preventDefault();
                        // });
                        scope.index = 0;
                        scope.num = (scope.stocks.length || 0) + (scope.combinations.length || 0)
                            + (scope.stockTitle ? 1 : 0) + (scope.combinationTitle ? 1 : 0) + (scope.notHaveTitle ? 1 : 0);
                    }
                );
            },
            //处理选择搜索结果/主页
            frameAddFnc: function (sCode, sName) {
                var data = [];
                var scope = this;
                if (sCode.indexOf('~') != -1 && (data = sCode.split('~')) && data) {
                    //组合
                    this.$root.eventHub.$emit('openCombination', sCode, sName);
                } else {
                    //股票
                    /*data[0] = "FKSec";
                    data[1] = sCode.substr(2) + sCode.substring(0, 2);
                    data[2] = sName;
                    data[3] = '2';*/
                    //添加最近访问
                    $.common().reqLastVisit("FKSec~" + sCode.substr(2) + sCode.substring(0, 2),
                        sName, 2, null, this.$router);
                }
            },
            //处理选择搜索结果/我的关注
            myConcernAddFnc: function (sCode, sName) {
                var data = [];
                if (sCode.indexOf('~') != -1 && (data = sCode.split('~')) && data) {
                    //组合
                    data[2] = sName, data[3] = '1';
                } else {
                    //股票
                    data[0] = "FKSec";
                    data[1] = sCode.substr(2) + sCode.substring(0, 2);
                    data[2] = sName;
                    data[3] = '2';
                    //添加最近访问
                    $.pasUtils().addLastVisit(data, "myConcerns", function (result) {
                        let data = result.data;
                        if (!result.error && data.msg_no == 0) {
                            $.showNotice("添加我的关注成功!");
                        } else {
                            $.showNotice("添加我的关注失败!", 'error');
                        }
                    });
                }
            },
            //处理选择搜索结果/最近访问
            recentVisitAddFnc: function (sCode, sName) {
                var data = [];
                if (sCode.indexOf('~') != -1 && (data = sCode.split('~')) && data) {
                    //组合
                    data[2] = sName, data[3] = '1';
                } else {
                    //股票
                    data[0] = "FKSec";
                    data[1] = sCode.substr(2) + sCode.substring(0, 2);
                    data[2] = sName;
                    data[3] = '2';
                    //添加最近访问
                    $.pasUtils().addLastVisit(data, null, function (result) {
                        let data = result.data;
                        if (!result.error && data.msg_no == 0) {
                            $.showNotice("添加最近访问成功！");
                        } else {
                            $.showNotice("添加最近访问失败！", 'error');
                        }
                    });
                }
            },
            // 输入框获得焦点显示搜索提示
            searchIptClick: function (event) {
                $(this).addClass("focus").select();
                if ($.trim(this.searchIpt.val()).length > 0) {
                    this.doSearch($.trim(this.searchIpt.val()));
                    this.clearBtn.fadeIn(200);
                }
            }
        }
    });
</script>