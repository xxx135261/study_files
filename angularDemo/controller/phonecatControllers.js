phonecatApp_module.controller('phonecatControllers',['$scope','$window',phonecatControllers]);
function phonecatControllers($scope,$window){
		$scope.app = {};
    $scope.submitBtnDisabled = false;

    $scope.create = create;

    init();

    function init() {
      initOrganization();
		}
		
		function initOrganization(){

		}
}

// 路由配置
phonecatApp_module.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/phones',{
				templateUrl: 'template/phone-list.html',
        controller: 'PhoneListCtrl'
			}).
			when('/phones/:phoneId',{
				templateUrl: 'template/phone-detail.html',
        controller: 'PhoneDetailCtrl'
			}).
			otherwise({
				redirecTo:'/phones'
			})
	}
])