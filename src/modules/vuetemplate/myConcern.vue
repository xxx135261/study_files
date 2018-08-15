<template src="../html/myConcern.html"></template>

<script>
    import {priceColorFilter} from '../../scripts/core/util/com.hundsun.pas.common.util.filters';
    import './components/commonSearch';

    // 当前模块对应的状态管理模块路径名
    const moduleName = 'myConcern';

    var utils = $.pasUtils();
    var common = $.common();
    var _self;

    export default {
        name: "myConcern",
        data() {
            return {
                searchResult: [],
                // 隐藏“无结果”提示文字
                notHaveTitle: false,
                basicInfoGrid: null,
                inputValue: {length: 0},
                inputType: 'myConcern',
                loading: null,
                /*下拉框cellmenu对象*/
                cellmenu: null,
                /*搜索框按键监听参数*/
                index: -1,
                num: 0
            }
        },
        computed: {
            basicInfo: () => {
                return _self.$store.state.myConcern.basicInfo;
            }
        },
        created() {
            _self = this;
        },
        mounted() {
            this.loadData();
        },
        destroyed() {
            this.destroy();
            $('.OG-cell-options').remove();
        },
        methods: {
            loadData() {
                this.loading = true;
                if (this.basicInfoGrid) {
                    this.basicInfoGrid.kill();
                }
                this.basicInfoFun("AgPrt~UserFocused");
            },
            destroy() {
                if (this.basicInfoGrid) {
                    this.basicInfoGrid.kill();
                }
            },
            basicInfoFun(nodeId) {
                this.basicInfoGrid = og.views.analytics.griddata.loadGridData({
                    name: og.api.rest.views.parame.myConcern.basicInfo,
                    requestParam: {
                        portfolio: nodeId
                    },
                    otherParam: {
                        isDepgraph: true,
                        visibleArea: utils.getVisibleArea('.concern_table')
                    },
                    metaHandle: function (metadata) {
                        if (!_self.basicInfo || _self.basicInfo.length == 0) {
                            _self.$store.commit({
                                type: moduleName + '/initBasicInfo',
                                newVal: metadata
                            });
                            // 因为第一行组合层的数据是不展示的所以去掉一行
                            _self.basicInfo.splice(metadata.length - 1, 1);
                        }
                    },
                    dataHandle: this.handleBasicInfoData
                });
                this.cellmenu = new com.hundsun.pas.common.gadgets.CellMenu('table[tabid="myConcernTable"] tr td[cell]', this.basicInfoGrid);
            },
            handleBasicInfoData(result) {
                if ($.isArray(result)) {
                    //读取Name行对应的Default行记录数据
                    let nameValue = result[1], targetValue = result[2];
                    //遍历数据条数
                    for (let cellNum = 1; cellNum < targetValue.length; cellNum++) {
                        let cellValue = targetValue[cellNum].cells, detail = {}, num = targetValue[cellNum].data_row;
                        detail.name = nameValue[cellNum].cells[0].value;
                        detail.securityId = nameValue[cellNum].cells[0].securityId;
                        //遍历数据列数
                        for (let cellValNum = 0; cellValNum < cellValue.length; cellValNum++) {
                            let colName = cellValue[cellValNum].col_name, value = cellValue[cellValNum],
                                h = value.h;
                            detail[colName] = value;
                            detail[colName].h = h;
                        }
                        //判断涨跌幅如果没有值就不加小括号
                        let p_fluc = detail['Price Fluctuation'].value,
                            p_range = detail['Price Fluctuation Range'].value;
                        if (p_fluc && p_range) {
                            detail['Price Fluctuation'].value = p_fluc + '（' + p_range + '）';
                        } else {
                            detail['Price Fluctuation'].value = p_fluc + p_range;
                        }
                        this.$set(this.basicInfo, num - 1, detail);
                    }
                    this.$nextTick(function () {
                        if (_self.cellmenu) {
                            // 更新cellmenu绑定的表格
                            _self.cellmenu.updateGrid();
                        }
                    });
                }
                this.loading = false;
            },
            /*打开表格中的新增行*/
            openSearchRow() {
                $(this.$el).find('button.add-search-row').addClass('disabled');
                $('tr.myconcern_append').slideDown(300);
            },
            /*关闭表格中的新增行*/
            closeSearchRow() {
                $(this.$el).find('button.add-search-row').removeClass('disabled');
                $('tr.myconcern_append').slideUp(300);
                this.clearSearchRow();
            },
            deleteData(event) {
                var $target = $(event.target);
                //获取当前行securityId
                var id = $target.attr('itemScode');
                if (id.indexOf('~') < 0) {
                    return;
                }
                var idData = id.split('~');

                //判断拿到的新数据里有没有当前id，有的话就删掉相应数据并更新数据
                function getId(arr, id) {
                    for (var i = 0; i < arr.length; i++) {
                        if (id == arr[i].securityId) {
                            arr.splice(i, 1);
                        }
                    }
                    return arr;
                }

                var scope = this;
                //将当前删除行的id传给后台，用来删除后台数据
                utils.deleteSecurity(idData, "myConcerns", function (data) {
                    let result = data.data;
                    if (!data.error && result.msg_no == 0) {
                        setTimeout(function () {
                            getId(scope.basicInfo, id);
                            $.showNotice('移除成功！', 'success');
                        }, 300);
                    } else {
                        $.showNotice('移除失败！', 'error');
                    }
                });
            },
            addVisit(event) {
                var $target = $(event.target);
                var sCode = $target.attr('itemScode');
                var sName = $target.html().replace(/&nbsp;/g, '');
                if (!sCode) {
                    return;
                } else {
                    common.reqLastVisit(sCode, sName, 2, 'recent', this.$router);
                }
            },
            // 输入框失去焦点时隐藏查询列表
            handleInputBlur() {
                setTimeout(function () {
                    $('.myconcern_append .search-list').hide();
                }, 200);
            },
            // 输入框获得焦点显示查询列表
            handleInputClick(event) {
                $('.myconcern_append .search-ipt').addClass("focus").select();
                if ($.trim($('.myconcern_append .search-ipt').val()).length > 0) {
                    this.doSearch($.trim($('.myconcern_append .search-ipt').val()));
                }
            },
            // 进行搜索
            doSearch(keyword) {
                var scope = this;
                og.api.rest.searchtext.get({
                    searchtext: keyword,
                    stype: "0"
                }).pipe(function (result) {
                        //数据绑定
                        var result = result.data;
                        var searchRow_w = $('.myconcern_append #search-row .add_in').width();
                        if ($.isArray(result)) {
                            scope.searchResult = result[0];
                        }
                        //没有搜索结果时的提示
                        scope.notHaveTitle = scope.searchResult.length === 0 ? true && $('.tit_w').css({
                            "width": searchRow_w,
                            "background": "#eee"
                        }) : false;
                        //显示搜索结果
                        $('.myconcern_append .search-list').slideDown(200);
                        scope.index = -1;
                        scope.num = $('.myconcern_append .search-list').children("li:visible").length;
                    }
                );
            },
            // 搜索框按键监听
            searchKeydown(event) {
                //方向键上
                if (event.which == 38) {
                    event.preventDefault();
                    if (this.num > 1) {
                        this.index = (this.index + this.num - 1) % this.num;
                        if (!$('.myconcern_append .search-list').children("li").eq(this.index).hasClass("title")) {
                            $('.myconcern_append .search-list').children("li").removeClass("active");
                            $('.myconcern_append .search-list').children("li").eq(this.index).addClass("active");
                        }
                    }
                }
                //方向键下
                if (event.which == 40) {
                    event.preventDefault();
                    if (this.num > 1) {
                        this.index = (this.index + this.num + 1) % this.num;
                        if (!$('.myconcern_append .search-list').children("li").eq(this.index).hasClass("title")) {
                            $('.myconcern_append .search-list').children("li").removeClass("active");
                            $('.myconcern_append .search-list').children("li").eq(this.index).addClass("active");
                        }
                    }
                }
                //回车
                if (event.which == 13) {
                    if ($('.myconcern_append .search-list').children("li.active").length > 0) {
                        this.selectResult($('.myconcern_append .search-list').children("li.active")[0]);
                    }
                }
            },
            selectResult(element) {
                var el = $(element);
                var sCode = el.attr("s-code");
                var sName = el.attr("s-name");
                this.myConcernAddFnc(sCode, sName);
                $('.myconcern_append .search-list').slideUp(200);
                this.clearSearchRow();
            },
            // 处理选择搜索结果/我的关注
            myConcernAddFnc(sCode, sName) {
                var data = sCode.split('~');
                if (sCode.indexOf('~') != -1 && data) {
                    //组合
                    data[2] = sName, data[3] = '1';
                } else {
                    //股票
                    data[0] = "FKSec";
                    data[1] = sCode.substr(2) + sCode.substring(0, 2);
                    //添加我的关注
                    $.pasUtils().addLastVisit(data, "myConcerns", function (result) {
                        let data = result.data;
                        if (!result.error && data.msg_no == 0) {
                            $.showNotice("添加我的关注成功！");
                        } else {
                            $.showNotice("添加我的关注失败！", 'error');
                        }
                    });
                }
            },
            /*监听输入框输入*/
            watchInputValue(event) {
                var keyword = $.trim(event.target.value);
                if (keyword.length > 0) {
                    this.doSearch(keyword);
                } else {
                    $('.myconcern_append .search-list').slideUp(200);
                }
            },
            /*清除输入框内容、查询结果等*/
            clearSearchRow() {
                // 清空输入框内容
                $('.myconcern_append .search-ipt').val("");
                // 清空查询结果
                this.searchResult = [];
                // 隐藏“无结果”提示文字
                this.notHaveTitle = false;
                this.index = -1;
                this.num = 0;
            },
            /*设置表格单元格类名*/
            cellClassName(rowData, rowIndex, column, columnIndex) {
                if (columnIndex > 0 && columnIndex < 5) {
                    let cell = rowData['Price Fluctuation'], val;
                    if (cell) {
                        val = rowData['Price Fluctuation'].value;
                    }
                    return priceColorFilter(val);
                }
            }
        }
    }

</script>

<style scoped>
    @import "./../../styles/default1/TabClass/myConcern.css";
</style>