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
                .then(function(res) {
                    $location.path('/login');
                })
                .catch(function(res) {
                    vm.registerError = true;
                    vm.errorMsg = 'Username "' + user.username + '" is already taken';
                })
                .finally(function() {
                    vm.dataLoading = false;
                });
        }
    }
})();
