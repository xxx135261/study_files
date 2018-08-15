/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2017/12/14  hspcadmin  新增
 * ========    =======  ============================================
*/

 $.register_module({
     name: 'com.hundsun.pas.value.repoconfigs',
     dependencies: ['og.api.rest', 'og.api.common'],
     obj: function() {
         var api = og.api.rest, check = og.api.common.check;
         return {
             root: 'valueConfiguration/repoConfigs',
             getValues: function(type, valueCalcName) {
                 var root = this.root, method,data = {}, meta = {};
                 if (type == null){
                     root += "/all"
                     method = root.split('/');
                 } else {
                     var type = type;
                     root +="/values/" + type;
                     method = root.split('/')
                 }
                 if(valueCalcName != null) {
                     data = {valueCalcName : valueCalcName};
                 }
                 meta = check({
                     bundle: {method: root + '#get', config : {}}
                 })
                 return api.request(method, {data: data, meta: meta});
             },
         }
     }
 })