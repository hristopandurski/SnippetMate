(function() {
    'use strict';

    angular.module('app.services.starred', []).service('StarredService', StarredService);

    StarredService.$inject = ['LocalStorage', '$q'];

    function StarredService(LocalStorage, $q) {
        var self = this;

        self.getStarred = () => {
            var deferred = $q.defer(),
                starred = LocalStorage.get('starred');

            deferred.resolve(starred);

            return deferred.promise;
        };

        self.setStarred = (data) => {
            LocalStorage.set('starred', data);
        };
    };
}());
