angular
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