(function() {
    'use strict';

    angular
        .module('app.services.interceptor', [])
        .factory('myHttpInterceptor', myHttpInterceptor);

    myHttpInterceptor.$inject = ['$location', '$injector'];
    function myHttpInterceptor($location, $injector) {
        return {
            // 'request': function(config) {
            //
            //     //injected manually to get around circular dependency problem.
            //     var AuthenticationService = $injector.get('AuthenticationService'),
            //         currentUser = AuthenticationService.GetCurrentUser();
            //
            //     if (currentUser) {
            //         config.headers['Authorization'] = 'Base ' + currentUser.authdata;
            //     } else {
            //         config.headers['Authorization'] = 'Base';
            //     }
            //
            //     return config;
            // }
        };
    };
}());
