<template src="../html/aggregationSelectDetail.html"></template>

<script>
    import aggregation
        from '../../scripts/biz/views/com.hundsun.pas.aggregation.js';
    export default {
        name: 'aggSelectDetail',
        props: ['ruleSpec', 'ruleSpecText'],
        data() {
            return {
                setting: {
                    check: {
                        enable: true,
                        nocheckInherit: false
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    }
                },
                zNodes: [],
                typeNames: [],
                values: [],
                valueCalc: '',
                valueCalcText: '',
                regexp: '',
                replacement: {},
                clearAllB: false,
                selectIndex: ''
            }
        },
        mounted() {
            this.selectTreeinit();
        },
        watch: {
            ruleSpecText: function () {
                this.clearAllBefore();

                $('.select_table').css("visibility","visible");
                //反向识别,这里没有让后台落地
                let stackStr = '';
                for (let i = 0; i < this.ruleSpecText.length; i++) {
                    stackStr += this.ruleSpecText[i];

                    if (this.ruleSpecText[i] === ')' && this.ruleSpecText[i - 1] === ']') {
                        stackStr = stackStr.substring(stackStr.indexOf('(') + 1);
                        let stackStr2 = '', value = {};
                        for (let j = 0, k = 0; j < stackStr.length - 1; j++) {
                            //TODO:暂时只考虑in情况
                            if (stackStr[j] === ']') {
                                stackStr2 = stackStr2.substring(0, stackStr2.length - 1);
                                let index = stackStr2.indexOf(" in "),
                                    name = stackStr2.substring(stackStr2.indexOf('[') + 1, index);
                                value[name] = stackStr2.substring(index + 5).split(',');
                                if (this.typeNames.indexOf(name) === -1) {
                                    this.typeNames[k++] = name;
                                }
                                stackStr2 = '';
                            }
                            stackStr2 += stackStr[j];
                        }
                        stackStr = '';
                        this.values.push(value);
                    }
                }
            }
        },
        computed: {
            valueCalcTextC: {
                get: function () {
                    if (this.clearAllB) {
                        this.clearAllB = false;
                        return this.valueCalcText;
                    }
                    return this.valueCalcText == ''? this.ruleSpecText: this.valueCalcText;
                }
            }
        },
        methods: {
            //实例化树节点
            selectTreeinit() {
                var $this = this;
                aggregation.searchConfigsByUid("DbCfg~200", function (result) {
                    var obj = JSON.parse(result[3]);
                    $this.replacement = obj.replaceStr;
                    obj = obj.valueCalcText;
                    var i = 0;
                    for (var item in obj) {
                        $this.zNodes[i] = {name: item, children: [], nocheck: true, open: true};
                        for (var j = 0; j < obj[item].length; j++) {
                            $this.zNodes[i].children[j] = {name: obj[item][j]};
                        }
                        i++;
                    }
                    $.fn.zTree.init($("#selectTree"), $this.setting, $this.zNodes);

                    //处理替换
                    var i = 0;
                    for (var index in $this.replacement) {
                        if (i > 0) {
                            $this.regexp += '|';
                        }
                        i++;
                        $this.regexp += index;
                    }
                });
            },
            addFilters() {
                $('.select_table').css("visibility","visible");

                var checkedNodes = $.fn.zTree.getZTreeObj("selectTree").getCheckedNodes(),
                    value = {};
                for (var i = 0, j = this.typeNames.length; i < checkedNodes.length; i++) {
                    var pName = checkedNodes[i].getParentNode().name;
                    if (this.typeNames.indexOf(pName) === -1) {
                        this.typeNames[j++] = pName;
                    }
                    if (!value.hasOwnProperty(pName)) {
                        value[pName] = [];
                    }
                    value[pName].push(checkedNodes[i].name);
                }
                if (checkedNodes.length > 0) {
                    this.values.push(value);
                    this.calcValue();

                    $.fn.zTree.getZTreeObj("selectTree").checkAllNodes(false);

//                    this.$nextTick(() => {
//                        $(".select_table tr").each(function () {
//                            var ellen = $(this).find("th").length;
//                            for (var item = 0; item < ellen; item++) {
//                                var thWidth = $(this).find("th").eq(item).width() + 2;
//                                $(".select_table tr:eq(1)").find("div").eq(item).css("width", thWidth);
//                            }
//                        });
//                    });
                }
            },
            sendMsg() {
                this.$emit('receiveMsg', {valueCalcText: this.valueCalcText, valueCalc: this.valueCalc});
            },
            clearAll() {
                this.clearAllBefore();
                this.clearAllB = true;
            },
            clearAllBefore() {
                //清除选择
                $.fn.zTree.getZTreeObj("selectTree").checkAllNodes(false);
                //清除表格、描述和数据
                this.typeNames = [];
                this.values = [];
                this.valueCalc = '';
                this.valueCalcText ='';
            },
            clear() {
                this.$delete(this.values, this.selectIndex);
                this.calcValue();
            },
            //添加描述
            calcValue() {
                var $this = this;
                this.valueCalcText = '';
                this.valueCalc = '';
                for (var j = 0; j < this.values.length; j++) {
                    var value = this.values[j];
                    if (this.valueCalcText !== '') {
                        this.valueCalcText += ' or ';
                    }
                    this.valueCalcText += '(';
                    var i = 0;
                    for (var index in value) {
                        if (i > 0) {
                            this.valueCalcText += ' and ';
                        }
                        i++;
                        this.valueCalcText += '[' + index + ' in (' +
                            value[index].toString() + ')]';
                    }
                    this.valueCalcText += ')';
                    this.valueCalc = this.valueCalcText.replace(new RegExp(this.regexp, 'g'),
                        function ($0) {
                            return $this.replacement[$0];
                        });
                }
            }
        }
    }
</script>

<style scoped="scoped">
    @import "../../styles/default1/TabClass/selectDetail.css";
</style>