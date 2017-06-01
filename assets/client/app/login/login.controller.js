(function() {
    'use strict';

    angular.module('app.login', ['app.services.authentication'])
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService'];
    function LoginController($location, AuthenticationService) {
        var vm = this;

        vm.loginError = false;

        vm.login = () => {
            vm.dataLoading = true;

            AuthenticationService.Login(vm.username, vm.password, function(response) {
                if (response.success) {
                    AuthenticationService.SetCredentials(vm.username, vm.password);
                    $location.path('/');
                } else {
                    vm.dataLoading = false;
                    vm.loginError = true;
                }
            });
        };

        // reset login status
        vm.$onInit = () => {
            AuthenticationService.ClearCredentials();
        };

    }
})();
