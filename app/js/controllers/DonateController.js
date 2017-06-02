app.controller('DonateController', function($scope, $http, $location, $routeParams){
   
    $scope.donateItem = '';
    $scope.donateItemId = '';
    $scope.error = '';

        var getToken = function(successCb) {
          var request = {
            method: 'POST',
            url: 'https://api.stripe.com/v1/tokens',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Bearer sk_test_yTtIt8kmUMt6AiV9PllGwKZg'
            },
            data: 'card[number]=' + $scope.cardNumber + '&card[exp_month]=' + $scope.cardExpMonth + '&card[exp_year]=' + $scope.cardExpYear + '&card[cvc]=' + $scope.cardCvc
          };
          var errCb = function(err) {
            alert("Wrong " + JSON.stringify(err));
          };
          $http(request).then(function (data) {
            // debugger;
            successCb(data["data"]["id"]); // Of data.data.id, is hetzelfde
          }, errCb).catch(errCb);
        };

        var createCustomer = function(token, successCb) {
          var request = {
            method: 'POST',
            url: 'https://api.stripe.com/v1/customers',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Bearer sk_test_yTtIt8kmUMt6AiV9PllGwKZg'
            },
            data: 'source=' + token
          };
          var errCb = function(err) {
            alert("Wrong " + JSON.stringify(err));
          };
          $http(request).then(function (data) {
            successCb(data.data.id);
          }, errCb).catch(errCb);
        };

        var createSubscription = function(customer, plan, successCb) {
          var request = {
            method: 'POST',
            url: 'https://api.stripe.com/v1/subscriptions',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Bearer sk_test_yTtIt8kmUMt6AiV9PllGwKZg'
            },
            data: 'plan=' + plan + '&customer=' + customer
          };
          var errCb = function(err) {
            alert("Wrong " + JSON.stringify(err));
          };
          $http(request).then(function (data) {
            successCb()
          }, errCb).catch(errCb);
        };

        var subscribe = function (plan) {
          getToken(function (token) {
            createCustomer(token, function (customer) {
              createSubscription(customer, plan, function (status) {
                alert("Subscribed!");
              });
            });
          });
        };

    $scope.donateCoffee = () => {
        $scope.donateItem = 'Coffee';
        $scope.donateItemId = 'coffee';
    }

    $scope.donateTShirt = () => {
        $scope.donateItem = 'T-Shirt';
        $scope.donateItemId = 't-shirt';
    }

    $scope.donateGym = () => {
        $scope.donateItem = 'Gym membership';
        $scope.donateItemId = 'gym';
    }

    $scope.submit = () => {
        if ($scope.cardNumber && $scope.cardCvc && $scope.cardExpMonth && $scope.cardExpYear) {
            if ($scope.donateItemId) {
                subscribe($scope.donateItemId);
                $scope.error = '';
            } else {
                $scope.error = "Please select the monthly subscription";
            }
        } else {            
                $scope.error = "Please fill in all the fields";
        }
        
    }

});