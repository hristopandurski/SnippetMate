(function() {
    'use strict';

    angular
        .module('app.services.languages', [])
        .service('LanguageService', LanguageService);

    LanguageService.$inject = ['$http'];

    function LanguageService($http) {
        this.get = () => {
            return $http.get('app/shared/data/languages.json').then((response) => {
                return response.data;
            });
        };
    }
})();
