(function() {
    'use strict';

    angular.module('app.register', ['app.services.user'])
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$location', 'UserService'];
    function RegisterController($location, UserService) {
        var vm = this,
            user = {};

        vm.register = register;
        vm.registerError = false;

        function register() {
            vm.dataLoading = true;
            user = {
                'username': vm.username,
                'password': vm.password
            };

            UserService.Add(user)
                .then(function(response) {

                if (response.success) {
                    $location.path('/login');
                } else {
                    vm.dataLoading = false;
                    vm.registerError = true;
                    vm.errorMsg = response.message;
                }
            });
        }
    }
})();
