'use strict';

/**
 * @ngdoc object
 * @name core.Controllers.HomeController
 * @description Home controller
 * @requires ng.$scope
 */
angular
.module('core')
.controller('HomeController', function($scope,ENV,$firebase, Auth){
  // Auth.logout();
	// $scope.memorials = [];

  // var memorialsRef = new Firebase(ENV.FIREBASE_URI + '/memorials');
  
  // var _memorails = $firebase(memorialsRef).$asArray();

  // _memorails.$watch(function(event){
  //   switch(event.event){
  //     case "child_removed":
  //     break;
  //     case "child_added":
  //       // $scope.memorials.push()
  //       var memorialRef = new Firebase(ENV.FIREBASE_URI + '/memorials/' + event.key);
  // 			var _memorial = $firebase(memorialRef).$asObject();
  			
  // 			_memorial.$loaded().then(function(value){
  // 				// value = setMemorialSummary(value);
  // 				$scope.memorials[value.$id] = value;
  // 				console.log($scope.memorials);
  // 			});
  //     break;
  //   }
  // });
});