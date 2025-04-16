// basic ocr

//import { parseContent } from "./contentParser.js";

document.addEventListener('DOMContentLoaded', ready);

function ready()
{
    const fileSelect = document.getElementById("fileSelect");
    const fileElem = document.getElementById("fileElem");

    fileSelect.addEventListener("click",  (e) => {
        if (fileElem) {
            fileElem.click();
        }
    }, false);

    fileElem.addEventListener("change", readfile, false);
}

function readfile()
{
    const file = document.getElementById("fileElem").files[0];
    if (!file) { return false };
    console.log(file);
    processocr(file);
    document.getElementById("fileElem").value = null;
}

function isEnglishAlphabetical(text) {
    /*
     * test() returns true if there's a match, and false otherwise.
     * space character is permitted to allow multi words
     */
    const pattern = /^[a-zA-Z\s]+$/;
    return pattern.test(text);
  }
  
  function isHebrewAlphabetical(text) {
    // test() returns true if there's a match, and false otherwise.
    // spaces character is permitted to allow multi words
    // It does not include  "Niqud" / vowel points / punctuation.
    const pattern = /^[\u05D0-\u05EA\s]+$/; // /[\u0590-\u05FF\s]+$/;     // /^[\u05D0-\u05EA\s]+$/;
    return pattern.test(text);
  }

async function processocr(file)
{
    document.getElementById("wait").style.display = "block";
    let langs = ["eng", "heb"];
    let heb = false;
    if (document.getElementById("heb").checked)
        heb = true;
    const worker = await Tesseract.createWorker(langs);
    await worker.setParameters({
        //tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxtzABCDEFGHIJKLMNOPQRSTUVWXYZ -,אבגדהוזחטיכלמנסעפצקרשתןםץךף',
      });

    const result = await worker.recognize(file);
    document.getElementById("wait").style.display = "none";
    console.log(result);
    let lines = result.data.lines;
    let list = [];
    for (const line of lines)
    {
        let engword = "";
        let hebword = "";
        for (const word of line.words)
        {
            word.text = word.text.replaceAll(/[\u200F\u200E]/g, "");  // remove LTR & RTL marks

            if (isEnglishAlphabetical(word.text))
                engword += word.text + " ";

            if (isHebrewAlphabetical(word.text) /*|| word.language == "heb"*/)
                hebword += word.text + " ";
        }
        engword = engword.trim();
        hebword = hebword.trim();
        if (engword != "")
        {
            list.push([engword, hebword]);
        }
    }

    
    document.getElementById("result").style.display = "block";
    await worker.terminate();

    let html = "<table border=1>";
    for (const item of list)
    {
        html += "<tr><td>" + item[0] + "</td>";
        if (heb)
            html += "<td>" + item[1] + "</td>";
        html += "</tr>";
    }
    html += "</table>";

    html += "<br><br>Unprocessed data:<pre>" + result.data.text + "</pre>";

    document.getElementById("result").innerHTML = html;
}
