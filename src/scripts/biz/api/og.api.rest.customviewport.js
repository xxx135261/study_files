/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/2/28  mengjq  新增
 * ========    =======  ============================================
 */
$.register_module({
    name: 'og.api.rest.customviewport',
    dependencies: ['og.api.common', 'og.api.rest'],
    obj: function () {
        var common = og.api.common, api = og.api.rest, str = common.str, check = common.check;
        return {
            root: "customViewport",
            get: function (params) {
                let config = params.config || {}, pattern = params.pattern;
                var root = this.root, method = [root], data = {}, meta, reqData = [];
                meta = check({
                    bundle: {method: root + '#get', config: config},
                });
                meta.type = 'POST';
                // meta.datatype = "json";
                // meta.headers = {
                //     'Accept': '*/*',
                //     'Content-Type': 'application/json'
                // };
                let jsonObj = {
                    pid: config.pid,
                    name: config.name,
                    code: config.code,
                    layout: config.layout,
                    childNodes: config.childNodes,
                    dimension: config.dimension,
                    filtrate: config.filtrate,
                    exhibition: config.exhibition
                };
                if (config.columns) {
                    jsonObj.columns = config.columns;
                }
                if (config.xtype) {
                    jsonObj.xtype = config.xtype;
                }
                if (config.config) {
                    jsonObj.config = config.config;
                }
                data.webViewJson = JSON.stringify(jsonObj);
                // 用于区分是保存视图还是预览视图（pattern="preview"）
                if (pattern) {
                    data.pattern = pattern;
                }
                return api.request(method, {data: data, meta: meta});
            },
            put: function () {

            },
            delete: function (param) {

                var root = this.root + "/" + param, method = root.split("/"), data = {}, meta;
                meta = check({
                    bundle: {method: root + '#delete', config: {}},
                });
                meta.type = 'DELETE';
                // meta.datatype = "json";
                // meta.headers = {
                //     'Accept': '*/*',
                //     'Content-Type': 'application/json'
                // };
                return api.request(method, {data: data, meta: meta});

            }
        }
    }
});