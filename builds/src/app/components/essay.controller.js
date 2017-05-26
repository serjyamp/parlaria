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
    
    vm.saveCurrentEssay = function(essay) {
        vm.essaysList.$save(essay).then(function(){
            vm.essayCurrentSavedMsg = true;
            vm.essayCurrentNotSavedMsg = false;
        }, function(){
            vm.essayCurrentSavedMsg = false;
            vm.essayCurrentNotSavedMsg = true;
        });
    };
    
    vm.deleteEssay = function(essay) {
        vm.essaysList.$remove(essay).then(function(){
            console.log(vm.essaysList.length)
            if (!vm.essaysList.length){
                vm.showNewEssayForm = true;
            }
        });
    };

    fire.getAllEssays().then(function(_d) {
        vm.essaysList = _d;

        if (vm.essaysList.length){
            vm.showNewEssayForm = false;
        } else{
            vm.showNewEssayForm = true;
        }
    });

    
}