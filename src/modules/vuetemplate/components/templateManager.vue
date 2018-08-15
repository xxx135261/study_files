<template src="../../html/templateManager.html"></template>

<script>
    import CommonTools from './../../../scripts/core/util/com.hundsun.pas.common.util.public_methods'
    import {mapState} from 'vuex';
    import {SET_MP_LIST, SET_MP_COLINFO} from './../../../vuex/mutation-types';

    const commonTools = new CommonTools();
    const mpApi = com.hundsun.pas.vprt.impmp;

    export default {
        name: 'templateManager',
        data() {
            return {
                /*数据来源类型*/
                mpTypeList: [
                    {
                        id: '1',
                        name: '恒生PB'
                    },
                    {
                        id: '2',
                        name: '金证PB'
                    },
                    {
                        id: '3',
                        name: '讯投证券PB'
                    },
                    {
                        id: '4',
                        name: '讯投期货PB'
                    }
                ],
                fileTypeList: [
                    {
                        id: "1",
                        name: "xls"
                    },
                    {
                        id: "2",
                        name: "csv"
                    }
                ],
                /*新建/修改模板表单*/
                mpForm: {
                    mpName: '',
                    mpType: ''
                },
                /*被选中的模板*/
                mpSelected: {},
                /*文件列信息*/
                fileCols: [],
                /*模板文件对应列表单*/
                mpColInfoForm: [],
                /*新增模板表单是否填写完整（true: 完整, false: 不完整）*/
                addFormCheckFlag: true,
                /*修改模板表单是否填写完整（true: 完整, false: 不完整）*/
                modifyFormCheckFlag: true,
                /*上传参考文件表单是否填写完整（true: 完整, false: 不完整）*/
                fileUploadFormCheckFlag: true,
                /*模板文件列完整性验证错误信息*/
                valErrorMsg: '文件列填写不完整'
            }
        },
        props: {
            /*当前被选中组合*/
            portfolio: Object
        },
        mounted() {
            this.bindListenerOnModal();
        },
        computed: mapState({
            mpList: state => state.portfolioAnalysis.mpList,
            mpColInfo: state => state.portfolioAnalysis.mpColInfo,
            userInfo: state => state.userInfo
        }),
        watch: {
            mpColInfo: {
                handler() {
                    let _self = this;
                    this.fileCols = [];
                    this.mpColInfoForm = [];
                    this.mpColInfo.forEach(colInfo => {
                        // 从当前对应列信息中获取文件对应列信息（文件列位置、列名）
                        if (colInfo.port_colname || colInfo.port_colplace) {
                            _self.fileCols.push({
                                colPlace: colInfo.port_colplace,
                                colName: colInfo.port_colname
                            });
                        }
                        // 初始化表单
                        _self.mpColInfoForm.push({
                            mp_id: colInfo.mp_id,
                            col_name: colInfo.mp_col_name,
                            col_order: colInfo.col_order,
                            port_colname: colInfo.port_colname,
                            port_colplace: colInfo.port_colplace,
                            modifier: colInfo.modifier
                        });
                    });
                }
            }
        },
        methods: {
            /*新增模板确认*/
            confirmCreateMp() {
                let _self = this, formData = this.mpForm;

                if (formData && !commonTools.isStringEmpty(formData.mpName) && !commonTools.isStringEmpty(formData.mpType)) {
                    // 提交新增模板表单
                    mpApi.add({
                        port_id: this.portfolio.id,
                        mp_name: formData.mpName,
                        mp_type: formData.mpType,
                        file_type: "1",
                        sheet_name: "1",
                        modifier: this.userInfo.loginName
                    })
                        .then(result => {
                            let msgNo = result.msg_no;
                            if (msgNo === 0) {
                                $.showNotice("新增模板成功");
                                _self.loadMpList();
                            } else if (msgNo === 1) {
                                $.showNotice("新增模板失败", "error");
                            }
                        })
                        .catch(err => {
                            $.showNotice("新增模板失败", "error");
                        });
                    this.closeAddModal();
                } else {
                    this.addFormCheckFlag = false;
                }
            },
            /*修改模板确认*/
            confirmUpdateMp() {
                let _self = this, formData = this.mpForm;

                if (formData && !commonTools.isStringEmpty(formData.mpName) && !commonTools.isStringEmpty(formData.mpType)) {
                    // 提交新增模板表单
                    mpApi.update(this.mpSelected.mp_id, formData.mpName, "1", this.userInfo.loginName)
                        .then(result => {
                            let msgNo = result.msg_no;
                            if (msgNo === 0) {
                                $.showNotice("修改模板成功");
                                _self.loadMpList();
                            } else if (msgNo === 1) {
                                $.showNotice("修改模板失败", "error");
                            }
                        })
                        .catch(err => {
                            $.showNotice("修改模板失败", "error");
                        });
                    // 更新选中模板的数据
                    this.mpSelected = this.mpList.find(mp => mp.mp_id == this.mpSelected.mp_id) || {};
                    this.closeModifyModal();
                } else {
                    this.modifyFormCheckFlag = false;
                }
            },
            /*删除模板确认*/
            confirmDelMp() {
                let _self = this;
                mpApi.delete(this.mpSelected.mp_id, this.userInfo.loginName)
                    .then(result => {
                        let msgNo = result.msg_no;
                        if (msgNo === 0) {
                            $.showNotice("删除模板成功");
                            _self.mpColInfoForm = [];
                            _self.loadMpList();
                        } else if (msgNo === 1) {
                            $.showNotice("删除模板失败", "error");
                        }
                    })
                    .catch(err => {
                        $.showNotice("删除模板失败", "error");
                    });
                this.clearSelected();
                $('#templateManager .delete').modal('hide');
            },
            /*保存模板文件列对应确认*/
            confirmSavaMpColInfo() {
                if (!this.mpSelected || !this.mpSelected.mp_id) {
                    // 若未选中模板，打开未选中提示信息
                    $('#templateManager .selected').modal('show');
                    return;
                }

                let userInfo = this.userInfo;
                // 根据文件对应列位置，补充文件对应列名以及补充修改人属性
                Array.prototype.forEach.call(this.mpColInfoForm, (value, index) => {
                    let colPlace = value.port_colplace;
                    let fileCol = this.fileCols.find(fileCol => fileCol.colPlace === colPlace);
                    if (fileCol) {
                        value.port_colname = fileCol.colName;
                        value.modifier = userInfo.loginName;
                    }
                });

                // 判断对应文件列是否填写完整以及是否有重复
                let validateResult = this.validateMpColsForm();
                if (validateResult.msgNo === 1) {
                    // 设置提示信息内容
                    this.valErrorMsg = validateResult.msgInfo;
                    $('#templateManager .validate_form').modal('show');
                    return;
                }

                mpApi.updateImpMpCol(this.mpColInfoForm)
                    .then(data => {
                        let msgNo = data.msg_no;
                        if (msgNo === 0) {
                            $.showNotice("更新模板对应文件列名成功");
                        } else if (msgNo === 1) {
                            $.showNotice("更新模板对应文件列名失败", "error");
                        }
                    })
                    .catch(err => {
                        $.showNotice("更新模板对应文件列名失败", "error");
                    });
            },
            /*上传参考文件确认*/
            confirmUploadFile() {
                var formData = new FormData(), files = document.getElementById("loadMpColFile").files;
                if (!files || files.length === 0) {
                    this.fileUploadFormCheckFlag = false;
                }
                formData.append("file", files[0]);
                let _self = this;
                let fileName = files[0].name;
                let splitStr = fileName.split('.'), strLen = splitStr.length;
                if (strLen > 1) {
                    let postfix = splitStr[strLen - 1];
                    if (postfix === "xls" || postfix === "xlsx") {
                        formData.append("file_type", "1");
                    } else if (postfix === "csv") {
                        formData.append("file_type", "2");
                    } else {
                        // 文件类型不支持
                        $('.type_error').modal('show');
                        return;
                    }
                }
                mpApi.getFileCols(formData)
                    .then(data => {
                        let msgNo = data.msg_no;
                        if (msgNo !== 1) {
                            _self.fileCols = [];
                            for (let key in data) {
                                _self.fileCols.push({
                                    colPlace: key,
                                    colName: data[key]
                                });
                            }
                            // 自动匹配文件列和需求列
                            _self.autoMatchCol();
                            $.showNotice("获取文件列成功");
                        } else {
                            $.showNotice("获取文件列失败", "error");
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取文件列失败", "error");
                    });
                this.closeFileUploadModal();
            },
            /*重置新建模板表单*/
            resetMpForm() {
                this.mpForm = {
                    mpName: '',
                    mpType: ''
                };
            },
            /*加载模板列表*/
            loadMpList() {
                this.$store.dispatch("portfolioAnalysis/loadMpList", this.portfolio.id);
            },
            /*处理模板管理模态框打开事件*/
            handleModalOpened() {
                // 加载模板列表
                this.loadMpList();
            },
            /*处理模板管理模态框关闭事件*/
            handleModalClosed() {
                // 清除所有模板行选中状态
                $("#mp_list_table tr.mp_row").removeClass('current_row');
                this.resetMpForm();
                this.mpSelected = {};
                this.mpColInfoForm = [];
                this.$store.commit({
                    type: "portfolioAnalysis/" + SET_MP_COLINFO,
                    newVal: []
                });

                // 关闭模板管理模态框
                $('#templateManager').modal('hide');
            },
            /*处理修改模态框打开事件*/
            handleModifyModalOpened() {
                if (this.mpSelected && this.mpSelected.mp_id) {
                    this.mpForm = {
                        mpName: this.mpSelected.mp_name,
                        mpType: this.mpSelected.mp_type
                    }
                    // 打开修改框
                    $('#templateManager .modified').modal('show');
                } else {
                    // 若未选中模板，打开未选中提示信息
                    $('#templateManager .selected').modal('show');
                }
            },
            /*关闭修改模态框*/
            closeModifyModal() {
                $('#templateManager .modified').modal('hide');
                this.modifyFormCheckFlag = true;
            },
            /*关闭提示消息框*/
            closeNoticeModal() {
                $('#templateManager .selected').modal('hide');
            },
            /*关闭验证错误提示框*/
            closeValFormModal() {
                $('#templateManager .validate_form').modal('hide');
            },
            /*打开上传参考文件框*/
            handleFileUploadModalOpened() {
                if (this.mpSelected && this.mpSelected.mp_id) {
                    // 打开上传文件框
                    $('#templateManager .reference').modal('show');
                } else {
                    // 打开未选中提示信息
                    $('#templateManager .selected').modal('show');
                }
            },
            /*关闭上传参考文件框*/
            closeFileUploadModal() {
                $('#templateManager .reference').modal('hide');
                this.fileUploadFormCheckFlag = true;
            },
            /*处理删除模态框打开事件*/
            handleDeleteModalOpened() {
                if (this.mpSelected && this.mpSelected.mp_id) {
                    // 打开删除框
                    $('#templateManager .delete').modal('show');
                } else {
                    // 打开未选中提示信息
                    $('#templateManager .selected').modal('show');
                }
            },
            /*关闭删除模态框*/
            closeDeleteModal() {
                $('#templateManager .delete').modal('hide');
            },
            /*关闭新增模态框*/
            closeAddModal() {
                $('#templateManager .new_add').modal('hide');
                this.addFormCheckFlag = true;
            },
            /*处理模板行点击事件*/
            handleMpRowClick(event, mp) {
            	//按钮点击添加高亮状态
            	$('.body_header .btn_operate li button').addClass('highlight');
                // 清除所有模板行选中状态
                $("#mp_list_table tr.mp_row").removeClass('current_row');

                let el = event.currentTarget;
                $(el).addClass('current_row');
                this.mpSelected = mp;
                this.$store.dispatch("portfolioAnalysis/loadMpColInfo", mp.mp_id);
            },
            /*清除选中的模板*/
            clearSelected() {
                this.mpSelected = {};
                // 清除所有模板行选中状态
                $("#mp_list_table tr.mp_row").removeClass('current_row');
            },
            /*监听模态框事件*/
            bindListenerOnModal() {
                $('#templateManager').on('shown.bs.modal', this.handleModalOpened);
                $('#templateManager .new_add').on('shown.bs.modal', this.resetMpForm);
                $('#templateManager .modified').on('hide.bs.modal', this.resetMpForm);
            },
            /**
             * 验证文件列是否填写完整以及无重复
             *
             * @return {ValidateMsg}
             */
            validateMpColsForm() {
                /**
                 * 验证结果
                 *
                 * @param msgNo 0: 成功, 1: 失败
                 * @param msgInfo 消息内容
                 * @constructor
                 */
                const ValidateMsg = function (msgNo, msgInfo) {
                    this.msgNo = msgNo;
                    this.msgInfo = msgInfo;
                }

                let form = this.mpColInfoForm;
                if ($.isArray(form)) {
                    if (form.length === 0) {
                        return new ValidateMsg(1, "第1行列名为空");
                    }
                    for (let i = 0; i < form.length; i++) {
                        let colPlace = form[i].port_colplace;
                        if (colPlace === undefined || colPlace === null || colPlace === '') {
                            return new ValidateMsg(1, "第" + (i + 1) + "行列名为空");
                        }
                        let index = form.findIndex(col => col.port_colplace === colPlace);
                        if (index !== -1 && index !== i) {
                            return new ValidateMsg(1, "第" + (index + 1) + "行与第" + (i + 1) + "行列名重复");
                        }
                    }
                    return new ValidateMsg(0);
                }
                return new ValidateMsg(1, "请重新选中模板后填写文件列");
            },
            /*自动匹配文件列和需求列*/
            autoMatchCol() {
                let form = this.mpColInfoForm, fileCols = this.fileCols;

                if ($.isArray(form) && form.length !== 0 && fileCols.length !== 0) {
                    for (let i = 0; i < form.length; i++) {
                        // 需求列名
                        let specColName = form[i].col_name;
                        // 查找是否有可以匹配的列
                        let fileCol = fileCols.find(col => col.colName === specColName);
                        if (fileCol) {
                            form[i].port_colname = fileCol.colName;
                            form[i].port_colplace = fileCol.colPlace;
                        }
                    }
                }
            }
        }
    }
</script>

<style scoped="scoped">
    @import "../../../styles/default1/componentsCss/templateManager.css";
</style>