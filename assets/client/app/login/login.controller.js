(function() {
    'use strict';

    angular.module('app.login', ['app.services.authentication'])
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService'];
    function LoginController($location, AuthenticationService) {
        var vm = this;

        vm.loginError = false;

        vm.login = () => {
            var user = {
                username: vm.username,
                password: vm.password
            };

            vm.dataLoading = true;

            AuthenticationService.Login(user)
                .then(function(res) {
                    if (res.error) {
                        vm.loginError = true;
                        return;
                    }

                    $location.path('/');
                })
                .catch(function(err) {
                    vm.loginError = true;
                })
                .finally(function() {
                    vm.dataLoading = false;
                });
        };
    }
})();
