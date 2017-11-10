(function() {
    'use strict';

    angular
        .module('app.services.authentication', ['app.services.user', 'app.data.encoder', 'app.services.localStorage'])
        .service('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$timeout', '$http', '$q', 'UserService', 'Base64', 'LocalStorage'];

    function AuthenticationService($timeout, $http, $q, UserService, Base64, LocalStorage) {
        var self = this;

        self.Login = (user) => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/login',
                params: user
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.Logout = () => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/logout'
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.SetCredentials = (username, password) => {
            var authdata = Base64.encode(username + ':' + password),
                user = {
                    username: username,
                    authdata: authdata
                };

            LocalStorage.set('currentUser', user);
        };

        self.ClearCredentials = () => {
            LocalStorage.set('currentUser', null);
        };

        self.GetCurrentUser = () => {
            if (!localStorage.currentUser) {
                localStorage.currentUser = JSON.stringify({});
            }

            return JSON.parse(localStorage.currentUser);
        };
    }
})();
