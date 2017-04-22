app.controller('DashboardController', function ($scope, $http, $location, $routeParams) {   
    
    $scope.userPage = function(){  
        $location.path("/userPage"); 
    };  
    $scope.uploadPage = function(){  
        $location.path("/uploadPage");  
    };  
});