/**
 * Created by Administrator on 7/3/2017.
 */
$.register_module({
    name: 'com.hundsun.pas.api.rest',
    dependencies: ['com.hundsun.pas.dev', 'com.hundsun.pas.api.common', 'com.hundsun.pas.common.events'],
    obj: function () {
        var module = this, live_data_root = module.live_data_root, api, common = com.hundsun.pas.api.common,
            encode = window['encodeURIComponent'], post_processors = {},
            time_out_soon = 300000, /* 5m */
            time_out_forever = 7200000 /* 2h */;
        var post_process = function (data, url) {
            return post_processors[url] ? post_processors[url](data) : data;
        };
        post_processors[live_data_root + 'compressor/compress'] = function (data) {
            return (data.data = data.data.replace(/\=/g, '-').replace(/\//g, '_').replace(/\+/g, '.')), data;
        };
        var request = function (method, config, promise) {
            var no_post_body = {GET: 0, DELETE: 0}, is_get = config.meta.type === 'GET',
                url = (config.url || (config.meta.type in no_post_body ? [live_data_root + method.map(encode).join('/'), $.param(config.data, true)].filter(Boolean).join('?') : live_data_root + method.map(encode).join('/'))),
                promise = new common.Promise();
            var send = function () {
                $.ajax({
                    url: url,
                    type: is_get ? 'POST' : config.meta.type,
                    data: is_get ? $.extend(config.data, {method: 'GET'}) : config.data,
                    headers: config.meta.headers || {'Accept': 'application/json', 'Cache-Control': 'no-cache'},
                    dataType: 'text',//config.meta.datatype || 'json',
                    timeout: config.meta.timeout || (is_get ? time_out_soon : time_out_forever),
                    beforeSend: function (xhr, req) {
                        // var aborted=
                    },
                    success: function (data, status, xhr) {
                        if (promise.ignore) {
                            return;
                        }
                        var meta = {content_length: xhr.responseText.length, url: url, promise: promise.id},
                            location = xhr.getResponseHeader('location'), result, cache_for;
                        if (location && ~!location.indexOf('?')) {
                            meta.id = location.split('/').pop();
                        }
                        var parsedata = !data || data === '' ? null : JSON.parse(data);
                        result = {error: false, message: status, data: post_process(parsedata, url), meta: meta};
                        // cache_for =config.meta.cache_for
                        config.meta.handler(result);
                        promise.deferred.resolve(result);
                    },
                    error: function (xhr, status, error) {
                        if (error === 'timeout' && is_get && config.meta) {
                            return send();
                        }
                        var result = {
                            error: xhr.status || true, data: null,
                            meta: {content_length: (xhr.responseText || '').length, url: url, promise: promise.id},
                            message: status === 'parseerror' ? '' : xhr.responseText || '....'
                        };
                        if (error === 'abort') {
                            return;
                        }
                        config.meta.headers(result);
                        promise.deferred.resolve(result);
                    }
                });
            };
            return config.meta.dry ? promise : send(), promise;
        };
        api = {
            off: com.hundsun.pas.common.events.off,
            on: com.hundsun.pas.common.events.on,
            request: request,
        }
        return api;
    }
});