'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('StoryCtrl', function($scope,ENV,$state, Memorial, User, MyStory, Util){
  $scope.hostUrl = ENV.HOST;

  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.mode = 'overview';
  $scope.storiesArray = MyStory.getStoriesArray();
  $scope.storiesObject = MyStory.getStoriesObject();
  $scope.storiesCnt = MyStory.getStoriesCnt();

  $scope.role = Memorial.getRole();

  $scope.objectSize = function(object){
    if(object){
      return Util.objectSize(object);
    }else{
      return 0;
    }
  }


  $scope.formatDate = function(date) {
    return moment(date).format('LLL');
  }

  $scope.goToDetail = function(storyId) {
    $state.go('story_detail', {id: storyId});
  }
  
});