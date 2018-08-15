/**
 * 检查是否包含类名
 *
 * @param el HTMLElement
 * @param className 类名
 * @return {boolean}
 */
export function hasClass(el, className) {
    if (!el || !className) return false;
    // 类名不能包含空格
    if (className.indexOf(' ') !== -1) {
        throw new Error('className should not contain space.');
    }
    if (el.classList) {
        return el.classList.contains(className);
    } else {
        return (' ' + el.className + ' ').indexOf(' ' + className + ' ') > -1;
    }
};

/**
 * 添加单个/多个类名
 *
 * @param el HTMLElement
 * @param className 类名
 */
export function addClass(el, className) {
    if (!el) return;
    var curClass = el.className;
    // 按空格分割类名
    var classes = (className || '').split(' ');

    for (var i = 0, j = classes.length; i < j; i++) {
        var clsName = classes[i];
        if (!clsName) {
            continue;
        }

        if (el.classList) {
            el.classList.add(clsName);
        } else if (hasClass(el, clsName)) {
            curClass += ' ' + clsName;
        }
    }
    if (!el.classList) {
        el.className = curClass;
    }
};

/**
 * 移除类名
 *
 * @param el HTMLElement
 * @param className 类名
 */
export function removeClass(el, className) {
    if (!el || !className) return;
    var classes = className.split(' ');
    var curClass = ' ' + el.className + ' ';

    for (var i = 0, j = classes.length; i < j; i++) {
        var clsName = classes[i];
        if (!clsName) continue;

        if (el.classList) {
            el.classList.remove(clsName);
        } else if (hasClass(el, clsName)) {
            curClass = curClass.replace(' ' + clsName + ' ', ' ');
        }
    }
    if (!el.classList) {
        el.className = trim(curClass);
    }
};