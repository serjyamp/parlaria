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
