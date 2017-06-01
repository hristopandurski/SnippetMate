(function() {
    'use strict';

    angular
        .module('app.services.authentication', ['app.services.user', 'app.data.encoder', 'app.services.localStorage'])
        .service('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$timeout', 'UserService', 'Base64', 'LocalStorage'];

    function AuthenticationService($timeout, UserService, Base64, LocalStorage) {
        var self = this;

        self.Login = (username, password, callback) => {
            /*  uses $timeout to simulate api call */
            $timeout(function() {
                var response;
                UserService.GetByUsername(username)
                    .then(function(user) {
                        if (user !== null && user.password === password) {
                            response = {success: true};
                        } else {
                            response = {success: false, message: 'Username or password is incorrect'};
                        }

                        callback(response);
                    });
            }, 1000);
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
