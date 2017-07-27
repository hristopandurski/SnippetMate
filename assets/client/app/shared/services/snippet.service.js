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
                url: '/snippets/getSnippets'
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.setSnippets = (newValue) => {
            LocalStorage.set('snippets', newValue);
        };
    };
}());
