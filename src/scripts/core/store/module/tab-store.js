/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2017/12/20  rencc19758  新增
 * ========    =======  ============================================
*/

import {menus} from './../../../biz/menus/com.hundsun.pas.menus.js';

const allNavs = (() => {
    let navs = [];
    for (let menu in menus) {
        navs.push(menus[menu]);
    }
    return navs;
})();

// initial navigation tab list
const initNavList = [
    menus.realtimeStare,
    menus.compositeProfile,
    menus.positionAnalysis,
    menus.siloAnalysis,
    menus.riskAnalysis,
    menus.profitAndLoss,
    menus.attriBution
];

const state = {
    allNavs: allNavs,
    navList: initNavList,
    closableNavList: []
};

const actions = {};

const getters = {
    getNavByGroup: (state) => (group) => {
        return state.allNavs.filter(nav => nav.group === group);
    },
    getFixedNavs: (state) => {
        return state.allNavs.filter(nav => nav.fixed);
    },
    getNavByType: (state) => (type) => {
        return state.allNavs.filter(nav => nav.type === type);
    }
};

const mutations = {
    clearNavList: state => {
        state.navList = [];
    },
    clearClosableNavList: state => {
        state.closableNavList = [];
    },
    setNavList: (state, payload) => {
        state.navList = payload.newList;
    },
    appendToNavList: (state, payload) => {
        state.navList.push(payload.newItem);
    },
    appendToClosableNavList: (state, payload) => {
        state.closableNavList.push(payload.newItem);
    },
    removeClosableNav: (state, payload) => {
        let index = state.closableNavList.findIndex(nav => nav.address === payload.path);
        if (index >= 0) {
            state.closableNavList.splice(index, 1);
        }
    }
};

export default {
    namespaced: true,
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}