/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/8  rencc19758  新增
 * ========    =======  ============================================
*/
/**
 * 构建图表下钻界面表格
 *
 * @author Rencc
 * @param result 图表请求到的数据
 * @param seriesName 图表对应的时序字段名称
 * @param tabId 图表下钻界面表格的唯一标识
 */
function tableMaker(result, seriesName, tabId) {
    let fieldName = result[0], fixedField = result[1][0].cells,
        scrollField = result[2][0].cells, fieldIndex;
    var headField = '<tr>';
    headField += '<td>' + fieldName[0] + '</td>';
    for (let fieldNameNum = 1; fieldNameNum < fieldName.length; fieldNameNum++) {
        let name = fieldName[fieldNameNum];
        if (name === seriesName) {
            headField += '<td>' + name + '</td>';
            // 保存列名字段的位置，用于之后填scrollField时使用。
            fieldIndex = fieldNameNum;
            break;
        }
    }
    headField += '</tr>';
    headField += '<tr>';
    for (let fixedFieldNum = 0; fixedFieldNum < fixedField.length; fixedFieldNum++) {
        headField += '<td>' + fixedField[fixedFieldNum].value + '</td>';
    }
    // 根据fieldIndex直接将确定的字段名对应的值填到td里
    let field = scrollField[fieldIndex - 1];
    headField += "<td cell='" + JSON.stringify(field) + "'>" + field.value + '</td>';
    headField += '</tr>';
    $("#" + tabId).html(headField);
}

const state = {
    // 最大回撤
    echartConfig1: {
        tooltip: {
            trigger: "axis",
            backgroundColor:'#528DFF',
            color:'#fff',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    precision: 2,
                    backgroundColor: '#528DFF'
                },
                crossStyle: {
                    type: 'solid'
                }
            }
        },
        // 折线图默认参数
        line: {
            smooth: true,
            symbol: "emptyCircle", // 拐点图形类型
            symbolSize: 1 // 拐点图形大小
        },
        grid: {
            left: 60,
            right: 20
        },
        toolbox: {
            show: true,
            feature: {
                mark: {show: true},
                dataView: {
                    show: true,
                    readOnly: true,
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                             borderColor: '#528DFF'
                       	}
                    },
                    optionToContent: function (opt) {
                        let tabId = 'maxDrawdown';
                        let table = '<table class="table table-bordered" tabid="' + tabId
                            + '" id="' + tabId + '"><tbody></tbody></table>';
                        let maxDrawdownChartData = og.views.analytics.griddata.loadGridData({
                            name: og.api.rest.views.parame.riskAnalysis.retreatEchartData,
                            requestParam: {
                                portfolio: self.top.portfolioId
                            },
                            otherParam: {
                                visibleArea: {
                                    height: 100,
                                    width: 600,
                                    scrollHeight: 0,
                                    scrollWidth: 0,
                                    scrollTop: 0,
                                    scrollLeft: 0
                                },
                                isDepgraph: true
                            },
                            metaHandle: null,
                            dataHandle: function (result) {
                                tableMaker(result, 'UNAV Series', tabId);
                                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="' + tabId + '"] tr td[cell]', maxDrawdownChartData);
                            }
                        });
                        return table;
                    }
                },
                magicType: {
                	type: ['line', 'bar'],
                	iconStyle: {
                       normal: {
                         	borderColor: '#528DFF'
                        }
                    },
                },
                saveAsImage: {
                    show: true,
                    name: '最大回撤',
                    iconStyle: {
                       	normal: {
                             borderColor: '#528DFF'
                       	}
                      	
                    },
                }
            },
            top: '20px',
            right: '18px'
        },
        dataZoom: {
            show: true,
            realtime: true,
            start: 0,
            end: 100
        },
        legend: {
            data: [{
                name: "单位净值"
            }],
        },
        xAxis: [{
            type: "category",
            splitLine: {
                show: true
            },
            data: [""]
        }],
        yAxis: [{
            min: 1,
            max: 1.5,
            type: "value",
            name: ""
        }],
        series: [{
            name: "单位净值",
            symbol: "none",
            type: "line",
            markPoint: {
                data: [
                    {type: 'max', name: '最大值', symbolSize: 70},
                    {type: 'min', name: '最小值', symbolSize: 70}
                ],
                
            },
            data: [''],
            color:'#528DFF',
            itemStyle:{
	        	normal :{
	        		color:'#528DFF',
	        	}
        	}
        }],
    },
    // 收益稳定性
    echartConfig2: {
        tooltip: {
            trigger: 'axis',
            backgroundColor:'#528DFF',
            color:'#fff',
        },
        grid: {
            left: 60,
            right: 20
        },
        toolbox: {
            show: true,
            feature: {
                mark: {show: true},
                dataView: {
                    show: true,
                    readOnly: true,
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                             borderColor: '#528DFF'
                       	}
                    },
                    optionToContent: function (opt) {
                        let tabId = 'returnChart';
                        let table = '<table class="table table-bordered" tabid="' + tabId
                            + '" id="' + tabId + '"><tbody></tbody></table>';
                        let returnChartData = og.views.analytics.griddata.loadGridData({
                            name: og.api.rest.views.parame.riskAnalysis.retreatEchartData,
                            requestParam: {
                                portfolio: self.top.portfolioId
                            },
                            otherParam: {
                                visibleArea: {
                                    height: 100,
                                    width: 600,
                                    scrollHeight: 0,
                                    scrollWidth: 0,
                                    scrollTop: 0,
                                    scrollLeft: 0
                                },
                                isDepgraph: true
                            },
                            metaHandle: null,
                            dataHandle: function (result) {
                                tableMaker(result, 'UNAV Return Series', tabId);
                                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="' + tabId + '"] tr td[cell]', returnChartData);
                            }
                        });
                        return table;
                    }
                },
                magicType: {
                	type: ['line', 'bar'],
                	iconStyle: { //toolbox工具图标样式
                       	normal: {
                             borderColor: '#528DFF'
                       	}
                    },
                },
                saveAsImage: {
                    show: true,
                    name: '收益稳定性',
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                            borderColor: '#528DFF'
                       	}
                    },
                }
            },
            top: '20px',
            right: '18px'
        },
        dataZoom: {
            show: true,
            realtime: true,
            start: 0,
            end: 100
        },
        legend: {
            data: [{
                name: "日收益率"
            }]
        },
        xAxis: [{
            type: 'category',
            splitLine: {
                show: true
            },
            data: [""]
        }],
        yAxis: [{
            min: 0,
            max: 0.5,
            type: "value",
            name: ""
        }],
        series: [{
            name: '日收益率',
            type: 'bar',
            symbol: "none",
            data: [''],
            itemStyle:{
	        	normal :{
	        		color:'#528DFF',
	        	}
        	}
        }]
    },
    // VaR分析
    echartConfig3: {
        tooltip: {
            trigger: "axis",
            backgroundColor:'#528DFF',
            color:'#fff',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    precision: 2,
                    backgroundColor: '#528DFF'
                },
                crossStyle: {
                    type: 'solid'
                }
            }
        },
        // 折线图默认参数
        line: {
            smooth: true,
            symbol: "emptyCircle", // 拐点图形类型
            symbolSize: 1 // 拐点图形大小
        },
        grid: {
            left: 70,
            right: 12
        },
        toolbox: {
            show: true,
            itemStyle:{
	        	normal :{
	        		color:'#528DFF',
	        	}
        	},
            feature: {
                mark: {show: true},
                dataView: {
                    show: true,
                    readOnly: true,
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                            borderColor: '#528DFF'
                       	}
                    },
                    optionToContent: function (opt) {
                        let tabId = 'varChart';
                        let table = '<table class="table table-bordered" tabid="' + tabId
                            + '" id="' + tabId + '"><tbody></tbody></table>';
                        let varChartData = og.views.analytics.griddata.loadGridData({
                            name: og.api.rest.views.parame.riskAnalysis.retreatEchartData,
                            requestParam: {
                                portfolio: self.top.portfolioId
                            },
                            otherParam: {
                                visibleArea: {
                                    height: 100,
                                    width: 600,
                                    scrollHeight: 0,
                                    scrollWidth: 0,
                                    scrollTop: 0,
                                    scrollLeft: 0
                                },
                                isDepgraph: true
                            },
                            metaHandle: null,
                            dataHandle: function (result) {
                                tableMaker(result, 'Normal Var Series', tabId);
                                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="' + tabId + '"] tr td[cell]', varChartData);
                            }
                        });
                        return table;
                    }
                },
                magicType: {
                	type: ['line', 'bar'],
                	iconStyle: { //toolbox工具图标样式
                       	normal: {
                             borderColor: '#528DFF'
                       	},
                    },
                },
                saveAsImage: {
                    show: true,
                    name: 'VaR分析',
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                            borderColor: '#528DFF'
                       	}
                    },
                }
            },
            top: '15px',
            right: '18px'
        },
        dataZoom: {
            show: true,
            realtime: true,
            start: 0,
            end: 100
        },
        legend: {
            data: [{
                name: "VaR"
            }]
        },
        xAxis: [{
            type: "category",
            splitLine: {
                show: true
            },
            data: []
        }],
        yAxis: [{
            min: 0,
            max: 1,
            type: "value",
            // name: ""
        }],
        series: [{
            name: "VaR",
            symbol: "none",
            type: "line",
            data: [],
            itemStyle:{
	        	normal :{
	        		color:'#528DFF',
	        	}
        	}
        }]
    },
    // 风险分析第一行文字
    riskInfo: {
        times: '--',
        'MaxDrawDown': '--',
        loss: '--',
        'Normal Var': '--',
        'Stddev': '--'
    },
    // 当前组合的风险排名
    riskRankNotice: {
        notice: '风险适中'
    }
}

const mutations = {
    initRiskInfo: state => {
        state.riskInfo.time = '--';
        state.riskInfo['MaxDrawDown'] = '--';
        state.riskInfo.loss = '--';
        state.riskInfo['Normal Var'] = '--';
        state.riskInfo['Stddev'] = '--';
    },
    initRiskRankNotice: state => {
        state.riskRankNotice.notice = '风险适中';
    }
}

export default {namespaced: true, state, mutations}