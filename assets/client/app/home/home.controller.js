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

        /**
        * Show the snippets created by the logged in user.
        */
        vm.filterUserSnippets = () => {

            SnippetService.getSnippets()
                .then(function(snippets) {

                    // TODO: remove this from here
                    $(snippets).each(function(i, obj) {
                        $(obj.labels).each(function(z, label) {
                            snippets[i].labels[z] = JSON.parse(label);
                        });
                    });

                    vm.snippets = snippets;
                })
                .catch(function(err) {
                    //TODO: handle errors and show popup message
                    vm.snippets = [];
                    console.log(err);
                });
        };

        /**
        * Show the labels created by the logged in user.
        */
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

        /**
        * Filter out all of the snippets depending on the selected filter.
        */
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

                            // filter depending on the selected label
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

    /**
     * Initialize the custom scrollbar.
     *
     */
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

    /**
     * Get the username of the logged in user.
     *
     */
    HomeController.prototype.getUsername = function() {
        var self = this,
            userService = self.UserService;

        userService.GetById()
        .then(function(user) {
            if (user.error) {
                //TODO: show popup
                console.log(user.errorMessage);
                return;
            }

            self.username = user.username;
            return;
        })
        .catch(function(err) {
            self.username = '';
            console.log(err);
            return;
        });
    };
})();
