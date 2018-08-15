/*
* 用于config表相关的数据交互,
* 区别于og.api.rest.configs(该js是用来展示html页面的(ftl)，非纯数据)
* add by ykf 20171211
*/
$.register_module({
    name: 'com.hundsun.pas.configs',
    dependencies: ['og.api.rest', 'og.api.common'],
    obj: function () {
        var api = og.api.rest, common = og.api.common, check = common.check;
        return {
            root: 'components',
            get: function (config) {
                config = config || {};
                var root = 'configSource/configs', method = root.split('/'),
                    data = {type: config.type}, meta;
                meta = check({
                    bundle: {method: root + '#get', config: config}
                });
                // meta.type = 'GET';
                if (config.name) {
                    data.name = config.name;
                }
                return api.request(method, {data: data, meta: meta});
            },
            getByUid: function (uid) {
                var data = {};
                var root = 'configSource/configs/' + uid, method = root.split('/');
                var meta = check({
                    bundle: {method: root + '#get', config: {}}
                });
                return api.request(method, {data: data, meta: meta});
            },
            getPg: function (config) {
                config = config || {};
                let url = 'userConfigs/out', method = url.split('/'),
                    data = {
                        name: config.name,
                        pgNum: config.pgNum,
                        pgSze: config.pgSze,
                        type: config.type
                    };
                let meta = check({
                    bundle: {method: url, config: {}}
                });
                return api.request(method, {data: data, meta: meta});
            },
            put: function (config) {
                config = config || {};
                let url = 'configs/' + config.configId, method = url.split('/'),
                    data = {
                        name: config.name,
                        configJSON: config.configJSON,
                        configXML: ''
                    };
                let meta = check({
                    bundle: {method: url, config: {}}
                });
                meta.type = 'PUT';
                return api.request(method, {data: data, meta: meta});
            },
            add: function (config) {
                config = config || {};
                let url = 'userConfigs', method = url.split('/'),
                    data = {
                        name: config.name,
                        configJSON: config.configJSON,
                        configXML: '',
                        type: config.type
                    };
                let meta = check({
                    bundle: {method: url, config: {}}
                });
                meta.type = 'POST';
                return api.request(method, {data: data, meta: meta});
            },
            del: function (config) {
                config = config || {};
                let url = 'userConfigs/' + config.configId, method = url.split('/');
                let meta = check({
                    bundle: {method: url, config: {}}
                });
                meta.type = 'DELETE';
                return api.request(method, {data: {}, meta: meta});
            }
        }
    }
})