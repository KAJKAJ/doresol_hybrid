'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('StoryDetailCtrl', function($scope,ENV,$firebase,$famous,Composite, Memorial, User, $stateParams, MyStory){
  $scope.hostUrl = ENV.HOST;

  var EventHandler = $famous['famous/core/EventHandler'];
  $scope.eventHandler = new EventHandler();
  
  $scope.user = User.getCurrentUser();
  $scope.story = MyStory.getStoryObj($stateParams.id);
  $scope.mode = 'detail';
  $scope.role = Memorial.getRole();

  var _loadStoryComments = function(story) {
    $scope.commentsObject = {};
    $scope.users = User.getUsersObject();
    $scope.newComment = {};

    $scope.commentsTotalCnt = 0;

    var storyCommentsRef = new Firebase(ENV.FIREBASE_URI + '/memorials/' + ENV.MEMORIAL_KEY + '/stories/'+ $scope.story.$id + '/comments/');
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
          });
          $scope.commentsTotalCnt ++;
        break;
      }
    });
  }

  // first loading comments
  _loadStoryComments();

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