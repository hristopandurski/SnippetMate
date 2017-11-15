(function() {
    'use strict';

    angular.module('app.components.new-snippet', ['ngMaterial', 'app.services.languages', 'app.services.user',
                    'app.services.snippet', 'app.services.label'])
        .component('newSnippetComponent', {
            templateUrl: 'app/shared/components/new-snippet-modal/new-snippet-modal.component.html',
            controller: newSnippetComponentController,
            controllerAs: 'nsc',
            bindings: {
                onCreate: '&'
            }
        });

    newSnippetComponentController.$inject = ['$scope', '$mdToast', 'LanguageService', 'UserService', 'SnippetService',
                                             'LabelService'];

    function newSnippetComponentController($scope, $mdToast, LanguageService, UserService, SnippetService, LabelService) {
        var vm = this;

        // Dependencies
        vm.LanguageService = LanguageService;

        vm.$mdToast = $mdToast;

        // Events
        $scope.$on('clearSnippetModal', function(event, args) {
            vm.snippetTitle = '';
            vm.snippetCode.setValue('');
            vm.description = '';
            $scope.form.$setPristine();

            vm.$onInit();
        });

        // Variables
        vm.selectedLabels = [];

        vm.labelIds = [];

        vm.snippetCode = '';

        vm.hasSelectedLabel = false;

        // Runs on every label checkbox click. Manages the label ids in the vm.labelIds variable.
        vm.toggle = function(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);

                if (list.length < 1) {
                    vm.hasSelectedLabel = false;
                }
            } else {
                list.push(item);

                vm.hasSelectedLabel = true;
            }
        };

        vm.exists = function(item, list) {
            return list.indexOf(item) > -1;
        };

        vm.isIndeterminate = function() {
            return (vm.selectedLabels.length !== 0 && vm.selectedLabels.length !== vm.labelIds.length);
        };

        vm.isChecked = function() {
            return vm.selectedLabels.length === vm.labelIds.length;
        };

        vm.toggleAll = function() {
            if (vm.selectedLabels.length === vm.labelIds.length) {
                vm.hasSelectedLabel = false;

                vm.selectedLabels = [];
            } else if (vm.selectedLabels.length === 0 || vm.selectedLabels.length > 0) {
                vm.selectedLabels = vm.labelIds.slice(0);

                vm.hasSelectedLabel = true;
            }
        };

        vm.changedLanguage = () => {
            var title = vm.snippetTitle ? vm.snippetTitle : '',
                namePart = title.substring(0, title.indexOf('.'));

            if (namePart === '' && title === '') {
                namePart = 'myfilename';
            } else if (title.indexOf('.') === -1) {
                namePart = title;
            }

            vm.snippetTitle = namePart + '.' + vm.selectedLanguage;

            // set the language for the code editor box
            if (vm.selectedLanguage == 'js') {
                vm.snippetCode.getSession().setMode('ace/mode/javascript');
            } else {
                vm.snippetCode.getSession().setMode('ace/mode/' + vm.selectedLanguage);
            }
        };

        vm.checkTitle = () => {
            var title = vm.snippetTitle ? vm.snippetTitle : '',
                namePart = title.substring(0, title.indexOf('.'));

            if (namePart === '' && !!title) {
                vm.snippetTitle +=  '.' + vm.selectedLanguage;
            }
        };

        vm.saveSnippet = () => {
            var newSnippet = {
                    description: vm.description,
                    title: vm.snippetTitle,
                    code: vm.snippetCode.getValue(),
                    language: vm.selectedLanguage,
                    isStarred: false
                };

            // assign the already selected labels to the snippet
            newSnippet.labels = vm.getSelectedLabels();

            if (!newSnippet.description || !newSnippet.title || !newSnippet.code || !newSnippet.language || !newSnippet.labels.length) {
                vm.error = true;
                return;
            }

            UserService.GetById()
                .then(function(user) {
                    if (!user) {
                        // TODO: show error
                        return;
                    }

                    // set the userId of the new snippet equal to the current user id
                    newSnippet.userId = user.id;

                    SnippetService.setSnippets(newSnippet)
                        .then(function(data) {
                            $('#new-snippet-modal').remodal().close();

                            // call filterUserSnippets function from parent controller in order to update the shown snippets
                            vm.onCreate();
                        })
                        .catch(function(err) {
                            vm.showError('Could not create the new snippet.');
                        });
                })
                .catch(function(err) {
                    vm.showError('Could not get the user id.');
                });

        };

        vm.codeEditorInit = () => {
            vm.snippetCode = ace.edit('editor');
            vm.snippetCode.setTheme('ace/theme/textmate');
            vm.snippetCode.getSession().setMode('ace/mode/javascript');
            vm.snippetCode.$blockScrolling = Infinity;
        };

        vm.getLabels = () => {
            vm.labelIds = [];

            LabelService.getLabels()
                .then(function(data) {
                    vm.labels = data;

                    $(vm.labels).each(function(i, item) {
                        vm.labelIds.push(item.id);
                    });
                })
                .catch(function() {
                    vm.showError('Could not fetch the labels.');
                });
        };

        vm.$onInit = () => {
            vm.getLanguages();
            vm.getLabels();
            vm.codeEditorInit();
        };
    };

    /**
    * Show error toaster.
    *
    * @param {String} message
    */
    newSnippetComponentController.prototype.showError = function(message) {
        var vm = this;

        vm.$mdToast.show(
            vm.$mdToast.simple()
                .textContent('Error: ' + message)
                .position('bottom right')
                .hideDelay(3000)
        );
    };

    newSnippetComponentController.prototype.getLanguages = function() {
        var vm = this;

        vm.LanguageService.get()
            .then(function(data) {
                vm.languages = data;

                // sets initial value to 'js'
                vm.selectedLanguage = vm.languages[0].appendix;
            })
            .catch(function(err) {
                vm.showError('Could not fetch the languages.');
            });
    };

    /*
    * Compare each label to the the selectedLabels array and determine
    * which of the labels are selected
    */
    newSnippetComponentController.prototype.getSelectedLabels = function() {
        var vm = this,
            result = [],
            isSelected;

        if (!vm.labels.length || !vm.selectedLabels.length) {
            return [];
        }

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
})();
