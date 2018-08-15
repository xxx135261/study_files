/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/5/9  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.vprt.feerate',
    dependencies: [],
    obj: function() {
        const api = og.api.rest, common = og.api.common, defaultHandler = function () {
        }, addFormData = common.addFormData, transformToPromise = common.transformToPromise;
        return {
            root: 'vprt_portfolio',
            /**
             * 获取组合所有费率
             *
             * @param portId 组合id
             * @return {*|Promise<any>}
             */
            get: function(portId) {
                let root = this.root + "/getFeeRate", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 获取单个费率
             *
             * @param portId   组合id
             * @param type     交易类型 (1: 买入, 2: 卖出)
             * @param secKind  证券类型 (eg: ESA)
             * @param marketId 交易市场id (eg: XSHG)
             * @return {*|Promise<any>}
             */
            getSingle: function(portId, type, secKind, marketId) {
                let root = this.root + "/getSingleFeeRate", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                addFormData(data, 'type', type);
                addFormData(data, 'sec_kind', secKind);
                addFormData(data, 'market_id', marketId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            update: function (feeRateList) {
                let root = this.root + "/updateFeeRate", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json'
                    }
                };
                return transformToPromise(api.request(method, {data: JSON.stringify(feeRateList), meta: meta}));
            }
        }
    }
})