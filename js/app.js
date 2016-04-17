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
        
        .when('/store', {
            templateUrl : 'pages/store.html',
            controller  : 'storeController'
        })
});

coolerApp.controller('homeController', function($scope, $log, $firebaseArray, $firebaseObject) {
    
    var ref = new Firebase("https://coke-cooler.firebaseio.com/drinks");

    $scope.drinks = $firebaseArray(ref);
});

coolerApp.controller('mapController', function($scope, $log, $firebaseArray, $location) {
    
    // $scope.$on('$viewContentLoaded', function(){

    //     $log.info($(window).outerHeight(), $("header").height(), $("#map").height());

    //     $("#map").height($(window).outerHeight() - $("header").outerHeight());
    // });
    
    var ref = new Firebase("https://coke-cooler.firebaseio.com/coolers");

    $scope.coolers = $firebaseArray(ref);
    
    $scope.selectedDrink = $location.search()["drink"];
    
    $log.info($scope.selectedDrink);
    
    var initialLocation = new google.maps.LatLng(33.7490, -84.3880);    
    
    var mapOptions = {
        zoom: 15,
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
                $log.info("YES");
                createMarker($scope.coolers[i]);
            }
        }
    });

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
});

coolerApp.controller('storeController', function($scope, $log, $firebaseArray, $firebaseObject, $location) {
    
    $scope.storeId = $location.search()["id"];
        
    var drinksRef = new Firebase("https://coke-cooler.firebaseio.com/drinks");
    var storeRef = new Firebase("https://coke-cooler.firebaseio.com/coolers/" + $scope.storeId + "/drinks");

    $scope.allDrinks = $firebaseObject(drinksRef);
    $scope.drinks = $firebaseArray(storeRef);
    
    $scope.getSoda = function(drink) {
        
        var soda = {
            "name": "",
            "availability": true,
            "url": ""
        }
        
        soda.name = drink.$id;
        soda.availability = drink.$value ? "Available" : "Running low";
        soda.url = $scope.allDrinks[drink.$id].url;
        
        return soda;
    }
    
    $log.info($scope.drinks[0]);
});