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
    
    var ref = new Firebase("https://coke-cooler.firebaseio.com/drinks");

    // $scope.drinks = $firebaseObject(ref);
    $scope.drinks = $firebaseArray(ref);
    
    // $log.info($scope.drinks);
    
    // $scope.drinks.$value = {
    //     "Coke": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productfilter/PFP_filterimages/PFP_Coke_12oz.png"},
    //     "Desani Water": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productfilter/PFP_filterimages/PFP_Dasani_20oz.png"},
    //     "Fanta Orange": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productfilter/PFP_filterimages/PFP_Fanta_12.png"},
    //     "Minute Maid Lemonade": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productfilter/PFP_filterimages/PFP_MinuteMaid_LightLemonade_59.png"},
    //     "Minute Maid Orange Juice": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productfilter/PFP_filterimages/PFP_MinuteMaid_PureSqueezed_59.png"},
    //     "Nos": {"url": "http://www.drinknos.com/wp-content/uploads/sites/26/2014/03/product-original-221.png"},
    //     "Smart Water": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productfilter/PFP_filterimages/PFP_SmartWater_20oz.png"},
    //     "Sprite": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productDetails/ProductImages/Sprite_12oz_v2.png"},
    //     "Tea": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productfilter/PFP_filterimages/PFP_GoldPeak_Lemon_18-5oz.png"},
    //     "Vitamin Water": {"url": "http://www.coca-colaproductfacts.com/content/dam/productfacts/us/productfilter/PFP_filterimages/PFP_VitaminWater_PowerCDragonfruit_20oz.png"}
    // };
    
    // $scope.drinks.$save();
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