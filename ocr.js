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
    processfile(file);
    document.getElementById("fileElem").value = null;
}

async function processfile(file)
{
    document.getElementById("wait").style.display = "block";
    let langs = [];
    if (document.getElementById("eng").checked)
        langs.push("eng");
    if (document.getElementById("heb").checked)
        langs.push("heb");
    const worker = await Tesseract.createWorker(langs);
    /*await worker.setParameters({
        preserve_interword_spaces: '1',
      });*/

    const result = await worker.recognize(file);
    document.getElementById("wait").style.display = "none";
    console.log(result);
    let text = String(result.data.text);
    text = text.replaceAll("\n", "<br>");
    document.getElementById("result").innerHTML = text;
    document.getElementById("result").style.display = "block";
    await worker.terminate();
}
