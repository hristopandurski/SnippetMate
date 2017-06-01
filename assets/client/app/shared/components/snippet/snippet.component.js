(function() {
    'use strict';

    angular.module('app.components.snippet', []).component('snippetComponent', {
        templateUrl: 'app/shared/components/snippet/snippet.component.html',
        controller: snippetComponentController,
        controllerAs: 'scc',
        bindings: {
            snippet: '<'
        }
    });

    snippetComponentController.$inject = ['$timeout'];
    function snippetComponentController($timeout) {
        var vm = this;

        $timeout(function() {
            $('.snippet-card').each(function(i, item) {
                var snippet = ace.edit(item);
                snippet.setTheme('ace/theme/textmate');
                snippet.setReadOnly(true);
            });
        }, 10);
    }
})();
