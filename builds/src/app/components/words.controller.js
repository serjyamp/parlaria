angular.module('further.Words', [])
    .controller('WordsCtrl', WordsCtrl);

function WordsCtrl(fire, $rootScope, AuthFactory) {
    var vm = this;
    vm.auth = AuthFactory;
    vm.newWord = null;
    vm.newWordTranslation = null;
    vm.wordsList = [];

    var uid = vm.auth.authVar.$getAuth().uid;

    vm.addNewWord = function(w, t, rec) {
        if (w && t) {
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

            if (fire.addNewWord(w, t, created)) {
                if (!rec) {
                    vm.newWord = null;
                    vm.newWordTranslation = null;
                }
            }

            recommendationsMain();
        }
    };

    vm.removeWord = function(w){
        vm.wordsList.$remove(w);
        recommendationsMain();
    }

    fire.getAllWords().then(function(_d) {
        vm.wordsList = _d;
    });

    // RECOMMENDATIONS
    recommendationsMain();

    function recommendationsMain() {
        vm.usersList = [];

        fire.getAllUsers().then(function(_d) {
            vm.usersList = _d;

            // recommendations
            var uidAndWordsList = getWordsOfAllUsers(vm.usersList);

            /* Структура данных ART1 для персонализации */

            /* Строковые названия элементов векторов */
            var itemName = collectAllWordsWithoutDuplicates(uidAndWordsList).words;
            var itemTranslations = collectAllWordsWithoutDuplicates(uidAndWordsList).translations;
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
            /* Номер кластера, к которому принадлежит пользователь */
            var membership = [];

            /* Массив векторов признаков. Поля представляют слово, которое добавляет пользователь. Нуль – слово не добавлено */

            var database = generateVectorOfSigns(itemName, uidAndWordsList);

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
                    /* По всем пользователям */
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
                                            /* Переместить пользователя в другой кластер */
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
                    } /* Цикл по пользователям */
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

                var result = [];
                var r = null;

                if (bestItem >= 0) {
                    r = {
                        word: itemName[bestItem],
                        translation: itemTranslations[bestItem]
                    }
                }

                return makeOtherRecommendations(r, itemName, itemTranslations);
            }

            function makeOtherRecommendations(bestRecommendation, itemName, itemTranslations) {
                var result = [];
                vm.wordsList.forEach(function(item) {
                    var w = item.word;
                    if (isElementInArray(w, itemName)) {
                        var indexToRemove = itemName.indexOf(w);

                        itemName.splice(indexToRemove, 1);
                        itemTranslations.splice(indexToRemove, 1);
                    };
                });

                if (bestRecommendation) {
                    var indexToRemove;
                    var bestWord = bestRecommendation.word;
                    itemName.forEach(function(item, i) {
                        if (item == bestWord) {
                            indexToRemove = i;
                            return;
                        }
                    });
                    itemName.splice(indexToRemove, 1);
                    itemTranslations.splice(indexToRemove, 1);

                    result.push(bestRecommendation);
                }

                if (itemName.length) {
                    var otherWords = [];
                    itemName.forEach(function(item, i) {
                        var obj = {
                            word: item,
                            translation: itemTranslations[i]
                        }
                        otherWords.push(obj);
                    });

                    var minRandomIndex = 0;
                    var maxRandomIndex = itemName.length - 1;
                    var arrayOfRandomIndexes = [];
                    var i = 5;
                    if (bestRecommendation) {
                        i = 4;
                    }
                    if (i > itemName.length) {
                        i = itemName.length;
                    }
                    while (arrayOfRandomIndexes.length < i) {
                        var rand = getRandomInt(minRandomIndex, maxRandomIndex);
                        if (!isElementInArray(rand, arrayOfRandomIndexes)) {
                            arrayOfRandomIndexes.push(rand);
                        }
                    }

                    arrayOfRandomIndexes.forEach(function(item) {
                        result.push(otherWords[item]);
                    });
                };

                console.log('----------')
                console.log(result)
                return result;
            }

            initialize();
            performART1();

            vm.recommendations = makeRecommendation(0);
        });

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

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

                if (item.words) {
                    Object.keys(item.words).map(function(objectKey, index) {
                        wordsOfCurrentUser.push(item.words[objectKey]);
                    });
                    var words = [];

                    wordsOfCurrentUser.forEach(function(word) {
                        var fl = false;

                        words.forEach(function(wordObj) {
                            if (wordObj.word == word.word) {
                                fl = true;
                                return;
                            }
                        });

                        if (!fl) {
                            var wt = {
                                word: word.word,
                                translation: word.translation
                            }
                            words.push(wt);
                        }
                    });

                    var currentUserWordsArr = [];
                    var currentUserTranslationsArr = [];

                    words.forEach(function(w) {
                        currentUserWordsArr.push(w.word);
                        currentUserTranslationsArr.push(w.translation);
                    });

                    var obj = {
                        id: item.$id,
                        words: currentUserWordsArr,
                        translations: currentUserTranslationsArr
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
            var resultWords = [];
            var resultTranslations = [];

            uidAndWordsList.forEach(function(item) {
                var wordsIDs = [];

                item.words.forEach(function(word, i) {
                    if (!isElementInArray(word, resultWords)) {
                        resultWords.push(word);
                        wordsIDs.push(i);
                    }
                });

                wordsIDs.forEach(function(wordID) {
                    item.translations.forEach(function(translation, i) {
                        if (i == wordID) {
                            resultTranslations.push(translation);
                        }
                    });
                });
            });

            var result = {
                words: resultWords,
                translations: resultTranslations
            };

            return result;
        }
    }
    // --- end of recommendationsMain

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
}
