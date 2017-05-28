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

    fire.getAllWords().then(function(_d) {
        vm.wordsList = _d;
    	vm.numberOfWords = vm.wordsList.length;
	    
	    var months = [];
	    for (var i = 0; i < vm.numberOfWords; i++){
	    	var monthAndYear = vm.wordsList[i].created.substring(3);
	    	var existedMonthIndex = findValueInArraysObject(months, monthAndYear);

	    	if (existedMonthIndex >= 0){
	    		months[existedMonthIndex].number += 1;
	    	} else{
	    		var monthObj = {
	    			value: monthAndYear,
	    			number: 1
	    		}

	    		months.push(monthObj);
	    	}
	    }

	    var sortedMonthsArr = sortMonthsArrayAscending(months);
	    if (sortedMonthsArr.length > 12){
	    	sortedMonthsArr = sortedMonthsArr.slice(-12);
	    }
	    sortedMonthsArr.forEach(function(item){
	    	vm.wordsLabels.push(item.value);
	    });
	    sortedMonthsArr.forEach(function(item){
	    	vm.wordsValues.push(item.number);
	    });
    });

    function sortMonthsArrayAscending(arr){
    	return arr.sort(function(a,b){
    		var aYear = +a.value.substring(3);
    		var aMonth = +a.value.substring(0,2);
    		var bYear = +b.value.substring(3);
    		var bMonth = +b.value.substring(0,2);

    		if (aYear == bYear){
    			if (aMonth > bMonth){
    				return 1;
    			}
    			if (aMonth < bMonth){
    				return -1;
    			}
    			return 0;
    		}

    		if (aYear > bYear){
    			return 1;
    		}
    		if (aYear < bYear){
    			return -1;
    		}
    		return 0;
    	});
    }

    function findValueInArraysObject(arr, value){
    	var index = -1;

    	arr.forEach(function(item, i) {
    		if (item.value == value){
    			index = i;
    		}
		});

		return index;
    }


    // charts
    $scope.labels = vm.wordsLabels;
    $scope.data = vm.wordsValues;
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    $scope.options = {
        scales: {
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left'
            }, {
                id: 'y-axis-2',
                type: 'linear',
                display: true,
                position: 'right'
            }]
        }
    };
    // ---
}
