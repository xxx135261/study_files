/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/4/19  rencc19758  新增
 * ========    =======  ============================================
*/
const state = {
    /*展示设置可选项*/
    exhibitionOptions: [{
        name: '成本',
        value: '{"pairValueName":"Position Cost", "positiveOrNegativeOrNull":"0"}'
    }, {
        name: '市值前五',
        value: '{"pairValueName":"Market Value", "visibleCount":"5"}'
    }, {
        name: '调仓亏损前五',
        value: '{"pairValueName":"Trade PnL", "visibleCount":"5", "orderBy":"ASC", "positiveOrNegativeOrNull":"-1"}'
    }, {
        name: '调仓盈利前五',
        value: '{"pairValueName":"Trade PnL", "visibleCount":"5", "positiveOrNegativeOrNull":"1"}'
    }, {
        name: '买入前五',
        value: '{"pairValueName":"Buy Amount", "visibleCount":"5", "positiveOrNegativeOrNull":"0"}'
    }, {
        name: '卖出前五',
        value: '{"pairValueName":"Sell Amount", "visibleCount":"5", "positiveOrNegativeOrNull":"0"}'
    }, {
        name: '市值占比前十',
        value: '{"pairValueName":"Weight", "pairValueProperties":{"Value":"Market Value"}}, "visibleCount":"10"}'
    }, {
        name: '区间盈亏亏损前五',
        value: '{"pairValueName":"Weight", "visibleCount":"5", "orderBy":"ASC", "positiveOrNegativeOrNull":"-1"}'
    }]
}

export default {state}