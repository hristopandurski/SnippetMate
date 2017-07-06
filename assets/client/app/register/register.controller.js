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

            // check if a username with the same details already exists
            UserService.GetByUsername(user)
                        .then(function(res) {
                            // if user doesn't exist, add the user to the db
                            if (res.error) {
                                UserService.Add(user)
                                    .then(function(res) {
                                        $location.path('/login');
                                    }, function(err) {

                                        throw err;
                                    });

                            // if user exists, display error message
                            } else {
                                vm.dataLoading = false;
                                vm.registerError = true;
                                vm.errorMsg = 'Username "' + user.username + '" is already taken';
                            }
                        }, function(err) {

                            throw err;
                        });
        }
    }
})();
