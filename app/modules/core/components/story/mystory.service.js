'use strict';

angular.module('doresolApp')
  .factory('MyStory', function MyStory($firebase, Memorial, User, $q, $timeout, ENV) {

  var myStoriesArray = [];
  var myStoriesObject = {};
  var myStoriesCnt = 0;
  var memorial = Memorial.getCurrentMemorial();
  var user = User.getCurrentUser();
  var isOwner = isMember = isGuest = false;

  memorial.$loaded().then(function(value){
    if(user && user.uid === memorial.ref_user ) {
      Memorial.setMyRole('owner');
    } else {
      // no member 
      if(memorial.members === undefined) {
        Memorial.setMyRole('guest');
      } else {
        // member
        if(user && memorial.members[user.uid]) {
          Memorial.setMyRole('member');
        } else {
          Memorial.setMyRole('guest');
        }
      }
    }
    
    isOwner = Memorial.isOwner();
    isMember = Memorial.isMember();
    isGuest = Memorial.isGuest();

   
  });

  var currentStoriesRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/stories');
  var _stories = $firebase(currentStoriesRef).$asArray();

  _stories.$watch(function(event){
    switch(event.event){
      case "child_removed":
        var storyId = event.key;

        // delete from timeline and setting
        var index = myStoriesArray.indexOf(event.key);
        if( index >= 0) {
          myStoriesArray.splice(index, 1);
          delete myStoriesObject[storyId];
        }
        myStoriesCnt--;
        break;
      case "child_added":
        console.log('-----------------');
        console.log(_stories);
      break;
    }
  });

  var assignStory = function(value) {
    myStoriesArray.push(value.$id);
    myStoriesObject[value.$id] = value;
    
    myStoriesArray.sort(function(aKey,bKey){
      var aValue = myStoriesObject[aKey];
      var bValue = myStoriesObject[bKey];
      var aStartDate = moment(aValue.startDate).unix();
      var bStartDate = moment(bValue.startDate).unix();
      return aStartDate > bStartDate ? 1 : -1;
    });
  }

  var getStoriesArray = function() {
    return myStoriesArray;
  }

  var getStoriesObject = function() {
    return myStoriesObject;
  }

  var getStoriesCnt = function() {
    return myStoriesCnt;
  }

  var isOwner = function() {
    return isOwner;
  }

  var isMember = function() {
    return isMember;
  }

  var isGuest = function() {
    return isGuest;
  }

  var getStoryObj = function(story) {
    return myStoriesObject[story];
  }

  return {
    getStoriesArray: getStoriesArray,
    getStoriesObject: getStoriesObject,
    getStoriesCnt: getStoriesCnt,
    getStoryObj:getStoryObj,
    isOwner:isOwner,
    isMember: isMember,
    isGuest:isGuest
  }; 

  // $scope.changeMode = function(story,mode){
  //   $scope.selectedStory = story;
  //   console.log('---- selected story---');
  //   console.log($scope.selectedStory);
  //   _loadStoryComments($scope.selectedStory);
  //   $scope.mode = mode;
  // }

});
