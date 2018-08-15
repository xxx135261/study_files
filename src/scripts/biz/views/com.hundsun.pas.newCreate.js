/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/4/16  mengjq  新增
 * ========    =======  ============================================
 */
import Vue from "vue";

//获取聚合接口定义
import aggregation from "./com.hundsun.pas.aggregation.js";
import customViewport from "./com.hundsun.pas.customviewport.js";

//使用区域填充库
const AreaCellLibrary = Vue.component("AreaCellLibrary");

//配置视图页面风格
export default {
    name: "newCreate",
    data() {
        return {
            tabsParam: [{
                icon: "tab-img", title: "表格"
            }, {
                icon: "bar-img", title: "柱状图"
            }, {
                icon: "line-img", title: "折线图"
            }, {
                icon: "pie-img", title: "饼图"
            }],
            //设置当前选择的配置模板
            nowIndex: "",
            //用于存放整个视图配置信息
            customViewportDataSet: {
                code: "areaId_" + Date.parse(new Date()), //布局区域信息
                name: "" //用于存放当前视图定义名称
                // xtype: '' //需要创建配置的xtype,当前提供table,bar,line,pie
                // indexSetName: '', //指标集名称
                // columns: [], //用于存放指标,
                // config: {}, //存放当前配置项信息，如table，bar，line，pie
            },
            //用于记录JsonDataSet对象操作
            rootMap: new Map(),
            /*视图配置保存标识*/
            saved: false,
            layoutArray: [],
            // 用于保存视图时控制遮罩层
            saving: false
        };
    },
    props: {
        viewConfig: {
            type: Object,
            required: false
        }
    },
    beforeRouteLeave(to, from, next) {
        const freeToLeave = () => {
            this.$store.commit({
                type: "navigate/removeClosableNav",
                path: "newViewport"
            });
            return next();
        };
        // 如果保存自定义视图成功，不显示保存提醒
        if (!this.saved) {
            $.confirm({
                title: "温馨提示!",
                content: "当前页面尚未保存，离开页面将丢失?",
                buttons: {
                    "确定": () => {
                        freeToLeave();
                    },
                    "取消": () => {
                        return next(false);
                    }
                }
            });
        } else {
            freeToLeave();
        }
    },
    created() {
        this.$validator.attach({
            name: "viewName",
            rules: "required"
        });
    },
    mounted() {
        //初始化当前页面布局
        this.newCreateLayout();
        //初始化维度，筛选添加，显示设置数据
        this.initData();
        if (!this.viewConfig) {
            // 初始化添加
            this.rootMap.set(this.customViewportDataSet.code, this.customViewportDataSet);
        } else {
            this.customViewportDataSet = this.viewConfig;
            this.$nextTick(() => {
                this.restoreLayout(this.viewConfig);
            });
        }
    },
    methods: {
        /**
         * 初始化页面基础数据
         */
        initData() {
            let type = "com.hundsun.frcp.engine.aggregation.AggregationDefinition";
            let chartArray = ["table", "bar", "line", "pie"];
            aggregation.searchConfigs(null, type, (result) => {
                chartArray.reduce((total, currentValue) => {
                    this.$refs[currentValue + "Chart"].dimension = result;
                }, this.$refs);
            });
        },
        /**
         *  创建视图布局，元素，保存页面布局style设置
         */
        newCreateLayout() {
            //初始化布局风格
            $("div.newCreate").layout({
                north: { spacing_open: 3, size: "50%" },
                south: { spacing_open: 3, size: "10%" },
                center: { size: "40%" }
            });
        },
        /**
         * 根据视图配置对象重建布局
         *
         * @param viewConfig
         */
        restoreLayout(viewConfig) {
            this.$refs.container.initLayout(viewConfig);
        },

        /**
         * 切换tab项
         */
        toggleTabs: function(index) {
            let pNode, currentTarget = this.$refs.container.curentTarget, chartSpacer, ChartSpacerID;
            //尚未选中可见区域，则直接返回，无需进行其他操作
            if (!currentTarget) return;
            //清空已填充的元素对象
            currentTarget.empty();
            //用于设定当前切换tab
            this.nowIndex = index;
            //获取当前选中区域对象
            pNode = this.rootMap.get(currentTarget.context.id);
            if (pNode) {
                pNode.xtype = (index == 0) ? "table" : (index == 1) ? "bar" : (index == 2) ? "line" : (index == 3) ? "pie" : "";
                if (index == 0) {
                    //表格填充垫片
                    let tableHTML = "<div class=\"table-move\"><table class=\"table table-bordered\"><thead><tr><td>列头1</td><td>列头2</td></tr></thead><tbody></tbody></table></div>";
                    $(currentTarget).html(tableHTML);
                    var columns = pNode.columns;
                    var currentHTML = $(currentTarget).find("table").find("thead");
                    if (columns && $.isArray(columns) && columns.length > 0) {
                        currentHTML.empty();
                        var _column = "<tr>";
                        columns.forEach(function(column) {
                            _column += "<th>" + column.header + "</th>";
                        });
                        _column += "</tr>";
                        currentHTML.append(_column);
                        return;
                    }
                } else {
                    //图表填充垫片
                    chartSpacer = new AreaCellLibrary({
                        el: document.createElement("div"),
                        data: {
                            chartSpacerId: ("chartSpacer_") + Date.parse(new Date())
                        }
                    });
                    currentTarget.append(chartSpacer.$el);

                    //进行初始化Echart图表组件
                    ChartSpacerID = chartSpacer.initEcharts(chartSpacer.chartSpacerId);

                    //柱状图，折线图，饼图
                    chartSpacer.setEchartsOption(ChartSpacerID, this.$refs[pNode.xtype + "Chart"].echartConfig);
                }
            }
            if (index != 0) {
                //自适应当前区域大小
                $(window).resize(() => {
                    setTimeout(() => {
                        this.resizeCharts($("#" + chartSpacer.chartSpacerId), ChartSpacerID);
                        ChartSpacerID.resize();
                    }, 200);
                });
            }
        },
        resizeCharts(currentChart, barChart) {
            $(barChart.id).width(currentChart.width() + "px");
            $(barChart.id).height(currentChart.height() + "px");
        },
        /**
         * 布局方式
         */
        setLayout(layout) {
            this.$refs.container.insert(layout);
        },
        /**
         * 获取当前布局区域
         */
        getLayoutContainer(columns) {
            return this.$refs.container.draw(columns, this.nowIndex), columns;
        },
        /**
         * 当前布局选择器生效时，取消元素以及保存区域的遮罩层
         */
        isRemoveMaskStyle(state) {
            if (state) {
                $("#step3").css("display", "none");
                $("#step2").css("display", "none");
            } else {
                $("#step3").css("display", "");
                $("#step2").css("display", "");
            }
        },
        /**
         * 通过布局区域选择器,反选元素对象
         */
        invertSelectionElement() {
        },
        /***
         * 设置选中区域指标集
         */
        setAreaIndexSet(config) {
            const currentVal = (config ? Object.clone(config) : {});
            const pNode = this.rootMap.get(this.$refs.container.curentTarget.context.id), xtype = pNode.xtype;
            this.nowIndex = (xtype == "table") ? 0 : (xtype == "bar") ? 1 : (xtype == "line") ? 2 : (xtype == "pie") ? 3 : "";
            if (xtype && currentVal && currentVal.columns) {
                this.$refs[xtype + "Chart"].$refs.aggConfigTemplate.setSelectedValue(this.convertColumnsConfig(currentVal.columns));
                pNode.columns = this.getLayoutContainer(currentVal.columns);
                pNode.config = {
                    indexSetName: currentVal.indexSetName,
                    advancedConfig: currentVal.advancedConfig,
                    settings: currentVal.settings || {}
                };
                return pNode;
            }
            if (pNode.config) {
                pNode.config = {
                    indexSetName: pNode.config.indexSetName || "",
                    columns: pNode.columns || [],
                    advancedConfig: pNode.config.advancedConfig,
                    settings: pNode.config.settings || {}
                };
                const targetConfig = this.$refs[xtype + "Chart"].config;
                this.$refs[xtype + "Chart"].config = Object.assign(targetConfig, pNode.config);
            }
            return;
        },
        /**
         * 高级设置的选择区域
         */
        selectDimension(event) {
            if (event.target.value) {
                var pNode = this.rootMap.get(this.$refs.container.curentTarget.context.id);
                pNode.dimension = event.target.value;
            }
        },
        selectFiltrate(event) {
            if (event.target.value) {
                var pNode = this.rootMap.get(this.$refs.container.currentTarget.context.id);
                pNode.filtrate = event.target.value;
            }
        },

        /**
         * 验证所有的组件
         */
        applyCustomViewport() {
            const viewData = this.customViewportDataSet;
            if (!viewData.hasOwnProperty("layout")) {
                if (!viewData.hasOwnProperty("columns")) {
                    $.alert({
                        title: "温馨提示",
                        content: "请配置相应的图表信息!"
                    });
                    return;
                }
            }
            this.$validator.validate("viewName", this.customViewportDataSet.name).then((result) => {
                if (result) {
                    this.saveLayoutViewport();
                }
            });
        },
        /**
         * 保存布局视图
         */
        saveLayoutViewport() {
            //布局区域代码片段
            this.$refs.container.curentTarget.css("border", "");
            var pNode = this.rootMap.get(this.customViewportDataSet.code);
            pNode.name = this.customViewportDataSet.name;
            this.saving = true;
            customViewport.saveCustomViewport({config: pNode}).then((result) => {
                this.saving = false;
                if (!result.error) {
                    let data = result.data;
                    if (!data) {
                        this.saved = true;
                        $.showNotice("修改视图保存成功！");
                        this.$emit("update", pNode, "edit");
                    } else {
                        if (data.failMessage != "1") {
                            this.saved = true;
                            $.showNotice("新建视图保存成功！");
                            this.$store.dispatch({
                                type: "navigate/appendNewTab",
                                router: this.$router,
                                viewConfig: {
                                    vc_guid: data.pid,
                                    vc_name: pNode.name
                                }
                            });
                        }
                    }
                    this.$store.dispatch({
                        type: "navigate/loadUserViews",
                        router: this.$router
                    });
                    return;
                }
                $.showNotice("新建视图保存失败!", "error");
            });
        },
        /**
         * 预览视图
         */
        preview() {
            //布局区域代码片段
            this.$refs.container.curentTarget.css("border", "");
            var pNode = this.rootMap.get(this.customViewportDataSet.code);
            pNode.name = this.customViewportDataSet.name;
            customViewport.saveCustomViewport({config: pNode, pattern: 'preview'}).pipe((result) => {
                const config = result.data;
                if (config) {
                    this.$emit('update', config, 'preview', this.customViewportDataSet);
                }
            });
        },
        /***
         * 表格行拖拽
         * @author mengjq@hundsun.com
         */
        //拖拽行拖拽过程中样式设置
        fixHelper(e, ui) {
            ui.children().each(function() {
                $(this).css({ "background": "#f4f5f6", "border-top": "1px solid #ccc" });
            });
            return ui;
        },
        //拖拽结束的事件
        dragStop(e, ui) {
            ui.item.each(function() {
                $(this).children("span").css({ background: "none", "border-top": "none" });
            });
        },
        /**
         * 拖动单元格行，上下移动
         */
        dragTr() {
            $(".quota-config .table_body").sortable({
                cursor: "move",
                helper: this.fixHelper,
                axis: "y",
                revert: true, //释放时，增加动画
                handle: ".move",
                stop: this.dragStop
            });
            $(".table_body").disableSelection();
        },
        /**
         * 表格删除当选中的行
         */
        deleteAggitem(index, columnsValue, type) {
            this.$refs[type].$refs.aggConfigTemplate.removeSelectedValue(columnsValue.splice(index, 1)[0].uniqueId);
        },
        /**
         * 将视图对象中的column转换成自定义配置中选中指标的格式
         *
         * @param columns
         * @return {Array}
         */
        convertColumnsConfig(columns) {
            let colArr = [];
            if (columns && $.isArray(columns)) {
                Array.prototype.forEach.call(columns, column => {
                    colArr.push({
                        name: column.header,
                        uniqueId: column.uniqueId,
                        baseName: column.baseName,
                        showProperties: column.showProperties
                    });
                });
            }
            return colArr;
        }
    }
};