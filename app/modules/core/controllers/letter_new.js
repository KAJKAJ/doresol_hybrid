'use strict';

angular
.module('core')
.controller('LetterNewCtrl', function($scope,$state,ENV,$firebase,$famous,Composite, Memorial, User, Util, $timeout){
  $scope.hostUrl = ENV.HOST;
  $scope.fileUploading = false;
  $scope.fileAdded = false;

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

  $scope.addPhoto = function(type){
    var sourceType = null;

    switch(type){
      case 'CAMERA':
        sourceType = Camera.PictureSourceType.CAMERA;
      break;
      case 'GALLERY':
        sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
      break;
    }

    var options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.JPEG,
        sourceType: sourceType,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit : false,
    }
    
    navigator.camera.getPicture(
      function (imageURI) {
          // console.log(imageURI);
          upload(imageURI);
      },
      function (message) {
          // We typically get here because the use canceled the photo operation. Fail silently.
      }, options);

    // Upload image to server
    var upload = function (imageURI) {
      $timeout(function(){
        $scope.fileUploading = true;
        $scope.fileAdded = false;
        delete $scope.newStory.file;
      });
      
      var ft = new FileTransfer();
      var options = new FileUploadOptions();

      options.fileKey = "file";
      var fileName = getFileUniqueId() + imageURI.substr(imageURI.lastIndexOf('/') + 1) + '.jpg'; 
      options.fileName = fileName; 
      options.mimeType = "image/jpeg";
      options.chunkedMode = false;
      options.params = { 
        // Whatever you populate options.params with, will be available in req.body at the server-side.
        // "description": "Uploaded from my phone"
      };

      ft.upload(imageURI, $scope.hostUrl + "/api/fileuploadsfromapp",
        function (e) {
          $timeout(function(){
            console.log('upload success');
            $scope.newStory.file = {
              type:'image',
              location:'local',
              url:'/tmp/' + fileName,
              updated_at:moment().toString()
            };
            console.log($scope.newStory.file.url);
            $scope.fileUploading = false;
            $scope.fileAdded = true;
          });
        },
        function (e) {
          alert("사진 저장 실패");
          $scope.fileUploading = false;
        }, options
      );
    }
  }
  
  var getFileUniqueId = function(file){
    return $scope.user.uid.replace(/[^\.0-9a-zA-Z_-]/img, '') + '-' + Util.getUniqueId();
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