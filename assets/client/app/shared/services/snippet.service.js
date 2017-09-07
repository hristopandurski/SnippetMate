(function() {
    'use strict';

    angular.module('app.services.snippet', []).service('SnippetService', SnippetService);

    SnippetService.$inject = ['LocalStorage', '$q', '$http'];

    function SnippetService(LocalStorage, $q, $http) {
        var self = this;

        self.getSnippets = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/snippets/get'
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.setSnippets = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/snippets/create',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.star = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'PUT',
                url: '/snippets/star',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.delete = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'DELETE',
                url: '/snippets/delete',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };
    };
}());
