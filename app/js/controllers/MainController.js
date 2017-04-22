app.controller('MainController', function ($scope, $http, $location, $routeParams) {   
    
    $scope.loginPage = function(){  
        $location.path("/login");   
    }; 
    $scope.registerPage = function(){  
        $location.path("/register");   
    }; 
    $scope.contactPage = function(){  
        $location.path("/contact");   
    }; 
    $scope.userPage = function(){  
        $location.path("/userPage");   
    }; 
    $scope.dashboardPage = function(){  
        $location.path("/dashboardPage");   
    }; 
    $scope.homePage = function(){  
        $location.path("/home");   
    };    
    $scope.guidePage = function(){  
        $location.path("/guide");   
    };  
    $scope.hospitalsPage = function(){  
        $location.path("/hospitals");   
    };  
});