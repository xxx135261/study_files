<template></template>
<script type="text/javascript">

    let columnIdSeed = 100;

    const getDefaultColumn = function (options) {
        const column = {};

        for (let name in options) {
            if (options.hasOwnProperty(name)) {
                const value = options[name];
                if (typeof value !== 'undefined') {
                    column[name] = value;
                }
            }
        }

        // 设置默认最小宽度
        if (!column.minWidth) {
            column.minWidth = 80;
        }

        column.realWidth = column.width || column.minWidth;

        return column;
    }

    const DEFAULT_CLICK_HANDLER = () => {};

    /*默认表格单元格类名*/
    const DEFAULT_CELL_CLASS = 'pas-table-cell';

    export default {
        name: 'PASTableColumn',
        props: {
            /*表头显示文字*/
            label: {
                type: String,
                required: true
            },
            /*单元格数据属性名*/
            prop: String,
            width: [Number, String],
            minWidth: [Number, String],
            /*是否可以调整列宽*/
            resizable: {
                type: Boolean,
                default: undefined
            },
            /*是否为固定列*/
            fixed: {
                type: Boolean,
                default: false
            },
            /*单元格文本对齐方式*/
            align: {
                type: String,
                default: 'left'
            },
            /*表头文本对齐方式*/
            headerAlign: {
                type: String,
                default: 'center'
            },
            // 单元格点击事件函数
            columnClick: Function,
            /*是否下钻，若表格设置depId则该项默认开启*/
            dep: {
                type: Boolean,
                default: undefined
            },
            /*单元格文本开启html渲染*/
            cellHtml: {
                type: Boolean,
                default: false
            },
            /*是否开启迷你折线图，若表格开启sparkline则该项默认开启*/
            sparkline: {
                type: Boolean,
                default: undefined
            },
            /*是否被排除在计算区域外*/
            excluded: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                columnConfig: {}
            }
        },
        created() {
            // column唯一标识，一定不能改变！(eg: table_111111_column_101)
            this.columnId = 'table_' + this.owner.tableId + '_column_' + columnIdSeed++;

            let width = this.width;
            if (width !== undefined) {
                width = parseInt(width, 10);
                if (isNaN(width)) {
                    width = null;
                }
            }

            let minWidth = this.minWidth;
            if (minWidth !== undefined) {
                minWidth = parseInt(minWidth, 10);
                if (isNaN(minWidth)) {
                    minWidth = 80;
                }
            }

            let column = getDefaultColumn({
                id: this.columnId,
                label: this.label,
                prop: this.prop,
                width: this.width,
                minWidth: this.minWidth,
                resizable: this.resizable,
                fixed: this.fixed,
                align: this.align,
                headerAlign: this.headerAlign,
                columnClick: this.columnClick,
                visible: true, /*列默认是可见的*/
                dep: this.dep,
                cellHtml: this.cellHtml,
                sparkline: this.sparkline,
                excluded: this.excluded
            });

            // 如果列未设定sparkline，则默认为表格sparkline的设置；如果表格也未设定sparkline，则为false
            if (column.sparkline === undefined) {
                column.sparkline = this.owner.sparkline === undefined ? false : this.owner.sparkline;
            }

            // 如果列未设定sparkline，且表格设定了depId，则列默认开启dep
            if (column.dep === undefined) {
                let depId = this.owner.depId;
                column.dep = depId !== null && depId !== undefined;
            }

            if (column.resizable === undefined) {
                let ownerResizable = this.owner.resizable;
                column.resizable = ownerResizable === undefined ? false : ownerResizable;
            }

            let _self = this;
            let renderCell = null;
            column.renderCell = function (h, data) {
                renderCell = null;
                // if scoped slot exists.
                if (_self.$scopedSlots.default) {
                    // $scopeSlots.default(arg)的返回值类型是VNode，通过arg向scopedslot传递数据
                    renderCell = _self.$scopedSlots.default({
                        row: {
                            data: data.rowData
                        }
                    });
                }

                if (!renderCell) {
                    let textNode;
                    // 根据是否下钻（dep）取单元格文本数据
                    if (data.column.dep) {
                        let depData = data.rowData[this.prop];
                        if (depData && depData.hasOwnProperty('value')) {
                            textNode = depData.value;
                        }
                    } else {
                        textNode = data.rowData[this.prop];
                    }
                    if (!textNode) {
                        textNode = '';
                    }

                    // 聚合单元格类名
                    let bodyContext = data._self;
                    let classes = [DEFAULT_CELL_CLASS];
                    let className = bodyContext.cellClassName;
                    if (className) {
                        if (typeof className === 'function') {
                            classes = classes.concat(className(data.rowData, data.rowIndex, data.column, data.columnIndex));
                        } else if (typeof  className === 'string') {
                            classes.push(className);
                        } else {
                            console.error('\'cellClassName\' should be either a String or a Function.');
                        }
                    }

                    if (this.cellHtml) {
                        renderCell = h(
                            'div',
                            {
                                'class': classes,
                                on: {
                                    click: _self.columnClick || DEFAULT_CLICK_HANDLER
                                },
                                domProps: {
                                    innerHTML: textNode
                                }
                            }
                        );
                    } else {
                        renderCell = h(
                            'div',
                            {
                                'class': classes,
                                on: {
                                    click: _self.columnClick || DEFAULT_CLICK_HANDLER
                                }
                            },
                            [textNode]
                        );
                    }
                }
                return renderCell;
            }
            this.columnConfig = column;
        },
        computed: {
            owner() {
                let parent = this.$parent;
                while (parent && !parent.tableId) {
                    parent = parent.$parent;
                }
                return parent;
            }
        },
        watch: {
            width(newVal) {
                if (this.columnConfig) {
                    this.columnConfig.realWidth = this.columnConfig.width = newVal;
                    this.owner.store.updateColumns();
                }
            },
            label(newVal) {
                if (this.columnConfig) {
                    this.columnConfig.label = newVal;
                }
            }
        },
        mounted() {
            this.owner.store.commit('insertColumn', this.columnConfig);
        }
    }
</script>