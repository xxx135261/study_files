/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/5/9  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.vprt.file',
    dependencies: [],
    obj: function() {
        const api = og.api.rest, common = og.api.common, defaultHandler = function () {
        }, transformToPromise = common.transformToPromise;
        return {
            root: 'file',
            /**
             * 上传文件
             *
             * @param portId 组合id
             * @return {*|Promise<any>}
             */
            upload: function(fileName, file) {
                if (!fileName || !file) {
                    throw new Error("Argument: fileName or file should not be null.");
                }

                let root = this.root + "/upload/" + fileName, method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    processData: false,
                    contentType: false
                };
                return transformToPromise(api.request(method, {data: file, meta: meta}));
            },
            /**
             * 下载文件
             *
             * @param type     类型（template: 模板文件, export: 导出文件）
             * @param fileName 文件名
             * @return {*|Promise<any>}
             */
            download: function(type, fileName) {
                let root = this.root + "/download/" + type + '/' + fileName, method = root.split('/');
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                return transformToPromise(api.request(method, {data: {}, meta: meta}));
            }
        }
    }
})