app.controller('LoginController', function($scope, $http, $location, $routeParams){
    // Empty userProfile object
    $scope.userProfile = {        
    };   

    // On register form submit (Works with button, not sumbit type to prevent default behaviour of the form)
    $scope.submit = function() {
        // form validation & feedback
        $scope.isValid = true;
        $scope.feedback = "";

        // Dump user profile object to the console for debugging
        // console.log($scope.userProfile);

        // Basic user input validation
        $scope.checkEmptyFields();

        // Send user profile to the server if the validitation is ok
        if ($scope.isValid) $scope.sendData();
        
    };


    $scope.sendData = function() {
        $http({
            method:'GET',
            url:'/api/users/' + $scope.userProfile.username + '/' + $scope.userProfile.password,
            headers: {'Content-Type':'application/json'}
        })
        .then(function (data){ 
        console.log(data);
        data.data.message ? $location.path("/dashboardPage") : $scope.feedback = "Entered username-password combination doesn't exist";
         } );
    }

    $scope.checkEmptyFields = function() {
        if (!$scope.userProfile.username || !$scope.userProfile.password) {
            $scope.feedback += "Not all required fields are filled in\n";  
            $scope.isValid = false;  
        }
    }
});