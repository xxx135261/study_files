<template>
    <div class="OG-layout-analytics-container" tabindex="-1" :id="areaId"></div>
</template>

<script>
    import Vue from "vue";

    //使用布局块对象
    const Block = Vue.component("LayoutBlock");

    const AreaCellLibrary = Vue.component("AreaCellLibrary");

    //定义布局块组件
    export default {
        name: "layout-container",
        data() {
            return {
                //当前选中的目标
                curentTarget: null,
                counter: 0, //用于循环迭代
                //块序号
                layoutBlockNum: 1,
                echartConfig: null,
                layoutArray: [],
                rootMap: this.$parent.rootMap,
                jsonDataSet: this.$parent.customViewportDataSet
            };
        },
        props: {
            /*通过父组件获得*/
            areaId: {
                type: String,
                required: true
            }
        },
        mounted() {
            let $this = this;
            $(".OG-layout-analytics-container").focus(function() {
                //初始化设置
                $this.curentTarget = $(this);
                $this.curentTarget.css("border", "1px dashed #62a8ea");
                $this.$parent.isRemoveMaskStyle(true);
            });
        },
        methods: {
            focusLayout(event) {
                if (this.curentTarget) {
                    //清空表格选中框
                    this.curentTarget.css("border", "");
                }
                this.curentTarget = null;
                var tempTarget = $(event.currentTarget);
                this.curentTarget = !tempTarget.attr("id") ? tempTarget.offsetParent() : tempTarget;
                //设置选中边框
                this.curentTarget.css("border", "1px dashed #62a8ea");

                this.$parent.isRemoveMaskStyle(true);

                // 设置区域指标集信息
                this.$parent.setAreaIndexSet();
            },
            /**
             * 布局区域插入
             * @author mengjq@hundsun.com
             * @date 2017.1
             */
            insert(style) {

                //没有选中区域，则不进行切分
                if (!this.curentTarget) {
                    return;
                }
                //获取当前进行切分方式
                var layout = (style && "level" == style ? "north" : "west");

                //定义中间区域
                let Center = new Block({
                    el: document.createElement("div"),
                    data: {
                        type: "ui-layout-center",
                        region: "center",
                        areaId: "areaId_" + --this.counter + -new Date(),
                        focusLayout: this.focusLayout
                    }
                });

                //片段区域
                let fragment = new Block({
                    el: document.createElement("div"),
                    data: {
                        areaId: "areaId_" + --this.counter + -new Date(),
                        type: "ui-layout-" + layout,
                        region: layout,
                        focusLayout: this.focusLayout
                    }
                });
                //清理当前内容区
                this.curentTarget.empty();

                //当前区域
                if (this.curentTarget) {
                    try {
                        this.curentTarget.append(fragment.$el);
                        this.curentTarget.append(Center.$el);
                        //设定当前布局风格
                        $(this.curentTarget).layout({
                            [layout]: { spacing_open: 3, size: "50%" },
                            center: { spacing_open: 3, size: "50%" }
                        });
                        this.setJsonDataSet(style, fragment, Center);
                    } catch (e) {
                    } finally {
                        this.setCurrentTargetState();
                    }
                    return;
                }
            },
            /***
             * 设置当前选择器状态
             */
            setCurrentTargetState() {
                $(this.curentTarget).css("border", "");
                this.curentTarget = null;
                if (!this.curentTarget) {
                    return this.$parent.isRemoveMaskStyle(false);
                }
                return this.$parent.isRemoveMaskStyle(true);
            },
            setJsonDataSet(layout, fragment, center) {
                //记录当前切分方式
                var pNode = this.rootMap.get(this.curentTarget.context.id);
                var nodeA = {
                    region: fragment.region,
                    pcode: pNode.code,
                    code: fragment.areaId
                }, nodeB = {
                    region: center.region,
                    pcode: pNode.code,
                    code: center.areaId
                };
                pNode.layout = layout;
                pNode.childNodes = [nodeA, nodeB];
                this.rootMap.set(fragment.areaId, nodeA);
                this.rootMap.set(center.areaId, nodeB);
            },
            /***
             * 绘制填充信息
             * @param columns 对应配置信息
             * @param rowIndex ,0:表格，1：柱状图，2：折线图，3：饼图
             * @author mengjq@hundsun.com.
             * @date 2018.1.2
             */
            draw(columns, nowIndex) {
                let pNode = this.rootMap.get(this.curentTarget.context.id);
                if (pNode) {
                    //当前布局区域填充指标
                    pNode.xtype = (nowIndex == 0) ? "table" : (nowIndex == 1) ? "bar" : (nowIndex == 2) ? "line" : (nowIndex == 3) ? "pie" : "";
                    pNode.columns = columns;
                    if (0 == nowIndex) {
                        var targetHtml = $(this.curentTarget).find("table").find("thead");
                        if ($.isArray(columns) && columns.length > 0) {
                            targetHtml.empty();
                            var _column = "<tr>";
                            columns.forEach(function(column) {
                                _column += "<th>" + column.header + "</th>";
                            });
                            _column += "</tr>";
                            targetHtml.append(_column);
                        }
                    } else {
                        //todo 柱状图，折线图，饼图的所见所得器
                    }
                }
            },
            initLayout(viewConfig) {
                if (viewConfig.columns) {
                    this.rootMap.set(viewConfig.code, viewConfig);
                    let fragment = new Block({
                        el: document.createElement("div"),
                        data: {
                            type: "ui-layout-single",
                            areaId: viewConfig.code,
                            focusLayout: this.focusLayout
                        }
                    });
                    $('.OG-layout-analytics-container').append(fragment.$el);
                    this.renderBlock(viewConfig, fragment.$el);
                } else {
                    this.breadthFirstSearch(viewConfig);
                }
            },
            breadthFirstSearch(treeNode) {
                let stack = [], item;
                stack.push(treeNode);
                while (stack.length > 0) {
                    item = stack.shift();
                    this.parseBinaryTree(item);
                    for (let index = 0; index < (item.childNodes ? item.childNodes.length : 0); index++) {
                        stack.push(item.childNodes[index]);
                    }
                }
            },
            parseBinaryTree(treeNode) {
                var code = treeNode.code;
                var region = treeNode.region;
                var columns = treeNode.columns;
                var pcode = "#".concat(treeNode.pcode);
                var indexSetName = (treeNode.config ? treeNode.config.indexSetName || "未知" : "测试");
                var xtype = treeNode.xtype;
                var counter = 0;
                if (region && pcode) {
                    let fragment = new Block({
                        el: document.createElement("div"),
                        data: {
                            type: "ui-layout-" + region,
                            areaId: code,
                            focusLayout: this.focusLayout
                        }
                    });
                    $(pcode).append(fragment.$el);
                    this.layoutArray.push(region);
                    if (this.layoutArray.length > 1) {
                        var temp = {};
                        for (let key in this.layoutArray) {
                            temp[this.layoutArray[key]] = { spacing_open: 5, size: "50%" };
                        }
                        $(pcode).layout(temp);
                        this.layoutArray = [];
                    }
                    this.renderBlock(treeNode, fragment.$el);
                }
                this.rootMap.set(code, treeNode);
            },
            renderBlock(treeNode, mountEl) {
                var code = treeNode.code;
                var columns = treeNode.columns;
                var xtype = treeNode.xtype;
                if (xtype) {
                    if (xtype == "table") {
                        if ($.isArray(columns)) {
                            //表格填充垫片
                            let tableHTML = "<div class=\"table-move\"><table class=\"table table-bordered\"><thead><tr>";
                            columns.forEach(column => {
                                tableHTML += ("<td>" + column.header + "</td>");
                            });
                            tableHTML += "</tr></thead><tbody></tbody></table></div>";
                            $(mountEl).append(tableHTML);
                        }
                    } else {
                        let chartSpacer = new AreaCellLibrary({
                            el: document.createElement("div"),
                            data: {
                                chartSpacerId: ("chartSpacer_") + code
                            }
                        });
                        $(mountEl).append(chartSpacer.$el);

                        //进行初始化Echart图表组件
                        let ChartSpacerID = chartSpacer.initEcharts(chartSpacer.chartSpacerId);

                        //柱状图，折线图，饼图
                        chartSpacer.setEchartsOption(ChartSpacerID, this.$parent.$refs[xtype + "Chart"].echartConfig);

                        //自适应当前区域大小
                        if (ChartSpacerID && chartSpacer) {
                            $(window).resize(() => {
                                window.Echarts.forEach(echarts => {
                                    setTimeout(echarts.resize, 1000);
                                });
                            });
                            setTimeout(() => {
                                this.$parent.resizeCharts($("#" + chartSpacer.chartSpacerId), ChartSpacerID);
                                ChartSpacerID.resize();
                            }, 200);
                        }
                    }
                }
            }
        }
    };
</script>

<style>
    .OG-layout-analytics-container {
        background: #fff;
    }
    table th {
        text-align: center;
        font-size: 10px;
        height: 12px;
        line-height: 12px;
    }

</style>