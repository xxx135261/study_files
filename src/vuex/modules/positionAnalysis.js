/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2018/1/4  mengjq  新增
 * ========    =======  ============================================
 */

const state = {
    // 前五大重仓股
    awkwardness: [{
        'Market Value': {value: ''},
        'Position Cost': {value: ''},
        'Position Volume': {value: ''},
        'Weight': {value: ''},
        'name': '--',
        'securityId': ''
    }],
    // 前五大重仓行业
    heavyIndustry: [{
        'Market Value': {value: ''},
        'Position Cost': {value: ''},
        'Weight': {value: ''},
        'name': '--'
    }],
    // 持仓明细
    detailbut: [{
        'name': '--',
        'securityId': '',
        'Position Volume': {value: ''},
        'Position Cost': {value: ''},
        'Market Value': {value: ''},
        'Weight': {value: ''},
        'Bench Component Weight': {value: ''},
    }],
    industrysel: [{
        value: 'Industry one',
        name: '申万一级行业'
    }, {
        value: 'Market Value',
        name: '市值'
    }, {
        value: 'Market Board',
        name: '板块'
    }],
    namesel: [{
        value: 'FKBch~000300SH',
        name: '沪深300'
    }, {
        value: 'FKBch~000905SH',
        name: '中证500'
    }, {
        value: 'FKBch~000016SH',
        name: '上证50'
    }, {
        value: 'FKBch~399006SZ',
        name: '创业板'
    }],
    echartConfig: {
        tooltip: {
            trigger: 'axis',
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
                        var table = '<table class="table table-bordered" tabid="positionAnalysisChartData" id="positionAnalysisDataView"><tbody></tbody></table>';
                        var positionAnalysisChartData = og.views.analytics.griddata.loadGridData({
                            name: og.api.rest.views.parame.positionAnalysis.reportEchartData,
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
                                var tdCell = [];
                                for (var scrollFieldNum = 0; scrollFieldNum < scrollField.length; scrollFieldNum++) {
                                    headField += "<td cell='" + JSON.stringify(scrollField[scrollFieldNum]) + "'>" + scrollField[scrollFieldNum].value + '</td>';
                                }
                                headField += '</tr>';
                                $("#positionAnalysisDataView").html(headField);
                                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="positionAnalysisChartData"] tr td[cell]', positionAnalysisChartData);
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
                    name: '仓位走势',
                     iconStyle: {
                       	normal: {
                            borderColor:'#528DFF'
                       	}
                    },
                }
            },
            right: '12%'
        },
        // 折线图默认参数
        line: {
            smooth: true,
            symbol: 'emptyCircle', // 拐点图形类型
            symbolSize: 3 // 拐点图形大小
        },
        dataZoom: {
            show: true,
            realtime: true,
            start: 20,
            end: 100
        },
        legend: {
            data: ['']
        },
        grid: {
            x: 80,
            x2: 80
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            splitLine: {
                show: true
            },
            data: ['']
        }],
        yAxis: [{
            min: 3000,
            max: 4000,
            type: 'value',
            name: '基准点位',
            axisLabel: {
                formatter: function (val) {
                    return val.toFixed(2);
                }
            }
        }, {
            min: 0,
            max: 1,
            type: 'value',
            name: '股票仓位',
            axisLabel: {
                formatter: function (val) {
                    return (100 * Number(val)).toFixed(2) + '%';
                }
            }
        }],
        series: [{
            name: '',
            symbol: 'none',
            type: 'line',
            data: [''],
            color:['#528DFF'],  //折线条的颜色
         	itemStyle: {        //区域颜色
                normal: {
                    areaStyle: {
                        color:'RGBA(237, 243, 255, 0.7)'
                    }
                }
            },
        }, {
            name: '',
            type: 'line',
            symbol: 'none',
            yAxisIndex: 1,
            data: [''],
			color:['#b6a2de'],  //折线条的颜色            
        }]
    }
}

const mutations = {
    initAwkwardness: state => {
        state.awkwardness = [{
            'Market Value': {value: ''},
            'Position Cost': {value: ''},
            'Position Volume': {value: ''},
            'Weight': {value: ''},
            'name': '--',
            'securityId': ''
        }];
    },
    initHeavyIndustry: state => {
        state.heavyIndustry = [{
            'Market Value': {value: ''},
            'Position Cost': {value: ''},
            'Weight': {value: ''},
            'name': '--'
        }];
    },
    initDetailbut: state => {
        state.detailbut = [{
            'name': '--',
            'securityId': '',
            'Position Volume': {value: ''},
            'Position Cost': {value: ''},
            'Market Value': {value: ''},
            'Weight': {value: ''},
            'Bench Component Weight': {value: ''},
        }];
    },
    setDetailbut: (state, payload = {}) => {
        if (payload.newVal) {
            state.detailbut = payload.newVal;
        }
    }
}

export default {namespaced: true, state, mutations}