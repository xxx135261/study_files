<template src="../html/realtimeStare.html"></template>
<script>
    import {mapState} from 'vuex';
    import {priceColorFilter} from '../../scripts/core/util/com.hundsun.pas.common.util.filters';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'realtimeStare';

    var realTimeStock;
    var realIndex = 0;
    var utils = $.pasUtils();
    var common = $.common();
    let _self;
    export default {
        name: "realtimeStare",
        data() {
            return {
                selectGroup: [],
                realtimeData: [],
                realtimeGrid: null,
                activated:true,
                state: "pause",
                timeout: null,
                scode: null,
                toggleItem: null,
                loading: true,
                loading2: true,
                /*下拉框cellmenu对象*/
                cellmenu: null
            }
        },
        computed: {
            ...mapState(moduleName, {
                echartConfig: state => state.echartConfig
            }),
            auth() {
                return this.$store.state.auth;
            }
        },
        created() {
            _self = this;
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
        mounted() {
            _self.loadData();
        },
        destroyed() {
            $('.OG-cell-options').remove();
        },
        beforeRouteLeave(to, from, next) {
            if (!this.auth) {
                $('#homePage').modal();
                next(false);
            } else {
                next();
            }
        },
        methods: {
            //数据请求
            loadData(scode) {
                //判断当前请求的组合ID与上次计算的组合ID是否相同
                var currentPort = this.$store.state.selectGroup;
                if (!scode && !currentPort.name || !currentPort.id) {
                    return ;//setTimeout(this.loadData, 1000);
                }
                if (scode != currentPort.id) {
                    this.pauseORresume();
                }
                scode = (!scode ? currentPort.id : scode);
                //暂停或销毁上一次计算
                if (this.realtimeGrid) {
                    this.realtimeGrid.kill();
                    this.realtimeGrid = null;
                }
                this.loading2 = true;
                this.timeTicket(scode);
                this.loadGridData(scode);
            },
            //表格数据请求
            loadGridData(nodeId) {
                this.loading = true;
                var $this = this;
                this.realtimeGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.realtimeStare.realtimeGrid,
                    requestParam: {
                        portfolio: nodeId
                    },
                    otherParam: {
                        isDepgraph: true,
                        visibleArea: this.realtimeStareVisibleArea()
                    },
                    metaHandle: function (metadata) {//处理表格显示条数
                        if (metadata) {
                            $this.realtimeData = metadata;
                        }
                    },
                    dataHandle: this.handleLoadGridData
                });
                this.cellmenu = new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="realtimeStare-table"] tr td[cell]', this.realtimeGrid);
            },
            //获取表格数据并显示
            handleLoadGridData(result) {
                if ($.isArray(result)) { //判断接收的数据是否是数组
                    //读取Name行对应的Default行记录数据
                    var nameValue = result[1], targetValue = result[2];
                    //遍历数据条数
                    for (var cellNum = 0; cellNum < targetValue.length; cellNum++) {
                        var cellValue = targetValue[cellNum].cells, detail = {}, num = targetValue[cellNum].data_row;
                        detail.Name = nameValue[cellNum].cells[0].dataRow + nameValue[cellNum].cells[0].value;
                        detail.securityId = nameValue[cellNum].cells[0].securityId;
                        //遍历数据列数
                        for (var cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                            var colName = cellValue[cellValNum].col_name, value = cellValue[cellValNum],
                                h = value.h;
                            detail[colName] = value;
                            var curr, last, indicator = !value || !value.h || !value.h.length ? null
                                : (curr = value.h[value.h.length - 1]) < (last = value.h[value.h.length - 2]) ? 'down'
                                    : curr > last ? 'up' : 'smooth';
                            detail[colName].state = indicator;
                            detail[colName].h = h;
                        }
                        //将数据对象绑定到realtimeData对象中，用于展示实时盯盘表格明细
                        this.$set(this.realtimeData, num, detail);
                    }
                    this.$nextTick(function () {
                        if (_self.cellmenu) {
                            // 更新cellmenu绑定的表格
                            _self.cellmenu.updateGrid();
                        }
                    });
                    this.loading = false;
                }
            },
            //实时净值走势
            timeTicket(nodeId) {
                let that = this;
                setTimeout(function () {
                    try {
                        if (typeof (realTimeStock) != 'undefined' && realTimeStock) {
                            realTimeStock.kill();
                        }
                    } catch (e) {
                        throw e;
                    }
                    that.chart[0].setOption(that.chart[0].getOption(), true);
                    realTimeStock = new og.analytics.realtime.stock.loadStockData({
                        name: og.api.rest.views.parame.realtimeStare.timeTicket,
                        requestParam: {
                            portfolio: nodeId
                        },
                        otherParam: {
                            plugin: that.chart[0],
                            handleDataLoaded: function () {
                                _self.loading2 = false;
                            }
                        }
                    });
                }, 0);
            },
            //当焦点离开当前页面时，则调用事件驱动，销毁当前请求数据
            pauseORresume() {
                try {
                    if (this.timeout) {
                        clearTimeout(this.timeout);
                    } else {
                        var scope = this;
                        this.timeout = setTimeout(function () {
                            if (typeof (realTimeStock) != 'undefined' && realTimeStock) {
                                realTimeStock.pools().forEach(function (val) {
                                    og.api.rest.realtime.status.pause_or_resume({view_id: val, state: scope.state});
                                    if (scope.state == 'pause')
                                        scope.state = 'resume';
                                    else
                                        scope.state = 'pause';
                                });
                            }
                        }, 60 * 1000);
                    }
                } catch (e) {
                    throw e;
                }
            },
            //收缩及展开访问
            addVisit(event) {
                var $target = $(event.target), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                if (_$start && _$end) {
                    this.realtimeGrid.busy(true);
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $realTimeGridplice = "this.realtimeData.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $realTimeGridplice = $realTimeGridplice.concat(",empty");
                    }
                    $realTimeGridplice = $realTimeGridplice + ")";
                    eval("(" + $realTimeGridplice + ")");
                    if (this.realtimeGrid.resize(_$start)) {
                        this.realtimeGrid.busy(false);
                    }
                } else if (/data-row/g.test($target.html())) {
                    $target = $($target.html().replace(/&nbsp;/g, '')), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                    this.realtimeGrid.busy(true);
                    var _$$start = parseInt(_$start),
                        _$$end = parseInt(_$end);
                    var empty = [];
                    var $realTimeGridplice = "this.realtimeData.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $realTimeGridplice = $realTimeGridplice.concat(",empty");
                    }
                    $realTimeGridplice = $realTimeGridplice + ")";
                    eval("(" + $realTimeGridplice + ")");
                    if (this.realtimeGrid.resize(_$start)) {
                        this.realtimeGrid.busy(false);
                    }
                } else {
                    var sCode = $target.attr('securityid');
                    var sName = $target.html().replace(/&nbsp;/g, '')
                    if (!sCode) {
                        return;
                    } else {
                        common.reqLastVisit(sCode, sName, 2, 'recentVisit', this.$router);
                    }
                }
            },
            //数据加载完之后执行切换展示的状态
            dataOver(index) {
                if (this.toggleItem) {
                    var index = this.toggleItem.index;
                    var num = index + 1;
                    var state = (this.contractState[index] || this.contractState[index] == undefined) ? true : false;
                    if (!state) {
                        this.toggleItem.item = Vue.copy(this.realtimeData[index]);
                    }
                    for (var i = num; i <= this.toggleItem.item.child + index; i++) {
                        this.states[i] = !state;
                        this.contractState[index] = !state;
                    }
                    this.toggleItem = null;
                }
            },
            cellClassName(rowData, rowIndex, column, columnIndex) {
                if (columnIndex > 1) {
                    if (rowData['Price Fluctuation Range']) {
                        return priceColorFilter(rowData['Price Fluctuation Range'].value);
                    }
                    return '';
                }
            },
            realtimeStareVisibleArea() {
                let area = utils.getVisibleArea(".realtime_table");
                /*目前表格和后台计算还没有关联，所以当列顺序与视图配置顺序不一致时，水平滚动会导致表格显示不正常（实时盯盘表格）。
                  因此，暂时先不处理水平滚动的情况，将计算区域的宽度设一个较大的值*/
                area.width = 2000;
                return area;
            }
        }

    }

</script>
<style scoped>
    @import "./../../styles/default1/TabClass/realtimeState.css";
</style>