$.material.init();

angular
    .module('further', [
        'ui.router',
        'further.Navbar',
        'further.Words',
        'further.Notes',
        'further.fire.service',
        'further.auth.factory'
    ])
    .config(config);

function config($stateProvider, $urlRouterProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/words');

    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'app/components/start.html'
        })
        .state('words', {
            url: '/words',
            templateUrl: 'app/components/words.html',
            controller: 'WordsCtrl',
            controllerAs: 'vm'
        })
        .state('notes', {
            url: '/notes',
            templateUrl: 'app/components/notes.html',
            controller: 'NotesCtrl',
            controllerAs: 'vm'
        });
}
