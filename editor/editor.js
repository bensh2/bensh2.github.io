export class Editor {
    #table;
    #tableid;
    #columns;
    #buttons;
    #data;

    constructor(config)
    {
        this.#tableid = config.tableid ?? "editor";
        config.columnNames = config.columnNames ?? [];
        this.#initialize(config);
        this.#createHtml(config)
        this.#createTable(config);
    }

    #initialize(config)
    {
        let columnId = 0;
        this.#buttons = {};
        this.#columns = [{ field: "id", visible: false }];

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

        if (config.rowNumber)
            this.#columns.push({
                title: config.columnNames[columnId++],
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
                    return "<div contenteditable='plaintext-only'>" + value + "</div>";
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
                    return "<div contenteditable='plaintext-only'>" + value + "</div>";
                } : null
            });

        if (config.edit)
        {
            this.#columns.push(
            {
                title: config.columnNames["edit"] ?? "",
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

            /*this.#buttons['btnAdd'] = {
                  text: '',
                  icon: 'bi-plus-lg',
                  event () {
                    alert('Add row')
                  },
                  attributes: {
                    title: ''
                  }
            };*/
        }
        if (config.delete)
            this.#columns.push(
            {
                title: config.columnNames['delete'] ?? "",
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

        let that = this;
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
        
    }

    #createHtml(config)
    {
        if (config.direction)
            $(config.element).css("direction", config.direction);

        $(config.element).html(`<div id="buttontoolbar"></div><table class="table" id="${this.#tableid}"></table>`);
        this.#table = $(`#${this.#tableid}`);
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
    
    toggle()
    {
        this.#table.bootstrapTable('toggleView')
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
            buttonsToolbar: "#buttontoolbar",
            columns: this.#columns,
            
        };

        this.#table.bootstrapTable(parameters);

        //$("div.search.btn-group").css("float", (config.direction == "rtl") ? "left" : "right");

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
                    //console.log(`Update row ${uniqueid} column ${column} to "${content}"`);
                });
            });

        }
    }
}