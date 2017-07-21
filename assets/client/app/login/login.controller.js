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
            .then(function() {
                $location.path('/');
            })
            .catch(function() {
                vm.loginError = true;
            })
            .finally(function() {
                vm.dataLoading = false;
            });
        };
    }
})();
