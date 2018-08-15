<template>
    <div class="table-move">
        <div v-bind:id="chartSpacerId" ref="charts" style="width: 100%;height: 100%;"></div>
    </div>
</template>

<script>
    export default {
        name: "area-cell-library",
        data() {
            return {
                chartSpacerId: ""
            };
        },
        mounted() {

        },
        methods: {
            /**
             * 初始化Echarts组件.
             * @author mengjq@hundsun.com.
             */
            initEcharts(chartSpacerId) {
                (window.Echarts) ? null : window.Echarts = [];
                return window.Echarts[window.Echarts ? window.Echarts.length : 0] = this.$echarts.init(document.getElementById(chartSpacerId));
            },
            setEchartsOption(chartSpacerID, echartConfig) {
                if (chartSpacerID) {
                    chartSpacerID.setOption(echartConfig);
                }
            }
        }
    };
</script>

<style>
    .table-move {
        height: calc(100% - 34px);
        width: calc(100% - 10px);
        margin: 0 auto;
        overflow: hidden;
    }
	.table-move:hover {
        cursor: move !important;
    }

    /*.table-move:hover {
        margin: 5px;
        box-shadow: 0px 2px 4px 2px #eee;
        transition: 0.1s;
        float: left;
        cursor: move;
    }*/

    .table-move:hover > div > div {
        cursor: move !important;
    }
    .table-move table {
        margin-bottom: 0px;
    }

    .table-move table th {
        text-align: center;
        font-size: 10px;
        height: 12px;
        line-height: 12px;
    }

</style>