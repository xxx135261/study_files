/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/4/18  mengjq  新增
 * ========    =======  ============================================
 */
alert(require.context);
// console.log(require.context("./script/", true, /\.js$/));
export default function remoteLoad(url, hasCallback) {
    return createScript(url);

    /**
     * 创建script
     * @param url
     * @returns {Promise}
     */
    function createScript(url) {
        var scriptElement = document.createElement("script");
        document.body.appendChild(scriptElement);
        var promise = new Promise((resolve, reject) => {
            scriptElement.addEventListener("load", e => {
                removeScript(scriptElement);
                if (!hasCallback) {
                    resolve(e);
                }
            }, false);
            scriptElement.addEventListener("error", e => {
                removeScript(scriptElement);
                reject(e);
            }, false);
            if (hasCallback) {
                window.____callback____ = function() {
                    resolve();
                    window.____callback____ = null;
                };
            }
        });

        if (hasCallback) {
            url += "&callback=____callback____";
        }
        scriptElement.src = url;
        return promise;
    }

    /**
     * 移除script标签
     * @param scriptElement script dom
     */
    function removeScript(scriptElement) {
        document.body.removeChild(scriptElement);
    }
}
