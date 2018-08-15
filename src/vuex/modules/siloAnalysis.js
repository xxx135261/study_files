/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/8  rencc19758  新增
 * ========    =======  ============================================
*/
import Vue from 'vue';

const state = {
    // 前五大买卖
    awkwardness: [{
        name: '--',
        'Buy Volume': {value: ''},
        'Buy Price Range': {value: ''},
        'Buy Amount': {value: ''},
        name_sell: '--',
        'Sell Volume': {value: ''},
        'Sell Price Range': {value: ''},
        'Sell Amount': {value: ''}
    }],
    // 调仓收益
    heavyIndustry: [{
        name: '--',
        'Nontrade PnL': {value: ''},
        'Range PnL': {value: ''},
        'Trade PnL': {value: ''},
        name_loss: '--',
        'Nontrade PnL_loss': {value: ''},
        'Range PnL_loss': {value: ''},
        'Trade PnL_loss': {value: ''}
    }],
    // 前五大买卖明细
    fivedealInfo: [{
        name: '--',
        securityId: '',
        'Buy Volume': {value: ''},
        'Buy Price Range': {value: ''},
        'Buy Amount': {value: ''},
        'Sell Volume': {value: ''},
        'Sell Price Range': {value: ''},
        'Sell Amount': {value: ''}
    }],
    // 调仓收益明细
    adjustedInfo: [{
        name: '--',
        securityId: '',
        'Nontrade PnL': {value: ''},
        'Range PnL': {value: ''},
        'Trade PnL': {value: ''}
    }],
    // 调仓收益总体分析（文字部分）
    siloInfo: {
        silo_round: "今日",
        'Trade Count': '--',
        'Good Trade Count': '--',
        'Trade PnL': '--'
    },
    // 日均换手率数据
    dailyExchangeRate: {
        value: '--',
        transValue: '--'
    }
}

const mutations = {
    initAwkwardness: (state, payload = {}) => {
        state.awkwardness = [];
        let num = payload.num || 5;
        for (let i = 0; i < num; i++) {
            let data = {}, cell = {};
            cell.value = '';
            data.name = '--';
            data['Buy Volume'] = cell;
            data['Buy Price Range'] = cell;
            data['Buy Amount'] = cell;
            data.name_sell = '--';
            data['Sell Volume'] = cell;
            data['Sell Price Range'] = cell;
            data['Sell Amount'] = cell;
            Vue.set(state.awkwardness, i, data);
        }
    },
    initHeavyIndustry: (state, payload = {}) => {
        state.heavyIndustry = [];
        let num = payload.num || 5;
        for (let i = 0; i < num; i++) {
            let data = {}, cell = {};
            cell.value = '';
            data.name = '--';
            data['Nontrade PnL'] = cell;
            data['Range PnL'] = cell;
            data['Trade PnL'] = cell;
            data.name_loss = '--';
            data['Nontrade PnL_loss'] = cell;
            data['Range PnL_loss'] = cell;
            data['Trade PnL_loss'] = cell;
            Vue.set(state.heavyIndustry, i, data);
        }
    },
    initFivedealInfo: (state, payload = {}) => {
        state.fivedealInfo = [];
        let num = payload.num || 1;
        for (let i = 0; i < num; i++) {
            let data = {}, cell = {};
            cell.value = '';
            data.name = '--';
            data.securityId = '--';
            data['Buy Volume'] = cell;
            data['Buy Price Range'] = cell;
            data['Buy Amount'] = cell;
            data['Sell Volume'] = cell;
            data['Sell Price Range'] = cell;
            data['Sell Amount'] = cell;
            Vue.set(state.fivedealInfo, i, data);
        }
    },
    initAdjustedInfo: (state, payload = {}) => {
        state.adjustedInfo = [];
        let num = payload.num || 1;
        for (let i = 0; i < num; i++) {
            let data = {}, cell = {};
            cell.value = '';
            data.name = '--';
            data.securityId = '--';
            data['Nontrade PnL'] = cell;
            data['Range PnL'] = cell;
            data['Trade PnL'] = cell;
            Vue.set(state.adjustedInfo, i, data);
        }
    },
    setFivedealInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.fivedealInfo = payload.newVal;
        }
    },
    setAdjustedInfo: (state, payload = {}) => {
        if (payload.newVal) {
            state.adjustedInfo = payload.newVal;
        }
    }
}

export default {namespaced: true, state, mutations}