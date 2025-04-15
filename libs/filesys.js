var worker = new Worker('libs/fsworker.js');

async function readFile(dirname, filename)
{
    return new Promise ( (resolve, reject) => {
        (async () => {
            try {
                const root = await navigator.storage.getDirectory();
                const dir = await root.getDirectoryHandle(dirname);
                const filehandle = await dir.getFileHandle(filename);
                const file = await filehandle.getFile();
                const text = await file.text();
                resolve(text);
            }
            catch (err)
            {
                reject(err);
            }

        })();

    });

}

async function writeFile(dirname, filename, content)
{
    if (!this.fileid)
        this.fileid = 0;

    let fileid = ++this.fileid;

    return new Promise ( (resolve, reject) => {
        worker.postMessage({ req: "write", fileid: fileid, dirname: dirname, filename: filename, content: content});
        worker.addEventListener('message', function msgHandler({ data }) {
            if (data.fileid == fileid)
            {
                if (data.status == 1)
                    resolve(true);
                else
                    reject(data.err);

                this.removeEventListener('message', msgHandler);
            }
        });
    });
}

async function removeFile(dirname, filename)
{
    return new Promise ( (resolve, reject) => {
        (async () => {
            try {
                const root = await navigator.storage.getDirectory();
                const dir = await root.getDirectoryHandle(dirname);
                await dir.removeEntry(filename);
                resolve();
            }
            catch (err)
            {
                reject(err);
            }

        })();

    });

}

async function fileExists(dirname, filename)
{
    return new Promise ( (resolve, reject) => {
        (async () => {
            try {
                const root = await navigator.storage.getDirectory();
                const dir = await root.getDirectoryHandle(dirname);
                try {
                    const filehandle = await dir.getFileHandle(filename);
                    resolve(true);
                }
                catch (err)
                {
                    resolve(false);
                }
            }
            catch (err)
            {
                reject(err);
            }

        })();

    });
}

async function directoryList(dirname)
{
    return new Promise ( (resolve, reject) => {
        (async () => {
            try {
                const root = await navigator.storage.getDirectory();
                const dir = await root.getDirectoryHandle(dirname);
                let list = [];
                for await (const [key, file] of dir.entries()) {
                    let item = { dir: dirname, name: key, kind: file.kind};
                    if (file.kind == "file")
                    {
                        let fileData = await file.getFile();
                        item['modified'] = fileData.lastModified;
                        item['size'] = fileData.size;
                    }
                    list.push(item);
                    
                }
                resolve(list);
            }
            catch (err)
            {
                reject(err);
            }

        })();

    });

}