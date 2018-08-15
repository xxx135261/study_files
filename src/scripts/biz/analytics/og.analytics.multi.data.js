/**
 * Created by yujie10559 on 2016/7/12.
 */
$.register_module({
    name: 'og.analytics.multi.Data',
    dependencies: ['og.api.rest'],
    obj: function() {
        var module = this;
        var ConnectionPool = new function () {
            var pool, children = [], parents = [];
            $(window).on('beforeunload', function () {
                children.forEach(function (child) {try {child.kill(); } catch (error) {} });//should be no parents left
                parents.forEach(function (parent) {try {parent.kill(); } catch (error) {} });//but just in case
            });
            pool = {
                add : function (data) {
                    children.push(data);
                },
                parent : function (data) {
                    var parent, source = Object.clone(data.source);
                    if (data.pool) {
                        return null;
                    }
                    ['col', 'depgraph', 'row', 'type'].forEach(function (key) {delete source[key]; });// normalize sources
                    parent = parents.filter(function (parent) {return Object.equals(parent.source, source); });
                    if (parent.length && (parent = parent[0])) {
                        parent.refcount.push(data.id);
                        return parent;
                    }
                    parent = new og.analytics.multi.Data(source, {pool: true, label: 'pool'});
                    parent.refcount = [data.id];
                    parents.push(parent);
                    return parent;
                },
                parents : function () {
                    return parents;
                },
                remove : function (data) {
                    children = children.filter(function (child) {return child.id !== data.id; });
                    if (!data.parent) {
                        return;
                    } else if (data.parent.refcount) {
                        data.parent.refcount = data.parent.refcount.filter(function (id) {return id !== data.id; });
                        if (data.parent.refcount.length) {
                            return;
                        }
                    }
                    data.parent.kill();
                    parents = parents.filter(function (parent) {return parent.id !== data.parent.id; });
                }
            };
            return pool;
        };
        var Data = function(source, config) {
            var data = this, api = og.api.rest.multi, label = config.label ? config.label + '-' : '',
                view_id = config.view_id, graph_id = config.graph_id, subscribed = false;
            data.viewport_id = null;
            var disconnect_handler = function () {
                fire('disconnect');
                data.disconnect(data.prefix + 'disconnected');
            };
            var fire = (function () {
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
                        og.dev.warn(data.prefix + 'a ' + type + ' handler threw ', error);
                    }
                };
            })();
            var initialize = function () {
                var put_options = ['viewdefinition', 'aggregators', 'portfolio', 'providers','valuation', 'version', 'correction',
                    'benchId', 'calcTimeParam', 'everyDay', 'securityType']
                    .reduce(function (acc, val) {return (acc[val] = source[val]), acc;}, {});
                try { // initial request params come from outside so try/catch
                    api.get(put_options).pipe(view_handler);
                } catch (error) {
                    fire('fatal', data.prefix + error.message);
                }
            };
            var parent_meta_handler = function (meta, connection) {
                view_id = connection.view_id;
                graph_id = connection.graph_id;
                data.prefix = module.name + ' (' + label + view_id + '):\n';
                initialize();
            };
            var reconnect_handler = function () {
                initialize();
            };
            var view_handler = function (result) {
                if (result.error) {
                    return fire('fatal', data.prefix + result.message);
                }
                data.prefix = module.name + ' (' + label + (view_id = result.meta.id) + '):\n';
                if (result && result.data) {
                    fire('data', result);
                }
            };
            data.disconnect = function () {
                if (arguments.length) {
                    og.dev.warn.apply(null, Array.prototype.slice.call(arguments));
                }
                data.viewport(null);
                data.prefix = module.name + ' (' + label + view_id + '-dead' + '):\n';
                data.connection = view_id = graph_id = data.viewport_id = subscribed = null;
            };
            data.id = og.common.id('data');
            data.kill = function () {
                data.disconnect.apply(data, Array.prototype.slice.call(arguments));
                ConnectionPool.remove(data);
                if (!data.parent) {
                    og.api.rest.off('disconnect', disconnect_handler).off('reconnect', reconnect_handler);
                }
            };
            data.meta = meta = {columns: {}};
            data.source = source;
            data.pool = config.pool;
            data.pools = function () {
                return ConnectionPool.parents().pluck('connection').pluck('view_id');
            };
            data.prefix = module.name + ' (' + label + 'undefined' + '):\n';
            data.viewport = function (new_viewport) {
                return data;
            };
            data.on('fatal', function (message) {data.kill(message);});
            if (data.parent) { // use parent's connection information
                if (data.parent.connection) {
                    parent_meta_handler(null, data.parent.connection);
                }
                data.parent.on('meta', parent_meta_handler).on('fatal', function (message) {
                    fire('fatal', data.prefix + ' caught fatal error: ' + message);
                });
            } else {
                og.api.rest.on('disconnect', disconnect_handler).on('reconnect', reconnect_handler);
                setTimeout(initialize); // allow events to be attached
            }
        };
        Data.prototype.off = og.common.events.off;
        Data.prototype.on = og.common.events.on;
        return Data;
    }
});
