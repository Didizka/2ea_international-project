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
    $scope.aboutPage = function(){  
        $location.path("/about");   
    }; 
    $scope.dashboardPage = function(){  
        $location.path("/dashboardPage");   
    }; 
    $scope.homePage = function(){  
        $location.path("/home");   
    };    
    $scope.hospitalsPage = function(){  
        $location.path("/hospitals");   
    };  
    $scope.donatePage = function(){  
        $location.path("/donate");   
    };  
});