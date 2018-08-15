import store from './../../../vuex/index.js';

(function ($) {
    $.extend({
        pasUtils: function () {
            const concernApi = com.hundsun.pas.userconcern, recentAccessApi = com.hundsun.pas.userrecentaccess;
            /**
             *
             * @param classOrAttrName
             * @returns {{height: *, width: *, scrollHeight: number, scrollWidth: number, scrollTop: *, scrollLeft: *}}
             */
            this.getVisibleArea = function (classOrAttrName) {
                var $table = $(classOrAttrName);
                return {
                    height: $table.height(),
                    width: $table.width(),
                    scrollHeight: $table.scrollHeight || 0,
                    scrollWidth: $table.scrollWidth || 0,
                    scrollTop: $table.scrollTop(),
                    scrollLeft: $table.scrollLeft()
                }
            };
            this.getDefaultVisibleArea = function () {
                return {
                    height: 100,
                    width: 600,
                    scrollHeight: 0,
                    scrollWidth: 0,
                    scrollTop: 0,
                    scrollLeft: 0
                }
            };
            /**
             * 获取组合Id及组合名称
             */
            this.getPortfolio = function (cb) {
                var deferred = recentAccessApi.getLatest({
                    userId: store.state.userInfo.userId,
                    dataType: '1'
                }, true);
                deferred.pipe(cb);
            };

            this.getDateType = function (dateType) {
                var dateParam = 'SAMPLING_PERIOD=P1M';
                switch (String(dateType)) {
                    case '0':
                        dateParam = 'SAMPLING_PERIOD=P1D'; //每天
                        break;
                    case '1':
                        dateParam = 'SAMPLING_PERIOD=P7D'; //近一周
                        break;
                    case '2':
                        dateParam = 'SAMPLING_PERIOD=P1M'; //近一个月
                        break;
                    case '3':
                        dateParam = 'SAMPLING_PERIOD=P3M'; //近三个月
                        break;
                    case '4':
                        dateParam = 'SAMPLING_PERIOD=P6M'; //近半年
                        break;
                    case '5':
                        dateParam = 'STARTDATETYPE=YearBegin'; //今年以来
                        break;
                }
                return dateParam;
            };
            /**
             * 用于我的关注和最近访问删除数据明细
             * @param _data 键值对  key～value
             * @param sType 请求删除类型，myConcerns:我的关注，recent:最近访问
             * @param callback 回调函数用于返回请求。
             */
            this.deleteSecurity = function (_data, sType, callback) {
                //移除我的关注明细及最近访问明细
                if (_data) {
                    let formData = {
                        userId: store.state.userInfo.userId,
                        keyScheme: _data[0],
                        keyValue: _data[1]
                    }, deferred;
                    if (typeof sType === "string" && "myConcerns" === sType) { //我的关注
                        deferred = concernApi.delete(formData);
                    } else {
                        deferred = recentAccessApi.delete(formData);
                    }
                    deferred.then(callback);
                }
            };
            /**
             * 新增最近访问or我的关注
             * @param _data  键值对  key～value
             * @param sType 请求删除类型，myConcerns:我的关注，recent:最近访问
             * @param callBack 回调函数用于返回请求。
             */
            this.addLastVisit = function (data, sType, callBack) {
                let deferred;
                if (typeof sType === "string" && "myConcerns" === sType) {
                    deferred = concernApi.addOrUpdate({
                        userId: store.state.userInfo.userId,
                        keyScheme: data[0],
                        keyValue: data[1]
                    });
                } else {
                    deferred = recentAccessApi.addOrUpdate({
                        userId: store.state.userInfo.userId,
                        keyScheme: data[0],
                        keyValue: data[1],
                        name: data[2],
                        dataType: data[3]
                    });
                }
                deferred.then(callBack);
            };
            return this;
        }
    });
})(jQuery);