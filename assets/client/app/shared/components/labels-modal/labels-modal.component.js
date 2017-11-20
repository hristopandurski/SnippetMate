(function() {
    'use strict';

    angular.module('app.components.labels', ['mp.colorPicker', 'app.services.user', 'app.services.label'])
        .component('labelsComponent', {
            templateUrl: 'app/shared/components/labels-modal/labels-modal.component.html',
            controller: labelsComponentController,
            controllerAs: 'lbc',
            bindings: {
                onCreate: '&',
                afterEdit: '&',
                selectedLabel: '<'
            }
        });

    labelsComponentController.$inject = ['$scope', '$mdToast', 'UserService', 'LabelService'];

    function labelsComponentController($scope, $mdToast, UserService, LabelService) {
        // Variables
        var vm = this;

        vm.label = {
            title: '',
            color: '#5CAEE9'
        };

        vm.isEditing = false;

        // Dependencies
        vm.$mdToast = $mdToast;

        // Events
        $scope.$on('clearLabelsModal', function(event, args) {
            vm.isEditing = false;
            vm.label = {};

            // Clear form.
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
        });

        $scope.$on('editLabel', function(event, args) {
            vm.isEditing = true;

            vm.label = angular.copy(vm.selectedLabel);
        });

        vm.saveLabel = () => {
            var newLabel = vm.label;

            if (!newLabel.title || !newLabel.color) {
                return;
            }

            UserService.GetById()
                .then(function(user) {
                    if (!user) {
                        vm.showError('No current user.');
                        return;
                    }

                    // set the userId of the new snippet equal to the current user id
                    //newLabel.userId = user.id;

                    if (vm.isEditing) {
                        vm.updateLabel(newLabel);
                        return;
                    }

                    LabelService.setLabels(newLabel)
                        .then(function(data) {
                            $('#new-label-modal').remodal().close();

                            // call filterUserSnippets function from parent controller in order to update the shown labels
                            vm.onCreate();
                        })
                        .catch(function(err) {
                            vm.showError('Could not create a label.');
                        });
                })
                .catch(function(err) {
                    vm.showError('Could not fetch user id.');
                });

        };

        vm.updateLabel = (label) => {

            LabelService.edit(label)
                .then(function(data) {
                    $('#new-label-modal').remodal().close();

                    // call filterUserLabels function from parent controller in order to update the shown labels
                    vm.onCreate();

                    // call filterUserSnippets function from parent controller in order to update the shown labels
                    vm.afterEdit();
                })
                .catch(function(err) {
                    vm.showError('Could not create a label.');
                });
        };
    }

    /**
    * Show error toaster.
    *
    * @param {String} message
    */
    labelsComponentController.prototype.showError = function(message) {
        var vm = this;

        vm.$mdToast.show(
            vm.$mdToast.simple()
                .textContent('Error: ' + message)
                .position('bottom right')
                .hideDelay(3000)
        );
    };
})();
