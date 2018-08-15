/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/22  rencc19758  新增
 * ========    =======  ============================================
*/
import Table from '../../../modules/vuetemplate/components/pas-table.vue';
import TableColumn from '../../../modules/vuetemplate/components/pas-table-column.vue';

export const PASTable = {
    install: function (Vue, options) {
        Vue.component('pas-table', Table);
        Vue.component('pas-table-column', TableColumn);
    }
}
