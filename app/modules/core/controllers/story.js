'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('StoryCtrl', function($scope,ENV,$firebase,$famous,Composite, Memorial, User){
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
            console.log('---- commentsObject ----');
            console.log($scope.commentsObject);
            console.log('---- usersObject ----');
            console.log($scope.users);

          });
          $scope.commentsTotalCnt ++;
        break;
      }
    });
  }
  $scope.addComment = function(storyKey,comment){
    if(comment.body){
      Composite.createCommentFromStoryInMemorial(ENV.MEMORIAL_KEY,storyKey,comment);
      $scope.newComment = {}; 
    }
  }

  $scope.deleteComment = function(storyKey, commentKey) {
    delete $scope.commentsObject[storyKey][commentKey];
    Comment.removeCommentFromStoryInMemorial(ENV.MEMORIAL_KEY, storyKey, commentKey);
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

  $scope.formatDate = function(date) {
    return moment(date).format('LLL');
  }


  // $scope.gridLayoutOptions = {
  //   dimensions: [2,2], // specifies number of columns and rows
  // };
});