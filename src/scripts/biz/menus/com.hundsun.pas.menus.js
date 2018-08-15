/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 07/29/17  mengjq  新增
 * ========    =======  ============================================
*/

export const menus = {
    realtimeStare: {
        address: 'realtimeStare',
        icon: 'fa fa-bar-chart',
        name: '实时盯盘',
        group: 'main',
        type: 'main',
        fixed: false
    },
    compositeProfile: {
        address: 'compositeProfile',
        icon: 'fa fa-bold',
        name: '组合概貌',
        group: 'main',
        type: 'main'
    },
    positionAnalysis: {
        address: 'positionAnalysis',
        icon: 'fa fa-university',
        name: '持仓分析',
        group: 'main',
        type: 'main'
    },
    siloAnalysis: {
        address: 'siloAnalysis',
        icon: 'fa fa-database',
        name: '调仓分析',
        group: 'main',
        type: 'main'
    },
    riskAnalysis: {
        address: 'riskAnalysis',
        icon: 'fa fa-line-chart',
        name: '风险分析',
        group: 'main',
        type: 'main'
    },
    profitAndLoss: {
        address: 'profitAndLoss',
        icon: 'fa fa-hourglass-half',
        name: '盈亏分析',
        group: 'main',
        type: 'main'
    },
    attriBution: {
        address: 'attriBution',
        icon: 'fa fa-area-chart',
        name: '归因分析',
        group: 'main',
        type: 'main'
    },
    myConcern: {
        address: 'myConcern',
        icon: 'fa fa-star-o',
        name: '我的关注',
        group: 'myConcern',
        type: 'side'
    },
    recentVisit: {
        address: 'recentVisit',
        icon: 'fa fa-hand-pointer-o',
        name: '最近访问',
        group: 'recentVisit',
        type: 'side'
    },
    myCombination: {
        address: 'myCombination',
        icon: 'fa fa-laptop fa-clone',
        name: '组合分析',
        group: 'myCombination',
        type: 'side'
    },
    portfolioAnalysis: {
        address: 'portfolioAnalysis',
        icon: 'fa fa-jpy',
        name: '模拟组合',
        type: 'side',
        group: 'portfolioAnalysis'
    },
    userInfo: {
        address: 'userInfo',
        name: '用户信息',
        group: 'pms',
        type: 'side',
        group: 'userInfo'
    },
    operator: {
        address: 'operator',
        name: '操作员管理',
        group: 'pms',
        type: 'side',
        group: 'operator'
    },
    role: {
        address: 'role',
        name: '角色管理',
        group: 'pms',
        type: 'side',
        group: 'role'
    },
    groupPermission: {
        address: 'groupPermission',
        name: '组合权限设置',
        group: 'pms',
        type: 'side',
        group: 'groupPermission'
    },
    stockInfo: {
        address: 'stockInfo',
        name: '证券信息',
        type: 'side',
        group: 'stockInfo'
    },
    divideManager: {
        address: 'divideManager',
        name: '维度划分方式管理',
        type: 'side',
        group: 'divideManager'
    },
    aggregationManager: {
        address: 'aggregationManager',
        name: '维度管理',
        type: 'side',
        group: 'aggregationManager'
    },
    newViewport: {
        address: 'newViewport',
        name: '未命名页面',
        group: 'closable',
        type: 'closable',
        closable: true
    }
};
