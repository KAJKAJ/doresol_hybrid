'use strict';

angular
.module('core')
.controller('LetterCtrl', function($scope,ENV, Memorial, User, Util, Letter, $state){
  $scope.hostUrl = ENV.HOST;

  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.storyKeysArray = Letter.getStoryKeysArray();
  $scope.storiesArray = Letter.getStoriesArray();
  $scope.storiesObject = Letter.getStoriesObject();
  $scope.commentsObject = Letter.getCommentsObject();
  $scope.users = User.getUsersObject();

  $scope.role = Memorial.getRole();

  $scope.scrollOption = {
    // direction: 0,
    paginated: true
  };

  // $scope.scrollContentHeight = {};

  // $scope.$on('$viewContentLoaded', function(){
  //   $famous.find('fa-scroll-view')[0].renderNode.sync.on('start', function(event) {
  //     var scrollContent = angular.element('[id^=scroll-content]');

  //     angular.forEach(scrollContent, function(value, key) {
  //       $scope.scrollContentHeight[value.id] = value.clientHeight;
  //     });

  //   });
  // });

  // $scope.getScrollContentHeight = function(id) {
  //   return $scope.scrollContentHeight[id];
  // }

  $scope.commentSize = function(storyId){
    return Util.objectSize($scope.commentsObject[storyId]);
  }
  
  $scope.goToDetail = function(storyKey) {
    console.log(storyKey);
    $state.go('letter_detail', {id: storyKey});
  }

});