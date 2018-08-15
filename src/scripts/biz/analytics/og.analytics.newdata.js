/**
 * Created by mengjq on 2016/4/28.
 */
$.register_module({
    name: 'og.analytics.NewData',
    dependencies: ['og.api.rest'],
    obj: function () {
        var module = this;
        var ConnectionPool = new function () {
            var pool, children = [], parents = [];
            $(window).on('beforeunload', function () {
                children.forEach(function (child) {
                    try {
                        child.kill();
                    } catch (error) {
                    }
                });//should be no parents left
                parents.forEach(function (parent) {
                    try {
                        parent.kill();
                    } catch (error) {
                    }
                });//but just in case
            });
            pool = {
                add: function (data) {
                    children.push(data);
                },
                parent: function (data) {
                    parents = [];
                    var parent, source = Object.clone(data.source);
                    if (data.pool) {
                        return null;
                    }
                    parent = parents.filter(function (parent) {
                        return Object.equals(parent.source, source);
                    });
                    if (parent.length && (parent = parent[0])) {
                        parent.refcount.push(data.id);
                        return parent;
                    }
                    parent = data;// Object.clone(data); //new og.analytics.NewData(source, {pool: true, label: 'pool'});
                    parent.refcount = [data.id];
                    parents.push(parent);
                    return parent;
                },
                parents: function () {
                    return parents;
                },
                remove: function (data) {
                    children = children.filter(function (child) {
                        return child.id !== data.id;
                    });
                    if (!data.parent) {
                        return;
                    } else if (data.parent.refcount) {
                        data.parent.refcount = data.parent.refcount.filter(function (id) {
                            return id !== data.id;
                        });
                        if (data.parent.refcount.length) {
                            return;
                        }
                    }
                    data.parent = null;
                    parents = [];
                    // parents = parents.filter(function (parent) {
                    //     return parent.id !== data.parent.id;
                    // });
                }
            };
            return pool;
        };
        var NewData = function (source, config) {
            var data = this, api = og.api.rest.realtime, meta, label = config.label ? config.label + '-' : '',
                viewport = null, view_id = config.view_id, viewport_version, graph_id = config.graph_id,
                subscribed = false, grid_type = null, depgraph = !!source.depgraph,
                loading_viewport_id = false, fixed_set = {portfolio: 'latestTime', primitives: 'latestData'},
                bypass_types = config.bypass, structure_promise, lastData = [];
            data.viewport_id = null;
            var data_handler = (function () {
                var timeout = null, rate = 500, last = +new Date(), current, delta, map = new Map();
                var handler = function (result) {
                    if (!result || result.error) {// do not kill connection even if there is an error, just warn
                        return og.dev.warn(data.prefix + (result && result.message || 'reset connection'));
                    }
                    if (result.data && /*result.data.version ===*/viewport_version) {
                        fire('data', result.data);
                    }
                };
                return function (result) {
                    clearTimeout(timeout);
                    if (!view_id) {// connection is dead
                        return;
                    }
                    if ((delta = (current = +new Date()) - last) >= rate) {
                        last = current;
                        return handler(result);
                    }
                    timeout = setTimeout(data_handler.partial(result), rate - delta);
                };
            })();


            var data_setup = function () {
                if (!view_id) {
                    return
                } else {
                    var promise, viewports = api.realtime.viewports;
                    subscribed = true;
                    grid_type = "latestData";
                    if (data.viewport_id) {
                        viewports.get({
                            view_id: view_id,
                            grid_type: grid_type,
                            graph_id: graph_id,
                            update: data_setup,
                            viewport_id: data.viewport_id
                        }).pipe(data_handler);
                    } else {
                        // PUT the structure of the viewport, returns the viewport id and set the version as the promise id
                        (promise = viewports.put({
                                view_id: view_id, grid_type: grid_type,
                                graph_id: graph_id, loading: function () {
                                    loading_viewport_id = true;
                                }
                            })
                        ).pipe(function (result) {
                            loading_viewport_id = false;
                            if (result.error) {
                                data.prefix = module.name + ' (' + label + view_id + '-dead):\n';
                                data.connection = view_id = graph_id = data.viewport_id = subscribed = null;
                                return result;
                            }
                            data.viewport_id = result.meta.id;
                            viewport_version = promise.id;
                            //return a dry run
                            return viewports.get({
                                view_id: view_id, grid_type: grid_type, graph_id: graph_id, dry: true,
                                viewport_id: data.viewport_id, update: data_setup
                            });
                        }).pipe(data_handler);
                    }
                }
            };

            var allData_setup = function () {
                if (!view_id) {
                    return
                } else {
                    if (data.viewport_id) {
                        viewports.get({
                            view_id: view_id, grid_type: grid_type, graph_id: graph_id, update: data_setup,
                            viewport_id: data.viewport_id
                        }).pipe(data_handler);
                    } else {
                        var promise, viewports = api.realtime.viewports;
                        subscribed = true;
                        grid_type = "allData";
                        (promise = viewports.put({
                                view_id: view_id, grid_type: grid_type, graph_id: graph_id,
                                loading: function () {
                                    loading_viewport_id = true;
                                }
                            })
                        ).pipe(function (result) {
                            loading_viewport_id = false;
                            if (result.error) {
                                data.prefix = module.name + ' (' + label + view_id + '-dead):\n';
                                data.connection = view_id = graph_id = data.viewport_id = subscribed = null;
                                return result;
                            }
                            data.viewport_id = result.meta.id;
                            data.connection = {grid_type: grid_type, view_id: view_id};
                            viewport_version = promise.id;
                            //return a dry run
                            return viewports.get({
                                view_id: view_id, grid_type: grid_type, graph_id: graph_id, dry: false,
                                viewport_id: data.viewport_id
                            });
                        }).pipe(allData_handler);
                    }
                }
            }

            var allData_handler = function (result) {

                var config = {output: 'series', scope: this, fields: ['averagelinenode', 'averagelinevalue']};
                var averageline = new og.analytics.grid.data.Grid({
                    source: og.api.rest.views.parame.xhrArgs(og.api.rest.views.parame.realtimeStare.timeTicketBaseLine, {portfolio: data.source.portfolio}),
                    config: config
                }).on('data', function (res) {
                    if (result && result.data) {
                        data.viewport_id = '';
                        fire('averageline', {
                            averageline: res[2][0]['cells'][0]['value'],
                            startPoint: result.data.StartTime,
                            lastdata: result.data.ListData
                        });
                        data_setup();
                    } else {
                        //实时盯盘图可以收到基线数据，用于收盘后，进度条可以消失
                        fire('averageline', {
                            averageline: res[2][0]['cells'][0]['value']
                        });
                        averageline.kill();
                    }
                }, this)
            }

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
                var put_options = ['viewdefinition', 'aggregators', 'portfolio', 'providers', 'valuation', 'version', 'correction']
                    .reduce(function (acc, val) {
                        return (acc[val] = source[val]), acc;
                    }, {});
                try { // initial request params come from outside so try/catch
                    api.put(put_options).pipe(view_handler);
                } catch (error) {
                    fire('fatal', data.prefix + error.message);
                }
            };
            var nonsensical_viewport = function (viewport) {
                return !(viewport.cells && viewport.cells.length) &&
                    (!viewport.rows || !viewport.rows.length || !viewport.cols || !viewport.cols.length);
            };
            var parent_meta_handler = function (meta, connection) {
                view_id = connection.view_id;
                graph_id = connection.graph_id;
                data.prefix = module.name + ' (' + label + view_id + '):\n';
                initialize();
            };
            var reconnect_handler = function () {
                setTimeout(initialize);
            };


            var view_handler = function (result) {
                if (result.error) {
                    return fire('fatal', data.prefix + result.message);
                }
                data.prefix = module.name + ' (' + label + (view_id = result.meta.id) + '):\n';
                data.parent = ConnectionPool.parent(data);
                return allData_setup();
            };
            data.disconnect = function () {
                if (arguments.length) {
                    og.dev.warn.apply(null, Array.prototype.slice.call(arguments));
                }
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
            data.parent = ConnectionPool.parent(data);
            data.prefix = module.name + ' (' + label + 'undefined' + '):\n';
            // user interaction with the grid or clipboard usage results in a new grid structure,
            // the viewports is then updated (PUT)
            data.viewport = function (new_viewport) {
                return data;
            };
            data.on('fatal', function (message) {
                data.kill(message);
            });
            if (data.parent) { // use parent's connection information
                if (data.parent.connection) {
                    parent_meta_handler(null, data.parent.connection);
                }
                data.parent.on('meta', parent_meta_handler);
                //.on('fatal', function (message) {
                //     fire('fatal', data.prefix + ' caught fatal error: ' + message);
                // });
                // parent_meta_handler();
                reconnect_handler();
            } else {
                og.api.rest.on('disconnect', disconnect_handler).on('reconnect', reconnect_handler);
                setTimeout(initialize); // allow events to be attached
            }
        };
        NewData.prototype.off = og.common.events.off;
        NewData.prototype.on = og.common.events.on;
        return NewData;
    }
});
