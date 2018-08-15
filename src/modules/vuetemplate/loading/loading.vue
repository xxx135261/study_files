<template>
    <div class="loading_mask" v-show="visible">
        <div class="loading_spinner">
            <i class="fa fa-spinner" v-show="!timeoutFlag"></i>
            <i class="fa fa-warning" v-show="timeoutFlag"></i>
            <p v-show="!timeoutFlag">{{text}}</p>
            <p v-show="timeoutFlag">{{timeoutText}}</p>
        </div>
    </div>
</template>
<script>
    import store from './../../../vuex/index';

    export default {
        name: 'loading',
        data() {
            return {
                text: '拼命加载中...',
                timeoutText: "数据请求超时",
                /*超时标识*/
                timeoutFlag: false,
                /*超时时长，默认5分钟*/
                timeout: 1000 * 60 * 5,
                visible: false,
                loadingTimeOut: null,
                isExternalUser: store.state.adapter.enabled
            }
        },
        watch: {
            visible: {
                immediate: true,
                handler(newVal) {
                    // 外部用户一律不显示loading
                    if (this.isExternalUser) {
                        this.visible = false;
                        return;
                    }
                    if (newVal) {
                        let _self = this;
                        // 如果超过设定的超时时间，visible仍为true，则超时
                        this.loadingTimeOut = setTimeout(function () {
                            if (_self.visible) {
                                _self.timeoutFlag = true;
                            }
                        }, this.timeout);
                    } else {
                        if (this.loadingTimeOut != null && this.loadingTimeOut != undefined) {
                            // 未超时则取消执行setTimeout中的回调函数，并重置超时标识
                            clearTimeout(this.loadingTimeOut);
                            this.loadingTimeOut = null;
                            this.timeoutFlag = false;
                        }
                    }
                }
            }
        }
    }
</script>
<style>
    @import "./../../../styles/default1/Loading/loading.css";
</style>