
EssayCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
NotesCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
WordsCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
NavbarCtrl.$inject = ["$rootScope", "$state", "AuthFactory", "$location"];
AuthFactory.$inject = ["$firebaseAuth"];
fire.$inject = ["$log", "$firebaseObject", "$firebaseArray", "$rootScope", "AuthFactory"];$.material.init();

angular
    .module('further', [
        'ui.router',
        // 'textAngular',
        'wysiwyg.module',
        'further.Navbar',
        'further.Words',
        'further.Essay',
        'further.Notes',
        'further.fire.service',
        'further.auth.factory'
    ])
    .config(config);

function config($stateProvider, $urlRouterProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/');

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
        .state('essay', {
            url: '/essay',
            templateUrl: 'app/components/essay.html',
            controller: 'EssayCtrl',
            controllerAs: 'vm'
        })
        .state('notes', {
            url: '/notes',
            templateUrl: 'app/components/notes.html',
            controller: 'NotesCtrl',
            controllerAs: 'vm'
        });
}

angular.module('further.Essay', [])
    .controller('EssayCtrl', EssayCtrl);

function EssayCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;

    vm.showNewEssayForm = false;
    vm.essayName = '';
    vm.essayText = '';
    vm.essayErrorMsg = false;
    vm.essayCurrentSavedMsg = false;
    vm.essaysList = [];

    vm.cancelNewEssay = function() {
        vm.essayName = '';
        vm.essayText = '';
        vm.showNewEssayForm = false;
        vm.essayErrorMsg = false;
    }

    vm.addNewEssay = function() {
        var date = new Date();

        var month = date.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        var created = date.getDate() + '.' + month + '.' + date.getFullYear();


        if (vm.essayName && vm.essayText) {
            if (fire.addNewEssay(vm.essayName, vm.essayText, created)) {
                vm.cancelNewEssay();
            } else {
                vm.essayErrorMsg = true;
            }
        }
    };

    vm.saveCurrentEssay = function(essay) {
        var date = new Date();
        var month = date.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        
        if (hours.toString().length == 1){
            hours = '0' + hours;
        }
        if (minutes.toString().length == 1){
            minutes = '0' + minutes;
        }
        if (seconds.toString().length == 1){
            seconds = '0' + seconds;
        }
        var time = hours + ':' + minutes + ':' + seconds;

        var edited = date.getDate() + '.' + month + '.' + date.getFullYear() + ', ' + time;

        var obj = essay;
        obj['edited'] = edited;
        vm.essaysList.$save(obj);
    };

    vm.deleteEssay = function(essay) {
        vm.essaysList.$remove(essay).then(function() {
            if (!vm.essaysList.length) {
                vm.showNewEssayForm = true;
            }
        });
    };

    fire.getAllEssays().then(function(_d) {
        vm.essaysList = _d;

        if (vm.essaysList.length) {
            vm.showNewEssayForm = false;
        } else {
            vm.showNewEssayForm = true;
        }
    });

    vm.numberOfWords = function(string) {
        var tmp = document.createElement("div");
        tmp.innerHTML = string;
        var onlyText = tmp.textContent || tmp.innerText || "";

        if (onlyText.length) {
            return onlyText.split(' ').length;
        }

        return 0;
    }
    vm.numberOfCharacters = function(string) {
        var tmp = document.createElement("div");
        tmp.innerHTML = string;
        var onlyText = tmp.textContent || tmp.innerText || "";

        return onlyText.length;
    }
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

function NavbarCtrl($rootScope, $state, AuthFactory, $location) {
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

    // ESSAY
    var essayRef = ref.child(uid + '/essay');
    var allEssays = $firebaseArray(essayRef);
    vm.addNewEssay = function(essayName, essayText, created) {
        var obj = {
            essayName: essayName,
            essayText: essayText,
            created: created
        };

        return allEssays.$add(obj);
    };
    vm.getAllEssays = function(cb) {
        return allEssays.$loaded(cb);
    };

    // NOTES

}
