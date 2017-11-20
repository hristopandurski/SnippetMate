(function() {
    'use strict';

    angular.module('app.services.label', []).service('LabelService', LabelService);

    LabelService.$inject = ['$q', '$http'];

    function LabelService($q, $http) {
        var self = this;

        self.getLabels = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/labels/get'
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.getOne = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/labels/getOne',
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

        self.setLabels = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/labels/create',
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

        self.edit = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'PUT',
                url: '/labels/edit',
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
