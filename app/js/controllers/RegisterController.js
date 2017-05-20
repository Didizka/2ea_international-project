
app.controller('RegisterController', function($scope, $http, $location, $routeParams){    

    // Empty userProfile object
    $scope.userProfile = {        
    };    
    
    
    // On register form submit (Works with button, not sumbit type to prevent default behaviour of the form)
    $scope.submit = function() {
        // form validation & feedback
        $scope.isValid = true;
        $scope.feedback = "";

        // Dump user profile object to the console for debugging
        console.log($scope.userProfile);

        // Basic user input validation
        $scope.checkEmptyFields();
        $scope.checkPasswordMatch();

        // Send user profile to the server if the validitation is ok
        if ($scope.isValid) $scope.sendData();
        
    };

    $scope.throwError = (error) => {
        $scope.feedbackRegister = error;
        $("#registerFormFeedback").removeClass('alert-success');
        $("#registerFormFeedback").addClass('alert-danger');
    }


    $scope.sendData = function() {
        $http({
            method:'POST',
            url:'/api/users',
            headers: {'Content-Type':'application/json'},
            data: $scope.userProfile
        })
        .then(function (res){ 
            if(res.data.message) {
                $scope.feedbackRegister = 'Thx! Your profile has been created';
                $("#registerFormFeedback").removeClass('alert-danger');
                $("#registerFormFeedback").addClass('alert-success');
            } else {
                $scope.throwError('This username is already in use. Please choose another one');
            }
        });
    }

    $scope.checkEmptyFields = function() {
        if (!$scope.userProfile.firstname || !$scope.userProfile.lastname || !$scope.userProfile.email || !$scope.userProfile.username || !$scope.userProfile.password || !$scope.userProfile.passwordConfirm) {
            $scope.throwError('Not all required fields are filled in');
            $scope.isValid = false;  
        }
    }

    $scope.checkPasswordMatch = function() {
        if ($scope.userProfile.password !== $scope.userProfile.passwordConfirm) {
            $scope.throwError("Passwords don't match");
            $scope.isValid = false; 
        }
    }
});