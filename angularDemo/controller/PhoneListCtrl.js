PhoneList_module.controller('PhoneListCtrl',['$scope','$http',PhoneListCtrl]);

function PhoneListCtrl($scope,$http) {
	$http.get('phones/phones.json').success((data)=>{
		$scope.phones = data;
	})
	$scope.orderProp = 'age';
}
