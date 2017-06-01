(function() {
    'use strict';

    angular.module('app.home', ['app.components.snippet', 'app.components.labels', 'app.components.new-snippet',
                                'app.services.authentication', 'app.snippet-details', 'app.services.snippet',
                                'app.services.label', 'app.services.starred', 'ngMaterial'])
            .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', '$location', '$filter', '$mdSidenav', 'AuthenticationService', 'SnippetService',
                             'LabelService', 'StarredService'];

    function HomeController($scope, $location, $filter, $mdSidenav, AuthenticationService, SnippetService,
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

        vm.filterUserSnippets = () => {
            var user = AuthenticationService.GetCurrentUser(),
                authdata = user.authdata;

            // filter all the snippets that are not created by the logged in user
            SnippetService.getSnippets()
                        .then(function(data) {
                            vm.snippets = $filter('filter')(data, {authdata: authdata});
                        });
        };

        vm.filterUserLabels = () => {
            var user = AuthenticationService.GetCurrentUser(),
                authdata = user.authdata,
                labels = LabelService.getLabels();

            // filter all the labels that are not created by the logged in user
            LabelService.getLabels()
                        .then(function(data) {
                            vm.labels = $filter('filter')(data, {authdata: authdata});
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
            $location.path('/login');
        };

        vm.$onInit = () => {
            vm.initCustomScrollbars();
            vm.filterUserSnippets();
            vm.filterUserLabels();
            vm.getUsername();
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
        var authService = this.AuthenticationService,
            user = authService.GetCurrentUser();

        this.username = user.username;
    };
})();
