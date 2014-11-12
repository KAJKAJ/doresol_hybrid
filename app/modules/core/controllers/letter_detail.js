'use strict';

angular
.module('core')
.controller('LetterDetailCtrl', function($scope,ENV,$state,$stateParams,$firebase,$famous,Composite, Memorial, User, Comment, Story, Util, Letter){
  $scope.storyKey = $stateParams.id;
  
  $scope.hostUrl = ENV.HOST;

  var EventHandler = $famous['famous/core/EventHandler'];
  $scope.eventHandler = new EventHandler();
  
  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.newComment = {};

  $scope.storyKeysArray = Letter.getStoryKeysArray();
  $scope.storiesArray = Letter.getStoriesArray();
  $scope.storiesObject = Letter.getStoriesObject();
  $scope.commentsObject = Letter.getCommentsObject();
  $scope.users = User.getUsersObject();

  $scope.isOwner = Memorial.isOwner();
  $scope.isMember = Memorial.isMember();
  $scope.isGuest = Memorial.isGuest();

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