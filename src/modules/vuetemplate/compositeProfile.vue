<template src="../html/compositeProfile.html"></template>
<script>
    import {mapState} from 'vuex';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'compositeProfile';

    /**
     * 定义基础全局变量
     * @type {{basicInfo: {}, fundIndexs: {}, riskIndexs: {}, gains: {}}}
     */
    var compositeArray = {basicInfo: {}, fundIndexs: {}, riskIndexs: {}, gains: {}}, utils = $.pasUtils(),
        compositeProfileChartData;

    export default {
        name: 'compositeProfile',
        data() {
            return {
                activated: true,
                loading1: true,
                loading2: true,
                loading3: true,
                // 总收益loading
                loading4: true,
                // 净值走势loading
                loading5: true,
                dataSetSource: {
                    data: []
                },
            }
        },
        computed: mapState(moduleName, {
            basicInfo: state => state.basicInfo,
            fundIndexs: state => state.fundIndexs,
            riskIndexs: state => state.riskIndexs,
            gains: state => state.gains,
            echartConfig: state => state.echartConfig,
        }),
        mounted() {
            console.time("组合概貌请求时间");
            this.loadData();
            console.timeEnd("组合概貌请求时间")
        },
        activated() {
            this.activated = true;
            if (this.chart && this.chart.length > 0) {
                this.chart.forEach(function (val) {
                    setTimeout(val.resize, 0);
                })
            }
        },
        deactivated() {
            this.activated = false;
        },
        methods: {
            /**
             * 初始化表格数据
             * @param scode
             */
            loadData(scode) {
                var scode = scode || this.$store.state.selectGroup.id;
                this.loading1 = true;
                this.loading2 = true;
                this.loading3 = true;
                this.loading4 = true;
                //获取数据
                var scope = this;
                for (var key in compositeArray) {
                    compositeArray[key] = og.views.analytics.griddata.loadGridData({
                        name: og.api.rest.views.parame.compositeProfile[key],
                        requestParam: {
                            portfolio: scode
                        },
                        otherParam: {
                            visibleArea: utils.getDefaultVisibleArea(),
                            isDepgraph: true
                        },
                        metaHandle: null,
                        dataHandle: function (result) {
                            var result_s = eval(result), objField = result_s[0], objValue = result_s[2][0].cells;
                            //基本特征
                            for (var fieldNum = 1; fieldNum < objField.length; fieldNum++) {
                                var colName = objField[fieldNum], colValue = objValue[fieldNum - 1];
                                if (colName == colValue.col_name) {
                                    //基本特征
                                    if ($.inArray('Share', objField) != -1) {
                                        scope.$set(scope.basicInfo, colName, colValue);
                                        scope.loading1 = false;
                                    } else if ($.inArray('PE', objField) != -1) {
                                        scope.$set(scope.fundIndexs, colName, colValue);
                                        scope.loading2 = false;
                                    } else if ($.inArray('Normal Var', objField) != -1) {
                                        scope.$set(scope.riskIndexs, colName, colValue);
                                        scope.loading3 = false;
                                    } else if ($.inArray('Total Return', objField) != -1) {
                                        scope.$set(scope.gains, fieldNum - 1, colValue);
                                        scope.loading4 = false;
                                    }
                                }
                            }
                        }
                    });
                    /**
                     * 用于根据表格中的单元格数据，绑定下钻事件
                     * @author mengjq@hundsun.com
                     * @date 20170922
                     */
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="' + key + '"] tr td[cell]', compositeArray[key]);
                    if (key === 'gains') {
                        new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="return"] tr td span[cell]', compositeArray[key]);
                    }
                }
                //初始化表格
                this.initChartData(scode);
            },
            /**
             * 初始化图表数据
             * @param scode
             */
            initChartData(scode) {
                this.loading5 = true;
                this.dataSetSource.data = [];
                compositeProfileChartData = og.views.analytics.griddata.loadChartData({
                    name: og.api.rest.views.parame.compositeProfile.historicalNetWorth,
                    requestParam: {
                        portfolio: scode
                    },
                    otherParam: {
                        lineNum: 2
                    },
                    titleHandle: (data) => {
                        this.chart[0].setOption({
                            legend: {
                                data: [{name: '沪深300'}, {name: data}]
                            },
                            series: [{name: '沪深300', type: 'line'}, {name: data, type: 'line'}]
                        });
                    },
                    dataHandle: ((data) => {
                        if (data != '') {
                            var seriesDataLgt = data.timeseries.data.length, $time = new Array(seriesDataLgt),
                                $value = new Array(seriesDataLgt);
                            this.dataSetSource.data[(data.num == 2) ? 0 : 1] = data.timeseries.data.reduce(function (a, b, c) {
                                if (b == null) {
                                    return a;
                                }
                                a.time[c] = new Date(b[0]).Format("yyyy-MM-dd"), a.value[c] = b[1];
                                return a;
                            }, {time: $time, value: $value});

                            if (this.dataSetSource.data.length == 2) {
                                setTimeout(() => {
                                    var a = this.dataSetSource.data[0];
                                    var b = this.dataSetSource.data[1];
                                    var a_max = Math.max.apply(Math, a.value);
                                    var a_min = Math.min.apply(Math, a.value);
                                    var b_max = Math.max.apply(Math, b.value);
                                    var b_min = Math.min.apply(Math, b.value);
                                    this.chart[0].setOption({
                                        xAxis: {
                                            data: (a.time || b.time)
                                        },
                                        yAxis: [{
                                            max: a_max,
                                            min: a_min,
                                            interval: (a_max - a_min) / 5
                                        }, {
                                            max: b_max,
                                            min: b_min,
                                            interval: (b_max - b_min) / 5
                                        }],
                                        // dataset: [{source: a.value}, {source: b.value}],
                                        series: [{
                                            type: 'line',
                                            data: a.value
                                        }, {
                                            type: 'line',
                                            // datasetIndex: 1
                                            data: b.value,
                                            yAxisIndex: 1
                                        }]
                                    });
                                }, 0);
                            }
                        }
                        this.loading5 = false;
                    })
                });
                this.setChartPortfolioId(scode);
            },
            /**
             * 用于提供给图表下钻时内部变量使用
             * @returns {string}
             */
            setChartPortfolioId() {
                self.top.portfolioId = this.$store.state.selectGroup.id;
            }
        }
    }

</script>
<style scoped>
    @import "./../../styles/default1/TabClass/compositeProfile.css";
    .compsite_w .table-common .border_r {
        width: 120px;
    }
</style>