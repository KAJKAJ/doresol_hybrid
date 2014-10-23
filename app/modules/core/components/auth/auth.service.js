'use strict';

angular.module('doresolApp')
  .factory('Auth', function Auth($location, $q, $rootScope, User, ENV, $firebaseSimpleLogin, Composite) {
    var auth = $firebaseSimpleLogin(new Firebase(ENV.FIREBASE_URI));
    var currentUser = null;
    
    var getCurrentUserFromFirebase = function(){
      var dfd = $q.defer();
      if(currentUser == null){
        auth.$getCurrentUser().then(function(value) {
          setCurrentUser(value);
          dfd.resolve(value);
        },function(error){
          dfd.reject(error);
        });
      }else{
        dfd.resolve(currentUser);
      }
      return dfd.promise;
    }

    var register =  function(user) {
    	var _register = function() {
        return auth.$createUser(user.email,user.password).then( function (value){
          value.email = user.email;
          return value;
        });
      };
      return _register(user).then(User.create);
    }

    var getCurrentUser = function(){
      return currentUser;
    }

    var setCurrentUser = function(authUser) {
      currentUser = authUser;
    }

    var login = function(user){
      var deferred = $q.defer();
      auth.$login('password',{email:user.email, password:user.password,rememberMe: true}).then(function(value) {
        User.getCurrentUserFromFirebase(value.uid);
        deferred.resolve(value);
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    var loginFb = function() {
      var deferred = $q.defer();
      auth.$login('facebook', {scope: 'user_photos, email, user_likes',rememberMe: true}).then(function(value) {
        User.getCurrentUserFromFirebase(value.uid).then(function(userValue){
          if(!userValue.profile){
            var profile = {
              name: value.displayName,
              file:{
                location: 'facebook',
                url: value.thirdPartyUserData.picture.data.url,
                updated_at: moment().toString()
              }
            }
            
            User.update(value.uid, 
            {
             uid: value.uid,
             id: value.id,         
             profile: profile,
             thirdPartyUserData: value.thirdPartyUserData,
             created_at: moment().format("YYYY-MM-DD HH:mm:ss")
            });
          }
        },function(error){
          if(error === 'user is deleted'){
            var profile = {
              name: value.displayName,
              file:{
                location: 'facebook',
                url: value.thirdPartyUserData.picture.data.url,
                updated_at: moment().toString()
              }
            }
            
            User.update(value.uid, 
            {
             uid: value.uid,
             id: value.id,         
             profile: profile,
             thirdPartyUserData: value.thirdPartyUserData,
             created_at: moment().format("YYYY-MM-DD HH:mm:ss")
            });
          }
        });
        deferred.resolve(value);
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    var loginOauth = function(provider){
      switch(provider){
        case 'facebook':
          return loginFb();
        break;
      }
    }

    var logout = function() {
      currentUser = null;
      User.clearCurrentUser();
      auth.$logout();
    }

    var changePassword = function(email, oldPassword, newPassword) {
      return auth.$changePassword(email, oldPassword, newPassword);
    }

    return {
      register: register,

      login: login,

      loginOauth: loginOauth,

      logout: logout,

      getCurrentUser:getCurrentUser,

      getCurrentUserFromFirebase:getCurrentUserFromFirebase,
      changePassword:changePassword

      // isAdmin: function() {
      //   return currentUser.role === 'admin';
      // },

      // changePassword: function(oldPassword, newPassword, callback) {
      //   var cb = callback || angular.noop;

      //   return User.changePassword({ id: currentUser._id }, {
      //     oldPassword: oldPassword,
      //     newPassword: newPassword
      //   }, function(user) {
      //     return cb(user);
      //   }, function(err) {
      //     return cb(err);
      //   }).$promise;
      // }
    };
  });
