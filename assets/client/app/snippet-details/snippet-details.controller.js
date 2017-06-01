(function() {
    'use strict';

    angular.module('app.snippet-details', ['app.components.edit-snippet', 'app.services.localStorage',
                                           'app.services.snippet', 'app.services.starred'])
           .controller('SnippetDetailsController', SnippetDetailsController);

    SnippetDetailsController.$inject = ['$stateParams', '$location', '$scope', '$filter', '$mdSidenav', '$timeout',
                                        'LocalStorage', 'SnippetService', 'StarredService'];

    function SnippetDetailsController($stateParams, $location, $scope, $filter, $mdSidenav, $timeout, LocalStorage,
                                      SnippetService, StarredService) {
        var vm = this,
            snippets,
            starred;

        vm.editingSnippet = false;

        vm.isEditing = () => {
            vm.editingSnippet = !vm.editingSnippet;
        };

        // get the edited snipet from the local storage and close the editing panel
        vm.onEdit = () => {
            vm.filterSelectedSnippet();

            // update the ace readonly editor
            var snippet = ace.edit('detailed-code');
            snippet.setValue(vm.snippet.code);

            vm.isEditing();
        };

        // close the editing panel
        vm.onCancel = () => {
            vm.isEditing();
        };

        // remove snippet from local storage
        vm.onDelete = () => {
            starred = starred.filter(function(obj) {
                return obj.id !== vm.snippet.id;
            });

            snippets = snippets.filter(function(obj) {
                return obj.id !== vm.snippet.id;
            });

            SnippetService.setSnippets(snippets);
            StarredService.setStarred(starred);

            vm.onClose();
        };

        vm.onClose = () => {
            $scope.$parent.vm.filterUserSnippets();

            $location.path('/');
        };

        vm.starSnippet = (event) => {
            var $icon = $(event.target);

            // add/remove snippet from starred
            if (vm.snippet.isStarred) {
                $icon.removeClass('isStarred');

                starred = starred.filter(function(obj) {
                    return obj.id !== vm.snippet.id;
                });

                vm.snippet.isStarred = false;
            } else {
                $icon.addClass('isStarred');
                starred.push(vm.snippet);
                vm.snippet.isStarred = true;
            }

            // save to local storage
            SnippetService.setSnippets(snippets);
            StarredService.setStarred(starred);
        };

        vm.snippetTweet = () => {
            window.open('https://twitter.com/share?url=' + escape(window.location.href) +
                        '&text=' + vm.snippet.title, '',
                        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
            return false;
        };

        vm.codePrettifier = () => {
            var snippet = ace.edit('detailed-code');
            snippet.setTheme('ace/theme/textmate');
            snippet.setReadOnly(true);
        };

        vm.filterSelectedSnippet = () => {
            SnippetService.getSnippets()
                        .then(function(data) {
                            snippets = data;

                            vm.snippet = $filter('filter')(snippets, {id: parseInt($stateParams.id)})[0];

                            if (vm.snippet.isStarred) {
                                vm.isStarred = true;
                            }
                        });
        };

        vm.$onInit = () => {
            vm.isStarred = false;

            // get the data for the opened snippet
            vm.filterSelectedSnippet();

            $timeout(function() {
                // unhide the sidebar
                $mdSidenav('right').toggle();

                // initialize ace code editor
                vm.codePrettifier();
            }, 10);

            StarredService.getStarred()
                    .then(function(data) {
                        starred = data;
                    });
        };
    }
})();
