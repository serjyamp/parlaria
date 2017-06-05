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

        vm.forecastDate = resultDate;
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
