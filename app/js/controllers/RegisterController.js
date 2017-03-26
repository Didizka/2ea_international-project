
app.controller('RegisterController', function($scope, $http, $location, $routeParams){    
    
    $scope.userProfile = {        
    };
    
function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
    }
    
    $scope.submit = function() {
        console.log($scope.userProfile);
        var result;
        
        $http({
            method:'POST',
            url:'/api/users',
            headers: {'Content-Type':'application/json'},
            data: $scope.userProfile
        })
        .success(function(data){result = data.message})
        .error(function(data){result = data.message});
        $scope.result = result;
    };
});