/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/9  rencc19758  新增
 * ========    =======  ============================================
*/

const state = {
    profitTopFive: [{
        name: '--',
        securityId: '',
        'Market Value': {value: ''},
        'Weight': {value: ''},
        'Range PnL': {value: ''}
    }],
    lossTopFive: [{
        name: '--',
        securityId: '',
        'Market Value': {value: ''},
        'Weight': {value: ''},
        'Range PnL': {value: ''}
    }],
    profitInfo: [{
        name: '--',
        securityId: '',
        'Market Value': {value: ''},
        'Weight': {value: ''},
        'Range PnL': {value: ''}
    }],
    profInfo: {'Range PnL': '--', name: '近一周'},
    combinProfit: {times: '近一周', 'Total Unit Nav Yield': '--', 'Total Yield Rank': '--'},
    riskAdjusted: {
        Alpha: {value: '--'},
        Treynor: {value: '--'},
        RAROC: {value: '--'},
        Sharp: {value: '--'},
        IR: {value: '--'}
    },
    riskAdjustedRadio: {
        'Alpha Rank': '--',
        'Treynor Rank': '--',
        'RAROC Rank': '--',
        'Sharp Rank': '--',
        'IR Rank': '--'
    },
    echartConfig1: {
        tooltip: {
        	backgroundColor:'#528DFF',
            color:'#fff',
            formatter: "{a} <br/>{b} : {c}%"
        },
        legend: {
            data: ['']
        },
        toolbox: {
            feature: {
                dataView: {
                    readOnly: true,
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                         	borderColor: '#528DFF'
                       	}
                    },
                    optionToContent: function (opt) {
                        var tabId = 'yieldRanking';
                        var table = '<table class="table table-bordered" tabid="' + tabId
                            + '" id="' + tabId + '"><tbody></tbody></table>';
                        var yieldRankingChartData = og.views.analytics.griddata.loadGridData({
                            name: og.api.rest.views.parame.profitAndLoss.yieldRanking,
                            otherParam: {
                                isDepgraph: true
                            },
                            metaHandle: null,
                            dataHandle: function (result) {
                                var fieldName = result[0], fixedField = result[1], pos = 0;
                                var sCode = self.top.portfolioId;
                                var headField = '<tr>';
                                for (var fieldNameNum = 0; fieldNameNum < fieldName.length; fieldNameNum++) {
                                    headField += '<td>' + fieldName[fieldNameNum] + '</td>';
                                }
                                headField += '</tr>';
                                headField += '<tr>';
                                for (var fixedFieldNum = 1; fixedFieldNum < fixedField.length; fixedFieldNum++) {
                                    var cell = fixedField[fixedFieldNum].cells[0];
                                    if (cell['nodeId'] === sCode) {
                                        headField += '<td>' + cell.value + '</td>';
                                        pos = fixedFieldNum;
                                        break;
                                    }
                                }
                                var scrollField = result[2][pos].cells;
                                for (var scollFieldNum = 0; scollFieldNum < scrollField.length; scollFieldNum++) {
                                    headField += "<td cell='" + JSON.stringify(scrollField[scollFieldNum]) + "'>" + scrollField[scollFieldNum].value + '</td>';
                                }
                                headField += '</tr>';
                                $("#" + tabId).html(headField);
                                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="' + tabId + '"] tr td[cell]', yieldRankingChartData);
                            }
                        });
                        return table;
                    }
                },
                saveAsImage: {
                    name: '组合收益',
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                         	borderColor: '#528DFF'
                       	}
                    },
                }
            },
            right: '16px'
        },
        series: [{
            name: '收益率排名',
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            center: ['50%', '90%'], // 默认全局居中
            radius: 180,
            axisLine: { // 坐标轴线
                lineStyle: { // 属性lineStyle控制线条样式
                    color: [
                        [0.1, '#47A56C'],
                        [0.2, '#68C68D'],
                        [0.3, '#B7EBCB'],
                        [0.4, '#DEF8E8'],
                        [0.6, '#E1EDE6'],
                        [0.7, '#FADADA'],
                        [0.8, '#E1BCBC'],
                        [0.9, '#C39595'],
                        [1, '#8D4C4C']
                    ],
                    width: 22.5
                }
            },
            axisTick: { // 坐标轴小标记
                splitNumber: 10, // 每份split细分多少段
                length: 12, // 属性length控制线长
            },
            axisLabel: { // 坐标轴文本标签，详见axis.axisLabel
                formatter: function (v) {
                    switch (v + '') {
                        case '10':
                            return '1';
                        case '20':
                            return '2';
                        case '30':
                            return '3';
                        case '40':
                            return '4';
                        case '50':
                            return '5';
                        case '60':
                            return '6';
                        case '70':
                            return '7';
                        case '80':
                            return '8';
                        case '90':
                            return '9';
                        default:
                            return '';
                    }
                },
                textStyle: {
                    color: '#000',
                    fontSize: 15,
                    fontWeight: 'bolder'
                }
            },
            pointer: {
                width: 5,
                length: '95%',
                color: '#C50404'
            },
            title: {
                show: false,
                offsetCenter: [0, '-60%'], // x, y，单位px
                textStyle: {
                    color: '#fff',
                    fontSize: 30
                }
            },
            detail: {
                show: true,
                backgroundColor: 'rgba(0,0,0,0)',
                borderWidth: 0,
                borderColor: '#ccc',
                width: 100,
                height: 40,
                formatter: null,
                textStyle: {
                    fontSize: 50
                }
            },
            data: [{
                value: '0.00'
            }]
        }]
    },
    echartConfig2: {
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
            symbol: "none", // 拐点图形类型
            symbolSize: 3 // 拐点图形大小
        },
        grid: {
            x: 60,
            x2: 60
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
        toolbox: {
            show: true,
            feature: {
                dataView: {
                    readOnly: true,
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                             borderColor: '#528DFF'
                       	}
                    },
                    optionToContent: function (opt) {
                        var tabId = 'totalReturn';
                        var table = '<table class="table table-bordered" tabid="' + tabId
                            + '" id="' + tabId + '"><tbody></tbody></table>';
                        var totalReturnChartData = og.views.analytics.griddata.loadGridData({
                            name: og.api.rest.views.parame.profitAndLoss.yieldEchartData,
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
                                // 组成表头
                                for (var fieldNameNum = 0; fieldNameNum < fieldName.length; fieldNameNum++) {
                                    var name = fieldName[fieldNameNum];
                                    // 第二个列名为"Total Return Series"是基础组合的收益时序
                                    headField += '<td>' + (fieldNameNum == 2 ? name + '(Bench)' : name) + '</td>';
                                }
                                headField += '</tr>';
                                headField += '<tr>';
                                for (var fixedFieldNum = 0; fixedFieldNum < fixedField.length; fixedFieldNum++) {
                                    headField += '<td>' + fixedField[fixedFieldNum].value + '</td>';
                                }
                                for (var scollFieldNum = 0; scollFieldNum < scrollField.length; scollFieldNum++) {
                                    var field = scrollField[scollFieldNum];
                                    headField += "<td cell='" + JSON.stringify(field) + "'>" + field.value + '</td>';
                                }
                                headField += '</tr>';
                                $("#" + tabId).html(headField);
                                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="' + tabId + '"] tr td[cell]', totalReturnChartData);
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
                    name: '收益走势',
                    iconStyle: { //toolbox工具图标样式
                       	normal: {
                     		borderColor: '#528DFF'
                       	}
                    },
                }
            },
            right: '20px'
        },
        xAxis: [{
            type: "category",
            boundaryGap: false,
            axisLine: {
                show: true
            },
            data: ['']
        }],
        yAxis: [{
            type: "value",
            name: "累计收益率",
            min: 0,
            max: 1,
            axisLabel: {
                formatter: function (val) {
                    return (100 * Number(val)).toFixed(2) + '%';
                }
            }
        }],
        series: [{
            name: "",
            symbol: "none",
            type: "line",
            data: [''],
            color:'#528DFF',  //折线条的颜色
            itemStyle: {        //区域颜色
                normal: {
                	color:'#528DFF',
                    areaStyle: {
                        color:'RGBA(237, 243, 255, 0.7)'
                    }
                }
            },
        }, {
            name: "",
            type: "line",
            symbol: "none",
            data: [''],
            color:['#b6a2de'],  //折线条的颜色
        }]
    }
}

const mutations = {
    initProfitTopFive: state => {
        state.profitTopFive = [{
            name: '--',
            securityId: '',
            'Market Value': {value: ''},
            'Weight': {value: ''},
            'Range PnL': {value: ''}
        }];
    },
    initLossTopFive: state => {
        state.lossTopFive = [{
            name: '--',
            securityId: '',
            'Market Value': {value: ''},
            'Weight': {value: ''},
            'Range PnL': {value: ''}
        }];
    },
    initProfitInfo: state => {
        state.profitInfo = [{
            name: '--',
            securityId: '',
            'Market Value': {value: ''},
            'Weight': {value: ''},
            'Range PnL': {value: ''}
        }];
    },
    initCombinProfit: state => {
        state.combinProfit = {times: '近一周', 'Total Unit Nav Yield': '--', 'Total Yield Rank': '--'};
    },
    setProfitInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.profitInfo = payload.newVal;
        }
    },
    setRiskAdjusted: (state, payload = {}) => {
        if (payload.newVal) {
            state.riskAdjusted = payload.newVal;
        }
    }
}

export default {namespaced: true, state, mutations}