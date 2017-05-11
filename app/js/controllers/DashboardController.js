app.controller('DashboardController', ['$scope', '$http', '$location', 'Upload', function ($scope, $http, $location, Upload) {   
    
    // Get user if he has successfully logged in and started a session
    $scope.askForSession = function() {
        $http({
            method:'GET',
            url:'/api/session/',
            headers: {'Content-Type':'application/json'}
        })
        .then(function (data){ 
        	// if session is started, get the user, otherwise redirect to login view
        	data.data.session ? $scope.user = data.data.session : $location.path("/login");
        	// Calculate users age based on the current date and his birthdate
        	var birthdate = new Date($scope.user.birthdate);
        	var currentDate = new Date();
        	var age = currentDate - birthdate;
        	$scope.user.age = Math.floor(age / (1000*60*60*24*365.25));
        	// console.log($scope.user);
    	});

    }

    
    // Display the profile page
    $scope.profilePage = function() {
    	$scope.dashboardView = '/views/profilePage.html';
    };

    // Display the user page
    $scope.userPage = function(){  
        $scope.dashboardView = '/views/userPage.html';
    };  

    // Display the upload page
    $scope.uploadPage = function(){  
        $scope.dashboardView = '/views/uploadPage.html';  
    };  

    // Logout
    $scope.logout = function(){  
        $http({
            method:'GET',
            url:'/api/logout/',
            headers: {'Content-Type':'application/json'}
        })
        .then(function (data){ 
        	if (data.data.logout) {
        		alert("You've been successfully logged out");
        		$location.path("/login");        		
        	}
    	}); 
    };  

    

    // Upload new ecg
    // Get content from the file to construct the file name
    // send username, filename & file to the server
    $scope.submit = () => { 
        var reader = new FileReader();
        reader.readAsText($scope.file, "UTF-8");

        reader.onload = function (evt) {
            var fileContent = JSON.parse(evt.target.result);
            var fileName = fileContent.measurement1.day + "-" + fileContent.measurement1.month + "-" + fileContent.measurement1.year + " " + fileContent.measurement1.hour + ":" + fileContent.measurement1.minute;
            Upload.upload({
                method: 'POST',
                url: 'api/data/' + $scope.user.username,
                data: { filename: fileName},
                file: $scope.file
            }).then(function(res) {
                // file is uploaded successfully
                console.log(res);
            }); 
        }
        
        reader.onerror = function (evt) {
            console.log("error reading file");
        }

        
    };


    // Get the user if logged in, redirect if not and display profile page as default view of the dashboard
    $scope.askForSession();
    $scope.profilePage();    
}]);