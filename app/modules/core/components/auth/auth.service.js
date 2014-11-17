'use strict';

angular.module('doresolApp')
  .factory('Auth', function Auth($location, $q, $rootScope, User, ENV, Composite,$firebaseSimpleLogin) {
    var auth = $firebaseSimpleLogin(new Firebase(ENV.FIREBASE_URI));
    var currentUser = null;
    
    var getCurrentUserFromFirebase = function(){
      var dfd = $q.defer();
      if(currentUser == null){
        var ref = new Firebase(ENV.FIREBASE_URI);
        ref.onAuth(function(authData) {
          if (authData) {
            setCurrentUser(authData);
            dfd.resolve(authData);
          } else {
            dfd.reject('no user data found');
          }
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
      var ref = new Firebase(ENV.FIREBASE_URI);
      console.log('auth service login');
      console.log(user.email);
      console.log(user.password);
      ref.authWithPassword({
        email    : user.email,
        password : user.password
      }, function(err, authData) {
        if (err) {
          console.log('auth login error');
          console.log(err);
          deferred.reject(err);
        } else {
          console.log('auth login success');
          console.log(authData);
          User.getCurrentUserFromFirebase(authData.uid).then(function(userValue){
            deferred.resolve(authData);
          });
        }
      });
      return deferred.promise;
    }

    var _loginFb = function(deferred, value){
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
        deferred.resolve(value);
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
        deferred.resolve(value);
      });
      // deferred.resolve(value);
      return deferred;
    }

    var loginFb = function() {
      var deferred = $q.defer();
      var ref = new Firebase(ENV.FIREBASE_URI);
      // prefer pop-ups, so we don't navigate away from the page
      ref.authWithOAuthPopup("facebook", function(err, authData) {
        if (err) {
          console.log(err);
          if (err.code === "TRANSPORT_UNAVAILABLE") {
            // fall-back to browser redirects, and pick up the session
            // automatically when we come back to the origin page
            ref.authWithOAuthRedirect("facebook", function(err, authData) {
              if(err){
                console.log(err);
                deferred.reject(err);
              }else{
                console.log(authData);
                _loginFb(deferred,authData);
              }
            });
          }
        } else if (authData) {
          // user authenticated with Firebase
          _loginFb(deferred,authData);
        }
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
      var ref = new Firebase(ENV.FIREBASE_URI);
      ref.unauth();
      // auth.$logout();
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
