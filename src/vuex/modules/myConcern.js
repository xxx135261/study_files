/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/9  rencc19758  新增
 * ========    =======  ============================================
*/
const state = {
    basicInfo: []
}

const mutations = {
    initBasicInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.basicInfo = payload.newVal;
        }
    }
}

export default {namespaced: true, state, mutations}