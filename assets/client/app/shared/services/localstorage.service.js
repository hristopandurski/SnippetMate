(function() {
    'use strict';

    angular.module('app.services.localStorage', [])
        .factory('LocalStorage', LocalStorage);

    /* @ngInject */
    function LocalStorage() {
        var service = {
            set: set,
            get: get
        };

        return service;

        function set(key,val) {
            localStorage[key] = JSON.stringify(val);
        }

        function get(key) {
            if (!localStorage[key]) {
                localStorage[key] = JSON.stringify([]);
            }

            return JSON.parse(localStorage[key]);
        }
    }
})();
