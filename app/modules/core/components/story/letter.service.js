'use strict';

angular.module('doresolApp')
  .factory('Letter', function Story($firebase, $q, $timeout, ENV, Memorial, User) {
  var memorial = Memorial.getCurrentMemorial();
  var user = User.getCurrentUser();

  var storyKeysArray = [];
  var storiesArray = [];
  var storiesObject = {};
  var commentsObject = {};
  var users = User.getUsersObject();
  
  var currentStorylineStoriesRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/storyline/stories/');
  var _stories = $firebase(currentStorylineStoriesRef).$asArray(); 
  _stories.$watch(function(event){
    switch(event.event){
      case "child_removed":
        var storyKey = storyKeysArray[event.key];
        var index = storiesArray.indexOf(storyKey);
        if( index >= 0) {
          storiesArray.splice(index, 1);
          delete storiesObject[storyKey];
        }
        break;
      case "child_added":
        var childRef = currentStorylineStoriesRef.child(event.key);
        var child = $firebase(childRef).$asObject();
        // console.log(event.key);
        child.$loaded().then(function(value){
          var storyKey = value.$value;
          var storyRef =  new Firebase(ENV.FIREBASE_URI + '/stories/'+storyKey);
          var _story = $firebase(storyRef).$asObject();
          _story.$loaded().then(function(storyValue){
            storyKeysArray[event.key] = storyValue.$id;
            storyValue.fromNow = moment(storyValue.created_at).fromNow();
            storyValue.pagingKey = event.key;
            if(!commentsObject[storyValue.$id]){
              commentsObject[storyValue.$id] = {};
            }
            assignStory(storyValue);
            User.setUsersObject(storyValue.ref_user);
            loadStoryComments(storyValue);
          });
        });
        break;
    }
  });

  var assignStory = function(value) {
    storiesArray.push(value.$id);
    storiesObject[value.$id] = value;
    
    storiesArray.sort(function(aKey,bKey){
      var aValue = storiesObject[aKey];
      var bValue = storiesObject[bKey];
      var aStartDate = moment(aValue.created_at).unix();
      var bStartDate = moment(bValue.created_at).unix();
      return aStartDate < bStartDate ? 1 : -1;
    });
  }

  var loadStoryComments = function(storyValue) {
    var storyId = storyValue.$id;
    var currentStoryCommentsRef =  new Firebase(ENV.FIREBASE_URI + '/stories/'+storyValue.$id+'/comments/');
    var _comments = $firebase(currentStoryCommentsRef).$asArray();
    _comments.$watch(function(event){
      switch(event.event){
        case "child_removed":
          if(commentsObject[storyValue.$id][event.key]){
            delete commentsObject[storyValue.$id][event.key];
          }
          break;
        case "child_added":
          var commentRef = new Firebase(ENV.FIREBASE_URI + '/comments/'+event.key);
          var comment = $firebase(commentRef).$asObject();
          comment.$loaded().then(function(commentValue){
            commentValue.fromNow = moment(commentValue.created_at).fromNow();
            commentsObject[storyValue.$id][event.key] = commentValue;
            User.setUsersObject(commentValue.ref_user);
          });
          break;
      }
    });
  }

  var getStoryKeysArray = function(){
    return storyKeysArray;
  }

  var getStoriesArray = function(){
    return storiesArray;
  }

  var getStoriesObject = function(){
    return storiesObject;
  }

  var getCommentsObject = function(){
    return commentsObject;
  }

  return {
    getStoryKeysArray: getStoryKeysArray,
    getStoriesArray: getStoriesArray,
    getStoriesObject: getStoriesObject,
    getCommentsObject:getCommentsObject
  };
  
});
