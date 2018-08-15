/**
 * Created by mengjq on 2016/5/8.
 * @author : mengjq
 * @date :  2016/5/8
 */

$.register_module({
    name: 'og.analytics.realtime.stock',
    dependencies: ['og.analytics.NewData'],
    obj: function () {
        var history = [], historyData = [], placeholder = '-', echart = {}, avg;

        /**
         * 涨跌幅，今日最高|最低价格的涨幅比
         * 均线(昨日收盘价)
         * @param result
         */
        function avgLine(result) {
            var startPoint, lastData, idx = 0;
            if (result && result.averageline && result.lastdata) {
                startPoint = result.startPoint, avg = Number(result.averageline), lastData = result.lastdata, idx = 0;
            }
            if (startPoint > 1) {
                var i = startPoint;
                while (i-- > 0) {
                    historyData[idx] = [idx, placeholder];
                    idx++;
                }
            }
            //历史数据
            if (lastData && lastData.length > 0) {
                lastData.forEach(function (value, index) {
                    historyData.push([startPoint + index, value]);
                });
            }
            if (history && history.length == 0) {
                Array.prototype.push.apply(history, lastData);
                echart.setOption({
                    series: [{
                        data: historyData,
                        markLine: {
                            data: [
                                [{
                                    coord: [0, avg]
                                }, {
                                    coord: [240, avg]
                                }]
                            ]
                        }
                    }]
                });
            }
            var hisLastData = !!(history && history.length > 0) ? history : lastData;
            var _maxListData = Number(Math.max.apply(Math, hisLastData));//max-value
            var _minListData = Number(Math.min.apply(Math, hisLastData));//min-value
            var min, max;
            /*if (_maxListData == _minListData) {
                _maxListData < avg ? _maxListData = avg + mindiff : _minListData = avg - maxdiff;
            } else {
                maxdiff < mindiff ? _maxListData = avg + mindiff : _minListData = avg - maxdiff;
            }*/
            if (_maxListData == '-Infinity') {
                _maxListData = avg * 1.1;
            }
            if (_minListData == '-Infinity') {
                _minListData = avg * 0.9
            }
            var maxdiff = parseFloat(Math.abs(_maxListData - avg).toFixed(4));
            var mindiff = parseFloat(Math.abs(avg - _minListData).toFixed(4));
            // 偏离均线的最大百分比
            var benchRate = (maxdiff > mindiff ? maxdiff : mindiff) / avg;
            // Y轴坐标范围以均线值的正负百分之十为限
            var rate = (benchRate * 1.2) > 0.1 ? 0.1 : (benchRate * 1.2);
            if (_maxListData > avg || _minListData < avg) {
                max = (avg * (1 + rate) < _maxListData ? _maxListData : (avg * (1 + rate)));
                min = (avg * (1 - rate) > _minListData ? _minListData : (avg * (1 - rate)));
            } else {
                if (avg === 0) {
                    max = 0.5;
                    min = -0.5;
                } else {
                    max = avg * 1.05;
                    min = avg * 0.95;
                }
            }
            echart.setOption({
                yAxis: [{
                    //增加根据昨日收盘价算出今天最大涨幅及跌幅
                    max: max,
                    min: min,
                    interval: (max - min) / 8,
                    axisLabel: {
                        textStyle: {
                            color: function (val) {
                                if (val) {
                                    var styleVal = Number(Number(val).toFixed(5)) || 0;
                                    return styleVal === avg ? 'black' : styleVal > avg ? 'red' : styleVal < avg ? 'green' : 'black';
                                }
                            }
                        }
                    }
                }, {
                    max: max / avg - 1,
                    min: min / avg - 1,
                    interval: (max - min) / avg / 8
                }],
                tooltip: {
                    formatter: function (params) {
                        // 当前时间（X轴的axis label）
                        var res = params[0].axisValueLabel;
                        for (var i = 0; i < params.length; i++) {
                            if (params[i].seriesName == '单位净值' && params[i].value !== '-') {
                                res += '<br/>' + params[i].seriesName;
                                res += ' : ' + params[i].value[1];
                                res += '<br/>收益率';
                                res += ' : ' + Number((params[i].value[1] / avg - 1) * 100).toFixed(2) + '%';
                            }
                        }
                        return res;
                    }
                }
            });
        }

        /**
         * 实时数据推送
         * @param result
         */
        function realtimeData(result) {
            var listData = result.ListData[0], listTime = result.ListTime[0];
            historyData[listTime] = [listTime, listData]; //存入历史记录
            var _data = Object.clone(echart.getOption().series[0]['data']);
            _data[listTime] = [listTime, listData];
            echart.setOption({
                series: [{
                    data: _data
                }]
            });
        }

        /**
         * 实时加载实时净值走势数据
         * @param params
         */
        var loadStock = function (parameter) {
            var mobule = parameter.name, requestParam = parameter.requestParam, cb = parameter.otherParam.handleDataLoaded;
            echart = parameter.otherParam.plugin;
            return new og.analytics.NewData(og.api.rest.views.parame.xhrArgs(mobule, requestParam), {
                bypass: false,
                label: 'grid'
            }).on('averageline', function (result) { //均线
                avgLine(result);
                // 用于首次获取到实时走势数据时做一些处理
                if (cb && typeof cb == 'function') {
                    cb();
                }
            }, this)
                .on('data', function (result) {
                    realtimeData(result);
                    avgLine(history);
                }, this);
        }
        return {
            loadStockData: function (parameter) {
                history = [], historyData = [], avg = 0;
                return loadStock(parameter);
            }
        }
    }
});