/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 07/29/17  mengjq  新增
 * ========    =======  ============================================
*/
(function () {
  //加载上一次的主题
  var theme = function () {
    var theme = "gray";
    if (localStorage.getItem("theme")) {
      if (document.getElementById("theme-css")) {
        document.getElementById("theme-css").href = '/prototype/styles/themes/' + localStorage.getItem("theme") + '.css';
        return;
      }
      theme = localStorage.getItem("theme");
    }
    var head = document.getElementsByTagName('head').item(0);
    var style = document.createElement('link');
    style.href = '/prototype/styles/themes/' + theme + '.css';
    style.rel = 'stylesheet';
    style.id = 'theme-css';
    head.appendChild(style);
  }
  //更改主题
  changeTheme = function (element) {
    localStorage.setItem("theme", element.getAttribute("class"));
    theme();
  };
  theme();
})();