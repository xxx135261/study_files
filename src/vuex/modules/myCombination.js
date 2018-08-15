/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/9  rencc19758  新增
 * ========    =======  ============================================
*/

const basicInfoData = {
    name: '--',
    'Total Return P1D': {value: ''},
    'Total Return P1M': {value: ''},
    'Total Return P1Y': {value: ''},
    'Total Return BP1D': {value: ''},
    'Total Return BP1Y': {value: ''},
    'Total Return BP1M': {value: ''},
    'Portfolio Security Volume': {value: ''},
    'Market Value': {value: ''},
    'UNAV': {value: ''},
    'HTS Latest': {value: ''},
    'Rank P1M': {value: ''},
    'Rank P1Y': {value: ''},
    dayOverReturn: '--',
    monthOverReturn: '--',
    yearOverReturn: '--'
};

const state = {
    basicInfo: [basicInfoData],
    // 组合选择下拉栏
    optionInfo: [{
        id: 'AgPrt~UserPortfolios',
        name: '全部'
    }]
}

const mutations = {
    initBasicInfo: state => {
        state.basicInfo = [basicInfoData];
    }
}

export default {namespaced: true, state, mutations}