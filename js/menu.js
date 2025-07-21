window.addEventListener("load", initMenu);
var table = null;

/*Function to init menu page*/
function initMenu() {
    table = new gyldneTable({
        element: document.getElementsByClassName("gyldne-table-container")[0],
        source: backend.menu,
        columns: [
            {
                title: "Navn",
                property: "name",
                render: function (data) {
                    return '<i class="fas fa-' + (data.type === MENUTYPE.food ? 'utensils' : 'coffee') + '"></i> ' + data.name;
                }
            },
            {
                title: "Beskrivelse",
                property: "description"
            },
            {
                title: "Pris",
                property: "price"
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

/*Menu callback functions*/
function addCallback() {
    updateModal({
        title: "Legg til meny rett",
        body: menuInputsHTML(),
        yes: addMenuItem
    });
    bindModalEvents();
}

function deleteCallback() {
    updateModal({
        title: "Slett meny rett?",
        body: "<p>Er du sikker på at du vil slette denne meny retten?</p>",
        yes: deleteMenuItem
    });
}

function editCallback() {
    updateModal({
        title: "Rediger meny rett?",
        body: menuInputsHTML(),
        yes: updateMenuItem
    });

    let menuItem = table.getSelectedRow();
    document.getElementById("menu-type").value = menuItem.type;
    document.getElementById("menu-name").value = menuItem.name;
    document.getElementById("menu-description").value = menuItem.description;
    document.getElementById("menu-price").value = menuItem.price;
    bindModalEvents();
}

/*Functions to manage menu backend*/
function addMenuItem() {
    let type = document.getElementById("menu-type").value;
    let name = document.getElementById("menu-name").value;
    let description = document.getElementById("menu-description").value;
    let price = document.getElementById("menu-price").value;

    backend.menu.push({type, name, description, price});
    saveBackend();
    resetModal();
    table.renderTable();
}

function updateMenuItem() {
    let type = document.getElementById("menu-type").value;
    let name = document.getElementById("menu-name").value;
    let description = document.getElementById("menu-description").value;
    let price = document.getElementById("menu-price").value;

    let menuItem = table.getSelectedRow();
    let menuItemIndex = backend.menu.indexOf(menuItem);
    backend.menu[menuItemIndex].type = type;
    backend.menu[menuItemIndex].name = name;
    backend.menu[menuItemIndex].description = description;
    backend.menu[menuItemIndex].price = price;
    saveBackend();
    resetModal();
    table.renderTable();
}

function deleteMenuItem() {
    let menuItem = table.getSelectedRow();
    let menuIndex = backend.menu.indexOf(menuItem);
    backend.menu.splice(menuIndex, 1);
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
    let type = document.getElementById("menu-type").value;
    let name = document.getElementById("menu-name").value;
    let description = document.getElementById("menu-description").value;
    let price = document.getElementById("menu-price").value;

    let yesElement = document.getElementById("modal-yes");

    if (type && name && description && price) {
        yesElement.disabled = false;
    } else {
        yesElement.disabled = true;
    }
}

function menuInputsHTML() {
    let html = '';

    html += '<div class="input-group">';
    html += '<label for="menu-type">Type</label>';
    html += '<select id="menu-type"><option value="food" selected>Mat</option><option value="beverage">Drikke</option></select>';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="menu-name">Navn</label>';
    html += '<input id="menu-name" type="text">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="menu-description">Beskrivelse</label>';
    html += '<input id="menu-description" type="text">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="menu-price">Pris</label>';
    html += '<input id="menu-price" type="number">';
    html += '</div>';

    return html;
}