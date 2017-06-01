(function() {
    'use strict';

    angular.module('app.services.snippet', []).service('SnippetService', SnippetService);

    SnippetService.$inject = ['LocalStorage', '$q'];

    function SnippetService(LocalStorage, $q) {
        var self = this;

        self.getSnippets = () => {
            var deferred = $q.defer(),
                snippets = LocalStorage.get('snippets');

            deferred.resolve(snippets);

            return deferred.promise;
        };

        self.setSnippets = (newValue) => {
            LocalStorage.set('snippets', newValue);
        };
    };
}());
