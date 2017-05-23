angular
    .module('further', [
        'ngMaterial',
        'ui.router',
        'further.Navbar',
        'further.Words',
        'further.Notes',
        'further.fire.service',
        'further.auth.factory'
    ])
    .config(config);

function config($stateProvider, $urlRouterProvider, $locationProvider, $mdIconProvider, $mdThemingProvider) {
    // $locationProvider.html5Mode(true);
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('orange')
        .warnPalette('red')
        .backgroundPalette('grey');
    // .primaryPalette('blue-grey')
    // .accentPalette('blue')

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
