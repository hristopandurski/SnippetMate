(function() {
    'use strict';

    angular.module('app.components.snippet', ['app.directives.editor-value']).component('snippetComponent', {
        templateUrl: 'app/shared/components/snippet/snippet.component.html',
        controllerAs: 'scc',
        bindings: {
            snippet: '<'
        }
    });
})();
