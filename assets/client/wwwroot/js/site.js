(function() {
    'use strict';

    angular.element(document).ready(function() {
        angular.bootstrap(document, ['app']);
    });

    var app = angular
        .module('app', ['app.home', 'app.login', 'app.register', 'app.services.authentication',
                        'ui.router', 'ngMaterial', 'app.services.interceptor'])
        .config(($stateProvider, $locationProvider, $httpProvider) => {

            $locationProvider.html5Mode(true);

            $stateProvider.state('home', {
                    url: '/',
                    controller: 'HomeController',
                    templateUrl: 'app/home/home.html',
                    controllerAs: 'vm',
                    resolve: {
                        init: function(AuthenticationService, $location) {
                            var user = AuthenticationService.GetCurrentUser();

                            if (user === null || !user.hasOwnProperty('authdata')) {
                                $location.path('/login');
                            }
                        }
                    }
                })

                .state('snippet-details', {
                    url: 'snippet-details/:id',
                    parent: 'home',
                    controller: 'SnippetDetailsController',
                    templateUrl: 'app/snippet-details/snippet-details.html',
                    controllerAs: 'vm'
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

            $httpProvider.interceptors.push('myHttpInterceptor');
        });
})();

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

(function() {
    'use strict';

    angular.module('app.login', ['app.services.authentication'])
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService'];
    function LoginController($location, AuthenticationService) {
        var vm = this;

        vm.loginError = false;

        vm.login = () => {
            vm.dataLoading = true;

            AuthenticationService.Login(vm.username, vm.password, function(response) {
                if (response.success) {
                    AuthenticationService.SetCredentials(vm.username, vm.password);
                    $location.path('/');
                } else {
                    vm.dataLoading = false;
                    vm.loginError = true;
                }
            });
        };

        // reset login status
        vm.$onInit = () => {
            AuthenticationService.ClearCredentials();
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
                .then(function(response) {

                if (response.success) {
                    $location.path('/login');
                } else {
                    vm.dataLoading = false;
                    vm.registerError = true;
                    vm.errorMsg = response.message;
                }
            });
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.snippet-details', ['app.components.edit-snippet', 'app.services.localStorage',
                                           'app.services.snippet', 'app.services.starred'])
           .controller('SnippetDetailsController', SnippetDetailsController);

    SnippetDetailsController.$inject = ['$stateParams', '$location', '$scope', '$filter', '$mdSidenav', '$timeout',
                                        'LocalStorage', 'SnippetService', 'StarredService'];

    function SnippetDetailsController($stateParams, $location, $scope, $filter, $mdSidenav, $timeout, LocalStorage,
                                      SnippetService, StarredService) {
        var vm = this,
            snippets,
            starred;

        vm.editingSnippet = false;

        vm.isEditing = () => {
            vm.editingSnippet = !vm.editingSnippet;
        };

        // get the edited snipet from the local storage and close the editing panel
        vm.onEdit = () => {
            vm.filterSelectedSnippet();

            // update the ace readonly editor
            var snippet = ace.edit('detailed-code');
            snippet.setValue(vm.snippet.code);

            vm.isEditing();
        };

        // close the editing panel
        vm.onCancel = () => {
            vm.isEditing();
        };

        // remove snippet from local storage
        vm.onDelete = () => {
            starred = starred.filter(function(obj) {
                return obj.id !== vm.snippet.id;
            });

            snippets = snippets.filter(function(obj) {
                return obj.id !== vm.snippet.id;
            });

            SnippetService.setSnippets(snippets);
            StarredService.setStarred(starred);

            vm.onClose();
        };

        vm.onClose = () => {
            $scope.$parent.vm.filterUserSnippets();

            $location.path('/');
        };

        vm.starSnippet = (event) => {
            var $icon = $(event.target);

            // add/remove snippet from starred
            if (vm.snippet.isStarred) {
                $icon.removeClass('isStarred');

                starred = starred.filter(function(obj) {
                    return obj.id !== vm.snippet.id;
                });

                vm.snippet.isStarred = false;
            } else {
                $icon.addClass('isStarred');
                starred.push(vm.snippet);
                vm.snippet.isStarred = true;
            }

            // save to local storage
            SnippetService.setSnippets(snippets);
            StarredService.setStarred(starred);
        };

        vm.snippetTweet = () => {
            window.open('https://twitter.com/share?url=' + escape(window.location.href) +
                        '&text=' + vm.snippet.title, '',
                        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
            return false;
        };

        vm.codePrettifier = () => {
            var snippet = ace.edit('detailed-code');
            snippet.setTheme('ace/theme/textmate');
            snippet.setReadOnly(true);
        };

        vm.filterSelectedSnippet = () => {
            SnippetService.getSnippets()
                        .then(function(data) {
                            snippets = data;

                            vm.snippet = $filter('filter')(snippets, {id: parseInt($stateParams.id)})[0];

                            if (vm.snippet.isStarred) {
                                vm.isStarred = true;
                            }
                        });
        };

        vm.$onInit = () => {
            vm.isStarred = false;

            // get the data for the opened snippet
            vm.filterSelectedSnippet();

            $timeout(function() {
                // unhide the sidebar
                $mdSidenav('right').toggle();

                // initialize ace code editor
                vm.codePrettifier();
            }, 10);

            StarredService.getStarred()
                    .then(function(data) {
                        starred = data;
                    });
        };
    }
})();

(function() {
    'use strict';

    angular
        .module('app.services.authentication', ['app.services.user', 'app.data.encoder', 'app.services.localStorage'])
        .service('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$timeout', 'UserService', 'Base64', 'LocalStorage'];

    function AuthenticationService($timeout, UserService, Base64, LocalStorage) {
        var self = this;

        self.Login = (username, password, callback) => {
            /*  uses $timeout to simulate api call */
            $timeout(function() {
                var response;
                UserService.GetByUsername(username)
                    .then(function(user) {
                        if (user !== null && user.password === password) {
                            response = {success: true};
                        } else {
                            response = {success: false, message: 'Username or password is incorrect'};
                        }

                        callback(response);
                    });
            }, 1000);
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

    myHttpInterceptor.$inject = ['$location', '$injector'];
    function myHttpInterceptor($location, $injector) {
        return {
            'request': function(config) {

                //injected manually to get around circular dependency problem.
                var AuthenticationService = $injector.get('AuthenticationService'),
                    currentUser = AuthenticationService.GetCurrentUser();

                if (currentUser) {
                    config.headers['Authorization'] = 'Base ' + currentUser.authdata;
                } else {
                    config.headers['Authorization'] = 'Base';
                }

                return config;
            }
        };
    };
}());

(function() {
    'use strict';

    angular.module('app.services.label', []).service('LabelService', LabelService);

    LabelService.$inject = ['LocalStorage', '$q'];

    function LabelService(LocalStorage, $q) {
        var self = this;

        self.getLabels = () => {
            var deferred = $q.defer(),
                labels = LocalStorage.get('labels');

            deferred.resolve(labels);

            return deferred.promise;
        };

        self.setLabels = (newValue) => {
            LocalStorage.set('labels', newValue);
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

    SnippetService.$inject = ['LocalStorage', '$q'];

    function SnippetService(LocalStorage, $q) {
        var self = this;

        self.getSnippets = () => {
            var deferred = $q.defer(),
                snippets = LocalStorage.get('snippets');

            deferred.resolve(snippets);

            return deferred.promise;
        };

        self.setSnippets = (newValue) => {
            LocalStorage.set('snippets', newValue);
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

    UserService.$inject = ['$timeout', '$filter', '$q'];

    function UserService($timeout, $filter, $q) {
        var self = this;

        self.GetById = (id) => {
            var deferred = $q.defer(),
                filtered = $filter('filter')(self.getUsers(), {id: id}),
                user = filtered.length ? filtered[0] : null;

            deferred.resolve(user);
            return deferred.promise;
        };

        self.GetAll = () => {
            var deferred = $q.defer();
            deferred.resolve(self.getUsers());

            return deferred.promise;
        };

        self.Add = (user) => {
            var deferred = $q.defer();

            // simulate api call with $timeout
            $timeout(function() {
                self.GetByUsername(user.username)
                    .then(function(duplicateUser) {
                        if (duplicateUser !== null) {
                            deferred.resolve({
                                success: false,
                                message: 'Username "' + user.username + '" is already taken'
                            });
                        } else {
                            var users = self.getUsers();

                            // assign id
                            var lastUser = users[users.length - 1] || {id: 0};
                            user.id = lastUser.id + 1;

                            // save to local storage
                            users.push(user);
                            self.setUsers(users);

                            deferred.resolve({success: true});
                        }
                    });
            }, 1000);

            return deferred.promise;
        };

        self.GetByUsername = (username) => {
            var deferred = $q.defer();
            var filtered = $filter('filter')(self.getUsers(), {username: username});
            var user = filtered.length ? filtered[0] : null;

            deferred.resolve(user);
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

        vm.toggle = function(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
            }

            vm.isInitial = false;
        };

        vm.exists = function(item, list) {
            if (vm.isInitial) {
                var isSelected = false;

                $(vm.snippet.labels).each(function(i, label) {
                    if (label.id === item) {
                        isSelected = true;
                    }
                });

                return isSelected;
            }

            return list.indexOf(item) > -1;
        };

        vm.isIndeterminate = function() {
            return (vm.selectedLabels.length !== 0 && vm.selectedLabels.length !== vm.labelIds.length);
        };

        vm.isChecked = function() {
            if (vm.isInitial) {
                return vm.snippet.labels.length === vm.labelIds.length;
            }

            return vm.selectedLabels.length === vm.labelIds.length;
        };

        vm.toggleAll = function() {
            if (vm.selectedLabels.length === vm.labelIds.length) {
                vm.selectedLabels = [];
            } else if (vm.selectedLabels.length === 0 || vm.selectedLabels.length > 0) {
                vm.selectedLabels = vm.labelIds.slice(0);
            }

            vm.isInitial = false;
        };

        vm.changedLanguage = () => {
            var title = vm.data.title,
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

        vm.checkTitle = () => {
            var title = vm.data.title ? vm.data.title : '',
                language = vm.data.language,
                namePart = title.substring(0, title.indexOf('.'));

            if (namePart === '' && title.indexOf('.') !== -1) {
                vm.data.title =  'myfilename.' + language;
            } else if (namePart === '' && !!title) {
                vm.data.title +=  '.' + language;
            }
        };

        vm.codeEditorInit = () => {
            var language = vm.data.language,
                editorMode = 'ace/mode/' + language;

            vm.snippetCode = ace.edit('edit-code-box');
            vm.snippetCode.setTheme('ace/theme/textmate');

            // set the language for the code editor box
            if (language == 'js') {
                editorMode = 'ace/mode/javascript';
            }

            vm.snippetCode.getSession().setMode(editorMode);
        };

        vm.edit = () => {
            var allSnippets;

            SnippetService.getSnippets()
                        .then(function(response) {
                            allSnippets = response;

                            // get the edited data
                            vm.data.code = vm.snippetCode.getValue();
                            vm.data.labels = vm.getLabels();

                            // replace the existing item with the edited one
                            $(allSnippets).each(function(i, item) {
                                if (item.id === vm.data.id) {
                                    allSnippets.splice(i, 1, vm.data);
                                }
                            });

                            SnippetService.setSnippets(allSnippets);

                            vm.onEdit();
                        });
        };

        vm.cancel = () => {
            vm.onCancel();
        };

        vm.$onInit = () => {
            vm.data = angular.copy(vm.snippet);

            // get all labels
            LabelService.getLabels()
                        .then(function(response) {
                            vm.labels = response;

                            $(vm.labels).each(function(i, item) {
                                vm.labelIds.push(item.id);
                            });
                        });

            // get the labels selected for the opened snippet
            $(vm.snippet.labels).each(function(index, item) {
                vm.selectedLabels.push(item.id);
            });

            $timeout(function() {
                vm.codeEditorInit();
            }, 10);
        };
    };

    /*
    * Compare each label to the the selectedLabels array and determine
    * which of the labels are selected
    */
    editSnippetComponentController.prototype.getLabels = function() {
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
}());

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

(function() {
    'use strict';

    angular.module('app.components.snippet', []).component('snippetComponent', {
        templateUrl: 'app/shared/components/snippet/snippet.component.html',
        controller: snippetComponentController,
        controllerAs: 'scc',
        bindings: {
            snippet: '<'
        }
    });

    snippetComponentController.$inject = ['$timeout'];
    function snippetComponentController($timeout) {
        var vm = this;

        $timeout(function() {
            $('.snippet-card').each(function(i, item) {
                var snippet = ace.edit(item);
                snippet.setTheme('ace/theme/textmate');
                snippet.setReadOnly(true);
            });
        }, 10);
    }
})();
