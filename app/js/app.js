// Main module
var app = angular.module("App", ['ngRoute']);


// Routes
app.config(function($routeProvider){
$routeProvider
    .when('/',{
    templateUrl:'views/home.html',
    controller:'MainController'
    })
    .when('/home',{
    templateUrl:'views/home.html',
    controller:'MainController'
    })
    .when('/login',{
    templateUrl:'views/login.html',
    controller:'LoginController'
    })
    .when('/contact',{
    templateUrl:'views/contact.html',
    controller:'MainController'
    })
    .when('/register',{
    templateUrl:'views/register.html',
    controller:'RegisterController'
    })
    .when('/userPage',{
    templateUrl:'views/userPage.html',
    controller:'UserPageController'
    })
    .when('/guide',{
    templateUrl:'views/guide.html',
    controller:'MainController'
    })
    .otherwise({
    redirectTo: '/' 
    });
});


	 

