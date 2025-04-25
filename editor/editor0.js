
appLoad(["https://cdn.jsdelivr.net/npm/bootstrap-table@1.24.0/dist/bootstrap-table.min.js"]).then ( () => runEditor() );

function runEditor()
{

    $table = $('#editor');
    //window.buttons = 

    $table.bootstrapTable({
        classes: "table",
        maintainMetaData: true,
        uniqueId: "id",
        pagination: true,
        pageSize: 10,
        pageNumber: 1,
        paginationParts: ['pageList'],
        //headerStyle: function() { return { css: { 'display': 'none' } } },

        buttonsToolbar: ".buttons-toolbar",
        formatSearch: function() { return "חיפוש" },
        formatNoMatches: function () {
            return 'הרשימה ריקה';
        },
        formatLoadingMessage: function () {
            return 'הנתונים בטעינה';
        },
        showButtonText: true,
        buttons: () => ({
            btnAdd: {
              text: 'הוסף ערך',
              icon: 'bi-plus-lg',
              event () {
                alert('Do some stuff to e.g. add a new row')
              },
              attributes: {
                title: 'Add a new row to the table'
              }
            }
          }),
          search: true,
          searchAlign: "left",
          buttonsToolbar: "#buttontoolbar",
        columns: [
        { field: "id", visible: false },
        {
            title: "הכל",
            field: "selected",
            checkbox: true
        },
        {
            title: "מחק",
            field: "delete",
            width: "5",
            widthUnit: "%",
            halign: "center",
            formatter: function(value, row, index, field)
            {
            return `<i class="bi bi-trash delete"></i>`;
            }
        },
        {
            title: "ערוך",
            field: "edit",
            width: "5",
            widthUnit: "%",
            halign: "center",
            formatter: function(value, row, index, field)
            {
            return `<i class="bi bi-pencil edit"></i>`;
            }
        },
        {
            title: 'פירושים נוספים',
            field: 'moredef',
            /*width: "34",
            widthUnit: "%",*/
            class: "tablecell hide-xs"
        },
        {
            title: 'עברית',
            field: 'def',
            width: "28",  // setting this width causes shifts when switching pages
            widthUnit: "%",
            class: "tablecell",
            sortable: true
        },
        {
            title: 'אנגלית',
            field: 'headword',
            halign: 'left',
            align: 'left',
            width: "28",
            widthUnit: "%",
            class: "tablecell",
            sortable: true
        }
        ]
        
    });
    let rawdata = [ ["Wear","ללבוש"],["Forest","יער"],["Strange","מוזר"],["Keep","לשמור"],["Saw","ראה"],["Diary","יומן"],["Village","כפר"],
    ["Life","חיים"],["Movie","סרט"],["Often","לעתים קרובות"],["Never","לעולם לא"],["Different","שונה"],["Stories","סיפורים"],["Afraid","חושש"],
    ["Also","גם"],["Too","גם"],["Enjoy","תהנה"],["Character","אופי"],["Once upon a time","היה היה"],["Plot","עלילה"],["Villain","נבל"],
    ["Fairy tales","אגדות"],["Tail","זנב"],["Tale","מעשיה"],["Real","אמיתי"],["Ending","סיום"],["Happpen","יקרה"],["Hero","גיבור"],["Catch","לתפוס"],
    ["So","כך"],["Find","למצוא"],["Forget","לשכוח"],["Smile","חיוך"],["Tell","לספר"],["Stay","שהות"],["Flower","פרח"],["Early","מוקדם"],["Late","מאוחר"],
    ["Outside","בחוץ"],["Inside","בתוך"],["Safe","בטוח"],["Dangerous","מסוכן"],["Quickly","במהירות"],["Duck","ברווז"],["Listen","להקשיב"],["Garden","גינה"],
    ["Near","ליד"],["Magic","קסם"],["City","עיר"],["Problem","בעיה"],["Cover","לכסות"],["Wish","בקשה"],["Review","סקירה"],["Writer","סופר"],
    ["Recommend","להמליץ"],["Boring","משעמם"],["Scary","מפחיד"],["Detective","בלש"],["Adventure","הרפתקה"],["Kind of","מעין"],["Young","צעיר"],
    ["Beautiful","יפה"],["Brave","אמיץ"],["Kind","סוג"],["Strong","חזק"],["Ugly","מכוער"],["Warm","חם"],["Cool","להתקרר"],["Round","עגול"],
    ["Dirty","מלוכלך"],["Memory","זכרון"],["Page","עמוד"],["Practice","תרגול"],["Remember","לזכור"],["Rule","כלל"],["Sentence","משפט"],["Spell","לאיית"],
    ["Together","יחד"],["Nurse","אחות"],["Driver","נהג"],["Waiter","מלצר"],["Ask","לשאול"],["At least","לפחות"],["Dictionary","מילון"],["Example","דוגמה"],
    ["Exercise","אימון"],["Meaning","משמעות"],["Wild","פראי"],["About","אודות"],["Wolf","זאב"],["Always","תמיד"],["Somtimes","לפעמים"],["Speak","לדבר"],
    ["Kill","להרוג"] ];
    let data = [];
    for (const item of rawdata)
    {
        let entry = { id: (data.length + 1), headword: item[0], def: item[1], moredef: "" };
        if (item[2])
            entry.more = item[2];
        data.push(entry);
    }

    data[0].moredef = "בננה, אפרסק, תות, תפוח, מלון, אבטיח, ענב, אגס";
    console.log(data);
    
    //$table.bootstrapTable({data: data});
    $table.on('click-cell.bs.table', function (event, field, value, row, $element) {
        console.log(row);
        console.log(`field=${field} value=${value}`);
        //console.log($element);
        if (field == "selected")
        {
        //console.log(`field=${field} value=${value}`);
        let row_index = $element.parent().attr("data-index");
        console.log(row_index);
        if (value == true)
            $table.bootstrapTable('uncheck', row_index);
        else
            $table.bootstrapTable('check', row_index);
        }
    });

    $table.on("click", (e) => {
        //console.log(e);
        let target = $(e.target);
        if (target.hasClass("edit"))
        {
            let tr = target.parent().parent();
            let uniqueid = $(tr).attr("data-uniqueid");
            //alert(`getRowByUniqueId: ${JSON.stringify($table.bootstrapTable('getRowByUniqueId', uniqueid))}`)
        }
        if (target.hasClass("delete"))
        {
            let tr = target.parent().parent();
            let uniqueid = $(tr).attr("data-uniqueid");
            console.log(uniqueid);
        }
    })

    /*$table.on('post-body.bs.table', function() {
        $(this).closest('.fixed-table-container').css('height', tableHeight + 'px');
    });*/

    $table.on("page-change.bs.table, post-body.bs.table", () => {
        console.log("page change");
    });

    $table.bootstrapTable('load', data);

    // set table height according to row height and page size
    updateTableHeight($table);

    $("table#editor thead th.bs-checkbox").on("click", function () {
        let el = $(this).find("input[type='checkbox']");
        if (el[0].checked)
        $table.bootstrapTable('uncheckAll');
        else
        $table.bootstrapTable('checkAll');
    });

    $("#test1").on("click", ()=> {
        alert(`getRowByUniqueId: ${JSON.stringify($table.bootstrapTable('getRowByUniqueId', 1))}`)
    });
}

function updateTableHeight($table)
{
    console.log($table);
    setTimeout( () => {
        let options = $table.bootstrapTable('getOptions');
        let pagesize = options.pageSize;
        if (!pagesize)
            return;
        //console.log(pagesize);
        let tr = $table.find('tr[data-index="0"] td');
        let rowheight = tr.outerHeight(true);
        let tblheight = rowheight * (pagesize + 1) * 1.05;
        if (tblheight != 0)
            $("div.fixed-table-container").css("height", tblheight + "px");

    }, 250);
}