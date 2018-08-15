/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2017/11/17  rencc19758  新增
 * ========    =======  ============================================
*/
import Vue from 'vue';
import echarts from 'echarts';
import '@/scripts/base/echarts/theme/macarons.js';


Vue.directive('echarts', {
    inserted: function (el, binding, vnode) {
        var element = $(el);
        // component's scope
        var scope = vnode.context;
        // collection of attributes on the node
        var attrs = vnode.data.attrs;

        scope.showChartQuery = true;

        // 初始化chart
        var chart = echarts.init((element[0]), 'macarons');
        // 窗口大小变化调整图表
        $(window).on('resize', function () {
            // 组件是否为激活状态
            var activated = scope.activated;
            // 组件未定义activated属性或者组件处于激活状态时才触发图表resize
            if (typeof activated == 'undefined' || activated) {
                setTimeout(chart.resize, 0);
            }
        });
        // 加载前提示信息
        chart.showLoading({
            effect: 'bubble',
            textStyle: {
                fontSize: 20
            }
        });
        chart.hideLoading();
        var options = scope[attrs.config];
        if ((options && !options.series) || options.series.length == 0) {
            element[0].innerHTML = '<div class="info" style="padding-top: 90px;text-align: center"><i class="fa fa-file-text-o" style="font-size: 60px;color: #ddd"></i><div style="font-size: 14px;line-height: 40px;color:#ccc;">暂无数据</div></div>';
        } else {
            options.legend.show = true;
            if (options.chartType == "pie") {
                var series = options.series[0];
                for (var i = 0; i < series.data.length; i++) {
                    if (series.data[i].value == 0.00) {
                        series.data[i].value = "-";
                    }
                }
            }
            chart.setOption(options);
        }
        (scope.chart) ? null : scope.chart = [];
        scope.chart[scope.chart.length] = chart;
    }
});