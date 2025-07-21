window.addEventListener("load", initEmployees);
var table = null;

/*Function to init employees page*/
function initEmployees() {
    table = new gyldneTable({
        element: document.getElementsByClassName("gyldne-table-container")[0],
        source: backend.employees,
        columns: [
            {
                title: "Tittel",
                property: "title"
            },
            {
                title: "Navn",
                property: "name",
                render: function (data) {
                    return '<i class="fas fa-' + (data.gender === GENDER.male ? 'mars' : 'venus') + '"></i> ' + data.name;
                }
            },
            {
                title: "Adresse",
                property: "address"
            },
            {
                title: "Tlf",
                property: "phoneNumber"
            },
            {
                title: "E-post",
                property: "email"
            },
            {
                title: "AnsattDato",
                property: "employedDate"
            },
            {
                title: "Bursdag",
                property: "birthday"
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

/*Employees table callback functions*/
function addCallback() {
    updateModal({
        title: "Legg til arbeidstaker",
        body: employeeInputsHTML(),
        yes: addEmployee
    });
    bindModalEvents();
}

function deleteCallback() {
    updateModal({
        title: "Slett arbeidstaker?",
        body: "<p>Er du sikker på at du vil slette denne arbeidstakeren?</p>",
        yes: deleteEmployee
    });
}

function editCallback() {
    updateModal({
        title: "Rediger arbeidstaker?",
        body: employeeInputsHTML(),
        yes: updateEmployee
    });

    let employee = table.getSelectedRow();
    document.getElementById("employee-title").value = employee.title;
    document.getElementById("employee-gender").value = employee.gender;
    document.getElementById("employee-name").value = employee.name;
    document.getElementById("employee-address").value = employee.address;
    document.getElementById("employee-phonenumber").value = employee.phoneNumber;
    document.getElementById("employee-email").value = employee.email;
    document.getElementById("employee-employeddate").value = employee.employedDate;
    document.getElementById("employee-birthday").value = employee.birthday;
    bindModalEvents();
}

/*Functions to manage emplyoees backend*/
function addEmployee() {
    let title = document.getElementById("employee-title").value;
    let gender = document.getElementById("employee-gender").value;
    let name = document.getElementById("employee-name").value;
    let address = document.getElementById("employee-address").value;
    let phoneNumber = document.getElementById("employee-phonenumber").value;
    let email = document.getElementById("employee-email").value;
    let employedDate = document.getElementById("employee-employeddate").value;
    let birthday = document.getElementById("employee-birthday").value;

    backend.employees.push({title, gender, name, address, phoneNumber, email, employedDate, birthday});
    saveBackend();
    resetModal();
    table.renderTable();
}

function updateEmployee() {
    let title = document.getElementById("employee-title").value;
    let gender = document.getElementById("employee-gender").value;
    let name = document.getElementById("employee-name").value;
    let address = document.getElementById("employee-address").value;
    let phoneNumber = document.getElementById("employee-phonenumber").value;
    let email = document.getElementById("employee-email").value;
    let employedDate = document.getElementById("employee-employeddate").value;
    let birthday = document.getElementById("employee-birthday").value;

    let employee = table.getSelectedRow();
    let employeeIndex = backend.employees.indexOf(employee);
    backend.employees[employeeIndex].title = title;
    backend.employees[employeeIndex].gender = gender;
    backend.employees[employeeIndex].name = name;
    backend.employees[employeeIndex].address = address;
    backend.employees[employeeIndex].phoneNumber = phoneNumber;
    backend.employees[employeeIndex].email = email;
    backend.employees[employeeIndex].employedDate = employedDate;
    backend.employees[employeeIndex].birthday = birthday;
    saveBackend();
    resetModal();
    table.renderTable();
}

function deleteEmployee() {
    let employee = table.getSelectedRow();
    let employeeIndex = backend.employees.indexOf(employee);
    backend.employees.splice(employeeIndex, 1);
    saveBackend();
    resetModal();
    table.renderTable();
}

/*Modal functions*/
function bindModalEvents() {
    let inputElements = document.querySelectorAll(".input-group-split > .input-group > input");

    for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].onkeyup = validateModal;
    }

    new dtsel.DTS('#employee-employeddate',  {
        direction: 'BOTTOM',
        dateFormat: DATEFORMAT,
        showTime: false,
        timeFormat: "HH:MM:SS"
    });
    new dtsel.DTS('#employee-birthday',  {
        direction: 'BOTTOM',
        dateFormat: DATEFORMAT,
        showTime: false,
        timeFormat: "HH:MM:SS"
    });
    validateModal();
}

function validateModal() {
    let title = document.getElementById("employee-title").value;
    let gender = document.getElementById("employee-gender").value;
    let name = document.getElementById("employee-name").value;
    let address = document.getElementById("employee-address").value;
    let phoneNumber = document.getElementById("employee-phonenumber").value;
    let email = document.getElementById("employee-email").value;
    let employedDate = document.getElementById("employee-employeddate").value;
    let birthday = document.getElementById("employee-birthday").value;

    let yesElement = document.getElementById("modal-yes");

    if (title && gender && name && address && phoneNumber && email && employedDate && birthday) {
        yesElement.disabled = false;
    } else {
        yesElement.disabled = true;
    }
}

function employeeInputsHTML() {
    let html = '';

    html += '<div class="input-group-split-wrapper">';
    html += '<div class="input-group-split">';

    html += '<div class="input-group">';
    html += '<label for="employee-name">Navn</label>';
    html += '<input id="employee-name" type="text">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="employee-address">Adresse</label>';
    html += '<input id="employee-address" type="text">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="employee-phonenumber">Tlf</label>';
    html += '<input id="employee-phonenumber" type="text">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="employee-email">E-post</label>';
    html += '<input id="employee-email" type="text">';
    html += '</div>';

    html += '</div>';

    html += '<div class="input-group-split">';

    html += '<div class="input-group">';
    html += '<label for="employee-gender">Kjønn</label>';
    html += '<select id="employee-gender">';
    html += '<option value="male" selected>Mann</option>'
    html += '<option value="female">Dame</option>'
    html += '</select>';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="employee-title">Tittel</label>';
    html += '<select id="employee-title">';
    html += '<option>Hoved kokk</option>'
    html += '<option>Kokk</option>'
    html += '<option selected>Leveringsperson</option>'
    html += '</select>';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="employee-employeddate">AnsattDato</label>';
    html += '<input id="employee-employeddate" type="text" readonly="">';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label for="employee-birthday">Bursdag</label>';
    html += '<input id="employee-birthday" type="text" readonly="">';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    return html;
}