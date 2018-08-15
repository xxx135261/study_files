/***
 * sidebar 左边栏组件，包含我的关注，最近访问，我的组合
 * @author: mengjq@hundsun.com
 * @date: 2017.12.21
 */
var myconIndex = 0, recenIndex = 0, mycomIndex = 0;
var common = $.common();
let $this;
export default {
    name: "sidebar",
    data() {
        return {
            concernNavs: [],
            visitNavs: [],
            combinNavs: [],
            flag: "true",
            isMore1: true,
            isMore2: true,
            isMore3: true,
            text: "more",
            loading1: true,
            loading2: true,
            loading3: true,
            typeInfo: {
                recentVisit: {
                    /*栏目正常（收缩时）高度*/
                    normalH: 260,
                    /*栏目展开时高度*/
                    dropdownH: 360,
                    /*栏目收缩时请求区域高度*/
                    elH1: 25 * 7,
                    /*栏目展开时请求区域高度*/
                    elH2: 25 * 12,
                    /*Grid对象*/
                    grid: null
                },
                myConcern: {
                    normalH: 130,
                    dropdownH: 260,
                    elH1: 25 * 4,
                    elH2: 25 * 7,
                    grid: null
                },
                myCombination: {
                    normalH: 260,
                    dropdownH: 360,
                    elH1: 25 * 7,
                    elH2: 25 * 12,
                    grid: null
                }
            }
        }
    },
    created() {
        this.$root.eventHub.$on('openCombination', this.openCombination);
    },
    mounted() {//数据请求
        $this = this;
        $this.myConcern();
        $this.recentVisit();
        $this.myCombination();
    },
    beforeDestroy() {
        this.$root.eventHub.$off('openCombination', this.openCombination);
    },
    methods: {
        /**
         * 获取可见区域
         *
         * @param type 栏目类型 ["myConcern", "recentVisit", "myCombination"]
         * @returns {{width: number, height: number, scrollTop: number, scrollLeft}}
         */
        getVisibleArea(type) {
            var sidebar = document.getElementsByClassName("left-side")[0];
            return {
                width: sidebar.clientWidth,
                height: this.typeInfo[type].elH1,
                scrollTop: sidebar.clientTop,
                scrollLeft: sidebar.scrollLeft
            };
        },
        //我的关注数据请求
        myConcern() {
            this.loading1 = true;
            this.typeInfo.myConcern.grid = og.views.analytics.griddata.loadGridData({
                name: og.api.rest.views.parame.myConcern.children,
                requestParam: {}, //todo 在使用动态时间的时候，需要用到
                otherParam: {
                    visibleArea: this.getVisibleArea("myConcern"),
                    noContainsRowOne: true
                },
                metaHandle: null,
                dataHandle: function (result) {//我的关注数据简单处理
                    var result_s = eval(result);
                    $this.concernNavs = [];
                    for (var i = 0; i < result_s.length; i++) {
                        var value = result_s[i], scorll = value.scroll;
                        for (var j = 0; j < scorll.length; j++) {
                            var _scroll = scorll[j];
                            var curr, last,
                                indicator = !_scroll || !_scroll.h || !_scroll.h.length ? null
                                    : (curr = _scroll.h[_scroll.h.length - 1]) < (last = _scroll.h[_scroll.h.length - 2]) ? 'down'
                                        : curr > last ? 'up' : 'smooth';
                            if (j == 0) {
                                value.state = indicator;
                            }
                            value[_scroll['col_name']] = _scroll.value;
                        }
                        $this.$set($this.concernNavs, i, value);
                    }
                    $this.loading1 = false;
                }
            })
        },
        //最近访问数据请求
        recentVisit() {
            this.loading2 = true;
            this.typeInfo.recentVisit.grid = og.views.analytics.griddata.loadGridData({
                name: og.api.rest.views.parame.recentVisit.children,
                otherParam: {
                    visibleArea: this.getVisibleArea("recentVisit"),
                    noContainsRowOne: true
                },
                dataHandle: function (result) {
                    var result_s = eval(result);
                    $this.visitNavs = [];
                    for (var i = 0; i < result_s.length; i++) {
                        var value = result_s[i], scorll = value.scroll;
                        for (var j = 0; j < scorll.length; j++) {
                            var _scroll = scorll[j];
                            var curr, last,
                                indicator = !_scroll || !_scroll.h || !_scroll.h.length ? null
                                    : (curr = _scroll.h[_scroll.h.length - 1]) < (last = _scroll.h[_scroll.h.length - 2]) ? 'down'
                                        : curr > last ? 'up' : 'smooth';
                            if (j == 0) {
                                value.state = indicator;
                            }
                            value[_scroll['col_name']] = _scroll.value;
                        }
                        $this.$set($this.visitNavs, i, value);
                    }
                    $this.loading2 = false;
                }
            });
        },
        //我的组合数据请求
        myCombination() {
            this.loading3 = true;
            return this.typeInfo.myCombination.grid = og.views.analytics.griddata.loadGridData({
                name: og.api.rest.views.parame.myCombination.children,
                otherParam: {
                    visibleArea: this.getVisibleArea("myCombination"),
                    noContainsRowOne: true
                },
                dataHandle: function (result) {
                    var result_s = eval(result);
                    $this.combinNavs = [];
                    for (var i = 0; i < result_s.length; i++) {
                        var value = result_s[i], scorll = value.scroll, rowNum = value.data_row;
                        for (var j = 0; j < scorll.length; j++) {
                            var _scroll = scorll[j];
                            var curr, last,
                                indicator = !_scroll || !_scroll.h || !_scroll.h.length ? null
                                    : (curr = _scroll.h[_scroll.h.length - 1]) < (last = _scroll.h[_scroll.h.length - 2]) ? 'down'
                                        : curr > last ? 'up' : 'smooth';
                            if (j == 0) {
                                value.state = indicator;
                            }
                            value[_scroll['col_name']] = _scroll.value;
                        }
                        $this.$set($this.combinNavs, rowNum - 1, value);
                    }
                    $this.loading3 = false;
                }
            });
        },
        //子标题点击跳转到相应的详情页
        menuClick(event) {
            var el = $(event.target);
            var sCode = el.attr('nodeId');
            var securityId = el.attr('securityId');
            var sName = el.attr('title');
            var type = el.attr('type');
            if (type == "myCombination") {
                this.openCombination(sCode, sName);
            } else {
                //已打开标签列表
                common.reqLastVisit(securityId, sName, 2, 'recentVisit', this.$router);
            }
        },
        //打开相应组合
        openCombination(sCode, sName) {

            common.reqLastVisit(sCode, sName, 1, "myCombination", null);
            //用于存入当前组合信息
            this.$store.dispatch({
                type: 'setSelectGroup',
                portfolio: {
                    id: sCode,
                    name: sName
                }
            });
            const lastVisit = this.$store.getters.cachingLastVisit;
            const splitStr = lastVisit.split('/');
            if (splitStr && splitStr.length >= 2) {
                // TODO: 目前把绝对路径的一级路由当做路由名称
                const routeName = splitStr[1],
                    context = this.$parent.$refs['currentViewInstance'];
                const callLoadData = () => {
                    const context = this.$parent.$refs['currentViewInstance'], loadDataFunc = context.loadData;
                    if (loadDataFunc && $.isFunction(loadDataFunc)) {
                        loadDataFunc.call(context, sCode, "changePrt");
                    }
                }
                // 如果当前页面组件的名称与即将跳转过去的路由名称相同
                if (context.$options.name == routeName) {
                    callLoadData.call(this);
                } else {
                    this.$router.push({path: lastVisit});
                    this.$nextTick(() => {
                        callLoadData.call(this);
                    });
                }
            }
        },
        //more点击更多
        more(event, item) {
            var typeInfo = this.typeInfo;
            //展开和折叠的高度/后台使用
            var el = $(event.target);
            var type = el.attr('type');
            var frameGrid = typeInfo[type].grid;
            //图标显示
            if (item == 0) {
                this.isMore1 = !this.isMore1;
            }
            if (item == 1) {
                this.isMore2 = !this.isMore2;
            }
            if (item == 2) {
                this.isMore3 = !this.isMore3;
            }
            //点击已展开
            if (el.text() == "<<") {
                frameGrid.elements.height = typeInfo[type].elH1;
                el.text('more');
                el.next().animate({
                    height: typeInfo[type].normalH
                },600);
            }
            //点击非展开的
            else {
                //已有展开标志
                var flag = -1;
                for (var i = 0; i < $('.li_more').length; i++) {
                    if ($('.li_more')[i].textContent == '<<') {
                        flag = i;
                    }
                }
                if (flag > -1) {
                    $('.li_more')[flag].textContent = "more";

                    // 把其他栏目收缩回正常高度，并把请求条数也置为初始条数
                    el.parent('.menu-list').siblings().each(function () {
                        let type = $(this).children('a')[0].attributes.type.value;
                        let grid = typeInfo[type].grid;
                        grid.elements.height = typeInfo[type].elH1;
                        grid.resize();
                        $(this).children('.sub-menu-list').animate({
                            height: typeInfo[type].normalH
                        },600);
                    });
                }
                el.next().animate({
                    height: typeInfo[type].dropdownH
                },600);
                el.text('<<');
                frameGrid.elements.height = typeInfo[type].elH2;
            }
            frameGrid.resize();
        },
        
    }
}