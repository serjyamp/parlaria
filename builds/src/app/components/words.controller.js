angular.module('further.Words', [])
    .controller('WordsCtrl', WordsCtrl);

function WordsCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newWord = null;
    vm.wordsList = [];
    
    vm.addNewWord = function() {
        if (vm.newWord) {
            if (fire.addNewWord(vm.newWord)){
                vm.newWord = null;
            }
        }
    };

    fire.getAllWords().then(function(_d) {
        vm.wordsList = _d;
    });
}