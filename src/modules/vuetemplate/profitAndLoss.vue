<template src="../html/profitAndLoss.html"></template>
<script>
    import {mapState} from 'vuex';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'profitAndLoss';

    var profInfoGrid = null,
        riskAdjustedGrid = null,
        awkwardnessProfitGrid = null,
        awkwardnessLossGrid = null,
        riskAdjustedRadioGrid = null,
        combinProfitGrid = null,
        yieldEchartData = null;
    var max, min;
    var utils = $.pasUtils();
    var common = $.common();
    var _self;

    export default {
        name: "profitAndLoss",
        data() {
            return {
                // 明细表格Grid
                profitInfoGrid: null,
                date: '',
                activated: true,
                // 组合收益loading
                loading1: null,
                // 风险调整收益loading
                loading2: null,
                // 收益走势loading
                loading3: null,
                // 前五大盈利loading
                loading4: null,
                // 前五大亏损loading
                loading5: null,
                // 盈亏明细表格loading
                loading6: null
            }
        },
        computed: mapState(moduleName, {
            profitTopFive: state => state.profitTopFive,
            lossTopFive: state => state.lossTopFive,
            profitInfo: state => state.profitInfo,
            profInfo: state => state.profInfo,
            combinProfit: state => state.combinProfit,
            riskAdjusted: state => state.riskAdjusted,
            riskAdjustedRadio: state => state.riskAdjustedRadio,
            echartConfig1: state => state.echartConfig1,
            echartConfig2: state => state.echartConfig2
        }),
        created() {
            _self = this;
            this.$store.commit(moduleName + '/initProfitTopFive');
            this.$store.commit(moduleName + '/initLossTopFive');
        },
        mounted() {
            this.loadData();
            this.bindListenerOnModal();
        },
        activated() {
            this.activated = true;
            if (this.chart && this.chart.length > 0) {
                this.chart.forEach(function(val) {
                    setTimeout(val.resize, 0);
                })
            }
        },
        deactivated() {
            this.activated = false;
        },
        destroyed() {
            this.destroy();
            $('.OG-cell-options').remove();
        },
        methods: {
            loadData: function (portId, dateTime) {
                var scode = portId || this.$store.state.selectGroup.id;
                if (dateTime == "changePrt") {
                    dateTime = $('.sel').attr("value");
                }
                this.destroy();
                //加载前如果没有给dataTime赋值，就默认值是第一个日期时间
                if (dateTime == undefined) {
                    $('.profChangeTime li').removeClass('sel');
                    $('.profChangeTime li').eq(0).addClass('sel');
                    $('.profitRecentime li').removeClass('sel');
                    $('.profitRecentime li').eq(0).addClass('sel');
                }
                //盈利前五
                this.awkwardnessProfitFun(scode, dateTime || '1');
                var $scope = this;
                //亏损前五
                setTimeout(function () {
                    $scope.awkwardnessLossFun(scode, dateTime || '1');
                }, 500);
                //页面首行文字部分
                this.profInfoFun(scode, dateTime || '1');
                //风险调整收益分析排名
                setTimeout(function () {
                    $scope.riskadjustedRadioFun(scode, dateTime || '1');
                }, 500);
                //风险调整收益分析
                this.riskadjustedFun(scode, dateTime || '1');
                //收益走势
                setTimeout(function () {
                    $scope.yieldEchartDataFun(scode, dateTime || '1');
                }, 500);
                //组合收益
                this.rankingEchartDataFun(dateTime || '1');
                // 清除表格缓存
                this.$store.commit(moduleName + '/initProfitTopFive');
                this.$store.commit(moduleName + '/initLossTopFive');
            },
            destroy: function () {
                //切换页面时暂停或销毁上一次正在计算
                if (profInfoGrid || riskAdjustedGrid || awkwardnessProfitGrid
                    || awkwardnessLossGrid || riskAdjustedRadioGrid || combinProfitGrid || this.profitInfoGrid) {
                    profInfoGrid.kill();
                    riskAdjustedGrid.kill();
                    awkwardnessProfitGrid.kill();
                    awkwardnessLossGrid.kill();
                    riskAdjustedRadioGrid.kill();
                    combinProfitGrid.kill();
                    if (this.profitInfoGrid) {
                        this.profitInfoGrid.kill();
                    }
                }
            },
            //前五大盈亏 盈利前五数据请求
            awkwardnessProfitFun: function (nodeId, dataTime) {
                this.loading4 = true;
                awkwardnessProfitGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.profitAndLoss.awkwardnessProfit,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: {
                            height: 155,
                            width: 1000,
                            scrollHeight: 0,
                            scrollWidth: 0,
                            scrollTop: 0,
                            scrollLeft: 0
                        },
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleProfitTopFive
                });
            },
            // 盈利前五数据处理
            handleProfitTopFive: function (result) {
                if ($.isArray(result)) {
                    var nameValue = result[1];
                    var targetValue = result[2];
                    for (var cellNum = 1; cellNum < targetValue.length; cellNum++) {
                        var obj = targetValue[cellNum].cells;
                        var cells = nameValue[cellNum].cells[0];
                        var rowData = {};
                        rowData.name = cells.value;
                        rowData.securityId = cells.securityId;
                        for (var cellValueNum = 0; cellValueNum < obj.length; cellValueNum++) {
                            rowData[obj[cellValueNum].col_name] = obj[cellValueNum];
                        }
                        this.$set(this.profitTopFive, cellNum - 1, rowData);
                    }
                }
                this.loading4 = false;
                this.$nextTick(function () {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="profit-table"] tr td[cell]', awkwardnessProfitGrid);
                })
            },
            //前五大盈亏 亏损前五数据请求
            awkwardnessLossFun: function (nodeId, dataTime) {
                this.loading5 = true;
                awkwardnessLossGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.profitAndLoss.awkwardnessLoss,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: {
                            height: 155,
                            width: 1000,
                            scrollHeight: 0,
                            scrollWidth: 0,
                            scrollTop: 0,
                            scrollLeft: 0
                        },
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleLossTopFive
                });
            },
            // 亏损前五数据处理
            handleLossTopFive: function (result) {
                if ($.isArray(result)) {
                    var nameValue = result[1];
                    var targetValue = result[2];
                    for (var cellNum = 1; cellNum < targetValue.length; cellNum++) {
                        var obj = targetValue[cellNum].cells;
                        var cells = nameValue[cellNum].cells[0];
                        var rowData = {};
                        rowData.name = cells.value;
                        rowData.securityId = cells.securityId;
                        for (var cellValueNum = 0; cellValueNum < obj.length; cellValueNum++) {
                            rowData[obj[cellValueNum].col_name] = obj[cellValueNum];
                        }
                        this.$set(this.lossTopFive, cellNum - 1, rowData);
                    }
                }
                this.loading5 = false;
                this.$nextTick(function () {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="loss-table"] tr td[cell]', awkwardnessLossGrid);
                })
            },
            //盈亏分析总体分析（首行文字部分）数据请求
            profInfoFun: function (nodeId, dataTime) {
                profInfoGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.profitAndLoss.profInfo,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: utils.getDefaultVisibleArea()
                    },
                    metaHandle: null,
                    dataHandle: function (result) {
                        let result_s = eval(result);
                        let col = result_s[0].scroll[0];
                        _self.profInfo[col.col_name] = col.value;
                    }
                });
            },
            //风险调整收益分析数据请求
            riskadjustedFun: function (nodeId, dataTime) {
                this.loading2 = true;
                riskAdjustedGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.profitAndLoss.riskadjusted,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: utils.getDefaultVisibleArea(),
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleRiskadjustedData
                });
            },
            handleRiskadjustedData: function (result) {
                if ($.isArray(result)) {
                    var nameValue = result[1];
                    var targetValue = result[2];
                    var obj = targetValue[0].cells;
                    var cells = nameValue[0].cells[0];
                    var rowData = {};
                    rowData.name = cells.value;
                    rowData.securityId = cells.securityId;
                    for (var cellValueNum = 0; cellValueNum < obj.length; cellValueNum++) {
                        rowData[obj[cellValueNum].col_name] = obj[cellValueNum];
                    }
                    this.$store.commit({
                        type: moduleName + '/setRiskAdjusted',
                        newVal: rowData
                    });
                }
                this.loading2 = false;
                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="risk-table"] tr td[cell]', riskAdjustedGrid);
            },
            //组合收益图表数据请求
            rankingEchartDataFun: function (dataTime) {
                this.loading1 = true;
                combinProfitGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.profitAndLoss.yieldRanking,
                    requestParam: {
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: {
                            height: 25 * 4,
                            width: 1000,
                            scrollHeight: 0,
                            scrollWidth: 0,
                            scrollTop: 0,
                            scrollLeft: 0
                        }
                    },
                    metaHandle: null,
                    dataHandle: this.loadRankingLineData
                });
            },
            //收益走势和组合收益排名图数据处理及展示
            loadRankingLineData: function (result) {
                var result_s = eval(result);
                var scode = this.$store.state.selectGroup.id;
                this.combinProfit['Total Yield Rank'] = '0.00';
                for (let i = 1; i < result_s.length; i++) {
                    if (scode == result_s[i]['nodeId']) {
                        let scroll = result_s[i].scroll;
                        for (let j = 0; j < scroll.length; j++) {
                            let col = scroll[j];
                            this.combinProfit[col.col_name] = col.value;
                        }
                        break;
                    }
                }
                var option = this.chart[0].getOption();
                let rank = this.combinProfit['Total Yield Rank'];
                option.series[0].data[0].value = (rank.indexOf('%') > 0) ?
                    rank.substr(0, rank.indexOf('%')) : rank;
                option.series[0].data[0].name = this.combinProfit.times;
                this.chart[0].setOption(option, true);
                this.loading1 = false;
            },
            //收益走势图表数据请求
            yieldEchartDataFun: function (nodeId, dataTime) {
                max = min = undefined;
                this.loading3 = true;
                yieldEchartData = og.views.analytics.griddata.loadChartData({
                    name: og.api.rest.views.parame.profitAndLoss.yieldEchartData,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        lineNum: 2
                    },
                    titleHandle: this.loadTitleData,
                    dataHandle: this.loadLineData
                });
            },
            loadTitleData: function (data) {
                this.chart[1].setOption({
                    legend: {
                        data: ['沪深300', data]
                    },
                    series: [{name: '沪深300'}, {name: data}]
                });
                this.loading3 = false;
            },
            loadLineData: function (data) {
                if (data !== 'Missing inputs' && data != '') {
                    var seriesDataLgt = data.timeseries.data.length, $time = new Array(seriesDataLgt),
                        $value = new Array(seriesDataLgt);
                    data.timeseries.data.reduce(function (a, b, c) {
                        if (b == null) {
                            return a;
                        }
                        a.$time[c] = new Date(b[0]).Format("yyyy-MM-dd"), a.$value[c] = b[1];
                        return a;
                    }, {$time: $time, $value: $value});
                    this.chart[1].setOption({
                        xAxis: [{
                            data: $time
                        }]
                    });
                    var scope = this;
                    setTimeout(function () {
                        var currMax = Math.max.apply(Math, $value);
                        var currMin = Math.min.apply(Math, $value);
                        if (max === undefined || min === undefined) {
                            max = currMax;
                            min = currMin;
                        }
                        if (currMax > max) {
                            max = currMax;
                        }
                        if (currMin < min) {
                            min = currMin;
                        }
                        if (max == min) {
                            if (max === 0) {
                                min = -0.1;
                                max = 0.1
                            } else {
                                max = max * 1.2;
                                min = min * 0.8;
                            }
                        }
                        if (data.num == 1) {
                            scope.chart[1].setOption({
                                series: [{}, {
                                    data: $value
                                }]
                            });
                        } else {
                            scope.chart[1].setOption({
                                series: [{
                                    data: $value
                                }, {}]
                            });
                        }
                        scope.chart[1].setOption({
                            yAxis: [{
                                max: max,
                                min: min,
                                interval: (max - min) / 5
                            }]
                        });
                    }, 200);
                }
            },
            riskadjustedRadioFun: function (nodeId, dataTime) {
                riskAdjustedRadioGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.profitAndLoss.riskadjustedRadio,
                    requestParam: {
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: utils.getDefaultVisibleArea()
                    },
                    metaHandle: null,
                    dataHandle: this.handleRiskadjustedRadioData
                });
            },
            //风险调整收益分析排名数据获取
            handleRiskadjustedRadioData: function (result) {
                var result_s = eval(result);
                var scode = this.$store.state.selectGroup.id;
                for (var i = 1; i < result_s.length; i++) {
                    if (scode == result_s[i]['nodeId']) {
                        let scroll = result_s[i].scroll;
                        for (let j = 0; j < scroll.length; j++) {
                            let col = scroll[j];
                            this.riskAdjustedRadio[col.col_name] = col.value;
                        }
                    }
                }
                this.loading2 = false;
            },
            // 盈亏明细数据树展开或收缩
            addVisit: function (event) {
                var $target = $(event.currentTarget), _$start = $target.attr('data-row'),
                    _$end = $target.attr('data-splice');
                if (_$start && _$end) {
                    this.profitInfoGrid.busy(true);
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $itemSplice = "this.profitInfo.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $itemSplice = $itemSplice.concat(",empty");
                    }
                    $itemSplice = $itemSplice + ")";
                    eval("(" + $itemSplice + ")");
                    if (this.profitInfoGrid.resize(_$start)) {
                        this.profitInfoGrid.busy(false);
                    }
                    return;
                } else if (/data-row/g.test($target.html())) {
                    $target = $($target.html().replace(/&nbsp;/g, '')), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                    this.profitInfoGrid.busy(true);
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $itemSplice = "this.profitInfo.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $itemSplice = $itemSplice.concat(",empty");
                    }
                    $itemSplice = $itemSplice + ")";
                    eval("(" + $itemSplice + ")");
                    if (this.profitInfoGrid.resize(_$start)) {
                        this.profitInfoGrid.busy(false);
                    }
                    return;
                } else {
                    var sCode = $target.attr('securityid');
                    var sName = $target.html().replace(/&nbsp;/g, '');
                    if (!sCode) {
                        return;
                    } else {
                        // 在跳转前手动隐藏模态框
                        $('.profitdrag').modal('hide');
                        common.reqLastVisit(sCode, sName, 2, null, this.$router);
                    }
                }
            },
            //日期切换部分
            changeTime: function ($event) {
                var ele = $event.target;
                $(ele).addClass("sel").siblings().removeClass("sel");
                var param = $(ele).attr("value");
                this.$set(this.profInfo, 'name', $(ele).text());
                this.$store.commit(moduleName + '/initCombinProfit');
                this.combinProfit.times = $(ele).text();
                this.loadData(null, param);
                this.date = param;
            },
            bindListenerOnModal() {
                $('.profitdrag').on('shown.bs.modal', function () {
                    _self.profitClick()
                });
                $('.profitdrag').on('hide.bs.modal', function () {
                    $('.OG-cell-options').hide();
                });
            },
            // 前五大盈亏明细按钮绑定弹窗
            profitClick: function () {
                //请求前先清除缓存
                this.$store.commit(moduleName + '/initProfitInfo');
                var scode = this.$store.state.selectGroup.id;
                var selectedDate = $('.profitRecentime>li[class="sel"]').attr("value");
                this.profitInfoFun(scode, selectedDate || '1');
                $('.OG-cell-options').hide();
            },
            //盈亏明细表格数据请求
            profitInfoFun: function (nodeId, dataTime) {
                this.loading6 = true;
                this.profitInfoGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.profitAndLoss.profitInfo,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".profitdrag .detail_table"),
                        isDepgraph: true
                    },
                    metaHandle: function (metadata) {
                        _self.$store.commit({
                            type: moduleName + '/setProfitInfo',
                            newVal: metadata
                        });
                    },
                    dataHandle: this.handleProfitInfoData
                });
            },
            //盈亏明细表格数据获取
            handleProfitInfoData: function (result) {
                if ($.isArray(result)) {
                    var nameValue = result[1];
                    var targetValue = result[2];
                    for (var cellNum = 0; cellNum < targetValue.length; cellNum++) {
                        var obj = targetValue[cellNum].cells;
                        var cells = nameValue[cellNum].cells[0];
                        var rowData = {};
                        rowData.name = cells.dataRow + cells.value;
                        rowData.securityId = cells.securityId;
                        for (var cellValueNum = 0; cellValueNum < obj.length; cellValueNum++) {
                            rowData[obj[cellValueNum].col_name] = obj[cellValueNum];
                        }
                        this.$set(this.profitInfo, targetValue[cellNum].data_row, rowData);
                    }
                }
                this.loading6 = false;
                this.$nextTick(function () {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="detail-table"] tr td[cell]', _self.profitInfoGrid);
                });
            },
            //盈亏明细界面日期选择触发此事件
            changeYieldDetail: function ($event) {
                var ele = $event.currentTarget;
                $(ele).addClass("sel").siblings().removeClass("sel");
                var scode = this.$store.state.selectGroup.id;
                var selectedDate = $(ele).attr("value");
                this.profitInfoFun(scode, selectedDate);
                this.$store.commit(moduleName + '/initProfitInfo');
            }
        }

    }

</script>
<style scoped>
    .profitdrag .table-common {
        width: 100%;
    }
    @import "./../../styles/default1/TabClass/profitAndLoss.css";
</style>
