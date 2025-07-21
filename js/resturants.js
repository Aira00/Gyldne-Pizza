window.addEventListener("load", initRestaurants);
var table = null;

/*Function to init resturants page*/
function initRestaurants() {
    table = new gyldneTable({
        element: document.getElementsByClassName("gyldne-table-container")[0],
        source: backend.restaurants,
        columns: [
            {
                title: "Navn",
                property: "name",
                render: function (data) {
                    return '<i class="fas fa-store"></i> ' + data.name;
                }
            },
            {
                title: "Adresse",
                property: "address"
            },
            {
                title: "Åpningstider",
                property: "openingHours"
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
}

/*Restaurant callback functions*/
function addCallback() {
    updateModal({
        title: "Legg til restaurant",
        body: restaurantInputsHTML(),
        yes: addRestaurant
    });
    bindModalEvents();
}

function deleteCallback() {
    updateModal({
        title: "Slett restaurant?",
        body: "<p>Er du sikker på at du vil slette denne restauranten?</p>",
        yes: deleteRestaurant
    });
}

function editCallback() {
    updateModal({
        title: "Rediger restaurant?",
        body: restaurantInputsHTML(),
        yes: updateRestaurant
    });

    let restaurant = table.getSelectedRow();
    document.getElementById("restaurant-name").value = restaurant.name;
    document.getElementById("restaurant-address").value = restaurant.address;
    document.getElementById("restaurant-openinghours").value = restaurant.openingHours;
    bindModalEvents();
}

/*Functions to manage restaurants backend*/
function addRestaurant() {
    let name = document.getElementById("restaurant-name").value;
    let address = document.getElementById("restaurant-address").value;
    let openingHours = document.getElementById("restaurant-openinghours").value;

    backend.restaurants.push({name, address, openingHours});
    saveBackend();
    resetModal();
    table.renderTable();
}

function updateRestaurant() {
    let name = document.getElementById("restaurant-name").value;
    let address = document.getElementById("restaurant-address").value;
    let openingHours = document.getElementById("restaurant-openinghours").value;

    let restaurant = table.getSelectedRow();
    let restaurantIndex = backend.restaurants.indexOf(restaurant);
    backend.restaurants[restaurantIndex].name = name;
    backend.restaurants[restaurantIndex].address = address;
    backend.restaurants[restaurantIndex].openingHours = openingHours;
    saveBackend();
    resetModal();
    table.renderTable();
}

function deleteRestaurant() {
    let restaurant = table.getSelectedRow();
    let restaurantIndex = backend.restaurants.indexOf(restaurant);
    backend.restaurants.splice(restaurantIndex, 1);
    saveBackend();
    resetModal();
    table.renderTable();
}

/*Modal functions*/
function bindModalEvents() {
    let inputElements = document.querySelectorAll(".modal-body > .input-group > input");

    for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].onkeyup = validateModal;
    }

    validateModal();
}

function validateModal() {
    let name = document.getElementById("restaurant-name").value;
    let address = document.getElementById("restaurant-address").value;
    let openingHours = document.getElementById("restaurant-openinghours").value;

    let yesElement = document.getElementById("modal-yes");

    if (name && address && openingHours) {
        yesElement.disabled = false;
    } else {
        yesElement.disabled = true;
    }
}

function restaurantInputsHTML() {
    let html = '';

    html += '<div class="input-group">';
    html += '<label for="restaurant-name">Navn</label>';
    html += '<input id="restaurant-name" type="text">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="restaurant-name">Adresse</label>';
    html += '<input id="restaurant-address" type="text">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="restaurant-name">Åpningstider</label>';
    html += '<input id="restaurant-openinghours" type="text">';
    html += '</div>';

    return html;
}