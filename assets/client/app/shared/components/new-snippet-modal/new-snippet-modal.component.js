(function() {
    'use strict';

    angular.module('app.components.new-snippet', ['ngMaterial', 'app.services.languages', 'app.services.authentication',
                    'app.services.snippet', 'app.services.label'])
        .component('newSnippetComponent', {
            templateUrl: 'app/shared/components/new-snippet-modal/new-snippet-modal.component.html',
            controller: newSnippetComponentController,
            controllerAs: 'nsc',
            bindings: {
                onCreate: '&'
            }
        });

    newSnippetComponentController.$inject = ['$scope', 'LanguageService', 'AuthenticationService', 'SnippetService',
                                             'LabelService'];

    function newSnippetComponentController($scope, LanguageService, AuthenticationService, SnippetService,
                                           LabelService) {
        var vm = this;

        vm.labelIds = [];

        vm.selectedLabels = [];

        vm.snippetCode = '';

        $scope.$on('clearSnippetModal', function(event, args) {
            vm.snippetTitle = '';
            vm.snippetCode.setValue('');
            vm.description = '';
            vm.selectedLanguage = vm.languages[0].appendix;
            $scope.form.$setPristine();

            vm.$onInit();
        });

        LanguageService.get().then(function(data) {
            vm.languages = data;

            // sets initial value to 'js'
            vm.selectedLanguage = vm.languages[0].appendix;
        });

        vm.toggle = function(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
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
                vm.selectedLabels = [];
            } else if (vm.selectedLabels.length === 0 || vm.selectedLabels.length > 0) {
                vm.selectedLabels = vm.labelIds.slice(0);
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
            var user = AuthenticationService.GetCurrentUser(),
                authdata = user.authdata,
                newSnippet = {
                    description: vm.description,
                    title: vm.snippetTitle,
                    code: vm.snippetCode.getValue(),
                    language: vm.selectedLanguage,
                    created: new Date(),
                    isStarred: false,
                    authdata: authdata
                };

            // assign the already selected labels to the snippet
            newSnippet.labels = vm.getSelectedLabels();

            SnippetService.getSnippets()
                        .then(function(data) {
                            var snippets = data;

                            // assign id
                            var lastSnippet = snippets[snippets.length - 1] || {id: 0};
                            newSnippet.id = lastSnippet.id + 1;

                            // save to local storage
                            snippets.push(newSnippet);
                            SnippetService.setSnippets(snippets);

                            $('#new-snippet-modal').remodal().close();

                            // call filterUserSnippets function from parent controller in order to update the shown snippets
                            vm.onCreate();
                        });

        };

        vm.codeEditorInit = () => {
            vm.snippetCode = ace.edit('editor');
            vm.snippetCode.setTheme('ace/theme/textmate');
            vm.snippetCode.getSession().setMode('ace/mode/javascript');
        };

        vm.getLabels = () => {
            LabelService.getLabels()
                        .then(function(data) {
                            vm.labels = data;

                            $(vm.labels).each(function(i, item) {
                                vm.labelIds.push(item.id);
                            });
                        });
        };

        vm.$onInit = () => {
            vm.getLabels();
            vm.codeEditorInit();
        };
    };

    /*
    * Compare each label to the the selectedLabels array and determine
    * which of the labels are selected
    */
    newSnippetComponentController.prototype.getSelectedLabels = function() {
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
})();
