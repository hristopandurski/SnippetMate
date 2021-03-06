(function() {
    'use strict';

    angular.element(document).ready(function() {
        angular.bootstrap(document, ['app']);
    });

    var app = angular
        .module('app', ['app.home', 'app.login', 'app.register', 'app.services.authentication',
                        'app.utils.isAuthenticated', 'ui.router', 'ngMaterial', 'app.services.interceptor'])
        .config(($stateProvider, $locationProvider, $httpProvider) => {

            $locationProvider.html5Mode(true);

            $stateProvider.state('home', {
                    url: '/',
                    controller: 'HomeController',
                    templateUrl: 'app/home/home.html',
                    controllerAs: 'vm',
                    resolve: {
                        init: function(IsAuthenticated) {
                            IsAuthenticated.isLogged();
                        }
                    }
                })

                .state('snippet-details', {
                    url: 'snippet-details/:id',
                    parent: 'home',
                    controller: 'SnippetDetailsController',
                    templateUrl: 'app/snippet-details/snippet-details.html',
                    controllerAs: 'vm',
                    resolve: {
                        init: function(IsAuthenticated) {
                            IsAuthenticated.isLogged();
                        }
                    }
                })

                .state('login', {
                    url: '/login',
                    controller: 'LoginController',
                    templateUrl: 'app/login/login.html',
                    controllerAs: 'vm'
                })

                .state('register', {
                    url: '/register',
                    controller: 'RegisterController',
                    templateUrl: 'app/register/register.html',
                    controllerAs: 'vm'
                });

            //$httpProvider.interceptors.push('myHttpInterceptor');
        });
})();

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
                selectedItem = $tab.attr('data-id'),
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
                                $(item.labels).each(function(z, obj) {
                                    if (obj === selectedItem) {
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

(function() {
    'use strict';

    angular.module('app.login', ['app.services.authentication'])
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService'];
    function LoginController($location, AuthenticationService) {
        var vm = this;

        vm.loginError = false;

        vm.login = () => {
            var user = {
                username: vm.username,
                password: vm.password
            };

            vm.dataLoading = true;

            AuthenticationService.Login(user)
                .then(function(res) {
                    if (res.error) {
                        vm.loginError = true;
                        return;
                    }

                    $location.path('/');
                })
                .catch(function(err) {
                    vm.loginError = true;
                })
                .finally(function() {
                    vm.dataLoading = false;
                });
        };
    }
})();

(function() {
    'use strict';

    angular.module('app.register', ['app.services.user'])
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$location', 'UserService'];
    function RegisterController($location, UserService) {
        var vm = this,
            user = {};

        vm.register = register;
        vm.registerError = false;

        function register() {
            vm.dataLoading = true;
            user = {
                'username': vm.username,
                'password': vm.password
            };

            UserService.Add(user)
                .then(function(res) {
                    $location.path('/login');
                })
                .catch(function(res) {
                    vm.registerError = true;
                    vm.errorMsg = 'Username "' + user.username + '" is already taken';
                })
                .finally(function() {
                    vm.dataLoading = false;
                });
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.snippet-details', ['app.components.edit-snippet', 'app.services.localStorage',
                                           'app.services.snippet', 'app.services.starred', 'ngMaterial'])
           .controller('SnippetDetailsController', SnippetDetailsController);

    SnippetDetailsController.$inject = ['$stateParams', '$location', '$scope', '$filter', '$mdSidenav', '$timeout',
                                        '$mdToast', 'LocalStorage', 'SnippetService', 'StarredService'];

    function SnippetDetailsController($stateParams, $location, $scope, $filter, $mdSidenav, $timeout, $mdToast,
                                      LocalStorage, SnippetService, StarredService) {
        var vm = this;

        // Dependencies
        vm.$stateParams = $stateParams;
        vm.$filter = $filter;
        vm.SnippetService = SnippetService;
        vm.$mdToast = $mdToast;

        // Variables
        vm.editingSnippet = false;

        vm.isEditing = () => {
            vm.editingSnippet = !vm.editingSnippet;
        };

        // Get the edited snipet from the local storage and close the editing panel.
        vm.onEdit = () => {
            vm.filterSelectedSnippet();

            vm.isEditing();
        };

        // Close the editing panel.
        vm.onCancel = () => {
            vm.isEditing();
        };

        // Delete the snippet.
        vm.onDelete = () => {
            let data = {
                id: vm.snippet.id
            };

            SnippetService.delete(data)
                .then(function() {
                    console.log('Snippet is deleted successfully!');
                })
                .catch(function() {
                    // TODO: show error
                    console.log(err);
                })
                .finally(function() {
                    vm.onClose();
                });
        };

        vm.onClose = () => {
            $scope.$parent.vm.filterUserSnippets();

            $location.path('/');
        };

        // Update the starred condition of the snippet.
        vm.starSnippet = (event) => {
            let $icon = $(event.target),
                data = {
                    id: vm.snippet.id,
                    isStarred: vm.snippet.isStarred
                };

            if (vm.snippet.isStarred) {
                $icon.removeClass('isStarred');

                vm.snippet.isStarred = false;
            } else {
                $icon.addClass('isStarred');

                vm.snippet.isStarred = true;
            }

            SnippetService.star(vm.snippet)
                .then(function(res) {
                    vm.showToast(res.notice, 'success');
                })
                .catch(function(err) {
                    vm.showToast(err, 'error');
                });
        };

        // Opens up the tweet window so the user can share the tweet.
        vm.snippetTweet = () => {
            window.open('https://twitter.com/share?url=' + escape(window.location.href) +
                        '&text=' + vm.snippet.title, '',
                        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
            return false;
        };

        vm.codePrettifier = () => {
            var editor = ace.edit('detailed-code');

            editor.setTheme('ace/theme/textmate');
            editor.setValue(vm.snippet.code, -1);
            editor.$blockScrolling = Infinity;
            editor.setReadOnly(true);
        };

        vm.$onInit = () => {
            vm.isStarred = false;

            vm.filterSelectedSnippet();

            $timeout(function() {
                // unhide the sidebar
                $mdSidenav('right').toggle();
            }, 0);
        };
    }

    /**
    * Show error toaster.
    *
    * @param {String} message
    */
    SnippetDetailsController.prototype.showToast = function(message, toastClass) {
        var vm = this,
            prefix = toastClass === 'error' ? 'Error: ' : 'Success: ';

        vm.$mdToast.show(
            vm.$mdToast.simple()
                .textContent(prefix + message)
                .position('bottom right')
                .toastClass(toastClass)
                .hideDelay(3000)
        );
    };

    // Get the data related to the opened snippet.
    SnippetDetailsController.prototype.filterSelectedSnippet = function() {
        let vm = this,
            editor,
            snippet = {
                id: parseInt(vm.$stateParams.id)
            };

        vm.SnippetService.getOne(snippet)
            .then(function(res) {
                vm.snippet = res;

                if (vm.snippet.isStarred) {
                    vm.isStarred = true;
                }

                // update the ace readonly editor if the snippet has been edited
                vm.codePrettifier();
            })
            .catch(function(err) {
                console.log('Error in fetching the opened snippet.');
            });
    };
})();

(function() {
    'use strict';

    angular.module('app.directives.editor-value', []).directive('editorValue', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var snippet = ace.edit(element[0]);

                snippet.setTheme('ace/theme/textmate');
                snippet.setReadOnly(true);
                snippet.setValue(attrs.editorValue, -1);
                editor.$blockScrolling = Infinity;
            }
        };
    });
})();

(function() {
    'use strict';

    angular.module('app.components.snippet').filter('dateRange', function() {
        return function(date) {
            var fromDate = new Date(Date.parse(date)),
                toDate = new Date(),
                dayDifference = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)),
                hrsDifference = Math.floor((toDate - fromDate) / (1000 * 60 * 60)),
                minDifference = Math.floor((toDate - fromDate) / (1000 * 60)),
                diff = 0;

            // calculate whats the difference between the snippet's creation and now
            if (dayDifference <= 0) {
                if (hrsDifference <= 0) {
                    if (minDifference <= 0) {
                        diff = ' just now';
                    } else {
                        if (minDifference === 1) {
                            diff = minDifference + ' minute ago';
                        } else {
                            diff = minDifference + ' minutes ago';
                        }
                    }
                } else {
                    if (hrsDifference === 1) {
                        diff = hrsDifference + ' hour ago';
                    } else {
                        diff = hrsDifference + ' hours ago';
                    }
                }
            } else {
                if (dayDifference === 1) {
                    diff = dayDifference + ' day ago';
                } else {
                    diff = dayDifference + ' days ago';
                }
            }

            return diff;
        };
    });
}());

(function() {
    'use strict';

    angular
        .module('app.services.authentication', ['app.services.user', 'app.data.encoder', 'app.services.localStorage'])
        .service('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$timeout', '$http', '$q', 'UserService', 'Base64', 'LocalStorage'];

    function AuthenticationService($timeout, $http, $q, UserService, Base64, LocalStorage) {
        var self = this;

        self.Login = (user) => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/login',
                params: user
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.Logout = () => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/logout'
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.SetCredentials = (username, password) => {
            var authdata = Base64.encode(username + ':' + password),
                user = {
                    username: username,
                    authdata: authdata
                };

            LocalStorage.set('currentUser', user);
        };

        self.ClearCredentials = () => {
            LocalStorage.set('currentUser', null);
        };

        self.GetCurrentUser = () => {
            if (!localStorage.currentUser) {
                localStorage.currentUser = JSON.stringify({});
            }

            return JSON.parse(localStorage.currentUser);
        };
    }
})();

(function() {
    'use strict';

    angular.module('app.data.encoder', []).service('Base64', Base64);;

    // Base64 encoding service used by AuthenticationService
    function Base64() {
        var self = this;

        self.keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        self.encode = function(input) {
            var output = '';
            var chr1, chr2, chr3 = '';
            var enc1, enc2, enc3, enc4 = '';
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    self.keyStr.charAt(enc1) +
                    self.keyStr.charAt(enc2) +
                    self.keyStr.charAt(enc3) +
                    self.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';
            } while (i < input.length);

            return output;
        };

        self.decode = function(input) {
            var output = '';
            var chr1, chr2, chr3 = '';
            var enc1, enc2, enc3, enc4 = '';
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert('There were invalid base64 characters in the input text.\n' +
                    'Valid base64 characters are A-Z, a-z, 0-9, \'+\', \'/\',and \'=\'\n' +
                    'Expect errors in decoding.');
            }

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

            do {
                enc1 = self.keyStr.indexOf(input.charAt(i++));
                enc2 = self.keyStr.indexOf(input.charAt(i++));
                enc3 = self.keyStr.indexOf(input.charAt(i++));
                enc4 = self.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }

                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';

            } while (i < input.length);

            return output;
        };
    };
}());

(function() {
    'use strict';

    angular
        .module('app.services.interceptor', [])
        .factory('myHttpInterceptor', myHttpInterceptor);

    myHttpInterceptor.$inject = ['$q', '$location', '$injector'];
    function myHttpInterceptor($q, $location, $injector) {
        var interceptor = {};

        var _request = function(config) {
            //success logic here
            return config;
        };

        var _responseError = function(rejection) {
            //error here. for example server respond with 401
            $location.path('/login');

            return $q.reject(rejection);
        };

        interceptor.request = _request;
        interceptor.responseError = _responseError;

        return interceptor;
    };
}());

(function() {
    'use strict';

    angular.module('app.services.label', []).service('LabelService', LabelService);

    LabelService.$inject = ['$q', '$http'];

    function LabelService($q, $http) {
        var self = this;

        self.getLabels = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/labels/get'
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.getOne = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/labels/getOne',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.setLabels = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/labels/create',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.edit = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'PUT',
                url: '/labels/edit',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };
    };
}());

(function() {
    'use strict';

    angular
        .module('app.services.languages', [])
        .service('LanguageService', LanguageService);

    LanguageService.$inject = ['$http'];

    function LanguageService($http) {
        this.get = () => {
            return $http.get('app/shared/data/languages.json').then((response) => {
                return response.data;
            });
        };
    }
})();

(function() {
    'use strict';

    angular.module('app.services.localStorage', [])
        .factory('LocalStorage', LocalStorage);

    /* @ngInject */
    function LocalStorage() {
        var service = {
            set: set,
            get: get
        };

        return service;

        function set(key,val) {
            localStorage[key] = JSON.stringify(val);
        }

        function get(key) {
            if (!localStorage[key]) {
                localStorage[key] = JSON.stringify([]);
            }

            return JSON.parse(localStorage[key]);
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.services.snippet', []).service('SnippetService', SnippetService);

    SnippetService.$inject = ['$q', '$http'];

    function SnippetService($q, $http) {
        var self = this;

        self.getSnippets = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/snippets/get'
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.getOne = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/snippets/getOne',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.setSnippets = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/snippets/create',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.star = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'PUT',
                url: '/snippets/star',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.edit = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'PUT',
                url: '/snippets/edit',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.delete = (data) => {
            var deferred = $q.defer();

            $http({
                method: 'DELETE',
                url: '/snippets/delete',
                params: data
            })
            .then(function(res) {
                return deferred.resolve(res.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };
    };
}());

(function() {
    'use strict';

    angular.module('app.services.starred', []).service('StarredService', StarredService);

    StarredService.$inject = ['LocalStorage', '$q'];

    function StarredService(LocalStorage, $q) {
        var self = this;

        self.getStarred = () => {
            var deferred = $q.defer(),
                starred = LocalStorage.get('starred');

            deferred.resolve(starred);

            return deferred.promise;
        };

        self.setStarred = (data) => {
            LocalStorage.set('starred', data);
        };
    };
}());

(function() {
    angular.module('app.services.user', []).service('UserService', UserService);

    UserService.$inject = ['$timeout', '$filter', '$q', '$http'];

    function UserService($timeout, $filter, $q, $http) {
        var self = this;

        self.GetById = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/showById'
            })
            .then(function(user) {
                return deferred.resolve(user.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.isAuthenticated = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/isAuthenticated'
            })
            .then(function(user) {
                return deferred.resolve(user.data);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.GetByUsername = (user) => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/show',
                params: user
            })
            .then(function(user) {
                return deferred.resolve(user);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.GetAll = () => {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: '/users/showAll'
            })
            .then(function(users) {
                return deferred.resolve(users);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };

        self.Add = (user) => {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: '/users/create',
                params: user
            })
            .then(function(res) {
                return deferred.resolve(res);
            })
            .catch(function(err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        };
    }

    UserService.prototype.getUsers = function() {
        if (!localStorage.users) {
            localStorage.users = JSON.stringify([]);
        }

        return JSON.parse(localStorage.users);
    };

    UserService.prototype.setUsers = function(users) {
        localStorage.users = JSON.stringify(users);
    };
})();

(function() {
    'use strict';

    angular.module('app.utils.isAuthenticated', ['app.services.user']).service('IsAuthenticated', IsAuthenticated);

    IsAuthenticated.$inject = ['UserService', '$location'];

    function IsAuthenticated(UserService, $location) {
        this.isLogged = () => {

            UserService.isAuthenticated()
                .then(function(res) {
                    if (res.error) {
                        return $location.path('/login');
                    }
                })
                .catch(function(err) {
                    return $location.path('/login');
                });
        };
    };
}());

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
            labelsArray = [],
            result = [],
            isSelected;

        if (!vm.labels.length || !vm.selectedLabels.length) {
            return [];
        }

        labelsArray = vm.labels.filter(function(obj) {

            $(vm.selectedLabels).each(function(i, id) {
                if (obj.id === id) {
                    result.push(id);
                }
            });
        });

        return result;
    };
})();

(function() {
    'use strict';

    angular.module('app.components.snippet', ['app.directives.editor-value']).component('snippetComponent', {
        templateUrl: 'app/shared/components/snippet/snippet.component.html',
        controller: snippetComponentController,
        controllerAs: 'scc',
        bindings: {
            snippet: '<'
        }
    });

    snippetComponentController.$inject = ['$timeout', 'LabelService'];

    function snippetComponentController($timeout, LabelService) {
        let vm = this;

        vm.labels = [];

        $timeout(function() {
            $(vm.snippet.labels).each(function(i, id) {
                let labelContainer = {
                    id: id
                };

                LabelService.getOne(labelContainer)
                    .then(function(res) {
                        vm.labels.push(res);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            });
        }, 0);
    }
})();
