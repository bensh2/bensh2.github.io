class Wordlist {
    #data;

    constructor()
    {
        this.#data = { filename: String(Date.now()), name: "", lastupdate: Date.now(), size: 0, synced: false, items: []};
    }

    /* {
        filename,
        name,
        lastupdate,
        synced: true/false

        items: []  rows
    }
    
    row structure:
        s . selected: true/false (default: false)
        e . entry: word in english
        t . translate: word translation
        a . additional: additional translation
    */

    getData() {
        return this.#data;
    }

    setData(data) {
        this.#data = data;
    }

    setName(name) { 
        this.#data.name = name; 
    }

    getSize() { return this.#data.size; }

    findEntry(name)
    {
        for (let i = 0; i < this.#data.items.length; i++)
        {
            if (this.#data.items[i].e == name)
                return i;
        }

        return -1;
    }

    resetData()
    {
        this.#data.items = [];
        this.#data.size = 0;
        this.#data.synced = false;
    }

    importCSV(data)
    {
        let lines = data.split("\n");
        for (const line of lines)
        {
            let fields = line.split(",");
            if (fields.length < 2)
                continue;
            let additional = []; // additional words
            for (let i = 2; i < fields.length; i++)
                additional.push(fields[i].trim());

            /*if (this.findEntry(fields[0].trim()))
                return "ערך כפול: "+fields[0];*/

            this.#data.items.push( { s: false, e: fields[0].trim(), t: fields[1].trim(), a: additional });
        }
        this.#data.size = this.#data.items.length;
        this.#data.synced = false;

        return true;        
    }

    importEditor(data)    // import from table editor
    {

    }

    exportEditor()       // export to table editor
    {

    }
}

class ListManager {

    // manage a directory file which will contain a JSON file with all the lists and their file names
    #filename;
    #path;

    constructor()
    {
        this.#path = "lists";
        this.#filename = "directory.json";
    }

    async getLists()  // read directory file
    {
        // read directory.json
        // return { filename: listname, ... } 
        let data;
        try {
            data = await readFile(this.#path, this.#filename);
        }
        catch (err)
        {
            return {};
        }
        
        try {
            let list = JSON.parse(data);
            return list;
        }       
        catch (err)
        {
            throw err;
        }
    }

    async listExists(name)  // list name, not filename
    {
        // getLists()
        // check if list name is in directory
        // return filename if exists; false otherwise
        try {
            let lists = await this.getLists();
            for (const [key, value] of Object.entries(lists)) {
                if (value == name)
                    return value;
            }
            return false;
        }
        catch (err)
        {
            throw err;
        }
    }

    async saveList(list)
    {
        try {
            // save to file
            let data = list.getData();
            data.lastupdate = Date.now();
            data.synced = false;
            let json = JSON.stringify(data);
            await writeFile(this.#path, data.filename, json);
            // update directory.json, data.name
            let lists = await this.getLists();
            lists[data.filename] = data.name;
            await writeFile(this.#path, this.#filename, JSON.stringify(lists));
            return true;
        }
        catch (err)
        {
            throw err;
        }
    }

    async loadList(filename)
    {
        try {
            let data = await readFile(this.#path, filename);
            let list = JSON.parse(data);
            let wordlist = new Wordlist();
            wordlist.setData(list);
            return wordlist;
        }
        catch (err)
        {
            throw err;
        }
    }

    async deleteList(filename)
    {
        // update directory.json

        // delete file
    }

    getFilename()
    {

    }
}