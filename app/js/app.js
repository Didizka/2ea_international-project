// Main module
var app = angular.module("App", ['ngRoute','ngFileUpload']);


// Routes
app.config(function($routeProvider){
$routeProvider
    .when('/',{
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
    .when('/about',{
    templateUrl:'views/about.html',
    controller:'MainController'
    })
    .when('/dashboardPage',{
    templateUrl:'views/dashboard.html',
    controller:'DashboardController'
    })
    .when('/hospitals',{
    templateUrl:'views/hospitals.html',
    controller:'HospitalsController'
    })
    .when('/donate',{
    templateUrl:'views/donate.html',
    controller:'DonateController'
    })
    .otherwise({
    redirectTo: '/' 
    });
});


	 

