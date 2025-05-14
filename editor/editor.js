export class Editor {
    #config;
    #table;
    #tableid;
    #columns;
    #buttons;
    #data;
    #inlinemode;
    #updatecallback;
    #updatedelay;
    #updatetimeout;
    #statebuttons;

    constructor(config)
    {
        this.#config = config;
        this.#inlinemode = false;
        this.#tableid = config.tableid ?? "editor";
        this.#updatecallback = config.updateCallback ?? null;
        this.#updatedelay = 1000;
        this.#updatetimeout = null;
        this.#config.columnNames = config.columnNames ?? [];
        this.#initialize(config);
        this.#createHtml(config)
        this.#createTable(config);
    }

    #initialize(config)
    {
        let columnId = 0;
        this.#buttons = {};
        this.#columns = [{ field: "id", visible: false }];
        let that = this;

        if (config.select)
            this.#columns.push(
            {
                title: config.columnNames['select'] ?? "",
                field: "selected",
                width: "3",
                widthUnit: "%",
                checkbox: true,
                class: Object.keys(config.columnNames).length > 0 ? "" : "nopadding"  // remove padding for checkbox when column names are empty
            });

        if (config.rowNumber || config.rowColumn)
            this.#columns.push({
                title: config.columnNames[columnId++],
                visible: config.rowNumber,
                field: "rownumber",
                width: "5",
                widthUnit: "%",
                /*halign: "center",
                class: "aligncenter",*/
                formatter: function(value, row, index, field)
                {
                    let rownumber = index + 1;
                    return `${rownumber}.`;
                }
            });

        this.#columns.push(
            {
                title: config.columnNames['headword'] ?? "",
                field: 'headword',
                halign: 'left',
                align: 'left',
                width: "28",
                widthUnit: "%",
                class: "tablecell headword",
                sortable: config.sort ?? false,
                formatter: config.inline ? (value, row) => {
                    if (that.#inlinemode)
                        return "<div contenteditable='plaintext-only'>" + value + "</div>";
                    else
                        return value;
                } : null
            });
        this.#columns.push(
            {
                title: config.columnNames['definition'] ?? "",
                field: 'def',
                width: "28",  // setting this width causes shifts when switching pages
                widthUnit: "%",
                class: "tablecell def",
                sortable: config.sort ?? false,
                formatter: config.inline ? (value, row) => {
                    if (that.#inlinemode)
                        return "<div contenteditable='plaintext-only'>" + value + "</div>";
                    else
                        return value;
                } : null
            });

        if (config.edit || config.editColumn)
        {
            this.#columns.push(
            {
                title: config.columnNames["edit"] ?? "",
                visible: config.edit,
                field: "edit",
                width: "4",
                widthUnit: "%",
                halign: "center",
                class: "aligncenter",
                formatter: function(value, row, index, field)
                {
                    return `<i class="bi bi-pencil edit"></i>`;
                }
            });
        }

        if (config.delete || config.deleteColumn)
            this.#columns.push(
            {
                title: config.columnNames['delete'] ?? "",
                visible: config.delete,
                field: "delete",
                width: "4",
                widthUnit: "%",
                halign: "center",
                class: "aligncenter",
                formatter: function(value, row, index, field)
                {
                    return `<i class="bi bi-trash delete"></i>`;
                }
            });

        if (config.confirm)
            this.#columns.push(
            {
                title: config.columnNames['confirm'] ?? "",
                field: "",
                width: "4",
                widthUnit: "%",
                halign: "center",
                class: "aligncenter",
                formatter: function(value, row, index, field)
                {
                    return `<i class="bi bi-check2-square confirm"></i>`;
                }
            });

        if (config.displayMode)
            this.#buttons['btnDisplay'] = {
            text: '',
            icon: 'bi-grid',
            event () {
                that.toggle();
            },
            attributes: {
                title: ''
            }
        };

        /*if (config.rowColumn)
            this.#buttons['btnRow'] = {
                text: '',
                icon: 'bi-list-ol',
                event () {
                    that.columnMode("rownumber");
                },
                attributes: {
                  title: '',
                  class: 'rowColumn'
                }
            };

        if (config.editColumn)
            this.#buttons['btnEdit'] = {
                text: '',
                icon: 'bi-pencil',
                event () {
                    that.columnMode("edit");
                },
                attributes: {
                  title: '',
                  class: 'editColumn'
                }
            };

        if (config.deleteColumn)
            this.#buttons['btnDelete'] = {
                text: '',
                icon: 'bi-trash',
                event () {
                    that.columnMode("delete");
                },
                attributes: {
                    title: '',
                    class: 'deleteColumn'
                }
            };*/
        this.#statebuttons = [];
        if (config.rowColumn)
            this.#statebuttons.push({ name: "Display", column: "rownumber", id: "btnDisplay", icon: "bi-list-ol", 
                help: "Total <span id='totalitems'></span> items",
                event: () => { that.columnMode("rownumber") } });
        if (config.editColumn)
            this.#statebuttons.push({ name: "Edit", column: "edit", id: "btnEdit", icon: "bi-pencil", 
                help: "Click on cell to edit",
                event: () => { that.columnMode("edit") } });
        if (config.deleteColumn)
            this.#statebuttons.push({ name: "Delete", column: "delete", id: "btnDelete", icon: "bi-trash", 
                help: "Click on Delete icon to delete item",
                event: () => { that.columnMode("delete") } });
        
    }

    #createHtml(config)
    {
        if (config.direction)
            $(config.element).css("direction", config.direction);

        $(config.element).html(`<div id="tabletoolbar"></div>
            <table class="table" id="${this.#tableid}"></table>`);
        this.#table = $(`#${this.#tableid}`);

        if (this.#statebuttons.length > 0)
        {
            $(`#tabletoolbar`).append(`<div class="row"><div class="col"><div class="btn-group" role="group" aria-label="Editor state buttons Display Edit Delete"></div></div></div>
                `);
            let checked = "checked";
            for (const button of this.#statebuttons)
            {
                $(`#tabletoolbar .btn-group`).append(`<input type="radio" class="btn-check" name="statebtnradio" id="${button.id}" autocomplete="off" ${checked}>
                  <label class="btn btn-outline-secondary" for="${button.id}">${button.name} <i class="bi ${button.icon}"></i></label>`);
                $(`#${button.id}`).on("click", button.event);
                checked = ""; // only first button is checked
            }
        }

        this.#deleteModal();
    }

    #deleteModal()
    {
        let html = `<div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5">Delete Item</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary confirm">Confirm</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                </div>
                </div>
            </div>
            </div>;`
        $(this.#config.element).append(html);
        $("#deleteModal .confirm").on("click", (e) => {
            const deletewindow = bootstrap.Modal.getInstance('#deleteModal');
            deletewindow.hide();
            if (!deletewindow.itemid)
                return;
            this.#deleteRow(deletewindow.itemid);
        });
    }

    setData(rawdata)
    {
        let data = [];
        for (const item of rawdata)
        {
            let entry = { id: (data.length + 1), headword: item[0], def: item[1], moredef: "" };
            if (item[2])
                entry.more = item[2];
            data.push(entry);
        }

        this.#data = data;
        this.#table.bootstrapTable('load', this.#data);  // bootstrap-table uses this internally
        this.updateTotalItems();
    }

    getData()
    {
        let rows = this.#data; // this returns all data even when user filters it //this.#table.bootstrapTable('getData');
        let data = [];
        for (const row of rows)
        {
            data.push([row.headword, row.def]);
        }
        return data;
    }

    getTotal()
    {
        if (this.#data)
            return Object.keys(this.#data).length;
        return 0;
    }

    updateTotalItems()
    {
        $("#totalitems").text(this.getTotal());
    }

    updateCell(id, column, value)
    {
        for (let row of this.#data)  // this will update bootstrap table internally
        {
            if (row.id == id)
            {
                row[column] = value;
                break;
            }
        }
    }

    #deleteRow(uniqueid) 
    {
        /*let row_index = this.#table.bootstrapTable('getData').findIndex((item) => item.id == parseInt(uniqueid));
        if (row_index == -1)
            return;
        this.#table.bootstrapTable('remove', {
            field: 'id',
            values: [parseInt(uniqueid)]
        });*/
        this.#table.bootstrapTable('removeByUniqueId', uniqueid);

        this.updateTotalItems();
        this.#invokeUpdateCallback();
    }
    
    toggle()
    {
        this.#table.bootstrapTable('toggleView')
    }

    columnMode(column)
    {
        const columns = ["rownumber", "delete"];

        if (!this.#config.inline)  // without inline editing, show the edit column
            columns.push("edit");

        for (const colname of columns)
        {
            if (colname == column)
                this.#table.bootstrapTable('showColumn', colname);
            else
                this.#table.bootstrapTable('hideColumn', colname);
        }

        if (this.#config.inline)  // user clicked state control button "edit" and table inline parameter is true
        {
            this.#inlinemode = (column == "edit") ? true : false; // toggle inline mode
            
            this.#table.bootstrapTable('hideColumn', "headword"); // this will refresh the cells and the formatting, switching the inline editing on/off
            this.#table.bootstrapTable('showColumn', "headword");
        }

        // toggle button help
        
        for (const b of this.#statebuttons)
        {
            let card = $(`#collapse_${b.column}`);//new bootstrap.Collapse(`#collapse_${b.column}`, { toggle: false });  //$(`#collapse_${b.column}`);
            if (b.column == column)
                card.show();
            else
                card.hide();
        }

    }

    #createTable(config)
    {
        let headerStyle = function() { return { css: { 'display': 'none' } } };
        //if (Object.keys(config.columnNames).length > 0)
        if (config.header)
            headerStyle = null;

        let parameters = {
            classes: "table",
            maintainMetaData: true,
            uniqueId: "id",
            pagination: config.pagination ?? false,
            pageSize: config.paginationSize ?? 10,
            pageNumber: 1,
            paginationParts: ['pageList'],
            headerStyle: headerStyle,
            buttons: () => ( this.#buttons ),
            formatSearch: function() { return "" },
            formatNoMatches: function () {
                return ''; // "List is empty"
            },
            formatLoadingMessage: function () {
                return ''; // "Loading data"
            },
            showButtonText: true,
            
            search: config.search ?? false,
            searchAlign: "left",
            //buttonsToolbar: "#buttontoolbar",
            toolbar: "#tabletoolbar",
            columns: this.#columns,
            
        };

        this.#table.bootstrapTable(parameters);

        $(".fixed-table-toolbar").after(`<div class="btnhelp"></div>`); // add help text for buttons only after table is created, to avoid respositioning
        for (const button of this.#statebuttons)
        {
            $(`.btnhelp`).append(`<div class="collapse" id="collapse_${button.column}">
            <div class="help">${button.help}</div></div>`);
        }
        
        //$("div.search.btn-group").css("float", (config.direction == "rtl") ? "left" : "right");

        if (this.#statebuttons.length > 0)
        {
            $("#" + this.#statebuttons[0].id).trigger("click");
        }

        this.#table.on('click-cell.bs.table', (event, field, value, row, $element) => {
            if (field == "selected")
            {
                let row_index = $element.parent().attr("data-index");
                //console.log(row_index);
                if (value == true)
                    this.#table.bootstrapTable('uncheck', row_index);
                else
                    this.#table.bootstrapTable('check', row_index);
            }
        });

        let that = this;
        if (config.inline)
        {
            this.#table.on('post-body.bs.table', function (number, size) {
        
                //console.log("post-body");

                $(`#${that.#tableid} div[contenteditable]`).on("input", (e) => {
                    //console.log(e);
                    let content = $(e.target).text();
                    let td = $(e.target).parent();
                    let column = null;
                    if (td.hasClass("headword"))
                        column = "headword";
                    else if (td.hasClass('def'))
                        column = "def";
                    else
                        console.error("Not found class headword/def in inline parent");

                    let tr = td.parent();
                    let uniqueid = tr.attr("data-uniqueid");
                    that.updateCell(uniqueid, column, content); // update internal data
                    that.#inlineUpdate();
                    //console.log(`Update row ${uniqueid} column ${column} to "${content}"`);
                });
            });
        }

        this.#table.on('post-body.bs.table', function (number, size) {
            $(`#${that.#tableid} td i.delete`).on("click", (e) => {
                const deletewindow = new bootstrap.Modal('#deleteModal', { keyboard: false });

                document.querySelector("#deleteModal").addEventListener('hide.bs.modal', () => {  
                    // prevent error message described here: https://github.com/twbs/bootstrap/issues/41005
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }
                });

                deletewindow.show();

                let itemid = $(e.target).parent().parent().attr("data-uniqueid");
                deletewindow.itemid = itemid;
            });
        });
    }

    #invokeUpdateCallback()
    {
        if (this.#updatecallback)
        {
            this.#updatecallback(this.getData());
        }
    }

    #inlineUpdate() // invoke user update callback with delay
    {
        if (this.#updatetimeout)
            clearTimeout(this.#updatetimeout);

        this.#updatetimeout = setTimeout( () => {
            this.#invokeUpdateCallback();
        }, this.#updatedelay);
    }
}