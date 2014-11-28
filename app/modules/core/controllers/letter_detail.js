'use strict';

angular
.module('core')
.controller('LetterDetailCtrl', function($scope,ENV,$state,$stateParams,$firebase,Composite, Memorial, User, Comment, Story, Util, Letter){
  $scope.storyKey = $stateParams.id;
  
  $scope.hostUrl = ENV.HOST;

  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.newComment = {};

  $scope.storyKeysArray = Letter.getStoryKeysArray();
  $scope.storiesArray = Letter.getStoriesArray();
  $scope.storiesObject = Letter.getStoriesObject();
  $scope.commentsObject = Letter.getCommentsObject();
  $scope.users = User.getUsersObject();

  $scope.role = Memorial.getRole();

  $scope.removeStory = function(story){
    // console.log(story);
    Story.removeStoryFromStoryline(story.ref_memorial,story.$id,story.pagingKey);
    $state.go('letter');
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
  
});