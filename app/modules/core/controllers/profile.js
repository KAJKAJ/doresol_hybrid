'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('ProfileCtrl', function($scope,ENV,$firebase, Memorial, User){
  $scope.hostUrl = ENV.HOST;

  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.copyMemorial = {};
  $scope.role = Memorial.getRole();
    
});