'use strict';

angular
.module('core')
.controller('LoginCtrl', function ($scope, Auth, User, $window,$state,Memorial,Composite) {
    $scope.loginUser = {};
    
    $scope.loginOauth = function(provider) {
      Auth.loginOauth(provider).then(function(value){
        Memorial.clearMyMemorial();
        $state.go("profile");
      });
    }

    $scope.login = function(form) {
      $scope.loginErrors = '';
      if(form.$valid) {
        Auth.login({
          email: $scope.loginUser.email,
          password: $scope.loginUser.password
        })
        .then( function (value){
          Memorial.clearMyMemorial();
          $state.go("profile");
        } ,function(error){
          console.log(error);
          var errorCode = error.code;
          switch(errorCode){
            case "INVALID_EMAIL":
            case "INVALID_USER":
              $scope.loginErrors = "등록되어있지 않은 이메일 주소입니다.";
            break;
            case "INVALID_PASSWORD":
              $scope.loginErrors = "잘못된 패스워드입니다.";
            break;
          }
          console.log($scope.loginErrors);
        });        
      }
    };

  });
