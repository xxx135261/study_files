/**
 * 文件名：[Sources]
 * 版权：〈Copyright © 2016 Hundsun Technologies Inc. All Rights Reserved〉
 * 描述：〈描述〉
 * 修改人：〈mengjq〉
 * 修改时间：2016/6/16
 * 跟踪单号：〈2016/6/16|16:34〉
 * 修改单号：〈2016/6/16|16:34〉
 * 修改内容：〈修改内容〉
 */
$.register_module({
    name: 'og.analytics.echart.Line',
    dependencies: ['og.analytics.Data'],
    obj: function () {
        var Line = function (config) {
            if (!config)return;
            var line = this;
            line.id = '#' + og.common.id('line');
            line.charts = config.config;
            line.source = config.source;
            init_data.call(line);
        }
        var init_data=function(){
            var line=this,lineNum = line.charts.lineNum;
                line.dataman= new og.analytics.Cells({source: line.source, single: {row: 0, col: lineNum}, format: 'EXPANDED'}, 'timeseries')
                .on('title', function (result) {
                    this.fire('title', result);
                }, line)
                .on('data', function (value) {
                    line.data = typeof value.v !== 'undefined' ? value.v : value;
                    line.data.num=line.charts.lineNum;
                    this.fire('data', line.data);
                }, line);
        }
        Line.prototype.kill = function () {
            try {
                var line = this;
                line.dataman.kill();
                line.fire('kill');
            }catch (error) {og.dev.warn('og.analytics.echart.Line.dataman.kill',error);}
        }
        Line.prototype.fire = (function () {
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
        Line.prototype.off = og.common.events.off;
        Line.prototype.on = og.common.events.on;
        return Line;
    }
})
