'use strict';

angular
.module('core')
.controller('LoginCtrl', function ($scope, Auth, User, $window,$state,Memorial,Composite) {
    $scope.loginOauth = function(provider) {
      Auth.loginOauth(provider).then(function(value){
        console.log('login oauth');
        // Memorial.clearMyMemorial();
        // Composite.setMyMemorials(value.uid).then(function(){
        //   if ($state.params.memorialId !== undefined) {
        //     $state.params.inviteeId = value.uid;
        //     Composite.addMember($state.params).then(function(){
            
        //      if($rootScope.modalOpen) {
        //       $scope.closeThisDialog('true');
        //       $rootScope.modalOpen = false;
        //      }
             
        //      if($rootScope.toState) {
        //       $rootScope.toParams.noPopUp = noPopUp;
        //       var tempState = $rootScope.toState;
        //       $rootScope.toState = null;
        //       $state.go(tempState, $rootScope.toParams);
        //      } else {
        //       $state.go("memorials", {noPopUp: noPopUp});
        //      }
        //     });

        //   } else {
            
        //     if($rootScope.modalOpen) {
        //       $scope.closeThisDialog('true');
        //       $rootScope.modalOpen = false;
        //     }

        //     if($rootScope.toState) {
        //      $rootScope.toParams.noPopUp = noPopUp;
        //       var tempState = $rootScope.toState;
        //       $rootScope.toState = null;             
        //      $state.go(tempState, $rootScope.toParams);
        //     } else {
        //      $state.go("memorials", {noPopUp: noPopUp});
        //     }
        //   }
        // });
      });
    }

  });
