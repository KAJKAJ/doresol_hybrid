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
  $scope.isOwner = Memorial.isOwner();
  $scope.isMember = Memorial.isMember();
  $scope.isGuest = Memorial.isGuest();

});