(function() {
    'use strict';

    angular.module('app.utils.isAuthenticated', ['app.services.user']).service('IsAuthenticated', IsAuthenticated);

    IsAuthenticated.$inject = ['UserService', '$location'];

    function IsAuthenticated(UserService, $location) {
        this.isLogged = () => {

            UserService.isAuthenticated()
                .then(function(res) {
                    if (res.error) {
                        return $location.path('/login');
                    }
                })
                .catch(function(err) {
                    return $location.path('/login');
                });
        };
    };
}());
