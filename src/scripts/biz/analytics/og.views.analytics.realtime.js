/*
 * Copyright 2009 - present by OpenGamma Inc. and the OpenGamma group of companies
 * Please see distribution for license.
 */
$.register_module({
    name: 'og.views.analytics.realtime',
    dependencies: [],
    obj: function () {
        var routes = og.common.routes, module = this, view,
            main_selector = '.OG-layout-analytics-center';
        module.rules = {load: {route: '/', method: module.name + '.load'}};
        og.api.rest
            .on('disconnect', og.analytics.status.disconnected)
            .on('reconnect', og.analytics.status.reconnected);
        return view = {
            check_state: og.views.common.state.check.partial('/'),
            load: function (args) {
                // $('.OG-masthead .og-analytics-beta').addClass('og-active'); //设置tab选中样式
                var new_page = false, layout = og.views.common.layout; //获取当前页面布局方式
                view.check_state({args: args, conditions: [
                    {new_page: function () {
                        new_page = true;
                        //初始化当前页面布局风格
                        og.realtime.containers.initialize();
                    }}
                ]});

                //设置默认面板
                og.api.text({module: 'og.views.analytics.default', handler: function (template) {
                    var layout = og.views.common.layout,
                        $html = $.tmpl(template, {
                            recent_list: og.common.util.history.get_html('history.analytics.recent') ||
                                'no recently viewed views'
                        });
                    $('.OG-layout-analytics-center').html($html);
                }});

                if (!new_page && !args.data && og.analytics.url.last.main) {
                    og.reatime.url.clear_main(), $(main_selector).html('');
                }
            },
            load_item: function (args) {
                //加载项目
                view.check_state({args: args, conditions: [{new_page: view.load}]});
                og.realtime.url.process(args, function () {});
            },
            init: function () {
                for (var rule in view.rules)
                    routes.add(view.rules[rule]);
            },
            rules: {//配置加载规则
                load_item: {route: '/:data?', method: module.name + '.load_item'}
            }
        };
    }
});