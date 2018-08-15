/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/9  rencc19758  新增
 * ========    =======  ============================================
*/
const state = {
    basicInfo: [{
        'Investment Return Contribution': {value: ''},
        'Bench Return Contribution': {value: ''},
        'Asset Allocation Return Contribution': {value: ''},
        'Stock Selection Return Contribution': {value: ''},
        'Interaction Return Contribution': {value: ''},
        'overful_profit': '',
        'mean_weight': '',
        'overful_yield': ''
    }],
    echartConfig: {
        tooltip: {
            trigger: 'item',
            backgroundColor:'#528DFF',
            color:'#fff',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
            show: true,
            feature: {
                dataView: {
                    readOnly: true,
                    iconStyle: {
                       	normal: {
                            borderColor: '#528DFF'
                       	}
                    },
                    optionToContent: function (opt) {
                        var table = '<table class="table table-bordered" tabid="attriButionChartData" id="attriButionDataView"><tbody></tbody></table>';
                        var attriButionChartData = og.views.analytics.griddata.loadGridData({
                            name: og.api.rest.views.parame.attriBution.pieChartData,
                            requestParam: {
                                portfolio: self.top.portfolioId,
                                aggregators: og.api.rest.views.parame.attriBution.pieChartData.aggregators
                            },
                            otherParam: {
                                visibleArea: {
                                    height: 400,
                                    width: 200,
                                    scrollHeight: 0,
                                    scrollWidth: 0,
                                    scrollTop: 1,
                                    scrollLeft: 1
                                },
                                isDepgraph: true
                            },
                            metaHandle: null,
                            dataHandle: function (result) {
                                var fieldName = result[0], fixedField = result[1],
                                    scrollField = result[2];
                                var headField = '<tr>';
                                for (var fieldNameNum = 0; fieldNameNum < fieldName.length; fieldNameNum++) {
                                    headField += '<td>' + fieldName[fieldNameNum] + '</td>';
                                }
                                headField += '</tr>';
                                for (var fixedFieldNum = 0; fixedFieldNum < fixedField.length; fixedFieldNum++) {
                                    headField += '<tr>';
                                    headField += '<td>' + fixedField[fixedFieldNum].cells[0].value + '</td>';
                                    headField += "<td cell='" + JSON.stringify(scrollField[fixedFieldNum].cells[0]) + "'>" + scrollField[fixedFieldNum].cells[0].value + '</td>';
                                    headField += '</tr>';
                                }
                                $("#attriButionDataView").html(headField);
                                new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="attriButionChartData"] tr td[cell]', attriButionChartData);
                            }
                        });
                        return table;
                    }
                },
                restore: {
                	iconStyle: {
                       	normal: {
                            borderColor: '#528DFF'
                       	}
                    },
                },
                saveAsImage: {
                    name: '行业配置',
                    iconStyle: {
                       	normal: {
                            borderColor: '#528DFF'
                       	}
                    },
                }
            },
            right: "16px"
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['农业', '计算机', '其他']
        },
        series: [{
            type: 'pie',
            radius: '55%',
            center: ['50%', '68%'],
            data: [
                {value: 35, name: '农业'},
                {value: 10, name: '计算机'},
                {value: 55, name: '其他'}
            ]
        }],
        grid: {
            left: 'center'
        }
    }
}

const mutations = {
    initBasicInfo: state => {
        state.basicInfo = [{
            'Investment Return Contribution': {value: ''},
            'Bench Return Contribution': {value: ''},
            'Asset Allocation Return Contribution': {value: ''},
            'Stock Selection Return Contribution': {value: ''},
            'Interaction Return Contribution': {value: ''},
            'overful_profit': '',
            'mean_weight': '',
            'overful_yield': ''
        }];
    },
    setBasicInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.basicInfo = payload.newVal;
        }
    }
}

export default {namespaced: true, state, mutations}