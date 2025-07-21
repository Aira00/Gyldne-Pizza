window.addEventListener("load", initSales);
var restaurantTable = null;
var saleTable = null;
var chart = null;
var data = null;

function initSales() {
    //Sets the first day of the week to monday
    moment.updateLocale('en', {
        week: {
            dow: 1
        }
    });

    //Init from-to date selectors
    new dtsel.DTS('#from-date',  {
        direction: 'BOTTOM',
        dateFormat: DATEFORMAT,
        showTime: false,
        timeFormat: "HH:MM:SS"
    });
    new dtsel.DTS('#to-date',  {
        direction: 'BOTTOM',
        dateFormat: DATEFORMAT,
        showTime: false,
        timeFormat: "HH:MM:SS"
    });

    //Init gyldneTable lib
    restaurantTable = new gyldneTable({
        element: document.getElementsByClassName("gyldne-table-container")[0],
        source: backend.restaurants,
        columns: [
            {
                title: "Restaurant",
                property: "name"
            }
        ],
        callbacks: {
            selected: updateDisplayedDataset
        },
        toolbar: {
            filter: true,
            add: false,
            delete: false,
            edit: false
        }
    });

    saleTable = new gyldneTable({
        element: document.getElementsByClassName("gyldne-table-container")[1],
        source: [],
        columns: [
            {
                title: "Antall",
                property: "amount"
            },
            {
                title: "Rett",
                property: "item"
            },
            {
                title: "Total Pris",
                property: "price"
            },
            {
                title: "Dato",
                property: "date"
            }
        ],
        toolbar: {
            filter: true,
            add: true,
            delete: true,
            edit: true
        },
        callbacks: {
            add: addCallback,
            delete: deleteCallback,
            edit: editCallback
        }
    });

    //Set from-to date input events and default date to current week
    document.getElementById("from-date").onchange = dateChanged;
    document.getElementById("to-date").onchange = dateChanged;
    document.getElementById("from-date").value = moment().startOf('week').format(DATEFORMAT);
    document.getElementById("to-date").value = moment().startOf('week').add(7, 'days').format(DATEFORMAT);
    initChart();

    //Binding events to handle resizing
    window.addEventListener("resize", initChart);
    document.getElementsByClassName("nav-toggle")[0].addEventListener("click", function () { setTimeout(initChart, 300); });
}

function initChart() {
    //If chart exists destroy it
    if (chart !== null) {
        chart.destroy();
    }

    document.getElementById('sales-chart').outerHTML = '<canvas id="sales-chart"></canvas>';
    let canvas = document.getElementById('sales-chart');
    canvas.width = document.getElementsByClassName('sale-chart-container')[0].offsetWidth;

    chart = new Chart(canvas.getContext("2d"), {
        type: 'line',  
        data: {
            labels: [],
            datasets: []
        },
        options: {
          plugins:{
           legend: {
            display: true
           }
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                min: 0,
                stepSize: 1
              }
            }]
          }
        }
    });

    //Calls dateChanged to display data
    dateChanged();
}

function dateChanged() {
    //If no resturant is selected select one else updateDisplayedDataset
    if (restaurantTable.getSelectedRow() === null) {
        document.querySelector(".gyldne-table > tbody > tr").click();
    } else {
        updateDisplayedDataset(restaurantTable.getSelectedRow());
    }
}

//update displayed datases based on date and resturant
function updateDisplayedDataset(restaurant) {
    data = getDatasets();

    if (Object.keys(data).length === 0) {
        generateSales();
        data = getDatasets();
    }

    if (restaurant === null || data[restaurant.name] === undefined) {
        chart.data = {
            labels: [],
            datasets: []
        };
        saleTable.setSource([]);
        chart.update();

        return;
    }

    let newData = data[restaurant.name];

    if (newData !== undefined) {
        chart.data = newData["chart"];
        saleTable.setSource(newData["table"]);
        chart.update();
    }
}

//Generate dataset
function getDatasets() {
    let datasets = {};
    let restaurantSales = {};
    let fromDate = moment(document.getElementById("from-date").value, DATEFORMAT);
    let toDate = moment(document.getElementById("to-date").value, DATEFORMAT);

    for (let i = 0; i < backend.sales.length; i++) {
        let sale = backend.sales[i];

        if (restaurantSales[sale.restaurant] === undefined) {
            restaurantSales[sale.restaurant] = [];
        }

        let saleDate = moment(sale.date, DATEFORMAT);

        if (saleDate >= fromDate && saleDate <= toDate) {
            restaurantSales[sale.restaurant].push(sale);
        }
    }

    let restaurantSalesKeys = Object.keys(restaurantSales);
    for (let i = 0; i < restaurantSalesKeys.length; i++) {
        let restaurant = restaurantSalesKeys[i];
        let resturantSale = restaurantSales[restaurant]

        if (resturantSale.length > 0) {
            datasets[restaurant] = {};
            datasets[restaurant]["chart"] = getItemChartData(resturantSale);
            datasets[restaurant]["table"] = resturantSale;
        }
    }

    return datasets;
}

//Get days between from-to date
function getDays() {
    let days = [];
    let fromDate = moment(document.getElementById("from-date").value, DATEFORMAT);
    let toDate = moment(document.getElementById("to-date").value, DATEFORMAT);
    let numberOfDays = toDate.diff(fromDate, 'days') + 1;

    for (let i=0; i < numberOfDays; i++) {
        let newDay = fromDate.clone().add(i, 'days');

        days.push(newDay.format(DATEFORMAT)); 
    }

    return days;
}

//Generate and return item chart data
function getItemChartData(data) {
    let formattedData = {
      labels: [],
      datasets: [],
      usedColors: []
    };
    let datasetIndexes = {};
  
    formattedData.labels = getDays();

    data.forEach(sale => {
      date = moment(sale.date, DATEFORMAT).format(DATEFORMAT);
  
      sale.x = date;
      sale.y = sale.amount;

      if (datasetIndexes[sale.item] === undefined) {
          //Gets a random non used color
          let randomColor = getRandomColor(formattedData.usedColors);
          formattedData.usedColors.push(randomColor);
          datasetIndexes[sale.item] = formattedData.datasets.length;
          formattedData.datasets[datasetIndexes[sale.item]] = {
            label: sale.item,
            data: [],
            tension: 0.1,
            borderColor: randomColor,
            backgroundColor: randomColor
          };
      }

      formattedData.datasets[datasetIndexes[sale.item]].data.push(sale);
    });

    formattedData.datasets[0].data.sort(function (a, b) {
        return (moment(a.x, DATEFORMAT) > moment(b.x, DATEFORMAT)) ? 1 : -1;
    });
  
    return formattedData;
}

function getRandomColor(usedColors) {
    let pickedColor = null;
    const colorScheme = [
      "#25CCF7","#FD7272","#54a0ff","#00d2d3",
      "#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e",
      "#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50",
      "#f1c40f","#e67e22","#e74c3c","#ecf0f1","#95a5a6",
      "#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d",
      "#55efc4","#81ecec","#74b9ff","#a29bfe","#dfe6e9",
      "#00b894","#00cec9","#0984e3","#6c5ce7","#ffeaa7",
      "#fab1a0","#ff7675","#fd79a8","#fdcb6e","#e17055",
      "#d63031","#feca57","#5f27cd","#54a0ff","#01a3a4"
    ];
  
    for (let i = 0; i < colorScheme.length; i++) {
      var currentColor = colorScheme[i];
      
      if (usedColors.indexOf(currentColor) === -1) {
        return currentColor;
      }
    }
  
    return colorScheme[Math.floor(Math.random()*this.length)];
}

/*Callback functions for saletable*/
function addCallback() {
    updateModal({
        title: "Opprett salg",
        body: saleInputsHTML(),
        yes: addSale
    });
    bindModalEvents();
}

function deleteCallback() {
    updateModal({
        title: "Slett salg?",
        body: "<p>Er du sikker på at du vil slette dette salget?</p>",
        yes: deleteSale
    });
}

function editCallback() {
    updateModal({
        title: "Rediger salg?",
        body: saleInputsHTML(),
        yes: updateSale
    });

    let sale = saleTable.getSelectedRow();
    let resturant = getRestaurantByName(sale.restaurant);
    let menuItem = getMenuItemByName(sale.item);
    document.getElementById("sale-amount").value = sale.amount;
    document.getElementById("sale-item").value = backend.menu.indexOf(menuItem);
    document.getElementById("sale-price").value = sale.price;
    document.getElementById("sale-restaurant").value = backend.restaurants.indexOf(resturant);
    document.getElementById("sale-date").value = sale.date;
    bindModalEvents();
}

/*Functions to manage sales*/
function addSale() {
    let amount = parseInt(document.getElementById("sale-amount").value);
    let item = backend.menu[document.getElementById("sale-item").value].name;
    let price = parseInt(document.getElementById("sale-price").value);
    let restaurant = backend.restaurants[document.getElementById("sale-restaurant").value].name;
    let date = document.getElementById("sale-date").value;

    let saleIndex = getSaleIndexByItemRestaurantDate(item, restaurant, date);

    if (saleIndex === -1) {
        backend.sales.push({amount, item, price, restaurant, date});
    } else {
        backend.sales[saleIndex].amount += amount;
        backend.sales[saleIndex].item = item;
        backend.sales[saleIndex].price += price;
        backend.sales[saleIndex].restaurant = restaurant;
        backend.sales[saleIndex].date = date;
    }
    
    saveBackend();
    resetModal();
    updateDisplayedDataset(restaurantTable.getSelectedRow());
}

function updateSale() {
    let amount = parseInt(document.getElementById("sale-amount").value);
    let item = backend.menu[document.getElementById("sale-item").value].name;
    let price = parseInt(document.getElementById("sale-price").value);
    let restaurant = backend.restaurants[document.getElementById("sale-restaurant").value].name;
    let date = document.getElementById("sale-date").value;

    let sale = saleTable.getSelectedRow();
    let saleIndex = backend.sales.indexOf(sale);
    backend.sales[saleIndex].amount = amount;
    backend.sales[saleIndex].item = item;
    backend.sales[saleIndex].price = price;
    backend.sales[saleIndex].restaurant = restaurant;
    backend.sales[saleIndex].date = date;
    saveBackend();
    resetModal();
    updateDisplayedDataset(restaurantTable.getSelectedRow());
}

function deleteSale() {
    let sale = saleTable.getSelectedRow();
    let saleIndex = backend.sales.indexOf(sale);
    backend.sales.splice(saleIndex, 1);
    saveBackend();
    resetModal();
    updateDisplayedDataset(restaurantTable.getSelectedRow());
}

/*Functions for modal*/
function bindModalEvents() {
    let inputElements = document.querySelectorAll(".modal-body > .input-group > input");

    for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].onkeyup = validateModal;
    }

    new dtsel.DTS('#sale-date',  {
        direction: 'TOP',
        dateFormat: DATEFORMAT,
        showTime: false,
        timeFormat: "HH:MM:SS"
    });

    document.getElementById("sale-amount").onchange = modalCalculateTotal;
    document.getElementById("sale-item").onchange = modalCalculateTotal;

    modalCalculateTotal();
    validateModal();
}

function modalCalculateTotal(price) {
    let itemIndex = document.getElementById("sale-item").value;

    document.getElementById("sale-price").value = backend.menu[itemIndex].price * document.getElementById("sale-amount").value;
}

function validateModal() {
    let amount = document.getElementById("sale-amount").value;
    let item = document.getElementById("sale-item").value;
    let price = document.getElementById("sale-price").value;
    let restaurant = document.getElementById("sale-restaurant").value;
    let date = document.getElementById("sale-date").value;

    let yesElement = document.getElementById("modal-yes");

    if (amount && item && price && restaurant && date) {
        yesElement.disabled = false;
    } else {
        yesElement.disabled = true;
    }
}

function saleInputsHTML() {
    let html = '';

    html += '<div class="input-group">';
    html += '<label for="sale-amount">Antall</label>';
    html += '<input id="sale-amount" type="number" value="1">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="sale-item">Rett:</label>';
    html += '<select id="sale-item">';

    for (let i = 0; i < backend.menu.length; i++) {
        html += '<option value="' + i + '">' + backend.menu[i].name + '</option>';
    }

    html += '</select>';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="sale-price">Pris</label>';
    html += '<input id="sale-price" type="number" readonly>';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="sale-restaurant">Restaurant</label>';
    html += '<select id="sale-restaurant">';

    for (let i = 0; i < backend.restaurants.length; i++) {
        html += '<option value="' + i + '">' + backend.restaurants[i].name + '</option>';
    }

    html += '</select>';

    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="sale-date">Dato</label>';
    html += '<input id="sale-date" type="text" readonly="">';
    html += '</div>';

    return html;
}

/*Helper functions*/
function getSaleIndexByItemRestaurantDate(item, restaurant, date) {
    for (let i = 0; i < backend.sales.length; i++) {
        if (backend.sales[i].item === item && backend.sales[i].restaurant === restaurant && backend.sales[i].date === date) {
            return i;
        }
    }

    return -1;
}

function getRestaurantByName(name) {
    for (let i = 0; i < backend.restaurants.length; i++) {
        if (backend.restaurants[i].name === name) {
            return backend.restaurants[i];
        }
    }

    return null;
}

function getMenuItemByName(name) {
    for (let i = 0; i < backend.menu.length; i++) {
        if (backend.menu[i].name === name) {
            return backend.menu[i];
        }
    }

    return null;
}

function generateSales() {
    let days = getDays();

    days.forEach(date => {
        backend.restaurants.forEach(restaurant => {
            backend.menu.forEach(menuItem => {
                let amount = Math.floor(Math.random() * 20) + 1;
                let price = menuItem.price * amount;
                backend.sales.push({amount, item: menuItem.name, price, restaurant: restaurant.name, date})
            });
        });
    });

    saveBackend();
}