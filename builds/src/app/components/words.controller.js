angular.module('further.Words', [])
    .controller('WordsCtrl', WordsCtrl);

function WordsCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newWord = null;
    vm.newWordTranslation = null;
    vm.wordsList = [];

    var uid = vm.auth.authVar.$getAuth().uid;

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
    vm.usersList = [];

    fire.getAllUsers().then(function(_d) {
        vm.usersList = _d;

        // recommendations
        var uidAndWordsList = getWordsOfAllUsers(vm.usersList);

        /* Структура данных ART1 для персонализации */

        /* Строковые названия элементов векторов */
        var itemName = collectAllWordsWithoutDuplicates(uidAndWordsList);
        var MAX_ITEMS = itemName.length;
        var MAX_CUSTOMERS = uidAndWordsList.length;
        var TOTAL_PROTOTYPE_VECTORS = MAX_CUSTOMERS;
        var beta = 1.0; /* Небольшое положительное целое */
        var vigilance = 0.9; /* 0 <= внимательность < 1 */
        var numPrototypeVectors = 0;
        /* Количество векторов прототипов */
        var prototypeVector = [];
        /* Вектор суммирования для выдачи рекомендаций */
        var sumVector = [];
        /* Количество членов в кластерах */
        var members = [];
        /* Номер кластера, к которому принадлежит покупатель */
        var membership = [];

        /* Массив векторов признаков. Поля представляют слово, которое добавляет пользователь. Нуль – слово не добавлено */

        var database = generateVectorOfSigns(itemName, uidAndWordsList);
        console.log(itemName)
        console.log(database)

        /* Инициализация структур данных алгоритма*/

        function initialize() {
            var i, j;
            /* Очистка векторов прототипов */
            for (i = 0; i < TOTAL_PROTOTYPE_VECTORS; i++) {
                var zeros = [];
                for (j = 0; j < MAX_ITEMS; j++) {
                    zeros.push(0);
                }
                prototypeVector.push(zeros);
                sumVector.push(zeros);
                members[i] = 0;
            }
            /* Сброс значения принадлежности векторов к кластерам */
            for (j = 0; j < MAX_CUSTOMERS; j++) {
                membership[j] = -1;
            }
        }



        // Вспомогательные функции для алгоритма ART1
        function vectorMagnitude(vector) {
            var j, total = 0;
            for (j = 0; j < MAX_ITEMS; j++) {
                if (vector[j] == 1) total++;
            }
            return total;
        }



        // Функции управления векторами:прототипами
        function createNewPrototypeVector(example) {
            var i, cluster;
            for (cluster = 0; cluster < TOTAL_PROTOTYPE_VECTORS; cluster++) {
                if (members[cluster] == 0) break;
            }
            numPrototypeVectors = ++numPrototypeVectors;
            for (i = 0; i < MAX_ITEMS; i++) {
                prototypeVector[cluster][i] = example[i];
            }
            members[cluster] = 1;
            return cluster;
        }

        function updatePrototypeVectors(cluster) {
            var item, customer, first = 1;
            for (item = 0; item < MAX_ITEMS; item++) {
                prototypeVector[cluster][item] = 0;
                sumVector[cluster][item] = 0;
            }
            for (customer = 0; customer < MAX_CUSTOMERS; customer++) {
                if (membership[customer] == cluster) {
                    if (first) {
                        for (item = 0; item < MAX_ITEMS; item++) {
                            prototypeVector[cluster][item] = database[customer][item];
                            sumVector[cluster][item] = database[customer][item];
                        }
                        first = 0;
                    } else {
                        for (item = 0; item < MAX_ITEMS; item++) {
                            prototypeVector[cluster][item] = prototypeVector[cluster][item] & database[customer][item];
                            sumVector[cluster][item] += database[customer][item];
                        }
                    }
                }
            }
            return;
        }

        // Алгоритм ART1
        function performART1() {
            var andresult = [];
            var pvec, magPE, magP, magE;
            var result, test;
            var index, done = 0;
            var count = 50;
            while (!done) {
                done = 1;
                /* По всем покупателям */
                for (index = 0; index < MAX_CUSTOMERS; index++) {
                    /* Шаг 3 */
                    for (pvec = 0; pvec < TOTAL_PROTOTYPE_VECTORS; pvec++) {
                        /* Есть ли в этом кластере элементы? */
                        if (members[pvec]) {

                            // vectorBitwiseAnd function
                            var v = database[index];
                            var w = prototypeVector[pvec];
                            for (var i = 0; i < MAX_ITEMS; i++) {
                                andresult[i] = (v[i] & w[i]);
                            }
                            // ---/

                            magPE = vectorMagnitude(andresult);
                            magP = vectorMagnitude(prototypeVector[pvec]);
                            magE = vectorMagnitude(database[index]);
                            result = magPE / (beta + magP);
                            test = magE / (beta + MAX_ITEMS);
                            /* Выражение 3.2 */
                            if (result > test) {
                                /* Тест на внимательность / (Выражение 3.3) */
                                if ((magPE / magE) < vigilance) {
                                    var old;
                                    /* Убедиться, что это другой кластер */
                                    if (membership[index] != pvec) {
                                        /* Переместить покупателя в другой кластер */
                                        old = membership[index];
                                        membership[index] = pvec;
                                        if (old >= 0) {
                                            members[old] = --members[old];
                                            if (members[old] == 0) {
                                                numPrototypeVectors = --numPrototypeVectors;
                                            }
                                        }
                                        members[pvec] = ++members[pvec];
                                        /* Пересчитать векторы прототипы для всех кластеров */
                                        if ((old >= 0) && (old < TOTAL_PROTOTYPE_VECTORS)) {
                                            updatePrototypeVectors(old);
                                        }
                                        updatePrototypeVectors(pvec);
                                        done = 0;
                                        break;
                                    } else {
                                        /* Уже в этом кластере */
                                    }
                                } /* Тест на внимательность */
                            }
                        }
                    } /* Цикл по векторам */
                    /* Проверяем, обработан ли вектор */
                    if (membership[index] == -1) {
                        /* Не был найден подходящий кластер – создаем новый кластер для этого вектора признаков
                         */
                        membership[index] = createNewPrototypeVector(database[index]);
                        done = 0;
                    }
                } /* Цикл по покупателям */
                var k = --count;
                if (!k) break;
            } /* Закончили */
            return 0;
        }

        // Алгоритм рекомендации
        function makeRecommendation(customer) {
            var bestItem = -1;
            var val = 0;
            var item;
            for (item = 0; item < MAX_ITEMS; item++) {
                if ((database[customer][item] == 0) && (sumVector[membership[customer]][item] > val)) {
                    bestItem = item;
                    val = sumVector[membership[customer]][item];
                }
            }
            console.log("For Customer " + customer);
            if (bestItem >= 0) {
                console.log("The best recommendation is " + bestItem + " " + itemName[bestItem]);
                console.log("Owned by " + sumVector[membership[customer]][bestItem] + " out of " + members[membership[customer]] + " members of this cluster");
            } else {
                console.log("No recommendation can be made.");
            }
            console.log("Already owns: ");
            for (item = 0; item < MAX_ITEMS; item++) {
                if (database[customer][item]) {
                    console.log(itemName[item]);
                }
            }
        }

        var customer;
        initialize();
        performART1();
        for (customer = 0; customer < MAX_CUSTOMERS; customer++) {
            makeRecommendation(customer);
        }
    });

    function generateVectorOfSigns(itemName, uidAndWordsList) {
        var database = [];

        uidAndWordsList.forEach(function(item, i) {
            var currentArrayOfWords = item.words;

            var databaseItemArr = [];
            itemName.forEach(function(word) {
                if (isElementInArray(word, currentArrayOfWords)) {
                    databaseItemArr.push(1);
                } else {
                    databaseItemArr.push(0);
                }
            });

            database.push(databaseItemArr);
        });

        return database;
    }

    function getWordsOfAllUsers(usersList) {
        var uidAndWordsList = [];

        usersList.forEach(function(item, i) {
            var wordsOfCurrentUser = [];

            if (item.words.length) {
                Object.keys(item.words).map(function(objectKey, index) {
                    wordsOfCurrentUser.push(item.words[objectKey]);
                });
                var words = [];

                wordsOfCurrentUser.forEach(function(word) {
                    if (!isElementInArray(word.word, words)) {
                        words.push(word.word);
                    }
                });

                var obj = {
                    id: item.$id,
                    words: words
                }

                if (item.$id == uid) {
                    uidAndWordsList.unshift(obj);
                } else {
                    uidAndWordsList.push(obj);
                }
            }

        });

        return uidAndWordsList;
    }

    function collectAllWordsWithoutDuplicates(uidAndWordsList) {
        var result = [];

        uidAndWordsList.forEach(function(item) {
            item.words.forEach(function(word, i) {
                if (!isElementInArray(word, result)) {
                    result.push(word);
                }
            });
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
