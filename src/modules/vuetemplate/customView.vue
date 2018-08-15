/**
* 组件名：自定义视图
*
* ##接口说明##
* 函数：
* 事件：
* 参数：
*   viewConfig：自定义视图配置对象。
*/
<template>
    <div style="width: 100%;height: 100%;padding-top: 5px;">
        <div :id="pCode" class="OG-layout-analytics-container realTime"></div>
    </div>
</template>

<script>
    import Vue from "vue";
    import CommonTools from './../../scripts/core/util/com.hundsun.pas.common.util.public_methods';

    //布局块
    import layoutBlock from "./components/layoutBlock";
    import TableAdaptor from "./components/tableAdaptor.vue";

    //区域填充块组件
    import areaCellLibrary from "./components/areaCellLibrary";

    //使用布局块对象
    const Block = Vue.extend(layoutBlock);

    //表格块对象
    const Table = Vue.extend(TableAdaptor);

    //使用区域填充库
    const AreaCellLibrary = Vue.extend(areaCellLibrary);

    const pasUtil = $.pasUtils(), commonTools = new CommonTools(), numberUtil = $.numberUtils();

    export default {
        name: "customView",
        data() {
            return {
                pCode: "",
                layoutArray: [],
                counter: 0, //用于循环迭代
                template: [],
                barChartId: "temp123",
                barConfig: {
                    tooltip: {
                        trigger: "axis"
                    },
                    legend: {
                        data: ["value1"]
                    },
                    dataZoom: {
                        show: true,
                        realtime: true,
                        start: 60,
                        end: 100
                    },
                    xAxis: {
                        data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
                    },
                    yAxis: [{name: "value1"}],
                    series: [{
                        name: "value1",
                        type: "bar",
                        data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
                    }]
                },
                pieConfig: {
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
                        data: [
                            {value: 35, name: "农业"},
                            {value: 10, name: "计算机"},
                            {value: 55, name: "其他"}
                        ]
                    }]
                },
                lineConfig: {
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
                        data: ["value1"]
                    },
                    xAxis: [{
                        type: "category",
                        boundaryGap: false,
                        splitLine: {
                            show: true
                        },
                        data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
                    }],
                    yAxis: [{
                        min: 3000,
                        max: 4000,
                        type: "value",
                        name: "value1",
                        axisLabel: {
                            formatter: function (val) {
                                return Number(val).toFixed(2);
                            }
                        }
                    }],
                    series: [{
                        name: "value1",
                        type: "line",
                        symbol: "none",
                        data: [3200, 3300, 3134, 3456, 3100, 3834, 3635, 3687, 3700, 3523, 3100, 3900]
                    }]
                },
                dataset: {}
            };
        },
        props: {
            viewConfig: {
                type: Object,
                required: false
            }
        },
        computed: {
            currentPort() {
                return this.$store.state.selectGroup.id || "";
            }
        },
        components: {TableAdaptor},
        mounted() {
            this.loadData();
        },
        methods: {
            loadData() {
                let viewConfig = this.viewConfig;
                if (viewConfig) {
                    this.initLayout(viewConfig);
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
                if (region && pcode) {
                    let fragment = new Block({
                        el: document.createElement("div"),
                        data: {
                            type: "ui-layout-" + region,
                            areaId: code,
                            focusLayout: () => {
                            }
                        }
                    });
                    $(pcode).append(fragment.$el);
                    this.layoutArray.push(region);
                    if (this.layoutArray.length > 1) {
                        var temp = {};
                        for (let key in this.layoutArray) {
                            temp[this.layoutArray[key]] = {spacing_open: 5, size: "50%"};
                        }
                        $(pcode).layout(temp);
                        this.layoutArray = [];
                    }
                    this.renderBlock(treeNode, fragment.$el);
                }
            },
            /**
             * 渲染不同类型的块
             *
             * @param treeNode
             * @param mountEl 渲染块的挂载元素
             */
            renderBlock(treeNode, mountEl) {
                var code = treeNode.code;
                var columns = treeNode.columns;
                var indexSetName = (treeNode.config ? treeNode.config.indexSetName || "未知" : "测试");
                var xtype = treeNode.xtype;
                if (xtype) {
                    if (xtype == "table") {
                        if ($.isArray(columns)) {
                            let table = new Table({
                                el: document.createElement("div"),
                                data: {
                                    config: {
                                        table: {
                                            data: [],
                                            depId: "myConcern",
                                            grid: null
                                        },
                                        columns
                                    }
                                }
                            });
                            let _self = this;
                            const dataHandle = (result) => {
                                if (table) {
                                    const dataArray = table.getData();
                                    if ($.isArray(result)) { //判断接收的数据是否是数组
                                        //读取Name行对应的Default行记录数据
                                        var nameValue = result[1], targetValue = result[2];
                                        //遍历数据条数
                                        for (var cellNum = 0; cellNum < targetValue.length; cellNum++) {
                                            var cellValue = targetValue[cellNum].cells, detail = {},
                                                num = targetValue[cellNum].data_row;
                                            detail.Name = nameValue[cellNum].cells[0].dataRow + nameValue[cellNum].cells[0].value;
                                            detail.securityId = nameValue[cellNum].cells[0].securityId;
                                            //遍历数据列数
                                            for (var cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                                                var colName = cellValue[cellValNum].col_name,
                                                    value = cellValue[cellValNum], h = value.h;
                                                detail[colName] = value;
                                                var curr, last,
                                                    indicator = !value || !value.h || !value.h.length ? null
                                                        : (curr = value.h[value.h.length - 1]) < (last = value.h[value.h.length - 2]) ? "down"
                                                            : curr > last ? "up" : "smooth";
                                                detail[colName].state = indicator;
                                                detail[colName].h = h;
                                            }
                                            //将数据对象绑定到realtimeData对象中，用于展示实时盯盘表格明细
                                            _self.$set(dataArray, num, detail);
                                        }
                                    }
                                }
                            };
                            $(mountEl).append("<div class='title' style='border:1px solid #ccc;border-bottom:0'>" + indexSetName + "<div><span class='drag' tabindex='2'><i class='fa fa-arrows'></i>拖动</span></div></div>");
                            $(mountEl).append(table.$el);
                            var temp = og.views.analytics.griddata.loadGridData({
                                name: "customView" + code,
                                requestParam: {
                                    viewdefinition: code,
                                    portfolio: this.currentPort
                                },
                                otherParam: {
                                    isDepgraph: true,
                                    visibleArea: {
                                        width: 1366,
                                        height: 800,
                                        scrollTop: 0,
                                        scrollLeft: 0
                                    }
                                },
                                metaHandle: function (metadata) {//处理表格显示条数
                                    if (metadata) {
                                        // $this.realtimeData = metadata;
                                    }
                                },
                                dataHandle: dataHandle
                            });
                            table.config.table.grid = temp;
                        }
                    } else {
                        //图表填充垫片
                        let chartSpacer = new AreaCellLibrary({
                            el: document.createElement("div"),
                            data: {
                                chartSpacerId: ("chartSpacer_") + -new Date
                            }
                        });
                        $(mountEl).append("<div class='chartWrap'></div>");
                        $(mountEl).children(".chartWrap").append(chartSpacer.$el);

                        //进行初始化Echart图表组件
                        let ChartSpacerID = chartSpacer.initEcharts(chartSpacer.chartSpacerId);
                        $(mountEl).find(".table-move").before("<div class='title'>" + indexSetName + "<div><span class='drag' tabindex='2'><i class='fa fa-arrows'></i>拖动</span></div></div>");
                        chartSpacer.setEchartsOption(ChartSpacerID, this[xtype + "Config"]);

                        let _self = this;
                        // 折线图只支持时序指标
                        if (xtype == 'line') {
                            og.views.analytics.griddata.loadChartData({
                                name: {
                                    viewdefinition: code
                                },
                                requestParam: {
                                    portfolio: this.currentPort
                                },
                                otherParam: {
                                    lineNum: columns.length
                                },
                                dataHandle: function (data) {
                                    if (data && data.timeseries) {
                                        let seriesDataLgt = data.timeseries.data.length,
                                            $time = new Array(seriesDataLgt),
                                            $value = new Array(seriesDataLgt), num = data.num;
                                        data.timeseries.data.reduce(function (acc, val, index) {
                                            if (val == null) {
                                                return acc;
                                            }
                                            acc.$time[index] = new Date(val[0]).Format("yyyy-MM-dd"), acc.$value[index] = val[1];
                                            return acc;
                                        }, {$time: $time, $value: $value});

                                        let dataset = _self.dataset[code] ?
                                            _self.dataset[code] : (_self.dataset[code] =
                                                {series: [{}], yAxis: [{}], legend: {data: [""]}, dataSource: [{}]}),
                                            setting = treeNode.config.settings,
                                            series = dataset.series;
                                        if (xtype != 'pie') {
                                            // 时间轴
                                            ChartSpacerID.setOption({
                                                xAxis: [{
                                                    data: $time
                                                }]
                                            });

                                            _self.setDataZoom(ChartSpacerID, $time.length, 20);

                                            let legend = dataset.legend,
                                                yAxis = dataset.yAxis/*,
                                        dataSource = dataset.dataSource*/;
                                            let index = _self.getValueIndex(num - 1, columns, setting),
                                                customValueName = setting[index == 0 ? "yAxisLeftCustomName" : "yAxisRightCustomName"],
                                                valueName = commonTools.isStringEmpty(customValueName) ? columns[num - 1].header : customValueName;
                                            legend.data[index] = valueName;

                                            // let max = Math.max.apply(Math, $value);
                                            // let min = Math.min.apply(Math, $value);
                                            // let interval = ((max - min) / 5).toFixed(6);
                                            yAxis[index] = {
                                                name: valueName,
                                                max: 'dataMax',
                                                min: 'dataMin',
                                                // interval: interval,
                                                splitNumber: 5/*,
                                            scale: true*/
                                            };
                                            series[index] = {
                                                name: valueName,
                                                type: xtype,
                                                data: $value,
                                                yAixsIndex: index,
                                                // datasetIndex: index
                                            };
                                            // dataSource[num - 1] = {source: $value};
                                            ChartSpacerID.setOption({
                                                legend: legend,
                                                yAxis: yAxis,
                                                series: series/*,
                                            dataset: dataSource*/
                                            });
                                        } else {
                                            series[num - 1] = {
                                                type: xtype,
                                                data: $value.map((value, idx) => {
                                                    return {value, name: $time[idx]};
                                                })
                                            };
                                            ChartSpacerID.setOption({
                                                series: series
                                            });
                                        }
                                    }

                                }
                            });
                        } else {
                            // 柱状图和饼图只支持非时序指标
                            og.views.analytics.griddata.loadGridData({
                                name: "customView" + code,
                                requestParam: {
                                    viewdefinition: code,
                                    portfolio: this.currentPort
                                },
                                otherParam: {
                                    isDepgraph: true,
                                    visibleArea: {
                                        width: 10000,
                                        height: 10000,
                                        scrollTop: 0,
                                        scrollLeft: 0
                                    }
                                },
                                dataHandle: function (result) {
                                    let dataset = _self.dataset[code] ?
                                        _self.dataset[code] : (_self.dataset[code] =
                                            {series: [{}], yAxis: [{}], legend: {data: [""]}, dataSource: [{}]}),
                                        setting = treeNode.config.settings,
                                        series = dataset.series;
                                    if (xtype == 'pie') {
                                        let valueArr = result[2].map((value, idx) => {
                                            let name = result[1][idx].cells[0], val = value.cells[0];
                                            if (name.type == 'POSITION') {
                                                return {
                                                    value: numberUtil.convertNumber(val.value, [',', '%']),
                                                    name: val.row_name + '(' + val.value + ')'
                                                };
                                            }
                                            return null;
                                        }).filter(value => value != null);
                                        series[0] = {
                                            type: xtype,
                                            name: result[0][1],
                                            data: valueArr
                                        };
                                        ChartSpacerID.setOption({
                                            legend: {
                                                type: 'scroll',
                                                data: valueArr.map(value => {
                                                    return value.name;
                                                }),
                                                formatter: name => {
                                                    return name.split('(')[0]
                                                }
                                            },
                                            series: series
                                        });
                                    } else {
                                        let xAixsData = result[1].map(value => {
                                            let name = value.cells[0];
                                            if (name.type == 'POSITION') {
                                                return name.value;
                                            }
                                            return null;
                                        }).filter(value => value != null);
                                        ChartSpacerID.setOption({
                                            xAxis: [{
                                                data: xAixsData,
                                                axisLabel: {
                                                    rotate: -45
                                                }
                                            }]
                                        });

                                        _self.setDataZoom(ChartSpacerID, xAixsData.length);

                                        let legend = dataset.legend,
                                            yAxis = dataset.yAxis;
                                        // 指标个数
                                        let valueNum = result[0].length - 1;

                                        for (let i = 0; i < valueNum; i++) {
                                            let index = _self.getValueIndex(i, columns, setting),
                                                customValueName = setting[index == 0 ? "yAxisLeftCustomName" : "yAxisRightCustomName"],
                                                valueName = commonTools.isStringEmpty(customValueName) ? columns[i].header : customValueName;
                                            legend.data[index] = valueName;

                                            let valueArr = result[2].map((value, idx) => {
                                                let name = result[1][idx].cells[0];
                                                if (name.type == 'POSITION') {
                                                    return numberUtil.convertNumber(value.cells[i].value, ['%', ',']) || "";
                                                }
                                                return null;
                                            }).filter(value => value != null);

                                            yAxis[index] = {
                                                name: valueName,
                                                splitNumber: 5
                                            };
                                            series[index] = {
                                                name: valueName,
                                                type: xtype,
                                                data: valueArr,
                                                yAixsIndex: index
                                            };
                                        }

                                        ChartSpacerID.setOption({
                                            legend: legend,
                                            yAxis: yAxis,
                                            series: series
                                        });
                                    }
                                }
                            });
                        }
                        //自适应当前区域大小
                        if (ChartSpacerID && chartSpacer) {
                            $(window).resize(() => {
                                window.Echarts.forEach(echarts => {
                                    setTimeout(echarts.resize, 1000);
                                });
                            });
                            setTimeout(() => {
                                this.resizeCharts($("#" + chartSpacer.chartSpacerId), ChartSpacerID);
                                ChartSpacerID.resize();
                            }, 200);
                        }
                    }
                }
            },
            resizeCharts(currentChart, barChart) {
                $(barChart.id).width(currentChart.width() + "px");
                $(barChart.id).height(currentChart.height() + "px");
            },
            initLayout(config) {
                this.pCode = config.code;
                this.$nextTick(() => {
                    let container = $(".realTime");
                    container.removeClass("ui-layout-container");
                    container.removeAttr("style");
                    container.removeData("layout");
                    container.removeData("layoutContainer");
                    container.empty();

                    // 当视图只配置了一个块的情况
                    if (config.columns && !config.childNodes) {
                        this.renderBlock(config, container[0]);
                    } else {
                        this.breadthFirstSearch(config);
                    }
                });
            },
            /**
             * 获取指标应该在左轴还是右轴
             *
             * @param idx      指标的序号，判断当前是哪个指标
             * @param columns  指标配置对象
             * @param setting 图表的settings
             * @return {*}
             */
            getValueIndex(idx, columns, setting) {
                let uid = columns[idx].uniqueId, index;
                if (!commonTools.isStringEmpty(uid)) {
                    if (setting.yAxisLeft == uid) {
                        index = 0;
                    } else if (setting.yAxisRight == uid) {
                        index = 1;
                    } else {
                        index = idx;
                    }
                } else {
                    index = idx;
                }
                return index;
            },
            /**
             * 根据X轴的分类个数以及图表容器的宽度，设置合适的datazoom初始显示范围
             *
             * @param chartInstance echarts实例
             * @param xAxisDataLength 根据X轴的分类个数
             * @param factor 系数，与设置的初始显示范围大小呈正相关，默认值为1.
             */
            setDataZoom(chartInstance, xAxisDataLength, factor = 1) {
                if (chartInstance && typeof xAxisDataLength == 'number' && typeof factor == 'number') {
                    let containerW = chartInstance.getWidth();
                    let maxShowNum = Math.floor(containerW / 40) * factor;
                    chartInstance.setOption({
                        dataZoom: [{
                            type: 'slider',
                            end: 100,
                            start: maxShowNum >= xAxisDataLength ? 0 : Math.floor((xAxisDataLength - maxShowNum) / xAxisDataLength * 100)
                        }]
                    });
                }
            }
        }
    };
</script>

<style>
    @import "./../../styles/default1/componentsCss/customView.css";
    @import "./../../styles/default1/TabClass/newCreate.css";
</style>