/**
 * Created by Administrator on 7/3/2017.
 */
$.register_module({
    name: 'com.hundsun.pas.api.rest.views',
    dependencies: ['com.hundsun.pas.api.common'],
    obj: function () {
        var common = com.hundsun.pas.api.common, api = com.hundsun.pas.api.rest, check = common.check;
        return {
            root: 'views',
            get: common.not_available,
            put: function (config, promise) {
                var promise = promise || new common.Promise, root = this.root, method = [root], data = {}, meta;
                meta = check({
                    bundle: {method: root + '#put', config: config},
                    required: [{all_of: ['viewdefinition', 'portfolio']}]
                });
                meta.type = 'POST';
                promise.ignore = true;
                return api.request(method, {
                    data: {},
                    meta: meta
                }, promise);
            },
            grid: {
                depgraphs: {
                    root: 'views/{{view_id}}/{{grid_type}}/depgraphs',
                    del: function (config) {

                    },
                    get: common.not_available,
                    structure: {
                        root: 'views/{{view_id}}/{{grid_type}}/depgraphs/{{graph_id}}',
                        get: function (config) {
                            config = config || {};
                            var root = this.root, method = root.split('/'), data = {}, meta;
                            meta = check({
                                bundle: {method: root + '#get', config: config},
                                required: [{all_of: ['view_id', 'grid_type', 'graph_id']}]
                            });
                            method[1] = config.view_id;
                            method[2] = config.grid_type;
                            method[3] = config.graph_id;
                            return api.request(method, {data: data, meta: meta});
                        }
                    },
                    put: function (config) {
                        config = config || {};
                        var promise = new common.Promise(), root = this.root, method = root.split('/'), data = {}, meta,
                            fields = ['view_id', 'grid_type', 'colset', 'req'],
                            meta = check({
                                bundle: {method: root + '#put', config: config}/*, required: [{all_of: fields}]*/
                            });
                        meta.type = 'POST';
                        promise.ignore = true;
                        data['requestId'] = promise.id;
                        data['clientId'] = api.id;
                        method[1] = config.view_id;
                        method[2] = config.grid_type;
                        fields.forEach(function (val, idx) {

                        });
                        return api.request(method, {data: data, meta: meta}, promise);
                    },
                    viewports: {}
                },
                structure: {
                    "root": 'views/{{view_id}}/{{grid_type}}', get: function (config) {
                        config = config || {};
                        var root = this.root, method = root.split('/'), data = {}, meta;
                        meta = check({
                            bundle: {method: root + '#get', config: config},
                            required: [{all_of: ['view_id', 'grid_type']}]
                        });
                        method[1] = config.view_id;
                        method[2] = config.grid_type;
                        return api.request(method, {data: data, meta: meta});
                    }
                }
            }
        }
    }
});