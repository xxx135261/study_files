<template src="../html/recentVisit.html"></template>

<script>
    import {priceColorFilter} from '../../scripts/core/util/com.hundsun.pas.common.util.filters';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'recentVisit';

    var common = $.common();
    var utils = $.pasUtils();
    var _self;

    export default {
        name: "recentVisit",
        data() {
            return {
                basicInfoGrid: null,
                loading: null,
                /*下拉框cellmenu对象*/
                cellmenu: null
            }
        },
        computed: {
            basicInfo: () => {
                return _self.$store.state.recentVisit.basicInfo;
            }
        },
        created() {
            _self = this;
        },
        mounted() {
            this.loadData();
        },
        destroyed() {
            this.destroy();
            $('.OG-cell-options').remove();
        },
        methods: {
            loadData: function () {
                this.destroy();
                this.basicInfoFun("AgPrt~UserRecentVisited");
            },
            destroy: function () {
                //切换页面时暂停或销毁上一次正在计算
                if (this.basicInfoGrid) {
                    this.basicInfoGrid.kill();
                }
            },
            basicInfoFun: function (nodeId) {
                this.loading = true;
                this.basicInfoGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.recentVisit.basicInfo,
                    requestParam: {
                        portfolio: nodeId
                    },
                    otherParam: {
                        isDepgraph: true,
                        visibleArea: utils.getVisibleArea('.empiriat')
                    },
                    metaHandle: function (metadata) {
                        if (!_self.basicInfo || _self.basicInfo.length == 0) {
                            _self.$store.commit({
                                type: moduleName + '/initBasicInfo',
                                newVal: metadata
                            });
                            // 因为第一行组合层的数据是不展示的所以去掉一行
                            _self.basicInfo.splice(metadata.length - 1, 1);
                        }
                    },
                    dataHandle: this.handleBasicInfoData
                });
                this.cellmenu = new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="recentVisitTable"] tr td[cell]', this.basicInfoGrid);
            },
            handleBasicInfoData: function (result) {
                if ($.isArray(result)) {
                    //读取Name行对应的Default行记录数据
                    let nameValue = result[1], targetValue = result[2];
                    //遍历数据条数
                    for (let cellNum = 1; cellNum < targetValue.length; cellNum++) {
                        let cellValue = targetValue[cellNum].cells, detail = {}, num = targetValue[cellNum].data_row;
                        detail.name = nameValue[cellNum].cells[0].value;
                        detail.securityId = nameValue[cellNum].cells[0].securityId;
                        //遍历数据列数
                        for (let cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                            let colName = cellValue[cellValNum].col_name, value = cellValue[cellValNum];
                            detail[colName] = value;
                            let curr, last, indicator = !value || !value.h || !value.h.length ? null
                                : (curr = value.h[value.h.length - 1]) < (last = value.h[value.h.length - 2]) ? 'down'
                                    : curr > last ? 'up' : 'smooth';
                            detail[colName].state = indicator;
                        }
                        //判断涨跌幅如果没有值就不加小括号
                        let p_fluc = detail['Price Fluctuation'].value,
                            p_range = detail['Price Fluctuation Range'].value;
                        if (p_fluc && p_range) {
                            detail['Price Fluctuation'].value = p_fluc + '（' + p_range + '）';
                        } else {
                            detail['Price Fluctuation'].value = p_fluc + p_range;
                        }
                        this.$set(this.basicInfo, num - 1, detail);
                    }
                    this.$nextTick(function () {
                        if (_self.cellmenu) {
                            // 更新cellmenu绑定的表格
                            _self.cellmenu.updateGrid();
                        }
                    });
                }
                this.loading = false;
            },
            addVisit: function (event) {
                var $target = $(event.target);
                var sCode = $target.attr('itemScode');
                var sName = $target[0].innerHTML;
                if (!sCode) {
                    return;
                } else {
                    common.reqLastVisit(sCode, sName, 2, "recentVisit", this.$router);
                }
            },
            deleteData: function (event) {
                var $target = $(event.target);
                //获取当前行securityId
                var id = $target.attr('itemScode');
                if (id.indexOf('~') < 0) {
                    return;
                }
                var idData = id.split('~');

                //判断拿到的新数据里有没有当前id，有的话就删掉相应数据并更新数据
                function getId(arr, id) {
                    for (var i = 0; i < arr.length; i++) {
                        if (id == arr[i].securityId) {
                            arr.splice(i, 1);
                        }
                    }
                    return arr;
                }
                var scope = this;
                //将当前删除行的id传给后台，用来删除后台数据
                utils.deleteSecurity(idData, null, function (data) {
                    let result = data.data;
                    if (!data.error && result.msg_no == 0) {
                        setTimeout(function () {
                            getId(scope.basicInfo, id);
                            $.showNotice('移除成功！');
                        }, 300);
                    } else {
                        $.showNotice('移除失败！', 'error');
                    }
                });
            },
            cellClassName(rowData, rowIndex, column, columnIndex) {
                if (columnIndex > 0 && columnIndex < 5) {
                    let cell = rowData['Price Fluctuation'], val;
                    if (cell) {
                        val = rowData['Price Fluctuation'].value;
                    }
                    return priceColorFilter(val);
                }
            }
        }
    }
</script>

<style scoped>
    .table-common {
        width: 100%;
    }
</style>