app.controller('ContactController', function($scope, $http, $location, $routeParams){
    $scope.submit =() => {
    	console.log($scope.contact)
    	$http({
            method:'POST',
            url:'/api/contact/',
            data: $scope.contact,
            headers: {'Content-Type':'application/json'}
        })
        .then(function (res){ 
        if (res.data.success) {
        	$scope.feedbackContact = 'Thx! Your message has been sent';
        	$("#contactFormFeedback").removeClass('alert-danger');
        	$("#contactFormFeedback").addClass('alert-success');
        } else {
        	$scope.feedbackContact = 'Oops, something went wrong while sending the message. Please try again';
        	$("#contactFormFeedback").removeClass('alert-success');
        	$("#contactFormFeedback").addClass('alert-danger');
        }
    });
   }
});
