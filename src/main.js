/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2017/10/20  mengjq  新增
 * ========    =======  ============================================
 */
import "babel-polyfill";

//定义vue对象
import Vue from "vue";

//主页定义
import App from "./App";

// 引入echarts
import * as echarts from "echarts";

//路由定义
import router from "./scripts/biz/router/routers";

/* eslint-disable no-new */
//引入验证组件
import VeeValidate from "vee-validate";

//事件总线，提供非父子组件间通信服务。
import { eventBus } from "./scripts/biz/eventBus/eventBus.js";

import store from "./vuex";

import "./modules/global.js";

Vue.prototype.$echarts = echarts;
Vue.config.productionTip = false;
Vue.config.performance = true;

Vue.use(VeeValidate);

new Vue({
    el: "#app",
    components: { App },
    router,
    store,
    render: h => h(App),
    data: {
        eventHub: eventBus
    }
});
