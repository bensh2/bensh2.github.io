// basic ocr

//import { parseContent } from "./contentParser.js";
import * as ocr from "./ocr.js";

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

function getparameters()
{
    let data = document.getElementById("parameters").value;
    let lines = String(data).split("\n");
    let parameters = [];
    for (const line of lines)
    {
        let split = line.split("=");
        if (split.length == 2)
        {
            parameters.push([split[0],split[1]]);
        }
    }
    //console.log(parameters);
    return parameters;
}

async function processocr(file)
{
    document.getElementById("wait").style.display = "block";

    let heb = false;
    if (document.getElementById("heb").checked)
        heb = true;
    /*if (document.getElementById("eng").checked && !heb)
        langs = ["eng"];*/

    const list = await ocr.extract(file, 
        { lang1: "eng", 
        lang2: "heb",
        lang1validate: isEnglishAlphabetical,
        lang2validate: isHebrewAlphabetical,
        //useocrlang: true,
        log: true,
        progress: (p) => { document.getElementById("wait").innerHTML = Math.round(p*100) }
    });

    document.getElementById("wait").style.display = "none";

    document.getElementById("result").style.display = "block";

    let html = "<table border=1>";
    for (const item of list)
    {
        html += "<tr><td>" + item[0] + "</td>";
        if (heb)
            html += "<td>" + item[1] + "</td>";
        html += "</tr>";
    }
    html += "</table>";

    //html += "<br><br>Unprocessed data:<pre>" + result.data.text + "</pre>";

    document.getElementById("result").innerHTML = html;
}
