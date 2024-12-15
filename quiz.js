class QuizRunner {

    #quizdata;
    #quiz;
    #layout;

    constructor () {
        this.#quizdata = [];
        this.#layout = new AppLayout();
    }

    async loadData() {
        let resp = await fetch("./wordlist.csv");
        if (!resp.ok) {
            throw new Error(`Response status: ${resp.status}`);
        }

        const data = await resp.text();
        let lines = data.split("\n");
        this.#quizdata = [];
        for (const line of lines)
        {
            let fields = line.split(",");
            if (fields.length < 2)
                continue;
            //console.log(fields);
            this.#quizdata.push( [fields[0].trim(), fields[1].trim() ] );
        }
    }

    async run()
    {
        await this.loadData();

        let wordlist = new Wordlist(this.#quizdata);
        this.#quiz = new Quiz(wordlist);
        
        this.nextQuestion();
        
    }

    nextQuestion()
    {
        let quiz = this.#quiz;  // for callbacks
        let question = quiz.nextEntry();
        let remaining = 4;

        if (question === false)
        {
            this.quizDone();
            return;
        }

        let that = this;

        this.#layout.setQuestion(question);

        $(".choice").on("click", function() {
            let answer = $(this).attr("data-word");
            console.log(answer);
            if (quiz.submitAnswer(answer))
            {
                $(this).addClass("correct");
                $("#quizmessage").text("תשובה נכונה!");
                $(".choice").off("click").removeClass("enable");
                setTimeout( () => {
                    that.nextQuestion();
                }, 2000);
            } else {
                $("#quizmessage").text("תשובה שגויה. נסו שוב.");
                $(this).addClass("mistake").removeClass("enable").off("click");
                remaining--;
                console.log(remaining);
            }
        })
    }

    quizDone()
    {
        let results = this.#quiz.getResults();
        this.#layout.showResults(results);
    }
}

class Wordlist {
    #sourcefile;
    #name;
    #list;
    #size;

    constructor (list, name = null)
    {
        this.#list = {};
        this.#size = 0;

        if (name == null)
        {
            let now = new Date();
            name = "רשימת מילים - " + new Intl.DateTimeFormat('en-IL', {
                dateStyle: 'short',
                timeStyle: 'short',
                timeZone: 'Asia/Jerusalem',
              }).format(now);
        }
        this.#name = name;
        this.#sourcefile = "";
        this.#updatelist(list);
    }

    get() { return this.#list; }
    getName() { return this.#name; }
    getSource() { return this.#sourcefile; }
    getSize() { return this.#size; }
    getEntry(id) { return this.#list[id]; }

    #updatelist (list)
    {
        let id = 1;
        this.#list = {};
        for (const item of list)
        {
            let entry = { id: id, word: String(item[0]).toLowerCase(), value: item[1] };
            this.#list[id] = entry;
            id++;
        }
        this.#size = id;
    }
}

class Quiz {

    #wordlist;
    #sourcefile;
    #listname;
    #wordmistakes;

    constructor (wordlist)
    {
        if (wordlist.constructor.name != "Wordlist")
            throw new Error("Quiz class expects Wordlist argument");

        this.#wordlist = wordlist.get();
        this.#listname = wordlist.getName();
        this.#sourcefile = wordlist.getSource();
        this.test = {};

        this.resettest();

        console.log(this.#wordlist);
        console.log(this.test);
    }

    resettest()
    {
        this.#wordmistakes = [];

        this.test = { version: 1, listname: this.#listname, sourcefile: this.#sourcefile, finished: false, correct: 0, mistakes: 0, lastentry: 0,
                    starttime: Date.now(), finishtime: null, wordmistakes: 0, lastentry: -1, totalwords: 0, score: null,
                    words: [], choices: [] };

        for (const i in this.#wordlist)
        {
            this.test.words.push([String(this.#wordlist[i].word), String(this.#wordlist[i].value)]);
            this.test.choices.push(String(this.#wordlist[i].value));

            if (this.test.words.length == 10)
                break;
        }

        this.test.totalwords = this.test.words.length;
    }

    nextEntry(removelast = true)
    {
        if (removelast && this.test.lastentry >= 0 && this.test.lastentry < this.test.words.length)
            this.test.words.splice(this.test.lastentry, 1);

        if (this.test.words.length == 0)
            return false;

        let idx = Math.floor(Math.random() * this.test.words.length);
        this.test.lastentry = idx;
        let question = { word: this.test.words[idx][0], answer: this.test.words[idx][1] };
        let choices = [ question.answer ];
        while (choices.length < 4)
        {
            idx = Math.floor(Math.random() * this.test.choices.length);
            let choice = this.test.choices[idx];
            if (choices.includes(choice))
                continue;
            choices.push(choice);
        }

        question.choices = this.#shuffle(choices);
        return question;
    }

    submitAnswer(submission)
    {
        let answer = this.test.words[this.test.lastentry][1];
        if (submission == answer)
        {
            this.test.correct++;
            return true;
        }
        
        this.test.mistakes++;
        if (!this.#wordmistakes.includes(answer))
        {
            this.#wordmistakes.push(answer);
            this.test.wordmistakes++;
        }

        return false;
    }

    getResults()
    {
        if (this.test.totalwords > 0)
            this.test.score = 100 - (100/this.test.totalwords * this.test.wordmistakes);
        return this.test;
    }

    #shuffle(array)
    {
        for (var i = array.length - 1; i >= 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
}

class ListManager {

    constructor()
    {

    }
}

class TestManager {

    constructor()
    {
        
    }
}