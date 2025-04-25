import * as tesseract from "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js";

export { extract };

/* options:
    lang1: "eng",   // source language
    lang2: "heb",   // target language
    useocrlang: true,   // user tesseract language data to classify words
    lang1validate: isEnglishAlphabetical,  // optional, provide validation function for lang1
    lang2validate: isHebrewAlphabetical, // optional, provide validation function for lang2
    progress: callback_fn,  // optional, callback function indicating progress
    log: false  // log to console
*/

async function extract(image, options = {})
{
    if (!options.lang1 || !options.lang2)
        throw new Error("Missing language parameters");

    let languages = [options.lang1, options.lang2];

    let tess_options = { };
    if (options.progress)
        tess_options['logger'] = function (m) {
            if (m.status == "recognizing text")
                options.progress(m.progress);
        };


    const worker = await tesseract.default.createWorker(languages, 1, tess_options);
    const result = await worker.recognize(image);

    if (options.log)
        console.log(result);

    let lines = result.data.lines;
    let list = [];
    for (const line of lines)
    {
        let lang1_text = "";
        let lang2_text = "";
        for (const word of line.words)
        {
            word.text = word.text.replaceAll(/[\u200F\u200E]/g, "");  // remove LTR & RTL marks

            // extract lang1

            let valid = false;
            let ocrlang = options.useocrlang ?? false;

            if (options.lang1validate)      // if validation function is provided, use it to validate word
                valid = options.lang1validate(word.text) ? true : false;
            else
                valid = (word.language == options.lang1) ? true : false;  // otherwise, use ocr's language output to validate word

            if (ocrlang && options.lang1validate)       // perform additional validation using ocr's language output
                valid = (word.language == options.lang1) ? valid : false;
    
            if (valid)
                lang1_text += word.text + " ";

            // extract lang2

            valid = false;
            ocrlang = options.useocrlang ?? false;

            if (options.lang2validate)
                valid = options.lang2validate(word.text) ? true : false;
            else
                valid = (word.language == options.lang2) ? true : false;

            if (ocrlang && options.lang2validate)
                valid = (word.language == options.lang2) ? valid : false;

            if (valid)
                lang2_text += word.text + " ";
        }

        lang1_text = lang1_text.trim();
        lang2_text = lang2_text.trim();

        if (lang1_text != "")
        {
            list.push([lang1_text, lang2_text]);
        }
    }

    await worker.terminate();

    return list;
}