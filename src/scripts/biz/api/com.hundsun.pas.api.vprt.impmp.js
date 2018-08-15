/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/5/9  rencc19758  新增
 * ========    =======  ============================================
*/
$.register_module({
    name: 'com.hundsun.pas.vprt.impmp',
    dependencies: [],
    obj: function() {
        const api = og.api.rest, common = og.api.common, defaultHandler = function () {
        }, addFormData = common.addFormData, transformToPromise = common.transformToPromise;
        return {
            root: 'vprt_mp',
            /**
             * 获取模板信息
             *
             * @param portId 组合id
             * @return {*|Promise<any>}
             */
            get: function(portId) {
                let root = this.root + "/get", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'port_id', portId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 新增导入模板
             *
             * @param mpInfo 模板信息 {port_id, mp_name, mp_type, file_type, sheet_name, modifier}
             * @return {*|Promise<any>}
             */
            add: function (mpInfo) {
                let root = this.root + "/add", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler
                };
                return transformToPromise(api.request(method, {data: mpInfo, meta: meta}));
            },
            /**
             * 更新模板信息
             *
             * @param mpId     模板id
             * @param mpName   模板名称
             * @param fileType 文件类型（1：xls/xlsx，2：csv）
             * @param modifier 修改人
             * @return {*|Promise<any>}
             */
            update: function(mpId, mpName, fileType, modifier) {
                let root = this.root + "/update", method = root.split('/'), data = {};
                let meta = {
                    type: 'POST',
                    handler: defaultHandler
                };
                addFormData(data, 'mp_id', mpId);
                addFormData(data, 'mp_name', mpName);
                addFormData(data, 'file_type', fileType);
                addFormData(data, 'modifier', modifier);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 删除模板
             *
             * @param mpId 模板id
             * @param modifier 修改人
             * @return {*|Promise<any>}
             */
            delete: function (mpId, modifier) {
                let root = this.root + "/delete", method = root.split('/'), data = {};
                let meta = {
                    type: 'POST',
                    handler: defaultHandler
                };
                addFormData(data, 'mp_id', mpId);
                addFormData(data, 'modifier', modifier);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 获取文件列与需求列对应信息
             *
             * @param mpId 模板id
             * @return {*|Promise<any>}
             */
            getImpMpCol: function (mpId) {
                let root = this.root + "/mpColInfo/get", method = root.split('/'), data = {};
                let meta = {
                    type: 'GET',
                    handler: defaultHandler
                };
                addFormData(data, 'mp_id', mpId);
                return transformToPromise(api.request(method, {data: data, meta: meta}));
            },
            /**
             * 更新模板的文件列与需求列的对应关系
             *
             * @param colList
             * @return {*|Promise<any>}
             */
            updateImpMpCol: function (colList) {
                let root = this.root + "/mpColInfo/update", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json'
                    }
                };
                return transformToPromise(api.request(method, {data: JSON.stringify(colList), meta: meta}));
            },
            /**
             * 上传参考文件获取文件列
             *
             * @param formData FormData
             * @return {*|Promise<any>}
             */
            getFileCols: function (formData) {
                let root = this.root + "/fileCols/get", method = root.split('/');
                let meta = {
                    type: 'POST',
                    handler: defaultHandler,
                    processData: false,
                    contentType: false
                };
                return transformToPromise(api.request(method, {data: formData, meta: meta}));
            }
        }
    }
})