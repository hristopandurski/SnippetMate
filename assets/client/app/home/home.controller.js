(function() {
    'use strict';

    angular.module('app.home', ['app.components.snippet', 'app.components.labels', 'app.components.new-snippet',
                                'app.services.authentication', 'app.snippet-details', 'app.services.snippet',
                                'app.services.label', 'app.services.user', 'app.services.starred', 'ngMaterial'])
            .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', '$location', '$filter', '$mdSidenav', 'AuthenticationService', 'UserService',
                            'SnippetService', 'LabelService', 'StarredService'];

    function HomeController($scope, $location, $filter, $mdSidenav, AuthenticationService, UserService, SnippetService,
                            LabelService, StarredService) {
        var vm = this,
            modalOptions = {
                'hashTracking': false,
                'closeOnOutsideClick': false,
                'closeOnEscape': false
            };

        vm.snippets = [];

        vm.labels = [];

        vm.AuthenticationService = AuthenticationService;

        vm.UserService = UserService;

        vm.filterUserSnippets = () => {

            SnippetService.getSnippets()
                .then(function(snippets) {
                    vm.snippets = snippets;
                })
                .catch(function(err) {
                    //TODO: handle errors and show popup message
                    vm.snippets = [];
                    console.log(err);
                });
        };

        vm.filterUserLabels = () => {
            LabelService.getLabels()
                .then(function(labels) {
                    vm.labels = labels;
                })
                .catch(function(err) {
                    //TODO: handle errors and show popup message

                    vm.labels = [];
                    console.log(err);
                });
        };

        vm.selectFilter = (event) => {
            var $tab = $(event.delegateTarget),
                value = $tab.text().trim(),
                user = AuthenticationService.GetCurrentUser(),
                authdata = user.authdata,
                result = [];

            if ($tab.hasClass('filter-selected')) {
                return;
            }

            SnippetService.getSnippets()
                        .then(function(data) {
                            // refill the already fitlered snippets
                            vm.snippets = $filter('filter')(data, {authdata: authdata});

                            switch (value) {
                                case 'My Snippets':

                                    vm.filterUserSnippets();
                                    break;
                                case 'Starred':

                                    StarredService.getStarred()
                                                .then(function(data) {
                                                    vm.snippets = $filter('filter')(data, {authdata: authdata});
                                                });

                                    break;
                                default:
                                    $(vm.snippets).each(function(i, item) {
                                        $(item.labels).each(function(index, label) {
                                            if (label.title === value) {
                                                result.push(item);
                                            }
                                        });
                                    });

                                    vm.snippets = result;
                            }
                        });

            $tab.siblings().removeClass('filter-selected');
            $tab.addClass('filter-selected');
        };

        vm.openSnippetModal = () => {
            $scope.$broadcast('clearSnippetModal');
            $('#new-snippet-modal').remodal(modalOptions).open();
        };

        vm.openLabelsModal = () => {
            $scope.$broadcast('clearLabelsModal');
            $('#new-label-modal').remodal(modalOptions).open();
        };

        vm.signOut = () => {
            AuthenticationService.Logout()
                .then(function() {
                    $location.path('/login');
                })
                .catch(function(err) {
                    console.log(err.status + ' ' + err.statusText);
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

    HomeController.prototype.getUsername = function() {
        var userService = this.UserService;

        userService.GetById()
        .then(function(user) {
            if (user.error) {
                //TODO: show popup
                console.log(user.errorMessage);
                return;
            }

            this.username = user.data.username || '';
            return;
        })
        .catch(function(err) {
            this.username = '';
            console.log(err);
            return;
        });
    };
})();
