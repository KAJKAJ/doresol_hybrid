'use strict';

angular.module('doresolApp')
  .factory('User', function User($firebase, $rootScope, $q, $timeout, ENV) {

  var ref = new Firebase(ENV.FIREBASE_URI + '/users');
  var users = $firebase(ref);
  
  var currentUser = null;
  var usersObject = {};

  var loginTried = false;

  var getCurrentUserFromFirebase = function(userId){
    var dfd = $q.defer();
    if(currentUser == null){
      var user = findById(userId);

      user.$loaded().then(function(value) {
        if(user.hasOwnProperty('uid')) {
          // console.log(value);
          delete value.$$conf;
          setCurrentUser(value);
          dfd.resolve(currentUser);
        } else {
          dfd.reject('user is deleted');  
        }
      },function(error){
        dfd.reject(error);
      });
    }else{
      dfd.resolve(getCurrentUser());
    }
    return dfd.promise;
  }

  var setCurrentUser = function(user){
    if(user){
      currentUser = user;
    }else{
      currentUser = null;
    }
  }

  var create = function(newUser) {
    var profile = {
      name:newUser.email,
      file: {
        location: 'local',
        url: 'assets/images/user_32.png',
        updated_at: moment().toString()
      }
    }
    var user = {
      uid: newUser.uid,
      id: newUser.id,
      email: newUser.email,
      profile:profile,
      created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    return users.$set(newUser.uid, user);
  }

  var update = function(userId, data) {
    return users.$update(userId, data);
  }

  var findById = function(userId) {
    var userRef = users.$ref().child(userId);
    return $firebase(userRef).$asObject();
  }

  var getCurrentUser = function(){
    return currentUser;
  }

  // Memorial Related 
  var createMemorial = function(params) {
    var uid = currentUser.uid;
    var ownMemorialRef = users.$ref().child(uid + '/memorials/own/' + params.key);
    var memorial = $firebase(ownMemorialRef);

    return memorial.$set(true);
  }

  var getUserName = function (user){
    return user.uid;
  }

  var setUsersObject = function(userId){
    var user = findById(userId);
    user.$loaded().then(function(value){
      // value.profile = getUserProfile(value);      
      usersObject[value.uid] = value;
    });
  }

  var getUsersObject = function(){
    return usersObject;
  }

  var clearCurrentUser = function() {
    currentUser = null;
  }

  // $rootScope.$on('$firebaseSimpleLogin:login', function (e, authUser) {
  //   var query = $firebase(ref.startAt(authUser.uid).endAt(authUser.uid));

  //   query.$on('loaded', function () {
  //     setCurrentUser(query.$getIndex()[0]);
  //   });
  // });

  // $rootScope.$on('$firebaseSimpleLogin:logout', function() {
  //   delete $rootScope.currentUser;
  // });

  return {
    create: create,
    findById: findById,
    createMemorial: createMemorial,
    getCurrentUser:getCurrentUser,
    // setCurrentUser:setCurrentUser,
    clearCurrentUser:clearCurrentUser,
    getCurrentUserFromFirebase:getCurrentUserFromFirebase,
    update:update,
    setUsersObject:setUsersObject,
    getUsersObject:getUsersObject

  }

});
