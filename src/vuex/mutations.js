/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2017/12/27  mengjq  新增
 * ========    =======  ============================================
 */


const mutations = {
    setLastVisit: (state, payload) => {
        state.lastVisit = payload.lastVisit;
        try {
            sessionStorage.setItem('lastVisit', state.lastVisit);
        } catch (e) {
            console.error('sessionStorage is not supported by current browser.');
        }
    },
    setAuth: (state, payload) => {
        state.auth = payload.auth;
    },
    setSelectGroup: (state, payload) => {
        state.selectGroup = payload.portfolio;
        window.portfolioId = state.selectGroup.id;
    },
    setUserInfo: (state, payload) => {
        state.userInfo = payload.userInfo;
    },
    passScode: (state, payload) => {
        state.scode = payload.scode;
    },
    addRoute: (state, payload) => {
        console.log();
    }
};

export default mutations;
