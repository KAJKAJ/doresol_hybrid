'use strict';

angular
.module('core')
.controller('LoginCtrl', function ($scope, Auth, User, $window,$state,Memorial,Composite, ENV, $famous) {
    $scope.loginUser = {};
    $scope.signupUser = {};
    
    $scope.loginOauth = function(provider) {
      Auth.loginOauth(provider).then(function(value){
        _afterLogin(value.uid);
      });
    }

    var _afterLogin = function(userId){
      Memorial.clearMyMemorial();
      //set current memorial
      Memorial.setCurrentMemorial(ENV.MEMORIAL_KEY);
      $state.go("profile");
    }

    var _login = function(){
      console.log('email login clicked');
      Auth.login({
          email: $scope.loginUser.email,
          password: $scope.loginUser.password
        })
        .then( function (value){
          console.log(value);
          _afterLogin(value.uid);
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
          // console.log($scope.loginErrors);
        });  
    }

    $scope.login = function(form) {
      $scope.loginErrors = '';
      _login();
    }

    $scope.signup = function(form) {
      $scope.signupErrors = '';
      if(form.$valid) {
        Auth.register($scope.signupUser).then(function (value){
          $scope.loginUser.email = $scope.signupUser.email;
          $scope.loginUser.password = $scope.signupUser.password;
          _login();
        }, function(error){
          var errorCode = error.code;
          console.log(error);
          switch(errorCode){
            case "EMAIL_TAKEN":
              $scope.signupErrors = '이미 등록된 이메일 주소입니다.';
            break;
          }
        });
      }
    };

    var EventHandler = $famous['famous/core/EventHandler'];
    $scope.eventHandler = new EventHandler();

  });
