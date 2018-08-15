/***
 * @author mengjq@hundsun.com
 * @date 2018.1.18
 */
var CommonTools = function() {
    /**
     * 用于返回json时增加meta属性;
     * 目前暂时只支持string字段;
     **/
    this.toJsonMeta = function(data) {
        var meta = {};
        for (var index in data) {
            if (Array.isArray(data[index])) {
                meta[index] = [];
                data[index].forEach(function(obj, i) {
                    meta[index][i] = toJsonMeta(obj);
                });

            } else if (data[index] === null) {
                continue;
            } else if (typeof(data[index]) === "object") {
                meta[index] = this.toJsonMeta(data[index]);
            } else {
                meta[index] = "string";
            }
        }
        return meta;
    };
    /**
     * 处理数据为null情况
     */
    this.getRidOfNullData = function(data) {
        var newData = {};
        for (var index in data) {
            if (Array.isArray(data[index])) {
                newData[index] = [];
                data[index].forEach(function(obj, i) {
                    newData[index][i] = this.getRidOfNullData(obj);
                });

            } else if (data[index] === null) {
                continue;
            } else if (typeof(data[index]) === "object") {
                newData[index] = this.getRidOfNullData(data[index]);
            } else {
                newData[index] = data[index];
            }
        }
        return newData;
    };

    /**
     * 判断字符串是否为空
     *
     * @param str 字符串
     * @return {boolean}
     */
    this.isStringEmpty = function(str) {
        if (typeof str !== "string") {
            return true;
        }

        // 去除首尾的空白符
        str = str.trim();
        if (str === "") {
            return true;
        }
        return false;
    };

    /**
     * 发送事件消息(禁止使用Function.Prototype.call/apply方式调用来改变函数内this的默认指向)
     *
     * @param context 当前组件实例
     * @param componentName 监听事件的组件名
     * @param eventName 事件名
     * @param params 参数
     */
    this.dispatch = function(context, componentName, eventName, params) {
        let target = this.getSpecifiedParent(context, componentName);
        if (target) {
            target.$emit.call(parent, eventName, params);
        }
    };

    /**
     * 获取指定组件名的父组件实例
     *
     * @param context 当前组件实例
     * @param componentName 组件名
     * @return {*} Vue组件实例
     */
    this.getSpecifiedParent = function(context, componentName) {
        var parent = context.$parent || context.$root;
        var name = parent.$options.name;

        while (parent && (!name || name !== componentName)) {
            parent = parent.$parent;

            if (parent) {
                name = parent.$options.name;
            }
        }
        if (parent) {
            return parent;
        } else {
            return null;
        }
    };

    /**
     * 移除自动登录所需的cookie
     */
    this.removeAutoLoginCookies = function() {
        $.removeCookie("auto_login");
        $.removeCookie("password");
        $.removeCookie("login_no");
    };

    /**
     * 判断当前浏览器是否为IE
     *
     * @return Boolean
     */
    this.isIE = function() {
        var userAgent = navigator.userAgent;
        return userAgent.indexOf("compatible") > -1
            && userAgent.indexOf("MSIE") > -1
            /*IE11*/
            || userAgent.indexOf("Trident") > -1;
    };

    /**
     * 添加路由
     *
     * @param views 用户菜单数据
     * @param rootStore Vuex根实例
     */
    const addRoutes = function(views, rootStore) {
        if (views && views.length > 0) {
            views.forEach(view => {
                rootStore.commit({
                    type: "navigate/appendToAllNavs",
                    newItem: {
                        address: "customView/" + view.vc_guid,
                        name: view.vc_name,
                        group: "main",
                        type: "main",
                        /*区分自定义视图菜单*/
                        customized: true
                    }
                });
            });
        }
    };

    /**
     * 加载用户菜单到路由
     *
     * @param router Vue Router对象
     * @param rootStoreVuex根实例
     */
    this.loadUserViewsRoutes = function(router, rootStore) {
        let viewCache = sessionStorage.getItem("userViews");
        // 无缓存菜单数据，则去后台加载
        if (!viewCache) {
            rootStore.dispatch({
                type: "navigate/loadUserViews",
                router: router
            });
        } else {
            viewCache = JSON.parse(viewCache);

            // 先将缓存的视图存放到store
            rootStore.commit({
                type: 'navigate/setUserViews',
                userViews: viewCache
            });

            // 先将缓存的视图加载到路由中
            addRoutes(viewCache, rootStore);

            // 更新视图
            rootStore.dispatch({
                type: "navigate/loadUserViews",
                router: router
            });
        }
    };

};

export default CommonTools;

