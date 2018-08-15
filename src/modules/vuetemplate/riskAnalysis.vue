<template src="../html/riskAnalysis.html"></template>
<script>
    import {mapState} from 'vuex';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'riskAnalysis';

    var riskInfoGrid = null, varRankGrid = null;
    var utils = $.pasUtils();
    var _self;
    export default {
        name: "riskAnalysis",
        data() {
            return {
                lineNum: 0,
                data: '',
                // 指示当前页面处于激活还是离开状态
                activated: true,
                loading1: null,
                loading2: null,
                loading3: null
            }
        },
        computed: mapState(moduleName, {
            riskRankNotice: state => state.riskRankNotice,
            riskInfo: state => state.riskInfo,
            echartConfig1: state => state.echartConfig1,
            echartConfig2: state => state.echartConfig2,
            echartConfig3: state => state.echartConfig3
        }),
        created() {
            _self = this;
        },
        mounted() {
            this.loadData();
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
        },
        methods: {
            loadData: function (portId, dateTime) {
                var scode = portId || this.$store.state.selectGroup.id;
                this.destroy();
                if (dateTime == undefined) {
                    $('.riskChangeTime li').removeClass('sel');
                    $('.riskChangeTime li').eq(0).addClass('sel');
                }
                var $scope = this;
                setTimeout(function () {
                    $scope.retreatEchartData.call($scope, scode, dateTime || '1');
                }, 0);
                setTimeout(function () {
                    $scope.valueListFun(scode, dateTime || '1');
                }, 300);
                setTimeout(function () {
                    $scope.varRank(dateTime || '1');
                },0);
                //点击不同日期显示该日期名字
                var dateData = ['近一周', '近一个月', '近一个季度', '近半年', '近一年', '今年'];
                this.riskInfo.times = dateData[dateTime - 1 || 0];
            },
            destroy: function () {
                if (riskInfoGrid) {
                    riskInfoGrid.kill();
                }
            },
            retreatEchartData: function (nodeId, dateTime) {
                this.lineNum = 0;
                this.loading1 = true;
                this.loading2 = true;
                this.loading3 = true;
                if (nodeId && og.analytics.echart.line) {
                    var _$lineNum = og.analytics.echart.line.length;
                    while (_$lineNum-- > 1) {
                        og.analytics.echart.line[_$lineNum].kill();
                    }
                }
                og.analytics.echart.line = [];
                var $scope = this;
                while (this.lineNum++ < 6) {
                    //获取序列值请求部分
                    og.analytics.echart.line[this.lineNum] = new og.analytics.echart.Line({
                        source: og.api.rest.views.parame.xhrArgs(og.api.rest.views.parame.riskAnalysis['retreatEchartData'], {
                            portfolio: nodeId,
                            calcTimeParam: dateTime
                        }),
                        config: {
                            scope: $scope,
                            lineNum: $scope.lineNum
                        }
                    }).on('title', function (result) {}, $scope)
                        .on('data', $scope.loadLineData, $scope);
                }
            },
            loadLineData: function (data) {
                if (data instanceof Object) {
                    var seriesDataLgt = data.timeseries.data.length, $time = new Array(seriesDataLgt),
                        $value = new Array(seriesDataLgt);
                    data.timeseries.data.reduce(function (a, b, c) {
                        if (b == null) {
                            return a;
                        }
                        a.$time[c] = new Date(b[0]).Format("yyyy-MM-dd"), a.$value[c] = b[1];
                        return a;
                    }, {$time: $time, $value: $value});

                    //第一个图表x轴和series数据获取
                    if (data.num == 2) {
                        this.chart[0].setOption({
                            xAxis: [{
                                data: $time
                            }],
                            series: [{
                                data: $value
                            }]
                        });
                        this.loading1 = false;
                    } else if (data.num == 3) {
                        //第二个图表x轴和series数据获取
                        this.chart[1].setOption({
                            xAxis: [{
                                data: $time
                            }],
                            series: [{
                                data: $value
                            }]
                        });
                        this.loading2 = false;
                    } else {
                        //第三个图表x轴和series数据获取
                        this.chart[2].setOption({
                            xAxis: [{
                                data: $time
                            }],
                            series: [{
                                data: $value
                            }]
                        });
                        this.loading3 = false;
                    }
                    var $scope = this;
                    setTimeout(function () {
                        var max, min, interval;
                        max = Math.max.apply(Math, $value);
                        min = Math.min.apply(Math, $value);
                        if (max == min) {
                            if (max === 0) {
                                min = -0.1;
                                max = 0.5
                            } else {
                                max = max > 0 ? max * 1.1 : max * 0.9;
                                min = min > 0 ? min * 0.9 : min * 1.1;
                            }
                        } else {
                            max = max > 0 ? max * 1.1 : max * 0.9;
                            min = min > 0 ? min * 0.9 : min * 1.1;
                        }
                        interval = (max - min) / 6;
                        if (data.num == 2) {
                            $scope.chart[0].setOption({
                                yAxis: [{
                                    axisLabel: {
                                        formatter: function (val) {
                                            return val.toFixed(4);
                                        }
                                    },
                                    max: max,
                                    min: min,
                                    interval: interval
                                }]
                            });
                        } else if (data.num == 3) {
                            $scope.chart[1].setOption({
                                yAxis: [{
                                    axisLabel: {
                                        formatter: function (val) {
                                            return val.toFixed(4);
                                        }
                                    },
                                    max: max,
                                    min: min,
                                    interval: interval
                                }]
                            })
                            //获取单日最大亏损
                            $scope.riskInfo.loss = (Math.min.apply(Math, $value)).toString();
                        } else if (data.num == 6) {
                            $scope.chart[2].setOption({
                                yAxis: [{
                                    axisLabel: {
                                        formatter: function (val) {
                                            return (100 * Number(val)).toFixed(4) + '%';
                                        }
                                    },
                                    max: max,
                                    min: min,
                                    interval: interval
                                }]
                            })
                        }
                    }, 200);
                }
            },
            valueListFun: function (nodeId, dataTime) {
                var $scope = this;
                riskInfoGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.riskAnalysis.valueList,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: utils.getDefaultVisibleArea()
                    },
                    metaHandle: null,
                    dataHandle: $scope.handleValueListData
                });
            },
            handleValueListData: function (result) {
                let result_s = eval(result);
                let scroll = result_s[0].scroll;
                for (let i = 0; i < scroll.length; i++) {
                    let col = scroll[i];
                    if (col.type != 'TIME_SERIES') {
                        this.riskInfo[col.col_name] = col.value;
                    }
                }
                if (this.riskInfo.loss == '--' || this.riskInfo.loss == undefined || this.riskInfo.loss == null) {
                    this.riskInfo.loss = '0.00';
                }
            },
            varRank: function (dataTime) {
                varRankGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.riskAnalysis.varRank,
                    requestParam: {
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: {
                            height: 200,
                            width: 200,
                            scrollHeight:  0,
                            scrollWidth: 0,
                            scrollTop: 1,
                            scrollLeft: 1
                        }
                    },
                    metaHandle: null,
                    dataHandle: this.handleVaRRank
                });
            },
            handleVaRRank: function (result) {
                var result_s = eval(result);
                var scode = this.$store.state.selectGroup.id;
                for (var i = 1; i < result_s.length; i++) {
                    if (scode == result_s[i]['nodeId']) {
                        var varRank = result_s[i].scroll[0].value;
                        varRank = varRank.substr(0, varRank.length);
                        varRank = parseFloat(varRank);
                        //25%，50%，75%，低，中，较高，高，4个等级进行排名
                        if (varRank - 75 >= 0) {
                            this.riskRankNotice.notice = "风险偏高";
                        } else if (varRank - 50 >= 0) {
                            this.riskRankNotice.notice = "风险较高";
                        } else if (varRank - 25 >= 0){
                            this.riskRankNotice.notice = "风险适中";
                        } else {
                            this.riskRankNotice.notice = "风险偏低";
                        }
                        break;
                    }
                }
            },
            changeTime: function (event) {
                var ele = event.currentTarget;
                $(ele).addClass("sel").siblings().removeClass("sel");
                var param = $(ele).attr("value");
                // 清空数据
                this.$store.commit(moduleName + '/initRiskInfo');
                this.$store.commit(moduleName + '/initRiskRankNotice');
                this.loadData(null, param);
                this.date = param;
            }
        }
    }

</script>
<style scoped>
    @import "./../../styles/default1/TabClass/riskAnalysis.css";
</style>
