'use strict';

angular
.module('core')
.controller('LetterCtrl', function($scope,ENV,$firebase,$famous,Composite, Memorial, User, Comment, Story){
  $scope.hostUrl = ENV.HOST;

  var EventHandler = $famous['famous/core/EventHandler'];
  $scope.eventHandler = new EventHandler();
  
  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.newComment = {};

  $scope.storyKeysArray = [];
  $scope.storiesArray = [];
  $scope.storiesObject = {};
  $scope.commentsObject = {};
  $scope.users = User.getUsersObject();

  $scope.memorial.$loaded().then(function(value){
    if($scope.user && $scope.user.uid === $scope.memorial.ref_user ) {
      Memorial.setMyRole('owner');
    } else {
      // no member 
      if($scope.memorial.members === undefined) {
        Memorial.setMyRole('guest');
      } else {
        // member
        if($scope.user && $scope.memorial.members[$scope.user.uid]) {
          Memorial.setMyRole('member');
        } else {
          Memorial.setMyRole('guest');
        }
      }
    }

    $scope.isOwner = Memorial.isOwner();
    $scope.isMember = Memorial.isMember();
    $scope.isGuest = Memorial.isGuest();
  });
  
  var currentStorylineStoriesRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/storyline/stories/');
  var _stories = $firebase(currentStorylineStoriesRef).$asArray(); 
  _stories.$watch(function(event){
    switch(event.event){
      case "child_removed":
        var storyKey = $scope.storyKeysArray[event.key];
        var index = $scope.storiesArray.indexOf(storyKey);
        if( index >= 0) {
          $scope.storiesArray.splice(index, 1);
          delete $scope.storiesObject[storyKey];
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
            $scope.storyKeysArray[event.key] = storyValue.$id;
            storyValue.fromNow = moment(storyValue.created_at).fromNow();
            storyValue.pagingKey = event.key;
            if(!$scope.commentsObject[storyValue.$id]){
              $scope.commentsObject[storyValue.$id] = {};
            }
            $scope.assignStory(storyValue);
            User.setUsersObject(storyValue.ref_user);
            loadStoryComments(storyValue);
          });
        });
        break;
    }
  });

  $scope.assignStory = function(value) {
    $scope.storiesArray.push(value.$id);
    $scope.storiesObject[value.$id] = value;
    
    $scope.storiesArray.sort(function(aKey,bKey){
      var aValue = $scope.storiesObject[aKey];
      var bValue = $scope.storiesObject[bKey];
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
          if($scope.commentsObject[storyValue.$id][event.key]){
            delete $scope.commentsObject[storyValue.$id][event.key];
          }
          break;
        case "child_added":
          var commentRef = new Firebase(ENV.FIREBASE_URI + '/comments/'+event.key);
          var comment = $firebase(commentRef).$asObject();
          comment.$loaded().then(function(commentValue){
            commentValue.fromNow = moment(commentValue.created_at).fromNow();
            $scope.commentsObject[storyValue.$id][event.key] = commentValue;
            User.setUsersObject(commentValue.ref_user);
          });
          break;
      }
    });
  }

  $scope.scrollContentHeight = {};

  $scope.$on('$viewContentLoaded', function(){
    $famous.find('fa-scroll-view')[0].renderNode.sync.on('start', function(event) {
      var scrollContent = angular.element('[id^=scroll-content]');

      angular.forEach(scrollContent, function(value, key) {
        $scope.scrollContentHeight[value.id] = value.clientHeight;
      });

    });
  });

  $scope.getScrollContentHeight = function(id) {
    return $scope.scrollContentHeight[id];
  }

  $scope.addComment = function(storyKey,comment){
    if(comment.body){
      Composite.createComment(storyKey, comment);
      $scope.newComment = {}; 
    }
  }

  $scope.deleteComment = function(storyKey, commentKey) {
    delete $scope.commentsObject[storyKey][commentKey];
    Comment.removeCommentFromStory(storyKey, commentKey);
  }

  $scope.removeStory = function(story){
    // console.log(story);
    Story.removeStoryFromStoryline(story.ref_memorial,story.$id,story.pagingKey);
    // Story.removeStory(story.ref_memorial,story.$id);
  }
  
});