(function() {
    'use strict';

    angular.module('app.components.snippet', ['app.directives.editor-value']).component('snippetComponent', {
        templateUrl: 'app/shared/components/snippet/snippet.component.html',
        controller: snippetComponentController,
        controllerAs: 'scc',
        bindings: {
            snippet: '<'
        }
    });

    snippetComponentController.$inject = ['$timeout', 'LabelService'];

    function snippetComponentController($timeout, LabelService) {
        let vm = this;

        vm.labels = [];

        $timeout(function() {
            $(vm.snippet.labels).each(function(i, id) {
                let labelContainer = {
                    id: id
                };

                LabelService.getOne(labelContainer)
                    .then(function(res) {
                        vm.labels.push(res);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            });
        }, 0);
    }
})();
