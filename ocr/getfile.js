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

