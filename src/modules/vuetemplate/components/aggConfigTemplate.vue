/**
* 组件名：自定义指标配置
*
* ##接口说明##
* 函数：
*   removeSelectedValue：取消选中的指标
*       参数：uniqueId（自定义指标的uniqueId）
*       返回值：{Array} 返回被删除的指标对象数组
* 事件：
*   updateSelection：删除分类或者指标、按下确认按钮（选中指标数大于限制数时不触发事件）触发该事件。
*       回调函数参数：{Array=[{name: '指标名称', uniqueId: '指标唯一标识'}]}
* 参数：
*   numLimit：选中指标数的上限。
*   valueType: 可选指标类型（all: 所有指标，timeseries: 仅时序指标，non-timeseries：仅非时序指标）
*/
<template src="../../html/aggConfigTemplate.html"></template>

<script>
    import aggApi from './../../../scripts/biz/views/com.hundsun.pas.aggregation';
    import zTreeUtil from './../../../scripts/core/util/com.hundsun.pas.common.util.ztree';
    import CommonTools from './../../../scripts/core/util/com.hundsun.pas.common.util.public_methods';
    import 'lodash.throttle';

    let commonTools = new CommonTools(), seedId = 0;

    // 自定义指标类型
    const CUSTOM_VALUE_TYPE = "com.hundsun.frcp.financial.CustomValueDefinition";

    export default {
        name: "aggConfigTemplate",
        data() {
            return {
                //树菜单初始数据
                setting: {
                    view: {
                        showLine: false,
                        addDiyDom: this.createTableTd,
                        selectedMulti: false,
                        showTitle: false
                    },
                    check: {
                        enable: true,
                        chkStyle: 'checkbox',
                        nocheckInherit: false,
                        radioType: 'all'
                    },
                    callback: {
                        onMouseDown: this.onZTreeNodeMouseDown,
                        onDblClick: this.onZTreeNodeDbClick,
                        beforeCheck: this.onZTreeBeforeCheck
                    },
                    data: {
                        keep: {
                            parent: true
                        }
                    }
                },
                zNodes: [
                    {
                        /*节点名称*/
                        name: "基础",
                        /*是否为父节点*/
                        isParent: true,
                        /*是否为分类节点*/
                        isCategory: true,
                        /*是否为根节点*/
                        isRoot: true,
                        /*是否显示checkbox*/
                        nocheck: true,
                        open: true,
                        /*子节点*/
                        children: []
                    },
                    {
                        name: "自定义",
                        isParent: true,
                        isCategory: true,
                        isRoot: true,
                        nocheck: true,
                        open: true,
                        children: []
                    }
                ],
                /*z-tree对象*/
                zTreeObj: null,
                /*被选中节点的ztree节点对象*/
                treeNodeSelected: null,
                /*新增分类名称*/
                newCategoryName: '',
                /*基础指标对象集合（cached）*/
                essentialValueConfigs: {},
                /*用户自定义直播啊对象集合（cached）*/
                customizedValueConfigs: {},
                /*新增指标表单*/
                valueDefForm: {
                    /*指标名称*/
                    name: '',
                    /*指标唯一标识*/
                    uniqueId: '',
                    /*基础指标*/
                    essentialValue: {
                        /*指标英文名称*/
                        name: '',
                        /*指标中文名称*/
                        describe: ''
                    },
                    /*字符串化的指标参数*/
                    showProperties: "",
                    /*指标参数*/
                    parameters: {}
                },
                updateValDefForm: {
                    /*指标名称*/
                    name: '',
                    /*指标唯一标识*/
                    uniqueId: '',
                    /*基础指标*/
                    essentialValue: {
                        /*指标英文名称*/
                        name: '',
                        /*指标中文名称*/
                        describe: ''
                    },
                    /*字符串化的指标参数*/
                    showProperties: "",
                    /*指标参数*/
                    parameters: {}
                },
                /*指标拥有的所有参数*/
                valueParams: [],
                /*删除提醒信息*/
                delAlert: '确认删除节点？',
                /*查询关键字*/
                keyword: '',
                /*已选择的指标*/
                valueSelected: [],
                /*主模态框id*/
                modalId: 'aggConfig_' + seedId,
                /*新增指标模态框id*/
                newValDefModalId: 'new_value_def_modal_' + seedId,
                /*修改指标模态框id*/
                modifyValDefModalId: 'modify_value_def_modal_' + seedId,
                /*新增分类模态框id*/
                newClzModalId: 'new_classification_modal_' + seedId,
                /*提示模态框id*/
                noticeModalId: 'notice_modal_' + seedId,
                newCategoryBtnId: 'newCategory_btn_' + seedId,
                newValueBtnId: 'newValue_btn_' + seedId,
                updateValueBtnId: 'update_btn_' + seedId,
                delBtnId: 'del_btn_' + seedId,
                ztreeId: 'ztree_instance_' + seedId,
                /*loading层显示控制*/
                loading: false
            }
        },
        props: {
            /*可选指标数量限制*/
            numLimit: {
                type: Number,
                required: false
            },
            /*可选指标类型（all: 所有指标，timeseries: 仅时序指标，non-timeseries：仅非时序指标）*/
            valueType: {
                type: String,
                required: false,
                default: 'all'
            }
        },
        created() {
            seedId++;
        },
        mounted() {
            $('#' + this.modalId).on('show.bs.modal', () => {
                this.init();
            });
        },
        computed: {
            /*返回一个用节流阀包装的检索指标函数*/
            searchValueWrappedWithThrottle: function () {
                const _self = this;
                return _.throttle(_self.searchValueByFuzzyKeyword, 350);
            },
            /*已选择指标的展示文本*/
            selectedValue: function () {
                return this.stringifySelectedValue(this.valueSelected);
            }
        },
        watch: {
            treeNodeSelected: {
                handler(treeNode) {
                    const newCategoryBtnId = '#' + this.newCategoryBtnId,
                        newValueBtnId = '#' + this.newValueBtnId,
                        updateValueBtnId = '#' + this.updateValueBtnId,
                        delBtnId = '#' + this.delBtnId;

                    if (treeNode) {
                        // 节点的根节点不是“自定义”节点
                        const rootNode = zTreeUtil.getRootNode(treeNode);
                        if (!rootNode || (rootNode.name != '自定义')) {
                            $(newCategoryBtnId).attr('disabled', true);
                            $(newValueBtnId).attr('disabled', true);
                            $(updateValueBtnId).attr('disabled', true);
                            $(delBtnId).attr('disabled', true);
                            return;
                        }

                        // 节点为“自定义”节点，且节点在数据库中存在
                        if (treeNode.isRoot && treeNode.name == '自定义' && treeNode.uniqueId) {
                            $(newCategoryBtnId).attr('disabled', false);
                            $(newValueBtnId).attr('disabled', false);
                            $(updateValueBtnId).attr('disabled', true);
                            $(delBtnId).attr('disabled', true);
                            return;
                        }

                        // 节点为“自定义”节点，但节点在数据库中不存在
                        if (treeNode.isRoot && treeNode.name == '自定义' && !treeNode.uniqueId) {
                            $(newCategoryBtnId).attr('disabled', true);
                            $(newValueBtnId).attr('disabled', true);
                            $(updateValueBtnId).attr('disabled', true);
                            $(delBtnId).attr('disabled', true);
                            $.showNotice('后台数据异常，无法进行操作', 'error');
                            return;
                        }

                        // 不为根节点，且是分类节点
                        if (!treeNode.isRoot && zTreeUtil.isCategoryNode(treeNode)) {
                            $(newCategoryBtnId).attr('disabled', false);
                            $(newValueBtnId).attr('disabled', false);
                            $(updateValueBtnId).attr('disabled', true);
                            $(delBtnId).attr('disabled', false);
                            return;
                        }

                        // 不为根节点，且是指标节点
                        if (!treeNode.isRoot && !zTreeUtil.isCategoryNode(treeNode)) {
                            $(newCategoryBtnId).attr('disabled', true);
                            $(newValueBtnId).attr('disabled', true);
                            $(updateValueBtnId).attr('disabled', false);
                            $(delBtnId).attr('disabled', false);
                            return;
                        }
                    } else {
                        $(newCategoryBtnId).attr('disabled', true);
                        $(newValueBtnId).attr('disabled', true);
                        $(updateValueBtnId).attr('disabled', true);
                        $(delBtnId).attr('disabled', true);
                    }
                }
            }
        },
        methods: {
            //初始化树节点
            treeTableInit() {
                const ztreeId = '#' + this.ztreeId;

                this.zTreeObj = $.fn.zTree.init($(ztreeId), this.setting, this.zNodes);
                //添加滚动条
                $('.treeTable .tableMain').niceScroll({
                    cursorcolor: "#c7c6c6",
                    cursoropacitymax: 1,
                    touchbehavior: false,
                    cursorwidth: "4px",
                    cursorborder: "0",
                    cursorborderradius: "4px",
                    smoothscroll: true,
                    railoffset: true,
                    railpadding: {top: 0, right: 0, left: 0, bottom: 4},
                }).resize();
            },
            //创建dom
            createTableTd(treeId, treeNode) {
                let tId = treeNode.tId;
                let liObj = $("#" + tId);
                let aObj = $("#" + tId + "_a");
                let switchObj = $("#" + tId + "_switch");
                let icoObj = $("#" + tId + "_ico");
                let spanObj = $("#" + tId + "_span");
                let checkObj = $('#' + tId + '_check');
                aObj.append('<div class="divTd swich fnt"></div>');
                let div = $(liObj).find('div').eq(0);
                //从默认的位置移除
                switchObj.remove();
                spanObj.remove();
                icoObj.remove();
                //在指定的div中添加
                if (checkObj.length > 0) {
                    checkObj.remove();
                    div.append(checkObj);
                }
                div.append(switchObj);
                div.append(spanObj);
                //隐藏了层次的span
                var spaceStr = "<span style='height:1px;display: inline-block;></span>";
                switchObj.before(spaceStr);
                //图标垂直居中
                switchObj.after(icoObj);
                var editStr = '';
                //宽度需要和表头保持一致
                editStr += '<div id="tree_node_td-' + tId + '-1" class="divTd basic_agg"></div>';
                editStr += '<div id="tree_node_td-' + tId + '-2" class="divTd agg_parame"></div>';
                aObj.append(editStr);
                // 异步渲染指标节点行内容
                if (treeNode.uniqueId && !zTreeUtil.isCategoryNode(treeNode)) {
                    setTimeout(() => {
                        this.renderTreeTableRow(treeNode);
                    }, 0);
                }
            },
            init() {
                this.loading = true;
                this.treeNodeSelected = null;
                this.keyword = '';
                // 根据numLimit确定checkbox还是radio
                let numLimit = this.numLimit;
                if (!numLimit || numLimit <= 0 || numLimit > 1) {
                    this.setting.check.chkStyle = 'checkbox';
                } else {
                    this.setting.check.chkStyle = 'radio';
                }
                // 初始化基础ztree树结构
                this.treeTableInit();
                // 请求所有指标对象
                this.loadValueConfigs(valueConfigs => {
                    // 请求并渲染分类树形结构
                    this.reqTreeData(og.api.rest.views.parame.customValDefConfiguration.essential.uniqueId, 0,
                        () => {
                            // 勾选已经选择的指标
                            this.checkValueSelected();
                        }, this.valueNodeFilter);
                    this.reqTreeData(og.api.rest.views.parame.customValDefConfiguration.customize.uniqueId, 1,
                        () => {
                            // 勾选已经选择的指标
                            this.checkValueSelected();
                            this.loading = false;
                        }, this.valueNodeFilter);
                });
            },
            /**
             * 确认选择的指标
             */
            confirmSelection() {
                let checkedValue = this.getCheckedValue();

                // 检查选中的指标数量是否超过限制（numLimit）
                if (!this.checkNumLimit(checkedValue)) {
                    $.showNotice("选择的指标不能超过" + checkedValue.length + "个", "warning");
                    return;
                }

                this.valueSelected = checkedValue;
                // 发送完成选择指标的事件
                this.$emit("updateSelection", Object.clone(checkedValue));

                this.closeModal('#' + this.modalId);
            },
            /**
             * 打开新增分类窗口
             */
            openNewCategoryModal() {
                if (zTreeUtil.isCategoryNode(this.treeNodeSelected)) {
                    this.newCategoryName = '';
                    $('#' + this.newClzModalId).modal('show');
                } else {
                    $.showNotice("请先选中一个分类节点", "warning");
                }
            },
            /**
             * 保存新增分类并关闭新增分类窗口
             */
            saveNewCategory() {
                let newCategoryName = this.newCategoryName;
                this.$validator.validate('newCategoryName', this.newCategoryName).then(result => {
                    if (result) {
                        this.addCategory(this.treeNodeSelected, {
                            name: newCategoryName,
                            isCategory: true,
                            isParent: true,
                            open: true,
                            nocheck: true,
                            children: []
                        });
                        this.saveClassificationsAsyn();
                        this.closeModal('#' + this.newClzModalId);
                    }
                });
            },
            /**
             * 删除选中的分类节点或者指标
             */
            deleteCategoryOrValue() {
                if (this.treeNodeSelected) {
                    let treeNode = this.treeNodeSelected, name = treeNode.name, isCategory = treeNode.isCategory;
                    if (isCategory) {
                        if (treeNode.isRoot) {
                            $.showNotice("根分类节点不能删除", "warning");
                            return;
                        }
                        this.removeCategory(treeNode, result => {
                            if (result) {
                                this.treeNodeSelected = null;
                                this.saveClassificationsAsyn()
                                    .then(() => {
                                        this.updateCheckedValue();
                                    });
                                $.showNotice("删除分类节点: " + name + " 成功");
                            } else {
                                $.showNotice("删除分类节点: " + name + " 失败", 'error');
                            }
                        });
                    } else {
                        // 删除指标
                        aggApi.delConfig(treeNode.uniqueId, result => {
                            if (result.error) {
                                $.showNotice("删除指标: " + name + " 失败", 'error');
                            } else {
                                // 从ztree中移除删除的指标节点
                                this.removeValueNode(treeNode, () => {
                                    this.treeNodeSelected = null;
                                    this.saveClassificationsAsyn()
                                        .then(() => {
                                            this.updateCheckedValue();
                                        });
                                });
                                $.showNotice("删除指标: " + name + " 成功");
                            }
                        });
                    }
                } else {
                    $.showNotice("请先选中一个需要删除的分类节点或指标", "warning");
                }
            },
            /**
             * 打开新增指标窗口
             */
            openNewValueDefModal() {
                if (zTreeUtil.isCategoryNode(this.treeNodeSelected)) {
                    this.valueDefForm = {
                        name: '',
                        uniqueId: '',
                        essentialValue: {
                            name: '',
                            describe: ''
                        },
                        showProperties: "",
                        parameters: {}
                    };
                    this.valueParams = [];
                    $('#' + this.newValDefModalId).modal('show');
                } else {
                    $.showNotice("请先选中一个分类节点", "warning");
                }
            },
            /**
             * 保存新增指标
             */
            saveNewValueDef() {
                const formData = this.valueDefForm;
                formData.showProperties = this.stringifyParameters(this.valueParams, formData.parameters);
                let config = this.buildValueDefinitionConfig(formData);

                this.$validator.validate('valueName', formData.name).then(result => {
                    if (result) {
                        this.$validator.validate('essentialValue', formData.essentialValue.describe).then(result => {
                            if (result) {
                                aggApi.addConfig(formData.name, config, CUSTOM_VALUE_TYPE, result => {
                                    if (result.error) {
                                        $.showNotice("新增指标失败", "error");
                                    } else {
                                        $.showNotice("新增指标成功");
                                        // 异步增加节点
                                        setTimeout(() => {
                                            let uniqueId = result.meta.id;
                                            // 在ztree上增加一个节点
                                            this.addValueDefNode(this.treeNodeSelected, {
                                                name: formData.name,
                                                uniqueId: uniqueId,
                                                isCategory: false
                                            });
                                            config.uniqueId = uniqueId;
                                            // 更新自定义指标对象集合
                                            this.$set(this.customizedValueConfigs, uniqueId, config);
                                            // 从后台更新自定义指标对象（主要是为了更新isTimeSeries属性）
                                            let nonVersionedUniqueId = this.getNonVersionedUniqueId(uniqueId);
                                            aggApi.searchCustomizedValueConfigById(nonVersionedUniqueId, result => {
                                                this.$set(this.customizedValueConfigs, nonVersionedUniqueId, result);
                                            });
                                            this.saveClassificationsAsyn();
                                        }, 0);
                                    }
                                    this.closeModal('#' + this.newValDefModalId);
                                });
                            }
                        });
                    }
                });
            },
            /**
             * 打开指标修改窗口
             */
            openUpdateValueDefModal() {
                let treeNode = this.treeNodeSelected;

                if (treeNode && !zTreeUtil.isCategoryNode(treeNode)) {
                    const valueConfig = this.customizedValueConfigs[treeNode.uniqueId];
                    if (valueConfig) {
                        // 构建指标表单数据
                        this.updateValDefForm = this.buildFormData(valueConfig);
                        // 抽取基础指标的参数
                        let essentialValueConfig = this.findValueConfig(this.essentialValueConfigs,
                            value => {
                                return valueConfig.baseShowName == value.showName;
                            });

                        // 基础指标存在，并且还未请求过指标参数
                        if (essentialValueConfig && !essentialValueConfig.valueDefaultParameterMap) {
                            try {
                                // 根据基础指标的名称去查询真实基础指标的对象，以获取指标参数相关信息
                                aggApi.searchValueRepoConfig(-1, essentialValueConfig.baseValueName, result => {
                                    if (result && result.length > 0) {
                                        essentialValueConfig.valueDefaultParameterMap = result[0].valueDefaultParameterMap;
                                        this.extractParameters(essentialValueConfig);
                                    }
                                });
                            } catch (e) {
                                $.showNotice('指标参数加载失败', 'error');
                            }
                        } else {
                            this.extractParameters(essentialValueConfig);
                        }

                        $('#' + this.modifyValDefModalId).modal('show');
                    } else {
                        $.showNotice("请求指标数据失败", "error");
                    }
                } else {
                    $.showNotice("请先选中一个指标", "warning");
                }
            },
            /**
             * 保存指标修改
             */
            saveUpdateValueDef() {
                const formData = this.updateValDefForm;
                formData.showProperties = this.stringifyParameters(this.valueParams, formData.parameters);
                let config = this.buildValueDefinitionConfig(formData);

                this.$validator.validate('newValueName', formData.name).then(result => {
                    if (result) {
                        this.$validator.validate('newEssentialValue', formData.essentialValue.describe).then(result => {
                            if (result) {
                                aggApi.updateConfig(formData.uniqueId, formData.name, config, CUSTOM_VALUE_TYPE, result => {
                                    if (result.error) {
                                        $.showNotice("修改指标失败", "error");
                                    } else {
                                        $.showNotice("修改指标成功");
                                        // 在ztree上更新节点
                                        let treeNode = this.treeNodeSelected, tId = treeNode.tId;
                                        treeNode.name = formData.name;
                                        this.zTreeObj.updateNode(treeNode);
                                        this.saveClassificationsAsyn()
                                            .then(() => {
                                                this.updateCheckedValue();
                                            });
                                        // 更新自定义指标对象集合中的内容
                                        this.$set(this.customizedValueConfigs, this.getNonVersionedUniqueId(formData.uniqueId), config);
                                        // 从后台更新自定义指标对象（主要是为了更新isTimeSeries属性）
                                        let nonVersionedUniqueId = this.getNonVersionedUniqueId(formData.uniqueId);
                                        aggApi.searchCustomizedValueConfigById(nonVersionedUniqueId, result => {
                                            this.$set(this.customizedValueConfigs, nonVersionedUniqueId, result);
                                        });
                                        // 重新渲染表格中的指标行
                                        this.setTreeNodeRow(treeNode.tId, {
                                            baseShowName: formData.essentialValue.describe,
                                            showProperties: formData.showProperties
                                        });
                                    }
                                    this.closeModal('#' + this.modifyValDefModalId);
                                });
                            }
                        });
                    }
                });
            },
            /**
             * 尝试删除节点，打开删除提示
             */
            tryDelete() {
                let treeNode = this.treeNodeSelected;
                if (treeNode) {
                    if (zTreeUtil.isCategoryNode(treeNode)) {
                        this.delAlert = "删除分类节点会导致级联删除该分类下所有落地的指标！"
                    } else {
                        this.delAlert = "确认删除指标：" + treeNode.name;
                    }
                    this.$nextTick(() => {
                        $('#' + this.noticeModalId).modal('show');
                    });
                } else {
                    $.showNotice("请先选中一个需要删除的分类节点或指标", "warning");
                }
            },
            /**
             * 确认删除节点并关闭删除提示
             */
            confirmDelete() {
                this.deleteCategoryOrValue();
                this.closeModal('#' + this.noticeModalId);
            },
            /**
             * 关闭模态窗
             *
             * @param selector jquery选择器
             */
            closeModal(selector) {
                $(selector).modal('hide');
            },
            /**
             * 选择基础指标
             *
             * @param type ['create', 'update'] 新增指标或更新指标
             */
            selectValue(type) {
                let formData;
                if (type == 'create') {
                    formData = this.valueDefForm;
                } else if (type == 'update') {
                    formData = this.updateValDefForm;
                } else {
                    console.warn('type=' + type + 'is invalid.');
                    return;
                }

                const extractAndBindParams = (valueConfig) => {
                    this.extractParameters(valueConfig);

                    // 先清除表单里的参数对象
                    let parameters = formData.parameters = {};
                    // 将指标表单的parameters属性绑定参数英文名称对应的属性，并赋予基础指标对应参数的值
                    Array.prototype.forEach.call(this.valueParams, param => {
                        parameters[param.name] = valueConfig.valueProperties.with[param.name] || param.defaultValue;
                    });
                }

                let valueConfig = this.findValueConfig(this.essentialValueConfigs,
                    value => {
                        return formData.essentialValue.describe == value.showName;
                    });

                // 基础指标存在，并且还未请求过指标参数
                if (valueConfig && !valueConfig.valueDefaultParameterMap) {
                    try {
                        // 根据基础指标的名称去查询真实基础指标的对象，以获取指标参数相关信息
                        aggApi.searchValueRepoConfig(-1, valueConfig.baseValueName, result => {
                            if (result && result.length > 0) {
                                valueConfig.valueDefaultParameterMap = result[0].valueDefaultParameterMap;
                                extractAndBindParams(valueConfig);
                            }
                        });
                    } catch (e) {
                        $.showNotice('基础指标参数请求失败', 'error');
                    }
                } else {
                    extractAndBindParams(valueConfig);
                }

            },
            /**
             * 保存自定义分类树结构
             *
             * @param silence 是否静默保存成功的消息，默认不静默
             * @param callback 保存操作结束后的回调函数
             */
            saveClassifications(silence = false, callback) {
                const parameter = og.api.rest.views.parame.customValDefConfiguration.customize,
                    type = parameter.type, uniqueId = parameter.uniqueId, categoryName = "自定义";
                let treeRootNode = this.zTreeObj.getNodes()[1], configData = {categoryName, uniqueId};
                this.buildClassificationConfig(treeRootNode, configData);

                aggApi.updateConfig(uniqueId, categoryName, configData, type, result => {
                    if (result.error) {
                        $.showNotice("保存自定义指标树失败", "error");
                    } else {
                        if (!silence) {
                            $.showNotice("保存自定义指标树成功");
                        }
                    }
                    if (callback && typeof callback == 'function') {
                        callback(!!!result.error);
                    }
                });
            },
            /**
             * 异步保存分类树结构
             *
             * @return {Promise}
             */
            saveClassificationsAsyn() {
                return new Promise((resolve, reject) => {
                    this.saveClassifications(true, result => {
                        if (result) {
                            resolve();
                        } else {
                            reject();
                        }
                    });
                });
            },
            /**
             * 比较指标isTimeSeries属性是否与配置的valueType属性匹配
             *
             * @param isTimeSeries(0: 非时序，1: 时序)
             * @return {Boolean}
             */
            matchValueType(isTimeSeries) {
                const valueType = this.valueType;
                if ((valueType == 'timeseries' && isTimeSeries == 0)
                    || (valueType == 'non-timeseries' && isTimeSeries == 1)) {
                    return false;
                } else {
                    return true;
                }
            },
            /**
             * 控制指标节点是否加入到节点树的过滤函数
             *
             * @param nodeData
             * @return {boolean}
             */
            valueNodeFilter(nodeData) {
                const valueConfigs = this.getAllValueConfigs(), valueConfig = valueConfigs[nodeData.uniqueId];
                if (valueConfig) {
                    /*isTimeSeries: 是否为时序指标（0：非时序，1：时序）*/
                    let isTimeSeries = valueConfig.isTimeSeries;
                    return this.matchValueType(isTimeSeries);
                }
                return false;
            },
            /**
             * 请求并渲染指标分类树
             *
             * @param uniqueId 指标分类树对应的视图uniqueId
             * @param index 分类树的位置（0-based）
             * @param callback 渲染完成后的回调函数
             * @param filter   过滤函数，控制指标节点是否加入到节点树
             */
            reqTreeData(uniqueId, index, callback, filter) {
                if (!this.zTreeObj) {
                    console.warn("zTreeObj must not be null.");
                    return;
                }

                aggApi.searchConfigsByUid(
                    uniqueId,
                    result => {
                        const zTreeObj = this.zTreeObj;
                        const resultObj = result[3];
                        const children = resultObj.customValueClassifications || {};

                        /**
                         * 判断当前分类节点下有没有可以显示的子节点
                         *
                         * @param node 分类节点simpledata
                         */
                        const hasChild = function (node) {
                            if (node.children) {
                                return Array.prototype.findIndex.call(node.children, child => !child.alwaysHidden) > -1;
                            }
                            return false;
                        }

                        /**
                         * 生成根节点的子节点数据对象
                         *
                         * @param nodeData 节点数据对象数组
                         * @param children 视图对象中的customValueClassifications属性值，not null
                         * @param filter   过滤函数，控制指标节点是否加入到节点树
                         */
                        const transToZNodes = function (nodeData, children, filter) {
                            let keys = Object.keys(children), length = keys.length;
                            let key, child;
                            for (let i = 0; i < length; i++) {
                                key = keys[i];
                                if (key.startsWith("customValueClassification")) {
                                    child = children[key];
                                    // 分类或指标名
                                    let childName = child.categoryName;

                                    // 通过是否包含uniqueId来区分是“分类”还是“指标”
                                    let isNode = !child.hasOwnProperty("uniqueId");
                                    if (isNode) {
                                        const children = [];
                                        nodeData.push({
                                            name: childName || "分类名称缺失",
                                            children: children,
                                            isParent: true,
                                            /*区分是否是分类*/
                                            isCategory: true,
                                            nocheck: true,
                                            open: false
                                        });
                                        transToZNodes(children, child.customValueClassifications || [], filter);
                                        // 如果分类节点下没有子节点，则将该分类节点设为打开状态
                                        if (!hasChild(nodeData[nodeData.length - 1])) {
                                            nodeData[nodeData.length - 1].open = true;
                                        }
                                    } else {
                                        let flag = true;
                                        if (filter && $.isFunction(filter)) {
                                            flag = filter(child);
                                        }
                                        let nodeSimpleData = {
                                            name: childName || "指标名称缺失",
                                            uniqueId: child.uniqueId,
                                            /*区分是否是分类*/
                                            isCategory: false
                                        };
                                        // 当指标与配置的valueType不匹配，则隐藏指标节点（采用隐藏而不是不挂载节点的原因是，保存分类树结构是依照ztree的节点树的）
                                        if (!flag) {
                                            // alwaysHidden属性代表该节点一直为hidden不应该显示出来
                                            nodeSimpleData.alwaysHidden = true;
                                            nodeSimpleData.isHidden = true;
                                        }
                                        nodeData.push(nodeSimpleData);
                                    }
                                }
                            }
                        }

                        let nodes = zTreeObj.getNodes(), treeNode;

                        if (nodes.length > index) {
                            treeNode = nodes[index];
                            treeNode.uniqueId = uniqueId;
                            // 根节点的子节点数据对象
                            const nodeData = [];
                            transToZNodes(nodeData, children, filter);
                            // 将子节点添加到根节点下面
                            zTreeObj.addNodes(treeNode, -1, nodeData);
                            if (callback && typeof callback == 'function') {
                                callback.call(this);
                            }
                        }
                    });
            },
            /**
             * Z-Tree节点点击事件回调函数
             *
             * @param event js标准Event对象
             * @param treeId treeId
             * @param treeNode Z-Tree treeNode
             */
            onZTreeNodeMouseDown(event, treeId, treeNode) {
                let target = event.target;
                // 屏蔽对节点收缩/展开按钮和checkbox的点击事件
                if (treeNode && !(target.tagName.toLowerCase() == "span"
                        && Array.prototype.findIndex.call(target.classList, className => className == "switch" || className == 'chk') > -1)) {
                    this.treeNodeSelected = treeNode;
                }
            },
            /**
             * Z-Tree节点双击事件回调函数
             *
             * @param event js标准Event对象
             * @param treeId treeId
             * @param treeNode Z-Tree treeNode
             */
            onZTreeNodeDbClick(event, treeId, treeNode) {
                let target = event.target;
                if (zTreeUtil.getRootNode(treeNode).name == '自定义'
                    && !zTreeUtil.isCategoryNode(treeNode)
                    && !(target.tagName.toLowerCase() == "span"
                        && Array.prototype.findIndex.call(target.classList, className => className == "switch" || className == 'chk') > -1)
                    && target.tagName.toLowerCase() != 'ul') {
                    this.openUpdateValueDefModal();
                }
            },
            /**
             * Z-Tree节点勾选前事件回调函数
             *
             * @param treeId
             * @param treeNode
             * @return {boolean} 根据返回值确定是否允许勾选或取消勾选；返回false将不会触发onCheck事件回调
             */
            onZTreeBeforeCheck(treeId, treeNode) {
                // 只关注勾选事件，取消勾选直接返回true
                if (this.zTreeObj.setting.check.chkStyle == "checkbox" && !treeNode.checked) {
                    const numLimit = this.numLimit, checkedNodes = this.zTreeObj.getCheckedNodes(true);

                    // 当已选中指标数等于限制数时，取消选中
                    if (numLimit != undefined && numLimit != null && checkedNodes.length >= numLimit) {
                        $.showNotice("选择的指标不能超过" + checkedNodes.length + "个", "warning");
                        return false;
                    }

                    let valueConfig = this.findValueConfig(this.getAllValueConfigs(), value => {
                        return this.getNonVersionedUniqueId(value.uniqueId) == treeNode.uniqueId;
                    });
                    if (this.matchValueType(valueConfig.isTimeSeries)) {
                        return true;
                    } else {
                        if (this.valueType == 'timeseries') {
                            $.showNotice("只能选择时序指标", "warning");
                        } else {
                            $.showNotice("只能选择非时序指标", "warning");
                        }
                        return false;
                    }
                }
                return true;
            },
            /**
             * Private:
             * 添加分类节点（添加到父节点的最后一个分类子节点之后）
             *
             * @param parentNode ztree内部的treeNode对象
             * @param newNode
             */
            addCategory(parentNode, newNode) {
                let ztreeObj = this.zTreeObj;

                if (parentNode) {
                    // 获取父节点的最后一个分类子节点的index
                    let lastCategoryNodeIndex = zTreeUtil.getLastCategoryNode(parentNode).index;
                    lastCategoryNodeIndex = lastCategoryNodeIndex != undefined ? lastCategoryNodeIndex : -1;
                    ztreeObj.addNodes(parentNode, lastCategoryNodeIndex + 1, newNode, true);
                }
            },
            /**
             * Private:
             * 移除分类节点
             *
             * @param targetNode
             * @callback 移除节点后的回调函数
             */
            removeCategory(targetNode, callback) {
                /**
                 * 删除节点下所有指标
                 *
                 * @param targetNode ztree内部的treeNode对象
                 * @return {boolean} 删除节点下所有指标成功返回true，否则返回false
                 */
                const deleteAllValueDef = (targetNode) => {
                    let children = targetNode.children, flag = true;

                    Array.prototype.forEach.call(children, childNode => {
                        // 分类节点
                        if (zTreeUtil.isCategoryNode(childNode)) {
                            let delFlag = deleteAllValueDef(childNode);
                            // 如果成功删除分类节点下所有指标，则移除该分类节点
                            if (delFlag) {
                                this.removeValueNode(childNode);
                            } else {
                                // 标记当前目标节点下有未成功删除的指标
                                flag = false;
                            }
                        } else {
                            aggApi.delConfig(childNode.uniqueId, result => {
                                // 删除指标成功，移除ztree中的节点
                                if (!result.error) {
                                    this.removeValueNode(childNode);
                                } else {
                                    flag = false;
                                }
                            });
                        }
                    });

                    return flag;
                }

                const ztreeObj = this.zTreeObj;

                if (targetNode && targetNode.isCategory) {
                    ztreeObj.hideNode(targetNode);

                    // 异步删除分类节点下所有指标
                    setTimeout(() => {
                        let result = deleteAllValueDef(targetNode);

                        // 删除分类下所有指标成功，再移除目标分类节点
                        if (result) {
                            ztreeObj.removeNode(targetNode, true);
                        } else {
                            ztreeObj.showNode(targetNode);
                            console.error("删除节点：" + targetNode.name + "失败");
                        }

                        if (callback && typeof callback == 'function') {
                            callback(result);
                        }
                    }, 0);
                }
            },
            /**
             * Private:
             * 移除指标节点
             *
             * @param targetNode
             * @callback 移除节点后的回调函数
             */
            removeValueNode(targetNode, callback) {
                if (targetNode && !targetNode.isCategory) {
                    this.zTreeObj.removeNode(targetNode, true);

                    if (callback && typeof callback == 'function') {
                        callback();
                    }
                }
            },
            /**
             * Private:
             * 新增指标（添加到父节点的最后一个指标子节点之后）
             *
             * @param parentNode ztree内部的treeNode对象
             * @param newNode
             */
            addValueDefNode(parentNode, newNode) {
                let ztreeObj = this.zTreeObj;

                if (parentNode) {
                    ztreeObj.addNodes(parentNode, -1, newNode, false);
                }
            },
            /**
             * Private:
             * 构建分类树数据对象（无返回值，直接修改configDataObj）
             *
             * @param treeNode ztree内部的treeNode对象
             * @param configDataObj 树结构视图数据对象(CustomValueClassification)
             */
            buildClassificationConfig(treeNode, configDataObj) {
                const children = treeNode.children, classificationPreix = "customValueClassification_",
                    classifications = {};
                let index = 0;

                if (children && children.length > 0) {
                    // 将classifications对象的引用赋值给configDataObj
                    configDataObj.customValueClassifications = classifications;

                    // 遍历treeNode的子节点
                    Array.prototype.forEach.call(children, (child, index) => {
                        // 分类节点
                        if (zTreeUtil.isCategoryNode(child)) {
                            let classificationsObj = {
                                categoryName: child.name
                            };
                            classifications[classificationPreix + index++] = classificationsObj;
                            this.buildClassificationConfig(child, classificationsObj);
                        } else {
                            // 指标
                            classifications[classificationPreix + index++] = {
                                categoryName: child.name,
                                uniqueId: child.uniqueId
                            };
                        }
                    });
                }
            },
            /**
             * Private:
             * 构建指标定义对象
             *
             * @param formData 指标表单数据对象
             * @return {object} 指标定义对象
             */
            buildValueDefinitionConfig(formData) {
                let valDefConfig = {
                    baseShowName: formData.essentialValue.describe,
                    baseValueName: formData.essentialValue.name,
                    showName: formData.name,
                    showProperties: formData.showProperties,
                    valueProperties: {
                        with: formData.parameters
                    }
                }

                // 新增指标无uniqueId
                if (!commonTools.isStringEmpty(formData.uniqueId)) {
                    valDefConfig.uniqueId = formData.uniqueId;
                }

                return valDefConfig;
            },
            /**
             * Private:
             * 从后台基础指标对象中抽取参数信息（参数名称、值域等）
             *
             * @param valueConfig
             */
            extractParameters(valueConfig) {
                const parameterMap = valueConfig.valueDefaultParameterMap, mapKeys = Object.keys(parameterMap);
                // 从对象中抽取参数的值域
                const extractParamRange = (paramRangeObj) => {
                    let range = [];
                    for (let key in paramRangeObj) {
                        range.push(paramRangeObj[key]);
                    }
                    return range;
                };
                let parameter, valueParamInfo, paramIndex = 0;
                // 清空指标参数
                this.valueParams = [];
                for (var i = 2; i < mapKeys.length; i += 2) {
                    // 参数对象
                    parameter = parameterMap[mapKeys[i]];

                    valueParamInfo = {
                        /*参数英文名称*/
                        name: parameter.parameterName,
                        /*参数中文名称*/
                        describe: parameter.parameterDescribe,
                        maxValue: parameter.maxValue,
                        minValue: parameter.minValue,
                        /*参数值域（Array）*/
                        paramRange: extractParamRange(parameter.parameterRange),
                        /*参数默认值（来源于基础指标的参数值）*/
                        defaultValue: parameterMap[mapKeys[i + 1]],
                        /*参数类型，1：数值，2：文本*/
                        type: parameter.parameterType
                    }

                    //TODO: 完善数值类型参数验证，目前只固定支持置信度和预测天数
                    // 数值类型的参数需要配置验证规则和验证失败的提示信息
                    if (valueParamInfo.type == "1") {
                        let rules = "";
                        rules += 'required|';
                        if (valueParamInfo.minValue != null) {
                            rules += ('|min_value:' + valueParamInfo.minValue);
                        }
                        if (valueParamInfo.maxValue != null) {
                            rules += ('|max_value:' + valueParamInfo.maxValue);
                        }
                        // 置信度
                        if (valueParamInfo.name == 'Percentile') {
                            rules += ('|decimal:2');
                            valueParamInfo.msg = '请输入一个0-1之间的两位小数';
                        } else if (valueParamInfo.name == 'Horizon') {
                            // 预测天数
                            rules += ('|decimal:0');
                            valueParamInfo.msg = '请输入一个1-730之间的正整数';
                        } else {
                            rules += ('|decimal:2');
                        }
                        valueParamInfo.rules = rules;
                    }

                    this.$set(this.valueParams, paramIndex++, valueParamInfo);
                }
            },
            /**
             * Private:
             * 指标参数字符串化
             *
             * @param valueParams 指标参数数组
             * @param parameters Array 指标参数表单对象
             * @return {string} eg: “计算开始日期=-P1Y，置信度=0.95”
             */
            stringifyParameters(valueParams, parameters) {
                let str = '', length = valueParams.length;

                Array.prototype.forEach.call(valueParams, (param, index) => {
                    str += (param.describe + "="
                        + (commonTools.isStringEmpty(parameters[param.name]) ? "" : parameters[param.name]));
                    if (index < length - 1) {
                        str += "，"
                    }
                });

                return str;
            },
            /**
             * Private:
             * 渲染指标节点行
             *
             * @param treeNode
             */
            renderTreeTableRow(treeNode, cachingSwitch) {
                const tId = treeNode.tId, uniqueId = treeNode.uniqueId;

                const valueConfigs = this.getAllValueConfigs();
                if (valueConfigs.hasOwnProperty(uniqueId)) {
                    this.setTreeNodeRow(tId, valueConfigs[uniqueId]);
                }
            },
            /**
             * 给指标行的td设置文本内容和title属性
             *
             * @param tId ztreeNode.tId
             * @param valueConfig 指标对象
             */
            setTreeNodeRow(tId, valueConfig) {
                let td1 = $('#tree_node_td-' + tId + '-1'), td2 = $('#tree_node_td-' + tId + '-2');

                td1.text(valueConfig.baseShowName);
                td1.attr('title', valueConfig.baseShowName);
                td2.text(valueConfig.showProperties);
                td2.attr('title', valueConfig.showProperties);
            },
            /**
             * Private:
             * 构建指标表单数据对象
             *
             * @param config 后台指标对象
             * @return {object} 表单数据对象
             */
            buildFormData(config) {
                return {
                    name: config.showName,
                    uniqueId: config.uniqueId,
                    essentialValue: {
                        name: config.baseValueName,
                        describe: config.baseShowName
                    },
                    showProperties: config.showProperties,
                    parameters: config.valueProperties.with || {}
                }
            },
            /**
             * Private:
             * 查找符合条件的第一个指标对象
             *
             * @param valueConfigs 指标对象集合
             * @param condition 查找条件函数
             * @return {*} 返回查找到符合条件的第一个指标对象，若没有则返回null
             */
            findValueConfig(valueConfigs, condition) {
                if (valueConfigs && condition && $.isFunction(condition)) {
                    for (let key in valueConfigs) {
                        const value = valueConfigs[key];
                        if (condition(value)) {
                            return value;
                        }
                    }
                }
                return null;
            },
            /**
             * 勾选所有已选择的指标
             */
            checkValueSelected() {
                const zTreeObj = this.zTreeObj;
                this.valueSelected.forEach(value => {
                    let nodeArr = zTreeObj.getNodesByParam("uniqueId", value.uniqueId);
                    if (nodeArr.length > 0) {
                        const treeNode = nodeArr[0];
                        zTreeObj.checkNode(treeNode, true, false, true);
                        // 展开勾选指标节点的父节点
                        zTreeObj.expandNode(treeNode.getParentNode(), true, false, true);
                    }
                });
            },
            /**
             * 获取勾选的指标
             *
             * @return {Array}
             */
            getCheckedValue() {
                let checkedNodes = this.zTreeObj.getNodesByParam("checked", true), checkedValue = [];

                Array.prototype.forEach.call(checkedNodes, node => {
                    let td1 = $('#tree_node_td-' + node.tId + '-1'), td2 = $('#tree_node_td-' + node.tId + '-2');

                    checkedValue.push({
                        name: node.name,
                        uniqueId: node.uniqueId,
                        baseName: td1.text() || '',
                        showProperties: td2.text()
                    });
                });

                return checkedValue;
            },
            /**
             * 更新已选中指标，发送'updateSelection'事件
             */
            updateCheckedValue() {
                let checkedValue = this.getCheckedValue();

                // 更新选中指标
                this.valueSelected = checkedValue;
                this.$emit('updateSelection', Object.clone(checkedValue));
            },
            /**
             * 模糊查询节点
             */
            searchValueByFuzzyKeyword() {
                let keyword = this.keyword;

                this.treeNodeSelected = null;
                if (!commonTools.isStringEmpty(keyword)) {
                    let nodes = this.zTreeObj.getNodesByParamFuzzy('name', keyword);
                    // 过滤掉所有非指标节点
                    nodes = nodes.filter(node => !zTreeUtil.isCategoryNode(node));

                    this.handleSearchResultNodes(nodes);
                } else {
                    this.showAllNodes();
                }
            },
            handleSearchResultNodes(resultNodes) {
                const ztreeObj = this.zTreeObj;
                const showNodes = (nodes) => {
                    const set = new Set();

                    const show = (node, set) => {
                        // 如果set中已经有当前节点了就不在往下处理
                        if (set.has(node)) {
                            return;
                        } else {
                            set.add(node);

                            // 展开节点
                            ztreeObj.expandNode(node, true);

                            const parentNode = node.getParentNode();
                            if (parentNode != null) {
                                show(parentNode, set);
                            }
                        }
                    }

                    Array.prototype.forEach.call(resultNodes, node => {
                        show(node, set);
                    });

                    ztreeObj.showNodes(Array.from(set).filter(node => !node.alwaysHidden));
                }
                this.hideAllNodes();
                showNodes(resultNodes);
            },
            /**
             * 隐藏所有节点（除根节点外）
             */
            hideAllNodes() {
                const ztreeObj = this.zTreeObj, nodes = ztreeObj.getNodes();
                let array = [];
                Array.prototype.forEach.call(nodes, node => {
                    array = array.concat(ztreeObj.getNodesByParam('isHidden', false, node));
                });
                ztreeObj.hideNodes(array);
            },
            /**
             * 显示所有节点
             */
            showAllNodes() {
                const ztreeObj = this.zTreeObj, nodes = ztreeObj.getNodes();
                let array = [];
                Array.prototype.forEach.call(nodes, node => {
                    array = array.concat(ztreeObj.getNodesByParam('isHidden', true, node));
                });
                ztreeObj.showNodes(array.filter(node => !node.alwaysHidden));
            },
            /**
             * 返回用于展示已选择指标的字符串
             *
             * @param checkedValue
             * @return {*}
             */
            stringifySelectedValue(checkedValue) {
                let length = checkedValue.length;
                return Array.prototype.reduce.call(checkedValue, (acc, value, index) => {
                    acc += value.name;
                    if (index != length - 1) {
                        acc += ', ';
                    }
                    return acc;
                }, "");
            },
            /**
             * 检查选中指标是否超过数量限制
             *
             * @param checkedValue {Array}
             * @return {boolean} 超过限制返回false，反之，返回true
             */
            checkNumLimit(checkedValue) {
                const numLimit = this.numLimit;
                if (numLimit != null && numLimit != undefined) {
                    if (checkedValue.length > this.numLimit) {
                        return false;
                    }
                }
                return true;
            },
            /**
             * 清除所有选择的指标
             */
            clearAllChecked() {
                this.valueSelected = [];
                this.$emit('updateSelection', []);
            },
            /**
             * 外部调用：取消选中的指标
             *
             * @param uniqueId 自定义指标的uniqueId
             * @return {Array} 返回被删除的指标对象数组
             */
            removeSelectedValue(uniqueId) {
                const valueSelected = this.valueSelected;
                if (valueSelected && valueSelected.length > 0) {
                    let index = valueSelected.findIndex(value => value.uniqueId == uniqueId);
                    return index > -1 ? valueSelected.splice(index, 1) : [];
                }
            },
            /**
             * 外部调用：设置选中的指标
             *
             * @param valueArr 选中指标对象数组
             */
            setSelectedValue(valueArr) {
                if (valueArr && $.isArray(valueArr)) {
                    let tmpArr = [];
                    Array.prototype.forEach.call(valueArr, value => {
                        const name = value.name, uniqueId = value.uniqueId;
                        if (!commonTools.isStringEmpty(name) && !commonTools.isStringEmpty(uniqueId)) {
                            tmpArr.push({
                                name: name,
                                uniqueId: uniqueId,
                                baseName: value.baseName || "",
                                showProperties: value.showProperties || ""
                            });
                        }
                    });
                    this.valueSelected = tmpArr;
                }
            },
            /**
             * 从后台加载所有自定义指标
             *
             * @param callback
             */
            loadValueConfigs(callback) {
                /**
                 * 判断指标是否为基础指标，uniqueId在500~700之间的是基础指标
                 *
                 * @param uniqueId
                 * @return {boolean}
                 */
                const isEssential = (uniqueId) => {
                    let splitStr = commonTools.isStringEmpty(uniqueId) ? [] : uniqueId.split('~');
                    if (splitStr.length < 2) {
                        return false;
                    } else {
                        return splitStr[1] >= 500 && splitStr[1] <= 700;
                    }
                }
                // 清空缓存
                this.essentialValueConfigs = {};
                this.customizedValueConfigs = {};

                aggApi.searchCustomizedValueConfigs(result => {
                    for (let uniqueId in result) {
                        if (isEssential(uniqueId)) {
                            this.essentialValueConfigs[uniqueId] = result[uniqueId];
                        } else {
                            this.customizedValueConfigs[uniqueId] = result[uniqueId];
                        }
                    }
                    if (callback && $.isFunction(callback)) {
                        callback(this.getAllValueConfigs());
                    }
                });
            },
            /**
             * 获得无版本信息的uniqueId
             *
             * @param uniqueId
             * @return {*}
             */
            getNonVersionedUniqueId(uniqueId) {
                if (!commonTools.isStringEmpty(uniqueId)) {
                    let splitStr = uniqueId.split('~');
                    if (splitStr.length >= 2) {
                        return splitStr[0] + '~' + splitStr[1];
                    }
                }
                return null;
            },
            /**
             * 获取所有自定义指标对象（包括基础和用户自定义的）
             *
             * @return {{}}
             */
            getAllValueConfigs() {
                return {...this.essentialValueConfigs, ...this.customizedValueConfigs};
            }
        }
    }
</script>

<style scoped>
    @import "../../../styles/default1/componentsCss/aggConfigTemplate.css";
</style>