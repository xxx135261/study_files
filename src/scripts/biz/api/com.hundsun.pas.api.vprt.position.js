/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/5/9  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.vprt.position',
    dependencies: [],
    obj: function() {
        const api = og.api.rest, common = og.api.common, defaultHandler = function () {
        }, addFormData = common.addFormData, transformToPromise = common.transformToPromise;
        return {
            root: 'vprt_position',
            /**
             * 获取初始持仓
             *
             * @param portId 组合id
             * @return {*|Promise<any>}
             */
            get: function(portId) {
                let root = this.root + "/get", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 新增初始持仓
             *
             * @param positionList 持仓列表
             * @return {*|Promise<any>}
             */
            add: function (positionList) {
                let root = this.root + "/insert", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json'
                    }
                };
                return transformToPromise(api.request(method, {data: JSON.stringify(positionList), meta: meta}));
            },
            /**
             * 文件导入初始持仓
             *
             * @param formData FormData
             * @return {*|Promise<any>}
             */
            addFromFile: function(formData) {
                let root = this.root + "/fileImport", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    processData: false,
                    contentType: false
                };
                return transformToPromise(api.request(method, {data: formData, meta: meta}));
            },
            /**
             * 更新初始持仓
             *
             * @param positionList 持仓列表
             * @return {*|Promise<any>}
             */
            update: function(positionList) {
                let root = this.root + "/update", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json'
                    }
                };
                return transformToPromise(api.request(method, {data: JSON.stringify(positionList), meta: meta}));
            },
            /**
             * 删除初始持仓
             *
             * @param portId 组合id
             * @param ids    持仓guid列表
             * @return {*|Promise<any>}
             */
            delete: function (portId, ids) {
                let root = this.root + "/delete", method = root.split('/'), data = {};
                let meta = {
                    type: 'POST',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                addFormData(data, 'ids', ids);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            }
        }
    }
})