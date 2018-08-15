/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2017/12/27  mengjq  新增
 * ========    =======  ============================================
 */

/**
 *单一状态树
 * @type {{}}
 */
const state = {
    basicInfo: {
        'UNAV': {value: ''}, 'Share': {value: ''}, 'Bench Name': {value: ''}, 'Port Begin Date': {value: ''},
    },
    fundIndexs: {
        'PE': {value: ''}, 'PB': {value: ''}, 'PSales': {value: ''}, 'PCF': {value: ''}
    },
    riskIndexs: {
        'Normal Var': {value: ''}, 'Normal Var5': {value: ''}, 'Stddev': {value: ''},
        'Beta': {value: ''}, 'MaxDrawDown': {value: ''}, 'Turnover Rate': {value: ''}
    },
    gains: [{value: ''}, {value: ''}, {value: ''}, {value: ''}, {value: ''}],
    echartConfig: {
        tooltip: {
            trigger: "axis",
        	backgroundColor:'#528DFF',
            color:'#fff',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    precision: 2,
                    backgroundColor:'#528DFF',
            		color:'#fff',
                },
                crossStyle: {
                    type: 'solid'
                }
            }
        },
        toolbox: {
            show: true,
            feature: {
                dataView: {
                    readOnly: true,
                    iconStyle: {
                       	normal: {
                            borderColor:'#528DFF'
                       	}
                    },
                    optionToContent: function (opt) {
                        var $this = this;
                        var table = '<table class="table table-bordered" tabid="compositeProfileChartData" id="123"><tbody></tbody></table>';
                        var compositeProfileChartData = og.views.analytics.griddata.loadGridData({
                            name: og.api.rest.views.parame.compositeProfile.historicalNetWorth,
                            requestParam: {
                                portfolio: self.top.portfolioId
                            },
                            otherParam: {
                                isDepgraph: true
                            },
                            metaHandle: null,
                            dataHandle: function (result) {
                                var fieldName = result[0], fixedField = result[1][0].cells,
                                    scrollField = result[2][0].cells;
                                var headField = '<tr>';
                                for (var fieldNameNum = 0; fieldNameNum < fieldName.length; fieldNameNum++) {
                                    headField += '<td>' + fieldName[fieldNameNum] + '</td>';
                                }
                                headField += '</tr>';
                                headField += '<tr>';
                                for (var fixedFieldNum = 0; fixedFieldNum < fixedField.length; fixedFieldNum++) {
                                    headField += '<td>' + fixedField[fixedFieldNum].value + '</td>';
                                }
                                for (var scrollFieldNum = 0; scrollFieldNum < scrollField.length; scrollFieldNum++) {
                                    headField += "<td cell='" + JSON.stringify(scrollField[scrollFieldNum]) + "'>" + scrollField[scrollFieldNum].value + '</td>';
                                }
                                headField += '</tr>';
                                $("#123").html(headField);
                                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="compositeProfileChartData"] tr td[cell]', compositeProfileChartData);
                            }
                        });
                        return table;
                    }
                },
                magicType: {
                	type: ['line', 'bar'],
                	iconStyle: {
                       	normal: {
                            borderColor:'#528DFF'
                       	}
                    },
                },
                restore: {
                	iconStyle: {
                       	normal: {
                            borderColor:'#528DFF'
                       	}
                    },
                },
                saveAsImage: {
                    name: '净值走势',
                    iconStyle: {
                       	normal: {
                            borderColor:'#528DFF'
                       	}
                    },
                }
            },
            right: '12%'
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor:'#528DFF',
            color:'#fff',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    precision: 2,
                    backgroundColor:'#528DFF',
            		color:'#fff',
                },
                crossStyle: {
                    type: 'solid'
                }
            }
        },
        // 折线图默认参数
        line: {
            smooth: true,
            symbol: "none", // 拐点图形类型
            symbolSize: 3 // 拐点图形大小
        },
        grid: {
            x: 70,
            x2: 40
        },
        dataZoom: {
            show: true,
            realtime: true,
            start: 20,
            end: 100
        },
        legend: {
            data: [""]
        },
        xAxis: [{
            type: "category",
            boundaryGap: false,
            splitLine: {
                show: true
            },
        }],
        yAxis: [{
            min: 3000,
            max: 4000,
            type: "value",
            name: "指数点位",
            axisLabel: {
                formatter: function (val) {
                    return Number(val).toFixed(2);
                }
            }
        }, {
            min: 1,
            max: 1.5,
            type: "value",
            name: "组合净值",
            axisLabel: {
                formatter: function (val) {
                    return Number(val).toFixed(2);
                }
            }
        }],
        series: [{
            type: "line",
            symbol: "none",
            color:['#528DFF'],  //折线条的颜色
         	itemStyle: {        //区域颜色
                normal: {
                    areaStyle: {
                        color:'RGBA(237, 243, 255, 0.7)'
                    }
                }
            },
        }, {
            name: "",
            type: "line",
            symbol: "none",
            yAxisIndex: 1,
         	color:['#b6a2de'],  //折线条的颜色
        }]
    }
}

export default {
    namespaced: true, state
}