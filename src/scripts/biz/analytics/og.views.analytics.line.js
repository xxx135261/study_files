/**
 * 文件名：[文件名]
 * 版权：〈版权〉
 * 描述：〈描述〉
 * 修改人：〈修改人〉
 * 修改时间：YYYY-MM-DD
 * 跟踪单号：〈跟踪单号〉
 * 修改单号：〈修改单号〉
 * 修改内容：
 *  1、优化请求加载数据函数，
 */
$.register_module({
    name: "og.views.analytics.line",
    dependencies: [],
    obj: function () {
        var RequestChartData;
        return RequestChartData = {
            loadData: function (params) {
                var mobule = params.name, clazz = mobule[0], attribute = mobule[1], requestParam = params.requestParam,
                    otherParam = params.otherParam, scope = otherParam.scope, lineNum = otherParam.lineNum, titleHandle = params.titleHandle, dataHandle = params.dataHandle;
                if (og.analytics.echart) {
                    var num = lineNum;
                    while (num-- > 1) {
                        if (og.analytics.echart[attribute + "-" + num]) {
                            og.analytics.echart[attribute + "-" + num].kill();
                            og.analytics.echart[attribute + "-" + num] = null;
                        }
                    }
                }
                for (var _lineNum = 1; _lineNum <= lineNum; _lineNum++) {
                    og.analytics.echart[attribute + "-" + _lineNum] = new og.analytics.echart.Line({
                        source: og.api.rest.views.parame.xhrArgs(clazz, attribute, requestParam),
                        config: {scope: scope, lineNum: _lineNum}
                    }).on('title', function (result) {
                        if (angular.isFunction(titleHandle)) {
                            titleHandle.call(this, result);
                        }
                    }, scope).on('data', function (result) {
                        if (angular.isFunction(dataHandle)) {
                            dataHandle.call(this, result);
                        }
                    }, scope);
                }
            },
            loading: function (params) {
                if (params == "preparing") {
                    $.showOverlay();
                } else if (params == "remove") {
                    $.unbindOverlay();
                }
            },
            yielding: function (params, state) {
                // if (angular.isArray(params)) {
                //     var clazz = params[0], attribute = params[1];
                //     var dataman = og.analytics.grid[clazz + attribute].dataman, val = dataman.connection.view_id;
                //     if (val && val.indexOf(dataman.pools())) {
                //         og.api.rest.views.status.pause_or_resume({view_id: val, state: state ? "pause" : "resume"});
                //     }
                // }
            },
            destroy: function (params) {
                // if (angular.isArray(params)) {
                //     var clazz = params[0], attribute = params[1];
                //     if (og.analytics.grid[clazz + attribute]) {
                //         og.analytics.grid[clazz + attribute].kill();
                //         og.analytics.grid[clazz + attribute] = null;
                //     }
                // }
            }
        }
    }
});