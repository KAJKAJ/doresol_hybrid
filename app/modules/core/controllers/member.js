'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('MemberCtrl', function($scope,ENV,$firebase,$state,Composite,Memorial, User, Member, Auth, Util){
  $scope.hostUrl = ENV.HOST;

  // inviteUrl 처리
  // $scope.$watch( function(){ return Memorial.getInviteUrl();}, function(newValue){
  //   $scope.inviteUrl = newValue;
  // });

  $scope.$watch( function(){ return Memorial.getLeader();}, function(newValue){
    $scope.leader = newValue;
  });

  $scope.memorial = Memorial.getCurrentMemorial();
  $scope.user = User.getCurrentUser();
  $scope.users = User.getUsersObject();

  $scope.members = Member.getMembers();
  $scope.waitings = Member.getWaitings();
  
  $scope.role = Memorial.getRole();
 
  // remove member from member list
  $scope.removeMember = function(uid,logout) {
    Member.removeMember(uid).then(function(){
      if(logout){
        Auth.logout();
        $scope.user = null;
        User.setCurrentUser();
        $state.go('login');
      }
    });
  };

  // from waiting list to member list
  $scope.moveMember = function(uid) {
    var params = { memorialId: ENV.MEMORIAL_KEY, inviteeId: uid} ;
      Composite.addMember(params).then(function(){
      var removeParams = {
          memorialId: ENV.MEMORIAL_KEY,
          requesterId: uid
      };
      Composite.removeWaiting(removeParams).then(function(value){
      })
    }, function(error){
      console.log(error);
    })
  };

  $scope.getWaitingsCnt = function(){
    return Util.objectSize($scope.waitings);
  }

  $scope.getMembersCnt = function(){
    return Util.objectSize($scope.members);
  }

});