angular.module('further.Trainings', [])
    .controller('TrainingsCtrl', TrainingsCtrl)

function TrainingsCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.exslist = [];
    vm.program = [];

    fire.getProgram().then(function(_d) {
        vm.program = _d;
    });

    fire.getAllExercises().then(function(_d) {
        vm.exslist = _d;
    });

    vm.removeExFromProgram = function(day, exercise) {
        fire.removeExFromProgram(day, exercise);
    };

    vm.newProgramExDay = null;
    vm.newProgramExName = null;
    vm.newProgramExSets = null;
    vm.newProgramExRepeats = null;
    vm.addExToProgram = function() {
        if (vm.newProgramExDay && vm.newProgramExName && vm.newProgramExSets && vm.newProgramExRepeats) {
            fire.addExToProgram(vm.newProgramExDay, vm.newProgramExName, vm.newProgramExSets, vm.newProgramExRepeats);
        }
    };
}
