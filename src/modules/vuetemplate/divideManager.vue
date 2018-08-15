<template src="../html/divideManager.html"></template>

<script>
	 export default {
        name: 'divideManager',
        data() {
        	return{
        		estabTime:null,
        		isShow:true,
        	}
        },
         computed: {
			
		 },
        methods:{
        	slideUp(event){
        		let el = $(event.target);
        		if(this.isShow == true){
        			$('.search_panel').slideUp(300);
        			this.isShow = false;
        		}else{
        			$('.search_panel').slideDown(300);
        			this.isShow = true;
        		}
        	},
        	//绑定时间控件
		    dateBlock(str){
		    	let $scope = this;
		    		laydate({
				        elem:str,
				        type:'date',
				        format:'YYYYMMDD',
				        position: 'static',
				        istoday: true, //是否显示今天
				        done: (value) => {
				          $scope.estabTime = value
				        }
			     });
		    },
        	
        }
   }
</script>

<style scoped>
    @import "../../styles/default1/TabClass/aggregationManager.css";
</style>