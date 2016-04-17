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


coolerApp.controller('homeController', function($scope, $log, $firebaseArray) {
    
    var ref = new Firebase("https://coke-cooler.firebaseio.com/coolers");

    $scope.coolers = $firebaseArray(ref);
    
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

coolerApp.controller('mapController', function($scope, $log, $firebaseArray, $timeout) {
    
    var ref = new Firebase("https://coke-cooler.firebaseio.com/coolers");

    $scope.coolers = $firebaseArray(ref);
    
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
        
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.location.latitude, info.location.longitude),
            title: info.device
        });
        // marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';
        
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>');
            infoWindow.open($scope.map, marker);
        });
        
        $scope.markers.push(marker);
        
    }  

    $scope.coolers.$loaded(function(list) {
        
        for (i = 0; i < $scope.coolers.length; i++) {
            
            createMarker($scope.coolers[i]);
            $log.info($scope.coolers[i]);
        }
    });

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
});