<template src="../../html/lineChart.html"></template>

<script>
    export default {
        name: "lineChart",
        data() {
            return {
                echartConfig: {
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "cross",
                            animation: false,
                            label: {
                                precision: 2,
                                backgroundColor: "#505765"
                            },
                            crossStyle: {
                                type: "solid"
                            }
                        }
                    },
                    // 折线图默认参数
                    line: {
                        smooth: true,
                        symbol: "none", // 拐点图形类型
                        symbolSize: 3 // 拐点图形大小
                    },
                    toolbox: {
                        show: false
                    },
                    grid: {
                        x: 70,
                        x2: 40
                    },
                    dataZoom: {
                        show: true,
                        realtime: true,
                        start: 20,
                        end: 100
                    },
                    legend: {
                        data: [""]
                    },
                    xAxis: [{
                        type: "category",
                        boundaryGap: false,
                        splitLine: {
                            show: true
                        },
                        data: [""]
                    }],
                    yAxis: [{
                        min: 3000,
                        max: 4000,
                        type: "value",
                        name: "指数点位",
                        axisLabel: {
                            formatter: function(val) {
                                return Number(val).toFixed(2);
                            }
                        }
                    }, {
                        min: 1,
                        max: 1.5,
                        type: "value",
                        name: "组合净值",
                        axisLabel: {
                            formatter: function(val) {
                                return Number(val).toFixed(2);
                            }
                        }
                    }],
                    series: [{
                        name: "",
                        type: "line",
                        symbol: "none",
                        data: [""]
                    }, {
                        name: "",
                        type: "line",
                        symbol: "none",
                        yAxisIndex: 1,
                        data: [""]
                    }]
                },
                //指标选择
                dimension: [],
                /*坐标轴类型*/
                xAxisType: [{
                    value: "dimensionName",
                    name: "维度名称"
                }, {
                    value: "dateExtent",
                    name: "日期区间"
                }],
                config: {
                    //指标集名称
                    indexSetName: "",
                    //指标集合
                    columns: [],
                    //高级配置参数信息
                    advancedConfig: {
                        //维度
                        dimension: "",
                        //筛选条件
                        filtration: "",
                        //展示
                        exhibition: ""
                    },
                    settings: {
                        //坐标轴类型
                        xAxisType: {},
                        /*Y左轴*/
                        yAxisLeft: [],
                        /*Y轴右*/
                        yAxisRight: [],
                        /*y左轴自定义名称*/
                        yAxisLeftCustomName: "",
                        /*y右轴自定义名称*/
                        yAxisRightCustomName: ""
                    }
                }
            };
        },
        computed: {
            /*展示设置可选项*/
            exhibitionOptions() {
                return this.$store.state.newCreate.exhibitionOptions;
            }
        },
        watch: {
            config: {
                deep: true,
                handler(curVal) {
                    this.$parent.setAreaIndexSet(curVal);
                }
            }
        },
        created() {
            $(".quota-config .table_body").niceScroll({
                cursorcolor: "#c7c6c6"
            }).resize();
        },
        methods: {
            /**
             * 选择指标
             */
            handleSelection(valueArr) {
                if ($.isArray(valueArr)) {
                    this.config.columns = [];
                    for (let index = 0; index < valueArr.length; index++) {
                        let columnsValue = valueArr[index];
                        this.config.columns.push({
                            uniqueId: columnsValue.uniqueId,
                            dataIndex: (columnsValue.uniqueId || columnsValue.dataIndex),
                            header: columnsValue.name,
                            baseName: columnsValue.baseName,
                            showProperties: columnsValue.showProperties
                        });
                    }
                }
            }
        }
    };
</script>

<style>

</style>