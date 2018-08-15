<template src="../html/attriBution.html"></template>
<script>
    import {mapState} from 'vuex';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'attribution';

    //初始化
    var basicInfo = null,
        pieChartData = null;
    var utils = $.pasUtils(), numberUtil = $.numberUtils();
    var numberTrimList = [',', '%'];
    let _self;

    export default {
        name: 'attribution',
        data() {
            return {
                date: '',
                activated: true,
                loading1: null,
                loading2: null
            }
        },
        computed: mapState(moduleName, {
            basicInfo: state => state.basicInfo,
            echartConfig: state => state.echartConfig
        }),
        created() {
            _self = this;
        },
        mounted() {
            this.loadData();
            //窗口缩放事件
            $(window).on("resize", function () {
                if (basicInfo && this.activated) {
                    var reDrawWindow = $($element.find(".table-panel-1")[0]);
                    basicInfo.elements = {
                        height: reDrawWindow.height(),
                        width: reDrawWindow.width(),
                        scrollHeight: reDrawWindow.scrollHeight || 0,
                        scrollWidth: reDrawWindow.scrollWidth || 0,
                        scrollTop: reDrawWindow.scrollTop()
                    }
                    basicInfo.resize();
                }
            });
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
            //归因分析表格数据请求
            basicInfoFun(nodeId, dataTime) {
                this.loading1 = true;
                basicInfo = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.attriBution.basicInfo,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: /*utils.getVisibleArea(".attri_table")*/{
                            width: 1000,
                            height: (25 * 16),
                            scrollTop: 0,
                            scrollLeft: 0
                        },
                        isDepgraph: true
                    },
                    metaHandle: function (metadata) {
                        _self.$store.commit({
                            type: moduleName + '/setBasicInfo',
                            newVal: metadata
                        });
                    },
                    dataHandle: this.handleBasicInfoData
                });
            },
            //归因分析表格数据获取
            handleBasicInfoData(result) {
                if ($.isArray(result)) { //判断接收的数据是否是数组
                    //读取Name行对应的Default行记录数据
                    var nameValue = result[1], targetValue = result[2];
                    //遍历数据条数
                    for (var cellNum = 0; cellNum < targetValue.length; cellNum++) {
                        var cellValue = targetValue[cellNum].cells, subBasicInfo = {};
                        subBasicInfo.industryName = nameValue[cellNum].cells[0].dataRow + nameValue[cellNum].cells[0].value;
                        //遍历数据列数
                        for (var cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                            subBasicInfo[cellValue[cellValNum].col_name] = cellValue[cellValNum];
                        }
                        var combination_weight = (subBasicInfo['Average Weight'].value == '' ? '--' : subBasicInfo['Average Weight'].value).indexOf('%'),
                            base_weight = (subBasicInfo['Bench Average Weight'].value == '' ? '--' : subBasicInfo['Bench Average Weight'].value).indexOf('%'),
                            combination_yield = (subBasicInfo['Total Yield'].value == '' ? '--' : subBasicInfo['Total Yield'].value).indexOf('%'),
                            base_yield = (subBasicInfo['Bench Total Yield'].value == '' ? '--' : subBasicInfo['Bench Total Yield'].value).indexOf('%'),
                            combination_profit = (subBasicInfo['Investment Return Contribution'].value == '' ? '--' : subBasicInfo['Investment Return Contribution'].value).indexOf('%'),
                            base_profit = (subBasicInfo['Bench Return Contribution'].value == '' ? '--' : subBasicInfo['Bench Return Contribution'].value).indexOf('%');
                        if (combination_weight > -1 && base_weight > -1) {
                            subBasicInfo['mean_weight'] = (numberUtil.convertNumber(subBasicInfo['Average Weight'].value, numberTrimList) - numberUtil.convertNumber(subBasicInfo['Bench Average Weight'].value, numberTrimList)).toFixed(2) + '%';
                        } else {
                            subBasicInfo['mean_weight'] = '--';
                        }
                        if (combination_yield > -1 && base_yield > -1) {
                            subBasicInfo['overful_yield'] = (numberUtil.convertNumber(subBasicInfo['Total Yield'].value, numberTrimList) - numberUtil.convertNumber(subBasicInfo['Bench Total Yield'].value, numberTrimList)).toFixed(2) + '%';
                        } else {
                            subBasicInfo['overful_yield'] = '--';
                        }
                        if (combination_profit > -1 && base_profit > -1) {
                            subBasicInfo['overful_profit'] = (numberUtil.convertNumber(subBasicInfo['Investment Return Contribution'].value, numberTrimList) - numberUtil.convertNumber(subBasicInfo['Bench Return Contribution'].value, numberTrimList)).toFixed(2) + '%';
                        } else {
                            subBasicInfo['overful_profit'] = '--';
                        }
                        //将数据对象绑定到basicInfo对象中
                        this.$set(this.basicInfo, targetValue[cellNum].data_row, subBasicInfo);
                    }
                }
                this.loading1 = false;
		        this.$nextTick(function () {
                    new com.hundsun.pas.common.gadgets.CellMenu('table tr td[cell].right', basicInfo);
                });
            },

            //行业配置数据请求
            pieChartDataFun(nodeId, dataTime) {
                this.loading2 = true;
                pieChartData = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.attriBution.pieChartData,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dataTime
                    },
                    otherParam: {
                        visibleArea: {
                            width: 1000,
                            height: (25 * 16),
                            scrollTop: 0,
                            scrollLeft: 0
                        }
                    },
                    metaHandle: null,
                    dataHandle: this.handlePieChartData
                });
            },
            //行业配置数据获取
            handlePieChartData(result) {
                var result_s = eval(result);
                var seriesData = [], legendData = [];
                for (var i = 1; i < result_s.length; i++) {
                    var obj = result_s[i],
                        name = obj.Name,
                        str_name = name.lastIndexOf('&nbsp;'),
                        pie_name = name.substring(str_name + 6),
                        val = obj.scroll[0].value;
                    legendData[i - 1] = pie_name;
                    seriesData[i - 1] = {
                        name: pie_name,
                        value: val.indexOf('-') > -1 ? -Number(val.replace('%', '')) : Number(val.replace('%', ''))
                    };
                }
                this.pieChartDataSet(legendData, seriesData);
            },
            //图表数据展示
            pieChartDataSet(legendData, seriesData) {
                this.chart[0].setOption({
                    legend: {
                        data: legendData
                    },
                    series: [{
                        data: seriesData
                    }]
                })
                this.loading2 = false;
            },
            //离开当前页面时销毁当前页面正在加载的数据
            destroy() {
                //切换页面时暂停或销毁上一次正在计算
                if (basicInfo) {
                    basicInfo.kill();
                }
            },
            //日期切换
            changeTime($event) {
                var ele = $event.target;
                $(ele).addClass("sel").siblings().removeClass("sel");
                var param = $(ele).attr("value");
                this.loadData(null, param);
                _self.$store.commit(moduleName + '/initBasicInfo');
                this.date = param;
            },
            //获取数据入口
            loadData(portId, dateTime) {
                var scode = portId || this.$store.state.selectGroup.id;
                if (dateTime == "changePrt") {
                    dateTime = $('.sel').attr("value");
                }
                //切换页面时暂停或销毁上一次正在计算
                this.destroy();
                if (dateTime == undefined) {
                    $('.attriChangeTime li').removeClass('sel');
                    $('.attriChangeTime li').eq(0).addClass('sel');
                }
                $('.OG-cell-options').remove();
                this.basicInfoFun(scode, dateTime || '0');
                var that = this;
                setTimeout(function () {
                    that.pieChartDataFun(scode, dateTime || '0');
                }, 500);
            }
        }

    }

</script>
<style scoped>
    @import "./../../styles/default1/TabClass/attriBution.css";
</style>
