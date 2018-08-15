<template src="../../html/barChart.html"></template>

<script>
    export default {
        name: "barChart",
        data() {
            return {
                //指标选择
                dimension: [],
                echartConfig: {
                    tooltip: {
                        trigger: "axis"
                    },
                    legend: {
                        data: [{
                            name: "系列1"
                        }]
                    },
                    toolbox: {
                        show: true,
                        feature: {}
                    },
                    calculable: true,
                    xAxis: [{
                        type: "category",
                        data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
                    }],
                    yAxis: [{
                        type: "value"
                    }],
                    series: [{
                        name: "蒸发量",
                        type: "bar",
                        data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
                        markLine: {
                            data: [{ type: "average", name: "平均值" }]
                        }
                    }, {
                        name: "降水量",
                        type: "bar",
                        data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
                        markLine: {
                            data: [{ type: "average", name: "平均值" }]
                        }
                    }]
                },
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
                            header: (columnsValue.name || columnsValue.header),
                            baseName: columnsValue.baseName,
                            showProperties: columnsValue.showProperties
                        });
                    }
                    $(".quota-config .table_body").niceScroll({
                        cursorcolor: "#c7c6c6"
                    }).resize();
                }
            }
        }
    };

</script>
<style>

</style>