/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2017/1/12  mengjq  新增
 * ========    =======  ============================================
 */
$.register_module({
    name: 'og.views.analytics.griddata',
    dependencies: [],
    obj: function () {
        /**
         *
         * @param params
         */
        var loadGrid = function (params) {
            var module = params.name, requestParam = params.requestParam,
                otherParam = params.otherParam, noContainsRowOne = otherParam.noContainsRowOne,
                visibleArea = params.otherParam.visibleArea, isDepgraph = params.otherParam.isDepgraph,
                handleMeta = params.metaHandle,
                handleData = params.dataHandle;
            return new og.analytics.grid.data.Grid({
                source: og.api.rest.views.parame.xhrArgs(module, requestParam),
                config: {visibleArea: visibleArea}
            }).on('meta', function (metadata) {
                if (metadata && $.isFunction(handleMeta)) {
                    handleMeta($.makeArray([].fill.call({length: metadata.rows}, {})));
                }
            }, this).on('data', function (result) {
                if ($.isFunction(handleData)) {
                    if ($.isArray(result)) {
                        if (!isDepgraph) {
                            var resultNum = result.length, $resultJson = [];
                            if (resultNum == 4) {
                                var headers = result[0], fixed_Column = result[1], scroll_Column = result[2],
                                    data_row = result[3]['data-row'], fixedNum = 0, scrollNum = 0;
                                for (; fixedNum < fixed_Column.length; fixedNum++, scrollNum++) {
                                    var fixedData = fixed_Column[fixedNum].cells[0], _result = [], temp = {},
                                        fieldNum = 0;
                                    if (noContainsRowOne && fixedData['type'] === 'NODE' && fixed_Column[fixedNum]['data_row'] === 0) {
                                        continue;
                                    }
                                    temp['data_row'] = fixed_Column[fixedNum].data_row;
                                    temp[headers[fixedData.column]] = noContainsRowOne ? fixedData.value : fixedData.dataRow + fixedData.value;
                                    for (; scrollNum < scroll_Column.length;) {
                                        var _scrollData = scroll_Column[scrollNum].cells;
                                        var tempScrollData = new Array();
                                        for (var _$scrollDataNum = 0; _$scrollDataNum < _scrollData.length; _$scrollDataNum++) {
                                            var scrollData = _scrollData[_$scrollDataNum], _hvalue = scrollData['h'],
                                                scrollField = headers[scrollData.column];
                                            // temp['type'] = scrollData['type'];
                                            // temp['col'] = scrollData['col'];
                                            // temp['col_name'] = scrollData['col_name'];
                                            // temp['row'] = scrollData['row'];
                                            // temp['row_name'] = scrollData['row_name'];
                                            // if (temp.hasOwnProperty('h')) {
                                            //     temp['h']
                                            //     temp['' + scrollField + ''] = {'h': +_hvalue};
                                            // }
                                            // //判断当前对象是否已经加入到temp中
                                            // if (temp.hasOwnProperty(scrollField)) {
                                            //     temp['' + scrollField + ''] += ',' + _scrollData[_$scrollDataNum].value;
                                            // } else {
                                            //
                                            //     temp[scrollField] = _scrollData[_$scrollDataNum].value;
                                            // }
                                            tempScrollData.push(scrollData);
                                            // console.table(tempScrollData);
                                        }
                                        temp.scroll = tempScrollData;
                                        break;
                                    }
                                    (fixedData['nodeId']) ? temp['nodeId'] = fixedData['nodeId'] : '';
                                    (fixedData['positionId'] ? temp['positionId'] = fixedData['positionId'] : '');
                                    (fixedData['securityId']) ? temp['securityId'] = fixedData['securityId'] : '';
                                    $resultJson.push(temp);
                                    _result.push(fixedData['nodeId']);
                                    _result.push(fixedData['positionId']);
                                    _result.push(fixedData['securityId']);
                                }
                            }
                            // console.info("返回结果：");
                            // console.table($resultJson);
                            handleData(JSON.stringify($resultJson));
                        } else {
                            handleData(result);
                        }
                    }
                }
            }, this);
        }

        /**
         *
         */
        var loadLine = function (params) {
            var mobule = params.name, requestParam = params.requestParam, otherParam = params.otherParam,
                lineNum = otherParam.lineNum, titleHandle = params.titleHandle, dataHandle = params.dataHandle;
            if (og.analytics.echart) {
                var num = lineNum;
                while (num-- > 1) {
                    if (og.analytics.echart[mobule + "-" + num]) {
                        og.analytics.echart[mobule + "-" + num].kill();
                        og.analytics.echart[mobule + "-" + num] = null;
                    }
                }
            }
            for (var _lineNum = 1; _lineNum <= lineNum; _lineNum++) {
                og.analytics.echart[mobule + "-" + num] = new og.analytics.echart.Line({
                    source: og.api.rest.views.parame.xhrArgs(mobule, requestParam),
                    config: {lineNum: _lineNum}
                }).on('title', function (result) {
                    if ($.isFunction(titleHandle)) {
                        titleHandle(result);
                    }
                }, this).on('data', function (result) {
                    if ($.isFunction(dataHandle)) {
                        dataHandle(result);
                    }
                }, this);
            }
        }

        return {
            loadGridData: function (params) {
                return loadGrid(params);
            },
            loadChartData: function (params) {
                return loadLine(params);
            }
        }
    }
});