/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/5/8  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.vprt.portfolios',
    dependencies: [],
    obj: function () {
        const api = og.api.rest, common = og.api.common, defaultHandler = function () {
        }, addFormData = common.addFormData, transformToPromise = common.transformToPromise;
        return {
            root: 'vprt_portfolio',
            /**
             * 获取所有组合
             *
             * @param orderBy 排序字段
             * @param direction 排序方向(asc/desc)
             * @return Promise
             */
            get: function (orderBy, direction) {
                let root = this.root + "/getPrts", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'order_by', orderBy);
                addFormData(data, 'direction', direction);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 根据组合id获取组合信息
             *
             * @param portId 组合id
             * @return Promise
             */
            getById: function (portId) {
                let root = this.root + "/getPrtById", method = root.split('/');
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                return transformToPromise(api.request(method, {data: {port_id: portId}, meta: meta}));
            },
            /**
             * 创建组合
             *
             * @param portInfo {name, amount, trustee_fee, begin_date, maneger_fee, currency, bench_id, unit_nav, port_flag, info}
             * @param fileName 文件导入持仓的文件名（由后台产生）
             * @param positionList [{name, volume, position_flag, market_id, sec_code}]
             * @return {*|Promise<any>}
             */
            add: function (portInfo, fileName = '*', positionList) {
                let root = this.root + "/add/" + fileName, method = root.split('/'), data = [];
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json'
                    }
                };
                data.push(portInfo);
                data = data.concat(positionList);
                return transformToPromise(api.request(method, {data: JSON.stringify(data), meta: meta}));
            },
            /**
             * 修改组合信息
             *
             * @param portInfo {name, amount, trustee_fee, begin_date, maneger_fee, currency, bench_id, unit_nav, port_flag, info}
             * @return {*|Promise<any>}
             */
            update: function (portInfo) {
                let root = this.root + "/update", method = root.split('/'), data = portInfo;
                let meta = {
                    type: 'POST',
                    handler: defaultHandler
                };
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 删除组合
             *
             * @param portId 组合id
             * @return {*|Promise<any>}
             */
            delete: function (portId) {
                let root = this.root + "/delete", method = root.split('/'), data = {};
                let meta = {
                    type: 'POST',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 批量删除组合
             *
             * @param portIds [portId]
             * @return {*|Promise<any>}
             */
            batchDelete: function (portIds) {
                let root = this.root + "/batchDel", method = root.split('/'), data = {};
                let meta = {
                    type: 'POST',
                    handler: defaultHandler
                };
                addFormData(data, 'ids', portIds);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 组合重名检测
             *
             * @param name 组合名
             * @param portId 组合id（组合还未创建时可以为null）
             * @return {*|Promise<any>}
             */
            isDuplicated: function (name, portId) {
                let root = this.root + "/isDuplicated", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'name', name);
                addFormData(data, 'port_id', portId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 组合核算
             *
             * @param portIds [portId]
             * @return {*|Promise<any>}
             */
            doAccounting: function (portIds) {
                let root = this.root + "/account", method = root.split('/'), data = {};
                let meta = {
                    type: 'POST',
                    handler: defaultHandler
                };
                addFormData(data, 'ids', portIds);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            }
        }
    }
})