app.controller('ContactController', function($scope, $http, $location, $routeParams){
    $scope.submit =() => {
    	console.log($scope.contact)
    	$http({
            method:'POST',
            url:'/api/contact/',
            data: $scope.contact,
            headers: {'Content-Type':'application/json'}
        })
        .then(function (res){ 
        console.log(res);
    });
   }
});
