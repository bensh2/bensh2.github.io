var fileQueue = [];

//setTimeout( () => { processQueue() }, 50);

self.addEventListener('message', ({ data }) => {
    if (data.req == "write")
    {
        addToQueue(data.fileid, data.dirname, data.filename, data.content);
    }
    if (data.req == "close")
    {
        //console.log("Closing fsworker");
        self.close();
    }
});

function addToQueue(fileid, dirname, filename, content)
{
    console.log(`Add '${filename}' to queue`);
    fileQueue.push({ fileid: fileid, dirname: dirname, filename: filename, content: content});
    if (fileQueue.length == 1)
        setTimeout( () => { processQueue() }, 0);
}

async function processQueue()
{
    console.log("fsworker/processQueue");
    if (fileQueue.length > 0)
    {
        while (fileQueue.length > 0)
        {
            let msg = fileQueue.shift();
            await storeFile(msg.fileid, msg.dirname, msg.filename, msg.content);
        }

        setTimeout( () => { processQueue() }, 10);
    } 

}

async function storeFile(fileid, dirname, filename, content)
{
    console.log(`Writing '${filename}'`);

    try {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle(dirname, { create: true});
        const filehandle = await dir.getFileHandle(filename, { create: true});
        const writer = await filehandle.createSyncAccessHandle();
        let encoder = new TextEncoder();
        let encoded = encoder.encode(content);
        writer.truncate(0);
        writer.write(encoded);
        writer.flush();
        writer.close();
        console.log(`Successfully wrote '${filename}'`);
        self.postMessage({ status: 1, fileid: fileid });
        return true;
    }
    catch (error)
    {
        console.error(error);
        self.postMessage({ status: -1, fileid: fileid, err: error });
        return error;
    }
}
