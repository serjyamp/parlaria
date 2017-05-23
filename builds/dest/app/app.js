
NotesCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
WordsCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
NavbarCtrl.$inject = ["$rootScope", "$state", "$mdDialog", "AuthFactory", "$location"];
AuthFactory.$inject = ["$firebaseAuth"];
fire.$inject = ["$log", "$firebaseObject", "$firebaseArray", "$rootScope", "AuthFactory"];angular
    .module('further', [
        'ngMaterial',
        'ui.router',
        'further.Navbar',
        'further.Words',
        'further.Notes',
        'further.fire.service',
        'further.auth.factory'
    ])
    .config(config);

function config($stateProvider, $urlRouterProvider, $locationProvider, $mdIconProvider, $mdThemingProvider) {
    // $locationProvider.html5Mode(true);
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('orange')
        .warnPalette('red')
        .backgroundPalette('grey');
    // .primaryPalette('blue-grey')
    // .accentPalette('blue')

    $urlRouterProvider.otherwise('/words');

    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'app/components/start.html'
        })
        .state('words', {
            url: '/words',
            templateUrl: 'app/components/words.html',
            controller: 'WordsCtrl',
            controllerAs: 'vm'
        })
        .state('notes', {
            url: '/notes',
            templateUrl: 'app/components/notes.html',
            controller: 'NotesCtrl',
            controllerAs: 'vm'
        });
}

angular.module('further.Notes', [])
    .controller('NotesCtrl', NotesCtrl);

function NotesCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newWord = null;
    vm.newWordTranslation = null;
    vm.wordsList = [];
    
    vm.addNewWord = function() {
        if (vm.newWord && vm.newWordTranslation) {
            if (fire.addNewWord(vm.newWord, vm.newWordTranslation)){
                vm.newWord = null;
                vm.newWordTranslation = null;
            }
        }
    };

    fire.getAllWords().then(function(_d) {
        vm.wordsList = _d;
    });
}
angular.module('further.Words', [])
    .controller('WordsCtrl', WordsCtrl);

function WordsCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newWord = null;
    vm.newWordTranslation = null;
    vm.wordsList = [];
    
    vm.addNewWord = function() {
        if (vm.newWord && vm.newWordTranslation) {
            if (fire.addNewWord(vm.newWord, vm.newWordTranslation)){
                vm.newWord = null;
                vm.newWordTranslation = null;
            }
        }
    };

    fire.getAllWords().then(function(_d) {
        vm.wordsList = _d;
    });
}
angular.module('further.Navbar', [])
    .controller('NavbarCtrl', NavbarCtrl);

function NavbarCtrl($rootScope, $state, $mdDialog, AuthFactory, $location) {
    var vm = this;
    vm.auth = AuthFactory;

    vm.getTabName = function(){
        return $location.hash().replace(/(^#\/|\/$)/g, '');
    }

    vm.auth.authVar.$onAuthStateChanged(function(firebaseUser) {
        $rootScope.firebaseUser = firebaseUser;
        if ($rootScope.firebaseUser) {
            $state.go('words');
        }
    });

    vm.signOut = function() {
        vm.auth.signOut();
        $state.go('/');
    };
    vm.signIn = function() {
        vm.auth.signIn();
    };

    vm.photoURL = null;

    // dropdown menu
    var originatorEv;

    this.openMenu = function($mdMenu, ev) {
        originatorEv = ev;
        $mdMenu.open(ev);
    };

    this.notificationsEnabled = true;
    this.toggleNotifications = function() {
        this.notificationsEnabled = !this.notificationsEnabled;
    };

    this.redial = function() {
        $mdDialog.show(
            $mdDialog.alert()
            .targetEvent(originatorEv)
            .clickOutsideToClose(true)
            .parent('body')
            .title('Suddenly, a redial')
            .textContent('You just called a friend; who told you the most amazing story. Have a cookie!')
            .ok('That was easy')
        );

        originatorEv = null;
    };

    this.checkVoicemail = function() {
        // This never happens.
    };
}

angular
    .module("further.auth.factory", ["firebase"])
    .factory("AuthFactory", AuthFactory);

function AuthFactory($firebaseAuth) {
    var auth = $firebaseAuth();

    var service = {
    	authVar: auth,
        signIn: signIn,
        signOut: signOut
    };

    function signIn() {
        return auth.$signInWithPopup('google');
    }

    function signOut() {
        return auth.$signOut();
    }

    return service;
}

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCEzgvtuQYnoz3JbmlIkJoSRPiDuXJrTwQ",
    authDomain: "parlaria-9a874.firebaseapp.com",
    databaseURL: "https://parlaria-9a874.firebaseio.com",
    projectId: "parlaria-9a874",
    storageBucket: "parlaria-9a874.appspot.com",
    messagingSenderId: "630755092176"
};
firebase.initializeApp(config);

angular
    .module('further.fire.service', ['firebase'])
    .service('fire', fire);

function fire($log, $firebaseObject, $firebaseArray, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;

    var ref = firebase.database().ref();
    var uid = vm.auth.authVar.$getAuth().uid;

    // WORDS
    var wordsRef = ref.child(uid + '/words');
    var allWords = $firebaseArray(wordsRef);

    vm.getAllWords = function(cb) {
        return allWords.$loaded(cb);
    };
    vm.addNewWord = function(word, translation) {
        var duplicate = false;
        angular.forEach(allWords, function(value, key) {
            if (value.word == word) {
                duplicate = true;
                return;
            }
        });

        if (!duplicate) {
            var obj = {
                word: word,
                translation: translation
            };

            return allWords.$add(obj);
        }

        return false;
    };

    // NOTES
    
}
