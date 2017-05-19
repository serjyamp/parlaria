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
