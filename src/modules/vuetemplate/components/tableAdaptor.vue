<template>
    <div class="pas-table-wrapBox">
        <pas-table :data="config.table.data"
                   :grid="config.table.grid"
                   :dep-id="config.table.depId"
                   width="100%"
                   height="100%"
                   :resizable="false"
                   :colDrag="false"
                   ref="table">
            <pas-table-column v-if="config.columns.length > 0"
                              prop="Name"
                              :dep="false"
                              label="证券名称">
                <template slot-scope="scope">
                    <div :itemScode="scope.row.data.securityId" v-html="scope.row.data.Name"
                         @click="expandOrShrink($event)"
                         style="cursor:pointer;">
                    </div>
                </template>
            </pas-table-column>
            <pas-table-column v-if="config.columns.length > 0" v-for="(column, index) in config.columns" :key="index"
                              :prop="column.header"
                              :dep="true"
                              :label="column.header">
            </pas-table-column>
        </pas-table>
    </div>
</template>

<script>
    const common = $.common();

    export default {
        name: 'TableAdaptor',
        data() {
            return {
                config: {
                    table: {
                        /*表格数据*/
                        data: [],
                        /*下钻表格标识*/
                        depId: null,
                        /*Grid对象*/
                        grid: null,
                        /*下钻插件cellmenu对象*/
                        cellmenu: null
                    },
                    columns: []
                }
            }
        },
        watch: {
            'config.columns': {
                handler(newVal) {
                    this.$refs.table.setEqualColumnWidth();
                }
            }
        },
        mounted() {
            setTimeout(() => {
                this.$refs.table.setEqualColumnWidth();
            }, 0);
        },
        methods: {
            /**
             * 展开和收缩
             *
             * @param event js Event对象
             */
            expandOrShrink(event) {
                const grid = this.config.table.grid;

                var $target = $(event.target), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                if (_$start && _$end) {
                    if (grid) {
                        grid.busy(true);
                    }
                    var _$$start = parseInt(_$start), _$$end = parseInt(_$end);
                    var empty = [];
                    var $realTimeGridplice = "this.config.table.data.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $realTimeGridplice = $realTimeGridplice.concat(",empty");
                    }
                    $realTimeGridplice = $realTimeGridplice + ")";
                    eval("(" + $realTimeGridplice + ")");
                    if (grid) {
                        if (grid.resize(_$start)) {
                            grid.busy(false);
                        }
                    }
                } else if (/data-row/g.test($target.html())) {
                    $target = $($target.html().replace(/&nbsp;/g, '')), _$start = $target.attr('data-row'), _$end = $target.attr('data-splice');
                    if (grid) {
                        grid.busy(true);
                    }
                    var _$$start = parseInt(_$start),
                        _$$end = parseInt(_$end);
                    var empty = [];
                    var $realTimeGridplice = "this.config.table.data.splice(_$$start+1,_$$end-_$$start";
                    for (var i = 0; i < (_$$end - _$$start); i++) {
                        $realTimeGridplice = $realTimeGridplice.concat(",empty");
                    }
                    $realTimeGridplice = $realTimeGridplice + ")";
                    eval("(" + $realTimeGridplice + ")");
                    if (grid) {
                        if (grid.resize(_$start)) {
                            grid.busy(false);
                        }
                    }
                } else {
                    var sCode = $target.attr('itemScode');
                    var sName = $target.html().replace(/&nbsp;/g, '')
                    if (!sCode) {
                        return;
                    } else {
                        //TODO: 目前无法获取到路由信息对象
//                        common.reqLastVisit(sCode, sName, 2, 'recentVisit', this.$root.$router);
                    }
                }
            },
            /**
             * 设置表格data数组
             *
             * @param newData
             */
            setData(newData) {
                this.config.data = newData;
            },
            /**
             * 获得表格data数组的引用
             */
            getData() {
                return this.config.table.data;
            }
        }
    }
</script>