

var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function() {
        if (data.totals.inc > 0) {
            this.percentage = Math.round((this.value / data.totals.inc) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(el) {
           sum += el.value; 
        });
        data.totals[type] = sum;
    }
    
    
    return {
        
        addItem: function(type, desc, val) {
            var newItem, ID;
            
            // create new id
            if (data.allItems[type].length > 0) {
               ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            } else {
                ID = 0;
            };
            
            
            // create new item based on inc or exp
            if (type === "exp") {
                newItem = new Expense(ID, desc, val);
            } else if (type === "inc") {
                newItem = new Income(ID, desc, val);
            }
            
            // push it to our data structure
            data.allItems[type].push(newItem);
            
            // return the new element
            return newItem;
            
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
                console.log("deleted");

            }
            
        },
        
        calculateBudget: function() {
            
            // calculate total income & expenses
            
            calculateTotal("exp");
            calculateTotal("inc");
            
            // calculate the budget: income - expenses
            
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            
            if(data.totals.inc > data.totals.exp) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
                } else {
               data.percentage = -1;
               }
            
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(el) {
               el.calcPercentage(); 
            });
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(el) {
                return el.getPercentage();
            });
            return allPercentages;
        },
        
        getBudget: function() {
            return {
                totalExp: data.totals.exp,
                totalInc: data.totals.inc,
                budget: data.budget,
                percentage: data.percentage,
            }
        },
        
        testing: function() {
            console.log(data);
        }
        
    }
    
    
    
})();






//------------------------------------------------------------------------------------------




var UIController = (function() {
    
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };
    
           formatNumber = function(num, type) {
            var numSplit, int, dec, sign;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split(".");
            
            int = numSplit[0];
            
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
            
        };
    
                nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
    
    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // INC or EXP
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        
        addListItem: function(obj, type) {
            var html, newHTML, element;
            
            if (type === 'inc') {
                
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' 
                
            } else {
                
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                
            }
            
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
     
            
        },
        
        deleteListItem: function(selectorID) {
            document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                
                current.value = "";
                
            });
                  
            fieldsArr[0].focus();
            
        },
        
        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," +
                DOMstrings.inputDescription + "," +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
                            cur.classList.toggle("red-focus");
                            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
            
            
        },
        
        
        displayBudget: function(obj) {
            var type;
            
            obj.budget > 0 ? type = "inc" : "exp"
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp"); 
            
            
            if (obj.percentage !== -1) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + " %";
                } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = "---";        
                }
            
        },
        
        displayPercentages: function(percentagesArr) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            

            
            nodeListForEach(fields, function(current, index) {
                
                if (percentagesArr[index] > 0) {
                current.textContent = percentagesArr[index] + " %";
                    } else {
                        current.textContent = "---";
                    }
            });
            
        },
        
        
        displayMonth: function() {
            
            var now = new Date();
            var year = now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent = year;
            
        },
 
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    }
    
    
    
})();






//------------------------------------------------------------------------------------------





var controller = (function(budgetCtrl, UICtrl) {
    
    
    var setupEventListeners = function() {
        
            var DOM = UICtrl.getDOMstrings();

            document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
            document.addEventListener("keypress", function(e) {
                if (e.keyCode === 13) {
                    ctrlAddItem();
                }
            });
            
            document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        
            document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
        
        
    };
    
    
    var updateBudget = function() {
        
              
        // 4. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // return budget
        var budget = budgetCtrl.getBudget();
        
        // 5. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    }
    
    var updatePercentages = function() {
        
        // Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        
    }
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        
        input = UICtrl.getinput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value >= 0) {
        
            // 2. Add the item to the budget controller

            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI

            UICtrl.addListItem(newItem, input.type);

            // Clear the fields

            UICtrl.clearFields();
            
            // Calculate and Update Budget
            
            updateBudget();
            
            // Calculate and Update Percentages
            
            updatePercentages();

        }
        
        
        
    };
    
    var ctrlDeleteItem = function(event) {
        
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // delete item from data structure
            
            console.log(type, ID);
            budgetCtrl.deleteItem(type, ID);
            
            // delete from the UI
            UICtrl.deleteListItem(itemID);
            
            
            // update and show the new budget
            updateBudget();
            
        };
        
        
    };
    

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                totalExp: 0,
                totalInc: 0,
                budget: 0,
                percentage: -1,
            });
        }
    };
    

})(budgetController, UIController);





//------------------------------------------------------------------------------------------



controller.init();





