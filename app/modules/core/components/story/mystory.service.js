'use strict';

angular.module('doresolApp')
  .factory('MyStory', function MyStory($firebase, Memorial, $q, $timeout, ENV) {

  var myStoriesArray = [];
  var myStoriesObject = {};
  var myStoriesCnt = 0;

  var currentStoriesRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/stories');
  var _stories = $firebase(currentStoriesRef).$asArray();

  _stories.$loaded().then(function(value) {

    angular.forEach(value, function(story) {
      assignStory(story);
      myStoriesCnt++;
    });

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
          var newStoryRef = new Firebase(ENV.FIREBASE_URI + '/memorials/' + ENV.MEMORIAL_KEY + '/stories/' + event.key);
          var newStory = $firebase(newStoryRef).$asObject();

          newStory.$loaded().then(function(value) {
            assignStory(value);
            myStoriesCnt++;
          });

        break;
      }
    });
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
