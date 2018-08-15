<template>
    <div class="pas-table" v-bind:style="{width: width, height: height}">
        <!--横向滚动表头-->
        <div class="pas-table_scroll-header-area-wrapper" v-bind:style="{left: fixedColW + 'px'}">
            <div class="pas-table_header-wrapper" v-bind:style="{'margin-left': '-' + fixedColW + 'px'}">
                <pas-table-header
                        :table-id="tableId"
                        :store="store"
                        :width="width"
                        :height="height"
                        :colDrag="colDrag"
                        :table-style="{'background-color': '#E6E8EC'}">
                    <th slot="resize_th" style="width: 1000px; min-width: 1000px; max-width: 1000px;"></th>
                </pas-table-header>
            </div>
        </div>
        <!--固定列表格体-->
        <div class="pas-table_fixed-wrapper" v-if="fixedColumns.length > 0"
             v-bind:style="{width: (fixedColW + 1) + 'px', top: fixedRowH + 'px'}">
            <div class="pas-table_fixed-header-wrapper" v-bind:style="{'margin-top': '-' + (fixedRowH + 1) + 'px'}">
                <pas-table-header
                        :table-id="tableId"
                        :store="store"
                        :width="width"
                        :height="height"
                        :table-style="{'background-color': '#E6E8EC'}">
                </pas-table-header>
            </div>
            <div class="pas-table_fixed-body-wrapper">
                <pas-table-body
                        :table-id="tableId"
                        :store="store"
                        :depId="depId"
                        show="fixed"
                        :width="width"
                        :height="height"
                        :selectable="selectable"
                        :table-style="{'background-color': '#FAFAFA'}"
                        :cell-class-name="cellClassName">
                </pas-table-body>
            </div>
        </div>
        <!--固定列表头固定-->
        <div class="pas-table_common-header-area-wrapper" v-if="fixedColumns.length > 0"
             v-bind:style="{width: (fixedColW + 1) + 'px', height: (fixedRowH + 1) + 'px'}">
            <div class="pas-table_header-wrapper">
                <pas-table-header
                        :table-id="tableId"
                        :store="store"
                        :width="width"
                        :height="height"
                        :table-style="{'background-color': '#E6E8EC'}">
                </pas-table-header>
            </div>
        </div>
        <!--主体表格-->
        <div class="pas-table_main-wrapper" v-bind:style="{left: (fixedColW + 1) + 'px', top: (fixedRowH + 1) + 'px'}">
            <div class="pas-table_header-wrapper"
                 v-bind:style="{'margin-left': '-' + (fixedColW + 1) + 'px', 'margin-top': '-' + (fixedRowH + 2) + 'px'}">
                <pas-table-header
                        :table-id="tableId"
                        :store="store"
                        :width="width"
                        :height="height"
                        :table-style="{'background-color': '#fff'}">
                </pas-table-header>
            </div>
            <div class="pas-table_body-wrapper" v-bind:style="{'margin-left': '-' + (fixedColW + 1) + 'px'}">
                <div class="pas-table_body-append-wrapper"
                     v-bind:style="{width: width + 'px'}"
                     v-if="$slots.append" style="background-color: #f5f5f5;">
                    <slot name="append"></slot>
                </div>
                <pas-table-body
                        :table-id="tableId"
                        :depId="depId"
                        :store="store"
                        :width="width"
                        :height="height"
                        :sparkline="sparkline"
                        :selectable="selectable"
                        :table-style="{'background-color': '#fff'}"
                        :cell-class-name="cellClassName">
                </pas-table-body>
            </div>
        </div>
        <!--遮罩层，用于表格内容高度小于表格高度时遮罩固定列最后一行-->
        <div class="white_mask"
             v-bind:style="{width: (fixedColW + 1) + 'px', height: '20px', top: tableRealH + 'px'}"></div>
        <!--列宽拖拽指示线-->
        <div class="pas-table_resizeHandler" ref="resizeHandler"></div>
        <!--列拖拽指示块-->
        <div class="pas-table_columDragger" v-if="colDrag" ref="columDragger"></div>
        <div class="hidden-columns">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import TableBody from "../table/table-body.vue";
    import TableHeader from "../table/table-header.vue";
    import TableStore from "../../../scripts/widgets/pasTable/table-store";

    // TODO: 将行高作为接口开放
    /*表格行高*/
    const ROW_HEIGHT = 24;
    let tableIdSeed = 100;

    export default {
        name: "PASTable",
        data() {
            return {
                store: new TableStore(this, {}),
                tableId: tableIdSeed++,
                /*固定行行高*/
                fixedRowH: ROW_HEIGHT
            };
        },
        components: {
            "pas-table-body": TableBody,
            "pas-table-header": TableHeader
        },
        props: {
            /*表格数据*/
            data: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            /*Grid对象*/
            grid: Object,
            /*表格宽度（例如：'100%', '100px'）*/
            width: String,
            /*表格高度（例如：'100%', '100px'）*/
            height: String,
            /*单元格类名*/
            cellClassName: [String, Function],
            /*表格滚动事件回调函数*/
            scrollHandler: Function,
            /*表格resize事件回调函数*/
            resizeHandler: Function,
            /*计算区域变化函数*/
            gridResize: {
                type: Function,
                // type: ['resize', 'scroll']
                default: function(element, type) {
                    let scrollTop = element.scrollTop, scrollLeft = element.scrollLeft;//滚动高度
                    let grid = this.grid;
                    // 当后台返回表格信息（metadata）时才触发resize
                    if (grid && grid.meta) {
                        // modified by Rencc in 2018.1.3. 用于解决窗口非常小resize到较大窗口时，滚动条移动到最后少一条数据的问题
                        grid.elements.scrollTop = scrollTop + 25;
                        /*目前表格和后台计算还没有关联，所以当列顺序与视图配置顺序不一致时，水平滚动会导致表格显示不正常（实时盯盘表格）。
                        因此，暂时先不处理水平滚动的情况，将计算区域的宽度设一个较大的值*/
//                        grid.elements.scrollLeft = scrollLeft;
                        if (type == "scroll") {
                            grid.scrollend();
                        } else if (type == "resize") {
                            let tableRect = this.$el.getBoundingClientRect();
                            let width = tableRect.width - this.fixedColW;
                            let height = tableRect.height - this.fixedRowH;
//                            grid.elements.width = width;
                            grid.elements.width = 2000;
                            grid.elements.height = height;
                            grid.resize();
                        } else {
                            console.warn("Type must be either 'scroll' or 'resize'.");
                        }
                    }
                }
            },
            /*是否开启列位置拖拽*/
            colDrag: {
                type: Boolean,
                default: true
            },
            /*是否可以调整列宽*/
            resizable: {
                type: Boolean,
                default: true
            },
            /*用于挂载下钻框的tabid*/
            depId: [String],
            /*是否开启迷你折线图*/
            sparkline: {
                type: Boolean,
                default: false
            },
            /*行是否可选中*/
            selectable: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            fixedColumns() {
                return this.store.states.fixedColumns;
            },
            notFixedColumns() {
                return this.store.states.notFixedColumns;
            },
            fixedColumnsTrimmed() {
                return this.store.states.fixedColumnsTrimmed;
            },
            notFixedColumnsTrimmed() {
                return this.store.states.notFixedColumnsTrimmed;
            },
            columns() {
                return this.store.states.columns;
            },
            /*固定列宽度*/
            fixedColW() {
                let fixedColumnW = 0;
                this.fixedColumns.forEach(function(val) {
                    if (val.visible) {
                        fixedColumnW += Number(val.realWidth);
                    }
                });
                return fixedColumnW;
            },
            /*表格内容区域高度*/
            tableRealH() {
                // 有效的数据行数。对象包含length属性并且值为0的视为无效的空行。
                let validNum = this.data.filter(val => val.length != 0).length;
                return (validNum + 1) * ROW_HEIGHT + 1;
            }
        },
        watch: {
            data: {
                immediate: true,
                handler(val) {
                    this.store.commit("setData", val);
                }
            }
        },
        mounted() {
            this.syncScroll();
            // 没有固定列时设置平均列宽
            if (this.fixedColumns.length == 0) {
                this.setEqualColumnWidth();
            }
            $(window).on("resize", this.resizeCallback);
        },
        deactivated() {
            $(window).off("resize", this.resizeCallback);
        },
        activated() {
            // 没有固定列时设置平均列宽
            if (this.fixedColumns.length == 0) {
                this.setEqualColumnWidth();
            }
            $(window).on("resize", this.resizeCallback);
        },
        destroyed() {
            $(window).off("resize", this.resizeCallback);
        },
        methods: {
            /*设置表头、固定列联动滚动*/
            syncScroll() {
                let element = $(this.$el);
                let _self = this;
                element.find(".pas-table_main-wrapper").scroll(function() {
                    let mainTable = element.find(".pas-table_main-wrapper")[0];
                    let scrollTop = mainTable.scrollTop;
                    let scrollLeft = mainTable.scrollLeft;

                    let fixedTablePart = element.find(".pas-table_fixed-wrapper");
                    if (fixedTablePart.length > 0) {
                        fixedTablePart[0].scrollTop = scrollTop;
                    }

                    let scrollHeaderPart = element.find(".pas-table_scroll-header-area-wrapper");
                    if (scrollHeaderPart.length > 0) {
                        scrollHeaderPart[0].scrollLeft = scrollLeft;
                    }

                    if (_self.scrollHandler) {
                        _self.scrollHandler();
                    }
                    _self.gridResize(mainTable, "scroll");
                });
            },
            /*resize时间回调函数*/
            resizeCallback(event) {
                let el = $(this.$el);

                this.gridResize(el.find(".pas-table_main-wrapper")[0], "resize");
                if (this.resizeHandler) {
                    this.resizeHandler();
                }

                // 没有固定列时设置平均列宽
                if (this.fixedColumns.length == 0) {
                    this.setEqualColumnWidth();
                }
            },
            /*设置平均列宽*/
            setEqualColumnWidth() {
                let el = $(this.$el);
                // 设置平均列宽
                let columnWidth = (el.width() - 24) / this.columns.length;
                this.columns.forEach(function(val) {
                    if (columnWidth > 35) {
                        val.width = val.realWidth = columnWidth;
                    }
                });

                if (this.$slots.append) {
                    el.find(".pas-table_body-append-wrapper td").each(function() {
                        $(this).css({
                            width: columnWidth + "px"
                        });
                    });
                }
            },
            /*获取当前选中行*/
            getCurrentRow() {
                return this.store.states.highlight;
            }
        }
    };
</script>
<style scoped>
    @import "../../../styles/default1/Table/tableStyle.css";
</style>