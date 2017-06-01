(function() {
    'use strict';

    angular.module('app.services.label', []).service('LabelService', LabelService);

    LabelService.$inject = ['LocalStorage', '$q'];

    function LabelService(LocalStorage, $q) {
        var self = this;

        self.getLabels = () => {
            var deferred = $q.defer(),
                labels = LocalStorage.get('labels');

            deferred.resolve(labels);

            return deferred.promise;
        };

        self.setLabels = (newValue) => {
            LocalStorage.set('labels', newValue);
        };
    };
}());
