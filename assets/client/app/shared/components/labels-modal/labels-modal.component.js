(function() {
    'use strict';

    angular.module('app.components.labels', ['mp.colorPicker', 'app.services.user', 'app.services.label'])
        .component('labelsComponent', {
            templateUrl: 'app/shared/components/labels-modal/labels-modal.component.html',
            controller: labelsComponentController,
            controllerAs: 'lbc',
            bindings: {
                onCreate: '&'
            }
        });

    labelsComponentController.$inject = ['$scope', '$mdToast', 'UserService', 'LabelService'];

    function labelsComponentController($scope, $mdToast, UserService, LabelService) {

        // Variables
        var vm = this;

        vm.labelColor = '#5CAEE9';

        // Dependencies
        vm.$mdToast = $mdToast;

        // Events
        $scope.$on('clearLabelsModal', function(event, args) {
            vm.labelTitle = '';
            $scope.form.$setPristine();
        });

        vm.saveLabel = () => {
            var newLabel = {
                    title: vm.labelTitle,
                    color: vm.labelColor
                };

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
                    newLabel.userId = user.id;

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
