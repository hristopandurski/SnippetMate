(function() {
    'use strict';

    angular.module('app.components.edit-snippet', ['ngMaterial', 'app.services.languages', 'app.services.snippet',
                   'app.services.label'])
        .component('editSnippetComponent', {
            templateUrl: 'app/shared/components/edit-snippet/edit-snippet.component.html',
            controller: editSnippetComponentController,
            controllerAs: 'esc',
            bindings: {
                snippet: '<',
                onCancel: '&',
                onEdit: '&'
            }
        });

    editSnippetComponentController.$inject = ['$timeout', '$filter', 'LanguageService', 'SnippetService',
                                              'LabelService'];

    function editSnippetComponentController($timeout, $filter, LanguageService, SnippetService, LabelService) {
        var vm = this;

        LanguageService.get().then(function(data) {
            vm.languages = data;
        });

        vm.labelIds = [];

        vm.selectedLabels = [];

        vm.isInitial = true;

        vm.toggle = function(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
            }

            vm.isInitial = false;
        };

        vm.exists = function(item, list) {
            if (vm.isInitial) {
                var isSelected = false;

                $(vm.snippet.labels).each(function(i, label) {
                    if (label.id === item) {
                        isSelected = true;
                    }
                });

                return isSelected;
            }

            return list.indexOf(item) > -1;
        };

        vm.isIndeterminate = function() {
            return (vm.selectedLabels.length !== 0 && vm.selectedLabels.length !== vm.labelIds.length);
        };

        vm.isChecked = function() {
            if (vm.isInitial) {
                return vm.snippet.labels.length === vm.labelIds.length;
            }

            return vm.selectedLabels.length === vm.labelIds.length;
        };

        vm.toggleAll = function() {
            if (vm.selectedLabels.length === vm.labelIds.length) {
                vm.selectedLabels = [];
            } else if (vm.selectedLabels.length === 0 || vm.selectedLabels.length > 0) {
                vm.selectedLabels = vm.labelIds.slice(0);
            }

            vm.isInitial = false;
        };

        vm.changedLanguage = () => {
            var title = vm.data.title,
                language = vm.data.language,
                namePart = title.substring(0, title.indexOf('.')),
                editorMode = 'ace/mode/' + language;

            if (namePart === '' && title === '') {
                namePart = 'myfilename';
            } else if (title.indexOf('.') === -1) {
                namePart = title;
            }

            // apply the edited language to the title
            vm.data.title = namePart + '.' + language;

            // set the language for the code editor box
            if (language == 'js') {
                editorMode = 'ace/mode/javascript';
            }

            vm.snippetCode.getSession().setMode(editorMode);
        };

        vm.checkTitle = () => {
            var title = vm.data.title ? vm.data.title : '',
                language = vm.data.language,
                namePart = title.substring(0, title.indexOf('.'));

            if (namePart === '' && title.indexOf('.') !== -1) {
                vm.data.title =  'myfilename.' + language;
            } else if (namePart === '' && !!title) {
                vm.data.title +=  '.' + language;
            }
        };

        vm.codeEditorInit = () => {
            var language = vm.data.language,
                editorMode = 'ace/mode/' + language;

            vm.snippetCode = ace.edit('edit-code-box');
            vm.snippetCode.setTheme('ace/theme/textmate');

            // set the language for the code editor box
            if (language == 'js') {
                editorMode = 'ace/mode/javascript';
            }

            vm.snippetCode.getSession().setMode(editorMode);
        };

        vm.edit = () => {
            var allSnippets;

            SnippetService.getSnippets()
                        .then(function(response) {
                            allSnippets = response;

                            // get the edited data
                            vm.data.code = vm.snippetCode.getValue();
                            vm.data.labels = vm.getLabels();

                            // replace the existing item with the edited one
                            $(allSnippets).each(function(i, item) {
                                if (item.id === vm.data.id) {
                                    allSnippets.splice(i, 1, vm.data);
                                }
                            });

                            SnippetService.setSnippets(allSnippets);

                            vm.onEdit();
                        });
        };

        vm.cancel = () => {
            vm.onCancel();
        };

        vm.$onInit = () => {
            vm.data = angular.copy(vm.snippet);

            // get all labels
            LabelService.getLabels()
                        .then(function(response) {
                            vm.labels = response;

                            $(vm.labels).each(function(i, item) {
                                vm.labelIds.push(item.id);
                            });
                        });

            // get the labels selected for the opened snippet
            $(vm.snippet.labels).each(function(index, item) {
                vm.selectedLabels.push(item.id);
            });

            $timeout(function() {
                vm.codeEditorInit();
            }, 10);
        };
    };

    /*
    * Compare each label to the the selectedLabels array and determine
    * which of the labels are selected
    */
    editSnippetComponentController.prototype.getLabels = function() {
        var vm = this,
            result = [],
            isSelected;

        return result = vm.labels.filter(function(obj) {
            isSelected = false;

            $(vm.selectedLabels).each(function(i, id) {
                if (obj.id === id) {
                    isSelected = true;
                }
            });

            return isSelected;
        });
    };
}());
