angular.module('further.Essay', [])
    .controller('EssayCtrl', EssayCtrl);

function EssayCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;

    vm.showNewEssayForm = false;
    vm.essayName = '';
    vm.essayText = '';
    vm.essayErrorMsg = false;

    vm.cancelNewEssay = function(){
        vm.essayName = '';
        vm.essayText = '';
        vm.showNewEssayForm = false;
        vm.essayErrorMsg = false;
    }
    
    vm.addNewEssay = function() {
        if (vm.essayName && vm.essayText) {
            if (fire.addNewEssay(vm.essayName, vm.essayText)){
                vm.cancelNewEssay();
            } else{
                vm.essayErrorMsg = true;
            }
        }
    };

    // fire.getAllWords().then(function(_d) {
    //     vm.wordsList = _d;
    // });
}