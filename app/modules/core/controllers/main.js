'use strict';

angular
.module('core')
.controller('MainController', function($rootScope, $scope, Memorial){

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;
  
  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });

  // $scope.memorial = Memorial.Memorial.getCurrentMemorial();

  // $scope.bottomReached = function() {
  //   alert('Congrats you scrolled to the end of the list!');
  // }
  
});