app.controller('HospitalsController', function($scope, $http, $location, $routeParams){
    
    // get hospitals from open data antwerp api and save the json into $scope.hospitals
    $http({
        method:'GET',
        url:'http://datasets.antwerpen.be/v4/gis/ziekenhuisoverzicht.json'
    })
    .then(function (data) {
        $scope.hospitals = data.data.data;
    });    


});