function currentLocation(map) {
    var pos = null;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude                
            );
            
            map.setCenter(pos);
        });
    }
    
    return pos;
}
    
var coolerApp = angular.module('coolerApp', ['ngRoute', 'firebase']);

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

coolerApp.controller('homeController', function($scope, $log, $firebaseArray, $firebaseObject) {
    
    var ref = new Firebase("https://coke-cooler.firebaseio.com/drinks/");

    $scope.drinks = $firebaseArray(ref);
    
    $log.info($scope.drinks);
    
    // $scope.coolers.$add({
    //     "device": "12347",
    //     "drinks": {
    //         "fanta": true
    //     },
    //     "location": {
    //         "longitude": 391.131,
    //         "latitude": 217.293
    //     }
    // });
});

coolerApp.controller('mapController', function($scope, $log, $firebaseArray, $timeout, $location) {
    
    var ref = new Firebase("https://coke-cooler.firebaseio.com/coolers");

    $scope.coolers = $firebaseArray(ref);
    
    $scope.selectedDrink = $location.search()["drink"];
    
    var initialLocation = new google.maps.LatLng(33.7490, -84.3880);    
    
    var mapOptions = {
        zoom: 14,
        center: initialLocation,
        mapTypeId: google.maps.MapTypeId.ROADS
    }

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    currentLocation($scope.map);

    $scope.markers = [];

    var infoWindow = new google.maps.InfoWindow();

    var createMarker = function (info) {
        
        var title = "Loading...";
        
        $log.info(info.drinks[$scope.selectedDrink]);
        
        if (info.drinks[$scope.selectedDrink] === false) {
            
            title = "Running low";
        } else {
            
            title = "Available";
        }
        
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.location.latitude, info.location.longitude),
            title: title
        });
        
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h3>' + marker.title + '</h3>');
            infoWindow.open($scope.map, marker);
        });
        
        $scope.markers.push(marker);
        
    }  

    $scope.coolers.$loaded(function(list) {
        
        for (i = 0; i < $scope.coolers.length; i++) {
            
            if ($scope.coolers[i].drinks[$scope.selectedDrink] !== undefined) {
                            
                createMarker($scope.coolers[i]);
                $log.info($scope.coolers[i]);
            }
        }
    });

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
});