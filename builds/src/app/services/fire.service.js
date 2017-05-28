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
    vm.addNewWord = function(word, translation, created) {
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
                translation: translation,
                created: created
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

    // PHRASES
    var phrasesRef = ref.child(uid + '/phrases');
    var allPhrases = $firebaseArray(phrasesRef);
    vm.addNewPhrase = function(phrase, description, created) {
        var obj = {
            phrase: phrase,
            description: description,
            created: created
        };

        return allPhrases.$add(obj);
    };
    vm.getAllPhrases = function(cb) {
        return allPhrases.$loaded(cb);
    };
}
