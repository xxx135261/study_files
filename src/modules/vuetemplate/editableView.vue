/**
* 组件名：可编辑视图
*
* ##接口说明##
* 函数：
* 事件：
* 参数：
*   id：自定义视图guid。
*/
<template>
    <div style="width: 100%;height: 100%;">
        <component ref="current" @update="onUpdate" :viewConfig="propConfig" :id="id" :is="current"></component>
        <div class="edit-wrap" @click.prevent.stop="edit">
            <span class="fa fa-edit"></span>
            <p class="edit-text">{{editBtnText}}</p>
        </div>
    </div>
</template>

<script>
    import customView from './customView.vue';
    import newCreate from './newCreate.vue';

    export default {
        name: 'EditableView',
        data() {
            return {
                /*当前挂载的组件*/
                current: customView,
                /*用于传递给子组件的config*/
                propConfig: {},
                /*原始配置界面config*/
                rawConfig: null,
                editBtnText: '编辑'
            }
        },
        props: {
            /*自定义视图guid*/
            id: {
                type: String,
                required: true
            }
        },
        beforeRouteUpdate(to, from, next) {
            this.onRouteLeave(to, from, next);
        },
        beforeRouteLeave(to, from, next) {
            this.onRouteLeave(to, from, next);
        },
        computed: {
            /*用户所有自定义视图配置*/
            userViewConfigs() {
                return this.$store.state.navigate.userViews;
            }
        },
        watch: {
            '$route'(to, from) {
                this.current = customView;
                this.loadData();
                this.editBtnText = '编辑';
            }
        },
        mounted() {
            this.loadData();
        },
        methods: {
            loadData() {
                if (this.current == customView) {
                    this.propConfig = this.getViewConfigById(this.id);
                    this.$nextTick(() => {
                        this.$refs.current.loadData();
                    });
                }
                this.rawConfig = null;
            },
            /**
             * 切换编辑页面
             */
            edit() {
                // 切换编辑页
                if (this.current == customView) {
                    // 如果是从预览页跳转到编辑页，不从userViews中获取config，否则会丢失之前视图配置的修改
                    if (this.editBtnText == '编辑') {
                        this.propConfig = this.getViewConfigById(this.id) || this.rawConfig;
                    } else {
                        this.propConfig = this.rawConfig;
                    }
                    this.current = newCreate;
                    this.editBtnText = '退出';
                } else {
                    $.confirm({
                        title: "温馨提示!",
                        content: "离开页面将丢失未保存内容，是否继续离开？",
                        buttons: {
                            "确定": () => {
                                this.propConfig = this.getViewConfigById(this.id);
                                this.rawConfig = null;
                                this.current = customView;
                                this.editBtnText = '编辑';
                            },
                            "取消": () => {

                            }
                        }
                    });
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
                if (type == 'edit') {
                    // 更新userViews中存储的视图配置json
                    let userViews = Object.clone(this.$store.state.navigate.userViews);
                    let index = userViews.findIndex(view => view.vc_guid == this.id);
                    let updatedConfig;
                    com.hundsun.pas.customviews
                        .getSingle(this.$store.state.userInfo.userId, this.id, true)
                        .pipe(result => {
                           let config = result.data;
                           if (config) {
                               updatedConfig = JSON.parse(config.vc_layout_code);
                           }
                        });
                    if (index > -1) {
                        userViews[index].vc_layout_code = JSON.stringify(updatedConfig);
                    }
                    this.$store.commit({
                        type: 'navigate/setUserViews',
                        userViews: userViews
                    });
                    this.propConfig = this.rawConfig = updatedConfig;
                    this.current = customView;
                    this.editBtnText = '编辑';
                } else if (type == 'preview') {
                    this.propConfig = config;
                    this.rawConfig = rawConfig;
                    this.current = customView;
                    this.editBtnText = '返回';
                }
            },
            /**
             * 路由离开或者更新事件回调函数
             *
             * @param to
             * @param from
             * @param next
             */
            onRouteLeave(to, from, next) {
                // 处于编辑页面或者处于预览状态时，离开当前路由弹出提醒
                if (this.current == newCreate || this.editBtnText == '返回') {
                    $.confirm({
                        title: "温馨提示!",
                        content: "离开页面将丢失未保存内容，是否继续离开？",
                        buttons: {
                            "确定": () => {
                                next();
                            },
                            "取消": () => {
                                next(false);
                            }
                        }
                    });
                } else {
                    next();
                }
            },
            /**
             * 根据视图配置guid获取视图配置对象
             *
             * @param guid
             * @return {*} 返回视图配置对象，如果不存在则返回null
             */
            getViewConfigById(guid) {
                let viewConfig;
                if (guid) {
                    const viewConfigs = this.userViewConfigs;
                    let userView = viewConfigs.find(config => config.vc_guid == guid);
                    if (userView) {
                        viewConfig = userView.vc_layout_code ? JSON.parse(userView.vc_layout_code) : null;
                    }
                }
                return viewConfig;
            }
        }
    }
</script>