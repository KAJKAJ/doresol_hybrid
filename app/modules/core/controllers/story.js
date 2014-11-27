'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('StoryCtrl', function($scope,ENV,$state,$famous, Memorial, User, MyStory, Util){
  $scope.hostUrl = ENV.HOST;

  var EventHandler = $famous['famous/core/EventHandler'];
  $scope.eventHandler = new EventHandler();
  
  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.mode = 'overview';
  $scope.storiesArray = MyStory.getStoriesArray();
  $scope.storiesObject = MyStory.getStoriesObject();
  $scope.storiesCnt = MyStory.getStoriesCnt();

  $scope.role = Memorial.getRole();

  $scope.scrollOption = {
    // direction: 0,
    paginated: true
  };

  $scope.objectSize = function(object){
    if(object){
      return Util.objectSize(object);
    }else{
      return 0;
    }
  }

  // $scope.boxSize = 155;
  // $scope.windowWidth = window.innerWidth;

  // $(window).resize(function() {
  //   $scope.windowWidth = window.innerWidth;
  //   $scope.$apply(function() {
  //      //do something to update current scope based on the new innerWidth and let angular update the view.
  //      calculateGrid();
  //   });
  // });

  // var calculateGrid = function(){
  //   var cols = 0;
  //   var rows = 0;
   
  //   cols = Math.floor($scope.windowWidth/$scope.boxSize);
  //   rows = Math.ceil($scope.storiesArray.length/cols);
    
  //   $scope.gridHeight = $scope.boxSize*rows;
  //   $scope.gridLayoutOptions = {
  //     dimensions: [cols,rows], // specifies number of columns and rows
  //   };
  // }

  // $scope.$watch( function(){ return MyStory.getStoriesCnt();}, function(newValue){
  //   if($scope.storiesArray.length > 0){
  //     calculateGrid();
  //   }
  // });

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

  $scope.formatDate = function(date) {
    return moment(date).format('LLL');
  }

  $scope.goToDetail = function(storyId) {
    $state.go('story_detail', {id: storyId});
  }

  // $scope.gridLayoutOptions = {
  //   dimensions: [2,2], // specifies number of columns and rows
  // };
});