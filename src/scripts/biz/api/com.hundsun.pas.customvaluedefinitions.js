/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/4/13  rencc19758  新增
 * ========    =======  ============================================
*/
/*
* 自定义指标相关数据api
*/
$.register_module({
    name: 'com.hundsun.pas.customvalueDefinitions',
    dependencies: [],
    obj: function() {
        const api = og.api.rest, defaultHandler = function () {};
        return {
            root: 'CustomValueDefinitions',
            /*获取所有自定义指标*/
            get: function() {
                let root = this.root, method = root.split('/');
                let meta = {
                    type: 'GET',
                    handler: defaultHandler,
                    sync: false
                };
                return api.request(method, {data: {}, meta: meta});
            },
            /*获取单个自定义指标*/
            getSingle: function(uniqueId) {
                let root = this.root + '/' + uniqueId, method = root.split('/');
                let meta = {
                    type: 'GET',
                    handler: defaultHandler,
                    sync: false
                };
                return api.request(method, {data: {}, meta: meta});
            }
        }
    }
})