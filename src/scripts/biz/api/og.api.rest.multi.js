/**
 * Created by yujie10559 on 2016/7/12.
 */
$.register_module({
    name: 'og.api.rest.multi',
    dependencies: ['og.api.common', 'og.api.rest'],
    obj: function() {
        var common = og.api.common, api = og.api.rest, str = common.str, check = common.check, STALL = common.STALL;
        return {
            root: 'multiSequenceViews/createMultiSequence',
            get: function (config, promise) {
                config = config || {};
                var promise = promise || new common.Promise, root = this.root, method = root.split('/'), data = {}, meta,
                    fields = [
                        'viewdefinition', 'aggregators', 'providers', 'portfolio', 'valuation','blotter',
                        'benchId', 'calcTimeParam', 'calcFrequency', 'samplingPeriod'
                    ],
                    api_fields = [
                        'viewDefinitionId', 'aggregators', 'marketDataProviders', 'portfolioIds', 'valuationTime','blotter',
                        'benchId', 'calcTimeParam', 'calcFrequency', 'samplingPeriod'
                    ];
                if (!api.id) return setTimeout((function (context) {                    // if handshake isn't
                    return function () {
                        api.views.put.call(context, config, promise);
                    }; // complete, return a
                })(this), STALL), promise;
                meta = check({
                    bundle: {method: root + '#put', config: config},
                    required: [{all_of: ['viewdefinition', 'portfolio']}]});
                meta.type = 'POST';
                fields.forEach(function (val, idx) {
                    var is_object = typeof config[val] === 'object';
                    if (is_object ? val = JSON.stringify(config[val]) : val = str(config[val])) // is truthy
                        data[api_fields[idx]] = val;
                });
                data['requestId'] = promise.id;
                data['aggregators'] = config.aggregators; // send traditional form array and not JSON
                data['clientId'] = api.id;
                return api.request(method, {
                    data: {reqFormParam: JSON.stringify(data), aggregators: config.aggregators},
                    meta: meta
                }, promise);
            }
        };
    }
});
