import store from './../../../vuex/index';
import {eventBus} from './../../biz/eventBus/eventBus.js';

(function ($) {
    $.extend({
        common: function () {
            var utils = $.pasUtils();
            //添加最近访问
            this.reqLastVisit = function (scode, sname, dtype, sType, router) {
                if (store.state.auth) {
                    var _data = scode.split('~');
                    if (scode && sname && scode.indexOf('~') > -1 && _data) {
                        if ($.isArray(_data)) {
                            _data[2] = sname;
                            _data[3] = dtype;
                        }
                        utils.addLastVisit(_data, sType);
                        if (1 == dtype) { //组合
                            return;
                        }
                        var _scode = _data[1];
                        _scode = _scode.substr(-2) + _scode.substring(0, _scode.length - 2);
                        store.dispatch({
                            type: 'passScode',
                            scode: _scode
                        });
                        router.push({name: 'stockInfo'});
                    }
                } else {
                    eventBus.$emit('unauthorizedOperation');
                    console.log("未授权，不能添加最近访问");
                }
            };
            return this;
        }
    });
})(jQuery);