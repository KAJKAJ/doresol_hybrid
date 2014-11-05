'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('ProfileCtrl', function($scope,ENV,$firebase,$famous, Memorial, User){
  $scope.hostUrl = ENV.HOST;

  var EventHandler = $famous['famous/core/EventHandler'];
  $scope.eventHandler = new EventHandler();
  
  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.copyMemorial = {};
  $scope.memorial.$loaded().then(function(value){
    // console.log($scope.memorial);
    // $scope.memorial.file.url = ENV.HOST + $scope.memorial.file.url;
    // angular.copy($scope.memorial,$scope.copyMemorial);

    $scope.isOwner = Memorial.isOwner();
    $scope.isMember = Memorial.isMember();
    $scope.isGuest = Memorial.isGuest();
  });

});