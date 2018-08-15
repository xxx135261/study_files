/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/5/9  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.vprt.allocation',
    dependencies: [],
    obj: function() {
        const api = og.api.rest, common = og.api.common, defaultHandler = function () {
        }, addFormData = common.addFormData, transformToPromise = common.transformToPromise;
        return {
            root: 'vprt_allocation',
            /**
             * 新增资金变动
             *
             * @param allocationList 资金变动记录列表
             * @return {*|Promise<any>}
             */
            add: function(allocationList) {
                let root = this.root + "/allocate", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json'
                    }
                };
                return transformToPromise(api.request(method, {data: JSON.stringify(allocationList), meta: meta}));
            },
            /**
             * Excel批量添加资金变动记录
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
             * 获取资金变动
             *
             * @param portId 组合id
             * @return {*|Promise<any>}
             */
            get: function (portId) {
                let root = this.root + "/getAllocations", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * * 获取有资金变动的日期
             *
             * @param portId 组合id
             * @return {*|Promise<any>}
             */
            getDates: function (portId) {
                let root = this.root + "/getDates", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 获取某一天的资金变动数据
             *
             * @param portId 组合id
             * @param date   日期
             * @return {*|Promise<any>}
             */
            getByDate: function (portId, date) {
                let root = this.root + "/getAllocByDate", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                addFormData(data, 'point_date', date);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 更新资金变动记录
             *
             * @param allocationList 资金变动记录列表
             * @return {*|Promise<any>}
             */
            update: function(allocationList) {
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
                return transformToPromise(api.request(method, {data: JSON.stringify(allocationList), meta: meta}));
            },
            /**
             * 删除变动记录
             *
             * @param portId 组合id
             * @param ids 变动记录guid列表
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