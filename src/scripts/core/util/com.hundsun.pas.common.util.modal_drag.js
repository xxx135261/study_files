/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2017/12/13  rencc19758  新增
 * ========    =======  ============================================
*/
import Vue from 'vue';

Vue.directive('modalDrag', {
   bind: function (el, binding, vnode) {
       var $element = $(el);
       var $document = $(document);

       //初始化样式
       $element.find('.modal-header').css({
           cursor: 'move'
       });
       //拖拽参数
       var isDrag = false, xOld, yOld, left, top, height;

       $element.find('.modal-header').mousedown(function (e) {
           isDrag = true;
           xOld = e.pageX;
           yOld = e.pageY;

           left = $element.offset().left;
           top = $element.offset().top;
           height = $element.height();

           $element.css({
               'margin-left': 0,
               'left': left,
               'height': height
           });
       });
       $document.mousemove(function (e) {
           if (isDrag) {
               var xMove = e.pageX - xOld;
               var yMove = e.pageY - yOld;

               if (top + yMove < 0) {
                   yMove = 0 - top;
               }

               $element.css({
                   'top': top + yMove,
                   'left': left + xMove
               });

           }
       });
       $document.mouseup(function () {
           if (isDrag) {
               isDrag = false;
           }
       });
       //Modal完全消失时恢复原位
       $element.parent().on('hidden.bs.modal', function (e) {
           if ($element.hasClass('modal-dialog-sm')) {
               $element.css({
                   'top': '140px',
                   'left': '50%',
                   'margin-left': '-295px'
               });
           } else if ($element.hasClass('modal-dialog-lg')) {
               $element.css({
                   'top': '30px',
                   'left': '50%',
                   'margin-left': '-560px'
               });
           } else {
               $element.css({
                   'top': '30px',
                   'left': '50%',
                   'margin-left': '-450px'
               });
           }
       })
   }
});
