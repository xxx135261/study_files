/**
 * Created by mengjq on 4/19/2016.
 */
$.register_module({
    name: 'og.api.rest.sysparamconfig',
    dependencies: ['og.api.common', 'og.api.rest'],
    obj: function () {
        var common = og.api.common, api = og.api.rest, str = common.str, check = common.check;
        return { // all requests that begin with /valuerequirementnames
            root: 'sysparamconfig/{sysParamValue}',
            get: function (config) {
                config = config || {};
                var root = this.root, method = root.split('/'), data = {}, meta;
                meta = check({
                    bundle: {method: root + '#get', config: config},
                    required: [{all_of: ['sysParamValue']}]});
                method[1] = config.sysParamValue;
                return api.request(method, {data: data, meta: meta});
            },
            put: common.not_implemented_put,
            del: common.not_implemented_del
        };
    }
});