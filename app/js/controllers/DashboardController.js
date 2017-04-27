app.controller('DashboardController', function ($scope, $http, $location, $routeParams) {   
    
    $scope.askForSession = function() {
        $http({
            method:'GET',
            url:'/api/session/',
            headers: {'Content-Type':'application/json'}
        })
        .then(function (data){ 
        	data.data.session ? $scope.user = data.data.session : $location.path("/login");
        	console.log($scope.user);
    	});

    }

    $scope.askForSession();

    $scope.profilePage = function() {
    	$location.path("/profilePage");
    };

    $scope.userPage = function(){  
        $location.path("/userPage"); 
    };  
    $scope.uploadPage = function(){  
        $location.path("/uploadPage");  
    };  
    $scope.logout = function(){  
        $http({
            method:'GET',
            url:'/api/logout/',
            headers: {'Content-Type':'application/json'}
        })
        .then(function (data){ 
        	if (data.data.logout) $location.path("/login");
    	}); 
    };  
});