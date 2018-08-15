<template src="../html/portfolioAnalysis.html"></template>
<script>
    import "./../../scripts/core/util/com.hundsun.pas.common.util.validate.js";
    import { mapState } from "vuex";
    import templateManager from "./components/templateManager.vue";
    import { SET_MP_LIST } from "./../../vuex/mutation-types";
    import laydate from "./../../scripts/base/layDate/laydate.js";
    import "./../../scripts/base/layDate/theme/default/laydate.css";

    // 当前模块对应的状态管理模块路径名
    const moduleName = "portfolioAnalysis";

    var numberUtils = $.numberUtils();
    var user_name, posiname, comnum, comindex, combintext;
    var _self;

    const vprtApiSet = com.hundsun.pas.vprt;
    const portApi = vprtApiSet.portfolios, feeRateApi = vprtApiSet.feerate, fileApi = vprtApiSet.file,
          allocationApi = vprtApiSet.allocation, positionApi = vprtApiSet.position, tradeApi = vprtApiSet.trade;

    export default {
        name: "portfolioAnalysis",
        components: {
            templateManager
        },
        data() {
            return {
                //初始持仓检索数据
                positionlist: [],
                //组合交易检索数据
                tradelist: [],
                //组合名称检索数据
                portlist: [],
                // 组合状态
                portStatus: {
                    "1": "启用",
                    "2": "停用"
                },
                //选中组合相关信息
                comInfo: {
                    id: "",
                    portflag: "",
                    date: "",
                    name: "",
                    posid: "",
                    dateno: "",
                    datei: ""
                },
                //创建组合基准指数下拉框
                namesel: [{
                    value: "1",
                    name: "沪深300"
                }, {
                    value: "2",
                    name: "上证指数"
                }, {
                    value: "3",
                    name: "创业板指"
                }],
                newcomall: false,
                //是否全选
                combinall: false,
                //创建组合初始持仓表格下拉框
                comSigns: [{
                    value: "1",
                    name: "多头"
                }, {
                    value: "2",
                    name: "空头"
                }],
                //初始持仓表格新增行空数据
                entryinfoAdd: {
                    id: "0",
                    stock_name: "",
                    stock_code: "",
                    market: "",
                    sign: "",
                    quantity: "",
                    all: false
                },
                //组合交易表格下拉框
                comsignInfo: [{
                    value: "1",
                    name: "买入"
                }, {
                    value: "2",
                    name: "卖出"
                }],
                //组合资金表格下拉框
                allodirInfo: [{
                    value: "0",
                    name: "流入"
                }, {
                    value: "1",
                    name: "流出"
                }],
                // 创建组合初始持仓表格数据
                entryInfo: [],
                //交易市场转换
                market: [{
                    id: "0",
                    code: "XSHG",
                    shortcode: "SH",
                    exchange: "上海证券交易所",
                    name: "上交所"
                }, {
                    id: "1",
                    code: "XSHE",
                    shortcode: "SZ",
                    exchange: "深圳证券交易所",
                    name: "深交所"
                }, {
                    id: "2",
                    code: "CCFX",
                    shortcode: "ZJ",
                    exchange: "中国金融期货交易所",
                    name: "中金所"
                }, {
                    id: "3",
                    code: "XDCE",
                    shortcode: "DL",
                    exchange: "大连商品交易所",
                    name: "大商所"
                }, {
                    id: "4",
                    code: "XSGE",
                    shortcode: "SQ",
                    exchange: "上海期货交易所",
                    name: "上期所"
                }, {
                    id: "5",
                    code: "XZCE",
                    shortcode: "ZZ",
                    exchange: "郑州商品交易所",
                    name: "郑商所"
                }, {
                    id: "6",
                    code: "NEEQ",
                    shortcode: "GZ",
                    exchange: "全国中小企业股份转让系统",
                    name: "全国股转系统"
                }],
                // 排序字段
                fieldOrderBy: {
                    "combin_name": "vc_name",
                    "combin_date": "l_begin_date",
                    "combin_money": "en_begin_amount",
                    "combin_share": "en_begin_unitnav",
                    "combin_checks": "c_check_flag",
                    "combin_checkt": "d_check_date",
                    "combin_succ": "c_flag",
                    "combin_time": "d_modi_date"
                },
                //新增
                allocationInfoAdd: {
                    id: "0",
                    date: "",
                    direction: "",
                    cost: "",
                    all: false
                },
                //组合资金全选
                comcostall: false,
                //新增
                //组合交易表格新增行空数据
                tradeInfoAdd: {
                    id: "0",
                    date: "",
                    stock_code: "",
                    stock_name: "",
                    sec_kind: "",
                    market: "",
                    sign: "",
                    price: "",
                    quantity: "",
                    money: "",
                    cost: "",
                    all: false
                },
                comtradeall: false,
                estabTime: "",
                /*被选中的模板*/
                mpSelected: null,
                /*进度条进度值，单例*/
                progressVal: 0
            };
        },
        computed: {
            ...mapState(moduleName, {
                basicInfo: state => state.basicInfo,
                tradeInfo: state => state.tradeInfo,
                tradedateInfo: state => state.tradedateInfo,
                transactionInfo: state => state.transactionInfo,
                allocationInfo: state => state.allocationInfo,
                costdateInfo: state => state.costdateInfo,
                mpList: state => state.mpList
            }),
            // 组合表格全选
            portAllChecked: {
                get: function() {
                    return this.basicInfo.length == this.basicInfo.filter(item => item.all).length;
                },
                set: function(newVal) {
                    this.basicInfo.forEach(item => {
                        item.all = newVal;
                    });
                }
            },
            // 组合交易表格全选
            tradeAllChecked: {
                get: function() {
                    let tradeInfo = this.tradeInfo, length = tradeInfo.length;
                    return length == tradeInfo.filter(item => item.all).length && length != 0;
                },
                set: function(newVal) {
                    this.tradeInfo.forEach(item => {
                        item.all = newVal;
                    });
                }
            },
            // 组合资金表格全选
            allocationAllChecked: {
                get: function() {
                    let allocationInfo = this.allocationInfo, length = allocationInfo.length;
                    return length == allocationInfo.filter(item => item.all).length && length != 0;
                },
                set: function(newVal) {
                    this.allocationInfo.forEach(item => {
                        item.all = newVal;
                    });
                }
            },
            // 初始持仓表格全选
            beginHoldAllChecked: {
                get: function() {
                    let entryInfo = this.entryInfo, length = entryInfo.length;
                    return length == entryInfo.filter(item => item.all).length && length != 0;
                },
                set: function(newVal) {
                    this.entryInfo.forEach(item => {
                        item.all = newVal;
                    });
                }
            }
        },
        watch: {
            // 观察表格数据的变化，控制表格按钮是否可用
            basicInfo: {
                immediate: true,
                deep: true,
                handler(newVal) {
                    this.controlBtnDisabled(newVal);
                }
            },
            tradeInfo: {
                immediate: true,
                deep: true,
                handler(newVal) {
                    // 第一个被勾选的记录的index
                    let checkedIndex = newVal.findIndex(trade => trade.all);
                    if (checkedIndex > -1) {
                        $(".comtradelbtn").attr("disabled", false);
                    } else {
                        $(".comtradelbtn").attr("disabled", true);
                    }
                }
            },
            allocationInfo: {
                immediate: true,
                deep: true,
                handler(newVal) {
                    // 第一个被勾选的记录的index
                    let checkedIndex = newVal.findIndex(alloc => alloc.all);
                    if (checkedIndex > -1) {
                        $(".comcostdelbtn").attr("disabled", false);
                    } else {
                        $(".comcostdelbtn").attr("disabled", true);
                    }
                }
            },
            entryInfo: {
                immediate: true,
                deep: true,
                handler(newVal) {
                    // 第一个被勾选的记录的index
                    let checkedIndex = newVal.findIndex(hold => hold.all);
                    if (checkedIndex > -1) {
                        $(".newcomdelbtn").attr("disabled", false);
                    } else {
                        $(".newcomdelbtn").attr("disabled", true);
                    }
                }
            }
        },
        mounted() {
            _self = this;
            $(window).on("resize", function() {
                _self.fixTable();
            });
            // 监听组合交易、组合资金、交易费率模态框隐藏事件
            $(".com_trade_w, .com_cost_w, .transaction").on("hidden.bs.modal", function() {
                // 关闭模态框时刷新被选中组合的核算状态
                for (let i = 0; i < _self.basicInfo.length; i++) {
                    if (_self.basicInfo[i].all) {
                        _self.getPortfolioById(_self.basicInfo[i].port_id, function() {
                            _self.basicInfo[i].check_flag = this.CHECK_FLAG;
                        });
                    }
                }
            });
            this.loadData();
            // 分别创建日期控件
            this.createDatePicker("#estab_date");
            this.createDatePicker("#adjust-date", { done: this.tradedateBlur });
            this.createDatePicker("#com_cost_date", { done: this.costdateBlur });
        },
        methods: {
            loadData() {
                this.basicInfoFun();
            },
            //获取当前日期
            //默认新建组合、新建交易日期为当天
            getDate() {
                var dates = new Date();
                var year = dates.getFullYear(),
                    month = dates.getMonth() + 1,
                    date = dates.getDate();
                date = date >= 10 ? date : "0" + date;
                month = month >= 10 ? month : "0" + month;
                this.estabTime = year + "" + month + "" + date;
                return this.estabTime;
            },
            // 将形如“500,000.00”的数字文本转换为正确的浮点数
            parseFloatEx(str) {
                return parseFloat(str.replace(/,/g, ""));
            },
            //控制初始资金、单位净值、托管费率、管理费率输入框只能输入数字
            inpFloat(ele, precision) {
                var val = ele.val();
                var reg = new RegExp("^[0-9]*\\.?\\d{0,"
                + (precision != null || precision != undefined ? precision : 2)
                + '}$');
                if (val.length > 0) {
                    if (!reg.test(val)) {
                        ele.val(val.slice(0, -1));
                    } else {
                        val = ele.val();
                    }
                } else {
                    ele.val("");
                }
            },
            inpBlur(ele, precision) {
                var inp = ele.val();
                precision = (precision != null || precision != undefined ? precision : 2);
                if ((Number(inp)) === 0) {
                    ele.val(new Number(1).toFixed(precision));
                } else {
                    ele.val((parseFloat(inp) || "1").toFixed(precision));
                }
            },
            shaFloat(ele) {
                var val = ele.val();
                var reg = /^[0-9]*\.?\d{0,4}$/;
                if (val.length > 0) {
                    if (!reg.test(val)) {
                        ele.val(val.slice(0, -1));
                    } else {
                        val = ele.val();
                    }
                } else {
                    ele.val("");
                }
            },
            shaBlur(ele) {
                var inp = ele.val();
                if ((Number(inp)) === 0) {
                    ele.val("1.0000");
                } else {
                    ele.val((parseFloat(inp) || "1").toFixed(4));
                }
            },
            //初始资金输入部分
            capitalTest() {
                this.inpFloat($(".initial_capital"));
            },
            //初始资金输入框失去焦点部分
            capitalBlur() {
                this.inpBlur($(".initial_capital"));
                if ($.trim($(".initial_capital").val()) != "" && $.trim($(".com_name").val()) != "" && $.trim($(".initial_share").val()) != "" && $.trim($(".com_management").val()) != "" && $.trim($(".com_custody").val()) != "" && $.trim($(".initial_date").val()) != "") {
                    if ($(".requireinp").attr("data-is") == "on") {
                        $(".requireinp").attr("data-is", "off");
                        $(".requireinp").hide();
                    }
                }
            },
            //单位净值输入部分
            shareTest() {
                this.shaFloat($(".initial_share"));
            },
            //单位净值输入框失去焦点部分
            shareBlur() {
                this.shaBlur($(".initial_share"));
                if ($.trim($(".initial_capital").val()) != "" && $.trim($(".com_name").val()) != "" && $.trim($(".initial_share").val()) != "" && $.trim($(".com_management").val()) != "" && $.trim($(".com_custody").val()) != "" && $.trim($(".initial_date").val()) != "") {
                    if ($(".requireinp").attr("data-is") == "on") {
                        $(".requireinp").attr("data-is", "off");
                        $(".requireinp").hide();
                    }
                }
            },
            //管理费率输入部分
            commanageTest() {
                let el = $(".com_management");
                this.inpFloat(el, 6);
                if (parseFloat(el.val()) > 100) {
                    $.showNotice('请输入100以内的小数', 'warning');
                }
            },
            //管理费率输入框失去焦点部分
            commanageBlur() {
                this.inpBlur($(".com_management"), 6);
                if ($.trim($(".initial_capital").val()) != "" && $.trim($(".com_name").val()) != "" && $.trim($(".initial_share").val()) != "" && $.trim($(".com_management").val()) != "" && $.trim($(".com_custody").val()) != "" && $.trim($(".initial_date").val()) != "") {
                    if ($(".requireinp").attr("data-is") == "on") {
                        $(".requireinp").attr("data-is", "off");
                        $(".requireinp").hide();
                    }
                }
            },
            //托管费率输入部分
            comcustodyTest() {
                let el = $(".com_custody");
                this.inpFloat(el, 6);
                if (parseFloat(el.val()) > 100) {
                    $.showNotice('请输入100以内的小数', 'warning');
                }
            },
            //托管费率输入框失去焦点部分
            comcustodyBlur() {
                this.inpBlur($(".com_custody"), 6);
                if ($.trim($(".initial_capital").val()) != "" && $.trim($(".com_name").val()) != "" && $.trim($(".initial_share").val()) != "" && $.trim($(".com_management").val()) != "" && $.trim($(".com_custody").val()) != "" && $.trim($(".initial_date").val()) != "") {
                    if ($(".requireinp").attr("data-is") == "on") {
                        $(".requireinp").attr("data-is", "off");
                        $(".requireinp").hide();
                    }
                }
            },
            /**
             * 创建日期选择控件
             *
             * @param ele [String] 控件挂载点
             * @param option [Object] {done: Function}
             */
            createDatePicker(ele, option = {}) {
                let _self = this, done;
                if (ele == undefined || ele == null) {
                    return;
                }
                if (option.hasOwnProperty("done")) {
                    done = option.done;
                }
                laydate.render({
                    elem: ele,
                    type: "date",
                    format: "yyyyMMdd",
                    max: new Date().toString(),
                    position: "absolute",
                    showBottom: false,
                    /**
                     * 控件选择完毕后的回调
                     *
                     * @param value   生成的值
                     * @param date    日期时间对象
                     * @param endDate 结束的日期时间对象
                     */
                    done: done || function(value, date, endDate) {
                        _self.estabTime = value;
                    }
                });
            },
            //成立日期失去焦点部分
            initialBlur() {
                setTimeout(function() {
                    if ($.trim($(".initial_capital").val()) != "" && $.trim($(".com_name").val()) != "" && $.trim($(".initial_share").val()) != "" && $.trim($(".com_management").val()) != "" && $.trim($(".com_custody").val()) != "" && $.trim($(".initial_date").val()) != "") {
                        if ($(".requireinp").attr("data-is") == "on") {
                            $(".requireinp").attr("data-is", "off");
                            $(".requireinp").hide();
                        }
                    }
                }, 500);
            },
            //创建组合按钮绑定弹窗
            createComClick() {
                let that = this;
                $(".initial_date").val(this.getDate());
                $("#new_com_title").text("创建组合");
                this.entryInfo = [];
                $(".requireinp").attr("data-is", "off");
                $(".requireinp").hide();
                posiname = "";
                setTimeout(that.fixTable, 0);
            },
            //创建组合弹窗初始化数据
            comBaseData() {
                $(".com_name").val("");
                $(".initial_capital").val("");
                $(".initial_share").val("");
                $(".com_management").val("");
                $(".com_custody").val("");
                $(".area").val("");
                $(".com_currency").val("人民币");
                $(".initial_date").val(this.getDate());
                $(".posititle").text("");
                this.selectedName = this.namesel[0].value;
            },
            //创建组合弹窗关闭
            comCloseClick() {
                this.comBaseData();
            },
            //创建组合弹窗取消
            comCancelClick() {
                this.comBaseData();
            },
            //组合名称重名验证
            comnameBlur(event) {
                let that = this;
                var ele = $(event.target);
                var text = $.trim(ele.val());
                if (text.length > 0) {
                    if ($("#new_com_title").text() == "创建组合") {
                        portApi.isDuplicated(text)
                            .then(data => {
                                if (data.msg_no == 1) {
                                    ele.val("");
                                    $(".nameExist").show();
                                } else {
                                    $(".nameExist").hide();
                                }
                            })
                            .catch(err => {
                                $.showNotice("请求失败！", "error");
                            });
                    } else {
                        if (that.comInfo.id != undefined) {
                            portApi.isDuplicated(text, parseInt(that.comInfo.id))
                                .then(data => {
                                    if (data.msg_no == 1) {
                                        ele.val("");
                                        $(".nameExist").show();
                                    } else {
                                        $(".nameExist").hide();
                                    }
                                })
                                .catch(err => {
                                    $.showNotice("请求失败！", "error");
                                });
                        }
                    }
                }
                //当表单必填项没有填写完整时给出填写完整提示
                if ($.trim($(".initial_capital").val()) != "" && $.trim($(".com_name").val()) != "" && $.trim($(".initial_share").val()) != "" && $.trim($(".com_management").val()) != "" && $.trim($(".com_custody").val()) != "" && $.trim($(".initial_date").val()) != "") {
                    if ($(".requireinp").attr("data-is") == "on") {
                        $(".requireinp").attr("data-is", "off");
                        $(".requireinp").hide();
                    }
                }
            },
            //模拟组合表格数据请求
            basicInfoFun() {
                if (!user_name || user_name == "") {
                    //获取创建人名称
                    if ($(".frame_name").text().split("_").length > 1) {
                        user_name = $(".frame_name").text().split("_")[1];
                    } else {
                        user_name = $(".frame_name").text().split("_")[0];
                    }
                }
                portApi.get()
                    .then(result => {
                        //更新数据前先清除缓存
                        _self.$store.commit({
                            type: moduleName + "/setBasicInfo",
                            newVal: []
                        });
                        if (result.length > 0) {
                            for (var i = 0; i < result.length; i++) {
                                var currency = "人民币";
                                var obj = result[i];
                                _self.$set(_self.basicInfo, i, {
                                    id: i,
                                    port_id: obj.PORT_ID,
                                    name: obj.NAME,
                                    date: obj.BEGIN_DATE,
                                    money: numberUtils.getDivision((obj.AMOUNT / 10000).toFixed(2)),
                                    share: obj.UNIT_NAV.toFixed(4),
                                    currency: currency,
                                    creater: user_name,
                                    time: obj.MODI_DATE,
                                    portflag: obj.PORT_FLAG,
                                    info: obj.INFO,
                                    bench_id: obj.BENCH_ID,
                                    manager_fee: obj.MANAGER_FEE,
                                    trustee_fee: obj.TRUSTEE_FEE,
                                    check_flag: obj.CHECK_FLAG,
                                    check_date: obj.CHECK_DATE !== 0 ? obj.CHECK_DATE : "--",
                                    all: false
                                });
                            }
                        }
                        // 刷新组合表格时，默认选中上一次选中的组合
                        if (_self.comInfo.id != undefined && _self.comInfo.id != "") {
                            let selectedPortIndex = _self.basicInfo.findIndex(port => port.port_id == _self.comInfo.id);
                            if (selectedPortIndex != -1) {
                                _self.basicInfo[selectedPortIndex].all = true;
                            }
                        }
                    })
                    .catch(() => {
                        $.showNotice("请求失败！", "error");
                    });
            },
            /**
             * 根据组合id请求对应组合信息
             *
             * @param id 组合id
             * @param invokeWhenSucc 请求成功时调用
             */
            getPortfolioById(id, invokeWhenSucc) {
                portApi.getById(id)
                    .then(data => {
                        if ($.isFunction(invokeWhenSucc)) {
                            invokeWhenSucc.call(data);
                        }
                    })
                    .catch(err => {
                        console.error('请求组合信息失败！', err);
                    });
            },
            //向数组添加新元素公共方法
            getPosition(arr, obj1) {
                for (var i = 0; i < this.entryInfo.length; i++) {
                    obj1 = {
                        sec_code: this.entryInfo[i].stock_code,
                        name: this.entryInfo[i].stock_name,
                        // volume(股) = 手数 * 100
                        volume: parseFloat(this.entryInfo[i].quantity.split(",").join("")) * 100
                    };
                    for (var j = 0; j < this.market.length; j++) {
                        if (this.entryInfo[i].market == this.market[j].name) {
                            obj1.market_id = this.market[j].code;
                        }
                    }
                    if (this.entryInfo[i].sign == "多头") {
                        obj1.position_flag = "1";
                    } else {
                        obj1.position_flag = "2";
                    }
                    arr.push(obj1);
                }
            },
            //创建组合弹窗确定
            comConfirmClick() {
                //添加组合信息公用部分
                var obj = {}, combinarr = [], combinpos = [], combinposarr = [], combinposadd = [], obj2;
                obj.name = $(".com_name").val();
                obj.bench_id = parseInt($(".base_com").val());
                // 初始资金单位：万
                obj.amount = parseFloat($(".initial_capital").val()) * 10000;
                obj.unit_nav = parseFloat($(".initial_share").val());
                obj.currency = "CNY";
                obj.begin_date = parseInt($(".initial_date").val());
                obj.manager_fee = parseFloat($(".com_management").val()) / 100;
                obj.trustee_fee = parseFloat($(".com_custody").val()) / 100;
                obj.info = $(".area").val();
                // 验证组合基本信息必填项是否填写
                var validPortInfo = $(".account input").validateEmpty(function() {
                    $(".requireinp").show();
                    $(".requireinp").attr("data-is", "on");
                });
                // 验证新增的初始持仓项是否填写完整
                var validPosition = $(".new_com_t .table-common tr.position-row span").validateEmpty(
                    function() {
                        $(".nofinish").modal();
                    }
                );
                // 初始持仓导入文件名，无导入文件则为'*'
                let combinurl = "*";
                if (validPortInfo && validPosition) {
                    $(".requireinp").hide();
                    $(".requireinp").attr("data-is", "off");
                    if ($("#new_com_title").text() == "创建组合") {
                        obj.port_flag = "1";
                        let positionList = [];
                        //创建组合时添加持仓信息
                        this.getPosition(positionList, obj2);
                        //判断初始持仓是否有导入文件
                        if (posiname != undefined && posiname != "") {
                            combinurl = posiname;
                        } else {
                            combinurl = "*";
                        }
                        portApi.add(obj, combinurl, positionList)
                            .then(data => {
                                if (data[0].msg_no == 0) {
                                    _self.basicInfoFun();
                                    $.showNotice("组合已创建！");
                                } else {
                                    $.showNotice("创建组合失败！", "error");
                                }
                            })
                            .catch(err => {
                                $.showNotice("创建组合失败！", "error");
                            });
                    } else {
                        //修改组合部分
                        obj.port_id = parseInt(this.comInfo.id);
                        obj.port_flag = this.comInfo.portflag;
                        //组合信息请求
                        portApi.update({
                            port_id: obj.port_id,
                            name: obj.name,
                            begin_date: obj.begin_date,
                            info: obj.info,
                            amount: obj.amount,
                            unit_nav: obj.unit_nav,
                            currency: obj.currency,
                            bench_id: obj.bench_id,
                            manager_fee: obj.manager_fee,
                            trustee_fee: obj.trustee_fee,
                            port_flag: obj.port_flag
                        })
                            .then(data => {
                                if (data.msg_no == 0) {
                                    _self.basicInfoFun();
                                    $.showNotice("修改组合成功！");
                                } else {
                                    $.showNotice("修改组合失败！", "error");
                                }
                            })
                            .catch(err => {
                                $.showNotice("修改组合失败！", "error");
                            });
                        //修改持仓信息请求
                        this.getPosition(combinpos, obj2);
                        for (var i = 0; i < combinpos.length; i++) {
                            combinpos[i].port_id = obj.port_id;
                            if (this.entryInfo[i].guid == undefined) {
                                combinposadd.push(combinpos[i]);
                            } else {
                                combinpos[i].guid = this.entryInfo[i].guid;
                                combinposarr.push(combinpos[i]);
                            }
                        }
                        if (combinposarr.length > 0) {
                            positionApi.update(combinposarr)
                                .catch(err => {
                                    $.showNotice("修改持仓失败！", "error");
                                });
                        }
                        if (combinposadd.length > 0) {
                            //新增持仓信息请求
                            positionApi.add(combinposadd)
                                .catch(err => {
                                    $.showNotice("新增持仓失败！", "error");
                                });
                        }
                    }
                    $(".new_com").modal("hide");
                    this.comBaseData();
                }
            },
            //初始持仓表格数据请求
            entryInfoFun(portid) {
                let that = this;
                positionApi.get(parseInt(portid))
                    .then(data => {
                        that.entryInfo = [];
                        for (var i = 0; i < data.length; i++) {
                            that.$set(that.entryInfo, i, {
                                id: i,
                                stock_code: data[i].SEC_CODE,
                                stock_name: data[i].NAME,
                                guid: data[i].GUID,
                                quantity: numberUtils.getDivision(data[i].VOLUME / 100),
                                all: false
                            });
                            for (var j = 0; j < that.market.length; j++) {
                                if (data[i].MARKET_ID == that.market[j].code) {
                                    that.entryInfo[i].market = that.market[j].name;
                                    break;
                                }
                            }
                            if (data[i].POSITION_FLAG == "1") {
                                that.entryInfo[i].sign = "多头";
                            } else {
                                that.entryInfo[i].sign = "空头";
                            }
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取持仓信息失败！", "error");
                    });
            },
            //初始持仓导入交易弹窗初始化数据
            tradeExcelBaseData() {
                $(".import_e").val("");
                $(".import_files").val("");
            },
            //初始持仓导入交易弹窗绑定按钮
            newcomExc() {
                if (this.entryInfo[0] == undefined) {
                    $(".positionexcel").modal();
                    //获取组合名称
                    $(".import_rows").val($(".com_name").val());
                    //获取上传文件路径
                    $(".import_files").on("change", function() {
                        var postimer = setInterval(function() {
                            $(".import_e").val($(".import_files").val());
                            clearInterval(postimer);
                        }, 300);
                    });
                } else if (this.entryInfo[0].stock_code != "" && this.entryInfo[0].sign != "" && this.entryInfo[0].quantity != "") {
                    $(".positionexcel").modal();
                    //获取组合名称
                    $(".import_rows").val($(".com_name").val());
                    //获取上传文件路径
                    $(".import_files").on("change", function() {
                        var postimer = setInterval(function() {
                            $(".import_e").val($(".import_files").val());
                            clearInterval(postimer);
                        }, 300);
                    });
                } else {
                    $(".nofinish").modal();
                }
            },
            //初始持仓导入交易弹窗关闭
            tradeExcelClose() {
                this.tradeExcelBaseData();
            },
            //初始持仓导入交易弹窗取消
            tradeExcelCancel() {
                this.tradeExcelBaseData();
            },
            //初始持仓导入交易弹窗确定
            tradeExcelConfirm() {
                var filepath, filename, formData;
                filepath = $(".import_files").val().split("\\");
                filename = filepath[2];
                formData = new FormData();
                formData.append("file", document.getElementById("loadfiles").files[0]);
                if ($("#new_com_title").text() == "创建组合") {
                    fileApi.upload(filename, formData)
                        .then(data => {
                            if (data.msg_no == 0) {
                                //获取导入文件相关信息
                                posiname = data.msg_result;
                                $(".posititle").text(data.msg_info);
                            } else {
                                $(".posititle").text(data.msg_info);
                            }
                        })
                        .catch(err => {
                            $.showNotice("初始持仓上传文件失败！", "error");
                            $(".posititle").text("文件上传失败");
                        });
                } else {
                    formData.append("port_id", this.comInfo.id);
                    positionApi.addFromFile(formData)
                        .then(data => {
                            if (data.msg_no == 0) {
                                _self.entryInfoFun(_self.comInfo.id);
                            }
                            $(".posititle").text(data.msg_info);
                        })
                        .catch(err => {
                            $.showNotice("初始持仓导入文件失败！", "error");
                            $(".posititle").text("文件导入失败");
                        });
                }
                this.tradeExcelBaseData();
            },
            fixTable() {
                // 模态框
                var modalList = $(".pas-modal");
                var modal;
                for (var i = 0; i < modalList.length; i++) {
                    if ($(modalList[i]).attr("style") && $(modalList[i]).attr("style").indexOf("display: block;") > -1) {
                        modal = $(modalList[i]);
                        break;
                    }
                }
                if (modal) {
                    var modalContent = modal.find(".modal-dialog");
                    var viewH = modal.height();
                    var h = viewH * 0.8;
                    h = h > 350 ? h : 350;
                    var exclude = 88 + 55 + 12;
                    if (modalContent.find(".twoselect").length === 1) {
                        h = h > 550 ? h : 550;
                        exclude += (modalContent.find(".twoselect").height() + 24);
                    }
                    modalContent.css({
                        "height": h,
                        "min-height": h,
                        "max-height": h
                    });
                    modalContent.find(".fix-table").css({
                        "height": h - exclude,
                        "min-height": h - exclude,
                        "max-height": h - exclude
                    });
                }
            },
            //组合表格修改部分
            amendClick() {
                $(".nameExist").hide();
                $("#new_com_title").text("修改组合");
                setTimeout(_self.fixTable, 0);
                this.entryInfo = [];
                if ($(".basicTr").hasClass("tr_color")) {
                    var id = $(".tr_color").attr("itemId");
                    var portid = parseInt($(".tr_color").attr("portId"));
                    var portflag = $(".tr_color").attr("portFlag");
                    this.comInfo.id = portid;
                    this.comInfo.portflag = portflag;
                    //获取选中组合对应的表单数据
                    portApi.getById(portid)
                        .then(data => {
                            $(".com_name").val(data.NAME);
                            $(".initial_capital").val((data.AMOUNT / 10000).toFixed(2));
                            $(".initial_share").val(data.UNIT_NAV.toFixed(4));
                            $(".com_management").val((data.MANAGER_FEE * 100).toFixed(6));
                            $(".com_custody").val((data.TRUSTEE_FEE * 100).toFixed(6));
                            $(".area").val(data.INFO);
                            $(".com_currency").val("人民币");
                            _self.estabTime = data.BEGIN_DATE;
                            $(".posititle").text("");
                            _self.selectedName = _self.namesel[data.BENCH_ID - 1].value;
                        })
                        .catch(err => {
                            $.showNotice("获取组合信息失败！", "error");
                        });
                    //获取选中组合对应的持仓数据
                    positionApi.get(parseInt(portid))
                        .then(data => {
                            for (var i = 0; i < data.length; i++) {
                                _self.$set(_self.entryInfo, i, {
                                    id: i,
                                    stock_code: data[i].SEC_CODE,
                                    stock_name: data[i].NAME,
                                    guid: data[i].GUID,
                                    quantity: numberUtils.getDivision(parseFloat(data[i].VOLUME / 100)),
                                    all: false
                                });
                                for (var j = 0; j < _self.market.length; j++) {
                                    if (data[i].MARKET_ID == _self.market[j].code) {
                                        _self.entryInfo[i].market = _self.market[j].name;
                                        break;
                                    }
                                }
                                if (data[i].POSITION_FLAG == "1") {
                                    _self.entryInfo[i].sign = "多头";
                                } else {
                                    _self.entryInfo[i].sign = "空头";
                                }
                            }
                        })
                        .catch(err => {
                            $.showNotice("获取持仓信息失败！", "error");
                        });
                }
            },

            //组合表格核算部分
            portcheckClick() {
                var portids = [];
                for (var i = 0; i < this.basicInfo.length; i++) {
                    if (this.basicInfo[i].all == true) {
                        // 将组合状态显示为“核算中”状态
                        this.basicInfo[i].check_flag = "1";
                        portids.push(this.basicInfo[i].port_id);
                    }
                }
                portApi.doAccounting(portids)
                    .then(data => {
                        _self.basicInfoFun();
                        if (data.msg_no == 0) {
                            $.showNotice("核算成功！");
                        } else {
                            $.showNotice("核算失败！", "error");
                        }
                    })
                    .catch(err => {
                        $.showNotice("核算失败！", "error");
                    });
            },

            //组合表格排序部分
            getBasic(orderBy, direction) {
                portApi.get(orderBy, direction)
                    .then(data => {
                        //更新数据前先清除缓存
                        _self.$store.commit({
                            type: moduleName + "/setBasicInfo",
                            newVal: []
                        });
                        for (var i = 0; i < data.length; i++) {
                            var currency = "人民币";
                            var obj = data[i];
                            _self.$set(_self.basicInfo, i, {
                                id: i,
                                port_id: obj.PORT_ID,
                                name: obj.NAME,
                                date: obj.BEGIN_DATE,
                                money: numberUtils.getDivision((obj.AMOUNT / 10000).toFixed(2)),
                                share: obj.UNIT_NAV.toFixed(4),
                                currency: currency,
                                creater: user_name,
                                time: obj.MODI_DATE,
                                portflag: obj.PORT_FLAG,
                                info: obj.INFO,
                                bench_id: obj.BENCH_ID,
                                manager_fee: obj.MANAGER_FEE,
                                trustee_fee: obj.TRUSTEE_FEE,
                                check_flag: obj.CHECK_FLAG,
                                check_date: obj.CHECK_DATE !== 0 ? obj.CHECK_DATE : "--",
                                all: false
                            });
                        }
                    })
                    .catch(() => {
                        $.showNotice("排序失败！", "error");
                    });
            },
            // 组合表格字段排序
            sortBtnClick(event) {
                var element = $(event.target);
                var prop = element.attr("prop");
                if (prop) {
                    var field = this.fieldOrderBy[prop];
                    if (field) {
                        var flag = element.hasClass("fa-caret-down");
                        if (flag) {
                            element.addClass("fa-caret-up").removeClass("fa-caret-down");
                            this.getBasic(field, "asc");
                        } else {
                            element.addClass("fa-caret-down").removeClass("fa-caret-up");
                            this.getBasic(field, "desc");
                        }
                    }
                }

            },

            //获取交易费率
            transClick() {
                setTimeout(_self.fixTable, 0);
                setTimeout(function() {
                    var tanH = $(".transaction .modal-body").height() - 64 + 7 - 2;
                    $(".transaction .com_cost").height(tanH);
                }, 300);
                this.$store.commit({
                    type: moduleName + "/setTransactionInfo",
                    newVal: []
                });
                feeRateApi.get(parseInt(_self.comInfo.id))
                    .then(data => {
                        for (var i = 0; i < data.length; i++) {
                            _self.$set(_self.transactionInfo, i, {
                                id: i,
                                guid: data[i].GUID,
                                sec_kind: data[i].SEC_KIND,
                                rate: data[i].RATE.toFixed(8),
                                market_id: data[i].MARKET_ID,
                                type: data[i].TYPE
                            });
                            if (data[i].TYPE == "1") {
                                switch (data[i].SEC_KIND) {
                                    case "ESA":
                                        _self.transactionInfo[i].businessType = "股票买入";
                                        break;
                                    case "DB":
                                        _self.transactionInfo[i].businessType = "债券现券买入";
                                        break;
                                    case "ESA.NEEQ":
                                        _self.transactionInfo[i].businessType = "新三板买入";
                                        break;
                                    case "EM":
                                        _self.transactionInfo[i].businessType = "基金买入";
                                        break;
                                    default:
                                        _self.transactionInfo[i].businessType = "金融期货买入";
                                }
                            } else if (data[i].TYPE == "2") {
                                switch (data[i].SEC_KIND) {
                                    case "ESA":
                                        _self.transactionInfo[i].businessType = "股票卖出";
                                        break;
                                    case "DB":
                                        _self.transactionInfo[i].businessType = "债券现券卖出";
                                        break;
                                    case "ESA.NEEQ":
                                        _self.transactionInfo[i].businessType = "新三板卖出";
                                        break;
                                    case "EM":
                                        _self.transactionInfo[i].businessType = "基金卖出";
                                        break;
                                    default:
                                        _self.transactionInfo[i].businessType = "金融期货卖出";
                                }
                            }
                            for (var j = 0; j < _self.market.length; j++) {
                                if (data[i].MARKET_ID == _self.market[j].code) {
                                    _self.transactionInfo[i].exchange = _self.market[j].exchange;
                                    break;
                                }
                            }
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取费率失败！", "error");
                    });
            },
            //修改交易费率
            transConfirm() {
                var transarr = [], obj;
                for (var i = 0; i < _self.transactionInfo.length; i++) {
                    obj = {
                        port_id: parseInt(_self.comInfo.id),
                        type: _self.transactionInfo[i].type,
                        market_id: _self.transactionInfo[i].market_id,
                        sec_kind: _self.transactionInfo[i].sec_kind,
                        guid: _self.transactionInfo[i].guid,
                        rate: _self.transactionInfo[i].rate
                    };
                    transarr.push(obj);
                }
                feeRateApi.update(transarr)
                    .then(data => {
                        console.log(data);
                        $.showNotice("更新费率成功！");
                    })
                    .catch(err => {
                        $.showNotice("更新费率失败！", "error");
                    });
            },

            //选中当前日期添加到列表
            getTime(arr, date) {
                if (arr.length > 0) {
                    for (var i = 0; i < arr.length; i++) {
                        if (date < arr[0].date) {
                            arr.splice(i, 0, { id: "", date: date });
                        } else if (date < arr[i].date && date > arr[i - 1].date) {
                            arr.splice(i, 0, { id: "", date: date });
                        } else if (date > arr[arr.length - 1].date) {
                            arr.splice(arr.length, 0, { id: "", date: date });
                        }
                        arr[i].id = i;
                    }
                } else {
                    arr.push({ id: 0, date: date });
                }
            },

            //组合交易表格数据请求
            tradeInfoFun(portid, pointdate) {
                tradeApi.getByDate(parseInt(portid), parseInt(pointdate))
                    .then(data => {
                        $(".comtradelbtn").attr("disabled", true);
                        _self.$store.commit({
                            type: moduleName + "/setTradeInfo",
                            newVal: []
                        });
                        if (data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                _self.$set(_self.tradeInfo, i, {
                                    id: i,
                                    guid: data[i].GUID,
                                    stock_code: data[i].SEC_CODE,
                                    stock_name: data[i].NAME,
                                    price: numberUtils.getDivision(data[i].PRICE.toFixed(2)),
                                    quantity: numberUtils.getDivision(parseFloat(data[i].VOLUME / 100)),
                                    money: numberUtils.getDivision(data[i].AMOUNT.toFixed(2)),
                                    cost: numberUtils.getDivision(data[i].FEE.toFixed(2)),
                                    date: data[i].POINT_DATE,
                                    market_id: data[i].MARKET_ID,
                                    sec_kind: data[i].SEC_KIND,
                                    all: false
                                });
                                for (var j = 0; j < _self.market.length; j++) {
                                    if (data[i].MARKET_ID == _self.market[j].code) {
                                        _self.tradeInfo[i].market = _self.market[j].name;
                                        break;
                                    }
                                }
                                if (data[i].POSITION_FLAG == "1") {
                                    _self.tradeInfo[i].positionflag = "多头";
                                } else {
                                    _self.tradeInfo[i].positionflag = "空头";
                                }
                                if (data[i].TYPE == "1") {
                                    _self.tradeInfo[i].sign = "买入";
                                } else {
                                    _self.tradeInfo[i].sign = "卖出";
                                }
                                if (data[i].SEC_KIND == "FUTURE") {
                                    if (data[i].TYPE == "1" && data[i].POSITION_FLAG == "1") {
                                        _self.tradeInfo[i].sign = "多头买入";
                                    } else if (data[i].TYPE == "2" && data[i].POSITION_FLAG == "1") {
                                        _self.tradeInfo[i].sign = "多头卖出";
                                    } else if (data[i].TYPE == "1" && data[i].POSITION_FLAG == "2") {
                                        _self.tradeInfo[i].sign = "空头买入";
                                    } else if (data[i].TYPE == "2" && data[i].POSITION_FLAG == "2") {
                                        _self.tradeInfo[i].sign = "空头卖出";
                                    }
                                }
                            }
                        } else {
                            _self.comInfo.dateno = _self.comInfo.date;
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取组合交易单个日期对应信息失败！", "error");
                    });
            },
            //组合交易日期数据请求
            tradedateInfoFun(portid, num) {
                _self.$store.commit({
                    type: moduleName + "/setTradedateInfo",
                    newVal: []
                });
                tradeApi.getDates(parseInt(portid))
                    .then(data => {
                        for (var i = 0; i < data.length; i++) {
                            _self.$set(_self.tradedateInfo, i, {
                                id: i,
                                date: data[i].POINT_DATE,
                                saved: true
                            });
                        }
                        if (num || num == 0) {
                            //如果是非交易日则再次请求延迟到交易日的数据
                            if (_self.comInfo.dateno) {
                                _self.comInfo.dateno = "";
                                _self.tradeInfoFun(_self.comInfo.id, _self.tradedateInfo[num].date);
                                _self.comInfo.date = _self.tradedateInfo[num].date;
                            }
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取组合交易日期失败！", "error");
                    });
            },
            //组合交易弹窗初始化数据
            comtradeClick() {
                setTimeout(_self.fixTable, 0);
                $(".trade_date").val(this.getDate());
                $(".tradetitle").text("");
                setTimeout(function() {
                    var tanH = $(".com_trade_w .modal-body").height() - 64 + 7 - 2;
                    $(".com_trade_w .allo_date .fix-table").height(tanH);
                    $(".com_trade_w .com_wrap").height(tanH);
                }, 300);
                _self.$store.commit({
                    type: moduleName + "/setTradedateInfo",
                    newVal: []
                });
                _self.$store.commit({
                    type: moduleName + "/setTradeInfo",
                    newVal: []
                });
                this.comInfo.date = "";
                if ($(".basicTr").hasClass("tr_color")) {
                    var portid = parseInt($(".tr_color").attr("portId"));
                    var portflag = $(".tr_color").attr("portFlag");
                    this.comInfo.id = portid;
                    this.comInfo.portflag = portflag;
                    tradeApi.getDates(portid)
                        .then(data => {
                            // 判断组合是否有交易数据的日期数据，若无则在日期列表中默认添加当天，并选中
                            if (data.length > 0) {
                                for (var i = 0; i < data.length; i++) {
                                    _self.$set(_self.tradedateInfo, i, {
                                        id: i,
                                        date: data[i].POINT_DATE,
                                        saved: true
                                    });
                                }
                            } else {
                                let today = _self.getDateNow();
                                _self.$set(_self.tradedateInfo, 0, {
                                    id: 0,
                                    date: today
                                });
                                _self.$nextTick(function() {
                                    _self.comInfo.date = today;
                                });
                            }
                        })
                        .catch(err => {
                            $.showNotice("获取组合交易日期失败！", "error");
                        });
                }
            },
            //组合交易弹窗确定
            comtradeConfirm() {
                var obj = {}, comtrade = [], comtradearr = [], comtradeadd = [];
                // 验证交易记录行填写是否完整
                var validateTrade = $(".com_trade_w .table-common td span").validateEmpty(
                    function() {
                        $(".nofinish").modal();
                    }
                );
                if (!validateTrade) {
                    return;
                }
                for (var i = 0; i < this.tradeInfo.length; i++) {
                    obj = {
                        port_id: parseInt(this.comInfo.id),
                        point_date: parseInt(this.comInfo.date),
                        sec_code: this.tradeInfo[i].stock_code,
                        name: this.tradeInfo[i].stock_name,
                        price: parseFloat(this.tradeInfo[i].price.split(",").join("")),
                        volume: parseFloat(this.tradeInfo[i].quantity.split(",").join("")) * 100,
                        fee: parseFloat(this.tradeInfo[i].cost.split(",").join("")),
                        amount: parseFloat(this.tradeInfo[i].money.split(",").join(""))
                    };
                    for (var j = 0; j < this.market.length; j++) {
                        if (this.tradeInfo[i].market == this.market[j].name) {
                            obj.market_id = this.market[j].code;
                        }
                    }
                    if (this.tradeInfo[i].sign == "多头买入") {
                        obj.type = "1";
                        obj.position_flag = "1";
                    } else if (this.tradeInfo[i].sign == "多头卖出") {
                        obj.type = "2";
                        obj.position_flag = "1";
                    } else if (this.tradeInfo[i].sign == "空头买入") {
                        obj.type = "1";
                        obj.position_flag = "2";
                    } else if (this.tradeInfo[i].sign == "空头卖出") {
                        obj.type = "2";
                        obj.position_flag = "2";
                    } else if (this.tradeInfo[i].sign == "买入") {
                        obj.type = "1";
                        if (this.tradeInfo[i].positionflag == "多头") {
                            obj.position_flag = "1";
                        } else {
                            obj.position_flag = "2";
                        }
                    } else if (this.tradeInfo[i].sign == "卖出") {
                        obj.type = "2";
                        if (this.tradeInfo[i].positionflag == "多头") {
                            obj.position_flag = "1";
                        } else {
                            obj.position_flag = "2";
                        }
                    }
                    comtrade.push(obj);
                }
                for (var i = 0; i < comtrade.length; i++) {
                    if (this.tradeInfo[i].guid == undefined) {
                        comtradeadd.push(comtrade[i]);
                    } else {
                        comtrade[i].guid = this.tradeInfo[i].guid;
                        comtradearr.push(comtrade[i]);
                    }
                }
                if (comtradearr.length > 0) {
                    //修改交易信息请求
                    tradeApi.update(comtradearr)
                        .then(data => {
                            if (data[0].msg_no == 0) {
                                $(".tradetitle").text(data[0].msg_info);
                            } else {
                                $(".tradetitle").text(data[0].msg_info);
                            }
                        })
                        .catch(err => {
                            $.showNotice("修改交易失败！", "error");
                        });
                }
                if (comtradeadd.length > 0) {
                    //新增交易信息请求
                    tradeApi.add(comtradeadd)
                        .then(data => {
                            if (data.msg_no == 0) {
                                $(".tradetitle").text("保存成功");
                                //保存成功后请求当前日期的最新数据
                                _self.tradeInfoFun(_self.comInfo.id, _self.comInfo.date);
                                //获取当前表格对应的日期
                                for (var i = 0; i < _self.tradedateInfo.length; i++) {
                                    if (_self.comInfo.date == _self.tradedateInfo[i].date && !_self.tradedateInfo[i].saved) {
                                        _self.comInfo.datei = i;
                                    }
                                }
                                //如果当前日期已标记则不更新日期列表反之更新
                                if (_self.comInfo.datei === "") {
                                    _self.comInfo.datei = undefined;
                                }
                                if (_self.comInfo.datei || _self.comInfo.datei == 0) {
                                    //更新日期列表并标记当前表格对应的日期
                                    _self.tradedateInfoFun(_self.comInfo.id, _self.comInfo.datei);
                                }
                            } else {
                                $(".tradetitle").text("保存失败");
                            }
                        })
                        .catch(err => {
                            $.showNotice("新增交易失败！", "error");
                        });
                }
            },

            //组合交易调仓日期点击部分
            tradedateClick(event) {
                var ele = $(event.target);
                var id = ele.parent().attr("itemId");
                var point_date = parseInt(ele.text());
                this.comInfo.date = point_date;
                _self.$store.commit({
                    type: moduleName + "/setTradeInfo",
                    newVal: []
                });
                $(".tradetitle").text("");
                //删除没有数据的日期
                for (var i = 0; i < this.tradedateInfo.length; i++) {
                    //日期非新增但是已没有相关数据并且不是当前所在日期
                    if (this.comInfo.dateno == this.tradedateInfo[i].date && this.comInfo.dateno != this.comInfo.date) {
                        this.tradedateInfo.splice(i, 1);
                        this.comInfo.dateno = "";
                    } else if (!this.tradedateInfo[i].saved && this.tradedateInfo[i].date != this.comInfo.date) {
                        //日期是新增但是没有记录数据并且不是当前所在日期
                        this.tradedateInfo.splice(i, 1);
                    }
                    if (this.tradedateInfo[i]) {
                        this.tradedateInfo[i].id = i;
                    }
                }
                //点击日期获取交易记录
                tradeApi.getByDate(parseInt(_self.comInfo.id), point_date)
                    .then(data => {
                        for (var i = 0; i < data.length; i++) {
                            _self.$set(_self.tradeInfo, i, {
                                id: i,
                                guid: data[i].GUID,
                                stock_code: data[i].SEC_CODE,
                                stock_name: data[i].NAME,
                                price: numberUtils.getDivision(data[i].PRICE.toFixed(2)),
                                quantity: numberUtils.getDivision(data[i].VOLUME / 100),
                                money: numberUtils.getDivision(data[i].AMOUNT.toFixed(2)),
                                cost: numberUtils.getDivision(data[i].FEE.toFixed(2)),
                                date: data[i].POINT_DATE,
                                market_id: data[i].MARKET_ID,
                                sec_kind: data[i].SEC_KIND,
                                all: false
                            });
                            //交易市场换算
                            for (var j = 0; j < _self.market.length; j++) {
                                if (data[i].MARKET_ID == _self.market[j].code) {
                                    _self.tradeInfo[i].market = _self.market[j].name;
                                    break;
                                }
                            }
                            //多空方向
                            if (data[i].POSITION_FLAG == "1") {
                                _self.tradeInfo[i].positionflag = "多头";
                            } else {
                                _self.tradeInfo[i].positionflag = "空头";
                            }
                            //交易类型
                            if (data[i].TYPE == "1") {
                                _self.tradeInfo[i].sign = "买入";
                            } else {
                                _self.tradeInfo[i].sign = "卖出";
                            }
                            if (data[i].SEC_KIND == "FUTURE") {
                                if (data[i].TYPE == "1" && data[i].POSITION_FLAG == "1") {
                                    _self.tradeInfo[i].sign = "多头买入";
                                } else if (data[i].TYPE == "2" && data[i].POSITION_FLAG == "1") {
                                    _self.tradeInfo[i].sign = "多头卖出";
                                } else if (data[i].TYPE == "1" && data[i].POSITION_FLAG == "2") {
                                    _self.tradeInfo[i].sign = "空头买入";
                                } else if (data[i].TYPE == "2" && data[i].POSITION_FLAG == "2") {
                                    _self.tradeInfo[i].sign = "空头卖出";
                                }
                            }
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取组合交易单个日期对应信息失败！", "error");
                    });
            },
            //组合交易调仓日期增加日期部分
            tradedateBlur(value, date) {
                if (value >= 0) {
                    _self.estabTime = value;
                    _self.getTime(_self.tradedateInfo, value);
                    //如果是新增日期不存在则无数据
                    for (var i = 0; i < _self.tradedateInfo.length; i++) {
                        if (!_self.tradedateInfo[i].saved) {
                            _self.$store.commit({
                                type: moduleName + "/setTradeInfo",
                                newVal: []
                            });
                        }
                        if (!_self.tradedateInfo[i].saved && _self.tradedateInfo[i].date != value) {
                            _self.tradedateInfo.splice(i, 1);
                        }
                        if (_self.tradedateInfo[i]) {
                            _self.tradedateInfo[i].id = i;
                            //如果新增日期已存在则请求数据
                            if (_self.tradedateInfo[i].saved && _self.tradedateInfo[i].date == value) {
                                _self.tradeInfoFun(_self.comInfo.id, _self.tradedateInfo[i].date);
                            }
                        }
                    }
                    _self.$nextTick(() => {
                        for (var i = 0; i < _self.tradedateInfo.length; i++) {
                            if (value == _self.tradedateInfo[i].date) {
                                _self.comInfo.date = value;
                                $(".tradetitle").text("");
                            }
                        }
                    });
                }
            },

            //组合交易导入交易弹窗初始化数据
            comExcelBaseData() {
                $(".import_v").val("");
                $(".import_file").val("");
                this.mpSelected = null;
                this.$store.commit({
                    type: moduleName + "/" + SET_MP_LIST,
                    newVal: []
                });
                this.progressVal = 0;
                $(".trade_fileimp_result").text("");
                $("#file_imp_progress_bar .progress-bar").removeClass("progress-bar-danger");
            },

            //组合交易导入交易弹窗绑定按钮
            comtradeExc() {
                $(".comexcel").modal();
                //获取组合名称
                $(".import_row").val(this.comInfo.name);
                //获取上传文件路径
                $(".import_file").on("change", function() {
                    var tradetimer = setInterval(function() {
                        $(".import_v").val($(".import_file").val());
                        clearInterval(tradetimer);
                    }, 300);
                });
                this.loadMpList();
            },
            //组合交易导入交易弹窗关闭
            comExcelClose() {
                this.comExcelBaseData();
            },
            //组合交易导入交易弹窗取消
            comExcelCancel() {
                this.comExcelBaseData();
            },
            //组合交易导入交易弹窗确定
            comExcelConfirm() {
                var formData, file = document.getElementById("loadfile").files[0];
                formData = new FormData();
                formData.append("file", file);
                formData.append("port_id", this.comInfo.id);
                let promise;
                if (this.mpSelected === "-1") {
                    promise = tradeApi.addFromFile(formData);
                } else {
                    let fileName = file.name;
                    let splitStr = fileName.split("."), strLen = splitStr.length;
                    if (strLen > 1) {
                        let postfix = splitStr[strLen - 1];
                        if (postfix === "xls" || postfix === "xlsx") {
                            formData.append("file_type", "1");
                        } else if (postfix === "csv") {
                            formData.append("file_type", "2");
                        } else {
                            // 文件类型不支持
                            $(".type_error").modal("show");
                            return;
                        }
                    }
                    formData.append("mp_id", this.mpSelected);
                    promise = tradeApi.addFromExteralFile(formData);
                }
                let interval = this.handleProgressBar("#file_imp_progress_bar");
                promise.then(data => {
                    if (data.msg_no == 0) {
                        //获取导入文件相关信息
                        $(".trade_fileimp_result").text("导入成功");
                        _self.tradedateInfoFun(_self.comInfo.id);
                        // 暂停进度条
                        clearInterval(interval);
                        _self.progressVal = 100;
                    } else {
                        $(".trade_fileimp_result").text(data.msg_info);
                        clearInterval(interval);
                        $("#file_imp_progress_bar .progress-bar").addClass("progress-bar-danger");
                    }
                })
                    .catch(err => {
                        $.showNotice("流水文件导入交易失败", "error");
                        $(".trade_fileimp_result").text("导入失败");
                        $("#file_imp_progress_bar .progress-bar").addClass("progress-bar-danger");
                        clearInterval(interval);
                    });
                this.comExcelBaseData();
            },
            //组合交易导出交易部分
            comtradeExp() {
                if (this.tradeInfo[0] == undefined) {
                    $(".nodate").modal();
                } else if (this.tradeInfo[0].stock_code != "" && this.tradeInfo[0].sign != "" && this.tradeInfo[0].price != "" && this.tradeInfo[0].quantity != "" && this.tradeInfo[0].cost != "") {
                    var url = "/jax/vprt_trade/export?port_id=" + this.comInfo.id + "&point_date=" +
                        this.comInfo.date;
                    $(".comtradexport").attr("href", url);
                } else {
                    $(".nofinish").modal();
                }
            },

            //组合资金表格数据请求
            allocationInfoFun(portid, pointdate) {
                this.$store.commit({
                    type: moduleName + "/setAllocationInfo",
                    newVal: []
                });
                allocationApi.getByDate(parseInt(portid), parseInt(pointdate))
                    .then(data => {
                        _self.comcostall = false;
                        $(".comcostdelbtn").attr("disabled", true);
                        if (data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                _self.$set(_self.allocationInfo, i, {
                                    id: i,
                                    guid: data[i].GUID,
                                    cost: numberUtils.getDivision(data[i].AMOUNT.toFixed(2)),
                                    date: data[i].POINT_DATE,
                                    currency: data[i].CURRENCY,
                                    direction: data[i].AMOUNT_TYPE == '1' ? "流入" : "流出",
                                    all: false
                                });
                            }
                        } else {
                            _self.comInfo.dateno = _self.comInfo.date;
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取组合资金单个日期对应信息失败！", "error");
                    });
            },
            //组合资金日期数据请求
            costdateInfoFun(portid, num) {
                this.$store.commit({
                    type: moduleName + "/setCostdateInfo",
                    newVal: []
                });
                allocationApi.getDates(parseInt(portid))
                    .then(data => {
                        for (var i = 0; i < data.length; i++) {
                            _self.$set(_self.costdateInfo, i, {
                                id: i,
                                date: data[i].POINT_DATE,
                                saved: true
                            });
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取组合资金日期失败！", "error");
                    });
            },
            //组合资金弹窗初始化数据
            comcostClick() {
                setTimeout(_self.fixTable, 0);
                $(".com_cost_date").val(this.getDate());
                $(".costtitle").text("");
                setTimeout(function() {
                    var tanH = $(".com_cost_w .modal-body").height() - 64 + 7 - 2;
                    $(".com_cost_w .allo_date .fix-table").height(tanH);
                    $(".com_cost_w .com_cost").height(tanH);
                }, 300);
                this.$store.commit({
                    type: moduleName + "/setCostdateInfo",
                    newVal: []
                });
                this.$store.commit({
                    type: moduleName + "/setAllocationInfo",
                    newVal: []
                });
                this.comInfo.date = "";
                if ($(".basicTr").hasClass("tr_color")) {
                    var portid = parseInt($(".tr_color").attr("portId"));
                    var portflag = $(".tr_color").attr("portFlag");
                    this.comInfo.id = portid;
                    this.comInfo.portflag = portflag;
                    allocationApi.getDates(parseInt(portid))
                        .then(data => {
                            if (data.length > 0) {
                                for (var i = 0; i < data.length; i++) {
                                    _self.$set(_self.costdateInfo, i, {
                                        id: i,
                                        date: data[i].POINT_DATE,
                                        saved: true
                                    });
                                }
                            } else {
                                let today = _self.getDateNow();
                                _self.$set(_self.costdateInfo, 0, {
                                    id: 0,
                                    date: today
                                });
                                _self.$nextTick(function() {
                                    _self.comInfo.date = today;
                                });
                            }
                        })
                        .catch(err => {
                            $.showNotice("获取组合资金日期失败！", "error");
                        });
                }
            },
            //组合资金弹窗确定
            getComCost(arr, obj) {
                for (var i = 0; i < this.allocationInfo.length; i++) {
                    obj = {
                        port_id: parseInt(this.comInfo.id),
                        point_date: parseInt(this.comInfo.date),
                        amount: parseFloat(this.allocationInfo[i].cost.split(",").join(""))
                    };
                    if (this.allocationInfo[i].direction == "流入") {
                        obj.amount_type = "1";
                    } else {
                        obj.amount_type = "2";
                    }
                    arr.push(obj);
                }
            },
            comcostConfirm() {
                var obj = {}, comcost = [], comcostarr = [], comcostadd = [];

                var rowValidate = $(".com_cost_w td span").validateEmpty(function() {
                    $(".nofinish").modal();
                });

                if (!rowValidate) {
                    return;
                }
                this.getComCost(comcost, obj);
                for (var i = 0; i < comcost.length; i++) {
                    if (this.allocationInfo[i].guid == undefined) {
                        comcost[i].currency = "CNY";
                        comcostadd.push(comcost[i]);
                    } else {
                        comcost[i].guid = this.allocationInfo[i].guid;
                        comcost[i].currency = this.allocationInfo[i].currency;
                        comcostarr.push(comcost[i]);
                    }
                }
                if (comcostarr.length > 0) {
                    //修改交易信息请求
                    allocationApi.update(comcostarr)
                        .then(data => {
                            if (data[0].msg_no == 0) {
                                $(".costtitle").text(data[0].msg_info);
                            } else {
                                $(".costtitle").text(data[0].msg_info);
                            }
                        })
                        .catch(err => {
                            $.showNotice("修改资金失败！", "error");
                        });
                }
                if (comcostadd.length > 0) {
                    //新增交易信息请求
                    allocationApi.add(comcostadd)
                        .then(data => {
                            if (data.msg_no == 0) {
                                $(".costtitle").text("保存成功");
                                _self.allocationInfoFun(_self.comInfo.id, _self.comInfo.date);
                                for (var i = 0; i < _self.costdateInfo.length; i++) {
                                    if (_self.comInfo.date == _self.costdateInfo[i].date && !_self.costdateInfo[i].saved) {
                                        _self.comInfo.datei = i;
                                    }
                                }
                                //如果当前表格对应日期已标记则不更新日期列表，反之则更新
                                if (_self.comInfo.datei || _self.comInfo.datei == 0) {
                                    _self.costdateInfoFun(_self.comInfo.id, _self.comInfo.datei);
                                }
                            } else {
                                $(".costtitle").text("保存失败");
                            }
                        })
                        .catch(err => {
                            $.showNotice("新增资金失败！", "error");
                        });
                }
            },
            //组合资金变动日期点击部分
            costdateClick(event) {
                var ele = $(event.target);
                var id = ele.parent().attr("itemId");
                var point_date = parseInt(ele.text());
                this.comInfo.date = point_date;
                $(".costtitle").text("");
                //删除没有数据的日期
                for (var i = 0; i < this.costdateInfo.length; i++) {
                    //日期非新增但是已没有相关数据并且不是当前所在日期
                    if (this.comInfo.dateno == this.costdateInfo[i].date && this.comInfo.dateno != this.comInfo.date) {
                        this.costdateInfo.splice(i, 1);
                        this.comInfo.dateno = "";
                    } else if (!this.costdateInfo[i].saved && this.costdateInfo[i].date != this.comInfo.date) {
                        //日期是新增但是没有记录数据并且不是当前所在日期
                        this.costdateInfo.splice(i, 1);
                    }
                    if (this.costdateInfo[i]) {
                        this.costdateInfo[i].id = i;
                    }
                }
                //点击日期获取交易记录
                allocationApi.getByDate(parseInt(this.comInfo.id), point_date)
                    .then(data => {
                        _self.$store.commit({
                            type: moduleName + "/setAllocationInfo",
                            newVal: []
                        });
                        for (var i = 0; i < data.length; i++) {
                            _self.$set(_self.allocationInfo, i, {
                                id: i,
                                guid: data[i].GUID,
                                cost: numberUtils.getDivision(data[i].AMOUNT.toFixed(2)),
                                date: data[i].POINT_DATE,
                                currency: data[i].CURRENCY,
                                all: false
                            });
                            if (data[i].AMOUNT_TYPE == "1") {
                                _self.allocationInfo[i].direction = "流入";
                            } else {
                                _self.allocationInfo[i].direction = "流出";
                            }
                        }
                    })
                    .catch(err => {
                        $.showNotice("获取组合资金单个日期对应信息失败！", "error");
                    });
            },
            // 组合资金变动日期增加日期部分
            costdateBlur(value, date) {
                if (value >= 0) {
                    _self.estabTime = value;
                    _self.getTime(_self.costdateInfo, value);
                    //如果是新增日期不存在则无数据
                    for (var i = 0; i < _self.costdateInfo.length; i++) {
                        if (!_self.costdateInfo[i].saved) {
                            _self.$store.commit({
                                type: moduleName + "/setAllocationInfo",
                                newVal: []
                            });
                        }
                        if (!_self.costdateInfo[i].saved && _self.costdateInfo[i].date != value) {
                            _self.costdateInfo.splice(i, 1);
                        }
                        if (_self.costdateInfo[i]) {
                            _self.costdateInfo[i].id = i;
                            //如果新增日期已存在则请求数据
                            if (_self.costdateInfo[i].saved && _self.costdateInfo[i].date == value) {
                                _self.allocationInfoFun(_self.comInfo.id, _self.costdateInfo[i].date);
                            }
                        }
                    }
                    _self.$nextTick(() => {
                        for (var i = 0; i < _self.costdateInfo.length; i++) {
                            if (value == _self.costdateInfo[i].date) {
                                $(".allo_date .change_date").eq(i).find("td").addClass("td_color");
                                _self.comInfo.date = value;
                                $(".costtitle").text("");
                            }
                        }
                    });
                }
            },

            //组合资金导入交易弹窗初始化数据
            costExcelBaseData() {
                $(".import_v_c").val("");
                $(".import_file_c").val("");
            },

            //组合资金导入交易弹窗绑定按钮
            comcostExc() {
                $(".costxcel").modal();
                //获取组合名称
                $(".import_row_c").val(this.comInfo.name);
                //获取上传文件路径
                $(".import_file_c").on("change", function() {
                    var costtimer = setInterval(function() {
                        $(".import_v_c").val($(".import_file_c").val());
                        clearInterval(costtimer);
                    }, 300);
                });
            },
            //组合资金导入交易弹窗关闭
            costExcelClose() {
                this.costExcelBaseData();
            },
            //组合资金导入交易弹窗取消
            costExcelCancel() {
                this.costExcelBaseData();
            },
            //组合资金导入交易弹窗确定
            costExcelConfirm() {
                var formData;
                formData = new FormData();
                formData.append("file", document.getElementById("loadfile_c").files[0]);
                formData.append("port_id", this.comInfo.id);
                allocationApi.addFromFile(formData)
                    .then(data => {
                        if (data.msg_no == 0) {
                            //获取导入文件相关信息
                            $(".costtitle").text(data.msg_info);
                            _self.costdateInfoFun(_self.comInfo.id);
                        } else {
                            $(".costtitle").text(data.msg_info);
                        }
                    })
                    .catch(err => {
                        $.showNotice("组合资金上传文件失败！", "error");
                        $(".costtitle").text("文件上传失败");
                    });
                this.costExcelBaseData();
            },
            //组合资金导出交易部分
            comcostExp() {
                if (this.allocationInfo[0] == undefined) {
                    $(".nodate").modal();
                } else if (this.allocationInfo[0].direction != "" && this.allocationInfo[0].cost != "") {
                    var url = "/jax/vprt_allocation/export?port_id=" + this.comInfo.id + "&point_date=" + this.comInfo.date;
                    $(".comcostexport").attr("href", url);
                } else {
                    $(".nofinish").modal();
                }
            },

            //组合表格交易费用表格部分操作
            //编辑
            rateClick(event) {
                var ele = $(event.target);
                var elep = ele.parents("tr") || ele.parent("tr");
                var rate = elep.find("span").text();
                elep.find("span").hide();
                elep.find("input").show().focus().val(rate);
            },
            rateUp(event) {
                var ele = $(event.target);
                var elep = ele.parents("tr").find(".trans_rate");
                var val = elep.val();
                var reg = /^[0-9]*\.?\d{0,8}$/;
                if (val.length > 0) {
                    if (!reg.test(val)) {
                        elep.val(val.slice(0, -1));
                    } else {
                        val = elep.val();
                    }
                } else {
                    elep.val("");
                }
            },
            rateBlur(event) {
                var ele = $(event.target);
                var elep = ele.parents("tr").find(".trans_rate");
                var id = ele.parents("tr").attr("itemId");
                var name = ele.attr("itemName");
                var inp = elep.val();
                if (Number(inp) === 0) {
                    elep.val("0.00000000");
                } else {
                    elep.val((parseFloat(inp) || "0").toFixed(8));
                }
                this.transactionInfo[id][name] = elep.val();
                ele.hide();
                ele.parents("tr").find("span").show();
            },

            //表格编辑、新增、删除、全选等操作部分
            //行编辑公用方法
            editClick(event, stext, inp, arr, str, input) {
                var ele = $(event.target);
                var elep = ele.parents("tr") || ele.parent("tr");
                var id = elep.attr("itemId");
                for (var i = 0; i < arr.length; i++) {
                    if (i == id) {
                        arr[i].all = true;
                    } else {
                        arr[i].all = false;
                    }
                }
                var text_s = elep.find("." + stext).text();
                if (text_s.indexOf(",") > -1) {
                    text_s = text_s.split(",").join("");
                }
                elep.find("." + stext).hide();
                if (input == "input") {
                    elep.find("." + inp).show().focus().val(text_s);
                } else {
                    elep.find("." + inp).show();
                }
                if (str == "newcomall") {
                    $(".newcomdelbtn").attr("disabled", false);
                } else if (str == "comtradeall") {
                    $(".comtradelbtn").attr("disabled", false);
                } else if (str == "comcostall") {
                    $(".comcostdelbtn").attr("disabled", false);
                }
            },
            //失去焦点公用方法
            //普通输入框失去焦点
            editBlur(event, arr) {
                var ele = $(event.target);
                var id = ele.parents("tr").attr("itemId");
                var name = ele.attr("itemName");
                var text_inp = ele.val();
                if (arr[id][name] == "") {
                    arr[id][name] = text_inp;
                }
                ele.hide();
                ele.parents("tr").find("span").show();
            },
            //日期输入框失去焦点
            dateBlur(event, arr) {
                var ele = $(event.target);
                var id = ele.parents("tr").attr("itemId");
                var name = ele.attr("itemName");
                setTimeout(function() {
                    var text_inp = ele.val();
                    arr[id][name] = text_inp;
                }, 500);
                ele.hide();
                ele.parents("tr").find("span").show();
            },
            //输入框限制只能输入正数、0、小数(小数后保留两位)等
            inpkeyUp(event, str) {
                var ele = $(event.target);
                var elep = ele.parents("tr").find("." + str);
                var val = elep.val();
                var reg = /^[0-9]*\.?\d{0,2}$/;
                if (val.length > 0) {
                    if (!reg.test(val)) {
                        elep.val(val.slice(0, -1));
                    } else {
                        val = elep.val();
                    }
                } else {
                    elep.val("");
                }
            },
            //输入框限制只能输入正数、0
            inpkeyUpNum(event, str) {
                var ele = $(event.target);
                var elep = ele.parents("tr").find("." + str);
                var val = elep.val();
                var reg = /^[0-9]*$/;
                if (val.length > 0) {
                    if (!reg.test(val)) {
                        elep.val(val.slice(0, -1));
                    } else {
                        val = elep.val();
                    }
                } else {
                    elep.val("");
                }
            },
            inpkeyBlur(event, str, arr) {
                var ele = $(event.target);
                var elep = ele.parents("tr").find("." + str);
                var id = ele.parents("tr").attr("itemId");
                var name = ele.attr("itemName");
                var inp = elep.val();
                if (Number(inp) === 0) {
                    elep.val("0.00");
                } else {
                    elep.val((parseFloat(inp) || "0").toFixed(2));
                }
                arr[id][name] = numberUtils.getDivision(elep.val());
                ele.hide();
                ele.parents("td").find("span").show();
            },
            inpkeyNumBlur(event, str, arr) {
                var ele = $(event.target);
                var elep = ele.parents("tr").find("." + str);
                var id = ele.parents("tr").attr("itemId");
                var name = ele.attr("itemName");
                var inp = elep.val();
                if (Number(inp) === 0) {
                    elep.val("0");
                } else {
                    elep.val(parseFloat(inp) || "0");
                }
                arr[id][name] = numberUtils.getDivision(elep.val());
                ele.hide();
                ele.parents("td").find("span").show();
            },
            //新增
            addClick(add, arr) {
                for (var i = 0; i < arr.length; i++) {
                    arr[i].id = i + 1;
                }
                arr.unshift(Object.assign({}, add));
            },
            //删除
            deleteClick(arr) {
                var arrAll = [];
                for (var i = 0; i < arr.length; i++) {
                    arrAll.push(arr[i].all);
                }
                for (var j = 0; j < arrAll.length; j++) {
                    if (arrAll[j] == true) {
                        arr.splice(j, 1);
                        arrAll.splice(j, 1);
                        j = j - 1;
                    }
                }
                //删除行后重新排序
                for (var i = 0; i < arr.length; i++) {
                    arr[i].id = i;
                }
            },

            //有guid参数时新增删除
            getdelArr(allarr, delarr, newarr) {
                for (var i = 0; i < allarr.length; i++) {
                    if (allarr[i].all == true) {
                        if (allarr[i].guid != undefined) {
                            delarr.push(allarr[i].guid);
                        } else {
                            newarr.push(allarr[i]);
                        }
                    }
                }
                for (var i = 0; i < allarr.length; i++) {
                    for (var j = 0; j < newarr.length; j++) {
                        if (allarr[i].id == newarr[j].id) {
                            allarr.splice(i, 1);
                            newarr.splice(j, 1);
                            i = i - 1;
                        }
                    }
                }
                for (var i = 0; i < allarr.length; i++) {
                    allarr[i].id = i;
                }
            },
            //单个复选框点击
            checkClick(event, arr, str) {
                var ele = $(event.target);
                var id = ele.parents("tr").attr("itemId");
                var checknum = 0;
                if (arr[id].all == false) {
                    if (str == "newcomall") {
                        this.newcomall = false;
                    } else if (str == "comtradeall") {
                        this.comtradeall = false;
                    } else if (str == "comcostall") {
                        this.comcostall = false;
                    }
                } else {
                    if (str == "newcomall") {
                        $(".newcomdelbtn").attr("disabled", false);
                    } else if (str == "comtradeall") {
                        $(".comtradelbtn").attr("disabled", false);
                    } else if (str == "comcostall") {
                        $(".comcostdelbtn").attr("disabled", false);
                    } else {
                        $(".combindelbtn").attr("disabled", false);
                    }
                }
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].all == true) {
                        checknum++;
                    }
                }
                if (checknum < 1) {
                    if (str == "newcomall") {
                        $(".newcomdelbtn").attr("disabled", true);
                    } else if (str == "comtradeall") {
                        $(".comtradelbtn").attr("disabled", true);
                    } else if (str == "comcostall") {
                        $(".comcostdelbtn").attr("disabled", true);
                    } else {
                        $(".combindelbtn").attr("disabled", false);
                    }
                }
                if (checknum == arr.length) {
                    if (str == "newcomall") {
                        this.newcomall = true;
                    } else if (str == "comtradeall") {
                        this.comtradeall = true;
                    } else if (str == "comcostall") {
                        this.comcostall = true;
                    }
                }
            },

            handleTogglePortFlag(reqData, handleSuccess) {
                portApi.update(reqData)
                    .then(data => {
                        if (data.msg_no == 0) {
                            if ($.isFunction(handleSuccess)) {
                                handleSuccess();
                            }
                            _self.basicInfoFun();
                        }
                    })
                    .catch(err => {
                        $.showNotice("修改组合状态失败！", "error");
                    });
            },
            //组合表格部分操作
            //组合状态点击
            combinBtn(event) {
                var ele = $(event.target);
                var id = ele.parents("tr").attr("itemId");
                var flag = ele.parents("tr").find("button").hasClass("combinfail");
                var reqData = {
                    port_id: this.basicInfo[id].port_id,
                    name: this.basicInfo[id].name,
                    begin_date: this.basicInfo[id].date,
                    info: this.basicInfo[id].info,
                    amount: this.parseFloatEx(this.basicInfo[id].money) * 10000,
                    unit_nav: this.basicInfo[id].share,
                    currency: "CNY",
                    bench_id: this.basicInfo[id].bench_id,
                    manager_fee: this.basicInfo[id].manager_fee,
                    trustee_fee: this.basicInfo[id].trustee_fee,
                    port_flag: flag ? "1" : "2" /** 组合状态（0：废弃，1: 启用，2：停用每日核算）*/
                };
                this.handleTogglePortFlag(reqData);
            },

            //单个复选框
            combincheckClick(event) {
                var ele = $(event.target);
                var elep = ele.parents("tr") || ele.parent("tr");
                var id = elep.attr("itemId");
                var portid = elep.attr("portId");
                this.comInfo.id = portid;
                this.comInfo.name = this.basicInfo[id].name;
            },
            //删除
            combindelConfirm() {
                var delArr = [];
                for (var i = 0; i < this.basicInfo.length; i++) {
                    if (this.basicInfo[i].all == true) {
                        delArr.push(this.basicInfo[i].port_id);
                    }
                }
                portApi.batchDelete(delArr)
                    .then(data => {
                        if (data[0].msg_no == 0) {
                            _self.combinall = false;
                            $(".combindelbtn").attr("disabled", true);
                            $.showNotice("删除组合成功", "success");
                            _self.basicInfoFun();
                        }
                    })
                    .catch(err => {
                        $.showNotice("删除组合失败！", "error");
                    });
            },
            controlBtnDisabled(portfolios) {
                let checkedPortfolios = portfolios.filter(portfolio => portfolio.all);
                // 查找是否包含正在核算的组合
                let index = checkedPortfolios.findIndex(portfolio => portfolio.check_flag == "1");

                if (index > -1) {
                    $(".comtradebtn").attr("disabled", true);
                    $(".comcostbtn").attr("disabled", true);
                    $(".transbtn").attr("disabled", true);
                    $(".amendbtn").attr("disabled", true);
                    $(".combindelbtn").attr("disabled", true);
                    $(".portcheckbtn").attr("disabled", true);
                    $.showNotice("正在核算的组合不能进行操作", "warning");
                    return;
                }

                let checkedNum = checkedPortfolios.length;

                if (checkedNum == 0) {
                    $(".comtradebtn").attr("disabled", true);
                    $(".comcostbtn").attr("disabled", true);
                    $(".transbtn").attr("disabled", true);
                    $(".amendbtn").attr("disabled", true);
                    $(".combindelbtn").attr("disabled", true);
                    $(".portcheckbtn").attr("disabled", true);
                } else if (checkedNum == 1) {
                    $(".comtradebtn").attr("disabled", false);
                    $(".comcostbtn").attr("disabled", false);
                    $(".transbtn").attr("disabled", false);
                    $(".amendbtn").attr("disabled", false);
                    $(".combindelbtn").attr("disabled", false);
                    $(".portcheckbtn").attr("disabled", false);
                } else {
                    $(".comtradebtn").attr("disabled", true);
                    $(".comcostbtn").attr("disabled", true);
                    $(".transbtn").attr("disabled", true);
                    $(".amendbtn").attr("disabled", true);
                    $(".combindelbtn").attr("disabled", false);
                    $(".portcheckbtn").attr("disabled", false);
                }
            },

            //创建组合弹窗初始持仓表格部分操作

            // 新增一行初始持仓
            newcomAdd() {
                if (this.entryInfo[0] == undefined) {
                    this.addClick(this.entryinfoAdd, this.entryInfo);
                } else if (this.entryInfo[0].stock_code != "" && this.entryInfo[0].sign != "" && this.entryInfo[0].quantity != "") {
                    this.addClick(this.entryinfoAdd, this.entryInfo);
                } else {
                    $(".nofinish").modal();
                }
            },
            //删除
            newcomdelConfirm() {
                if ($("#new_com_title").text() == "创建组合") {
                    this.deleteClick(this.entryInfo);
                } else {
                    var delarr = [], portid, delnewarr = [];
                    portid = parseInt(this.comInfo.id);
                    this.getdelArr(this.entryInfo, delarr, delnewarr);
                    if (delarr.length > 0) {
                        positionApi.delete(portid, delarr)
                            .then(data => {
                                if (data[0].msg_no == 0) {
                                    _self.entryInfoFun(portid);
                                }
                            })
                            .catch(err => {
                                $.showNotice("删除持仓数据失败！", "error");
                            });
                    }
                }
            },
            //证券代码编辑
            codeClick() {
                this.editClick(event, "com_code_s", "com_code", this.entryInfo, "newcomall", "input");
            },

            //搜索框按键监听
            getkey(num, index, searchList) {
                //方向键上
                if (event.which == 38) {
                    event.preventDefault();
                    if (num > 1) {
                        index = (index + (num - 1)) % num;
                        if (searchList.children("li").eq(index).hasClass("active")) {
                            index--;
                        }
                        searchList.children("li").removeClass("active");
                        searchList.children("li").eq(index).addClass("active");
                        comindex = index;
                    }
                }
                //方向键下
                if (event.which == 40) {
                    event.preventDefault();
                    if (num > 1) {
                        index = index % num;
                        if (searchList.children("li").eq(index).hasClass("active")) {
                            index++;
                        }
                        searchList.children("li").removeClass("active");
                        searchList.children("li").eq(index).addClass("active");
                        index++;
                        comindex = index;
                    }
                }
                //回车
                if (event.which == 13) {
                    if (searchList.children("li.active").length > 0) {
                        this.searchResult(searchList.children("li.active")[0], searchList);
                        $(event.target).hide();
                        $(event.target).parents("tr").find("span").show();
                    }
                }
            },

            //选择搜索结果
            searchResult(el, searchList) {
                let $scope = this;
                searchList.slideUp(400);
                var sType = $(el).attr("s-type");
                var sCode = $(el).attr("s-code");
                var sName = $(el).attr("s-name");
                // 当前编辑的持仓顺序号
                var posIdx = this.comInfo.posid;

                //判断该券是否存在
                var existNum = this.entryInfo.findIndex(position =>
                    position.stock_code == sCode.substr(2) && position.stock_name != "");

                if (existNum > -1 && existNum != posIdx) {
                    this.entryInfo[$scope.comInfo.posid].stock_code = "";
                    $(".posititle").text("该券已存在，请直接修改");
                } else {
                    $(".posititle").text("");
                    this.entryInfo[posIdx].id = this.comInfo.posid;
                    this.entryInfo[posIdx].stock_code = sCode.substr(2);
                    this.entryInfo[posIdx].stock_name = sName;
                    this.entryInfo[posIdx].sign = "多头";
                    this.entryInfo[posIdx].all = true;
                    if (sType == "FUTURE") {
                        this.comSigns = [{
                            value: "1",
                            name: "多头"
                        }, {
                            value: "2",
                            name: "空头"
                        }];
                    } else if (sType == "OPTION") {
                        this.comSigns = [{
                            value: "1",
                            name: "多头"
                        }, {
                            value: "2",
                            name: "空头"
                        }];
                    } else {
                        this.comSigns = [{
                            value: "1",
                            name: "多头"
                        }];
                    }
                    for (var i = 0; i < this.market.length; i++) {
                        if (sCode.substr(0, 2) == this.market[i].shortcode) {
                            this.entryInfo[posIdx].market = this.market[i].name;
                        }
                    }
                }
            },
            //搜索框按键监听
            newcomkeyDown(event) {
                this.getkey(comnum, comindex, $(".newcomsearch"));
            },

            //持仓检索
            newcomKeyup(event) {
                var ele = $(event.target);
                var text = $.trim(ele.val());
                var id = ele.parents("tr").attr("itemId");
                this.comInfo.posid = id;
                if (text != combintext) {
                    this.positionlist = [];
                    combintext = text;
                    if (text.length > 0) {
                        $.ajax({
                            url: "/jax/searchtext/security/" + text,
                            type: "GET",
                            dataType: "json",
                            success: function(data) {
                                for (var i = 0; i < data.length; i++) {
                                    _self.$set(_self.positionlist, i, {
                                        code: data[i].code,
                                        name: data[i].name,
                                        type: data[i].type
                                    });
                                }
                                //显示搜索结果
                                $(".newcomsearch").slideDown(200);
                                var scrollnum = Math.round($(".new_com_t .table-panel-1").scrollTop() / 36);
                                $(".newcomsearch").css("top", 325 + 36 * (id - scrollnum));
                                comindex = 0;
                                comnum = data.length;
                            },
                            error: function() {
                                $.showNotice("检索失败！", "error");
                            }
                        });
                    }
                }
            },
            //选择搜索结果
            newcomliClick(event) {
                var ele = $(event.target);
                this.searchResult(ele, $(".newcomsearch"));
            },
            codeBlur() {
                this.editBlur(event, this.entryInfo);
                $(".newcomsearch").slideUp(400);
            },
            //多空方向编辑
            signClick(event) {
                this.editClick(event, "com_sign_s", "com_sign", this.entryInfo, "newcomall");
            },
            signBlur(event, item) {
                let ele = $(event.target);
                ele.parents("td").find("span").text(item.sign);
                ele.hide();
                ele.parents("tr").find("span.com_sign_s").show();
            },
            //持仓数量编辑
            quantityClick() {
                this.editClick(event, "com_quantity_s", "com_quantity", this.entryInfo, "newcomall", "input");
            },
            comquantityUp() {
                this.inpkeyUpNum(event, "com_quantity");
            },
            quantityBlur() {
                this.inpkeyNumBlur(event, "com_quantity", this.entryInfo);
            },

            //组合交易表格部分操作
            //获取组合交易表格单个交易费率
            getSingleFeeRate(id, str) {
                if (this.tradeInfo[id].stock_code && this.tradeInfo[id].market_id) {
                    switch (this.tradeInfo[id].sign) {
                        case "多头买入":
                            this.tradeInfo[id].type = "1";
                            break;
                        case "多头卖出":
                            this.tradeInfo[id].type = "2";
                            break;
                        case "空头买入":
                            this.tradeInfo[id].type = "1";
                            break;
                        case "空头卖出":
                            this.tradeInfo[id].type = "2";
                            break;
                        case "买入":
                            this.tradeInfo[id].type = "1";
                            break;
                        default:
                            this.tradeInfo[id].type = "2";
                    }
                    feeRateApi.getSingle(_self.comInfo.id, _self.tradeInfo[id].type, _self.tradeInfo[id].sec_kind, _self.tradeInfo[id].market_id)
                        .then(data => {
                            if (data) {
                                _self.tradeInfo[id].rate = data.RATE;
                            } else {
                                _self.tradeInfo[id].rate = 0;
                            }
                            if (str) {
                                _self.tradeInfo[id].cost = numberUtils.getDivision(((_self.tradeInfo[id].money.split(",").join("")) * _self.tradeInfo[id].rate).toFixed(2));
                            }
                        })
                        .catch(err => {
                            $.showNotice("获取单个交易费率失败！", "error");
                        });
                }
            },

            //证券代码
            tradecodeClick() {
                this.editClick(event, "trade_code_s", "trade_code", this.tradeInfo, "comtradeall", "input");
            },

            //搜索框按键监听
            tradegetkey(num, index, searchList) {
                //方向键上
                if (event.which == 38) {
                    event.preventDefault();
                    if (num > 1) {
                        index = (index + (num - 1)) % num;
                        if (searchList.children("li").eq(index).hasClass("active")) {
                            index--;
                        }
                        searchList.children("li").removeClass("active");
                        searchList.children("li").eq(index).addClass("active");
                        comindex = index;
                    }
                }
                //方向键下
                if (event.which == 40) {
                    event.preventDefault();
                    if (num > 1) {
                        index = index % num;
                        if (searchList.children("li").eq(index).hasClass("active")) {
                            index++;
                        }
                        searchList.children("li").removeClass("active");
                        searchList.children("li").eq(index).addClass("active");
                        index++;
                        comindex = index;
                    }
                }
                //回车
                if (event.which == 13) {
                    if (searchList.children("li.active").length > 0) {
                        this.tradesearchResult(searchList.children("li.active")[0], searchList);
                        $(event.target).hide();
                        $(event.target).parents("tr").find("span").show();
                    }
                }
            },

            //选择搜索结果
            tradesearchResult(el, searchList) {
                searchList.slideUp(400);
                var sType = $(el).attr("s-type");
                var sCode = $(el).attr("s-code");
                var sName = $(el).attr("s-name");
                var sAmount = $(el).attr("s-amount");
                this.tradeInfo[this.comInfo.posid].id = this.comInfo.posid;
                this.tradeInfo[this.comInfo.posid].stock_code = sCode.substr(2);
                this.tradeInfo[this.comInfo.posid].stock_name = sName;
                this.tradeInfo[this.comInfo.posid].sec_kind = sType;
                this.tradeInfo[this.comInfo.posid].positionflag = "多头";
                this.tradeInfo[this.comInfo.posid].all = true;
                this.tradeInfo[this.comInfo.posid].amount = parseFloat(sAmount);
                if (sType == "FUTURE") {
                    this.comsignInfo = [{
                        value: "1",
                        name: "多头买入"
                    }, {
                        value: "2",
                        name: "多头卖出"
                    }, {
                        value: "3",
                        name: "空头买入"
                    }, {
                        value: "4",
                        name: "空头卖出"
                    }];
                    this.tradeInfo[this.comInfo.posid].sign = "多头买入";
                } else {
                    this.comsignInfo = [{
                        value: "1",
                        name: "买入"
                    }, {
                        value: "2",
                        name: "卖出"
                    }];
                    this.tradeInfo[this.comInfo.posid].sign = "买入";
                }
                for (var i = 0; i < this.market.length; i++) {
                    if (sCode.substr(0, 2) == this.market[i].shortcode) {
                        this.tradeInfo[this.comInfo.posid].market = this.market[i].name;
                        this.tradeInfo[this.comInfo.posid].market_id = this.market[i].code;
                    }
                }
                //获取组合交易表格均价
                if (this.tradeInfo[this.comInfo.posid].stock_code && this.tradeInfo[this.comInfo.posid].market_id) {
                    tradeApi.getPrice(_self.tradeInfo[_self.comInfo.posid].stock_code,
                        _self.tradeInfo[_self.comInfo.posid].market_id,
                        _self.comInfo.date)
                        .then(data => {
                            if (data) {
                                _self.tradeInfo[_self.comInfo.posid].price = numberUtils.getDivision(data.price);
                                if (_self.tradeInfo[_self.comInfo.posid].quantity != "") {
                                    if (_self.tradeInfo[_self.comInfo.posid].amount) {
                                        _self.tradeInfo[_self.comInfo.posid].money = numberUtils.getDivision(((_self.tradeInfo[_self.comInfo.posid].price.split(",").join("")) * (_self.tradeInfo[_self.comInfo.posid].quantity.split(",").join("")) * _self.tradeInfo[_self.comInfo.posid].amount).toFixed(2));
                                    } else {
                                        _self.tradeInfo[_self.comInfo.posid].money = numberUtils.getDivision(((_self.tradeInfo[_self.comInfo.posid].price.split(",").join("")) * (_self.tradeInfo[_self.comInfo.posid].quantity.split(",").join(""))).toFixed(2));
                                    }
                                }
                            }
                        })
                        .catch(err => {
                            $.showNotice("无均价数据", "warning");
                        });
                }
                //获取组合交易表格单个交易费率
                if (this.tradeInfo[this.comInfo.posid].quantity != "") {
                    this.getSingleFeeRate(this.comInfo.posid, "price");
                } else {
                    this.getSingleFeeRate(this.comInfo.posid);
                }
            },

            //搜索框按键监听
            comtradekeyDown(event) {
                this.tradegetkey(comnum, comindex, $(".comtradesearch"));
            },

            //组合交易检索
            comtradeKeyup(event) {
                var ele = $(event.target);
                var text = $.trim(ele.val());
                var id = ele.parents("tr").attr("itemId");
                this.comInfo.posid = id;
                if (text != combintext) {
                    this.tradelist = [];
                    combintext = text;
                    if (text.length > 0) {
                        $.ajax({
                            url: "/jax/searchtext/security/" + text,
                            type: "GET",
                            dataType: "json",
                            success: function(data) {
                                for (var i = 0; i < data.length; i++) {
                                    _self.$set(_self.tradelist, i, {
                                        code: data[i].code,
                                        name: data[i].name,
                                        type: data[i].type,
                                        amount: data[i].unitAmount
                                    });
                                }
                                //显示搜索结果
                                $(".comtradesearch").slideDown(200);
                                var scrollnum = Math.round($(".com_wrap .table-panel-1").scrollTop() / 36);
                                $(".comtradesearch").css("top", 107 + 36 * (id - scrollnum));
                                comindex = 0;
                                comnum = data.length;
                            },
                            error: function() {
                                $.showNotice("检索失败！", "error");
                            }
                        });
                    }
                }
            },
            //选择搜索结果
            tradeliClick(event) {
                this.tradesearchResult(event.target, $(".comtradesearch"));
            },
            tradecodeBlur() {
                this.editBlur(event, this.tradeInfo);
                $(".comtradesearch").slideUp(400);
            },
            //交易类型
            tradesignClick(event) {
                var ele = $(event.target);
                var elep = ele.parents("tr") || ele.parent("tr");
                var id = elep.attr("itemId");
                var sec_kind = this.tradeInfo[id].sec_kind;
                for (var i = 0; i < this.tradeInfo.length; i++) {
                    if (i == id) {
                        this.tradeInfo[i].all = true;
                    } else {
                        this.tradeInfo[i].all = false;
                    }
                }
                if (sec_kind == "FUTURE") {
                    this.comsignInfo = [{
                        value: "1",
                        name: "多头买入"
                    }, {
                        value: "2",
                        name: "多头卖出"
                    }, {
                        value: "3",
                        name: "空头买入"
                    }, {
                        value: "4",
                        name: "空头卖出"
                    }];
                } else {
                    this.comsignInfo = [{
                        value: "1",
                        name: "买入"
                    }, {
                        value: "2",
                        name: "卖出"
                    }];
                }
                var text_s = elep.find(".trade_sign_s").text();
                elep.find(".trade_sign_s").hide();
                elep.find(".trade_sign").show().focus().val(text_s);
                $(".comtradelbtn").attr("disabled", false);
            },
            tradesignBlur(event) {
                var ele = $(event.target);
                var id = ele.parents("tr").attr("itemId");
                ele.hide();
                ele.parents("tr").find("span").show();
                if (this.tradeInfo[id].money != undefined) {
                    this.getSingleFeeRate(id, "type");
                }
            },
            //成交均价
            tradepriceClick() {
                this.editClick(event, "trade_price_s", "trade_price", this.tradeInfo, "comtradeall", "input");
            },
            tradepriceUp() {
                this.inpkeyUp(event, "trade_price");
            },
            tradepriceBlur(event) {
                var ele = $(event.target);
                var elep = ele.parents("tr").find(".trade_price");
                var id = ele.parents("tr").attr("itemId");
                var inp = elep.val();
                var name = ele.attr("itemName");
                if (Number(inp) === 0) {
                    elep.val("0.00");
                } else {
                    elep.val((parseFloat(inp) || "0").toFixed(2));
                }
                this.tradeInfo[id][name] = numberUtils.getDivision(elep.val());
                if (this.tradeInfo[id].amount) {
                    this.tradeInfo[id].money = numberUtils.getDivision(((this.tradeInfo[id].price.split(",").join("")) * (this.tradeInfo[id].quantity.split(",").join("")) * this.tradeInfo[id].amount).toFixed(2));
                } else {
                    this.tradeInfo[id].money = numberUtils.getDivision(((this.tradeInfo[id].price.split(",").join("")) * (this.tradeInfo[id].quantity.split(",").join(""))).toFixed(2));
                }
                this.getSingleFeeRate(id, "price");
                ele.hide();
                ele.parents("tr").find("span").show();
            },
            //成交数量
            tradequanClick() {
                this.editClick(event, "trade_quantity_s", "trade_quantity", this.tradeInfo, "comtradeall", "input");
            },
            tradequantityUp() {
                this.inpkeyUpNum(event, "trade_quantity");
            },
            tradequanBlur(event) {
                var ele = $(event.target);
                var elep = ele.parents("tr").find(".trade_quantity");
                var id = ele.parents("tr").attr("itemId");
                var inp = elep.val();
                var name = ele.attr("itemName");
                if (Number(inp) === 0) {
                    elep.val("0");
                } else {
                    elep.val(parseFloat(inp) || "0");
                }
                this.tradeInfo[id][name] = numberUtils.getDivision(elep.val());
                if (this.tradeInfo[id].amount) {
                    this.tradeInfo[id].money = numberUtils.getDivision(((this.tradeInfo[id].price.split(",").join("")) * (this.tradeInfo[id].quantity.split(",").join("")) * this.tradeInfo[id].amount).toFixed(2));
                } else {
                    this.tradeInfo[id].money = numberUtils.getDivision(((this.tradeInfo[id].price.split(",").join("")) * (this.tradeInfo[id].quantity.split(",").join("")) * 100).toFixed(2));
                }
                this.getSingleFeeRate(id, "quantity");
                ele.hide();
                ele.parents("tr").find("span").show();
            },
            //费用
            tradecostClick() {
                this.editClick(event, "trade_cost_s", "trade_cost", this.tradeInfo, "comtradeall", "input");
            },
            tradecostUp() {
                this.inpkeyUp(event, "trade_cost");
            },
            tradecostBlur() {
                this.inpkeyBlur(event, "trade_cost", this.tradeInfo);
            },
            //删除
            comtradedelConfirm() {
                var delarr = [], portid, delnewarr = [];
                portid = parseInt(this.comInfo.id);
                this.getdelArr(this.tradeInfo, delarr, delnewarr);
                if (delarr.length > 0) {
                    tradeApi.delete(portid, delarr)
                        .then(data => {
                            if (data[0].msg_no == 0) {
                                _self.tradeInfoFun(portid, _self.comInfo.date);
                            }
                        })
                        .catch(err => {
                            $.showNotice("删除组合交易数据失败！", "error");
                        });
                }
            },
            //新增
            comtradeAdd() {
                if ($(".tr_special td").hasClass("td_color")) {
                    if (this.tradeInfo[0] == undefined) {
                        this.addClick(this.tradeInfoAdd, this.tradeInfo);
                    } else if (this.tradeInfo[0].stock_code != "" && this.tradeInfo[0].sign != "" && this.tradeInfo[0].price != "" && this.tradeInfo[0].quantity != "" && this.tradeInfo[0].cost != "") {
                        this.addClick(this.tradeInfoAdd, this.tradeInfo);
                    } else {
                        $(".nofinish").modal();
                    }
                } else {
                    $(".nodate").modal();
                }
            },
            //删除
            comcostdelConfirm() {
                var delarr = [], portid, delnewarr = [];
                portid = parseInt(this.comInfo.id);
                this.getdelArr(this.allocationInfo, delarr, delnewarr);
                if (delarr.length > 0) {
                    allocationApi.delete(portid, delarr)
                        .then(data => {
                            if (data[0].msg_no == 0) {
                                _self.allocationInfoFun(portid, _self.comInfo.date);
                            }
                        })
                        .catch(err => {
                            $.showNotice("删除组合资金数据失败！", "error");
                        });
                }
            },

            costAdd() {
                if ($(".change_date td").hasClass("td_color")) {
                    if (this.allocationInfo[0] == undefined) {
                        this.addClick(this.allocationInfoAdd, this.allocationInfo);
                    } else if (this.allocationInfo[0].direction != "" && this.allocationInfo[0].cost != "") {
                        this.addClick(this.allocationInfoAdd, this.allocationInfo);
                    } else {
                        $(".nofinish").modal();
                    }
                } else {
                    $(".nodate").modal();
                }
            },
            //行编辑
            //变动方向
            costdirClick(event) {
                this.editClick(event, "cost_dir_s", "cost_dir", this.allocationInfo, "comcostall");
            },
            costdirBlur(event, item) {
                var ele = $(event.target);
                ele.parents("td").find("span").text(item.direction);
                ele.hide();
                ele.parents("tr").find("span").show();
            },
            //金额
            costmoneyClick() {
                this.editClick(event, "cost_money_s", "cost_money", this.allocationInfo, "comcostall", "input");
            },
            costmoneyUp() {
                this.inpkeyUp(event, "cost_money");
            },
            costmoneyBlur(event) {
                this.inpkeyBlur(event, "cost_money", this.allocationInfo);
            },

            /*搜索组合名称***************************************************/
            //搜索框按键监听
            portkey(num, index, searchList) {
                //方向键上
                if (event.which == 38) {
                    event.preventDefault();
                    if (num > 1) {
                        index = (index + (num - 1)) % num;
                        if (searchList.children("li").eq(index).hasClass("active")) {
                            index--;
                        }
                        searchList.children("li").removeClass("active");
                        searchList.children("li").eq(index).addClass("active");
                        comindex = index;
                    }
                }
                //方向键下
                if (event.which == 40) {
                    event.preventDefault();
                    if (num > 1) {
                        index = index % num;
                        if (searchList.children("li").eq(index).hasClass("active")) {
                            index++;
                        }
                        searchList.children("li").removeClass("active");
                        searchList.children("li").eq(index).addClass("active");
                        index++;
                        comindex = index;
                    }
                }
                //回车
                if (event.which == 13) {
                    if (searchList.children("li.active").length > 0) {
                        this.portsearchResult(searchList.children("li.active")[0], searchList);
                    }
                }
            },

            //选择搜索结果
            portsearchResult(el, searchList) {
                searchList.slideUp(400);
                var sCode = $(el).attr("s-code");
                var sName = $(el).attr("s-name");
                var splitCode = sCode.split("~");
                $(".portval").val(sName);
                portApi.getById(splitCode[1])
                    .then(data => {
                        //更新数据前先清除缓存
                        _self.$store.commit({
                            type: moduleName + "/setBasicInfo",
                            newVal: []
                        });
                        var currency = "人民币";
                        _self.$set(_self.basicInfo, 0, {
                            id: 0,
                            port_id: data.PORT_ID,
                            name: data.NAME,
                            date: data.BEGIN_DATE,
                            money: numberUtils.getDivision((data.AMOUNT / 10000).toFixed(2)),
                            share: data.UNIT_NAV.toFixed(4),
                            currency: currency,
                            creater: user_name,
                            checktime: data.CHECK_DATE,
                            time: data.MODI_DATE,
                            portflag: data.PORT_FLAG,
                            info: data.INFO,
                            bench_id: data.BENCH_ID,
                            manager_fee: data.MANAGER_FEE,
                            trustee_fee: data.TRUSTEE_FEE,
                            check_flag: data.CHECK_FLAG,
                            check_date: data.CHECK_DATE !== 0 ? data.CHECK_DATE : "--",
                            all: false
                        });
                    })
                    .catch(err => {
                        $.showNotice("获取组合信息失败！", "error");
                    });
            },

            //搜索框按键监听
            portkeyDown(event) {
                this.portkey(comnum, comindex, $(".portsearch"));
            },
            //点击搜索组合名称检索
            portKeyup(event) {
                var ele = $(event.target);
                var text = $.trim(ele.val());
                if (text !== "" && text !== combintext) {
                    this.portlist = [];
                    combintext = text;
                    $.ajax({
                        url: "/jax/searchtext/vprt/" + text,
                        type: "GET",
                        dataType: "json",
                        success: function(data) {
                            for (var i = 0; i < data.length; i++) {
                                _self.$set(_self.portlist, i, {
                                    code: data[i].code,
                                    name: data[i].name
                                });
                            }
                            //显示搜索结果
                            $(".portsearch").slideDown(200);

                            comindex = 0;
                            comnum = data.length;
                        },
                        error: function() {
                            $.showNotice("检索失败！", "error");
                        }
                    });
                }
                // 搜索框为空时展示所有组合
                if (text === "") {
                    this.combinall = false;
                    this.basicInfoFun();
                }
            },
            //选择搜索结果
            portliClick(event) {
                var ele = $(event.target);
                this.portsearchResult(ele, $(".portsearch"));
            },
            portBlur() {
                $(".portsearch").slideUp(400);
            },

            /*绑定模板下拉选择栏点击事件，加载模板列表*/
            loadMpList() {
                this.$store.dispatch(moduleName + "/loadMpList", this.comInfo.id);
            },
            /**
             * 控制进度条(最大到98%)
             *
             * @param barSelector 进度条元素选择器
             * @return interval id
             */
            handleProgressBar(barSelector) {
                let el = $(barSelector), _self = this;
                // 重置进度条进度
                this.progressVal = 0;
                if (el.length > 0) {
                    let increment = 10, interval;
                    return interval = setInterval(function() {
                        let valNow = _self.progressVal;
                        if (valNow > 60 && valNow < 70) {
                            increment /= 2;
                        } else if (valNow < 90 && valNow > 80) {
                            increment /= 2;
                        }
                        if ((valNow + increment) > 98) {
                            _self.progressVal = 98;
                            increment = 0;
                            clearInterval(interval);
                        } else {
                            _self.progressVal += increment;
                        }
                    }, 300);
                }
            },
            /**
             * 获取本地当天日期
             *
             * @return Number
             */
            getDateNow() {
                let now = new Date();
                // 将个位数的月份数转换成两位数字的字符串
                const convertToTwoDigitsNumberString = (numStr) => {
                    let num = parseInt(numStr);
                    if (num < 10 && num > 0) {
                        return "0" + numStr;
                    } else {
                        return numStr;
                    }
                };
                return parseInt(now.getFullYear()
                    + convertToTwoDigitsNumberString(now.getMonth() + 1)
                    + convertToTwoDigitsNumberString(now.getDate()));
            }
        }
    };
</script>

<style scoped="scoped">
    .portfolio_table .table-common, .com_trade_w .table-common,
    .com_cost_w .table-common, .transaction .table-common, .new_com_t .table-common {
        width: 100%;
    }

    @import './../../styles/default1/TabClass/portfolioAnalysis.css';
</style>