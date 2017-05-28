angular.module('further.Essay', [])
    .controller('EssayCtrl', EssayCtrl);

function EssayCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;

    vm.showNewEssayForm = false;
    vm.essayName = '';
    vm.essayText = '';
    vm.essayNotSavedErrorMsg = false;
    vm.essayEmptyErrorMsg = false;
    vm.essayCurrentNotSavedErrorMsg = false;
    vm.essayCurrentEmptyErrorMsg = false;
    vm.essaysList = [];

    vm.cancelNewEssay = function() {
        vm.essayName = '';
        vm.essayText = '';
        vm.showNewEssayForm = false;
        vm.essayNotSavedErrorMsg = false;
        vm.essayEmptyErrorMsg = false;
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
                vm.essayNotSavedErrorMsg = true;
                vm.essayEmptyErrorMsg = false;
            }
        } else {
            vm.essayNotSavedErrorMsg = false;
            vm.essayEmptyErrorMsg = true;
        }
    };

    vm.saveCurrentEssay = function(essay) {
        if (essay.essayName && essay.essayText) {
            vm.essaysList.$save(essay).then({}, function(){
                vm.essayCurrentNotSavedErrorMsg = true;
                vm.essayCurrentEmptyErrorMsg = false;
            });
        } else{
            vm.essayCurrentNotSavedErrorMsg = false;
            vm.essayCurrentEmptyErrorMsg = true;
        }
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
