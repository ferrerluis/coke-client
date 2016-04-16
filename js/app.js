var myFirebaseRef = new Firebase("https://coke-cooler.firebaseio.com/coolers");

myFirebaseRef.on("value", function(snapshot) {
    
    var data = snapshot.val();
    
    for (var key in data) {
        
        console.log(data[key].location);
    }
});

// myFirebaseRef.push({
//     "id": "AJDH392JSG",
//     "location": {
//         "latitude": 33.767532,
//         "longitude": 84.400885
//     }
// });

var coolerApp = angular.module('coolerApp', ['ngRoute']);

coolerApp.config(function($routeProvider) {
    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl : 'pages/home.html',
            controller  : 'homeController'
        })

        // route for the about page
        .when('/map', {
            templateUrl : 'pages/map.html',
            controller  : 'mapController'
        })
});


coolerApp.controller('homeController', function($scope) {
    
    myFirebaseRef.on("value", function(snapshot) {

        $scope.data = snapshot.val();
    });
});

coolerApp.controller('aboutController', function($scope) {
    $scope.message = 'Look! I am an about page.';
});