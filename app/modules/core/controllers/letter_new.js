'use strict';

angular
.module('core')
.controller('LetterNewCtrl', function($scope,$state,ENV,$firebase,$famous,Composite, Memorial, User){
  $scope.hostUrl = ENV.HOST;

  var EventHandler = $famous['famous/core/EventHandler'];
  $scope.eventHandler = new EventHandler();
  
  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.memorialKey = ENV.MEMORIAL_KEY;

  $scope.user = User.getCurrentUser();

  $scope.newStory = {};
  $scope.newStory.public = true;

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

  $scope.createNewStory = function(form){
    if(form.$valid){
      $scope.newStory.type = 'storyline';
      // if($scope.newStory.file){
      //   var file = {
      //     type: $scope.newStory.file.type,
      //     location: 'local',
      //     url: '/tmp/' + $scope.newStory.file.uniqueIdentifier,
      //     updated_at: moment().toString()
      //   }
      //   $scope.newStory.file = file;
      // }

      $scope.newStory.ref_memorial = $scope.memorialKey;
      $scope.newStory.ref_user = $scope.user.uid;

      Composite.createStorylineStory($scope.memorialKey,$scope.newStory).then(function(value){
        $scope.newStory = {};
        if($scope.newStoryForm){
          $scope.newStoryForm.$setPristine({reload: true,notify: true});
        }
        $state.go('letter');
      }, function(error){
        console.log(error);
      });
    }
  }
});