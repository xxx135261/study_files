/**
 * Created by yujie on 2016/6/14.
 */
$.register_module({
    name: 'og.analytics.data.Chart',
    dependencies : [],
    obj: function () {
        var module = this;
        var Chart = function (scope, requestNum) {
            var chart = this;
            chart.portvalue = {}, chart.indexvalue = {};
            chart.scope = scope;
            chartData.call(chart, scope.inputParam, requestNum);
        };
        var chartData = function(inputParam, requestNum) {
            var data = this, api = og.api.rest.views, ROOT = 'rootNode', SETS = 'columnSets', ROWS = 'rowCount', meta = {}, viewport_version,
                fixed_set = {portfolio: 'Portfolio', primitives: 'Primitives'}, graph_id, loading_viewport_id = false, viewport={}, promise, cellNum=0;
            viewport.cells = ['0,0,CELL', ''];
            var structure_setup = function () {
                api.grid.structure.get(inputParam).pipe(structure_handler);
            };
            var structure_handler = function (result) {
                meta.columns={};
                meta.data_rows = result.data[ROOT] ? result.data[ROOT][1] + 1 : result.data[ROWS];
                meta.structure = result.data[ROOT] || [];
                meta.columns.fixed = [{name: fixed_set['portfolio'], columns: result.data[SETS][0].columns}];
                meta.columns.scroll = result.data[SETS].slice(1);
                data.connection = {grid_type: inputParam.grid_type, view_id: inputParam.view_id
                    , graph_id: '', structure: result};
                viewport.cells[1] = '0,' + (++cellNum) + ',EXPANDED';
                data_setup();
            };
            var data_setup = function() {
                (promise = api.grid.viewports.put({view_id: inputParam.view_id, grid_type: inputParam.grid_type, graph_id: graph_id,
                        loading: function () {loading_viewport_id = true; }, rows: viewport.rows, cols: viewport.cols,
                        cells: viewport.cells, format: viewport.format, log: viewport.log})
                ).pipe(function(result) {
                    loading_viewport_id = false;
                    viewport_version = promise.id;
                    return api.grid.viewports.get({view_id: inputParam.view_id, grid_type: inputParam.grid_type, graph_id: graph_id, //dry: true,
                        viewport_id: result.meta.id});
                }).pipe(data_handler);
            };
            var data_handler = function() {
                var timeout = null, rate = 500, last = +new Date(), current, delta;
                var handler = function (result) {
                    if (!result || result.error) {// do not kill connection even if there is an error, just warn
                        return og.dev.warn(data.prefix + (result && result.message || 'reset connection'));
                    }
                    if (result.data && result.data.version === viewport_version && cellNum < requestNum) {
                        if(!(data.scope.basicInfo && data.scope.basicInfo.benchmark && data.scope.basicInfo.benchmark != '')) {
                            data_setup();
                            return;
                        }
                        fire('portdata', result.data.data);
                        viewport.cells[1] = '0,' + (++cellNum) + ',EXPANDED';
                        data_setup();
                    }else if (result.data && result.data.version === viewport_version && cellNum >= requestNum) {
                        fire('indexdata', result.data.data);
                    }
                };
                return function (result) {
                    clearTimeout(timeout);
                    if (!inputParam.view_id) {// connection is dead
                        return;
                    }
                    if ((delta = (current = +new Date()) - last) >= rate) {
                        last = current;
                        return handler(result);
                    }
                    timeout = setTimeout(data_handler.partial(result), rate - delta);
                };
            }();
            var fire=(function () {
                var fatal_fired = false;
                return function (type) {
                    var args = Array.prototype.slice.call(arguments);
                    try {
                        if (type === 'fatal' && !fatal_fired) { // fire only once ever
                            fatal_fired = true;
                            return og.common.events.fire.apply(data, args);
                        }
                        og.common.events.fire.apply(data, args);
                    } catch (error) {
                        og.dev.warn(this.prefix + 'a ' + type + ' handler threw ', error);
                    }
                };
            })();
            data.on('portdata', function(result) {
                var time = new Array(result[1].v.timeseries.data.length), value = new Array(result[1].v.timeseries.data.length), timeseries_data;
                timeseries_data = result[1].v.timeseries.data;
                for(var timeseries_num = 0; timeseries_num < timeseries_data.length; timeseries_num++) {
                    time[timeseries_num] = new Date(timeseries_data[timeseries_num][0]).Format("yyyyMMdd");
                    value[timeseries_num] = timeseries_data[timeseries_num][1];
                };
                data.time = time;
                data.portvalue.name = result[0].v.name;
                data.portvalue.value = value;
            }, data);
            data.on('indexdata', function(result) {
                    var data = this, returnData = {}, value = new Array(result[1].v.timeseries.data.length), timeseries_data;
                    timeseries_data = result[1].v.timeseries.data;
                    for(var timeseries_num = 0; timeseries_num < timeseries_data.length; timeseries_num++) {
                        value[timeseries_num] = timeseries_data[timeseries_num][1];
                    };
                    data.indexvalue.name = result[0].v.name;
                    data.indexvalue.value = value;
                    //loadChart.call(data, data.time, data.portvalue, data.indexvalue);
                    returnData.time = data.time;
                    returnData.portvalue = data.portvalue;
                    returnData.indexvalue = data.indexvalue;
                    this.fire('data', returnData);
                }, data);
            structure_setup();
        };
        Chart.prototype.off = og.common.events.off;
        Chart.prototype.on = og.common.events.on;
        Date.prototype.Format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };
        Chart.prototype.fire = (function () {
            var fatal_fired = false;
            return function (type) {
                var args = Array.prototype.slice.call(arguments);
                try {
                    if (type === 'fatal' && !fatal_fired) { // fire only once ever
                        fatal_fired = true;
                        return og.common.events.fire.apply(this, args);
                    }
                    og.common.events.fire.apply(this, args);
                } catch (error) {
                    og.dev.warn(this.prefix + 'a ' + type + ' handler threw ', error);
                }
            };
        })();
        return Chart;
    }
});
