$.material.init();

angular
    .module('further', [
        'ui.router',
        // 'textAngular',
        'wysiwyg.module',
        'further.Navbar',
        'further.Words',
        'further.Essay',
        'further.Phrases',
        'further.fire.service',
        'further.auth.factory'
    ])
    .config(config);

function config($stateProvider, $urlRouterProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/');

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
        .state('essay', {
            url: '/essay',
            templateUrl: 'app/components/essay.html',
            controller: 'EssayCtrl',
            controllerAs: 'vm'
        })
        .state('phrases', {
            url: '/phrases',
            templateUrl: 'app/components/phrases.html',
            controller: 'PhrasesCtrl',
            controllerAs: 'vm'
        });
}
