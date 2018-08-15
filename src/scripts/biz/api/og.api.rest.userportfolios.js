/*
 * Copyright 2013 - present by OpenGamma Inc. and the OpenGamma group of companies
 * Please see distribution for license.
 */
$.register_module({
    name: 'og.api.rest.userportfolios',
    dependencies: ['og.api.common', 'og.api.rest'],
    obj: function () {
        var common = og.api.common, api = og.api.rest, str = common.str, check = common.check;
        return { // all requests that begin with /portfolios
            root: 'userportfolios',
            get: api.simple_get,
            put: common.not_available_put,
            del: common.not_available_del
        };
    }
});