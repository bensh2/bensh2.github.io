// basic ocr

async function processocr(file)
{
    document.getElementById("wait").style.display = "block";
    let langs = [];
    if (document.getElementById("eng").checked)
        langs.push("eng");
    if (document.getElementById("heb").checked)
        langs.push("heb");
    const worker = await Tesseract.createWorker(langs);
    await worker.setParameters({
        //tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxtzABCDEFGHIJKLMNOPQRSTUVWXYZ -,אבגדהוזחטיכלמנסעפצקרשתןםץךף',
      });

    const result = await worker.recognize(file);
    document.getElementById("wait").style.display = "none";
    console.log(result);
    let text = String(result.data.text);
    text = text.replaceAll("\n", "<br>");
    document.getElementById("result").innerHTML = text;
    document.getElementById("result").style.display = "block";
    await worker.terminate();
}
