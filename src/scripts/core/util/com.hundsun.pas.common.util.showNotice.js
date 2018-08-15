import toastr from '../../base/jquery/toastr/toastr.min.js';

(function ($) {
    toastr.options = {
        closeButton: false,
        debug: false,
        progressBar: true,
        positionClass: "toast-top-center",
        onclick: null,
        showDuration: "300",
        hideDuration: "1000",
        timeOut: "2000",
        extendedTimeOut: "1000",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut"
    };
    var showNotice = {
        /**
         * @param content 需要显示的notice文本内容
         * @param type notice类型（默认是"success"，）包括：success、warning、danger
         */
        showNotice: (content, type) => {
            toastr[!type ? 'success' : type](content);
        }
    };
    $.extend(showNotice);
})(jQuery);
