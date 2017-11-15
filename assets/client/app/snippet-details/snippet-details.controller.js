(function() {
    'use strict';

    angular.module('app.snippet-details', ['app.components.edit-snippet', 'app.services.localStorage',
                                           'app.services.snippet', 'app.services.starred'])
           .controller('SnippetDetailsController', SnippetDetailsController);

    SnippetDetailsController.$inject = ['$stateParams', '$location', '$scope', '$filter', '$mdSidenav', '$timeout',
                                        'LocalStorage', 'SnippetService', 'StarredService'];

    function SnippetDetailsController($stateParams, $location, $scope, $filter, $mdSidenav, $timeout, LocalStorage,
                                      SnippetService, StarredService) {
        var vm = this;

        // dependencies
        vm.$stateParams = $stateParams;
        vm.$filter = $filter;
        vm.SnippetService = SnippetService;

        // global variables
        vm.model = {
            snippets: {},
            starred: {}
        };

        vm.editingSnippet = false;

        vm.isEditing = () => {
            vm.editingSnippet = !vm.editingSnippet;
        };

        // Get the edited snipet from the local storage and close the editing panel.
        vm.onEdit = () => {
            vm.filterSelectedSnippet();

            vm.isEditing();
        };

        // Close the editing panel.
        vm.onCancel = () => {
            vm.isEditing();
        };

        // Delete the snippet.
        vm.onDelete = () => {
            let data = {
                id: vm.snippet.id
            };

            SnippetService.delete(data)
                .then(function() {
                    console.log('Snippet is deleted successfully!');
                })
                .catch(function() {
                    // TODO: show error
                    console.log(err);
                })
                .finally(function() {
                    vm.onClose();
                });
        };

        vm.onClose = () => {
            $scope.$parent.vm.filterUserSnippets();

            $location.path('/');
        };

        // Update the starred condition of the snippet.
        vm.starSnippet = (event) => {
            let $icon = $(event.target),
                data = {
                    id: vm.snippet.id,
                    isStarred: vm.snippet.isStarred
                };

            if (vm.snippet.isStarred) {
                $icon.removeClass('isStarred');

                vm.snippet.isStarred = false;
            } else {
                $icon.addClass('isStarred');

                vm.snippet.isStarred = true;
            }

            SnippetService.star(data)
                .then(function() {
                    console.log('Starred the snippet successfully!');
                })
                .catch(function(err) {
                    // TODO: show error
                    console.log(err);
                });
        };

        // Opens up the tweet window so the user can share the tweet.
        vm.snippetTweet = () => {
            window.open('https://twitter.com/share?url=' + escape(window.location.href) +
                        '&text=' + vm.snippet.title, '',
                        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
            return false;
        };

        vm.codePrettifier = () => {
            var editor = ace.edit('detailed-code');

            editor.setTheme('ace/theme/textmate');
            editor.setValue(vm.snippet.code, -1);
            editor.$blockScrolling = Infinity;
            editor.setReadOnly(true);
        };

        vm.$onInit = () => {
            vm.isStarred = false;

            vm.filterSelectedSnippet();

            $timeout(function() {
                // unhide the sidebar
                $mdSidenav('right').toggle();
            }, 0);
        };
    }

    // Get the data related to the opened snippet.
    SnippetDetailsController.prototype.filterSelectedSnippet = function() {
        let vm = this,
            editor,
            snippet = {
                id: parseInt(vm.$stateParams.id)
            };

        vm.SnippetService.getOne(snippet)
            .then(function(res) {
                vm.snippet = res;

                if (vm.snippet.isStarred) {
                    vm.isStarred = true;
                }

                // update the ace readonly editor if the snippet has been edited
                vm.codePrettifier();
            })
            .catch(function(err) {
                console.log('Error in fetching the opened snippet.');
            });
    };
})();
