'use strict';

angular.module('core')
  .controller('NavbarCtrl', function ($scope, $location, User, Auth, Composite) {
    $scope.menu = [
      // {
      //   'title': 'Home',
      //   'link': '/'
      // },
      // {
      //   'title': 'My doresol',
      //   'link': '/memorials'
      // },
      
    ];

    angular.element(window).bind("scroll", function() {
         if (this.pageYOffset >= 30) {
             $scope.shrink_header = true;
         } else {
             $scope.shrink_header = false;
         }
        $scope.$apply();
    });

    $scope.isCollapsed = true;
    
    $scope.currentUser = User.getCurrentUser();

    if(!$scope.currentUser){
      Auth.getCurrentUserFromFirebase().then(function(AuthValue){
        if(AuthValue){
          // console.log(AuthValue);
          User.getCurrentUserFromFirebase(AuthValue.uid).then(function(userValue){
            // console.log(userValue);
            Composite.setMyMemorials(userValue.uid);
            $scope.currentUser = User.getCurrentUser();
          });
        }
      }, function(error){
        console.log('auth error');
      });
    }
    
    $scope.logout = function() {
      Auth.logout();
      $scope.currentUser = null;
      $scope.toggle();
      
      $location.path('/login');
    }

    $scope.isActive = function(route) {
      return route === $location.path();
    }

    $scope.toggle = function(){
      $scope.toggleMenu = true;
    }

    $scope.untoggle = function(){
      $scope.toggleMenu = false;
    }

  });