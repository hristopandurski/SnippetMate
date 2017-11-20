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

        vm.edit = () => {
            vm.data.code = vm.snippetCode.getValue();
            vm.data.labels = vm.selectedLabels;

            SnippetService.edit(vm.data)
                .then(function(res) {
                    vm.snippet = vm.data;

                    vm.onEdit();
                })
                .catch(function(err) {
                    console.log('Error when trying to edit the snippet.');
                });
        };

        vm.$onInit = () => {
            let parsedLabel;

            // get all labels
            LabelService.getLabels()
                .then(function(response) {
                    vm.labels = response;

                    $(vm.labels).each(function(i, item) {
                        vm.labelIds.push(item.id);
                    });
                })
                .catch(function() {
                    console.log('Error in fetching the labels.');
                });

            vm.data = angular.copy(vm.snippet);

            // get the labels selected for the opened snippet
            $(vm.snippet.labels).each(function(index, item) {
                parsedLabel = parseInt(item);

                vm.selectedLabels.push(parsedLabel);
            });

            vm.codeEditorInit();
        };
    };

    editSnippetComponentController.prototype.cancel = function() {
        this.onCancel();
    };

    // Initialize ace editor with its relevant settings.
    editSnippetComponentController.prototype.codeEditorInit = function() {
        let vm = this,
            language = vm.data.language,
            editorMode = 'ace/mode/' + language;

        vm.snippetCode = ace.edit('edit-code-box');
        vm.snippetCode.setTheme('ace/theme/textmate');
        vm.snippetCode.$blockScrolling = Infinity;
        vm.snippetCode.setValue(vm.data.code, -1);

        // set the language for the code editor box
        if (language == 'js') {
            editorMode = 'ace/mode/javascript';
        }

        vm.snippetCode.getSession().setMode(editorMode);
    };

    // Appends the selected language to the filename.
    editSnippetComponentController.prototype.checkTitle = function() {
        let vm = this,
            title = vm.data.title ? vm.data.title : '',
            language = vm.data.language,
            namePart = title.substring(0, title.indexOf('.'));

        if (namePart === '' && title.indexOf('.') !== -1) {
            vm.data.title =  'myfilename.' + language;
        } else if (namePart === '' && !!title) {
            vm.data.title +=  '.' + language;
        }
    };

    /**
    * Adds the clicked label to the list of selected.
    *
    * @param item {Number}
    * @param list {array}
    */
    editSnippetComponentController.prototype.toggle = function(item, list) {
        let vm = this,
            idx = list.indexOf(item);

        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }

        vm.isInitial = false;
    };

    /**
    * Pre-selects the labels for the snippet.
    *
    * @param itemId {Number}
    * @param list {array}
    * @return {boolean}
    */
    editSnippetComponentController.prototype.exists = function(itemId, list) {
        let vm = this;

        if (vm.isInitial) {
            var isSelected = false;

            $(vm.snippet.labels).each(function(i, id) {
                if (parseInt(id) === itemId) {
                    isSelected = true;
                }
            });

            return isSelected;
        }

        return list.indexOf(itemId) > -1;
    };

    editSnippetComponentController.prototype.isIndeterminate = function() {
        let vm = this;

        return (vm.selectedLabels.length !== 0 && vm.selectedLabels.length !== vm.labelIds.length);
    };

    editSnippetComponentController.prototype.isChecked = function() {
        let vm = this;

        if (vm.isInitial) {
            return vm.snippet.labels.length === vm.labelIds.length;
        }

        return vm.selectedLabels.length === vm.labelIds.length;
    };

    editSnippetComponentController.prototype.toggleAll = function() {
        let vm = this;

        if (vm.selectedLabels.length === vm.labelIds.length) {
            vm.selectedLabels = [];
        } else if (vm.selectedLabels.length === 0 || vm.selectedLabels.length > 0) {
            vm.selectedLabels = vm.labelIds.slice(0);
        }

        vm.isInitial = false;
    };

    editSnippetComponentController.prototype.changedLanguage = function() {
        let vm = this,
            title = vm.data.title,
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
}());
