/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2017/10/30  rencc19758  新增
 * ========    =======  ============================================
*/
(function ($) {
    $.extend({
        numberUtils: function () {
            /**
             * 将数值形式的字符串转换为数值
             *
             * @param str 字符串
             * @param trims array or str,需要去除的字符串(列表)
             */
            this.convertNumber = function (str, trims) {
                if (!str || typeof str != 'string') {
                    return null;
                }
                if (Array.isArray(trims)) {
                    trims.forEach(function (value) {
                        str = str.replace(new RegExp(value, "g"), "");
                    });
                } else {
                    str = str.replace(new RegExp(trims, "g"), "");
                }
                return Number(str);
            };

            /**
             * 默认正则模式
             *
             * @type {RegExp}
             * 可以匹配形如以下形式的字符串:
             * case1: 8,000.00
             * case2: -8000.00
             * case3: 8000.00
             * case4: 8000
             */
            var numPattern = /^(-?\d+)(,?\d+)*(\.\d+)?$/;

            /**
             * 验证数值字符串
             *
             * @param pattern 正则模式
             * @param str 字符串
             */
            this.validateNumber = function (pattern, str) {
                if (!str || str === '') {
                    return false;
                }
                // pattern为空，使用默认的pattern
                if (!pattern) {
                    pattern = numPattern;
                }
                return pattern.test(str);
            };

            /**
             * 将位数多的数字加','分隔
             *
             * @param number
             * @return {string|*}
             */
            this.getDivision = function (number) {
                var num = 0, index = 0, arr = [], str, remainnum, newIndex;
                index = String(number).indexOf('.');
                if (index == -1) {
                    index = String(number).length;
                    num = parseInt(index / 3);
                    remainnum = index % 3;
                } else {
                    num = parseInt(index / 3);
                    remainnum = index % 3;
                }
                arr = String(number).split('');
                for (var i = 1; i < num + 1; i++) {
                    newIndex = index - 3 * i;
                    arr.splice(newIndex, 0, ',');
                }
                str = arr.join('');
                if (remainnum == 0) {
                    str = str.slice(1);
                }
                return str;
            }

            return this;
        }
    })
})(jQuery)