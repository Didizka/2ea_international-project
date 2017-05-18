app.controller('MainController', function ($scope, $http, $location, $routeParams, $window) {   
    // Go to the specified router and scroll down to the correct section
    $scope.loginPage = function(){  
        $location.path("/login");   
        setTimeout(function () {
            $window.location.href = "#login";
        }, 100)
        
    }; 
    $scope.registerPage = function(){  
        $location.path("/register");  
        setTimeout(function () {
        $window.location.href = "#register"; 
        }, 100)
    }; 
    $scope.contactPage = function(){  
        $location.path("/contact"); 
        setTimeout(function () {
        $window.location.href = "#contact"; 
        }, 100) 
    }; 
    $scope.aboutPage = function(){  
        $location.path("/about");  
        setTimeout(function () {
        $window.location.href = "#about";
        }, 100) 
    }; 
    $scope.dashboardPage = function(){  
        $location.path("/dashboardPage")
        setTimeout(function () {; 
        $window.location.href = "#dashboard";
        }, 100)  
    }; 
    $scope.homePage = function(){  
        $location.path("/home");   
    };    
    $scope.hospitalsPage = function(){  
        $location.path("/hospitals"); 
        setTimeout(function () {
        $window.location.href = "#hospitals";
        }, 100)  
    };  
    $scope.donatePage = function(){  
        $location.path("/donate");  
        setTimeout(function () {
        $window.location.href = "#donate"; 
        }, 100)
    };  
});