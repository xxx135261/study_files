/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/2/28  mengjq  新增
 * ========    =======  ============================================
 */

import '../api/og.api.rest.customviewport.js';

var customViewport = {
    saveCustomViewport: function (config) {
        return og.api.rest.customviewport.get(config);
    },
    deleteCustomView : function (param) {
        return og.api.rest.customviewport.delete(param);
    }
};


export default customViewport;