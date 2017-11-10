(function() {
    'use strict';

    angular.element(document).ready(function() {
        angular.bootstrap(document, ['app']);
    });

    var app = angular
        .module('app', ['app.home', 'app.login', 'app.register', 'app.services.authentication',
                        'app.utils.isAuthenticated', 'ui.router', 'ngMaterial', 'app.services.interceptor'])
        .config(($stateProvider, $locationProvider, $httpProvider) => {

            $locationProvider.html5Mode(true);

            $stateProvider.state('home', {
                    url: '/',
                    controller: 'HomeController',
                    templateUrl: 'app/home/home.html',
                    controllerAs: 'vm',
                    resolve: {
                        init: function(IsAuthenticated) {
                            IsAuthenticated.isLogged();
                        }
                    }
                })

                .state('snippet-details', {
                    url: 'snippet-details/:id',
                    parent: 'home',
                    controller: 'SnippetDetailsController',
                    templateUrl: 'app/snippet-details/snippet-details.html',
                    controllerAs: 'vm',
                    resolve: {
                        init: function(IsAuthenticated) {
                            IsAuthenticated.isLogged();
                        }
                    }
                })

                .state('login', {
                    url: '/login',
                    controller: 'LoginController',
                    templateUrl: 'app/login/login.html',
                    controllerAs: 'vm'
                })

                .state('register', {
                    url: '/register',
                    controller: 'RegisterController',
                    templateUrl: 'app/register/register.html',
                    controllerAs: 'vm'
                });

            //TODO: change the interceptor's logic
            //$httpProvider.interceptors.push('myHttpInterceptor');

        });
})();
