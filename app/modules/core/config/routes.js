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
              .state('login', {
                url: '/login',
                templateUrl: 'modules/core/views/login.html',
                controller: 'LoginCtrl'
              });
        }
    ]);
