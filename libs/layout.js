class AppLayout {
    constructor () {}

    #setPage(page)
    {
        $("#main").html(page);
    }

    setQuestion(data)
    {
        console.log(data);

        let page = `<div class="quizpanel"><div class='question'>מה פירוש המילה <span class='word'>${data.word}</span>?</div><br><br>`;
        for (const choice of data.choices)
            page += this.#choice(choice);

        page += "<br><div id='quizmessage'></div></div>";
        this.#setPage(page);
        
    }

    showResults(data)
    {
        console.log(data);
        let page = `<div class="quizpanel">סיימת את התרגול!<br><br>ציון: ${data.score}</div>
        <br><button id='goback'>חזרה</button>
        `;
        this.#setPage(page);
        $("#goback").on("click", () => { window.location.href = "/"; })
    }

    #choice(item)
    {
        let html = `<div class='choice enable' data-word='${item}'>${item}</div>`;
        return html;
    }
}