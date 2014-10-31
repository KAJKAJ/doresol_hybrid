'use strict';

angular
    .module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

angular
    .module(ApplicationConfiguration.applicationModuleName)
    .config(['$locationProvider',
        function($locationProvider) {
            $locationProvider.hashPrefix('!');
        }
    ])
    .run(function ($rootScope, $location, $state, Auth, User, Composite) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      var _getUserAuth = function(){
        return Auth.getCurrentUserFromFirebase().then(function(value){
          return value.uid;
        });
      };

      var _getUserData = function(userId){
        return User.getCurrentUserFromFirebase(userId).then(function(value){
          return value.uid;
        });
      };

      // 인증해야 되는 경우
      if (toState.authenticate){
        // 사용자가 계정이 없을 때
        if(!User.getCurrentUser()){
          event.preventDefault();
          _getUserAuth().then(_getUserData).then(Composite.setMyMemorials).then(function(value){
            $state.go(toState, toParams);
          },function(error){
            $state.go('login');
          });
        }
      }
    });
  });

//Then define the init function for starting up the application
angular
    .element(document)
    .ready(function() {
        if (window.location.hash === '#_=_') {
            window.location.hash = '#!';
        }
        angular
            .bootstrap(document,
                [ApplicationConfiguration.applicationModuleName]);
    });
