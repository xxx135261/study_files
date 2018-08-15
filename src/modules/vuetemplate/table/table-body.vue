<script>
    import TableCellPlot from './table-cell-plot.vue';
    import {addClass, removeClass} from './../../../scripts/widgets/pasTable/utils';

    export default {
        name: 'pas-table-body',
        render(h) {
            return h(
                'div',
                {'class': 'pas-table-body_' + this.tableId},
                [
                    h(
                        'table',
                        {
                            style: this.tableStyle,
                            attrs: {
                                tabid: this.depId
                            }
                        },
                        [
                            h(
                                'tbody',
                                [].concat(
                                    this.data.map((rowData, i) => rowData.length < 1 ? [] :
                                        h(
                                            'tr',
                                            {
                                                key: i,
                                                on: {
                                                    click: ($event) => this.handleRowClick($event, rowData, i),
                                                    mouseenter: ($event) => this.handleRowMouseEnter($event, rowData, i),
                                                    mouseleave: ($event) => this.handleRowMouseLeave($event, rowData, i)
                                                }
                                            },
                                            [].concat(
                                                this.columns.map((column, j) =>
                                                    h(
                                                        'td',
                                                        {
                                                            key: j,
                                                            style: {
                                                                width: column.realWidth + 'px',
                                                                'max-width': column.realWidth + 'px',
                                                                'min-width': column.realWidth + 'px',
                                                                'text-align': column.align,
                                                                'display': column.visible ? 'table-cell' : 'none'
                                                            },
                                                            attrs: {
                                                                cell: column.dep ? JSON.stringify(rowData[column.prop]) : undefined
                                                            }
                                                        },
                                                        /*td的子元素：单元格数据DIV和迷你折线图DIV*/
                                                        [column.renderCell(h, {
                                                            rowData,
                                                            rowIndex: i,
                                                            column,
                                                            columnIndex: j,
                                                            _self: this
                                                        }), (() => {
                                                            if (column.sparkline) {
                                                                return h(
                                                                    'pas-table-cell-plot',
                                                                    {
                                                                        props: {
                                                                            rowIdx: i,
                                                                            colIdx: j,
                                                                            cellData: rowData[column.prop] || {}
                                                                        }
                                                                    }
                                                                )
                                                            }
                                                        })()]
                                                    )
                                                )
                                            ).concat([
                                                (() => {
                                                    if (this.show == 'fixed') {
                                                        return h(
                                                            'td',
                                                            {
                                                                style: {
                                                                    width: '17px',
                                                                    'min-width': '17px',
                                                                    'max-width': '17px'
                                                                }
                                                            }
                                                        )
                                                    }
                                                })()
                                            ])
                                        )
                                    )
                                ).concat(
                                    [
                                        this.$slots.append,
                                        (() => {
                                            if (this.show === 'fixed') {
                                                return h(
                                                    'tr',
                                                    {
                                                        style: {
                                                            'height': '18px',
                                                            'max-height': '18px',
                                                            'min-height': '18px'
                                                        }
                                                    }
                                                )
                                            }
                                        })()
                                    ]
                                )
                            )
                        ]
                    )
                ]
            )
        },
        components: {
            'pas-table-cell-plot': TableCellPlot
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
            tableStyle: Object,
            cellClassName: [String, Function],
            /*用于挂载下钻框的tabid*/
            depId: [String],
            /*行是否可选中*/
            selectable: Boolean
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
            data() {
                return this.store.states.data;
            }
        },
        watch: {
            'store.states.highlight': function (newRow, oldRow) {
                if (!newRow) {
                    return;
                }
                let el = this.$el;
                /*所有行*/
                let rows = el.querySelectorAll('tbody > tr');
                /*上一个选中行的序号和当前选中行的序号*/
                let oldIndex = oldRow ? oldRow.index : -1, newIndex = newRow.index;
                if (oldRow) {
                    removeClass(rows[oldIndex], 'current-row');
                } else {
                    // 所有行移除'current-row'
                    [].forEach.apply(rows, [(row => removeClass(row, 'current-row'))]);
                }
                addClass(rows[newIndex], 'current-row');
            },
            'store.states.hover': function (newRow, oldRow) {
                let el = this.$el;
                let rows = el.querySelectorAll('tbody > tr');
                /*上一个选中行的序号和当前选中行的序号*/
                let oldIndex = oldRow ? oldRow.index : -1, newIndex = newRow ? newRow.index : -1;
                if (oldRow) {
                    removeClass(rows[oldIndex], 'hover-row');
                } else {
                    // 所有行移除'hover-row'
                    [].forEach.apply(rows, [(row => removeClass(row, 'hover-row'))]);
                }
                if(newRow) {
                    addClass(rows[newIndex], 'hover-row');
                }
            }
        },
        methods: {
            /*处理表格行点击事件*/
            handleRowClick: function (event, rowData, index) {
                if (this.selectable) {
                    // 保存当前行
                    this.store.commit('setHighlight', {rowData, index});
                }
            },
            /*处理表格行鼠标进入事件*/
            handleRowMouseEnter: function (event, rowData, index) {
                if (this.selectable) {
                    this.store.commit('setHover', {rowData, index});
                }
            },
            /*处理表格行鼠标离开事件*/
            handleRowMouseLeave: function (event, rowData, index) {
                if (this.selectable) {
                    this.store.commit('setHover', null);
                }
            }
        }
    }
</script>