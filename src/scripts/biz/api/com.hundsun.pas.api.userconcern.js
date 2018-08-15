/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/5/4  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.userconcern',
    dependencies: [],
    obj: function () {
        const api = og.api.rest, defaultHandler = function () {
        };
        return {
            root: 'userConcern',
            /**
             * 新增或更新用户关注
             *
             * @param data
             * @param sync 请求是否同步
             * @return {*}
             */
            addOrUpdate: function (data, sync = false) {
                let root = this.root + "/addOrUpdate", method = root.split('/');
                let meta = {
                    type: 'POST',
                    dataType: 'json',
                    handler: defaultHandler,
                    sync: sync
                };
                let formData = {
                    user_id: data.userId,
                    key_scheme: data.keyScheme,
                    key_value: data.keyValue
                };
                return api.request(method, {data: formData, meta: meta});
            },
            /**
             * 删除用户关注
             *
             * @param data
             * @param sync 请求是否同步
             * @return {*}
             */
            delete: function (data, sync = false) {
                let root = this.root + "/delete", method = root.split('/');
                let meta = {
                    type: 'POST',
                    dataType: 'json',
                    handler: defaultHandler,
                    sync: sync
                };
                let formData = {
                    user_id: data.userId,
                    key_scheme: data.keyScheme,
                    key_value: data.keyValue
                };
                return api.request(method, {data: formData, meta: meta});
            },
            /**
             * 从所有用户的关注中删除一支特定的证券
             *
             * @param data
             * @param sync 请求是否同步
             * @return {*}
             */
            deleteFromAllUsers: function (data, sync = false) {
                let root = this.root + "/deleteAllUsers", method = root.split('/');
                let meta = {
                    type: 'POST',
                    dataType: 'json',
                    handler: defaultHandler,
                    sync: sync
                };
                let formData = {
                    user_id: data.userId,
                    key_scheme: data.keyScheme,
                    key_value: data.keyValue
                };
                return api.request(method, {data: formData, meta: meta});
            }
        }
    }
})