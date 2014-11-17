'use strict';

angular.module('doresolApp')
  .factory('Member', function Member($firebase, Memorial, $q, User, $timeout, ENV) {

  var members = {};
  var waitings = {};
  var waitingsCnt = 0;

  var userMembersRef =  new Firebase(ENV.FIREBASE_URI + '/users');

  var memorialMembersRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/members');
  var _members = $firebase(memorialMembersRef).$asArray();

  _members.$loaded().then( function(memberList) {

    angular.forEach(memberList, function(member) {
      var childRef = userMembersRef.child(member.$id);
      var child = $firebase(childRef).$asObject();
      child.$loaded().then(function(value){
        members[value.uid] = value;
        User.setUsersObject(value.uid);
      });
    });

    _members.$watch(function(event){
      switch(event.event){
        case "child_removed":
          delete members[event.key];
          break;
        case "child_added":
          var childRef = userMembersRef.child(event.key);
          var child = $firebase(childRef).$asObject();
          child.$loaded().then(function(value){
            members[value.uid] = value;
            // console.log(value);
            User.setUsersObject(value.uid);
          });
        break;
      }
    });
  });


  var memorialWaitingsRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/waitings');
  var _waitings = $firebase(memorialWaitingsRef).$asArray();

  _waitings.$loaded().then( function(waitingList) {
    // console.log(waitingList);
    angular.forEach(waitingList, function(waiting) {
      // console.log(waiting);
      var childRef = userMembersRef.child(waiting.$id);
      var child = $firebase(childRef).$asObject();
      child.$loaded().then(function(value){
        waitings[value.uid] = value;
        User.setUsersObject(value.uid);
      });
    });
     
    _waitings.$watch(function(event){
      switch(event.event){
        case "child_removed":
          waitingsCnt--;
          delete waitings[event.key];
          break;
        case "child_added":
        // console.log('aaa');
          waitingsCnt++;
          var childRef = userMembersRef.child(event.key);
          var child = $firebase(childRef).$asObject();
          child.$loaded().then(function(value){
            waitings[value.uid] = value;
            User.setUsersObject(value.uid);
          });
          // console.log(waitingsCnt);
        break;
      }
    });
  });
  
  var getMembers = function() {
    return members;
  }

  var getWaitings = function() {
    return waitings;
  }

  var getWaitingsCnt = function() {
    return waitingsCnt;
  }
  
  var removeMember = function(memberId){
    var memorialMembersRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/members');
    var memorialMembers = $firebase(memorialMembersRef);
    memorialMembers.$remove(memberId);

    var userMemberRef =  new Firebase(ENV.FIREBASE_URI + '/users/' + memberId + '/memorials/members');
    var userMember = $firebase(userMemberRef);
    return userMember.$remove(ENV.MEMORIAL_KEY);
  }

  return {
    getMembers: getMembers,
    getWaitings: getWaitings,
    getWaitingsCnt: getWaitingsCnt,
    removeMember:removeMember
  }; 

});
