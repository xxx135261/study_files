/*
 * Copyright 2013 - present by OpenGamma Inc. and the OpenGamma group of companies
 * Please see distribution for license.
 */
$.register_module({
    name: 'og.api.rest.viewdefinitions',
    dependencies: ['og.api.common', 'og.api.rest'],
    obj: function () {
        var common = og.api.common, api = og.api.rest,check = common.check;
        return { // all requests that begin with /viewdefinitions
            root: 'viewdefinitions',
            get: api.default_get.partial([], null),
            put: common.not_available_put,
            del: common.not_available_del,
            acquireiViewDefinition : {
                root: 'viewdefinitions/{viewDefinitionId}',
                get: function (config) {
                    config = config || {};
                    var root = this.root, method = root.split('/'), data = {}, meta;
                    meta = check({
                        bundle: {method: root + '#get', config: config},
                        required: [{all_of: ['viewDefinitionId']}]
                    });
                    method[1] = config.viewDefinitionId;
                    return api.request(method, {data: data, meta: meta});
                },
                put: common.not_available_put,
                del: common.not_available_del
            }
        };
    }
});