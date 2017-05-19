
ExercisesCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
TrainingsCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
NavbarCtrl.$inject = ["$rootScope", "$state", "AuthFactory"];
AuthFactory.$inject = ["$firebaseAuth"];
fire.$inject = ["$log", "$firebaseObject", "$firebaseArray", "$rootScope", "AuthFactory"];angular
    .module('further', [
        'ui.router',
        'further.Navbar',
        'further.Trainings',
        'further.Exercises',
        'further.fire.service',
        'further.auth.factory'
    ])
    .config(config);

function config($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/exercises');

    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'app/components/start.html'
        })
        .state('trainings', {
            url: '/trainings',
            templateUrl: 'app/components/trainings.html',
            controller: 'TrainingsCtrl',
            controllerAs: 'vm'
        })
        .state('exercises', {
            url: '/exercises',
            templateUrl: 'app/components/exercises.html',
            controller: 'ExercisesCtrl',
            controllerAs: 'vm'
        });
}
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

    vm.removeExFromProgram = function(day, exercise) {
        fire.removeExFromProgram(day, exercise);
    };

    fire.getAllExercises().then(function(_d) {
        vm.exslist = _d;
    });
}
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

angular.module('further.Navbar', [])
    .controller('NavbarCtrl', NavbarCtrl);

function NavbarCtrl($rootScope, $state, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;

    vm.auth.authVar.$onAuthStateChanged(function(firebaseUser) {
        $rootScope.firebaseUser = firebaseUser;
        if ($rootScope.firebaseUser) {
            $state.go('exercises');
        }
    });

    vm.signOut = function() {
        vm.auth.signOut();
        $state.go('/');
    };
    vm.signIn = function() {
        vm.auth.signIn();
    };

    vm.photoURL = null;
}
angular
    .module("further.auth.factory", ["firebase"])
    .factory("AuthFactory", AuthFactory);

function AuthFactory($firebaseAuth) {
    var auth = $firebaseAuth();

    var service = {
    	authVar: auth,
        signIn: signIn,
        signOut: signOut
    };

    function signIn() {
        return auth.$signInWithPopup('google');
    }

    function signOut() {
        return auth.$signOut();
    }

    return service;
}

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDLAofEFCEF-s0_oyxVePgmRQPq-PSh5nk",
    authDomain: "futher-afd4a.firebaseapp.com",
    databaseURL: "https://futher-afd4a.firebaseio.com",
    storageBucket: "futher-afd4a.appspot.com",
    messagingSenderId: "248990263259"
};
firebase.initializeApp(config);

angular
    .module('further.fire.service', ['firebase'])
    .service('fire', fire);

function fire($log, $firebaseObject, $firebaseArray, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;

    var ref = firebase.database().ref();

    // exercises
    var uid = vm.auth.authVar.$getAuth().uid;
    var exercisesRef = ref.child(uid + '/exercises');
    var allExercises = $firebaseArray(exercisesRef);

    vm.getAllExercises = function(cb) {
        return allExercises.$loaded(cb);
    };
    vm.addNewEx = function(ex) {
        var duplicate = false;
        angular.forEach(allExercises, function(value, key) {
            if (value.$value == ex) {
                duplicate = true;
                return;
            }
        });

        if (!duplicate) {
            return allExercises.$add(ex);
        }

        return false;
    };

    // program
    var programRef = ref.child(uid + '/program');
    var programArr = $firebaseArray(programRef);

    vm.getProgram = function(cb) {
        return programArr.$loaded(cb);
    };

    var pathToProgram = uid + '/program/';
    var daysRef = {
        Monday: $firebaseArray(ref.child(pathToProgram + 'Monday')),
        Tuesday: $firebaseArray(ref.child(pathToProgram + 'Tuesday')),
        Wednesday: $firebaseArray(ref.child(pathToProgram + 'Wednesday')),
        Thursday: $firebaseArray(ref.child(pathToProgram + 'Thursday')),
        Friday: $firebaseArray(ref.child(pathToProgram + 'Friday')),
        Saturday: $firebaseArray(ref.child(pathToProgram + 'Saturday')),
        Sunday: $firebaseArray(ref.child(pathToProgram + 'Sunday'))
    };

    vm.removeExFromProgram = function(day, exercise) {
        var dayArr = daysRef[day];
        var item = dayArr[exercise];
        return dayArr.$remove(item);
    };

    vm.addExToProgram = function(day, name, sets, repeats) {
        var obj = {
            name: name,
            sets: sets,
            repeats: repeats
        };

        var dayArr = daysRef[day];
        return dayArr.$add(obj);
    };
}
