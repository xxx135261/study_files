/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2017/10/20  mengjq  新增
 * ========    =======  ============================================
 */
import Vue from "vue";
import VueRouter from "vue-router";
import store from "../../../vuex/index";
//引入路由插件
Vue.use(VueRouter);

import mainframe from "@/modules/vuetemplate/mainframe";
import realtimeStare from "@/modules/vuetemplate/realtimeStare";

var routerMenus = [{
    name: "index",
    path: "/",
    redirect: { name: "realtimeStare" }
}, {
    name: "mainframe",
    path: "",
    component: mainframe,
    redirect: {
        name: "realtimeStare"
    },
    children: [{
        name: "realtimeStare",
        path: "realtimeStare",
        component: realtimeStare,
        meta: { keepAlive: false/*不需要被缓存*/ }
    }, {
        name: "compositeProfile",
        path: "compositeProfile",
        component: function(resolve) {
            require(["@/modules/vuetemplate/compositeProfile"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "positionAnalysis",
        path: "positionAnalysis",
        component: function(resolve) {
            require(["@/modules/vuetemplate/positionAnalysis"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "siloAnalysis",
        path: "siloAnalysis",
        component: function(resolve) {
            require(["@/modules/vuetemplate/siloAnalysis"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "riskAnalysis",
        path: "riskAnalysis",
        component: function(resolve) {
            require(["@/modules/vuetemplate/riskAnalysis"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "profitAndLoss",
        path: "profitAndLoss",
        component: function(resolve) {
            require(["@/modules/vuetemplate/profitAndLoss"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "attriBution",
        path: "attriBution",
        component: function(resolve) {
            require(["@/modules/vuetemplate/attriBution"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "myConcern",
        path: "myConcern",
        component: function(resolve) {
            require(["@/modules/vuetemplate/myConcern"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "recentVisit",
        path: "recentVisit",
        component: function(resolve) {
            require(["@/modules/vuetemplate/recentVisit"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "myCombination",
        path: "myCombination",
        component: function(resolve) {
            require(["@/modules/vuetemplate/myCombination"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "portfolioAnalysis",
        path: "portfolioAnalysis",
        component: function(resolve) {
            require(["@/modules/vuetemplate/portfolioAnalysis"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "aggregationManager",
        path: "aggregationManager",
        component: function(resolve) {
            require(["@/modules/vuetemplate/aggregationManager"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "divideManager",
        path: "divideManager",
        component: function(resolve) {
            require(["@/modules/vuetemplate/divideManager"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "userInfo",
        path: "userInfo",
        component: function(resolve) {
            require(["@/modules/vuetemplate/userInfo"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "operator",
        path: "operator",
        component: function(resolve) {
            require(["@/modules/vuetemplate/operator"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "role",
        path: "role",
        component: function(resolve) {
            require(["@/modules/vuetemplate/role"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "groupPermission",
        path: "groupPermission",
        component: function(resolve) {
            require(["@/modules/vuetemplate/groupPermission"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "stockInfo",
        path: "stockInfo",
        component: function(resolve) {
            require(["@/modules/vuetemplate/stockInfo"], resolve);
        },
        meta: { keepAlive: true/*需要被缓存*/ }
    }, {
        name: "customView",
        path: "customView/:id",
        component: function(resolve) {
            require(["@/modules/vuetemplate/editableView.vue"], resolve);
        },
        props: true
    }, {
        name: "newViewport",
        path: "newViewport",
        component: function(resolve) {
            require(["@/modules/vuetemplate/previewView.vue"], resolve);
        }
    }]
}];

//创建路由实现导航栏
const router = new VueRouter({
    mode: "history",
    linkActiveClass: "active", //将激活的路由添加一个mui-active类名称
    routes: routerMenus
});

router.mode = "html5";

//路由钩子
router.beforeEach((to, from, next) => {
    const TO_ROUTE_NAME = to.name;
    // 演示用uk=guest
    const GUEST_UK_COOKIE = "Z3Vlc3Q=";
    let uk = $.cookie("uk");

    // cookie: uk不存在，则添加一个演示用uk
    if (!uk) {
        uk = GUEST_UK_COOKIE;
        document.cookie = "uk=Z3Vlc3Q=";
        document.cookie = "una=guest";
        document.cookie = "ck=1";
        document.cookie = "companyno=0";
        document.cookie = "iscus=0";
        document.cookie = "uss=4";
        document.cookie = "cst=05dfac17756ce7c02dc1d355caed2eb5";
        document.cookie = "ust=ad8eb9d3e0edef0bd30ddd9462aa3251";
    }

    // 如果uk存在且不是演示用账户，则设置授权状态为true
    if (uk != GUEST_UK_COOKIE) {
        store.commit({
            type: "setAuth",
            auth: true
        });
    } else {
        store.commit({
            type: "setAuth",
            auth: false
        });
    }

    // 授权状态
    let auth = store.state.auth;
    if (auth) {
        next();
    } else {
        if (TO_ROUTE_NAME == "realtimeStare") {
            next();
        } else {
            next({ name: "realtimeStare" });
        }
    }
});

const TYPE_MAIN = "main";
const TYPE_SIDE = "side";
const TYPE_CLOSABLE = "closable";
const ROUTE_LOGIN = "/login";
const ROUTE_STOCKINFO = "/stockInfo";

router.afterEach(function(to, from) {
    const FROM_ROUTE_PATH = from.fullPath;
    const TO_ROUTE_PATH = to.fullPath;
    const mainNavs = store.getters["navigate/getNavByType"](TYPE_MAIN);
    const sideNavs = store.getters["navigate/getNavByType"](TYPE_SIDE);
    const closableNavs = store.getters["navigate/getNavByType"](TYPE_CLOSABLE);
    console.log("From: " + FROM_ROUTE_PATH + " To: " + TO_ROUTE_PATH);

    if (isTabExist(FROM_ROUTE_PATH) && isTabExist(TO_ROUTE_PATH)) {
        // 由登录页跳转或跳转到登录页或浏览器刷新
        if ((FROM_ROUTE_PATH === ROUTE_LOGIN && TO_ROUTE_PATH != ROUTE_LOGIN)
            || (FROM_ROUTE_PATH == "/") || (TO_ROUTE_PATH === ROUTE_LOGIN)) {
            if (belongTo(TO_ROUTE_PATH, sideNavs)) {
                let navGoTo = sideNavs.find(nav => "/" + nav.address === TO_ROUTE_PATH);
                store.commit({
                    type: "navigate/setNavList",
                    newList: store.getters["navigate/getFixedNavs"].concat(
                        store.getters["navigate/getNavByGroup"](navGoTo.group)
                    )
                });
            } else if (belongTo(TO_ROUTE_PATH, closableNavs) /*&& TO_ROUTE_PATH != ROUTE_STOCKINFO*/
                && (store.state.navigate.closableNavList.length === 0
                    || store.state.navigate.closableNavList.findIndex(nav => nav.address === TO_ROUTE_PATH) === -1)) {
                let newItem = closableNavs.find(nav => "/" + nav.address === TO_ROUTE_PATH);
                store.commit({
                    type: "navigate/appendToClosableNavList",
                    newItem: newItem
                });
            }
            return;
        }

        if ((belongTo(FROM_ROUTE_PATH, mainNavs) && belongTo(TO_ROUTE_PATH, mainNavs))
            || (belongTo(FROM_ROUTE_PATH, mainNavs) && belongTo(TO_ROUTE_PATH, closableNavs))
            // || (belongTo(FROM_ROUTE_PATH, sideNavs) && belongTo(TO_ROUTE_PATH, closableNavs))
            // || (belongTo(FROM_ROUTE_PATH, closableNavs) && belongTo(TO_ROUTE_PATH, closableNavs))
            || (FROM_ROUTE_PATH === TO_ROUTE_PATH)) {
            // 处理当跳转过去的可关闭项不存在于导航列表（navList）的情况
            if (belongTo(TO_ROUTE_PATH, closableNavs) && (store.state.navigate.closableNavList.length === 0
                || store.state.navigate.closableNavList.findIndex(nav => nav.address === TO_ROUTE_PATH) === -1)) {
                let newItem = closableNavs.find(nav => "/" + nav.address === TO_ROUTE_PATH);
                store.commit({
                    type: "navigate/appendToClosableNavList",
                    newItem: newItem
                });
            }
        } else if ((belongTo(FROM_ROUTE_PATH, mainNavs) || belongTo(FROM_ROUTE_PATH, sideNavs) || (belongTo(FROM_ROUTE_PATH, closableNavs)))
            && belongTo(TO_ROUTE_PATH, sideNavs)) {
            let navGoTo = sideNavs.find(nav => "/" + nav.address === TO_ROUTE_PATH);
            store.commit({
                type: "navigate/setNavList",
                newList: store.getters["navigate/getFixedNavs"].concat(
                    store.getters["navigate/getNavByGroup"](navGoTo.group)
                )
            });
        } else if ((belongTo(FROM_ROUTE_PATH, sideNavs) && belongTo(TO_ROUTE_PATH, mainNavs))
            || (belongTo(FROM_ROUTE_PATH, closableNavs) && belongTo(TO_ROUTE_PATH, mainNavs))) {
            store.commit({
                type: "navigate/setNavList",
                newList: store.getters["navigate/getNavByGroup"](TYPE_MAIN)
            });
        } else if ((belongTo(FROM_ROUTE_PATH, sideNavs) && belongTo(TO_ROUTE_PATH, closableNavs))
            || (belongTo(FROM_ROUTE_PATH, closableNavs) && belongTo(TO_ROUTE_PATH, closableNavs))) {
            store.commit({
                type: "navigate/setNavList",
                newList: store.getters["navigate/getFixedNavs"].concat(
                    store.getters["navigate/getNavByGroup"]("main")
                )
            });
            let newItem = closableNavs.find(nav => "/" + nav.address === TO_ROUTE_PATH);
            store.commit({
                type: "navigate/appendToClosableNavList",
                newItem: newItem
            });
        } else {
            console.error("Error occurs on router transition!");
            store.commit({
                type: "navigate/setNavList",
                newList: store.getters["navigate/getNavByGroup"](TYPE_MAIN)
            });
        }
    }

    // 记录上次访问
    if (belongTo(TO_ROUTE_PATH, mainNavs) && isTabExist(TO_ROUTE_PATH)) {
        store.commit({
            type: "setLastVisit",
            lastVisit: TO_ROUTE_PATH
        });
    }
    // 当离开证券详情（stockInfo）时，移除证券详情页
    if (FROM_ROUTE_PATH === ROUTE_STOCKINFO && TO_ROUTE_PATH != ROUTE_STOCKINFO) {
        store.commit({
            type: "navigate/removeClosableNav",
            path: from.name
        });
    }
});

function belongTo(routeFullPath, navs) {
    return navs.findIndex(nav => "/" + nav.address === routeFullPath) >= 0;
}

function isTabExist(routeFullPath) {
    const allNavs = store.state.navigate.allNavs;
    return allNavs.findIndex(nav => "/" + nav.address === routeFullPath) >= 0 || routeFullPath == "/";
}

export default router;