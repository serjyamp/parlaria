angular.module('further.Exercises', [])
    .controller('ExercisesCtrl', ExercisesCtrl);

function ExercisesCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newex = null;
    vm.exslist = [];
    
    vm.addNewEx = function() {
        if (vm.newex) {
            if (fire.addNewEx(vm.newex)){
                vm.newex = null;
            }
        }
    };

    fire.getAllExercises().then(function(_d) {
        vm.exslist = _d;
    });
}