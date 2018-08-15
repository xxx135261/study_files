/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/1/11  rencc19758  新增
 * ========    =======  ============================================
*/
import Vue from 'vue';
import Loading from './../../../modules/vuetemplate/loading/loading.vue';

const Mask = Vue.extend(Loading);

import CommonTools from  './../../core/util/com.hundsun.pas.common.util.public_methods';

const commonTools = new CommonTools();

const toggleMask = (el, binding) => {
    el.mask.visible = binding.value;
}

const insertDom = (el, binding) => {
    let position = el.style.position;
    if (position !== 'absolute' && position !== 'relative') {
        $(el).addClass('loading_parent-node_relative');
    }
    el.appendChild(el.maskEl);
    el.domInserted = true;
    Vue.nextTick(() => {
        el.mask.visible = typeof binding.value == 'boolean' ? binding.value : true;
        let text = el.getAttribute('data-loading-text');
        if (!commonTools.isStringEmpty(text)) {
            el.mask.text = text;
        }
    });
}

Vue.directive('loading', {
    bind: function (el, binding, vnode) {
        let mask = new Mask({
            el: document.createElement('div')
        });
        el.mask = mask;
        el.maskEl = mask.$el;
        insertDom(el, binding);
    },
    update: function (el, binding, vnode) {
        if (binding.oldValue !== binding.value) {
            toggleMask(el, binding);
        }
    },
    unbind: function (el, binding) {
        if (el.domInserted) {
            el.maskEl.parentNode.removeChild(el.maskEl);
        }
    }
});