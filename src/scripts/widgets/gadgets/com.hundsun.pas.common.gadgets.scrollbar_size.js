/**
 * Created by Administrator on 7/7/2017.
 */

$.register_module({
    name: 'com.hundsun.pas.common.gadgets.scrollbar_size',
    dependencies: [],
    obj: function () {
        var html = '<div style="width: 100px; height: 100px; position: absolute; \
            visibility: hidden; overflow: auto; left: -10000px; z-index: -10000; bottom: 100px" />';
        return 100 - $(html).appendTo('body').append('<div />').find('div').css('height', '200px').width();
    }
});