// 定义模块并注入依赖
var phonecatApp_module = angular.module('phonecatApp',['ngRoute'])

/** page module 定义*/
// 首页
var index_module = angular.module('index', ['toastr', 'angular-loading-bar']);
//user
var user_module = angular.module('user', ['toastr', 'app.service', 'angular-loading-bar']);
//login
var login_module = angular.module('login', ['toastr', 'app.util']);
// PhoneDetail
PhoneList_module = angular.module('phoneList',[]);
// PhoneDetail
PhoneDetail_module = angular.module('phoneDetail',[]);