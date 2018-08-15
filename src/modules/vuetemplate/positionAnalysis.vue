<template src="../html/positionAnalysis.html"></template>
<script>
    import {mapState} from 'vuex';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'positionAnalysis';

    var awkwardnessGrid = null, heavyIndustryGrid = null, positionAnalysisChartData = null;
    var utils = $.pasUtils();
    var common = $.common();
    var _self;

    export default {
        name: "positionAnalysis",
        data() {
            return {
                detailbutGrid: null,
                selectedIndustry: 'Industry one',
                selectedBench: 'FKBch~000300SH',
                // 明细表格基准组合列头
                benchLabel: '沪深300(仓位)',
                activated: true,
                // 前五大重仓股loading
                loading1: null,
                // 前五大重仓行业loading
                loading2: null,
                // 仓位走势loading
                loading3: null,
                // 持仓明细loading
                loading4: null
            }
        },
        computed: mapState(moduleName, {
            awkwardness: state => state.awkwardness,
            heavyIndustry: state => state.heavyIndustry,
            detailbut: state => state.detailbut,
            industrysel: state => state.industrysel,
            namesel: state => state.namesel,
            echartConfig: state => state.echartConfig
        }),
        mounted() {
            _self = this;
            this.loadData();
            this.bindListenerOnModal();
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
            loadData(scode) {
                var scode = scode || this.$store.state.selectGroup.id;
                this.destroy();
                $('.OG-cell-options').remove();
                this.awkwardnessFun(scode);
                this.heavyIndustryFun(scode);
                this.reportEchartData(scode);
                if ($(".positiondrag").is(":visible")) {
                    this.initDataDetailbut.call(this, scode, this.selectedIndustry, this.selectedBench);
                }
                // 初始化前五大重仓股、前五大重仓行业表格
                this.$store.commit(moduleName + '/initAwkwardness');
                this.$store.commit(moduleName + '/initHeavyIndustry');
            },
            destroy() {
                //切换页面时暂停或销毁上一次正在计算
                if (awkwardnessGrid || heavyIndustryGrid || this.detailbutGrid) {
                    awkwardnessGrid.kill();
                    heavyIndustryGrid.kill();
                    if (this.detailbutGrid) {
                        this.detailbutGrid.kill();
                    }
                }
            },
            // 动态加载数据
            change(event) {
                let text = $(event.currentTarget).find('option:selected').text();
                this.benchLabel = text + "(仓位)";
                let scode = this.$store.state.selectGroup.id;
                this.$store.commit(moduleName + '/initDetailbut');
                // modified by Rencc in 17.10.10
                if (this.detailbutGrid) {
                    this.detailbutGrid.kill();
                }
                this.initDataDetailbut.call(this, scode, this.selectedIndustry, this.selectedBench);
            },
            //持仓明细表格数据请求
            initDataDetailbut(nodeId, aggregators, benchId) {
                this.loading4 = true;
                console.log("PositionAnalysis AggregatorID: " + this.getAggregatorIdByName(aggregators));
                this.detailbutGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.positionAnalysis.detailbut,
                    requestParam: {
                        aggregators: aggregators ? [aggregators, 'Security Name'] : ['Industry one', 'Security Name'],
                        aggDefUniqueId: this.getAggregatorIdByName(aggregators),
                        portfolio: nodeId || this.$store.state.selectGroup.id,
                        benchId: benchId || this.selectedBench || 'FKBch~000300SH'
                    },
                    otherParam: {
                        visibleArea: utils.getVisibleArea(".detail_table"),
                        isDepgraph: true
                    },
                    metaHandle: function (metadata) {
                        _self.$store.commit({
                            type: moduleName + '/setDetailbut',
                            newVal: metadata
                        });
                        _self.detailbut.splice(metadata.length);
                    },
                    dataHandle: this.handleDetailbutData
                });
            },
            // 持仓明细表格获取数据
            handleDetailbutData(result) {
                if ($.isArray(result)) { //判断接收的数据是否是数组
                    //读取Name行对应的Default行记录数据
                    var nameValue = result[1], targetValue = result[2];
                    //遍历数据条数
                    for (var cellNum = 0; cellNum < targetValue.length; cellNum++) {
                        var cellValue = targetValue[cellNum].cells, detail = {};
                        detail.name = nameValue[cellNum].cells[0].dataRow + nameValue[cellNum].cells[0].value;
                        detail.securityId = nameValue[cellNum].cells[0].securityId;
                        //遍历数据列数
                        for (var cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                            var colName = cellValue[cellValNum].col_name
                            detail[colName] = cellValue[cellValNum];
                        }
                        //将数据对象绑定到detailbut对象中，用于展示持仓明细
                        this.$set(this.detailbut, targetValue[cellNum].data_row, detail);
                    }
                }
                this.loading4 = false;
                this.$nextTick(function () {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="detail-table"] tr td[cell]', _self.detailbutGrid);
                });
            },
            //重仓股（awkwardness）数据请求
            awkwardnessFun(nodeId) {
                this.loading1 = true;
                var scope = this;
                awkwardnessGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.positionAnalysis.awkwardness,
                    requestParam: {
                        portfolio: nodeId
                    },
                    otherParam: {
                        visibleArea: {
                            height: 155,
                            width: 1000,
                            scrollHeight: 0,
                            scrollWidth: 0,
                            scrollTop: 0,
                            scrollLeft: 0
                        },
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleAwkwardnessData
                });
            },
            // 前5大重仓股获取数据
            handleAwkwardnessData(result) {
                if ($.isArray(result)) { //判断接收的数据是否是数组
                    //读取Name行对应的Default行记录数据
                    var nameValue = result[1], targetValue = result[2];
                    //遍历数据条数
                    for (var cellNum = 1; cellNum < targetValue.length; cellNum++) {
                        var cellValue = targetValue[cellNum].cells, temp = {}, cells = nameValue[cellNum].cells[0];
                        temp.name = cells.value;
                        temp.securityId = cells.securityId;
                        //遍历数据列数
                        for (var cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                            var colName = cellValue[cellValNum].col_name
                            temp[colName] = cellValue[cellValNum];
                        }
                        //将数据对象绑定到awkwardness对象中，用于展示重仓股
                        this.$set(this.awkwardness, cellNum - 1, temp);
                    }
                }
                this.loading1 = false;
                this.$nextTick(function () {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="awkwardness"] tr td[cell]', awkwardnessGrid);
                })
            },
            // 重仓行业（heavyIndustry）数据请求
            heavyIndustryFun(nodeId) {
                this.loading2 = true;
                var scope = this;
                heavyIndustryGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.positionAnalysis.heavyIndustry,
                    requestParam: {
                        portfolio: nodeId
                    },
                    otherParam: {
                        visibleArea: {
                            height: 155,
                            width: 1000,
                            scrollHeight: 0,
                            scrollWidth: 0,
                            scrollTop: 0,
                            scrollLeft: 0
                        },
                        isDepgraph: true
                    },
                    metaHandle: null,
                    dataHandle: this.handleHeavyIndustryData
                });
            },
            // 前5大重仓行业获取数据
            handleHeavyIndustryData(result) {
                if ($.isArray(result)) { //判断接收的数据是否是数组
                    //读取Name行对应的Default行记录数据
                    var nameValue = result[1], targetValue = result[2];
                    //遍历数据条数
                    for (var cellNum = 1; cellNum < targetValue.length; cellNum++) {
                        var cellValue = targetValue[cellNum].cells, subIndustry = {};
                        subIndustry.name = nameValue[cellNum].cells[0].value;
                        subIndustry.securityId = nameValue[cellNum].cells[0].securityId;
                        //遍历数据列数
                        for (var cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                            var colName = cellValue[cellValNum].col_name
                            subIndustry[colName] = cellValue[cellValNum];
                        }
                        //将数据对象绑定到heavyIndustry对象中，用于展示重仓行业
                        this.$set(this.heavyIndustry, cellNum - 1, subIndustry);
                    }
                }
                this.loading2 = false;
                this.$nextTick(function () {
                    new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="heavyIndustry"] tr td[cell]', heavyIndustryGrid);
                })
            },
            bindListenerOnModal() {
                $('.positiondrag').on('shown.bs.modal', function () {
                    _self.detailBtnClick()
                });
                $('.positiondrag').on('hide.bs.modal', function () {
                    $('.OG-cell-options').hide();
                });
            },
            // 明细按钮绑定弹窗
            detailBtnClick() {
                //请求前先清除缓存
                this.$store.commit(moduleName + '/initDetailbut');
                var nodeId = this.$store.state.selectGroup.id;
                if (this.detailbutGrid) {
                    this.detailbutGrid.kill();
                }
                this.initDataDetailbut.call(this, nodeId, this.selectedIndustry, this.selectedBench);
                $('.OG-cell-options').hide();
            },
            //图表数据请求
            reportEchartData(nodeId) {
                this.loading3 = true;
                positionAnalysisChartData = og.views.analytics.griddata.loadChartData({
                    name: og.api.rest.views.parame.positionAnalysis.reportEchartData,
                    requestParam: {
                        portfolio: nodeId
                    },
                    otherParam: {
                        lineNum: 2
                    },
                    titleHandle: this.loadTitleData,
                    dataHandle: this.loadLineData
                });
            },
            loadTitleData(data) {
                this.chart[0].setOption({
                    legend: {
                        data: ['沪深300点位', data + '股票仓位']
                    },
                    series: [{name: '沪深300点位'}, {name: data + '股票仓位'}]
                });
            },
            loadLineData(data) {
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
                    this.chart[0].setOption({
                        xAxis: [{
                            data: $time
                        }]
                    });
                    var scope = this;
                    setTimeout(function () {
                        var max, min, interval;
                        if (data.num == 2) {
                            max = Math.max.apply(Math, $value);
                            min = Math.min.apply(Math, $value);
                            interval = (max - min) / 5;
                            scope.chart[0].setOption({
                                yAxis: [{
                                    max: max,
                                    min: min,
                                    interval: interval
                                }, {}],
                                series: [{
                                    data: $value
                                }, {}]
                            })
                        } else {
                            max = Math.max.apply(Math, $value);
                            min = Math.min.apply(Math, $value);
                            interval = (max - min) / 5;
                            scope.chart[0].setOption({
                                yAxis: [{}, {
                                    max: max,
                                    min: min,
                                    interval: interval
                                }],
                                series: [{}, {
                                    data: $value
                                }]
                            })
                        }
                    }, 200);
                }
                this.loading3 = false;
            },
            getLastVisit() {
                var portfolio = utils.getPortfolio(), _portfolioid = portfolio.id;
                this.awkwardnessFun(_portfolioid);
                this.heavyIndustryFun(_portfolioid);
                this.initDataDetailbut(_portfolioid);
                this.reportEchartData(_portfolioid);
            },
            addVisit(event) {
                var $target = $(event.currentTarget), _$start = $target.attr('data-row'),
                    _$end = $target.attr('data-splice');
                if (_$start && _$end) {
                    this.detailbutGrid.busy(true);
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $itemSplice = "this.detailbut.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $itemSplice = $itemSplice.concat(",empty");
                    }
                    $itemSplice = $itemSplice + ")";
                    eval("(" + $itemSplice + ")");
                    if (this.detailbutGrid.resize(_$start)) {
                        this.detailbutGrid.busy(false);
                    }
                    return;
                } else if (/data-row/g.test($target.html())) {
                    var target = $target.html();
                    if (target.indexOf('node collapse') > 0 || target.indexOf('node expand') > 0) {
                        $target = $(target.replace(/&nbsp;/g, '')), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                        this.detailbutGrid.busy(true);
                        var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                        var empty = [];
                        var $itemSplice = "this.detailbut.splice(_$$start+1,_$$end-_$$start";
                        for (var i = 0; i < (_$$end - _$$start); i++) {
                            $itemSplice = $itemSplice.concat(",empty");
                        }
                        $itemSplice = $itemSplice + ")";
                        eval("(" + $itemSplice + ")");
                        if (this.detailbutGrid.resize(_$start)) {
                            this.detailbutGrid.busy(false);
                        }
                        return;
                    } else {
                        var searchName = target.substring(target.lastIndexOf(';') + 1, target.length);
                        var scope = this;
                        var doSearch = function (keyword) {
                            og.api.rest.searchtext.get({
                                searchtext: keyword,
                                stype: "0"
                            }).pipe(function (result) {
                                    //数据绑定
                                    var result = result.data;
                                    if ($.isArray(result)) {
                                        var securityId = result[0][0].code;
                                        $('div.modal-backdrop').remove();
                                        scope.$store.commit({
                                            type: 'passScode',
                                            scode: securityId
                                        });
                                        $('.positiondrag').modal('hide');
                                        scope.$router.push({name: 'stockInfo'});
                                        securityId = securityId.substr(2) + securityId.substring(0, 2);
                                        var fakeData = ["FKSec", securityId, searchName, "2"];
                                        utils.addLastVisit(fakeData, 'recent', function (data) {
                                        });
                                    }
                                }
                            );
                        };
                        doSearch(searchName);
                    }
                    return;
                } else {
                    var sCode = $target.attr('securityid'), sName = $target.html().replace(/&nbsp;/g, '');
                    if (!sCode) {
                        return;
                    } else {
                        $('div.modal-backdrop').remove();
                        var _data = sCode.split('~');
                        if (sCode && sCode.indexOf('~') > -1 && _data) {
                            var _scode = _data[1], _scode = _scode.substr(-2) + _scode.substring(0, _scode.length - 2);
                            this.$store.commit({
                                type: 'passScode',
                                scode: _scode
                            });
                        }
                        common.reqLastVisit(sCode, sName, 2, 'recent', this.$router);
                    }
                }
            },
            /**
             * 根据维度名称返回维度指标id(无匹配结果默认返回“申万一级-证券名称”)
             *
             * @param name 维度名称
             * @return {string} 维度指标id（eg: DbCfg~100）
             */
            getAggregatorIdByName(name) {
                let uniqueId = 'DbCfg~107';
                if (name) {
                    name = name.trim();
                    switch (name) {
                        case 'Industry one':
                            uniqueId = 'DbCfg~107';
                            break;
                        case 'Market Value':
                            uniqueId = 'DbCfg~108';
                            break;
                        case 'Market Board':
                            uniqueId = 'DbCfg~109';
                            break;
                        default:
                            uniqueId = 'DbCfg~107';
                            break;
                    }
                }
                return uniqueId;
            }
        }
    }

</script>
<style scoped>
    .modal .table-common {
        width: 100%
    }

    @import "./../../styles/default1/TabClass/positionAnalysis.css";
</style>