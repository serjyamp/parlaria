
NavbarCtrl.$inject = ["$rootScope", "$state", "AuthFactory", "$location", "$window"];
AuthFactory.$inject = ["$firebaseAuth"];
fire.$inject = ["$log", "$firebaseObject", "$firebaseArray", "$rootScope", "AuthFactory"];
EssayCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
PhrasesCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];
StatisticsCtrl.$inject = ["fire", "$rootScope", "AuthFactory", "$scope"];
WordsCtrl.$inject = ["fire", "$rootScope", "AuthFactory"];$.material.init();

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
        .state('essays', {
            url: '/essays',
            templateUrl: 'app/components/essays.html',
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

angular.module('further.Navbar', [])
    .controller('NavbarCtrl', NavbarCtrl);

function NavbarCtrl($rootScope, $state, AuthFactory, $location, $window) {
    var vm = this;
    vm.auth = AuthFactory;

    vm.getTabName = function(){
        return $location.hash().replace(/(^#\/|\/$)/g, '');
    }

    vm.auth.authVar.$onAuthStateChanged(function(firebaseUser) {
        $rootScope.firebaseUser = firebaseUser;
        if ($rootScope.firebaseUser) {
            $state.go('words');
        }
    });

    vm.signOut = function() {
        vm.auth.signOut();
        $state.go('/');
        $window.location.reload();
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
    apiKey: "AIzaSyCEzgvtuQYnoz3JbmlIkJoSRPiDuXJrTwQ",
    authDomain: "parlaria-9a874.firebaseapp.com",
    databaseURL: "https://parlaria-9a874.firebaseio.com",
    projectId: "parlaria-9a874",
    storageBucket: "parlaria-9a874.appspot.com",
    messagingSenderId: "630755092176"
};
firebase.initializeApp(config);

angular
    .module('further.fire.service', ['firebase'])
    .service('fire', fire);

function fire($log, $firebaseObject, $firebaseArray, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;

    var ref = firebase.database().ref();
    var uid = vm.auth.authVar.$getAuth().uid;

    // USERS
    var allUsers = $firebaseArray(ref);
    vm.getAllUsers = function(cb){
        return allUsers.$loaded(cb);
    }
    
    // WORDS
    var wordsRef = ref.child(uid + '/words');
    var allWords = $firebaseArray(wordsRef);

    vm.getAllWords = function(cb) {
        return allWords.$loaded(cb);
    };
    vm.addNewWord = function(word, translation, created) {
        var duplicate = false;
        angular.forEach(allWords, function(value, key) {
            if (value.word == word) {
                duplicate = true;
                return;
            }
        });

        if (!duplicate) {
            var obj = {
                word: word,
                translation: translation,
                created: created
            };

            return allWords.$add(obj);
        }

        return false;
    };

    // ESSAY
    var essayRef = ref.child(uid + '/essay');
    var allEssays = $firebaseArray(essayRef);
    vm.addNewEssay = function(essayName, essayText, created) {
        var obj = {
            essayName: essayName,
            essayText: essayText,
            created: created
        };

        return allEssays.$add(obj);
    };
    vm.getAllEssays = function(cb) {
        return allEssays.$loaded(cb);
    };

    // PHRASES
    var phrasesRef = ref.child(uid + '/phrases');
    var allPhrases = $firebaseArray(phrasesRef);
    vm.addNewPhrase = function(phrase, description, created) {
        var obj = {
            phrase: phrase,
            description: description,
            created: created
        };

        return allPhrases.$add(obj);
    };
    vm.getAllPhrases = function(cb) {
        return allPhrases.$loaded(cb);
    };
}

angular.module('further.Essay', [])
    .controller('EssayCtrl', EssayCtrl);

function EssayCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;

    vm.showNewEssayForm = false;
    vm.essayName = '';
    vm.essayText = '';
    vm.essayNotSavedErrorMsg = false;
    vm.essayEmptyErrorMsg = false;
    vm.essayCurrentNotSavedErrorMsg = false;
    vm.essayCurrentEmptyErrorMsg = false;
    vm.essaysList = [];

    vm.cancelNewEssay = function() {
        vm.essayName = '';
        vm.essayText = '';
        vm.showNewEssayForm = false;
        vm.essayNotSavedErrorMsg = false;
        vm.essayEmptyErrorMsg = false;
    }

    vm.addNewEssay = function() {
        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        var created = day + '.' + month + '.' + date.getFullYear();

        if (vm.essayName && vm.essayText) {
            if (fire.addNewEssay(vm.essayName, vm.essayText, created)) {
                vm.cancelNewEssay();
            } else {
                vm.essayNotSavedErrorMsg = true;
                vm.essayEmptyErrorMsg = false;
            }
        } else {
            vm.essayNotSavedErrorMsg = false;
            vm.essayEmptyErrorMsg = true;
        }
    };

    vm.saveCurrentEssay = function(essay) {
        if (essay.essayName && essay.essayText) {
            vm.essaysList.$save(essay).then({}, function() {
                vm.essayCurrentNotSavedErrorMsg = true;
                vm.essayCurrentEmptyErrorMsg = false;
            });
        } else {
            vm.essayCurrentNotSavedErrorMsg = false;
            vm.essayCurrentEmptyErrorMsg = true;
        }
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

angular.module('further.Phrases', [])
    .controller('PhrasesCtrl', PhrasesCtrl);

function PhrasesCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newPhrase = '';
    vm.newPhraseDescription = '';
    vm.phrasesList = [];
    
    vm.addNewPhrase = function() {
        if (vm.newPhrase) {
            var date = new Date();
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            var created = month + '/' + date.getDate() + '/' + date.getFullYear();

            if (fire.addNewPhrase(vm.newPhrase, vm.newPhraseDescription, created)){
                vm.newPhrase = '';
                vm.newPhraseDescription = '';
            }
        } else{
            vm.phraseNotSavedErrorMsg = false;
            vm.phraseEmptyErrorMsg = true;
        }
    };

    vm.saveCurrentPhrase = function(phrase) {
        if (phrase.phrase) {
            vm.phrasesList.$save(phrase);
        }
    };

    fire.getAllPhrases().then(function(_d) {
        vm.phrasesList = _d;
    });
}
angular.module('further.Statistics', [])
    .controller('StatisticsCtrl', StatisticsCtrl);

function StatisticsCtrl(fire, $rootScope, AuthFactory, $scope) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.wordsList = [];
    vm.numberOfWords = 0;
    vm.wordsLabels = [];
    vm.wordsValues = [];

    vm.essaysList = [];
    vm.numberOfEssays = 0;
    vm.essaysLabels = [];
    vm.essaysValues = [];

    vm.numberOfWordsUsedInEssays = 0;
    vm.pieData = [];
    vm.pieLabels = ["Total amount", "Used in essays"];

    fire.getAllWords().then(function(_d) {
        vm.wordsList = _d;
        vm.numberOfWords = vm.wordsList.length;

        var months = [];
        for (var i = 0; i < vm.numberOfWords; i++) {
            var monthAndYear = vm.wordsList[i].created.substring(0, 2) + '.' + vm.wordsList[i].created.substring(6);
            var existedMonthIndex = findValueInArraysObject(months, monthAndYear);

            if (existedMonthIndex >= 0) {
                months[existedMonthIndex].number += 1;
            } else {
                var monthObj = {
                    value: monthAndYear,
                    number: 1
                }

                months.push(monthObj);
            }
        }

        var sortedMonthsArr = sortMonthsArrayAscending(months);
        if (sortedMonthsArr.length > 12) {
            sortedMonthsArr = sortedMonthsArr.slice(-12);
        }
        sortedMonthsArr.forEach(function(item) {
            vm.wordsLabels.push(item.value);
        });
        sortedMonthsArr.forEach(function(item) {
            vm.wordsValues.push(item.number);
        });

        // FORECAST
        vm.makeForecast(vm.wordsList, vm.numberOfWords);
    });

    fire.getAllEssays().then(function(_d) {
        vm.essaysList = _d;
        vm.numberOfEssays = vm.essaysList.length;

        var months = [];
        for (var i = 0; i < vm.numberOfEssays; i++) {
            var monthAndYear = vm.essaysList[i].created.substring(3);
            var existedMonthIndex = findValueInArraysObject(months, monthAndYear);

            if (existedMonthIndex >= 0) {
                months[existedMonthIndex].number += 1;
            } else {
                var monthObj = {
                    value: monthAndYear,
                    number: 1
                }

                months.push(monthObj);
            }
        }

        var sortedMonthsArr = sortMonthsArrayAscending(months);
        if (sortedMonthsArr.length > 12) {
            sortedMonthsArr = sortedMonthsArr.slice(-12);
        }
        sortedMonthsArr.forEach(function(item) {
            vm.essaysLabels.push(item.value);
        });
        sortedMonthsArr.forEach(function(item) {
            vm.essaysValues.push(item.number);
        });

        // pie
        if (vm.numberOfEssays) {
            var stringWithAllEssays = '';
            for (var i = 0; i < vm.numberOfEssays; i++) {
                var currentEssayWordsArr = splitOnWords(vm.essaysList[i].essayText);
                currentEssayWordsArr.forEach(function(item) {
                    stringWithAllEssays += item + ' ';
                });
            }
            for (var i = 0; i < vm.numberOfWords; i++) {
                var target = vm.wordsList[i].word;

                if (stringWithAllEssays.toLowerCase().indexOf(target.toLowerCase()) > 0) {
                    vm.numberOfWordsUsedInEssays += 1;
                }
            }

            vm.pieData.push(vm.numberOfWords - vm.numberOfWordsUsedInEssays, vm.numberOfWordsUsedInEssays);

            function splitOnWords(string) {
                var tmp = document.createElement("div");
                tmp.innerHTML = string;
                var onlyText = tmp.textContent || tmp.innerText || "";

                return onlyText.split(' ');
            }
        }
        // ---/
    });

    function sortMonthsArrayAscending(arr) {
        return arr.sort(function(a, b) {
            var aYear = +a.value.substring(3);
            var aMonth = +a.value.substring(0, 2);
            var bYear = +b.value.substring(3);
            var bMonth = +b.value.substring(0, 2);

            if (aYear == bYear) {
                if (aMonth > bMonth) {
                    return 1;
                }
                if (aMonth < bMonth) {
                    return -1;
                }
                return 0;
            }

            if (aYear > bYear) {
                return 1;
            }
            if (aYear < bYear) {
                return -1;
            }
            return 0;
        });
    }

    function findValueInArraysObject(arr, value) {
        var index = -1;

        arr.forEach(function(item, i) {
            if (item.value == value) {
                index = i;
            }
        });

        return index;
    }

    function findValueInObjectMonthAndYear(arr, month, year) {
        var index = -1;

        arr.forEach(function(item, i) {
            if ((item.value).substring(0, 2) == month && (item.value).substring(6) == year) {
                index = i;
            }
        });

        return index;
    }


    // charts
    // WORDS chart
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1', xAxisID: 'x-axis-1' }];
    $scope.options = {
        scales: {
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                scaleLabel: {
                    display: true,
                    labelString: 'NUMBER OF WORDS'
                },
                ticks: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }],
            xAxes: [{
                id: 'x-axis-1',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'MONTHS'
                }
            }]
        }
    };
    // ESSAYS chart
    $scope.datasetOverrideEssay = [{ yAxisID: 'y-essay-axis-1', xAxisID: 'x-essay-axis-1' }];
    $scope.optionsEssay = {
        scales: {
            yAxes: [{
                id: 'y-essay-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                scaleLabel: {
                    display: true,
                    labelString: 'NUMBER OF ESSAYS'
                },
                ticks: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }],
            xAxes: [{
                id: 'x-essay-axis-1',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'MONTHS'
                }
            }]
        }
    };

    // PIE chart
    $scope.optionsPie = {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                fontSize: 15
            }
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    var indice = tooltipItem.index;
                    if (indice == 0) {
                        var totalAmount = data.datasets[0].data[indice] + vm.numberOfWordsUsedInEssays;
                        return ' ' + totalAmount;
                    } else {
                        return ' ' + data.datasets[0].data[indice];
                    }
                }
            }
        }
    };
    // ---

    // FORECAST
    vm.numberOfWordsToKnow = '';
    vm.progressValue = "0";
    vm.forecastDate = '';
    vm.makeForecast = function(wordsList, numberOfWords) {
        // progress bar
        if (numberOfWords <= vm.numberOfWordsToKnow) {
            vm.progressValue = (numberOfWords / vm.numberOfWordsToKnow * 100).toFixed(1) + "%";
        } else {
            if (vm.numberOfWordsToKnow > 0) {
                vm.progressValue = 100 + "%";
            } else {
                vm.progressValue = 0;
            }
        }

        // forecast
        var arrayOfAllWordsDatesObj = [];
        for (var i = 0; i < vm.numberOfWords; i++) {
            var created = vm.wordsList[i].created;
            var existedDateIndex = findValueInArraysObject(arrayOfAllWordsDatesObj, created);

            if (existedDateIndex >= 0) {
                arrayOfAllWordsDatesObj[existedDateIndex].number += 1;
            } else {
                var dateObj = {
                    value: created,
                    number: 1
                }

                arrayOfAllWordsDatesObj.push(dateObj);
            }
        }

        arrayOfAllWordsDatesObj = sortDatesAscending(arrayOfAllWordsDatesObj);
        var wordsStartDate = arrayOfAllWordsDatesObj[0].value;
        var wordsStartParsedDate = parseDate(wordsStartDate);

        // result array
        var resultDatesArray = [];
        arrayOfAllWordsDatesObj.forEach(function(item, i) {
            var date = item.value,
                numberOfDaysSinceStart = numberOfDaysBetweenDates(wordsStartDate, date),
                numberOfWordsOnThisDate = item.number + numberOfWordsBeforeDate(date);
            var obj = {
                date: date,
                numberOfDaysSinceStart: numberOfDaysSinceStart,
                numberOfWordsOnThisDate: numberOfWordsOnThisDate
            };
            resultDatesArray.push(obj);
        });

        function numberOfWordsBeforeDate(date) {
            var number = 0;

            arrayOfAllWordsDatesObj.forEach(function(item, i) {
                if (new Date(date) > new Date(item.value)) {
                    number += item.number;
                }
            });

            return number;
        }

        var sumX = 0,
            sumY = 0,
            sumXY = 0,
            sumX2 = 0,
            N = resultDatesArray.length;
        for (var i = 0; i < N; i++) {
            sumX += resultDatesArray[i].numberOfDaysSinceStart;
            sumY += resultDatesArray[i].numberOfWordsOnThisDate;
            sumXY += resultDatesArray[i].numberOfDaysSinceStart * resultDatesArray[i].numberOfWordsOnThisDate;
            sumX2 += Math.pow(resultDatesArray[i].numberOfDaysSinceStart, 2);
        }

        var a = (N * sumXY - sumX * sumY) / (N * sumX2 - Math.pow(sumX, 2));
        var b = (sumY - a * sumX) / N;

        var numberOfDaysWhenKnowSinceStart = Math.ceil((vm.numberOfWordsToKnow - b) / a);

        var newdate = parseDate(wordsStartDate);
        newdate.setDate(newdate.getDate() + numberOfDaysWhenKnowSinceStart);
        var resultDate = new Date(newdate);

        var month = resultDate.getMonth() + 1;
        var day = resultDate.getDate();
        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        resultDate = day + '.' + month + '.' + resultDate.getFullYear();

        vm.forecastDate = resultDate; // forecast result
    }

    function sortDatesAscending(arr) {
        return arr.sort(function(a, b) {
            return new Date(a.value).getTime() - new Date(b.value).getTime()
        });
    }

    function numberOfDaysBetweenDates(date1, date2) {
        date1 = parseDate(date1);
        date2 = parseDate(date2);
        return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
    }

    function parseDate(str) {
        var mdy = str.split('/');
        return new Date(mdy[2], mdy[0] - 1, mdy[1]);
    }
    // ---
}

angular.module('further.Words', [])
    .controller('WordsCtrl', WordsCtrl);

function WordsCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newWord = null;
    vm.newWordTranslation = null;
    vm.wordsList = [];
    vm.usersList = [];

    vm.addNewWord = function() {
        if (vm.newWord && vm.newWordTranslation) {
            var date = new Date();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            var created = month + '/' + day + '/' + date.getFullYear();

            if (fire.addNewWord(vm.newWord, vm.newWordTranslation, created)) {
                vm.newWord = null;
                vm.newWordTranslation = null;
            }
        }
    };

    fire.getAllWords().then(function(_d) {
        vm.wordsList = _d;
    });

    // RECOMMENDATIONS
    fire.getAllUsers().then(function(_d) {
        vm.usersList = _d;
    });

    var customers = [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
    ];
    var items = [{
        id: 1,
        name: 'hammer'
    }, {
        id: 2,
        name: 'bumf'
    }, {
        id: 3,
        name: 'Snickers'
    }, {
        id: 4,
        name: 'screwdriver'
    }, {
        id: 5,
        name: 'pen'
    }, {
        id: 6,
        name: 'Kit-Kat'
    }, {
        id: 7,
        name: 'spanner'
    }, {
        id: 8,
        name: 'pencil'
    }, {
        id: 9,
        name: 'candys Health Bar'
    }, {
        id: 10,
        name: 'tape counter'
    }, {
        id: 11,
        name: 'binding machine'
    }];
    var payments = [{
            id: 1,
            customerID: 1,
            itemID: 6
        }, {
            id: 2,
            customerID: 1,
            itemID: 9
        }, {
            id: 3,
            customerID: 2,
            itemID: 2
        }, {
            id: 4,
            customerID: 2,
            itemID: 8
        }, {
            id: 5,
            customerID: 3,
            itemID: 4
        }, {
            id: 6,
            customerID: 3,
            itemID: 7
        }, {
            id: 7,
            customerID: 3,
            itemID: 10
        }, {
            id: 8,
            customerID: 4,
            itemID: 5
        }, {
            id: 9,
            customerID: 4,
            itemID: 8
        }, {
            id: 10,
            customerID: 4,
            itemID: 11
        }, {
            id: 11,
            customerID: 5,
            itemID: 1
        }, {
            id: 12,
            customerID: 5,
            itemID: 4
        }, {
            id: 13,
            customerID: 5,
            itemID: 10
        }, {
            id: 14,
            customerID: 6,
            itemID: 5
        }, {
            id: 15,
            customerID: 6,
            itemID: 11
        }, {
            id: 16,
            customerID: 7,
            itemID: 1
        }, {
            id: 17,
            customerID: 7,
            itemID: 4
        }, {
            id: 18,
            customerID: 8,
            itemID: 3
        }, {
            id: 19,
            customerID: 8,
            itemID: 9
        }
        // {
        //     id: 20,
        //     customerID: 2,
        //     itemID: 11
        // }
    ]

    var d = items.length;
    var E = getAllBuyingsOfParticularCustomer(payments, 1)
    var llEll = E.length;
    var Pi = [];
    var PiE = findCoincidences(1, payments);
    var Beta = 1;

    // calculate Pi
    customers.forEach(function(item, i) {
        var itemsOfThisCustomer = getAllBuyingsOfParticularCustomer(payments, item);
        var obj = {
            customerID: item,
            itemCount: itemsOfThisCustomer.length
        }
        Pi.push(obj);
    });

    function getAllBuyingsOfParticularCustomer(payments, customerID) {
        var result = [];

        payments.forEach(function(item, i) {
            if (item.customerID == customerID) {
                result.push(item.itemID)
            }
        });

        return result;
    }

    function findCoincidences(customerID, payments) {
        var result = [];

        customers.forEach(function(item, i) {
            if (item != customerID) {
                var anotherCustomerBuyings = getAllBuyingsOfParticularCustomer(payments, item);
                var howManyCoincidences = 0;

                anotherCustomerBuyings.forEach(function(itemID) {
                    if (isElementInArray(itemID, E)) {
                        howManyCoincidences++;
                    }
                });
                if (howManyCoincidences) {
                    var obj = {
                        customerID: item,
                        itemCount: howManyCoincidences
                    }
                    result.push(obj);
                }
            } else {
                var obj = {
                    customerID: item,
                    itemCount: llEll
                }
                result.unshift(obj);
            }
        });

        return result;
    }

    function isElementInArray(element, array) {
        var result = false;

        array.forEach(function(item) {
            if (element == item) {
                result = true;
                return;
            }
        });

        return result;
    }

    // ---/
}
