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
            var date = new Date();
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            var created = date.getDate() + '.' + month + '.' + date.getFullYear();

            if (fire.addNewWord(vm.newWord, vm.newWordTranslation, created)) {
                vm.newWord = null;
                vm.newWordTranslation = null;
            }
        }
    };

    fire.getAllWords().then(function(_d) {
        vm.wordsList = _d;
    });
}
