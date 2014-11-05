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

  // for setting
  $scope.storiesArray = [];
  $scope.storiesArray['timeline'] = [];
 
  $scope.storiesObject = {};
  $scope.storiesObject['timeline'] = {};
  
  $scope.memorial.$loaded().then(function(value){
    
    $scope.isOwner = Memorial.isOwner();
    $scope.isMember = Memorial.isMember();
    $scope.isGuest = Memorial.isGuest();

    angular.forEach(value.stories, function(story, key) {
      story.$id = key;
      $scope.assignStory(story);
    });

  });

  var currentStoriesRef =  new Firebase(ENV.FIREBASE_URI + '/memorials/'+ENV.MEMORIAL_KEY+'/stories');
  var _stories = $firebase(currentStoriesRef).$asArray();

  _stories.$watch(function(event){
    switch(event.event){
      case "child_removed":
        var storyId = event.key;

        // delete from timeline and setting
        var index = $scope.storiesArray['timeline'].indexOf(event.key);
        if( index >= 0) {
          $scope.storiesArray['timeline'].splice(index, 1);
          delete $scope.storiesObject['timeline'][storyId];
        }
        break;
      case "child_added":
      break;
    }
  });

  $scope.assignStory = function(value) {
    $scope.storiesArray['timeline'].push(value.$id);
    $scope.storiesObject['timeline'][value.$id] = value;
    
    $scope.storiesArray['timeline'].sort(function(aKey,bKey){
      var aValue = $scope.storiesObject['timeline'][aKey];
      var bValue = $scope.storiesObject['timeline'][bKey];
      var aStartDate = moment(aValue.startDate).unix();
      var bStartDate = moment(bValue.startDate).unix();
      return aStartDate > bStartDate ? 1 : -1;
    });
  }

  $scope.mode = 'overview';
  console.log($scope.mode);

  $scope.changeMode = function(story,mode){
    console.log(story);
    console.log(mode);
    $scope.selectedStory = story;
    console.log('---- selected story---');
    console.log($scope.selectedStory);
    _loadStoryComments($scope.selectedStory);
    $scope.mode = mode;
  }

  var _loadStoryComments = function(story) {
    $scope.commentsObject = {};
    $scope.users = User.getUsersObject();
    $scope.newComment = {};

    $scope.commentsTotalCnt = 0;

    var storyCommentsRef = new Firebase(ENV.FIREBASE_URI + '/memorials/' + ENV.MEMORIAL_KEY + '/stories/'+story.$id + '/comments/');
    var _comments = $firebase(storyCommentsRef).$asArray();
    
    var commentsRef = new Firebase(ENV.FIREBASE_URI + '/comments');

    _comments.$watch(function(event){
      switch(event.event){
        case "child_removed":
          delete $scope.commentsObject[event.key];
          $scope.commentsTotalCnt--;
        break;
        case "child_added":
          var childRef = commentsRef.child(event.key);
          var child = $firebase(childRef).$asObject();
          child.$loaded().then(function(valueComment){
            valueComment.fromNow = moment(valueComment.created_at).fromNow();
            if($scope.commentsObject == undefined) $scope.commentsObject = {};
            $scope.commentsObject[event.key] = valueComment;
            User.setUsersObject(valueComment.ref_user);
            console.log($scope.commentsObject);
          });
          $scope.commentsTotalCnt ++;
        break;
      }
    });
  }

  // $scope.gridLayoutOptions = {
  //   dimensions: [2,2], // specifies number of columns and rows
  // };
});