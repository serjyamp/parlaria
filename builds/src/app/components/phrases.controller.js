angular.module('further.Phrases', [])
    .controller('PhrasesCtrl', PhrasesCtrl);

function PhrasesCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newPhrase = '';
    vm.newPhraseDescription = '';
    vm.phrasesList = [];
    
    vm.addNewPhrase = function() {
        if (vm.newPhrase) {
            var date = new Date();
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            var created = date.getDate() + '.' + month + '.' + date.getFullYear();

            if (fire.addNewPhrase(vm.newPhrase, vm.newPhraseDescription, created)){
                vm.newPhrase = '';
                vm.newPhraseDescription = '';
            }
        } else{
            vm.phraseNotSavedErrorMsg = false;
            vm.phraseEmptyErrorMsg = true;
        }
    };

    vm.saveCurrentPhrase = function(phrase) {
        if (phrase.phrase) {
            vm.phrasesList.$save(phrase);
        }
    };

    fire.getAllPhrases().then(function(_d) {
        vm.phrasesList = _d;
    });
}