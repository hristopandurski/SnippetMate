(function() {
    'use strict';

    angular.module('app.home', ['app.components.snippet', 'app.components.labels', 'app.components.new-snippet',
                                'app.services.authentication', 'app.snippet-details', 'app.services.snippet',
                                'app.services.label', 'app.services.user', 'app.services.starred', 'ngMaterial'])
            .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', '$location', '$filter', '$timeout', '$mdSidenav', '$mdToast', 'AuthenticationService',
                            'UserService', 'SnippetService', 'LabelService', 'StarredService'];

    function HomeController($scope, $location, $filter, $timeout, $mdSidenav, $mdToast, AuthenticationService,
                            UserService, SnippetService, LabelService, StarredService) {

        // Variables
        var vm = this,
            modalOptions = {
                'hashTracking': false,
                'closeOnOutsideClick': false,
                'closeOnEscape': false
            };

        vm.snippets = [];

        vm.labels = [];

        vm.warning = false;

        // Dependencies
        vm.AuthenticationService = AuthenticationService;

        vm.UserService = UserService;

        vm.$mdToast = $mdToast;

        vm.$location = $location;

        // Show the snippets created by the logged in user.
        vm.filterUserSnippets = () => {

            SnippetService.getSnippets()
                .then(function(response) {
                    // User is not logged in.
                    if (response.error) {
                        $location.path('/login');
                    }

                    // Parse the label property stored in the Snippets table
                    $(response).each(function(i, obj) {
                        $(obj.labels).each(function(z, label) {
                            response[i].labels[z] = JSON.parse(label);
                        });
                    });

                    vm.snippets = response;
                })
                .catch(function(err) {
                    vm.showError('Could not fetch snippets.');
                });
        };

        // Show the labels created by the logged in user.
        vm.filterUserLabels = () => {
            LabelService.getLabels()
                .then(function(response) {
                    // User is not logged in.
                    if (response.error) {
                        $location.path('/login');
                    }

                    vm.labels = response;
                })
                .catch(function(err) {
                    vm.showError('Could not fetch labels.');
                });
        };

        // Filter out all of the snippets depending on the selected filter.
        vm.selectFilter = (event) => {
            let $tab = $(event.delegateTarget),
                value = $tab.text().trim(),
                result = [];

            if ($tab.hasClass('filter-selected')) {
                return;
            }

            SnippetService.getSnippets()
                .then(function(data) {
                    // refill the already fitlered snippets
                    vm.snippets = data;

                    switch (value) {
                        case 'My Snippets':

                            // show all snippets
                            vm.filterUserSnippets();
                            break;
                        case 'Starred':

                            // show only the starred snippets
                            $(vm.snippets).each(function(i, item) {
                                if (item.isStarred) {
                                    result.push(item);
                                }
                            });

                            vm.snippets = result;
                            break;
                        default:

                            // Filter depending on the selected label
                            $(vm.snippets).each(function(i, item) {
                                $(item.labels).each(function(index, obj) {

                                    // parse the stringified JSON
                                    item.labels[index] = JSON.parse(obj);

                                    if (item.labels[index].title === value) {
                                        result.push(item);
                                    }
                                });
                            });

                            vm.snippets = result;
                    }
                })
                .catch(function(err) {
                    vm.showError('Could not filter snippets.');
                });

            $tab.siblings().removeClass('filter-selected');
            $tab.addClass('filter-selected');
        };

        vm.openSnippetModal = () => {
            if (!vm.labels.length) {
                vm.warning = true;

                $timeout(function() {
                    vm.warning = false;
                }, 3000);

                return;
            }

            $scope.$broadcast('clearSnippetModal');
            $('#new-snippet-modal').remodal(modalOptions).open();
        };

        vm.openLabelsModal = () => {
            $scope.$broadcast('clearLabelsModal');
            $('#new-label-modal').remodal(modalOptions).open();
        };

        vm.editLabel = (ev) => {
            let index = $(ev.target).attr('data-index');

            vm.selectedLabel = vm.labels[index];

            // Using $timeout beacuse angular has not updated the selected-label value on the labels-modal-component.
            $timeout(function() {
                $scope.$broadcast('editLabel');
                $('#new-label-modal').remodal(modalOptions).open();
            }, 0);

            ev.stopPropagation();
        };

        vm.signOut = () => {
            AuthenticationService.Logout()
                .then(function() {
                    $location.path('/login');
                })
                .catch(function(err) {
                    vm.showError('Unable to sign out.');
                    $location.path('/login');
                });
        };

        vm.$onInit = () => {
            vm.getUsername();
            vm.initCustomScrollbars();
            vm.filterUserSnippets();
            vm.filterUserLabels();
        };

    };

    /**
    * Show error toaster.
    *
    * @param {String} message
    */
    HomeController.prototype.showError = function(message) {
        var vm = this;

        vm.$mdToast.show(
            vm.$mdToast.simple()
                .textContent('Error: ' + message)
                .position('bottom right')
                .hideDelay(3000)
        );
    };

    // Initialize the custom scrollbar.
    HomeController.prototype.initCustomScrollbars = function() {
        var $panel = $('.right-panel');

        // initialize perfectScrollbar with no horizontal scroll
        $panel.perfectScrollbar({suppressScrollX: true});

        var updatePerfectScrollbar = function() {
            $panel.perfectScrollbar('update');
        };

        updatePerfectScrollbar();

        $(window).on('resize orientationchange', updatePerfectScrollbar);
    };

    // Get the username of the logged in user.
    HomeController.prototype.getUsername = function() {
        var vm = this,
            userService = vm.UserService;

        userService.GetById()
            .then(function(res) {
                if (res.error) {
                    vm.$location.path('/login');
                    return;
                }

                vm.username = res.username;
            })
            .catch(function(err) {
                vm.showError('Could not fetch username.');
            });
    };
})();
