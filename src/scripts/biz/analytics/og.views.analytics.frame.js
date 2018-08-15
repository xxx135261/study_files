/**
 * Created by yujie10559 on 2016/8/3.
 */
$.register_module({
    name: 'og.views.analytics.frame',
    dependencies: [],
    obj: function () {
        return {
            loadData: function (params) {
                var module = params.name, /*clazz = module[0], attribute = module[1],*/ requestParam = params.requestParam,
                    otherParam = params.otherParam, noContainsRowOne = otherParam.noContainsRowOne/*, scope = params.otherParam.scope*/,
                    elements = params.otherParam.elements, handleMeta = params.metaHandle, handleData = params.dataHandle;
                if (og.analytics.grid[module.version]) {
                    og.analytics.grid[module.version].kill();
                    og.analytics.grid[module.version] = null;
                }
                og.analytics.grid[module.version] = new og.analytics.grid.data.Grid({
                    source: og.api.rest.views.parame.xhrArgs(module, requestParam),
                    config: {elements: elements}
                }).on('meta', function (metadata) {
                    if (metadata && angular.isFunction(handleMeta)) {
                        handleMeta($.makeArray([].fill.call({length: metadata.rows}, {})));
                    }
                }, this).on('data', function (result) {
                    if (angular.isFunction(handleData)) {
                        if (angular.isArray(result)) {
                            var resultNum = result.length, $resultJson = [];
                            if (resultNum == 4) {
                                var headers = result[0], fixed_Column = result[1], scroll_Column = result[2], data_row = result[3]['data-row'], fixedNum = 0, scrollNum = 0;
                                for (; fixedNum < fixed_Column.length; fixedNum++, scrollNum++) {
                                    var fixedData = fixed_Column[fixedNum].cells[0], _result = [], temp = {}, fieldNum = 0;
                                    if (noContainsRowOne && fixedData['type'] === 'NODE' && fixed_Column[fixedNum]['data_row'] === 0) {
                                        continue;
                                    }
                                    temp['data_row'] = fixed_Column[fixedNum].data_row;
                                    temp[headers[fieldNum]] = noContainsRowOne ? fixedData.value : fixedData.dataRow + fixedData.value;
                                    for (; scrollNum < scroll_Column.length;) {
                                        var _scrollData = scroll_Column[scrollNum].cells;
                                        for (var _$scrollDataNum = 0; _$scrollDataNum < _scrollData.length; _$scrollDataNum++) {
                                            var _hvalue = _scrollData[_$scrollDataNum]['h'];
                                            temp[headers[++fieldNum]] = _scrollData[_$scrollDataNum].value;
                                            if (_hvalue) {
                                                temp['h'] = _hvalue;
                                            }
                                        }
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
                            handleData(JSON.stringify($resultJson));
                        }
                    }
                }, this);
            },
            loading: function (params) {
                if (params == "preparing") {
                    $.showOverlay();
                } else if (params == "remove") {
                    $.unbindOverlay();
                }
            },
            status: {
                pause: function (params) {
                    if (angular.isArray(params)) {
                        var clazz = params[0], attribute = params[1];
                        var dataman = og.analytics.grid[clazz + attribute].dataman, val = dataman.connection.view_id;
                        if (val && val.indexOf(dataman.pools())) {
                            og.api.rest.views.status.pause_or_resume({view_id: val, state: "pause"});
                        }
                    }
                },
                resume: function (params) {
                    if (angular.isArray(params)) {
                        var clazz = params[0], attribute = params[1];
                        var dataman = og.analytics.grid[clazz + attribute].dataman, val = dataman.connection.view_id;
                        if (val && val.indexOf(dataman.pools())) {
                            og.api.rest.views.status.pause_or_resume({view_id: val, state: "resume"});
                        }
                    }
                }
            },
            destroy: function (params) {
                if (angular.isArray(params)) {
                    var clazz = params[0], attribute = params[1];
                    if (og.analytics.grid[clazz + attribute]) {
                        og.analytics.grid[clazz + attribute].kill();
                        og.analytics.grid[clazz + attribute] = null;
                    }
                }
            },
            scrollLoadData: function (params, id) {
                if (angular.isArray(params)) {
                    var clazz = params[0], attribute = params[1];
                    if (og.analytics.grid[clazz + attribute]) {
                        og.analytics.grid[clazz + attribute].scrollLoadData(id);
                    }
                }
            }

        }
    }
});