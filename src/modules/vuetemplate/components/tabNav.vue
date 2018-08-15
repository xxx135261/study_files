<template>
    <!--tab路由切换导航栏-->
    <header class="panel-heading custom-tab header-section1">
        <div id="scroll_x">
            <button class="roll-nav roll-left J_tabLeft" @click="leftmove()"><i class="fa fa-backward"></i></button>
            <div id='rol_wrap' class="rol_x" ref="scrolls">
                <ul class="nav nav-tabs" ref="navs">
            		<router-link tag="li" @click.native="moveTab(this)" v-for="(item, index) in navList" :url="item.address" :key="item.address"
                                 :to="'/' + item.address">
                        <a>
	                        <span v-html="item.name"></span>&nbsp;<i :class="item.icon"></i>
	                        <span class="closable-icon"><i class="fa fa-times-circle" v-if="item.closable"
	                                                       @click.prevent.stop="closeTab(item)"></i></span>
	                       	<span class="active-border"></span>
                        </a>
                    </router-link>
                    <li v-show="navList[0].type == 'main'" >
                        <a class="newCreate" @click="addMenus()">
                            <span>新建</span>&nbsp;<i class="fa fa-plus"></i>
                            <span class="active-border"></span>
                        </a>
                    </li>
                </ul> 
            </div>
            <button class="roll-nav roll-right J_tabRight" @click="rightmove()"><i class="fa fa-forward"></i></button>
        </div>
    </header>
</template>

<script>
    export default {
        name: "tab-nav",
        data() {
            return {
                routerConfig: {
                    name: "newViewport",
                    path: "newViewport",
                    component: function(resolve) {
                        require(["../newCreate"], resolve);
                    },
                    meta: { keepAlive: true }
                },
                
            };
        },
        computed: {
            navList() {
                return this.$store.state.navigate.navList.concat(this.$store.state.navigate.closableNavList);
            }
        },
        beforeRouteLeave(to, from, next) {
            if (confirm("当前页面尚未保存，离开页面将丢失")) {
                return next(false);
            }
            next();
        },
        methods: {
            //导航滚动
            leftmove() {
                if (this.$refs.navs.offsetLeft < 0) {
                    this.$refs.navs.style.left = 0;
                } 
            },
            rightmove() {
            	var listBox = this.$refs.navs; 
            	var liList = listBox.getElementsByTagName('li');//所有列表元素
                var totalWidth = 0;  
				for(let i=0;i<liList.length;i++){
				  totalWidth = totalWidth + liList[i].offsetWidth; //所有列表元素的总宽度
				}
                var scrollGap = this.$refs.scrolls.offsetWidth;
                if (totalWidth > scrollGap) {
                    var offsetX = totalWidth - scrollGap;
                    listBox.style.left = -offsetX + 'px';
                }
            },
            moveTab(e){
            	var box = this.$refs.scrolls; //外面的容器。
            	var listBox = this.$refs.navs; //ul列表。主要是移动它的left值
            	var liList = listBox.getElementsByTagName('li');//所有列表元素
            	//为了判断是左滑还是右滑
            	var width = box.clientWidth/2;  
				var totalWidth = 0;  
				for(let i=0;i<liList.length;i++){
				  totalWidth = totalWidth + liList[i].offsetWidth; //所有列表元素的总宽度
				}
				for(let i=0;i<liList.length;i++){
				  var _offset = totalWidth - box.clientWidth; //右边的偏移量
				  liList[i].addEventListener('click', function (e) {
				    var offset =totalWidth - (Math.abs(listBox.offsetLeft) + box.clientWidth) + 100; //右边的偏移量 = 所有元素宽度之和 - （ul容器的左偏移量 + 父容器的宽度）
				    if(e.pageX > width && offset > 0){  //点击右侧并且右侧的偏移量大于0，左滑。
				      listBox.style.left = (listBox.offsetLeft-80) + 'px';
				    }else if(e.pageX > width && offset > 80){ //临界位置，，右侧滚动到末尾
				      listBox.style.left = -_offset + 'px';
				    }
				    if(e.pageX < width && listBox.offsetLeft < -80) { //点击左侧并且左侧的偏移量小于0，左滑。
				      listBox.style.left = (listBox.offsetLeft + 80) + 'px';
				 
				    }else if(e.pageX < width && listBox.offsetLeft < 0){ //临界位置，左侧滚到开始的位置
				      listBox.style.left = 0
				    }
				  });
				 }
            },
            //关闭导航
            closeTab(item) {
                // TODO: 配合目前唯一一个可以关闭的tab，自定义视图，实现的解决方案
                let navList = this.$store.state.navigate.navList;
                this.$router.push({ path: "/" + navList[navList.length - 1].address });
            },
            //新建页面导航
            addMenus() {
                //如果在未命名页面上进行切换，则提示会丢失数据，强制切换时，则清空当前页面
                if (this.$route.name.indexOf("newViewport") != -1) {
                    $.alert({ content: "当前页面尚未保存，不允许新增页面!", title: "温馨提示" });
                    return;
                } else {
                    //选中当前新建页面
                    this.$router.push({
                        path: "/newViewport"
                    });
                }
            }
        }
    };
</script>

<style scoped>
    @import "../../../styles/default1/SideCss/tabnav.css";
</style>

