function gyldneTable(settings) {
    /*Sets settings*/
    this.element = settings.element;
    this.source = settings.source;
    this.columns = settings.columns;
    this.callbacks = settings.callbacks;
    this.filterData = this.source;
    this.filterText = "";
    this.toolbar = settings.toolbar;

    //Function to set new source
    this.setSource = function (source) {
        this.source = source;
        this.filterData = this.source;
        this.renderTable();
    }

    //Function to render/re-render the whole div including table
    this.render = function () {
        let html = this.toolbarHTML();
        html += this.tableHTML();

        this.element.innerHTML = html;
        this.bindEvents();
        this.validate();
    }

    //Function to render/re-render table only
    this.renderTable = function() {
        this.element.children[1].outerHTML = this.tableHTML();
        this.bindRowEvents();
        this.validate();
    }

    //Function to filter source data based on filterText
    this.filter = function (filterText) {
        filterText = filterText.trim();
        if (filterText.length === 0) {
            this.filterData = this.source;
            this.renderTable();
            return;
        }

        this.filterData = [];
        this.filterText = filterText;

        this.source.forEach(data => {
            this.columns.forEach(column => {
                if (this.filterData.indexOf(data) === -1) {
                    if (data[column.property].toString().toLowerCase().indexOf(filterText.toLowerCase()) !== -1) {
                        this.filterData.push(data);
                    }
                }
            })
        });

        this.renderTable();
    }

    //Function to bind events
    this.bindEvents = function () {
        let elements = this.getElements();

        if (elements.toolbar.filter !== null) {
            let context = this;
            let filterEvent = function () {
                context.filter(this.value);
            };

            elements.toolbar.filter.addEventListener("keyup", filterEvent);
        }
        
        if (elements.toolbar.add !== null) {
            elements.toolbar.add.onclick = this.callbacks.add;
        }
        
        if (elements.toolbar.delete !== null) {
            elements.toolbar.delete.onclick = this.callbacks.delete;
        }
        
        if (elements.toolbar.edit !== null) {
            elements.toolbar.edit.onclick = this.callbacks.edit;
        }

        this.bindRowEvents();
    }

    //Function to bind row events
    this.bindRowEvents = function () {
        let rows = this.element.children[1].children[1].children;
        let context = this;
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            
            row.onclick = function () {
                if (row.classList.contains("selected")) {
                    row.classList.remove('selected');
                } else {
                    for (let x = 0; x < rows.length; x++) {
                        rows[x].classList.remove('selected');
                    }

                    row.classList.add('selected');
                }
                
                context.validate();
                if (context.callbacks.selected !== undefined) {
                    context.callbacks.selected(context.getSelectedRow());
                }
            }
        }
    }

    //Functions to get the selected row data
    this.getSelectedRow = function () {
        let rows = this.element.children[1].children[1].children;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].classList.contains('selected')) {
                return this.source[rows[i].dataset["index"]];
            }
        }

        return null;
    }

    //Functions to get toolbar elements (filter, add, delete and edit)
    this.getElements = function () {
        let elements = {
            toolbar: {
                filter: null,
                add: null,
                delete: null,
                edit: null
            },
        };

        let toolbarElements = this.element.children[0].children;

        for (let i = 0; i < toolbarElements.length; i++) {
            elements.toolbar[toolbarElements[i].dataset["action"]] = toolbarElements[i];
        }

        elements.rows = this.element.children[1].children[1].children;

        return elements;
    }

    //Function to generate toolbar based on settings
    this.toolbarHTML = function () {
        let html = '<div class="gyldne-table-toolbar">';

        if (this.toolbar !== undefined) {
            if (this.booleanValue(this.toolbar.filter)) {
                html += '<input data-action="filter" type="text" placeholder="Filter...">';
            }
    
            if (this.booleanValue(this.toolbar.add)) {
                html += '<button data-action="add"><i class="fas fa-plus-square"></i> Legg til</button>';
            }
    
            if (this.booleanValue(this.toolbar.delete)) {
                html += '<button data-action="delete"><i class="fas fa-trash-alt"></i> Slett</button>';
            }
    
            if (this.booleanValue(this.toolbar.edit)) {
                html += '<button data-action="edit"><i class="fas fa-edit"></i> Rediger</button>';
            }
        }

        html += '</div>';

        return html;
    }

    //Function to generate table based on various settings
    this.tableHTML = function () {
        let html = '<table class="gyldne-table">';

        html += '<thead>';
        for (let i = 0; i < this.columns.length; i++) {
            html += '<th>' + this.columns[i].title + '</th>';
        }
        html += '</thead>';

        html += '<tbody>';
        for (let i = 0; i < this.filterData.length; i++) {
            html += '<tr data-index="' + this.source.indexOf(this.filterData[i]) + '">';

            for (let x = 0; x < this.columns.length; x++) {
                let currentColumn = this.columns[x];

                if (typeof currentColumn.render === "function") {
                    html += '<td>' + currentColumn.render(this.filterData[i]) + '</td>';
                } else {
                    html += '<td>' + this.filterData[i][currentColumn["property"]] + '</td>';
                }
            }

            html += '</tr>';
        }
        html += '</tbody>';
        html += '</table>';

        return html;
    }

    //Function to return true or false based on if value is undefined or bool value
    this.booleanValue = function (boolean) {
        return boolean !== undefined && boolean !== false;
    }

    //Function to validate current state (disable and enable toolbar elements based on if there is a row selected)
    this.validate = function () {
        if (this.toolbar === undefined) {
            return;
        }

        let selectedRow = this.getSelectedRow();
        let toolbarElements = this.getElements().toolbar;

        if (selectedRow !== null) {
            if (toolbarElements.delete !== null) {
                toolbarElements.delete.disabled = false;
            }
            
            if (toolbarElements.edit !== null) {
                toolbarElements.edit.disabled = false;
            }
        } else {
            if (toolbarElements.delete !== null) {
                toolbarElements.delete.disabled = true;
            }

            if (toolbarElements.edit !== null) {
                toolbarElements.edit.disabled = true;
            }
        }
    }

    //Render the whole div including table (Runs when the table is first init)
    this.render();
}