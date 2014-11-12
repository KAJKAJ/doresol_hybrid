'use strict';

/**
 * @ngdoc object
 * @name core.config
 * @requires ng.$stateProvider
 * @requires ng.$urlRouterProvider
 * @description Defines the routes and other config within the core module
 */
angular
    .module('core')
    .config(['$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/profile');

            /**
             * @ngdoc event
             * @name core.config.route
             * @eventOf core.config
             * @description
             *
             * Define routes and the associated paths
             *
             * - When the path is `'/'`, route to home
             * */
            $stateProvider
              .state('profile', {
                url: '/profile',
                templateUrl: 'modules/core/views/profile.html',
                controller: 'ProfileCtrl',
                authenticate: true
              })
              .state('story', {
                url: '/story',
                templateUrl: 'modules/core/views/story.html',
                controller: 'StoryCtrl',
                authenticate: true
              })
              .state('story_detail', {
                url: '/story_detail/:id',
                templateUrl: 'modules/core/views/story_detail.html',
                controller: 'StoryDetailCtrl',
                authenticate: true
              })
              .state('letter', {
                url: '/letter',
                templateUrl: 'modules/core/views/letter.html',
                controller: 'LetterCtrl',
                authenticate: true
              })
              .state('letter_detail', {
                url: '/letter_detail:id',
                templateUrl: 'modules/core/views/letter_detail.html',
                controller: 'LetterDetailCtrl',
                authenticate: true
              })
              .state('login', {
                url: '/login',
                templateUrl: 'modules/core/views/login.html',
                controller: 'LoginCtrl'
              })
              .state('member', {
                url: '/member',
                templateUrl: 'modules/core/views/member.html',
                controller: 'MemberCtrl',
                authenticate: true
              })
              ;
        }
    ]);
