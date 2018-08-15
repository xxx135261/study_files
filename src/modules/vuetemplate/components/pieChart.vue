<template src="../../html/pieChart.html"></template>

<script>
    export default {
        name: "pieChart",
        data() {
            return {
                echartConfig: {
                    tooltip: {
                        trigger: "item",
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: "horizontal",
                        left: "left",
                        data: ["农业", "计算机", "其他"]
                    },
                    series: [{
                        type: "pie",
                        radius: "55%",
                        center: ["50%", "50%"],
                        data: [
                            { value: 35, name: "农业" },
                            { value: 10, name: "计算机" },
                            { value: 55, name: "其他" }
                        ]
                    }],
                    grid: {
                        left: "center"
                    }
                },
                //维度选择
                dimension: [],
                //存放当前表格中所有对象
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
                    }
                }
            };
        },
        created() {
            $(".quota-config .table_body").niceScroll({
                cursorcolor: "#c7c6c6"
            }).resize();
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
                handler(curVal, oldVal) {
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
                }
            },
            /***
             * 绘制列头信息
             * @author mengjq@hundsun.com
             */
            drawGridHeader() {
                this.$parent.getLayoutContainer(this.config.columns);
            },
            /***
             * 表格配置区域收缩展开
             */
            tableConfigSlide(event) {
                var el = $(event.currentTarget);
                el.parents(".header").siblings(".content").slideToggle();
                el.toggleClass("expand");
            }
        }
    };
</script>

<style>

</style>