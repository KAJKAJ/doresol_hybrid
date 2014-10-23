'use strict';

angular
.module('core')
.controller('LoginCtrl', function ($scope, Auth, User, $window,$state,Memorial,Composite) {
    $scope.user = {};
    $scope.errors = {};

    // console.log($state.params);
    
    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function (value){
          Memorial.clearMyMemorial();
          Composite.setMyMemorials(value.uid).then(function(){
              // $location.path('/memorials');
            if ($state.params.memorialId !== undefined) {
              $state.params.inviteeId = value.uid;
              Composite.addMember($state.params).then(function(){
                $state.go("memorials", {popup: false});
              });
            } else {
              $state.go("memorials",{popup: false});
            }
          });

        } ,function(error){
          // console.log(error);
          var errorCode = error.code;
          switch(errorCode){
            case "INVALID_USER":
              $scope.errors.other = "등록되어있지 않은 이메일 주소입니다.";
            break;
            case "INVALID_PASSWORD":
              $scope.errors.other = "잘못된 패스워드입니다.";
            break;
          }
        });        
      }
    };

    $scope.toRegister = function() {
      if($state.params.memorialId !== undefined) {
        $state.go('signup.invites', {memorialId: $state.params.memorialId, inviterId: $state.params.inviterId});
      } else {
        $state.go('signup');
      }
    };
    
  });
