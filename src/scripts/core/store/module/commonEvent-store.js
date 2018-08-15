/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2017/12/20  rencc19758  新增
 * ========    =======  ============================================
*/

const state = {
    scode: 'sh000001'
}

const mutations = {
    passScode: (state, payload) => {
        state.scode = payload.scode;
    }
}

export default {
    namespaced: true,
    state: state,
    mutations: mutations
}