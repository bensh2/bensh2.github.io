import { Editor } from "./editor.js";

document.querySelector("#columns").value = JSON.stringify({ headword: "אנגלית", definition: "עברית", edit: "ערוך", delete: "מחק", confirm: "אישור" });
/*let checkboxes = document.querySelectorAll("input[type='checkbox']");
for (const checkbox of checkboxes)
    checkbox.checked = true;*/

document.querySelector("#create").addEventListener("click", () => { createTable() });

function getvalue(selector)
{
    let element = document.querySelector(selector);
    if (element.id == "columns")
        return JSON.parse(element.value);
    return element.checked;
}

function createTable()
{
    let editor = new Editor({
        element: "#datatable",
        header: getvalue("#header"),
        columnNames: getvalue("#columnnames") ? getvalue("#columns") : null,
        inline: getvalue("#inline"),
        edit: getvalue("#edit"),
        delete: getvalue("#delete"),
        select: getvalue("#select"),
        confirm: getvalue("#confirm"),
        sort: getvalue("#sort"),
        displayMode: getvalue("#displaymode"),
        rowNumber: getvalue("#rownumber"),
        pagination: getvalue("#pagination"),
        search: getvalue("#search"),
        editColumn: getvalue("#editcolumn"),
        deleteColumn: getvalue("#deletecolumn"),
        rowColumn: getvalue("#rowcolumn"),
    });

    let data = [ ["Wear","ללבוש"],["Forest","יער"],["Strange","מוזר"],["Keep","לשמור"],["Saw","ראה"],["Diary","יומן"],["Village","כפר"],
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

    editor.setData(data);

    document.querySelector("#getdata").replaceWith(document.querySelector("#getdata").cloneNode(true));  // remove all event listeners
    
    document.querySelector("#getdata").addEventListener("click", () => {
        console.log(editor.getData());
    });

}