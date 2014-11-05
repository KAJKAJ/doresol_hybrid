'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('StoryCtrl', function($scope,ENV,$firebase,$famous, Memorial, User){
  $scope.hostUrl = ENV.HOST;

  var EventHandler = $famous['famous/core/EventHandler'];
  $scope.eventHandler = new EventHandler();
  
  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();

  $scope.mode = 'overview';
  $scope.storiesArray = [];
  $scope.storiesObject = {};
  $scope.storiesCnt = 0;
  
  $scope.boxSize = 200;
  $scope.windowWidth = window.innerWidth;

  $(window).resize(function(){
    $scope.windowWidth = window.innerWidth;
    $scope.$apply(function(){
       //do something to update current scope based on the new innerWidth and let angular update the view.
       calculateGrid();
    });
  });

  var calculateGrid = function(){
    var cols = 0;
    var rows = 0;
   
    cols = Math.floor($scope.windowWidth/$scope.boxSize);
    rows = Math.ceil($scope.storiesCnt/cols);
    
    $scope.gridHeight = $scope.boxSize*rows;
    $scope.gridLayoutOptions = {
      dimensions: [cols,rows], // specifies number of columns and rows
    };
  }

  $scope.$watch('storiesCnt',function(newValue){
    // $scope.gridHeight = newValue*$scope.boxSize/2;
    if(newValue > 0){
      calculateGrid();
    }
  });

  $scope.memorial.$loaded().then(function(value){
    
    $scope.isOwner = Memorial.isOwner();
    $scope.isMember = Memorial.isMember();
    $scope.isGuest = Memorial.isGuest();

    angular.forEach(value.stories, function(story, key) {
      story.$id = key;
      $scope.assignStory(story);
      $scope.storiesCnt++;
    });

  });

  var currentStoriesRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/stories');
  var _stories = $firebase(currentStoriesRef).$asArray();

  _stories.$watch(function(event){
    switch(event.event){
      case "child_removed":
        var storyId = event.key;

        // delete from timeline and setting
        var index = $scope.storiesArray.indexOf(event.key);
        if( index >= 0) {
          $scope.storiesArray.splice(index, 1);
          delete $scope.storiesObject[storyId];
        }
        $scope.storiesCnt--;
        break;
      case "child_added":
      break;
    }
  });

  $scope.assignStory = function(value) {
    $scope.storiesArray.push(value.$id);
    $scope.storiesObject[value.$id] = value;
    
    $scope.storiesArray.sort(function(aKey,bKey){
      var aValue = $scope.storiesObject[aKey];
      var bValue = $scope.storiesObject[bKey];
      var aStartDate = moment(aValue.startDate).unix();
      var bStartDate = moment(bValue.startDate).unix();
      return aStartDate > bStartDate ? 1 : -1;
    });
  }

  $scope.changeMode = function(story,mode){
    $scope.selectedStory = story;
    $scope.mode = mode;
  }

});