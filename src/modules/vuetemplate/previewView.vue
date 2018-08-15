/**
* 组件名：可预览自定义视图配置组件
*
* ##接口说明##
* 函数：
* 事件：
* 参数：
*/
<template>
    <div style="width: 100%;height: 100%;">
        <component ref="current" @update="onUpdate" :viewConfig="propConfig" :is="current"></component>
        <div class="edit-wrap" @click.prevent.stop="exit" v-show="current == customView">
            <span class="fa fa-edit"></span>
            <p class="edit-text">返回</p>
        </div>
    </div>
</template>

<script>
    import customView from './customView.vue';
    import newCreate from './newCreate.vue';

    export default {
        name: 'PreviewView',
        data() {
            return {
                /*当前挂载的组件*/
                current: newCreate,
                customView: customView,
                /*用于传递给子组件的config*/
                propConfig: null,
                /*原始配置界面config*/
                rawConfig: null
            }
        },
        beforeRouteLeave(to, from, next) {
            if ((this.current == newCreate && !this.$refs.current.saved) || this.current == customView) {
                $.confirm({
                    title: "温馨提示!",
                    content: "离开页面将丢失未保存内容，是否继续离开？",
                    buttons: {
                        "确定": () => {
                            this.$store.commit({
                                type: "navigate/removeClosableNav",
                                path: "newViewport"
                            });
                            next();
                        },
                        "取消": () => {
                            next(false);
                            this.exit();
                        }
                    }
                });
            } else {
                this.$store.commit({
                    type: "navigate/removeClosableNav",
                    path: "newViewport"
                });
                next();
            }
        },
        methods: {
            loadData() {
                if (this.current == customView) {
                    this.$refs.current.loadData();
                }
            },
            /**
             * 切换编辑页面
             */
            exit() {
                if (this.current == customView) {
                    this.propConfig = this.rawConfig;
                    this.current = newCreate;
                }
            },
            /**
             * 编辑视图保存成功事件回调函数
             *
             * @param config 视图配置对象
             * @param type 更新时间类型（"edit": 更新视图保存，"preview": 预览视图）
             * @param rawConfig 原始视图配置对象
             */
            onUpdate(config, type, rawConfig) {
                if (type == 'preview') {
                    this.propConfig = config;
                    this.rawConfig = rawConfig;
                    this.current = customView;
                }
            }
        }
    }
</script>