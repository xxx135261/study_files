/**
 * Created by Administrator on 6/23/2017.
 */
$.register_module({
    name: 'og.common.id', dependencies: [],
    obj: function () {
        var counter = 0;
        return function (prefix) {return (prefix || 'og') + --counter + -new Date;};
    }
});