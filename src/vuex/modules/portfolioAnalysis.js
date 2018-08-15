/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/9  rencc19758  新增
 * ========    =======  ============================================
*/
import {SET_COST_DATE_INFO, SET_MP_LIST, SET_ALLOCATION_INFO, SET_MP_COLINFO} from './../mutation-types'

const state = {
    // 组合表格数据
    basicInfo: [],
    // 组合交易表格数据
    tradeInfo: [],
    // 交易费率表格数据
    transactionInfo: [],
    // 组合资金表格数据
    allocationInfo: [],
    // 组合资金表格日期数据
    costdateInfo: [],
    // 组合交易调仓日期数据
    tradedateInfo: [],
    /*组合拥有的所有模板*/
    mpList: [],
    /*模板对应列信息*/
    mpColInfo: {}
}

const mutations = {
    setBasicInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.basicInfo = payload.newVal;
        }
    },
    setTradeInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.tradeInfo = payload.newVal;
        }
    },
    setTradedateInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.tradedateInfo = payload.newVal;
        }
    },
    setTransactionInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.transactionInfo = payload.newVal;
        }
    },
    [SET_ALLOCATION_INFO] (state, payload = {}) {
        if (payload.newVal) {
            state.allocationInfo = payload.newVal;
        }
    },
    [SET_COST_DATE_INFO] (state, payload = {}) {
        if (payload.newVal) {
            state.costdateInfo = payload.newVal;
        }
    },
    [SET_MP_LIST] (state, payload = {}) {
        if (payload.newVal) {
            state.mpList = payload.newVal;
        }
    },
    [SET_MP_COLINFO] (state, payload = {}) {
        if (payload.newVal) {
            state.mpColInfo = payload.newVal;
        }
    }
}

const actions = {
    /*加载所有模板*/
    loadMpList: ({commit}, portId) => {
        com.hundsun.pas.vprt.impmp.get(portId)
            .then(data => {
                if (data.length > 0) {
                    commit({
                        type: SET_MP_LIST,
                        newVal: data
                    });
                } else {
                    commit({
                        type: SET_MP_LIST,
                        newVal: []
                    });
                }
            })
            .catch(err => {
                commit({
                    type: SET_MP_LIST,
                    newVal: []
                });
            });
    },
    /*加载对应列信息*/
    loadMpColInfo: ({commit}, mpId) => {
        commit({
            type: SET_MP_COLINFO,
            newVal: []
        });
        com.hundsun.pas.vprt.impmp.getImpMpCol(mpId)
            .then(data => {
                if (data.length > 0) {
                    commit({
                        type: SET_MP_COLINFO,
                        newVal: data
                    });
                }
            })
            .catch(err => {
                $.showNotice("加载模板列信息失败", 'error');
            });
    }
}

export default {namespaced: true, state, mutations, actions}