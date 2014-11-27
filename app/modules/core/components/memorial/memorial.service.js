'use strict';

 angular.module('doresolApp')
  .factory('Memorial', function Memorial($firebase, $q, ENV, Util, User, $http) {
  
  var myMemorials = {};
  var myWaitingMemorials = {};
  var inviteUrl = null;
  var leader = {};

  var currentMemorial = null;

  var role = {
  	isOwner : false,
  	isMember: false,
  	isGuest:false
  }
  
  var setCurrentMemorial = function(memorialId){
  	// console.log('setCurrentMemorial');
  	var addMemberForMemorial = function(user){
  		// console.log(memorial);
  		// console.log(user);
  		if(user.uid !== currentMemorial.ref_user ) {
		    if(currentMemorial.public){
	  			var userMemberRef = new Firebase(ENV.FIREBASE_URI + '/users/' + user.uid + '/memorials/members');
			    $firebase(userMemberRef).$set(memorialId, true);
			    
			    var memorialMemberRef = new Firebase(ENV.FIREBASE_URI + '/memorials/' + memorialId + '/members');
					$firebase(memorialMemberRef).$set(user.uid, true);

					setMyRole('member');
	  		}else{
	  			var userWaitingRef = new Firebase(ENV.FIREBASE_URI + '/users/' + user.uid + '/memorials/waitings');
			    $firebase(userWaitingRef).$set(memorialId, true);

			    var memorialWaitingRef = new Firebase(ENV.FIREBASE_URI + '/memorials/' + memorialId + '/waitings');
					$firebase(memorialWaitingRef).$set(user.uid, true);

	  			setMyRole('guest');
	  		}
		  }
  	}

  	var setRoleForMemorial = function(){
  		var user = User.getCurrentUser();
  		if(user && user.uid === currentMemorial.ref_user ) {
		    setMyRole('owner');
		  } else {
		    // no member 
		    if(currentMemorial.members === undefined) {
		    	addMemberForMemorial(user);
		      // setMyRole('guest');
		    } else {
		      // member
		      if(user && currentMemorial.members[user.uid]) {
		        setMyRole('member');
		      } else {
		      	addMemberForMemorial(user);
		        // setMyRole('guest');
		      }
		    }
		  }

      leader = User.findById(currentMemorial.ref_user);
	    User.setUsersObject(currentMemorial.ref_user);

	    // console.log(role);
  	}

  	if(currentMemorial == null) {
  		currentMemorial = findById(memorialId);
  		
  		currentMemorial.$loaded().then(function(){
  			setRoleForMemorial();
			});	

			currentMemorial.$watch(function() {
			  setRoleForMemorial();
			});
  	}
  }

  var getLeader = function() {
  	return leader;
  }

  var getInviteUrl = function() {
  	return inviteUrl;
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

	var setMyRole = function(type){
		switch(type) {
			case 'owner':
				role.isOwner= true;
				role.isMember = role.isGuest = false;
				break;
			case 'member':
				role.isOwner = role.isGuest = false;
				role.isMember = true;
				break;
			default:
				role.isOwner = role.isMember = false;
				role.isGuest = true;
				break;
		}
	}

	var getRole = function(){
		return role;
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

    getInviteUrl:getInviteUrl,
    getLeader:getLeader,
    
		createEra:createEra,
		updateEra:updateEra,
		removeEra:removeEra,

		//member 
		addMember: addMember,

		// waiting
		addWaiting:addWaiting,
		removeWaiting:removeWaiting,

		// role related
		getRole : getRole
	};
	
});
