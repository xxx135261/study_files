<template src="../../html/tableChart.html"></template>
<script>
    export default {
        name: "table-chart",
        data() {
            return {
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
        computed: {
            /*展示设置可选项*/
            exhibitionOptions() {
                return this.$store.state.newCreate.exhibitionOptions;
            }
        },
        created() {
            $(".quota-config .table_body").niceScroll({
                cursorcolor: "#c7c6c6"
            }).resize();
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
                console.log(this.$parent)
            },
            /***
             * 绘制列头信息
             * @author mengjq@hundsun.com
             */
            drawGridHeader() {
                this.$parent.getLayoutContainer(this.config.columns);
            },
            /***
             * 收缩展开
             */
            tableConfigSlide(event) {
                var el = $(event.currentTarget);
                el.parents(".header").siblings(".content").slideToggle();
                el.toggleClass("expand");
            }

        }
    };
</script>
<style scoped>
    ul {
        position: relative;
        height: 100%;
        padding: 3px;
        overflow-y: auto;
        border: 1px solid #e4eaec;
        border-radius: 3px;
        -webkit-transition: border linear .2s, box-shadow linear .2s;
        -webkit-transition: border linear .2s, -webkit-box-shadow linear .2s;
        -moz-transition: border linear .2s, box-shadow linear .2s;
        -ms-transition: border linear .2s, box-shadow linear .2s;
        -o-transition: border linear .2s, box-shadow linear .2s;
        transition: border linear .2s, -webkit-box-shadow linear .2s;
        transition: border linear .2s, box-shadow linear .2s;
        transition: border linear .2s, box-shadow linear .2s, -webkit-box-shadow linear .2s;

    }

    li {
        font-size: 12px;
        line-height: 2rem;
        height: 2rem;
        padding-left: 5px;
        border: 1px solid #fff;
        cursor: pointer;
    }

    li:hover {
        color: #fff;
        text-decoration: none;
        cursor: pointer;
        background-color: #62a8ea;
    }

    .ui-state-highlight {
        height: 1.5em;
        line-height: 1.2em;
    }

</style>