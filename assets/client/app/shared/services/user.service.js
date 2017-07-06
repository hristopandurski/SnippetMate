(function() {
    angular.module('app.services.user', []).service('UserService', UserService);

    UserService.$inject = ['$timeout', '$filter', '$q', '$http'];

    function UserService($timeout, $filter, $q, $http) {
        var self = this;

        self.GetById = (id) => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/show',
                data: id
            }).then(function(user) {
                return user;
            });
        };

        self.GetByUsername = (user) => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/show',
                params: user
            }).then(function(user) {

                return deferred.resolve(user.data);
            }, function(err) {

                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.GetAll = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/showAll'
            }).then(function(users) {
                return deferred.resolve(users);
            }, function(err) {

                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.Add = (user) => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/users/create',
                params: user
            }).then(function(res) {
                return deferred.resolve(res);
            }, function(err) {

                return deferred.reject(err);
            });

            return deferred.promise;
        };
    }

    UserService.prototype.getUsers = function() {
        if (!localStorage.users) {
            localStorage.users = JSON.stringify([]);
        }

        return JSON.parse(localStorage.users);
    };

    UserService.prototype.setUsers = function(users) {
        localStorage.users = JSON.stringify(users);
    };
})();
