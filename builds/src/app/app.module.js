$.material.init();

angular
    .module('further', [
        'ui.router',
        'wysiwyg.module',
        'chart.js',
        'further.Navbar',
        'further.Words',
        'further.Essay',
        'further.Phrases',
        'further.Statistics',
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
        })
        .state('statistics', {
            url: '/statistics',
            templateUrl: 'app/components/statistics.html',
            controller: 'StatisticsCtrl',
            controllerAs: 'vm'
        });
}
