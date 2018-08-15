<template>
    <div class="sidebarNav">
        <ul class="nav nav-pills nav-stacked custom-nav">
            <li class="menu-list introduction-farm" id="menu_myconcern" data-step="1" data-intro='Hello step one!'>
                <router-link :to="{name: 'myConcern'}" type="myConcern">
                    <i class="fa fa-star-o sidenav-icon"></i>
                    <span class="menu_title">我的关注</span>
                </router-link>
               <span class="icon_next">
                	<i class="fa fa-angle-double-down" v-if="isMore1"></i>
                	<i class="fa fa-angle-double-up" v-else></i>
                </span>
                <span class="li_more" type="myConcern" @click.stop="more($event,0)">{{text}}</span>
                <ul class="sub-menu-list list1" v-loading="loading1" style="height: 130px;">
                    <li v-for="(nav,index) in concernNavs" :key="index" v-if="nav.Name != undefined" class="menu_li">
                        <a href="javascript:;">
                        	<span class="itemwrap" v-bind:class="{'red-bg':nav.state!='' && nav.state=='up','green-bg':nav.state!='' && nav.state=='down'}">
                        		<span class="item_name" :positionId="nav['positionId']" :securityId="nav['securityId']"
                                  :nodeId="nav['nodeId']" :title="nav.Name" @click="menuClick($event)" type="myConcern">{{nav.Name}}</span>
                            	<span class="ch_price">
                            	<span class="item_price"
                                  	v-bind:class="nav['Price Fluctuation Range'] | priceColor" :title="nav['Latest Price']">{{nav['Latest Price']}}</span>
                            	<i class="change-arrow"
                               		v-bind:class="{'fa fa-arrow-up red-font':nav.state!='' && nav.state=='up','fa fa-arrow-down green-font':nav.state!='' && nav.state=='down','fa fa-minus':nav.state!='' && nav.state=='smooth'}"></i>
                            	</span>
                            	<span class="item_limit"
                                  	v-bind:class="nav['Price Fluctuation Range'] | priceColor" :title="nav['Price Fluctuation Range']">{{nav['Price Fluctuation Range']}}</span>
                        	</span>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="menu-list" id="menu_recentvisit" data-step="2" data-intro='Hello step two!'>
                <router-link :to="{name: 'recentVisit'}" type="recentVisit">
                    <i class="fa fa-clock-o sidenav-icon"></i>
                    <span class="menu_title" ref="title2">最近访问</span>
                </router-link>
                <span class="icon_next">
                	<i class="fa fa-angle-double-down" v-if="isMore2"></i>
                	<i class="fa fa-angle-double-up" v-else></i>
                </span>
                <span class="li_more" @click="more($event,1)" type="recentVisit">{{text}}</span>
          <!--      <div class="scrll-wrap scroll2">-->
                <ul class="sub-menu-list list2" v-loading="loading2" style="height: 286px;">
                    <li v-for="(nav,index) in visitNavs" :key="index" v-if="nav.Name != undefined" class="menu_li">
                        <a href="javascript:;">
                        	<span class="itemwrap" v-bind:class="{'red-bg':nav.state!='' && nav.state=='up','green-bg':nav.state!='' && nav.state=='down'}">
                            	<span class="item_name" :positionId="nav.positionId" :securityId="nav['securityId']" :nodeId="nav.nodeId" :title="nav.Name" @click="menuClick($event)" type="recentVisit">{{nav.Name}}</span>
                            	<span class="ch_price">
                            		<span class="item_price" v-bind:class="nav['Price Fluctuation Range'] | priceColor" :title="nav['Latest Price']">{{nav['Latest Price']}}</span>
                            		<i class="change-arrow" v-bind:class="{'fa fa-arrow-up red-font':nav.state!='' && nav.state=='up','fa fa-arrow-down green-font':nav.state!='' && nav.state=='down','fa fa-minus':nav.state!='' && nav.state=='smooth'}"></i>
                            	</span>
                            	<span class="item_limit fontchange" v-bind:class="nav['Price Fluctuation Range'] | priceColor" :title="nav['Price Fluctuation Range']">{{nav['Price Fluctuation Range']}}</span>
                        	</span>
                        </a>
                    </li>
                </ul>
                <!--</div>-->
            </li>
            <li class="menu-list" id="menu_mycombination">
                <router-link :to="{name: 'myCombination'}" type="myCombination">
                    <i class="fa fa-laptop fa-clone sidenav-icon"></i>
                    <span class="menu_title">我的组合</span>
                </router-link>
                <router-link tag="span" class="goPortfoli" :to="{name: 'portfolioAnalysis'}"></router-link>
                <span class="icon_next">
                	<i class="fa fa-angle-double-down" v-if="isMore3"></i>
                	<i class="fa fa-angle-double-up" v-else></i>
                </span>
                <span class="li_more" @click="more($event,2)" type="myCombination">{{text}}</span>
                <!--<div class="scrll-wrap scroll3">-->
                <ul class="sub-menu-list list3" v-loading="loading3" style="height: 260px;">
                    <li class="menu_li" v-for="(nav,index) in combinNavs" :key="index" v-if="nav.Name != undefined">
                        <a href="javascript:;">
                        	<span class="itemwrap" v-bind:class="{'red-bg':nav.state!='' && nav.state=='up','green-bg':nav.state!='' && nav.state=='down'}">
                           		<span class="item_name" :positionId="nav.positionId" :securityId="nav.securityId" :nodeId="nav.nodeId" :title="nav.Name" @click="menuClick($event)" type="myCombination">{{nav.Name}}</span>
                            	<span class="ch_price">
                            		<span class="item_price" v-bind:class="nav['UNAV Fluctuation Range'] | priceColor" :title="nav['UNAV']">{{nav['UNAV']}}</span>
                            		<i class="change-arrow" v-bind:class="{'fa fa-arrow-up red-font':nav.state!='' && nav.state=='up','fa fa-arrow-down green-font':nav.state!='' && nav.state=='down','fa fa-minus':nav.state!='' && nav.state=='smooth'}"></i>
                            	</span>
                            	<span class="item_limit fontchange" v-bind:class="nav['UNAV Fluctuation Range'] | priceColor" :title="nav['UNAV Fluctuation Range']">{{nav['UNAV Fluctuation Range']}}</span>
                        	</span>
                        </a>
                    </li>
                </ul>
                <!--</div>-->
            </li>
        </ul>
    </div>
</template>

<script>
    
    import sidebar from '../../../scripts/biz/views/com.hundsun.pas.sidebar';
    export default sidebar;
</script>

<style scoped>
  	@import "../../../styles/default1/SideCss/leftSide.css";
    @import "../../../styles/default1/SideCss/leftSideCollapse.css";
    @import "../../../styles/default1/SideCss/sidebarnav.css";
</style>