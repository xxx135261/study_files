/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/5/10  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.vprt.trade',
    dependencies: [],
    obj: function() {
        const api = og.api.rest, common = og.api.common, defaultHandler = function () {
        }, addFormData = common.addFormData, transformToPromise = common.transformToPromise;
        return {
            root: 'vprt_trade',
            /**
             * 新增交易记录
             *
             * @param tradeList 交易流水列表
             * @return {*|Promise<any>}
             */
            add: function(tradeList) {
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
                return transformToPromise(api.request(method, {data: JSON.stringify(tradeList), meta: meta}));
            },
            /**
             * Excel批量添加交易流水
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
             * 从外部流水文件导入流水
             *
             * @param formData FormData
             * @return {*|Promise<any>}
             */
            addFromExteralFile: function (formData) {
                let root = this.root + "/fileImportTmp", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    processData: false,
                    contentType: false
                };
                return transformToPromise(api.request(method, {data: formData, meta: meta}));
            },
            /**
             * 获取交易流水
             *
             * @param portId 组合id
             * @return {*|Promise<any>}
             */
            get: function (portId) {
                let root = this.root + "/getAllTrades", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * * 获取有交易流水的日期
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
             * 获取某一天的交易流水
             *
             * @param portId 组合id
             * @param date   日期
             * @return {*|Promise<any>}
             */
            getByDate: function (portId, date) {
                let root = this.root + "/getTradesByDate", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                addFormData(data, 'point_date', date);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 修改交易流水
             *
             * @param tradeList 交易流水列表
             * @return {*|Promise<any>}
             */
            update: function(tradeList) {
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
                return transformToPromise(api.request(method, {data: JSON.stringify(tradeList), meta: meta}));
            },
            /**
             * 删除交易流水
             *
             * @param portId 组合id
             * @param ids 交易流水guid列表
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
            },
            /**
             * 获取证券单价
             *
             * @param secCode 证券代码 (eg: 000651)
             * @param marketId 市场代码 (eg: XSHG)
             * @param date 日期 (eg: 20180510)
             * @return {*|Promise<any>}
             */
            getPrice(secCode, marketId, date) {
                let root = this.root + "/getPrice", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'sec_code', secCode);
                addFormData(data, 'market_id', marketId);
                addFormData(data, 'point_date', date);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            }
        }
    }
})