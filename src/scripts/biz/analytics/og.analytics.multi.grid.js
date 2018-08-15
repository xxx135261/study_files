/**
 * Created by yujie10559 on 2016/7/12.
 */
$.register_module({
    name: 'og.analytics.multi.Grid',
    dependencies: ['og.analytics.multi.Data'],
    obj: function() {
        var loadMethod='loading';
        var Grid = function(config) {
            if (!config) return;
            var grid = this;
            grid.source = config.source;
            grid.config = config.config;
            grid.meta = null;
            multi_grid.call(grid);
        };
        var multi_grid = function() {
            var grid = this;
            if(typeof grid.config.scope[loadMethod]=='function'){
                grid.config.scope[loadMethod]('preparing');
            }
            grid.dataman = new og.analytics.multi.Data(grid.source, {bypass: false, label: 'grid'})
                .on('data', function(result) {
                    if(typeof grid.config.scope[loadMethod]=='function'){
                        grid.config.scope[loadMethod]('remove');
                    }
                    fire('data', result);
                }, grid);
            var fire = (function () {
                var fatal_fired = false;
                return function (type) {
                    var args = Array.prototype.slice.call(arguments);
                    try {
                        if (type === 'fatal' && !fatal_fired) { // fire only once ever
                            fatal_fired = true;
                            return og.common.events.fire.apply(grid, args);
                        }
                        og.common.events.fire.apply(grid, args);
                    } catch (error) {
                        og.dev.warn(grid.prefix + 'a ' + type + ' handler threw ', error);
                    }
                };
            })();
        };
        Grid.prototype.kill = function () {
            try {
                var grid = this;
                grid.dataman.kill();
                grid.fire('kill');
            }catch (error) {og.dev.warn('og.analytics.grid.data.dataman.kill',error);}
        };
        Grid.prototype.fire = og.common.events.fire;
        Grid.prototype.off = og.common.events.off;
        Grid.prototype.on = og.common.events.on;
        return Grid;
    }
});
