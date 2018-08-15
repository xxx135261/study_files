/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2017/12/27  mengjq  新增
 * ========    =======  ============================================
 */


import {menus} from '../../scripts/biz/menus/com.hundsun.pas.menus.js';
import CommonTools from './../../scripts/core/util/com.hundsun.pas.common.util.public_methods';

const commonTools = new CommonTools();

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
    closableNavList: [],
    userViews: []
};

const actions = {
    /**
     * 从后台加载用户视图
     *
     * @param context
     * @param payload {object={router: Vue Router Object, reqData: object}}
     */
    loadUserViews: (context, payload) => {
        // 用户授权状态
        const auth = context.rootState.auth;

        /**
         * 添加路由
         *
         * @param views 用户菜单数据
         * @param router Vue Router对象
         */
        const addRoutes = (views) => {
            if (views && views.length > 0) {
                let oldAllNavs = context.state.allNavs;
                let filterAllNavs = oldAllNavs.filter(nav => !nav.customized || nav.customized == false);
                // 先把allNavs里已经添加的自定义视图清除
                context.commit({
                    type: 'setAllNavs',
                    newList: filterAllNavs
                });
                views.forEach(view => {
                    context.commit({
                        type: 'appendToAllNavs',
                        newItem: {
                            address: 'customView/' + view.vc_guid,
                            name: view.vc_name,
                            group: 'main',
                            type: 'main',
                            /*区分自定义视图菜单*/
                            customized: true
                        }
                    });
                });
            }
        }

        if (auth) {
            let promise = new Promise(resolve => {
                com.hundsun.pas.customviews.get(context.rootState.userInfo.userId, true).pipe(function (result) {
                    let data = result.data;
                    if ($.isArray(data)) {
                        context.commit({
                            type: 'setUserViews',
                            userViews: data
                        });
                    }
                    resolve(payload.router);
                });
            });
            promise.then((router) => {
                const state = context.state, views = state.userViews;
                addRoutes(views);
                sessionStorage.setItem('userViews', JSON.stringify(views));

                const currentPath = decodeURI(router.currentRoute.fullPath);
                // 重新加载tab
                let navGoTo = state.allNavs.find(nav => '/' + nav.address === currentPath);
                if (navGoTo) {
                    let newList;
                    if (navGoTo.address == 'newViewport') {
                        newList = context.getters['getFixedNavs'].concat(
                            context.getters['getNavByGroup']('main')
                        );
                    } else {
                        newList = context.getters['getFixedNavs'].concat(
                            context.getters['getNavByGroup'](navGoTo.group)
                        );
                    }
                    context.commit({
                        type: 'setNavList',
                        newList: newList
                    });
                } else {
                    context.commit({
                        type: 'setNavList',
                        newList: context.getters['getFixedNavs'].concat(
                            context.getters['getNavByGroup']('main')
                        )
                    });
                    // 如果更新后的菜单中没有当前路由对应菜单，则跳转到首页
                    router.push({name: 'realtimeStare'});
                }
            });
        }
    },
    /**
     * 添加一个新增用户菜单，并跳转
     *
     * @param context
     * @param payload {object={router: Vue Router Object, viewConfig: object={vc_guid: 视图guid, vc_name: 视图名称}}}
     */
    appendNewTab: (context, payload) => {
        const view = payload.viewConfig, router = payload.router;
        if (view && router
            && !commonTools.isStringEmpty(view.vc_name)
            && !commonTools.isStringEmpty(view.vc_guid)) {
            context.commit({
                type: 'appendToAllNavs',
                newItem: {
                    address: 'customView/' + view.vc_guid,
                    name: view.vc_name,
                    group: 'main',
                    type: 'main',
                    /*区分自定义视图菜单*/
                    customized: true
                }
            });
            router.push({path: 'customView/' + view.vc_guid});
        }
    }
};

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
    setAllNavs: (state, payload) => {
        state.allNavs = payload.newList;
    },
    setNavList: (state, payload) => {
        state.navList = payload.newList;
    },
    appendToAllNavs: (state, payload) => {
        let newItem = payload.newItem;
        let index = state.allNavs.findIndex(nav => nav.address === newItem.address);
        // 根据nav.address判断，如果新加的nav不在allNavs中，则添加进去
        if (index === -1) {
            state.allNavs.push(newItem);
        }
    },
    appendToNavList: (state, payload) => {
        let newItem = payload.newItem;
        let index = state.allNavs.findIndex(nav => nav.address === newItem.address);
        // 根据nav.address判断，如果新加的nav不在allNavs中，则添加进去
        if (index === -1) {
            state.allNavs.push(newItem);
        }
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
    },
    setUserViews: (state, payload) => {
        state.userViews = payload.userViews;
    }
};

export default {
    namespaced: true,
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}

