(function() {
    'use strict';

    angular.module('app.services.label', []).service('LabelService', LabelService);

    LabelService.$inject = ['LocalStorage', '$q', '$http'];

    function LabelService(LocalStorage, $q, $http) {
        var self = this;

        self.getLabels = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/labels/getLabels'
            })
            .then(function(res) {
                return deferred.resolve(res);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.setLabels = (newValue) => {
            LocalStorage.set('labels', newValue);
        };
    };
}());
