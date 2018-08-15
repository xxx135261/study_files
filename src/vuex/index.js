/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2017/11/13  mengjq  新增
 * ========    =======  ============================================
 */
import Vue from 'vue';

import Vuex from 'vuex';

import * as actions from './actions';

import getters from './getters';

import mutations from './mutations'

/**
 * 导航菜单栏
 */
import navigate from './modules/navigate';


/**
 * 实时盯盘
 */
import realtimeStare from './modules/realtimeStare';

/**
 * 组合概貌
 */
import compositeProfile from './modules/compositeProfile';

/**
 * 持仓分析
 */
import positionAnalysis from './modules/positionAnalysis';

/**
 * 调仓分析
 */
import siloAnalysis from './modules/siloAnalysis';

/**
 * 风险分析
 */
import riskAnalysis from './modules/riskAnalysis';

/**
 * 盈亏分析
 */
import profitAndLoss from './modules/profitAndLoss';

/**
 * 归因分析
 */
import attribution from './modules/attribution';

/**
 * 我的关注
 */
import myConcern from './modules/myConcern';

/**
 * 最近访问
 */
import recentVisit from './modules/recentVisit';

/**
 * 组合分析
 */
import myCombination from './modules/myCombination';

/**
 * 模拟组合
 */
import portfolioAnalysis from './modules/portfolioAnalysis';

/*自定义视图配置*/
import newCreate from './modules/newCreate';

Vue.use(Vuex);

//记录当前系统的所有状态
const state = {
    //用于识别私募系统登录
    adapter: {
        enabled: false,
        name: "smzj",
        smzj_login: "https://www.hscloud.cn/smzj/pas/login.html",
        private_pas: 'https://www.hscloud.cn/console/privateEquity/private_pas.html'

    },
    currentState: 'realtimeStare',
    lastVisit: '/realtimeStare',
    /*用户授权状态*/
    auth: false,
    scode: '',
    selectGroup: {id: '', name: ''},
    userInfo: {
        loginId: '', /*登录用户名*/
        userId: '', /*用户id*/
        loginName: '', /*用户名称*/
        userName: '' /*系统右上角展示的用户名称*/
    }
};


/**
 *
 */
export default new Vuex.Store({
    state,
    actions,
    getters,
    mutations,
    modules: {
        navigate,
        realtimeStare,
        compositeProfile,
        positionAnalysis,
        siloAnalysis,
        riskAnalysis,
        profitAndLoss,
        attribution,
        myConcern,
        recentVisit,
        myCombination,
        portfolioAnalysis,
        newCreate
    },
    trict: process.env.NODE_ENV !== 'production'
})
