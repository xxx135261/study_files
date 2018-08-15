/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/4/27  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.customviews',
    dependencies: [],
    obj: function() {
        const api = og.api.rest, defaultHandler = function () {};
        return {
            root: 'user',
            /**
             * 获取所有自定义视图
             *
             * @param userId 用户id
             * @param sync 请求是否同步
             * @return {*}
             */
            get: function(userId = "", sync = false) {
                let root = this.root + "/" + userId + "/customViews", method = root.split('/');
                let meta = {
                    type: 'GET',
                    handler: defaultHandler,
                    sync: sync
                };
                return api.request(method, {data: {}, meta: meta});
            },
            /**
             * 获取单个自定义视图
             *
             * @param userId 用户id
             * @param viewId 视图id（guid）
             * @param sync 请求是否同步
             * @return {*}
             */
            getSingle: function(userId, viewId, sync = false) {
                let root = this.root + "/" + userId + "/customViews", method = root.split('/');
                let meta = {
                    type: 'GET',
                    handler: defaultHandler,
                    sync: sync
                };
                return api.request(method, {data: {viewGuid: viewId}, meta: meta});
            }
        }
    }
})