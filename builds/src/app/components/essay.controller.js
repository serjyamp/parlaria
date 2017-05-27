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
