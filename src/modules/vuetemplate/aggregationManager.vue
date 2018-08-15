<template src="../html/aggregationManager.html"></template>

<script>
    import aggregation
        from '../../scripts/biz/views/com.hundsun.pas.aggregation.js';
    import aggSelectDetail from './aggregationSelectDetail.vue';
    export default {
        name: 'aggregationManager',
        components:{
           aggSelectDetail
        },
        data() {
            return{
                valueArray: [],
            	//树菜单初始数据
            	setting:{},
            	zNodes: [
                    {
                        name: "维度定义 - 展开", open: true,
                        children: [
                            {name: "股票"},
                            {
                                name: "债券",
                                children: [
                                    {name: "企业债"},
                                    {name: "国债"},
                                    {name: "其它"}
                                ]
                            },
                            {name: "其它"}
                        ]
                    },
                ],
                checkAll:false,
                estabTime:null,
                isHiden:false,
                searchIsShow:true,
                configIsShow: false,
                isBlock:false,
                aggregationDefinitions:[],
                aggregationDefinitionName: null,
                aggregationDefinitionUId: null,
                aggDescription: null,
                aggSpecification: null,
                selectedValue: "所选指标",
                searchAggDefName: null,
                valueRepoConfigs :[],
                aggregateValueConfigs:[],
                parametersContent:{},
                //true 为add
                addOrUpdate : true,
                //当前页码
                aggDefCurrent: 1,
                //每页展示最大行数
                showItem: 5,
                //总页数
                aggDefAllPage: 1,

                //---------------------自定义维度指标---------------
                searchAggregateValueName: '',
                aggregateValues: [],
                //当前页码
                aggregateValueCurrent: 1,
                //总页数
                aggregateValueAllpage: 1,
                aggVCheckAll: false,
                aggVSearchIsShow: true,
                aggVConfigIsShow: false,

                aggregateValue: {},
                aggregateValueName: '',
                aggVCheckAllDt: false,
                aggVDesc: '',
                aggregateValueDt: {},
                //当前弹窗内容
                aggDtItem: {},
                //------------------------------------------------
            }
        },
        mounted(){
        	this.treeInit();
            $('.config_panel').slideUp(300);
            $('.aggvconfig_panel').slideUp(300);
            this.searchAggregationDefinition();
            this.searchAggregateValue();
            this.getValueConfigs();
        },
        watch: {
            checkAll: {
                handler(checkValue) {
                    this.checkedAll();
                }
            },
            aggVCheckAll: {
                handler(aggVCheckValue){
                    this.checkedAggregateValueAll();
                }
            },
            aggregationDefinitionName: {
                deep: true,
                handler(changeName) {
                    var zTreeObj = $.fn.zTree.getZTreeObj("treeDemo");
                    let node = zTreeObj.getNodes()[0];
                    node.name = changeName;
                    zTreeObj.updateNode(node);
                    zTreeObj.selectNode(node);
                    $('#aggregationDefinitionName').focus();
                }
            }
        },

        computed: {
        	
        },
        methods:{
            handleSelection(valueArr) {
                this.valueArray = valueArr;
                console.log(valueArr);
            },


        	//初始化树节点
        	treeInit(){
        	    $.fn.zTree.init($("#treeDemo"), this.setting, this.zNodes);
       		},

            /**
             * 查询维度定义，支持模糊查询
             * @param param 维度定义名称
             */
            searchAggregationDefinition(param) {
                var $this = this;
                var index = null;
                var name = null;
                if (typeof(param) === 'number') {
                    index = param;
//                    if(index == $this.aggDefCurrent) return;
                    this.aggDefCurrent = index;
                }
                if (typeof(param) === 'string') {
                    index = null;
                    //instr()>0 like
                    name = '%'+ param + '%';
                    if (param === null) {
                        name = null;
                        index = 1;
                    }
                }

                var type = "com.hundsun.frcp.engine.aggregation.AggregationDefinition";
                aggregation.searchConfigsByPg(name, type, index, function (result) {
                    var aggregationDefinition  = result.data;
                    $this.aggDefAllPage = Math.ceil(result.totalItems / $this.showItem);
                    if ($.isArray(aggregationDefinition)) {
                        for (var aggregateValueNum = 0; aggregateValueNum < aggregationDefinition.length; aggregateValueNum ++) {
                            var name = aggregationDefinition[aggregateValueNum].name;
                            var desc = aggregationDefinition[aggregateValueNum].value.desc;
                            $this.$set($this.aggregationDefinitions, aggregateValueNum, aggregationDefinition[aggregateValueNum]);
                        }
                        $this.aggregationDefinitions = aggregationDefinition;
                    }
                });
                $("#searchAggDefName").on('input propertychange', function () {
                    $this.searchAggDefName = $(this).val();
                }).keydown(function (event) {
                    if (event.keyCode == 13) {
                        $this.searchAggregationDefinition($this.searchAggDefName);
                        event.preventDefault();
                    }
                });
                $('#aggDescription').on('input propertychange', function () {
                    $this.aggDescription = $(this).val();
                   var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                   zTree.getNodes()[0].desc = $this.aggDescription;
                });
            },

            /**
             * 获取参与聚合计算指标与自定义维度指标
             */
            getValueConfigs() {
                var $this = this;
                aggregation.searchValueRepoConfig(1, null, function (result) {
                   $this.valueRepoConfigs = result;
                });
                var type = "com.hundsun.frcp.engine.aggregation.AggregateValue";
                aggregation.searchConfigs(null, type, function (result) {
                    $this.aggregateValueConfigs = result;
                });

            },

            /**
             * 根据名称匹配指标
             * @param name
             * @param index
             */
            matchValue(name, index) {
                //index : 0 现有参与聚合指标， 1：自定义维度指标
                var $this = this, i = 0;
                var aggValueLength = $this.aggregateValueConfigs.length;
                var valRepoLength = $this.valueRepoConfigs.length;
                switch (index) {
                    case 0:
                        for (i = 0; i < valRepoLength; i++) {
                            if (name == $this.valueRepoConfigs[i].valueName) {
                                $(".selector").get(0).selectedIndex = i + 1 + aggValueLength;
                                break;
                            }
                        }
                        //都没有匹配上不显示
                        if ( i== $this.valueRepoConfigs.length - 1 &&
                            name != $this.valueRepoConfigs[valRepoLength - 1].valueName) {
                            $(".selector").get(0).selectedIndex = 0;
                        }

                        break;
                    case 1:
                        for (i = 0; i < aggValueLength; i++) {
                            if (name == $this.aggregateValueConfigs[i].name) {
                                $(".selector").get(0).selectedIndex = i + 1;
                                break;
                            }
                        }
                        if ( i== $this.aggregateValueConfigs.length - 1 &&
                            name != $this.aggregateValueConfigs[aggValueLength- 1].name) {
                            $(".selector").get(0).selectedIndex = 0;
                        }
                        break;
                    default:
                        break;
                }
            },

            /**
             * 根据维度定义展示维度树
             * @param aggregationDefinition
             */
            showAggConfigs(aggregationDefinition) {
                this.configIsShow = !this.configIsShow;
                var $this = this;
                $this.addOrUpdate = false;
                $(".selector").get(0).selectedIndex = 0;
                $('.box').empty();
                $('.config_panel').slideDown(300);

                //开始解析该对象
                var value = null;
                var aggDefName = aggregationDefinition.name;
                $this.aggregationDefinitionName = aggDefName;
                $this.aggregationDefinitionUId = aggregationDefinition.uniqueId;
                //维度定义描述展示
                var desc = aggregationDefinition.value.desc;
                $this.aggDescription = desc;

                var rootAggregator = aggregationDefinition.value.aggregator;

                //点击维度节点
                function aggNodeOnClick(e,treeId, treeNode) {
                    var uniqueId = treeNode.uniqueId;
                    if ( null != uniqueId) {

                        //如果包含指标为自定义维度指标，需清空现有指标参数
                        $('.box').empty();

                        aggregation.searchConfigsByUid(uniqueId, function (result) {
                            //result[1]即指标描述
                            var aggValueName = result[1];
                            $this.matchValue(aggValueName, 1);
                        });

                    } else {
                        //具有所选指标
                        if (treeNode.value != null && treeNode.value.valueName != null) {
                            var valueName = treeNode.value.valueName;
                            if (valueName === null) {
                                $(".selector").get(0).selectedIndex = 0;
                                //没有所选指标的底层
                            } else {
                                //已有所选参与聚合的指标
                                $this.matchValue(valueName, 0);
                                var hasValueProperties = treeNode.value.hasOwnProperty('valueProperties');
                                if (hasValueProperties) {
                                    //现有参与聚合的指标
                                    var index = $('option:selected', '.selector').index();
                                    var valueRepo = $this.valueRepoConfigs[index - 1 - $this.aggregateValueConfigs.length];
                                    //控制最后所选指标是指前台显示的名称还是后台可以进行计算的名称, 后台直接解析该指标 选择后台可以进行计算的名称
//                                    zTree.getSelectedNodes()[0].value.valueName = valueRepo.valueName;
                                    if (valueRepo.hasOwnProperty('valueDefaultParameterMap')) {
                                        $this.showParameterConfigs(valueRepo, treeNode);
                                    }
                                }
                            }
                        } else {
                            //无所选指标
                            $(".selector").get(0).selectedIndex = 0;
                            $(".box").empty();
                        }
                    }
                };
                //zTree设置
                var setting  = {
                    callback: {
                        onClick : aggNodeOnClick
                    }
                };
                //初始化zTree树
                $.fn.zTree.init($("#treeDemo"),setting,[]);
                var zTreeObj = $.fn.zTree.getZTreeObj("treeDemo");

                $this.showTotalTree(rootAggregator, zTreeObj, null);

            },

            /**
             * 根据现有指标名称获取中文描述
             */
            matchValueDescirbe(name) {
              var $this = this, i = 0;
              var valRepoLength = $this.valueRepoConfigs.length;
              for (i = 0; i < valRepoLength; i++) {
                  if (name == $this.valueRepoConfigs[i].valueName) {
                      name = $this.valueRepoConfigs[i].valueDescribe;
                      break;
                  }
              }
              return name;
            },


            /**
             *   根据维度节点迭代展示子节点
             */
            showTotalTree(aggregator, zTree, node) {
                var $this = this;
                var values = null, parentNode = node, nodeName = aggregator.name, nextNodeName = null, value = null, aggregators = null;
                var hasAggregators =  aggregator.hasOwnProperty('aggregators');
                var hasUniqueId = aggregator.hasOwnProperty('uniqueId');
                if (hasUniqueId) {
                    var uniqueId = aggregator.uniqueId;
                } else {
                    var uniqueId = null;
                }
                //单独处理根节点
                if (parentNode == null && !aggregator.hasOwnProperty("values")) {
                    var rootNode = {name: nodeName, value: value, uniqueId: uniqueId, open: true, children:[]};
                    zTree.addNodes(parentNode, rootNode, false);
                }

                if (aggregator.hasOwnProperty('values') && uniqueId == null) {
                    values = aggregator.values;
//                    var valuesLength = Object.getOwnPropertyNames(values).length - 1;
                    if(node == null) {
                        for (var eachValueName in values) {
                            var eachValue = values[eachValueName];
                            if (parentNode != node) {
                                nodeName = nextNodeName;
                            }
                            value = eachValue;
                            nextNodeName = eachValue.valueName;
                            if (parentNode == null) {
                                var rootNode = {name : nodeName, value : value,
                                    uniqueId : uniqueId, open : true, desc: $this.aggDescription, children:[]};
                            } else {
                                nodeName = $this.matchValueDescirbe(nodeName);
                                var rootNode = {name : nodeName, value : value,
                                    uniqueId : uniqueId, open : true, children:[]};
                            }
                            zTree.addNodes(parentNode, rootNode, false);
                            parentNode = zTree.getNodeByParam("name", nodeName, parentNode);
                        }
                        nodeName = nextNodeName;
                        nodeName = $this.matchValueDescirbe(nodeName);
                        rootNode = {name : nodeName, open: true, value: {valueName: null, valueProperties: null}, uniqueId: null, children: []};
                        zTree.addNodes(parentNode,rootNode, false);
                        if (hasAggregators) {
                            parentNode = zTree.getNodeByParam("name", nodeName, parentNode);
                            var subAggregator = aggregator.aggregators.aggregator;
                            parentNode.uniqueId = subAggregator.uniqueId;
                            parentNode.value = subAggregator.values.value;
                            $this.showTotalTree(subAggregator, zTree, parentNode);
                        }
                    } else {
                        for (var eachValueName in values) {
                            var eachValue = values[eachValueName];
                            if (parentNode != node) {
                                parentNode.value = eachValue;
                            }
                            value = eachValue;

                            var rootNode = {name : $this.matchValueDescirbe(value.valueName), value : {valueName: null, valueProperties: null},
                                uniqueId : null, open : true, children:[]};
                            zTree.addNodes(parentNode, rootNode, false);
                            parentNode = zTree.getNodeByParam("name", rootNode.name, parentNode);
                        }
                        if (hasAggregators) {
                            var subAggregator = aggregator.aggregators.aggregator;
                            parentNode.uniqueId = subAggregator.uniqueId;
                            parentNode.value = subAggregator.values.value;
                            $this.showTotalTree(subAggregator, zTree, parentNode);
                        }
                    }

                }

                if (hasAggregators && uniqueId != null) {
                    if (node == null) {
                        value = aggregator.hasOwnProperty("values")?aggregator.values.value:null;
                        var rootNode = {name : nodeName, value : value,
                            uniqueId : uniqueId, open : true, desc: $this.aggDescription, children:[]};
                        zTree.addNodes(node, rootNode, false);
                        node = zTree.getNodeByParam("name", nodeName, node);
                    }
                    aggregators = aggregator.aggregators;
                            for(var subAggregatorAttrName in aggregators) {
                                subAggregator = aggregators[subAggregatorAttrName];
                                nodeName = subAggregator.name;
                                value = (subAggregator.hasOwnProperty("values"))?subAggregator.values.value:null;
                                var nextUniqueId = (subAggregator.hasOwnProperty("uniqueId"))?subAggregator.uniqueId : null;
                                rootNode = {name : nodeName, open: true, value: value, uniqueId: nextUniqueId, children: []};
                                zTree.addNodes(node, rootNode, false);
                                parentNode = zTree.getNodeByParam("name", nodeName, node);
                                $this.showTotalTree(subAggregator, zTree, parentNode);
                            }
                }


            },

            /**
             * 删除维度定义
             */
            delAggregationDefinition(){
                var $this = this;
                for(var item in $this.aggregationDefinitions) {
                    if ($this.aggregationDefinitions[item].isCheck) {
                        aggregation.delConfig($this.aggregationDefinitions[item].uniqueId);
                        if($this.simplifyUniqueId($this.aggregationDefinitions[item].uniqueId) == $this.simplifyUniqueId($this.aggregationDefinitionUId)) {
                            $this.newAggDefConfig();
                        }
                    }
                }
                //延时以等待删除完毕
                setTimeout(function () {
                    $this.searchAggregationDefinition();
                }, 100);
                $this.checkAll = false;
//                $("#selectAll").prop('checked', false);
            },

            /**
             * 根据所选指标展示指标所需参数
             * @param valueRepo
             * @param node
             */
            showParameterConfigs(valueRepo, node) {

                $(".box").empty();
                var $this = this;
                var showOrChange = (node.hasOwnProperty('value') && node.value.valueProperties!= null);
                var parameters = valueRepo.valueDefaultParameterMap;

                var parametersArray = Object.keys(parameters);
                var parameter;
                var parameterHtml = "";
                var valueProperties = {};
                valueProperties["with"] = {};
                for(var i = 2; i < parametersArray.length; i += 2) {
                    parameter = parameters[parametersArray[i]];
                    //指标默认参数
                    //中文描述
                    var parameterDesc = parameter.parameterDescribe;
                    //英文名称用作标识
                    var parameterName = parameter.parameterName;

                    var defaultParameter = (showOrChange) ? node.value.valueProperties.with[parameterName] : parameters[parametersArray[i + 1]];

                    valueProperties["with"][parameterName] = defaultParameter;

                    var selectContent = [], selectIndex = 0;

                    parameterHtml += "<div class='paramewrap'><span>" + parameterDesc + " :"+ "</span>";
                    if (parameter.hasOwnProperty('parameterRange')) {
                        //下拉框   此处parameterChange无效果，动态HTML绑定事件
                        parameterHtml += "<select value='" + defaultParameter + "' class='selectParameter' id='" + parameterName +"' " + " @change='parameterChange(" + parameterName +")'>";

                        var parameterRange = parameter.parameterRange;
                        parameterHtml += "<option >请配置指标参数</option>";
                        for (var subParameter in parameterRange) {
                            //值域获取
                            var defaultOption = parameterRange[subParameter];
                            selectContent[selectIndex++] = defaultOption;
                            if (defaultOption == defaultParameter) {
                                parameterHtml += "<option selected='selected'>" + defaultOption + "</option>";
                            } else {
                                parameterHtml += "<option>"+ defaultOption + "</option>";
                            }
                        }
                        $this.parametersContent[parameterName] = selectContent;
                        parameterHtml += "</select></div>";
                    } else {
                        //输入框
                        parameterHtml += "<input type='text' value='"+ defaultParameter +"' class='inputParameter' id='" + parameterName +"'" + "/>";
                        parameterHtml += "</div>";
                    }
                    $(".box").html(parameterHtml);
                    //转为设标签设置默认值
                }

                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                zTree.getSelectedNodes()[0].value.valueProperties = valueProperties;

                //监听指标属性变更，并实时更新
                $(".inputParameter") .on('input propertychange', function () {

                    var valueProperties = $(this).val();
                });
                function parameterChange(self) {

                    var propertyName = self[0].getAttribute("id");
                    var propertyRange = $this.parametersContent[propertyName];

                    var index = self.find("option:selected").index() - 1;
                    var specProperty = propertyRange[index];
                    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                    zTree.getSelectedNodes()[0].value.valueProperties["with"][propertyName] = specProperty;

                };
                $(".selectParameter").change(function () {
                    parameterChange($(this));
                });
            },

            /**
             * 切换所选指标
             * @param event
             */
            change(event) {
                var $this = this;
                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                var node = zTree.getSelectedNodes()[0];

                if (typeof(node) == "undefined") {
                    $.showNotice("请选中维度节点!", 'error');
                    $(".selector").get(0).selectedIndex = 0;

                    //没有指标参数
                } else {
                    var index = $('option:selected', '.selector').index();
                    zTree.removeChildNodes(node);
                    if (index == 0) {
                        //默认请选择指标
                        zTree.getSelectedNodes()[0].uniqueId = null;
                        zTree.getSelectedNodes()[0].value = {};
                        zTree.getSelectedNodes()[0].value["valueName"]= null;
                        zTree.getSelectedNodes()[0].value["valueProperties"]= null;
                    } else if (index <= $this.aggregateValueConfigs.length) {
                        //自定义维度指标
                        var aggregateValue = $this.aggregateValueConfigs[index - 1];
                        zTree.getSelectedNodes()[0].uniqueId = aggregateValue.uniqueId;
                        zTree.getSelectedNodes()[0].value = {};
                        zTree.getSelectedNodes()[0].value["valueName"] =  aggregateValue.name;
                        zTree.getSelectedNodes()[0].value["valueProperties"] = null;
                        //计算规则
                        var valueCalcs = aggregateValue.value.valueCalc;
                        for (var valueCalc in valueCalcs) {
                            var ruleName = valueCalcs[valueCalc].ruleName;
                            var childNode = {name : ruleName, open: true, value : {valueName: null, valueProperties: null},children:[]};
                            zTree.addNodes(node, childNode, false);
                        }

                    } else {
                        if(node.value === null) {
                            node.value = {};
                            zTree.getSelectedNodes()[0].value["valueName"]= null;
                            zTree.getSelectedNodes()[0].value["valueProperties"]= null;
                        }
                        //现有参与聚合的指标
                        var valueRepo = $this.valueRepoConfigs[index - 1 - $this.aggregateValueConfigs.length];
                        //选择后台可以进行计算的名称
                        if (node.value.valueName != valueRepo.valueName) {
                            zTree.getSelectedNodes()[0].value.valueProperties = null;
                        }
                        zTree.getSelectedNodes()[0].value.valueName = valueRepo.valueName;
                        //ID复位
                        zTree.getSelectedNodes()[0].uniqueId = null;
                        if (valueRepo.hasOwnProperty('valueDefaultParameterMap')) {
                           $this.showParameterConfigs(valueRepo, node);
                        }
                        //增加仅可选择现有指标子节点
                        var subValueNode = {name : valueRepo.valueDescribe, open: true, value : {valueName: null, valueProperties: null},children:[]}
                        zTree.addNodes(node, subValueNode, false);
                    }
                    zTree.refresh();
                    //分析了一下HTML元素根据特征主动触发点击，暂时没有更好的方案
                    $("#" + node.tId + "_a").trigger("click");
//                     主动触发点击回调事件
//                    zTree.setting.callback.onClick(null, zTree.setting.treeId, zTree.getNodeByTId(node.tId));
//                    check状态选中，非点击选择！
//                    var reSelectNode = zTree.getNodeByTId(node.tId);
//                    reSelectNode.checked = true;
//                    zTree.updateNode(reSelectNode);
                }
            },

            /**
             * 保存以及更新维度定义
             */
            saveAggDefConfigs(){
                var $this = this;
                if ($this.aggregationDefinitionName == null || $this.aggregationDefinitionName == '') {
                    $.showNotice("请输入维度定义名称！", 'warning');
                    return;
                }

                //解析zTree 构建对象
                var zTreeObj = $.fn.zTree.getZTreeObj("treeDemo");
                var rootNode = zTreeObj.getNodes()[0];
                //todo 如何构建节点对象
                var aggregator = $this.buildAggregator(rootNode);

                var aggDefName = rootNode.name, desc = null;
                if (!$.isEmptyObject(rootNode.desc)) {
                    desc = rootNode.desc;
                }
                var aggregationDefinition = {name: aggDefName, aggregator: null, desc: desc, uniqueId: 'DbCfg~0'};

                aggregationDefinition.aggregator = aggregator;
                if(!$this.addOrUpdate) {
                    aggregation.updateConfig($this.aggregationDefinitionUId, $this.aggregationDefinitionName, aggregationDefinition,
                        "com.hundsun.frcp.engine.aggregation.AggregationDefinition", function (result) {
                            if (result.error) {
                                $.showNotice("更新失败，请检查输入值！", 'error');
                            } else {
                                $.showNotice("更新成功！", 'success');
                                $this.searchAggregationDefinition();
                                return;
                            }
                        });
                    //更新
                    return;
                }
                aggregation.addConfig($this.aggregationDefinitionName, aggregationDefinition,
                    "com.hundsun.frcp.engine.aggregation.AggregationDefinition", function (result) {
                        if (result.error) {
                            $.showNotice("新增失败，请检查输入值！", 'error');
                        } else {
                            $this.searchAggregationDefinition();
//                            $this.newAggDefConfig();
                            $this.aggregationDefinitionUId = result.meta.id;
                            $this.addOrUpdate = false;
                            $.showNotice("新增成功！", 'success');
                        }
                    });
            },

            //组建聚合节点对象
            buildAggregator(node) {
                var $this = this;
                var aggregator = {name: node.name, values: null, uniqueId: node.uniqueId, aggregators: null},
                    aggregatorName = "aggregator_", uniqueId = node.uniqueId, valuesName = "value_", subaggregator = null, children = (node.children==null)?[]:node.children, aggregators = [];
                var value = node.value, valueName = null, valueProperties = null, values = {}, i = 0;
                if (uniqueId == null) {
                    if(children.length != 0) {
                        //说明下级节点不是空节点，则为现有参与聚合的指标
                        value = node.value;
                        values["value"] = value;
                        subaggregator = $this.buildAggregator(children[0]);
                        if (children[0].uniqueId == null) {
                            for(var v in subaggregator.values) {
                                var val = subaggregator.values[v];
                                values[valuesName + i++] =  val;
                            }
                        }
                        if (children[0].uniqueId != null) {
                            aggregator.aggregators = {aggregator : subaggregator};
                        }
                        aggregator.values = values;
                    }
                } else {
                    //下节点为自定义维度指标
                    aggregator.aggregators = {};
                    values = {value: value};
                    for(i = 0; i < children.length; i++) {
                        var child = children[i];
                        subaggregator = $this.buildAggregator(child);
                        aggregators.push(subaggregator);
                    }
                    for(i= 0; i < aggregators.length; i++) {
                        aggregator.aggregators[aggregatorName + i] = aggregators[i];
                    }
                    aggregator.values = values;
                }
                return aggregator;

            },

            /**
             * 新增维度定义
             */
            newAggDefConfig() {
                $('.config_panel').slideUp(300);

                //初始化全新 zTree对象
                var $this = this;

                function aggNodeOnClick(e,treeId, treeNode) {
                    var uniqueId = treeNode.uniqueId;
                    if ( null != uniqueId) {

                        //如果包含指标为自定义维度指标，需清空现有指标参数
                        $('.box').empty();

                        aggregation.searchConfigsByUid(uniqueId, function (result) {
                            //result[1]即指标描述
                            var aggValueName = result[1];
                            $this.matchValue(aggValueName, 1);
                        });

                    } else {
                        //具有所选指标
                        if (treeNode.value != null && treeNode.value.valueName != null) {
                            var valueName = treeNode.value.valueName;
                            if (valueName === null) {
                                $(".selector").get(0).selectedIndex = 0;
                                //没有所选指标的底层
                            } else {
                                //已有所选参与聚合的指标
                                $this.matchValue(valueName, 0);
                                var hasValueProperties = treeNode.value.hasOwnProperty('valueProperties');
                                if (hasValueProperties) {
                                    //现有参与聚合的指标
                                    var index = $('option:selected', '.selector').index();
                                    var valueRepo = $this.valueRepoConfigs[index - 1 - $this.aggregateValueConfigs.length];
                                    //控制最后所选指标是指前台显示的名称还是后台可以进行计算的名称, 后台直接解析该指标 选择后台可以进行计算的名称
//                                    zTree.getSelectedNodes()[0].value.valueName = valueRepo.valueName;

                                    if (valueRepo.hasOwnProperty('valueDefaultParameterMap')) {
                                        $this.showParameterConfigs(valueRepo, treeNode);
                                    }
                                }

                            }
                        } else {
                            //空白
                            $(".selector").get(0).selectedIndex = 0;
                            $(".box").empty();
                        }
                        //无所选指标
                    }
                };
                var setting  = {
                    callback: {
                        onClick : aggNodeOnClick
                    }
                };
                //初始化zTree树
                $.fn.zTree.init($("#treeDemo"),setting,[]);
                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                //以此为标准处理维度节点！！！
                var rootNode = {name : "", value : {valueName: null, valueProperties: null },
                    uniqueId : null, open : true, desc: null, children:[]};
                zTree.addNodes(null,rootNode, false);
                $this.aggregationDefinitionName = "";
                $this.aggregationDefinitionUId = "";
                $this.aggDescription =  "";
                $this.addOrUpdate = true;
                $(".selector").get(0).selectedIndex = 0;
                $(".box").empty();

                //定位光标
                this.configIsShow = true;
                $('.config_panel').slideDown(300);
                $('#aggregationDefinitionName').focus();
            },

            goto(index){
                if(index == this.current) return;
                this.current = index;
                //这里可以发送ajax请求
            },
            //全选
            checkedAll() {
                for(var item=0;item<=this.aggregationDefinitions.length;item++){
                    this.aggregationDefinitions[item].isCheck = this.checkAll;
                }
            },
            //单选
            singleSelect(){
                var selectData=this.aggregationDefinitions.filter(function(item){
                    return item.isCheck==true;
                })
                selectData.length==this.aggregationDefinitions.length? this.checkAll=true:this.checkAll=false;
            },

            slideUp(event, searchEl){
                let el = $(event.target);
                switch (searchEl) {
                    case "search_panel":
                        if(this.searchIsShow) {
                            $('.' + searchEl).slideUp(300);
                        } else {
                            $('.' + searchEl).slideDown(300);
                        }
                        this.searchIsShow = !this.searchIsShow;
                        break;
                    case "config_panel":
                        if(this.configIsShow) {
                            $('.' + searchEl).slideUp(300);
                        } else {
                            $('.' + searchEl).slideDown(300);
                        }
                        this.configIsShow = !this.configIsShow;
                        break;
                    default:
                        break;
                }
            },
            //绑定时间控件
            dateBlock(str){
                let $scope = this;
                laydate({
                    elem:str,
                    type:'date',
                    format:'YYYYMMDD',
                    position: 'static',
                    istoday: true, //是否显示今天
                    done: (value) => {
                        $scope.estabTime = value
                    }
                });
            },

            //--------------------------自定义指标-----------------------
            //查询，包括查询按钮和页码点击
            searchAggregateValue(param) {
                var index = null;
                if (typeof(param) === 'number') {
                    index = param;
                    if(index == this.aggregateValueCurrent) return;
                    this.aggregateValueCurrent = index;
                }

                var scope = this;
                if (scope.searchAggregateValueName && scope.searchAggregateValueName.trim() === '') {
                    scope.searchAggregateValueName = null;
                }
                aggregation.searchConfigsByPg('%' + scope.searchAggregateValueName + '%', "com.hundsun.frcp.engine.aggregation.AggregateValue",
                    index,
                    function (result) {
                        scope.aggregateValues = result.data;
                        scope.aggregateValueAllpage = Math.ceil(result.totalItems / scope.showItem);
                    });

                $("#searchAggregateValueName").keydown(function (event) {
                    if (event.keyCode == 13) {
                        scope.searchAggregateValue(scope.searchAggregateValueName);
                        event.preventDefault();
                    }
                });
            },
            /**
             *去除uid版本信息
             */
            simplifyUniqueId(uid) {
                if (uid == null) {
                    return uid;
                } else {
                    var config = uid.toString().split("~");
                    config = config[0] + "~" + config[1];
                    return config;
                }
            },
            /**
             * 删除维度
             */
            delAggregateValue() {
                var $this = this;
                for(var item in this.aggregateValues) {
                    if (this.aggregateValues[item].isCheck) {
                        aggregation.delConfig(this.aggregateValues[item].uniqueId);
                        if($this.simplifyUniqueId($this.aggregateValues[item].uniqueId) == $this.simplifyUniqueId($this.aggregateValueDt.uniqueId)) {
                            $this.clearAllAggDt();
                        }
                    }
                }
                //延时以等待删除完毕
                setTimeout(function () {
                    $this.searchAggregateValue();
                }, 100);
                $this.aggVCheckAllDt = false;
            },
            //全选
            checkedAggregateValueAll() {
                for(var item = 0 ; item < this.aggregateValues.length ; item++){
                    this.aggregateValues[item].isCheck = this.aggVCheckAll;
                }
            },
            //单选
            aggVSingleSelect() {
                var selectData = this.aggregateValues.filter(function(item){
                    return item.isCheck == true;
                });
                selectData.length == this.aggregateValues.length? this.aggVCheckAll = true: this.aggVCheckAll = false;
            },
            /**
             * 收缩
             * @param searchEl
             */
            aggVSlideUp(searchEl) {
                switch (searchEl) {
                    case "aggvsearch_panel":
                        if(this.aggVSearchIsShow) {
                            $('.' + searchEl).slideUp(300);
                        } else {
                            $('.' + searchEl).slideDown(300);
                        }
                        this.aggVSearchIsShow = !this.aggVSearchIsShow;
                        break;
                    case "aggvconfig_panel":
                        if(this.aggVConfigIsShow) {
                            $('.' + searchEl).slideUp(300);
                        } else {
                            $('.' + searchEl).slideDown(300);
                        }
                        this.aggVConfigIsShow = !this.aggVConfigIsShow;
                        break;
                    default:
                        break;
                }
            },
            /**
             * 维度点击
             * @param item
             */
            aggVItemClick(item) {
                this.aggVConfigIsShow = true;
                $('.aggvconfig_panel').slideDown(300);

                this.aggregateValue = item.value.valueCalc;
//                this.aggregateValueName = item.name;
                this.aggregateValueName = item.value.aggregateValueName;
                this.aggVDesc = item.value.desc;
                this.aggregateValueDt = item.value;
            },
            //下方全选
            checkedAggVAllDt() {
                for(var item in this.aggregateValue) {
                    this.aggregateValue[item].isCheck = !this.aggVCheckAllDt;
                }
            },
            //下方单选
            aggVSingleSelectDt() {
                var checkCount = 0;
                for (var item in this.aggregateValue) {
                    if (this.aggregateValue[item].isCheck == true) {
                        checkCount++;
                    }
                }
                checkCount == this.aggregateValue.length? this.aggVCheckAllDt = true: this.aggVCheckAllDt = false;
            },
            /**
             * 维度明细删除
             */
            delAggregateValueDt() {
                for(var item in this.aggregateValue) {
                    if (this.aggregateValue[item].isCheck) {
                        delete this.aggregateValue[item];
                    }
                }
                //vue无法检测变动
                var obj = this.aggregateValue;
                this.aggregateValue = null;
                this.aggregateValue = obj;
            },
            /**
             * 更新
             */
            aggVUpdate() {
                if (this.aggregateValueName == null || this.aggregateValueName == '') {
                    $.showNotice("请选择指标修改后更新", 'warning');
                    return;
                }
                var $this = this;
                this.$nextTick(function() {
                    $this.paramBefore($this);
                    aggregation.updateConfig($this.aggregateValueDt.uniqueId, $this.aggregateValueName, $this.aggregateValueDt,
                        "com.hundsun.frcp.engine.aggregation.AggregateValue", function (result) {
                            if (result.error) {
                                $.showNotice("更新失败，请检查输入值！", 'error');
                            } else {
                                $.showNotice("更新成功！", 'success');
                            }
                        });

                    //延时以等待更新完毕
                    setTimeout(function () {
                        $this.searchAggregateValue();
                        $this.getValueConfigs();
                    }, 100);
                });
            },
            /**
             * 维度明细增加
             */
            addAggVDt() {
                var addData = {ruleName: '', ruleSpec: '', ruleSpecText: ''};
                //vue无法检测变动
                var obj = this.aggregateValue;
                this.aggregateValue = null;
                this.aggregateValue = obj;


                var length = Object.keys(this.aggregateValue).length;
                this.aggregateValue['null_' + (length + 1)] = addData;
                //定位光标
                this.$nextTick(() => {
                    $("#aggVDtTable")[0].rows[length + 1].cells[1].focus();
                });
            },
            /**
             * 增加维度
             */
            aggVAddConfig() {
                if (this.aggregateValueName == null || this.aggregateValueName == '') {
                    $.showNotice("请输入指标名称！", 'warning');
                    return;
                }
                var $this = this;
                this.$nextTick(function () {
                    var addData = {aggregateValueDt: {uniqueId: 'DbCfg~0'}};
                    $this.paramBefore(addData);
                    aggregation.addConfig($this.aggregateValueName, addData.aggregateValueDt,
                        "com.hundsun.frcp.engine.aggregation.AggregateValue", function (result) {
                            if (result.error) {
                                $.showNotice("新增失败，请检查输入值！", 'error');
                            } else {
//                                $this.aggregateValueName = '';
//                                $this.aggVDesc = '';
//                                $this.aggregateValue = {};
//                                $this.aggregateValueDt = {};
                                $this.aggregateValueDt.uniqueId = result.meta.id;
                                $.showNotice("新增成功！", 'success');
                            }
                        });

                    //延时以等待新增完毕
                    setTimeout(function () {
                        $this.searchAggregateValue();
                        $this.getValueConfigs();
                    }, 100);
                });
            },
            /**
             * 私有方法，用于参数准备
             * @param $this
             */
            paramBefore($this) {
                $this.aggregateValueDt.aggregateValueName = this.aggregateValueName;
                $this.aggregateValueDt.desc = this.aggVDesc;
                var valueTable = {};
                for (var i = 1; i < $('#aggVDtTable')[0].rows.length; i++) {
                    var valueTableRow = {ruleName: $('#aggVDtTable')[0].rows[i].cells[1].innerText,
                        ruleSpec: $('#aggVDtTable')[0].rows[i].cells[3].innerText,
                        ruleSpecText: $('#aggVDtTable')[0].rows[i].cells[2].innerText};
                    valueTable['null_' + i] = valueTableRow;
                }
                $this.aggregateValueDt.valueCalc = valueTable;
            },
            /**
             * 接受消息
             * @param msg
             */
            receiveMsgF(msg) {
                this.aggDtItem.ruleSpecText = msg.valueCalcText;
                this.aggDtItem.ruleSpec = msg.valueCalc;
            },
            /**
             * 清空
             */
            clearAllAggDt() {
                this.aggregateValue = {};
                this.aggregateValueName = '';
                this.aggVDesc = '';
                this.aggregateValueDt = {};
                this.aggVCheckAllDt = false;
            },
            /**
             * 新增自定义维度指标
             */
            addAggDt() {
                $('.aggvconfig_panel').slideUp(300);
                this.clearAllAggDt();
                this.aggVConfigIsShow = true;
                $('.aggvconfig_panel').slideDown(300);
                $('#aggregateValueName').focus();
            },
            /**
             * 保存按钮
             */
            aggVSave() {
                if (this.aggregateValueDt.uniqueId == null) {
                    this.aggVAddConfig();
                } else {
                    this.aggVUpdate();
                }
            },
            //----------------------------------------------------------
            //自定义维度指标表格可拖动行排序(jquery-ui)
            //拖拽行的宽度设置
            fixHelper(e,ui){    
    	 		ui.children().each(function() {  
    				$(this).width($(this).width());
    				$(this).css({background:"#eeeeee"})
           	  	});
           	    return ui;
        	},
        	dragStop (e,ui) {
		        ui.item.each(function() {  
		        	$(this).children("td").css({background:"none"})
		        });
		    },
            dragTr(event,item) {
				var that = this;
            	$( "#aggVDtTable tbody").sortable({
            		cursor: "move",
				    helper: that.fixHelper,
				    axis:"y",
				    revert: true, //释放时，增加动画
				    handle:".dragTd" ,
				    stop: this.dragStop
            	});
				$( "#aggVDtTable").disableSelection();
            },

    }
    }
</script>

<style scoped>
	@import "../../styles/default1/TabClass/aggregationManager.css";
</style>