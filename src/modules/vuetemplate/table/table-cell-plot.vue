<template>
    <span :id="id" class="cell-plot"></span>
</template>
<script>
    // 折线图配置项
    const DEFAULT_OPTIONS = {
        grid: {show: false}, colors: ['#5991FF'],
        series: {shadowSize: 0, lines: {lineWidth: 1}},
        xaxis: {show: false}, yaxis: {show: false}
    };

    // 默认折线图数据
    const DEFAULT_SERIES_DATA = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]];

    export default {
        name: 'PASTableCellPlot',
        data() {
            return {
                $plot: null
            }
        },
        props: {
            /*行索引*/
            rowIdx: {
                type: [String, Number],
                required: true
            },
            /*列索引*/
            colIdx: {
                type: [String, Number],
                required: true
            },
            /*单元格数据*/
            cellData: {
                type: Object,
                required: true
            }
        },
        computed: {
            id: function () {
                let id = 'pas-table-cell-plot';
                if (this.rowIdx !== undefined && this.colIdx != undefined) {
                    id += ('_' + this.rowIdx + '_' + this.colIdx);
                }
                return id;
            }
        },
        watch: {
            cellData: {
                immediate: true,
                handler(val) {
                    if (val && val.h && val.h.length > 0) {
                        /*此处的try...catch块用于捕获，当没有sparkline的列与有sparkline的列交换位置的时候，
                        * cellData变化触发回调，此时当前组件的width/height为null，$.plot(...)抛出的异常。*/
                        try {
                            // 设置新的数据然后重绘
                            this.$plot.setData([this.createSeriesData(val.h)]);
                            this.$plot.setupGrid();
                            this.$plot.draw();
                        } catch (e) {}
                    }
                }
            }
        },
        mounted() {
            this.createPlot();
        },
        methods: {
            // 创建折线图
            createPlot() {
                let data, h = this.cellData.h;
                if (h && h.length > 0) {
                    data = this.createSeriesData(h);
                } else {
                    data = [];
                }
                this.$plot = $.plot('#' + this.id, [data], DEFAULT_OPTIONS);
            },
            // 生成折线图数据
            createSeriesData(historyArr) {
                // 将history数组转换为折线图点坐标数组
                let data = historyArr.reduce((acc, val, idx) => {
                    acc.push([idx, val]);
                    return acc;
                }, []);
                // 单点无法画出折线图，所以，当history只有一个值时，补充一个点
                if (historyArr.length == 1) {
                    data.push([1, historyArr[0]]);
                }
                return data;
            }
        }
    }
</script>