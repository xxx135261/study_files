<template src="../html/myCombination.html"></template>

<script>
    import {mapState} from 'vuex';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'myCombination';

    var basicInfo = null, stddev = [];
    var utils = $.pasUtils(), numberUtil = $.numberUtils();
    var numberTrimList = [',', '%'];
    var totalReturnArray = ['P1D', 'BP1D', 'P1M', 'BP1M', 'P1M', 'P1Y', 'BP1Y', 'P1Y'];
    var _self;

    export default {
        name: "myCombination",
        data() {
            return {
                timeOption: [{
                    value: '1',
                    name: '最近一周'
                }, {
                    value: '2',
                    name: '最近一月'
                }, {
                    value: '4',
                    name: '最近半年'
                }, {
                    value: '5',
                    name: '最近一年'
                }, {
                    value: '6',
                    name: '今年以来'
                }],
                // 被选中的组合，默认为全部“用户组合”
                selectedPort: 'AgPrt~UserPortfolios',
                selectedTime: '1',
                echartConfig: {
                    tooltip: {
                        //trigger: 'axis',
                        showDelay: 0,
                        formatter: function (params) {
                            if (params.value.length > 1) {
                                return params.seriesName + ' :<br/>' + params.value[0] + '% ' + params.value[1] + '% ';
                            } else {
                                return params.seriesName + ' :<br/>' + params.name + ' % ' + params.value + '%';
                            }
                        },
                        axisPointer: {
                            type: 'cross',
                            crossStyle: {
                                type: 'solid',
                                width: 1
                            }
                        }
                    },
                    grid: {
                        x: 90,
                        x2: 100
                    },
                    legend: {
                        data: ['']
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            dataView: {
                                readOnly: true,
                                iconStyle: {
			                       	normal: {
			                            borderColor:'#CCD8F0'
			                       	},
			                      	emphasis:{
			                            iconStyle: {
			                                borderColor: '#528DFF'
			                            },
			                        }
			                    },
                                optionToContent: function (opt) {
                                    var tabId = 'totalReturnChart';
                                    var table = '<table class="table table-bordered" tabid="' + tabId
                                        + '" id="' + tabId + '"><tbody></tbody></table>';
                                    var totalReturnChartData = og.views.analytics.griddata.loadGridData({
                                        name: og.api.rest.views.parame.myCombination.basicInfo,
                                        requestParam: {
                                            portfolio: _self.selectedPort
                                        },
                                        otherParam: {
                                            visibleArea: utils.getVisibleArea(".combin_wrap"),
                                            isDepgraph: true
                                        },
                                        metaHandle: null,
                                        dataHandle: function (result) {
                                            var fixedField = result[1], scrollField = result[2], fixedFieldLength = fixedField.length;
                                            var headField = '<tr>';
                                            // 组成表头(Name、Stddev、Year Over Return)
                                            headField += '<td>Name</td><td>Stddev</td><td>Year Over Return(Total Return P1Y - Total Return Bench P1Y)</td>';
                                            headField += '</tr>';
                                            for (var fixedFieldNum = fixedFieldLength > 1 ? 1 : 0; fixedFieldNum < fixedFieldLength; fixedFieldNum++) {
                                                headField += '<tr>';
                                                headField += '<td>' + fixedField[fixedFieldNum].cells[0].value + '</td>';
                                                var fieldValues = scrollField[fixedFieldNum].cells;
                                                var stddevCell = fieldValues[12];
                                                var stddev = stddevCell.value, totalReturnP1Y = fieldValues[5].value,
                                                    totalReturnBenchP1Y = fieldValues[6].value;
                                                var yearOverReturn;
                                                if (totalReturnP1Y && totalReturnBenchP1Y) {
                                                    yearOverReturn = (parseFloat(totalReturnP1Y) - parseFloat(totalReturnBenchP1Y)).toFixed(2) + '%';
                                                }
                                                headField += ('<td cell=\'' + JSON.stringify(stddevCell) + '\'>' + stddev + '</td>');
                                                headField += ('<td>' + yearOverReturn + '</td>');
                                                headField += '</tr>';
                                            }
                                            $("#" + tabId).html(headField);
                                            new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="' + tabId + '"] tr td[cell]', totalReturnChartData);
                                        }
                                    });
                                    return table;
                                }
                            },
                            // magicType: {type: ['line', 'bar']},
                            saveAsImage: {
                                name: '收益率-年化波动率',
                                iconStyle: {
			                       	normal: {
			                            borderColor:'#CCD8F0'
			                       	},
			                      	emphasis:{
			                            iconStyle: {
			                                borderColor: '#528DFF'
			                            },
			                        }
                    			},
                            }
                        },
                        right: '20px'
                    },
                    xAxis: [{
                        name: '年化波动率',
                        type: 'value',
                        scale: true,
                        axisLabel: {
                            formatter: '{value}.00 %'
                        }
                    }],
                    yAxis: [{
                        name: '收益率',
                        type: 'value',
                        scale: true,
                        axisLabel: {
                            formatter: '{value}.00 %'
                        }
                    }],
                    series: [{
                        name: '',
                        type: 'scatter',
                        data: [
                            ['']
                        ]
                    }]
                },
                activated: true,
                // 表格loading控制
                loading1: null,
                // 散点图loading控制
                loading2: null
            }
        },
        computed: mapState(moduleName, {
            basicInfo: state => state.basicInfo,
            optionInfo: state => state.optionInfo
        }),
        mounted() {
            _self = this;
            this.loadData();
        },
        activated() {
            this.activated = true;
            // 激活页面时手动触发图表resize
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
            //获取数据入口
            loadData(dateTime, option) {
                if (option === 'changePrt') {
                    this.basicInfoFun(this.selectedPort || 'AgPrt~UserPortfolios',  this.selectedTime || '1');
                }
                this.basicInfoFun("AgPrt~UserPortfolios", dateTime || '1');
            },
            //离开当前页面时销毁当前页面正在加载的数据
            destroy() {
                //切换页面时暂停或销毁上一次正在计算
                if (basicInfo) {
                    basicInfo.kill();
                }
                $('.OG-cell-options').remove();
            },
            lazyLoad: function (element) {
                var scrollTop = element.scrollTop, scrollLeft = element.scrollLeft;//滚动高度
                if (basicInfo) {
                    basicInfo.elements.scrollTop = scrollTop;
                    basicInfo.scrollend();
                }
            },
            handleResize: function() {
                if (basicInfo) {
                    basicInfo.elements = utils.getVisibleArea($(_self.$el).find(".table-panel-1")[0]);
                    basicInfo.resize();
                }
            },
            //组合分析表格数据请求
            basicInfoFun(nodeId, dateTime) {
                this.loading1 = true;
                this.loading2 = true;
                basicInfo = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.myCombination.basicInfo,
                    requestParam: {
                        portfolio: nodeId,
                        calcTimeParam: dateTime
                    },
                    otherParam: {
                        visibleArea: (function () {
                            let element = utils.getVisibleArea(".fix-table-panel");
                            element.width = 1200;
                            return element
                        })(),
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleBasicInfoData
                });
            },
            //组合分析表格数据获取
            handleBasicInfoData(result) {
                if ($.isArray(result)) { //判断接收的数据是否是数组
                    //读取Name行对应的Default行记录数据
                    var nameValue = result[1], targetValue = result[2], targetNum = targetValue.length;
                    var cellNum = targetNum == 1 ? 0 : 1; //用于检验多组合或单组合
                    //遍历数据条数
                    for (; cellNum < targetNum; cellNum++) {
                        var cellValue = targetValue[cellNum].cells, temp = {}, cells = nameValue[cellNum].cells[0];
                        temp.name = cells.value //证券名称
                        temp.securityId = cells.securityId; //证券内码编号

                        //添加全部及分支组合
                        if (targetNum > 1) {
                            this.$set(this.optionInfo, cellNum, {
                                id: cells.nodeId,
                                name: temp.name
                            });
                        }

                        //遍历数据列数
                        for (var cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                            var colName = cellValue[cellValNum].col_name;
                            //对当日，当月，今年以来进行field转换
                            if ('Total Return'.indexOf(colName) != -1) {
                                temp[colName + ' ' + totalReturnArray[cellValNum]] = cellValue[cellValNum];
                                continue;
                            }
                            //对排名进行field转换
                            if ('Rank'.indexOf(colName) != -1) {
                                temp[colName + ' ' + totalReturnArray[cellValNum]] = cellValue[cellValNum];
                                continue;
                            }
                            //其他不需要转换字段，直接装载
                            temp[colName] = cellValue[cellValNum];
                        }
                        //校验当前temp对象里面是否存在原型链对象
                        if (temp.hasOwnProperty('Total Return P1D') && temp.hasOwnProperty('Total Return BP1D')) {
                            temp.dayOverReturn = (numberUtil.convertNumber(temp['Total Return P1D'].value, numberTrimList) - numberUtil.convertNumber(temp['Total Return BP1D'].value, numberTrimList)).toFixed(2) + '%';
                        }
                        if (temp.hasOwnProperty('Total Return P1M') && temp.hasOwnProperty('Total Return BP1M')) {
                            temp.monthOverReturn = (numberUtil.convertNumber(temp['Total Return P1M'].value, numberTrimList) - numberUtil.convertNumber(temp['Total Return BP1M'].value, numberTrimList)).toFixed(2) + '%';
                        }
                        if (temp.hasOwnProperty('Total Return P1Y') && temp.hasOwnProperty('Total Return BP1Y')) {
                            temp.yearOverReturn = (numberUtil.convertNumber(temp['Total Return P1Y'].value, numberTrimList) - numberUtil.convertNumber(temp['Total Return BP1Y'].value, numberTrimList)).toFixed(2) + '%';
                        }
                        this.$set(this.basicInfo, cellNum ? cellNum - 1 : cellNum, temp)
                    }
                    this.loading1 = false;
                    this.initChartData(this.basicInfo);
                    this.$nextTick(() => {
                        new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="basicInfo"] tr td[cell]', basicInfo);
                    });
                }
            },
            //初始化图表
            initChartData(basicInfo) {
                var data = [], legend = [];
                for (var i = 0, j = basicInfo.length; i < j; i++) {
                    var item = basicInfo[i], point = {}, name = item['name'];
                    legend[i] = name;
                    point.name = name;
                    point.type = 'scatter';
                    point.symbol = 'circle';
                    point.data = [[]];
                    point.data[0][0] = !item['Stddev'] ? 0 : item['Stddev'].value.replace("%", "");
                    point.data[0][1] = !item.yearOverReturn ? 0 : item.yearOverReturn.replace("%", "");
                    data[i] = point;
                }
                this.handleChart(legend, data);
            },
            //图表数据
            handleChart(legend, data) {
                var option = this.chart[0].getOption();
                option.legend = {
                    data: legend
                };
                option.series = data;
                this.chart[0].setOption(option, true);
                this.loading2 = false;
            },
            //切换表格下拉框选项
            changeOption() {
                //清除缓存
                this.$store.commit(moduleName + '/initBasicInfo');
                this.basicInfoFun(this.selectedPort, this.selectedTime);
            }
        }
    }
</script>

<style scoped>
    @import "./../../styles/default1/TabClass/myCombination.css";
</style>