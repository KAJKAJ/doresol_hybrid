'use strict';

angular.module('core')
  .controller('NavbarCtrl', function ($scope, $location, User, Auth, Composite) {
   
    $scope.user = User.getCurrentUser();
    
    $scope.logout = function() {
      Auth.logout();
      $scope.currentUser = null;
      User.setCurrentUser();
      $location.path('/login');
    }

    $scope.isActive = function(route) {
      return route === $location.path();
    }
  });