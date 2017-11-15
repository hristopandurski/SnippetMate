(function() {
    'use strict';

    angular
        .module('app.services.interceptor', [])
        .factory('myHttpInterceptor', myHttpInterceptor);

    myHttpInterceptor.$inject = ['$q', '$location', '$injector'];
    function myHttpInterceptor($q, $location, $injector) {
        var interceptor = {};

        var _request = function(config) {
            //success logic here
            return config;
        };

        var _responseError = function(rejection) {
            //error here. for example server respond with 401
            $location.path('/login');

            return $q.reject(rejection);
        };

        interceptor.request = _request;
        interceptor.responseError = _responseError;

        return interceptor;
    };
}());
