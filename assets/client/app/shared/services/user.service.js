(function() {
    angular.module('app.services.user', []).service('UserService', UserService);

    UserService.$inject = ['$timeout', '$filter', '$q', '$http'];

    function UserService($timeout, $filter, $q, $http) {
        var self = this;

        self.GetById = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/showById'
            })
            .then(function(user) {
                return deferred.resolve(user.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });
        };

        self.GetByUsername = (user) => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/show',
                params: user
            })
            .then(function(user) {
                return deferred.resolve(user.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.GetAll = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/showAll'
            })
            .then(function(users) {
                return deferred.resolve(users);
            })
            .catch(function(err) {
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
            })
            .then(function(res) {
                return deferred.resolve(res);
            })
            .catch(function(err) {
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
