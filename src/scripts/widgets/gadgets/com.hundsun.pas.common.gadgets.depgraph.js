/**
 * Created by Administrator on 6/23/2017.
 */
$.register_module({
    name: 'com.hundsun.pas.common.gadgets.Depgraph',
    dependencies: [],
    obj: function () {
        var Grid = com.hundsun.pas.common.gadgets.Grid, Depgraph = function (config) {
            var depgraph = this, containers;
            Grid.call(depgraph, {
                selector: config.selector,
                source: $.extend({depgraph: true, req: config.req, colset: config.colset}, config.source)
            });
        };
        Depgraph.prototype = Object.create(Grid.prototype);
        Depgraph.prototype.label = 'depgraph';
        return Depgraph;
    }
});