<template src="../html/siloAnalysis.html"></template>
<script>
    import {mapState} from 'vuex';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'siloAnalysis';

    var siloInfo, dailyExchangeRate, awkwardnessBuy, awkwardnessSell, heavyIndustryYield, heavyIndustryLoss;
    var utils = $.pasUtils();
    var common = $.common();
    var numberUtils = $.numberUtils();
    var _self;

    export default {
        name: "siloAnalysis",
        data() {
            return {
                fivedealInfoGrid: null,
                adjustedInfoGrid: null,
                date: '',
                loading1: null,
                loading2: null,
                // 买卖明细表格loading
                loading3: null,
                // 调仓收益明细表格loading
                loading4: null,
                /*调仓收益总体分析（文字部分）loading*/
                loading5: null,
                /*日均换手率loading*/
                loading6: null
            }
        },
        computed: {
            ...mapState(moduleName, {
                awkwardness: state => state.awkwardness,
                heavyIndustry: state => state.heavyIndustry,
                fivedealInfo: state => state.fivedealInfo,
                adjustedInfo: state => state.adjustedInfo,
                siloInfo: state => state.siloInfo,
                dailyExchangeRate: state => state.dailyExchangeRate
            })
        },
        created() {
            _self = this;
        },
        mounted() {
            this.loadData();
            this.bindListenerOnModal('.fivedrag', this.btnfiveClick, null, this);
            this.bindListenerOnModal('.silodrag', this.btnadjClick, null, this);
        },
        destroyed() {
            this.destroy();
            $('.OG-cell-options').remove();
        },
        methods: {
            //调仓收益总体分析（文字部分）数据请求
            siloInfoFun(nodeId, dateTime) {
                this.loading5 = true;
                siloInfo = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.siloAnalysis.siloInfo,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".silo_w")
                    },
                    metaHandle: null,
                    dataHandle: this.handleSiloInfoData
                });
            },
            //调仓收益总体分析（文字部分）数据获取
            handleSiloInfoData(result) {
                var result_s = eval(result);
                var scroll = result_s[0].scroll;
                for (let i = 0; i < scroll.length; i++) {
                    let col = scroll[i];
                    this.siloInfo[col.col_name] = col.value;
                }
                this.loading5 = false;
            },
            //日均换手率数据请求
            dailyExchangeRateFun(nodeId, dateTime) {
                this.loading6 = true;
                dailyExchangeRate = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.siloAnalysis.dailyExchangeRate,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: utils.getDefaultVisibleArea()
                    },
                    metaHandle: null,
                    dataHandle: this.handledailyExchangeRateData
                });
            },
            //日均换手率数据获取
            handledailyExchangeRateData(result) {
                var result_s = eval(result);
                var obj = result_s[0].scroll[0];
                if (obj.col_name == 'Daily Exchange Rate' && parseFloat(obj.value) == 0) {
                    this.dailyExchangeRate.value = obj.value;
                    this.dailyExchangeRate.transValue = '999+';
                } else {
                    this.dailyExchangeRate.value = obj.value;
                    this.dailyExchangeRate.transValue = Math.ceil(1 / (parseFloat(obj.value) / 100));
                }
                this.loading6 = false;
            },
            //前5大买卖数据请求 买入前五
            awkwardnessBuyFun(nodeId, dateTime) {
                awkwardnessBuy = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.siloAnalysis.awkwardnessBuy,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".silo_table"),
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleAwkwardnessData
                });
            },
            //前5大买卖数据请求 卖出前五
            awkwardnessSellFun(nodeId, dateTime) {
                awkwardnessSell = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.siloAnalysis.awkwardnessSell,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".silo_table"),
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleAwkwardnessData
                });
            },
            // 处理前五大买入/卖出数据
            handleAwkwardnessData(result) {
                if ($.isArray(result)) {
                    var colNameList = result[0];
                    var nameValue = result[1];
                    var targetValue = result[2];
                    for (var cellNum = 1; cellNum < targetValue.length; cellNum++) {
                        var obj = targetValue[cellNum].cells;
                        var cells = nameValue[cellNum].cells[0];
                        var rowData = this.awkwardness[cellNum - 1] || {};
                        // 判断是买入前五还是卖出前五
                        if ($.inArray('Buy Volume', colNameList) >= 0) {
                            rowData.name = cells.value;
                            rowData.securityId = cells.securityId;
                        } else {
                            rowData.name_sell = cells.value;
                            rowData.securityId_sell = cells.securityId;
                        }
                        for (var cellValueNum = 0; cellValueNum < obj.length; cellValueNum++) {
                            rowData[obj[cellValueNum].col_name] = obj[cellValueNum];
                        }
                        this.$set(this.awkwardness, cellNum - 1, rowData);
                    }
                    this.loading1 = false;
                }
                if ($.inArray('Buy Volume', colNameList) >= 0) {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="pre_buy"] tr td[cell].buy_td', awkwardnessBuy);
                } else {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="pre_buy"] tr td[cell].sell_td', awkwardnessSell);
                }
            },
            //调仓收益数据请求 盈利前五
            heavyIndustryYieldFun(nodeId, dateTime) {
                heavyIndustryYield = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.siloAnalysis.heavyIndustryYield,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".silo_table"),
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleHeavyIndustryData
                });
            },
            //调仓收益数据请求 亏损前五
            heavyIndustryLossFun(nodeId, dateTime) {
                heavyIndustryLoss = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.siloAnalysis.heavyIndustryLoss,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".silo_table"),
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleHeavyIndustryData
                });
            },
            //调仓收益数据获取
            handleHeavyIndustryData(result) {
                if ($.isArray(result)) {
                    var nameValue = result[1];
                    var targetValue = result[2];
                    // 盈利前五为true,亏损前五为false
                    var flag;
                    // 当第一行的'Trade PnL'数据无法判断正负，循环下去
                    for (var j = 0; j < targetValue.length; j++) {
                        var tmp = targetValue[j].cells;
                        // 一般情况下'Trade PnL'都在cells数组的最后一个，所以倒序遍历
                        for (var i = tmp.length - 1; i >= 0; i--) {
                            if (tmp[i].col_name === 'Trade PnL') {
                                var strValue = tmp[i].value;
                                // 验证value是否是合法数字(可能会是'Missing inputs'等)
                                if (numberUtils.validateNumber(null, strValue)) {
                                    // 转换为Number类型以后判断是否为正数
                                    if (numberUtils.convertNumber(strValue, ',') > 0) {
                                        flag = true;
                                    } else {
                                        flag = false;
                                    }
                                }
                                break;
                            }
                        }
                        // 当做出判断时跳出循环
                        if (flag != undefined || flag != null) {
                            break;
                        }
                    }

                    for (var cellNum = 1; cellNum < targetValue.length; cellNum++) {
                        var obj = targetValue[cellNum].cells;
                        var cells = nameValue[cellNum].cells[0];
                        var rowData = this.heavyIndustry[cellNum - 1] || {};
                        if (flag) {
                            rowData.name = cells.value;
                            rowData.securityId = cells.securityId;
                            for (var cellValueNum = 0; cellValueNum < obj.length; cellValueNum++) {
                                rowData[obj[cellValueNum].col_name] = obj[cellValueNum];
                            }
                        } else {
                            rowData.name_loss = cells.value;
                            rowData.securityId_loss = cells.securityId;
                            for (var cellValueNum = 0; cellValueNum < obj.length; cellValueNum++) {
                                rowData[obj[cellValueNum].col_name + '_loss'] = obj[cellValueNum];
                            }
                        }
                        this.$set(this.heavyIndustry, cellNum - 1, rowData)
                    }
                }
                this.loading2 = false;
                if (flag) {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="adjust_table"] tr td[cell].profit_td', heavyIndustryYield);
                } else {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="adjust_table"] tr td[cell].loss_td', heavyIndustryLoss);
                }
            },
            //买卖明细表格数据请求
            fivedealInfoFun(nodeId, dateTime) {
                this.loading3 = true;
                this.fivedealInfoGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.siloAnalysis.fivedealInfo,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".fivedrag .detail_table"),
                        isDepgraph: true
                    },
                    metaHandle: function (metadata) {
                        _self.$store.commit({
                            type: moduleName + '/setFivedealInfo',
                            newVal: metadata
                        });
                    },
                    dataHandle: this.handleFivedealInfoData
                });
            },
            //买卖明细表格数据获取
            handleFivedealInfoData(result) {
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
                        this.$set(this.fivedealInfo, targetValue[cellNum].data_row, rowData);
                    }
                }
                this.loading3 = false;
                this.$nextTick(function () {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="detail_buy"] tr td[cell]', _self.fivedealInfoGrid);
                });
            },
            //调仓明细表格数据请求
            adjustedInfoFun(nodeId, dateTime) {
                this.loading4 = true;
                this.adjustedInfoGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.siloAnalysis.adjustedInfo,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".silodrag .detail_table"),
                        isDepgraph: true
                    },
                    metaHandle: function (metadata) {
                        _self.$store.commit({
                            type: moduleName + '/setAdjustedInfo',
                            newVal: metadata
                        });
                    },
                    dataHandle: this.handleAdjustedInfoData
                });
            },
            //调仓明细表格数据获取
            handleAdjustedInfoData(result) {
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
                        this.$set(this.adjustedInfo, targetValue[cellNum].data_row, rowData);
                    }
                    this.loading4 = false;
                    this.$nextTick(function () {
                        new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="detail_silo"] tr td[cell]', _self.adjustedInfoGrid);
                    });
                }
            },
            bindListenerOnModal(selector, cb1, cb2, context) {
                if (selector) {
                    $(selector).on('shown.bs.modal', function () {
                        if (cb1 && $.isFunction(cb1)) {
                            cb1.call(context);
                        }
                    });
                    $(selector).on('hide.bs.modal', function () {
                        $('.OG-cell-options').hide();
                        if (cb2 && $.isFunction(cb2)) {
                            cb2.call(context);
                        }
                    });
                }
            },
            //前5大买卖明细按钮绑定弹窗
            btnfiveClick() {
                //请求前先清除缓存
                this.$store.commit(moduleName + '/initFivedealInfo');
                //设定窗口显示隐藏
                let selectedDate = $('.fivedrag ul>li.sel').val() + '';
                let nodeId = this.$store.state.selectGroup.id;
                this.fivedealInfoFun(nodeId, selectedDate || '0');
                $('.OG-cell-options').hide();
            },
            // 收益明细按钮绑定弹窗
            btnadjClick() {
                //请求前先清除缓存
                this.$store.commit(moduleName + '/initAdjustedInfo');
                //设定窗口显示隐藏
                var selectedDate = $('.silodrag ul>li.sel').val() + '';
                var nodeId = this.$store.state.selectGroup.id;
                this.adjustedInfoFun(nodeId, selectedDate || '0');
                $('.OG-cell-options').hide();
            },
            // 前五大买卖明细数据树展开或收缩
            addFiveVisit(event) {
                var $target = $(event.target), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                if (_$start && _$end) {
                    this.fivedealInfoGrid.busy(true);
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $itemSplice = "this.fivedealInfo.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $itemSplice = $itemSplice.concat(",empty");
                    }
                    $itemSplice = $itemSplice + ")";
                    eval("(" + $itemSplice + ")");
                    if (this.fivedealInfoGrid.resize(_$start)) {
                        this.fivedealInfoGrid.busy(false);
                    }
                    return;
                } else if (/data-row/g.test($target.html())) {
                    $target = $($target.html().replace(/&nbsp;/g, '')), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                    this.fivedealInfoGrid.busy(true);
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $itemSplice = "this.fivedealInfo.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $itemSplice = $itemSplice.concat(",empty");
                    }
                    $itemSplice = $itemSplice + ")";
                    eval("(" + $itemSplice + ")");
                    if (this.fivedealInfoGrid.resize(_$start)) {
                        this.fivedealInfoGrid.busy(false);
                    }
                    return;
                } else {
                    var sCode = $target.attr('securityid');
                    var sName = $target.html().replace(/&nbsp;/g, '')
                    if (!sCode) {
                        return;
                    } else {
                        // 在跳转前手动关闭模态框
                        $('.fivedrag').modal('hide');
                        common.reqLastVisit(sCode, sName, 2, 'recent', this.$router);
                    }
                }
            },
            // 调仓明细数据树展开或收缩
            addVisit(event) {
                var $target = $(event.target), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                if (_$start && _$end) {
                    this.adjustedInfoGrid.busy(true);
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $itemSplice = "this.adjustedInfo.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $itemSplice = $itemSplice.concat(",empty");
                    }
                    $itemSplice = $itemSplice + ")";
                    eval("(" + $itemSplice + ")");
                    if (this.adjustedInfoGrid.resize(_$start)) {
                        this.adjustedInfoGrid.busy(false);
                    }
                    return;
                } else if (/data-row/g.test($target.html())) {
                    $target = $($target.html().replace(/&nbsp;/g, '')), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                    this.adjustedInfoGrid.busy(true);
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $itemSplice = "this.adjustedInfo.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $itemSplice = $itemSplice.concat(",empty");
                    }
                    $itemSplice = $itemSplice + ")";
                    eval("(" + $itemSplice + ")");
                    if (this.adjustedInfoGrid.resize(_$start)) {
                        this.adjustedInfoGrid.busy(false);
                    }
                    return;
                } else {
                    var sCode = $target.attr('securityid');
                    var sName = $target.html().replace(/&nbsp;/g, '')
                    if (!sCode) {
                        return;
                    } else {
                        // 在跳转前手动关闭模态框
                        $('.silodrag').modal('hide');
                        common.reqLastVisit(sCode, sName, 2, 'recent', this.$router);
                    }
                }
            },
            //页面显示部分日期切换
            changeTime($event) {
                var ele = $event.target;
                $(ele).addClass("sel").siblings().removeClass("sel");
                var selectedDate = $(ele).attr('value');
                var text = $(ele).text();
                this.loadData(null, selectedDate);
                this.siloInfo.silo_round = text;
                this.date = selectedDate;
            },
            // 前五大买卖明细页面更换时间时加载
            changeFiveBuyOrSell($event) {
                var ele = $event.target;
                $(ele).addClass("sel").siblings().removeClass("sel");
                var selectedDate = $(ele).attr('value');
                var scode = this.$store.state.selectGroup.id;
                this.fivedealInfoFun(scode, selectedDate);
                // 清除表格缓存
                this.$store.commit(moduleName + '/initFivedealInfo');
            },
            // 调仓收益明细页面更换时间时加载
            changeYieldDetail($event) {
                var ele = $event.target;
                $(ele).addClass("sel").siblings().removeClass("sel");
                var selectedDate = $(ele).attr("value");
                var scode = this.$store.state.selectGroup.id;
                this.adjustedInfoFun(scode, selectedDate);
                // 清除表格缓存
                this.$store.commit(moduleName + '/initAdjustedInfo');
            },
            //获取数据入口
            loadData(portId, dateTime) {
                let _self = this;
                var scode = portId || this.$store.state.selectGroup.id;
                if (dateTime == "changePrt") {
                    dateTime = $('.siloChangeTime .sel').attr("value");
                }
                //加载前如果没有给dateTime赋值，就默认值是第一个日期时间
                if (dateTime == undefined) {
                    $('.siloChangeTime li').removeClass('sel');
                    $('.siloChangeTime li').eq(0).addClass('sel');
                    $('.fivedragRecentime li').removeClass('sel');
                    $('.fivedragRecentime li').eq(0).addClass('sel');
                    $('.siloRecentime li').removeClass('sel');
                    $('.siloRecentime li').eq(0).addClass('sel');
                }

                // 显示加载遮罩层
                this.loading1 = true;
                this.loading2 = true;
                if ($('.fivedrag').is(":visible")) { //可见
                    var currentSelectDate = $('.fivedrag').find('ul>li.sel').val() + '';
                    this.fivedealInfoFun(scode, currentSelectDate || '0');
                } else if ($('.silodrag').is(":visible")) {
                    var currentSelectDate = $('.silodrag').find('ul>li.sel').val() + '';
                    this.adjustedInfoFun(scode, currentSelectDate || '0');
                } else {
                    //首行文字部分
                    this.siloInfoFun(scode, dateTime || '0');
                    //日均换手率
                    setTimeout(function () {
                        _self.dailyExchangeRateFun(scode, dateTime || '0');
                    }, 500);
                    //买入前五
                    this.awkwardnessBuyFun(scode, dateTime || '0');
                    //卖出前五
                    setTimeout(function () {
                        _self.awkwardnessSellFun(scode, dateTime || '0');
                    }, 500);
                    //盈利前五
                    this.heavyIndustryYieldFun(scode, dateTime || '0');
                    //亏损前五
                    setTimeout(function () {
                        _self.heavyIndustryLossFun(scode, dateTime || '0');
                    }, 500);
                }
                // 清除缓存
                this.$store.commit(moduleName + '/initAwkwardness');
                this.$store.commit(moduleName + '/initHeavyIndustry');
            },
            // 切换页面时暂停或销毁上一次正在计算
            destroy() {
                if (siloInfo || dailyExchangeRate || awkwardnessBuy || awkwardnessSell || heavyIndustryYield || heavyIndustryLoss || this.fivedealInfoGrid || this.adjustedInfoGrid) {
                    siloInfo.kill();
                    dailyExchangeRate.kill();
                    awkwardnessBuy.kill();
                    awkwardnessSell.kill();
                    heavyIndustryYield.kill();
                    heavyIndustryLoss.kill();
                    if (this.fivedealInfoGrid) {
                        this.fivedealInfoGrid.kill();
                    }
                    if (this.adjustedInfoGrid) {
                        this.adjustedInfoGrid.kill();
                    }
                }
            },
        }
    }


</script>
<style scoped>
    .modal .table-common {
        width: 100%;
    }

    @import "./../../styles/default1/TabClass/siloAnalysis.css";
</style>