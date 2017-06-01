(function() {
    angular.module('app.services.user', []).service('UserService', UserService);

    UserService.$inject = ['$timeout', '$filter', '$q'];

    function UserService($timeout, $filter, $q) {
        var self = this;

        self.GetById = (id) => {
            var deferred = $q.defer(),
                filtered = $filter('filter')(self.getUsers(), {id: id}),
                user = filtered.length ? filtered[0] : null;

            deferred.resolve(user);
            return deferred.promise;
        };

        self.GetAll = () => {
            var deferred = $q.defer();
            deferred.resolve(self.getUsers());

            return deferred.promise;
        };

        self.Add = (user) => {
            var deferred = $q.defer();

            // simulate api call with $timeout
            $timeout(function() {
                self.GetByUsername(user.username)
                    .then(function(duplicateUser) {
                        if (duplicateUser !== null) {
                            deferred.resolve({
                                success: false,
                                message: 'Username "' + user.username + '" is already taken'
                            });
                        } else {
                            var users = self.getUsers();

                            // assign id
                            var lastUser = users[users.length - 1] || {id: 0};
                            user.id = lastUser.id + 1;

                            // save to local storage
                            users.push(user);
                            self.setUsers(users);

                            deferred.resolve({success: true});
                        }
                    });
            }, 1000);

            return deferred.promise;
        };

        self.GetByUsername = (username) => {
            var deferred = $q.defer();
            var filtered = $filter('filter')(self.getUsers(), {username: username});
            var user = filtered.length ? filtered[0] : null;

            deferred.resolve(user);
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
