import { Editor } from "./editor.js";

createTable();

function createTable()
{
    let editor = new Editor({
        element: "#datatable",
        columnNames: ["", "אנגלית", "עברית", "ערוך", "מחק", "אישור", "הכל"],
        edit: true,
        delete: true,
        select: true,
        confirm: true,
        sort: true,
        displayMode: true,
        rowNumber: true,
        pagination: true,
        //paginationSize: 10,
        search: true,
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
    
    $("#getdata").on("click", () => {
        let data = editor.getData();
        console.log(data);
    }
    )
}