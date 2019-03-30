
//budget controller
var BudgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }


    var calculateTotal = function (type) {
        var sum = 0;
        data.allitems[type].forEach(function (cur) {
            sum += cur.value;
        })
        data.totals[type] = sum;
    }


    //DATA STRUCTUR
    var data = {
        allitems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }


    return {
        addItem: function (type, desc, value) {
            var newItem, ID;

            if (data.allitems[type].length > 0) {
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //create new item base inc or desc
            if (type === 'exp') {
                newItem = new Expense(ID, desc, value)
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, value);
            }


            // push data to our structur
            data.allitems[type].push(newItem);

            //return new item 
            return newItem;
        },

        //------ Store DATA ------
        storeData: function () {
            localStorage.setItem('data', JSON.stringify(data));
        },
        getStoreData: function () {
            var localData = localStorage.getItem('data');
            return localData;

        },
        updateData: function (storeData) {
            data.totals = storeData.totals;
            data.budget = storeData.budget;
            data.percentage = storeData.percentage
        },
        //---------------------

        calculateBudget: function () {
            //calculate total
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget : income - expense 
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentages of income the we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1
            }
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        deletedItem: function (type, id) {
            var index, ids;
            ids = data.allitems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allitems[type].splice(index, 1);
            }


        },

        test: function () {
            return data;
        }
    }

})();



//ui controller
var UIController = (function () {
    var DOMstring = {
        IDinput: 'input__value',
        inputType: '.add__type',
        inputDesc: '.desc',
        inputValue: '.add__value',
        btn_add: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expense__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        expensesPercentagesLabel: '.budget__expenses--percentage',
        contentBody: '.content-body',
        describeNominal: '.describe__nominal',
        toggleModeDark: '.toggleDark',
        containerAdd: '.add',
        budgetTitle: '.budget__title',
        headerTitle: '.header_title',
        budgetMonth: '.budget__title--month'
    }

    var formatNumber = function (angka, prefix) {
        var ConverString = String(angka);
        var number_string = ConverString.replace(/[^,\d]/g, '').toString(),
            split = number_string.split(','),
            sisa = split[0].length % 3,
            rupiah = split[0].substr(0, sisa),
            ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        // tambahkan titik jika yang di input sudah menjadi angka ribuan
        if (ribuan) {
            separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
        return prefix == undefined ? rupiah : (rupiah ? 'Rp. ' + rupiah : '');
    }

    //description nominal 
    var descriptionNominal = function (value) {
        var nominalValue, sentence, number, describeNumber, describeLevel, nominalLong;

        nominalValue   = value;
        sentence       = '';
        number         = new Array('0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0');
        describeNumber = new Array('', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan');
        describeLevel  = new Array('', ' Ribu', ' Juta', 'Milyar', 'Triliun');
        nominalLong    = nominalValue.length;
        
        //check nominal length 
        if (nominalLong > 15) {
            sentence = "Ups,.. Nominal overload :(";
        } else {

            //get number from value, insert into array 
            for (var i = 1; i <= nominalLong; i++) {
                number[i] = nominalValue.substr(-(i),1);
               
            }

            var i = 1;
            var j = 0;
            

            // start iterasi to array
            while (i <= nominalLong) {
                var subSentence, sentence1, sentence2, sentence3;
                subSentence = "";
                sentence1   = "";
                sentence2   = "";
                sentence3   = "";

                //get ratusan
                if (number[i + 2] != "0") {
                    if (number[i + 2] == "1") {
                        sentence1 = "Seratus ";
                    } else {
                        sentence1 = describeNumber[number[i + 2]] + " Ratus";
                    }
                }

                // get puluhan atau belasan
                if(number[i+1] != "0"){
                    if(number[i+1] == "1"){
                        if(number[i] == "0"){
                            sentence2 = "Sepuluh";
                        }else if(number[i] == "1"){
                            sentence2 = "Sebelas";
                        }else{
                            sentence2 = describeNumber[number[i]] + " Belas";
                        }
                    }else{
                        sentence2 = describeNumber[number[i+1]] + " Puluh";
                    }
                }
                
                // get satuan
                if(number[i] != "0"){
                    if(number[i+1] != "1"){
                        sentence3 = describeNumber[number[i]];
                    }
                }

                // test if number not 0 , then plus describe level 
                if( (number[i] != "0") || (number[i+1] != "0") || (number[i+2] != "0") ){
                    subSentence = sentence1+ ""+sentence2+""+sentence3+""+describeLevel[j]+" ";
                }

                // merge variabel subsentes 
                sentence = subSentence + sentence;
                i = i + 3;
                j = j + 1;
            }
           

            //change satu ribu jadi seribu jika diperlukan
            if(number[5] == "0" && (number[6] == "0") ){
                sentence = sentence.replace("Satu Ribu","Seribu");
            }
        }
        document.querySelector(DOMstring.describeNominal).textContent = sentence;
    }

    return {
        getDomString: function () {
            return DOMstring;
        },
        getInput: function () {
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            }
        },
        addListItem(obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstring.incomeList;
                html = '<tr id="inc-%id%" style="color: #28B9B5"><th >%description%</th><th>%value%</th><th><i class="ion-ios-close-outline remove_btn "></i></th></tr>';
            } else if (type === 'exp') {
                element = DOMstring.expenseList;
                html = '<tr id="exp-%id%" style="color: #FF5049"><th>%description%</th><th>%value%</th><th><i class="ion-ios-close-outline remove_btn"></i></th></tr>';
            }

            document.querySelector(element).classList.add('animated','bounce');

            //Replace the placeholder
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));

            //remove text content describe nominal
            document.querySelector(DOMstring.describeNominal).textContent = "";
            
            //insert the Html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        displayBudget: function (obj) {
            document.querySelector(DOMstring.budgetLabel).classList.toggle("animated","bounce");
            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget);
            document.querySelector(DOMstring.incomeLabel).textContent = ' + ' + formatNumber(obj.totalInc, 'Rp');
            document.querySelector(DOMstring.expenseLabel).textContent = ' - ' + formatNumber(obj.totalExp, 'Rp. ');

            if (obj.percentage > 0) {
                document.querySelector(DOMstring.expensesPercentagesLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstring.expensesPercentagesLabel).textContent = '--';
            }
        },

        displayDate: function(){
            var now, year ,months,listMonth ;
            now = new Date();
            listMonth = ['Januari','Februari','Maret','April','Maret','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
            months    = now.getMonth();
            year      = now.getFullYear();

            document.querySelector(DOMstring.budgetMonth).textContent = listMonth[months] +" "+ year ;
        },

        deleteListItem: function (selector) {
            var el = document.getElementById(selector);
            el.parentNode.removeChild(el);
        },

        getFormatNumber: function (value) {
            document.querySelector(DOMstring.inputValue).value = formatNumber(value);
        },

        getDescribeNominal: function (value) {
            return descriptionNominal(value);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstring.inputDesc + ', ' + DOMstring.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        }
    }

})();



//Controller 
var Controller = (function (BudgetCtrl, UICtrl) {

    var setupEventListener = function () {
        var DOM = UICtrl.getDomString();


        //listen key press input value 
        document.querySelector(DOM.inputValue).addEventListener('keyup', function () {
            var el = document.getElementById(DOM.IDinput);
            UICtrl.getDescribeNominal(el.value);
        });


        //click event on btn add
        document.querySelector(DOM.btn_add).addEventListener('click', ctrlAddItem);

        //keypress event on document
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        //delete item
        document.querySelector(DOM.contentBody).addEventListener('click', ctrlDeleteItem);

        //Dark Mode button
        document.querySelector(DOM.toggleModeDark).addEventListener('click', function() {
            
             var el = document.getElementById("darkmode");
             var header = document.querySelector('#content__header');
             var contentBottom = document.querySelector('#content__bottom');

             document.querySelector(DOM.budgetTitle).classList.toggle("dark_value");
             document.querySelector(DOM.budgetLabel).classList.toggle("dark_value");
             document.querySelector(DOM.containerAdd).classList.toggle("dark");
             document.querySelector(DOM.headerTitle).classList.toggle("dark_value");
             document.querySelector('.demo-ribbon').classList.toggle("dark")
             
            

             el.classList.toggle("dark");
            if(el.classList.toggle('mdl-color--white') === undefined){
                el.classList.toggle('mdl-color--white')
            }

            header.classList.toggle("dark");
            if(header.classList.toggle('mdl-color--grey-100') === undefined){
                header.classList.toggle('mdl-color--grey-100')
            }

            contentBottom.classList.toggle("dark");
            if(contentBottom.classList.toggle('mdl-color--grey-100') === undefined){
                contentBottom.classList.toggle('mdl-color--grey-100')
            }

            
            
        });
    }

    var loadData = function () {
        var storeData, newIncItem, newExpItem;

        //1. Load the dasta from the localstorage
        storeData = BudgetCtrl.getStoreData();

        if (storeData) {
            var data = JSON.parse(storeData);
            // 2. insert the data into the data structur
            BudgetCtrl.updateData(data);

            // 3. create the income project
            data.allitems.inc.forEach(function (cur) {
                newIncItem = BudgetCtrl.addItem('inc', cur.description, cur.value);
                UICtrl.addListItem(newIncItem, 'inc');
            });

            //4. create the expense object
            data.allitems.exp.forEach(function (cur) {
                newExpItem = BudgetCtrl.addItem('exp', cur.description, cur.value);
                UICtrl.addListItem(newExpItem, 'exp');
            });

            //5. display budget
            var budget = BudgetCtrl.getBudget();
            UICtrl.displayBudget(budget);
        }
    }

   


    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            //1. delete item from data structur;
            BudgetCtrl.deletedItem(type, parseInt(ID));

            //2. Delete Item From the UI
            UICtrl.deleteListItem(itemID);
            //3.  update and show the new budget
            updateBudget();

            //4. update to localstorage
            BudgetCtrl.storeData();

            //5. calculate and update percentage

        }


    }

    var updateBudget = function () {
        //1. Calculate the budget
        BudgetCtrl.calculateBudget()

        //2. return the buget in the variable
        var budget = BudgetCtrl.getBudget();

        //3. Display the budget UI
        UICtrl.displayBudget(budget);
    }


    ctrlAddItem = function () {
        var newItem, input;

        //1. get input
        input = UICtrl.getInput();


        //2. check fields input 
        if (input.description.trim() !== '' && !isNaN(input.value) && input.value > 0) {
            // var valueFormat = String(input.value);
            // 3.  Add The budget item to the controller
            newItem = BudgetCtrl.addItem(input.type, input.description, input.value);

            //4. Update item to the UI
            UICtrl.addListItem(newItem, input.type);


            //5. clear fields input after enter
            UICtrl.clearFields();

            //6 . calculate and update budget
            updateBudget();

            BudgetCtrl.storeData();
        }
    }




    return {
        init: function () {
            console.log('application has started !')
            setupEventListener();
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            })
            loadData();
        }
    }

})(BudgetController, UIController);

Controller.init();

