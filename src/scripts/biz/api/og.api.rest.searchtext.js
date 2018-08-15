/**
 * Created by mengjq on 2016/7/5.
 */
$.register_module({
    name: 'og.api.rest.searchtext',
    dependencies: ['og.api.common', 'og.api.rest'],
    obj: function () {
        var common = og.api.common, api = og.api.rest, str = common.str, check = common.check;
        return { // all requests that begin with /securities
            root: 'searchtext',
            get: function (config) {
                config = config || {};
                var root = this.root, method = root.split('/'), data = {}, meta;
                meta = check({
                    bundle: {method: root + '#get', config: config},
                    required: [{all_of: ['searchtext'], stype: ['stype']}]
                });
                method[1] = config.searchtext;
                method[2] = config.stype;
                return api.request(method, {data: data, meta: meta});
            },
            put: function (config) {
                config = config || {};
                var root = this.root, method = [root], data = {}, meta,
                    id = str(config.id), fields = ['identifier', 'scheme_type'], api_fields = ['idvalue', 'idscheme'];
                meta = check({
                    bundle: {method: root + '#put', config: config},
                    empties: [{condition: !!id, label: 'ID exists', fields: fields}],
                    required: [{condition: !id, all_of: fields}]
                });
                meta.type = id ? 'PUT' : 'POST';
                fields.forEach(function (val, idx) {
                    if (val = str(config[val])) data[api_fields[idx]] = val;
                });
                if (id) method.push(id);
                return api.request(method, {data: data, meta: meta});
            },
            del: api.default_del
        };
    }
})