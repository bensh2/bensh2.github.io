// contentParser.js

const LINE_SIZE_ALLOWED = {
  min: 1,
  max: 300,
};

const charactersPerItem = {
  min: 2,
  max: 30,
};

function textLineSplitter(text) {
  /*
   * Split the text into an array object of lines, and remove any empty lines.
   * The textContent is expected to be a string with line breaks.
   * handle different line breaks: \r\n, \r, \n. MaxOs has \r, Windows has \r\n, Linux has \n
   * remove empty lines
   * lines.filter((line) => line.trim() !== "") == lines.filter((line) => line.trim())
   * VIEW LINE END IN TERMINAL VIA: "od -c /file.txt | less"
   */
  let lines;
  lines = text.trim();
  lines = lines.replace(/\r\n|\r/g, "\n");
  lines = lines.split("\n");
  lines = lines.filter((line) => line.trim() !== "");
  return lines;
}

function validateContent(text) {
  // console.log("Validating content...");

  if (!validateLineCount(text, LINE_SIZE_ALLOWED.min, LINE_SIZE_ALLOWED.max)) {
    return { success: false, error: "ContentLineError" };
  }

  // find consistent delimiter, for all lines, to allow for parsing
  const delimiter = determineDelimiter(text);
  if (!determineDelimiter) {
    // console.log("Invalid delimiter");
    return { success: false, error: "ContentDelimiterError" };
  }

  if (!validateColumnStructure(text, 2, delimiter)) {
    return { success: false, error: "ContentStructureError" };
  }

  if (!validateNoMissingValues(text, delimiter)) {
    return { success: false, error: "ContentMissingValuesError" };
  }

  if (!validateLanguage(text, delimiter)) {
    return { success: false, error: "ContentLanguageError" };
  }

  if (!validateCharactersCount(text, charactersPerItem.min, charactersPerItem.max)) {
    return { success: false, error: "ContentCharactersCountError" };
  }

  return { success: true };
}

function titleCase(str) {
  // first letter to uppercase and the rest to lowercase
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

function parseContent(text) {
  /* 
  * parsing Only validation content: no empty lines, no missing values, no invalid delimiters, no invalid column structure, no invalid characters count
 
  * columns[0]=languageOne=English, columns[1]=languageTwo=Hebrew
  */
  console.log("parsing content...");

  let languageOne, languageTwo;
  try {
    const delimiter = determineDelimiter(text);
    const lines = textLineSplitter(text);

    let parsedLine;
    const parsedContent = [];

    for (const line of lines) {
      // get the two languages string items in each line
      [languageOne, languageTwo] = line.split(delimiter);

      // process strings: trim, titleCase

      // languageOne: english
      languageOne = languageOne.trim();
      languageOne = titleCase(languageOne); // str[0].toUpperCase() + str.slice(1).toLowerCase();

      // languageTwo: hebrew
      languageTwo = languageTwo.trim();

      // pack parsed items into an object
      parsedLine = { languageOne, languageTwo };

      // add parsed parsedLine parsedContent array
      parsedContent.push(parsedLine);
    }

    return parsedContent;
  } catch (error) {
    throw new Error("ContentParseError");
  }
}

export { validateContent, parseContent };

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
  const pattern = /^[\u05D0-\u05EA\s]+$/;
  return pattern.test(text);
}

function validateLanguage(text, delimiter) {
  const lines = textLineSplitter(text);
  const column_zero = lines.map((line) => line.split(delimiter)[0].trim());
  // console.log("column_zero", column_zero);
  const column_one = lines.map((line) => line.split(delimiter)[1].trim());
  // console.log("column_one", column_one);
  const column_zero_language_check = column_zero.map(isEnglishAlphabetical);
  const column_one_language_check = column_one.map(isHebrewAlphabetical);

  // validate that all array items are true
  if (!column_zero_language_check.every(Boolean) || !column_one_language_check.every(Boolean)) {
    // console.log("Invalid Language Letters or Characters in one or more lines. ", lines);
    return false;
  }

  return true; // All lines have the required number of columns
}

function validateCharactersCount(text, minCharacters = 2, maxCharacters = 30) {
  // space character is permitted to allow multi words
  const lines = textLineSplitter(text);
  const lineCharactersCheck = [];
  const lineCharactersCount = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].split(",").map((item) => item.trim());
    const [item_one, item_two] = line.map((item) => item.length);
    lineCharactersCount.push([item_one, item_two]);

    if (
      item_one < minCharacters ||
      item_one > maxCharacters ||
      item_two < minCharacters ||
      item_two > maxCharacters
    ) {
      lineCharactersCheck.push(false);
    } else {
      lineCharactersCheck.push(true);
    }
  }

  // For debug: console.log("lineCharactersCount", lineCharactersCount);

  if (!lineCharactersCheck.every(Boolean)) {
    return false;
  }
  return true;
}

function validateLineCount(text, minLines = 1, maxLines = 300) {
  const lines = textLineSplitter(text);
  const lineCount = lines.length;

  // console.log("lineCount:", lineCount);

  if (lineCount < minLines || lineCount > maxLines) {
    // throw new Error("FileLinesError");
    return false;
  }
  return true;
}

function determineDelimiter(text) {
  const lines = textLineSplitter(text);
  const delimiters = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const delimiter = evaluateLineDelimiter(line);

    if (delimiter.startsWith("Error")) {
      // console.log(`Error: Line ${i + 1}: ${delimiter}`);
    }
    delimiters.push(delimiter);
  }

  // arrow function to check if all elements in an array are equal
  const allEqual = (arr) => arr.every((val) => val === arr[0]);

  if (!allEqual(delimiters)) {
    return false;
  }
  return delimiters[0];
}

function evaluateLineDelimiter(lineString) {
  // to be used by determineDelimiter function
  if (!lineString) {
    return "Error: Empty line string";
  }

  const delimiters = [",", ";", "\t", "|"];
  let foundDelimiter = null;

  for (const delimiter of delimiters) {
    if (lineString.includes(delimiter)) {
      if (foundDelimiter) {
        return "Error: Invalid delimiter (multiple delimiters found)";
      }
      foundDelimiter = delimiter;
    }
  }

  if (!foundDelimiter) {
    return "Error: No valid delimiter found";
  }

  return foundDelimiter;
}

function validateColumnStructure(text, requiredColumns = 2, delimiter = ",") {
  // internal validation
  if (typeof requiredColumns !== "number" || requiredColumns < 0) {
    // console.log("Error: requiredColumns must be a non-negative number.");
    throw new Error("required Columns must be a non-negative number.");
  }
  const lines = textLineSplitter(text);
  const lineColumns = [];

  for (let i = 0; i < lines.length; i++) {
    const currentLineColumns = lines[i].split(delimiter).length;
    lineColumns.push(currentLineColumns);
  }

  // console.log("lineColumns", lineColumns);
  // arrow function to check if all elements in an array called are equal
  const allEqual = (arr) => arr.every((val) => val === arr[0]);

  if (!allEqual(lineColumns) || lineColumns[0] !== requiredColumns) {
    return false;
  }

  return true; // All lines have the required number of columns
}

function validateNoMissingValues(text, delimiter = ",") {
  // validate missing values, or return error
  const missingPatterns = ["NULL", "null", "NA", "N/A", ""];
  const missingLines = [];

  const lines = textLineSplitter(text);

  lines.forEach((line, rowIndex) => {
    const cells = line.split(delimiter);
    cells.forEach((cell) => {
      if (missingPatterns.includes(cell.trim())) {
        missingLines.push(rowIndex + 1);
        return; // Only add each line once =>exits the inner forEach loop
      }
    });
  });

  if (missingLines.length > 0) {
    return false;
  }
  return true;
}
