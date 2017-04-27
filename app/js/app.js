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
    .when('/dashboardPage',{
    templateUrl:'views/dashboard.html',
    controller:'DashboardController'
    })
    .when('/profilePage',{
    templateUrl:'views/profilePage.html',
    controller:'DashboardController'
    })
    .when('/uploadPage',{
    templateUrl:'views/uploadPage.html',
    controller:'UploadPageController'
    })
    .when('/guide',{
    templateUrl:'views/guide.html',
    controller:'MainController'
    })
    .when('/hospitals',{
    templateUrl:'views/hospitals.html',
    controller:'HospitalsController'
    })
    .otherwise({
    redirectTo: '/' 
    });
});


	 

