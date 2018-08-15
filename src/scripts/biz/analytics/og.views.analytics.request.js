/**
 * Created by yujie10559 on 2016/8/10.
 */
$.register_module({
    name: 'og.views.analytics.request',
    dependencies: [],
    obj: function () {
        var requestData = function (request) {
            var module = request.name, clazz = module[0], attribute = module[1], scope = request.otherParam.scope, fields = request.otherParam.fields || '', elements = request.otherParam.elements,
                handleMeta = request.metaHandle,
                handleData = request.dataHandle;
            if (og.analytics.grid[attribute]) {
                og.analytics.grid[attribute].kill();
                og.analytics.grid[attribute] = null;
            }
            og.analytics.grid[attribute] = new og.analytics.grid.data.Grid({
                source: og.api.rest.views.parame.xhrArgs(clazz, attribute, request.requestParam),
                config: {scope: scope, elements: elements}
            }).on('meta', function (metadata, attribute) {
                if (metadata) {
                    if (angular.isFunction(handleMeta)) {
                        handleMeta.call(scope, metadata.rows, attribute);
                    }
                }
            }).on('data', function (result) {
                if (angular.isFunction(handleData)) {
                    handleData.call(scope, result, attribute, fields);
                }
            }, scope);
        }
        requestData.prototype.kill = function () {
            try {
                var grid = this;
                grid.dataman.kill();
                grid.fire('kill');
            } catch (error) {
                og.dev.warn('og.views.analytics.request.kill', error);
            }
        };
        requestData.prototype.fire = og.common.events.fire;
        requestData.prototype.off = og.common.events.off;
        requestData.prototype.on = og.common.events.on;
        return requestData;
    }
});