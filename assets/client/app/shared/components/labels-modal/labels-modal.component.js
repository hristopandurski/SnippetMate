(function() {
    'use strict';

    angular.module('app.components.labels', ['mp.colorPicker', 'app.services.authentication', 'app.services.label'])
        .component('labelsComponent', {
            templateUrl: 'app/shared/components/labels-modal/labels-modal.component.html',
            controller: labelsComponentController,
            controllerAs: 'lbc',
            bindings: {
                onCreate: '&'
            }
        });

    labelsComponentController.$inject = ['$scope', 'AuthenticationService', 'LabelService'];
    function labelsComponentController($scope, AuthenticationService, LabelService) {
        var vm = this;

        vm.labelColor = '#5CAEE9';

        $scope.$on('clearLabelsModal', function(event, args) {
            vm.labelTitle = '';
            $scope.form.$setPristine();
        });

        vm.saveLabel = () => {
            var user = AuthenticationService.GetCurrentUser(),
                authdata = user.authdata,
                newLabel = {
                    title: vm.labelTitle,
                    color: vm.labelColor,
                    authdata: authdata
                };

            LabelService.getLabels()
                        .then(function(data) {
                            var labels = data;

                            // assign id
                            var lastLabel = labels[labels.length - 1] || {id: 0};
                            newLabel.id = lastLabel.id + 1;

                            // save the new label
                            labels.push(newLabel);
                            LabelService.setLabels(labels);

                            $('#new-label-modal').remodal().close();

                            // call filterUserSnippets function from parent controller in order to update the shown snippets
                            vm.onCreate();
                        });

        };
    }
})();
