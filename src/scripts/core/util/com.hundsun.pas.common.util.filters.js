import Vue from 'vue';

export const priceColorFilter = function (value) {
    var color = 'blac-font';
    if (value) {
        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        if (value < 0) {
            color = 'green-font';
        } else if (value === 0) {
            color = 'error-font';
        } else if (value > 0) {
            color = 'red-font';
        }
    }
    return color;
}

Vue.filter('priceColor', priceColorFilter);

Vue.filter('securityNameFilter', function (value) {
    if (value) {
        var index = value.lastIndexOf(';');
        if (index != -1 && value.length > index) {
            return value.substr(index + 1);
        }
    }
});

Vue.filter('objToJSONString', function (obj) {
    if (obj) {
        return JSON.stringify(obj);
    }
});