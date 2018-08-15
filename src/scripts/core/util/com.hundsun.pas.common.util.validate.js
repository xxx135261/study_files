/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2017/10/27  rencc19758  新增
 * ========    =======  ============================================
 */
(function($) {
    // 需要验证的元素必须包含val-required属性，且属性值为"true"
    const ATTR_REQUIRED = 'val-required'

    $.extend($.fn, {
        validateEmpty: function(failHandler) {
            var elements = this;
            for(var i = 0; i < elements.length; i++) {
                var ele = elements[i];
                // 不验证没有val-required属性或者其值不为true的元素
                if (!validationRequired(ele)) {
                    continue;
                }
                if (valueEmpty(ele)) {
                    if (failHandler && $.isFunction(failHandler)) {
                        failHandler();
                    }
                    return false;
                }
            }
            return true;
        }
    });

    function validationRequired(element) {
        if (!element.hasAttribute(ATTR_REQUIRED)) {
            return false;
        } else {
            var attrValue = element.getAttribute(ATTR_REQUIRED).toLowerCase();
            if (attrValue === 'true' || attrValue === '') {
                return true;
            }
        }
        return false;
    }

    function valueEmpty(element) {
        var type = element.nodeName.toLowerCase(), value;
        switch (type) {
            case 'input':
                value = $(element).val();
                break;
            default:
                value = element.innerText;
        }
        if (!value || value === '') {
            return true;
        } else {
            return false;
        }
    }
})(jQuery)