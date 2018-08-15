<template>
    <div v-bind:class="'pas-table-header_' + tableId">
        <table v-bind:style="tableStyle">
            <thead>
            <tr>
                <th v-for="(column, index) in columns" :key="index"
                    v-show="column.visible"
                    v-bind:style="{'font-weight': 'bold', 'text-align': column.headerAlign, width: column.realWidth + 'px','max-width': column.realWidth + 'px', 'min-width': column.realWidth + 'px'}"
                    :title="column.label"
                    v-on:mousedown="handleMouseDown($event, column)"
                    v-on:mousemove="handelMouseMove($event, column)">
                    <div class="pas-table-th" style="overflow: hidden; text-overflow: ellipsis">{{column.label}}</div>
                    <pas-table-dropdown :store="store"></pas-table-dropdown>
                </th>
                <slot name="resize_th"></slot>
            </tr>
            </thead>
        </table>
    </div>
</template>
<script>
    import TableDropDown from './table-dropdown.vue';

    export default {
        name: 'PASTableHeader',
        components: {
            'pas-table-dropdown': TableDropDown
        },
        props: {
            store: {
                required: true
            },
            tableId: {
                required: true,
                default: ''
            },
            width: [String, Number],
            height: [String, Number],
            show: {
                /*value: full, fixed, not-fixed*/
                type: String,
                default: "full"
            },
            /*表格样式*/
            tableStyle: Object,
            /*列位置调整*/
            colDrag: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            columns() {
                let columns;
                switch (this.show.toLowerCase()) {
                    case "full":
                        columns = this.allColumns;
                        break;
                    case "fixed":
                        columns = this.fixedColumns;
                        break;
                    case "not-fixed":
                        columns = this.notFixedColumns;
                        break;
                    default:
                        columns = this.allColumns;
                }
                return columns;
            },
            allColumns() {
                return this.store.states.columns;
            },
            fixedColumns() {
                return this.store.states.fixedColumns;
            },
            notFixedColumns() {
                return this.store.states.notFixedColumns;
            },
            // 固定列宽度
            fixedColW() {
                let fixedColumnW = 0;
                this.fixedColumns.forEach(function (val) {
                    if (val.visible) {
                        fixedColumnW += Number(val.realWidth);
                    }
                });
                return fixedColumnW;
            }
        },
        methods: {
            /*处理mousedown事件（列宽拖动、列位置调整功能）*/
            handleMouseDown(event, column) {
                if (this.draggingCol) {
                    let _self = this;
                    let columns = _self.columns;

                    this.dragging = true;

                    const table = this.$parent;
                    const tableEl = table.$el;
                    const tableRect = tableEl.getBoundingClientRect();
                    // table左侧与视窗的距离
                    const tableLeft = tableRect.left;
                    const headerEl = event.currentTarget;
                    const headerRect = headerEl.getBoundingClientRect();
                    const headerWidth = parseInt(column.realWidth);

                    let handleMouseMove, handleMouseUp;

                    // 屏蔽选中、拖拽事件
                    document.onselectstart = function () {
                        return false;
                    };
                    document.ondragstart = function () {
                        return false;
                    };

                    // 拖拽列位置
                    if (this.dragColumn) {
                        this.dragState = {
                            // 表头单元与表格左边框的距离
                            startLeft: headerRect.left - tableLeft,
                            // 点击位置与表格左边框的距离
                            startColumnLeft: event.clientX - tableLeft,
                            tableLeft
                        };
                        // 可以移动到与表格左边缘的最小距离
                        let minLeft = (this.fixedColW ? this.fixedColW : 0) - headerWidth / 2;
                        // 可以移动到与表格左边缘的最大距离
                        let maxLeft = 0;

                        // maxLeft等于表格完整显示列的总宽度
                        for (let i = 0; i < columns.length; i++) {
                            let colWidth = parseInt(columns[i].realWidth);
                            maxLeft += colWidth;
                            if (maxLeft >= tableRect.width) {
                                maxLeft -= colWidth
                                break;
                            }
                        }
                        // 减去的值的大小不得大于列宽最小值
                        maxLeft -= 30;

                        const columDragger = table.$refs.columDragger;
                        columDragger.style.width = column.realWidth + 'px';
                        columDragger.style.height = '24px';
                        columDragger.innerText = column.label;

                        const calInsertPos = () => {
                            const finalLeft = parseInt(columDragger.style.left, 10);
                            // 基准位置，当前列右边缘与表格左边框的距离
                            const benchLeft = headerRect.right - tableLeft;

                            // 当前列位于所有列中的位置索引
                            let index = columns.findIndex(col => column.id == col.id);

                            // 拖拽块的位置在当前列的范围外
                            if (finalLeft > benchLeft || finalLeft < (benchLeft - column.realWidth * 2)) {
                                // 拖拽块右边框与基准距离的相对距离
                                let offset = finalLeft - benchLeft + headerWidth;
                                let acc = headerWidth;
                                // 插入的位置索引
                                let insertIndex = -1;
                                // offset大于0则向当前列的右边插入，反之向当前列的左边插入
                                if (offset > 0) {
                                    for (let i = index + 1; i < columns.length; i++) {
                                        // 目标列
                                        let nextColW = parseInt(columns[i].realWidth);
                                        // offset在目标列的宽度范围内则判定可以插入
                                        if (offset > acc && offset < (acc + nextColW)) {
                                            insertIndex = i;
                                            break;
                                        }
                                        acc += nextColW;
                                    }
                                } else {
                                    offset = Math.abs(offset);
                                    for (let j = index - 1; j >= 0; j--) {
                                        let nextColW = parseInt(columns[j].realWidth);
                                        if (offset > acc && offset < (acc + nextColW)) {
                                            insertIndex = j;
                                            break;
                                        }
                                        acc += nextColW;
                                    }
                                }
                                return insertIndex;
                            }
                            return -1;
                        }

                        handleMouseMove = (event) => {
                            // 拖拽距离
                            const moveDist = (event.clientX - tableLeft) - this.dragState.startColumnLeft;
                            const handlerLeft = moveDist + this.dragState.startLeft;

                            let dist;
                            if (handlerLeft > maxLeft) {
                                dist = maxLeft;
                            } else if (handlerLeft < minLeft) {
                                dist = minLeft;
                            } else {
                                dist = handlerLeft;
                            }

                            columDragger.style.left = dist + 'px';
                            $(columDragger).show();
                        };

                        handleMouseUp = () => {
                            if (_self.dragging) {
                                let insertIndex = calInsertPos();

                                if (insertIndex != -1) {
                                    _self.store.commit('removeColumn', column);
                                    _self.store.commit('insertColumn', column, insertIndex);
                                }

                                // 清除拖拽状态、隐藏指示拖拽块
                                _self.dragging = false;
                                _self.dragColumn = false;
                                _self.draggingCol = null;
                                _self.dragState = {};
                                $(columDragger).hide();
                            }

                            document.onselectstart = null;
                            document.ondragstart = null;

                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };
                    } else { // 拖拽列宽
                        this.dragState = {
                            startMouseLeft: event.clientX,
                            // 表头单元格resizeHandler与表格内侧的距离
                            startLeft: headerRect.right - tableLeft,
                            startColumnLeft: headerRect.left - tableLeft,
                            tableLeft
                        };
                        let minLeft = headerRect.left - tableLeft + 32;

                        const resizeHandler = table.$refs.resizeHandler;
                        resizeHandler.style.left = this.dragState.startLeft + 'px';
                        $(resizeHandler).show();

                        handleMouseMove = (event) => {
                            // 拖拽距离
                            const moveDist = event.clientX - this.dragState.startMouseLeft;
                            const handlerLeft = this.dragState.startLeft + moveDist;

                            resizeHandler.style.left = Math.max(minLeft, handlerLeft) + 'px';
                        };

                        handleMouseUp = () => {
                            if (_self.dragging) {
                                const finalLeft = parseInt(resizeHandler.style.left, 10);
                                const columnWidth = finalLeft - _self.dragState.startColumnLeft;
                                // 单元格宽度不小于35px
                                if (columnWidth > 35) {
                                    column.width = column.realWidth = columnWidth;
                                }
                                // 清除拖拽状态、隐藏resize指示线
                                _self.dragging = false;
                                _self.draggingCol = null;
                                _self.dragState = {};
                                $(resizeHandler).hide();
                                //触发窗口改变事件
                                setTimeout(function () {
                                    $(window).resize();
                                }, 0);
                            }

                            document.onselectstart = null;
                            document.ondragstart = null;

                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };
                    }

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                }
            },
            /*处理mousemove事件（控制列宽拖动和列位置调整的鼠标样式）*/
            handelMouseMove(event, column) {
                if (!column || (!column.resizable && !this.colDrag)) {
                    return;
                }

                let target = event.currentTarget;
                let rect = target.getBoundingClientRect();
                let thCell = $(target).find('.pas-table-th')[0];
                let thCellRect = thCell.getBoundingClientRect();
                let thCellOffset = event.pageX - thCellRect.left
                const tableRect = this.$parent.$el.getBoundingClientRect();

                // 当表头单元格宽度大于35px且鼠标的位置在距离表头单元格右边框小于5px时，
                // 才显示col-resize样式的cursor
                if (rect.width > 35 && rect.right - event.pageX < 5 && column.resizable) {
                    target.style.cursor = 'col-resize';
                    this.draggingCol = column;
                    this.dragColumn = false;
                } else if (thCellOffset > 0 && thCellOffset < thCellRect.width && (event.pageX - tableRect.left) > this.fixedColW && this.colDrag) {
                    // 当鼠标移动到表头单元格内的文本上时，鼠标样式变为"move"
                    target.style.cursor = 'move';
                    this.draggingCol = column;
                    this.dragColumn = true;
                } else if (!this.dragging) {
                    target.style.cursor = '';
                    this.draggingCol = null;
                }
            }
        }
    }
</script>