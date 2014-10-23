'use strict';

 angular.module('doresolApp')
  .factory('Memorial', function Memorial($firebase, $q, ENV, Util) {
  
  var myMemorials = {};
  var myWaitingMemorials = {};
  
  var currentMemorial = null;

  var myRole = null;
  var isRoleOwner = false;
  var isRoleMember = false;
  var isRoleGuest = false;

  var setCurrentMemorial = function(memorialId){
    currentMemorial = findById(memorialId);
  }

  var getCurrentMemorial = function(){
    return currentMemorial;
  }

  var setMemorialSummary = function(memorial){
  	memorial.count_member = 1;
  	if(memorial.stories){
  		memorial.count_timeline = Object.keys(memorial.stories).length;
  	}else{
  		memorial.count_timeline = 0;
  	}

  	if(memorial.storyline && memorial.storyline.stories){
  		memorial.count_storyline = Object.keys(memorial.storyline.stories).length;
  	}else{
  		memorial.count_storyline = 0;
  	}

  	if(memorial.members){
  		memorial.count_member += Util.objectSize(memorial.members);
  	}
  	return memorial;
  }

  var addMyMemorial = function(key,value){
  	var newVal = setMemorialSummary(value);
  	myMemorials[key] = newVal;
  }

  var removeMyMemorial = function(key){
  	delete myMemorials[key];
  }

  var getMyMemorials = function(){
  	return myMemorials;
  }

  var getMyWaitingMemorials = function() {
  	return myWaitingMemorials;
  }

  var fetchMyWaitingMemorials = function(userId) {
  	var userMemorialWaitingsRef = new Firebase(ENV.FIREBASE_URI + '/users/' + userId + '/memorials/waitings');
  	var _waitings = $firebase(userMemorialWaitingsRef).$asArray();

  	_waitings.$watch(function(event){
      switch(event.event){
        case "child_removed":
        	delete myWaitingMemorials[event.key];
        break;
        case "child_added":
        	var memorialRef = new Firebase(ENV.FIREBASE_URI + '/memorials/' + event.key);
	  			var _memorial = $firebase(memorialRef).$asObject();
	  			
	  			_memorial.$loaded().then(function(value){
	  				value = setMemorialSummary(value);
	  				myWaitingMemorials[value.$id] = value;
	  			});

	  	  break;
      }
    });
  }

  var getMyMemorial = function(memorialId) {
    return myMemorials[memorialId];
  }
  	
  var clearMyMemorial = function(){
  	myMemorials = {};
  	myWaitingMemorials = {};
  }

	var ref = new Firebase(ENV.FIREBASE_URI + '/memorials');
	var memorials = $firebase(ref).$asArray();

	var create = function(memorial) {
		return memorials.$add(memorial).then( function(ref) {
    	return {
				key: ref.name(),
				fileParentPath: memorial.file?ref.toString():null,
				fileUrl:  memorial.file?memorial.file.url:null
			}
		});  	
  }

  var update = function(memorialId, data) {
  	var updateMemorial = $firebase(ref);
    return updateMemorial.$update(memorialId, data);
  }

	var findById = function(memorialId){
		var memorial = ref.child(memorialId);
		return $firebase(memorial).$asObject();
	}

	var remove = function(memorialId) {
		// var memorial = Memorial.find(memorialId);

		// memorial.$on('loaded', function() {
		// 	var user = User.$getCurrentUser();

		// 	memorials.$remove(memorialId).then( function() {
		// 		user.$child('memorials').$child('owns').$remove(memorialId);
		// 	});

		// });
	}

	var createEra = function(memorialId, eraItem) {
		var eraRef = ref.child(memorialId + '/timeline/era');
		var era = $firebase(eraRef);
		return era.$push(eraItem);
	}

	var updateEra = function(memorialId, eraId, eraItem){
		var eraRef = ref.child(memorialId + '/timeline/era');
		var era = $firebase(eraRef);
		return era.$set(eraId,eraItem);
	}

	var removeEra = function(memorialId, eraId){
		var eraRef = ref.child(memorialId + '/timeline/era');
		var era = $firebase(eraRef);
		return  era.$remove(eraId);
	}

	var addMember = function(memorialId, inviteeId){
		var membersRef = ref.child(memorialId + '/members');
		var member = $firebase(membersRef);

		return member.$set(inviteeId, true).then(function(value){
			return {
				memorialId: memorialId,
				inviteeId: inviteeId
			};
		});
	};

	var addWaiting = function(memorialId, requesterId) {
		var waitingsRef = ref.child(memorialId + '/waitings');
		var waiting = $firebase(waitingsRef);

		return waiting.$set(requesterId, true).then(function(value){
			return {
				memorialId: memorialId,
				requesterId: requesterId
			};
		});
	};

	var removeWaiting = function(memorialId, requesterId) {
		var waitingsRef = ref.child(memorialId + '/waitings');
		var waiting = $firebase(waitingsRef);

		return waiting.$remove(requesterId).then(function(value){
			return {
				memorialId: memorialId,
				requesterId: requesterId
			};
		});
	};

	var setMyRole = function(role){
		myRole = role;
		switch(role) {
			case 'owner':
				isRoleOwner= true;
				isRoleMember = isRoleGuest = false;
				break;
			case 'member':
				isRoleOwner = isRoleGuest = false;
				isRoleMember = true;
				break;
			default:
				isRoleOwner = isRoleMember = false;
				isRoleGuest = true;
				break;
		}
	}

	var getMyRole = function(){
		return myRole;
	}

	var isOwner = function(){
		return isRoleOwner;
	}

	var isMember = function(){
		return isRoleMember;
	}

	var isGuest = function(){
		return isRoleGuest;
	}

	return {
		remove: remove,
		create: create,
		findById: findById,
		update:update,

		addMyMemorial:addMyMemorial,
		removeMyMemorial:removeMyMemorial,
		getMyMemorials:getMyMemorials,
    getMyMemorial:getMyMemorial,
    clearMyMemorial:clearMyMemorial,
    setCurrentMemorial:setCurrentMemorial,
    getCurrentMemorial:getCurrentMemorial,
    getMyWaitingMemorials:getMyWaitingMemorials,
    fetchMyWaitingMemorials:fetchMyWaitingMemorials,
    setMemorialSummary:setMemorialSummary,

		createEra:createEra,
		updateEra:updateEra,
		removeEra:removeEra,

		//member 
		addMember: addMember,

		// waiting
		addWaiting:addWaiting,
		removeWaiting:removeWaiting,

		// role related
		setMyRole:setMyRole,
		getMyRole:getMyRole,
		isOwner:isOwner,
		isMember:isMember,
		isGuest:isGuest
	};
	
});
