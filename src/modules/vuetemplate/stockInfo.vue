<template>
    <div id="stockInfo" v-loading="loading">
        <iframe frameborder="0" id="stockFrame" :src="url" :style="styleObject" allowtransparency='true'></iframe>
    </div>
</template>

<script>
    export default {
        name: 'stockInfo',
        data() {
            return {
                width: 0,
                height: 0,
                loading: true
            }
        },
        mounted() {
            this.setIFrameSize();
            let _self = this;
            $(window).on('resize', function() {
                _self.setIFrameSize();
            });
            let stockFrame = document.getElementById("stockFrame");
            // 兼容IE
            if (stockFrame.attachEvent) {
                stockFrame.attachEvent('onload', function () {
                    _self.loading = false;
                });
            } else {
                stockFrame.onload = function () {
                    _self.loading = false;
                }
            }
        },
        computed: {
            url: function() {
                let scode = this.$store.state.scode;
                if (!scode) {
                    scode = 'sh000001';
                }
                let src;
                if (/^[0-9]+$/.test(scode)) {
                    src = "https://jijin.baidu.com/fund/ifundinfo?fundCode=" + scode;
                } else {
                    src = "https://gupiao.baidu.com/stock/" + scode.toLowerCase() + ".html";
                }
                this.loading = true;
                return src;
            },
            styleObject: function() {
                return {
                    'width': this.width + 'px',
                    'height': this.height + 'px',
                    'background-color': '#FFFFFF'
                }
            }
        },
        watch: {
            '$route' (to, from) {}
        },
        methods: {
            setIFrameSize() {
                this.width = window.innerWidth - 282;
                this.height = window.innerHeight - 103;
            }
        }
    }
</script>