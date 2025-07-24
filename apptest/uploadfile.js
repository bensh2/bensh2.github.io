import { sbApiClient } from './sbapi.js'; // Import the Supabase API client
import { srvKey, srvAddress } from './apiconfig.js';
import { Upload as tusUpload } from 'https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/+esm'

const supabaseClient = sbApiClient();

$( async function() {

    $( "#fileSelect1" ).on("click", function() {
        $( "#fileElem1" ).click();
    });

    $( "#fileElem1" ).on("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            $( "#wait" ).show();
            $( "#result" ).hide();
            uploadFile1(file);
        }
    });

    $( "#fileSelect2" ).on("click", function() {
        $( "#fileElem2" ).click();
    });

    $( "#fileElem2" ).on("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            $( "#wait" ).show();
            $( "#result" ).hide();
            uploadFile2(file);
        }
    });
});

async function uploadFile1(file) // upload to storage
{
    const fileSize = file.size;
    const fileType = file.type;
``
    if (fileSize > 5300000) {
        //console.error('File size exceeds limit of 5MB');
        $( "#wait" ).hide();
        $( "#result" ).show().text('File size exceeds limit of 5MB');
        return;
    }

    const { data: sessiondata, error: sessionerror } = await supabaseClient.auth.getSession();
    //console.log(sessiondata);
    if (sessionerror)
    {
        console.error(sessionerror);
        return false;
    }
    let userid = sessiondata?.session?.user?.id;
    if (!userid)
    {
        console.error("No userid found");
        $( "#wait" ).hide();
        $( "#result" ).show().html("You must login to upload a file");
        return false;
    }

    let filename = userid + "/" + String(Date.now());//"listfile.data";

    // resumable file upload using external library; provides progress indicator
    let error;
    let data;
    try {
        data = await uploadResumableFile("useruploads", filename, file,
            function(value) { $( "#result" ).show().html(`Uploading file: ${value}%`) }
        );
    }
    catch (error)
    {
        console.error('Error uploading file:', error);
        $( "#wait" ).hide();
        $( "#result" ).show().text(error);
        return false;
    }

    console.log('File uploaded successfully');
    $( "#wait" ).hide();
    $( "#result" ).show().html("Uploaded file to storage: " + JSON.stringify(data.options.metadata) + "<br><br>Calling EF to process it...");

    /*
    // standard file upload using supabase api
    const { data, error } = await supabaseClient.storage.from('useruploads').upload(filename, file, { cacheControl: '0' });
    if (error) {
        console.error('Error uploading file:', error);
        $( "#wait" ).hide();
        $( "#result" ).show().text(JSON.stringify(error));
        return false;
    } else {
        console.log('File uploaded successfully');
        $( "#wait" ).hide();
        $( "#result" ).show().html("Uploaded file to storage: " + JSON.stringify(data) + "<br><br>Calling EF to process it...");
    }*/

    const { data: data2, error: error2 } = await supabaseClient.functions.invoke('processfile1', 
        { body: JSON.stringify( {filename: filename, filetype: fileType })});

    if (error2) {
        console.error('Error processing file:', error2);
        $( "#wait" ).hide();
        $( "#result" ).show().text(error2);
        return false;
    } else {
        console.log('File processed successfully');
        let link = data2.url;
        $( "#wait" ).hide();
        $( "#result" ).show().html(`File (${data2.filetype}) made available at URL for 5 minutes: <br><a target='_blank' href='${link}'>${link}</a>`);
    }
}

async function uploadFile2(file) // upload to an edge function directly
{
    //debugger;
    const fileSize = file.size;
    const fileType = file.type;

    if (fileSize > 5300000) {
        //console.error('File size exceeds limit of 5MB');
        $( "#wait" ).hide();
        $( "#result" ).show().text('File size exceeds limit of 5MB');
        return;
    }

    let formdata = new FormData();
    formdata.append(file.name, file);
    let entries = formdata.entries();
    for (let entry of entries) {
        console.log(entry[0], entry[1]);
    }

    /*const { data, error } = await supabaseClient.functions.invoke('processfile2', {
            body: formdata
        });*/

    const { data: sessiondata, error: sessionerror } = await supabaseClient.auth.getSession();
    //console.log(sessiondata);
    if (sessionerror)
    {
        console.error(sessionerror);
        return false;
    }
    let token = sessiondata?.session?.access_token;
    if (!token)
    {
        console.error("No access token found");
        $( "#wait" ).hide();
        $( "#result" ).show().html("You must login to upload a file");
        return false;
    }

    let headers = { apikey: srvKey, authorization: 'Bearer ' + token };
    let { data, status, error } = await uploadFileProgress(`${srvAddress}/functions/v1/processfile2`, headers, formdata,
        function(value) { $( "#result" ).show().html(`Uploading file: ${value}%`) }
    );
    console.log(data, status, error);
    data = JSON.parse(data);

    if (error) {
        console.error('Error uploading file:', error);
        $( "#wait" ).hide();
        $( "#result" ).show().text('Error uploading file');
    } else {
        console.log('File uploaded successfully');
        $( "#wait" ).hide();
        $( "#result" ).show().html(JSON.stringify(data.file));
    }
}

async function uploadFileProgress(url, headers, body, progress)
{
    return new Promise( (resolve, reject) => {

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        for (const [key, value] of Object.entries(headers))
            xhr.setRequestHeader(key, value);

        // Listen for upload progress events
        xhr.upload.addEventListener('progress', async (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                if (progress)
                    progress(percentComplete);
            }
        });

        // Listen for upload completion
        xhr.addEventListener('load', async () => {
            if (xhr.status === 200) {
                //return { data: xhr.responseText, status: xhr.status, error: null };
                resolve({ data: xhr.responseText, status: xhr.status, error: null });
            } else {
                console.error('Upload failed:', xhr.status, xhr.responseText);
                //return { data: null, status: xhr.status, error: xhr.responseText}
                resolve({ data: null, status: xhr.status, error: xhr.responseText});
            }
        });

        // Listen for upload errors
        xhr.addEventListener('error', async () => {
            console.error('Network error during upload.');
            //return { data: null, status: -1, error: "Network error" }
            resolve({ data: null, status: -1, error: "Network error" });
        });

        xhr.send(body);
    });
}

async function uploadResumableFile(bucketName, fileName, file, progresscallback) 
{
    const { data: { session } } = await supabaseClient.auth.getSession();

    return new Promise((resolve, reject) => {
        var upload = new tusUpload(file, {
            endpoint: `${srvAddress}/storage/v1/upload/resumable`,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
                authorization: `Bearer ${session.access_token}`,
                //'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
            metadata: {
                bucketName: bucketName,
                objectName: fileName,
                contentType: file.type,
                cacheControl: 3600,
            },
            chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
            onError: function (error) {
                console.log('Failed because: ' + error)
                reject(error)
            },
            onProgress: function (bytesUploaded, bytesTotal) {
                var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                //console.log(bytesUploaded, bytesTotal, percentage + '%');
                if (progresscallback)
                    progresscallback(Math.round(percentage));
            },
            onSuccess: function () {
                console.log('Download %s from %s', upload.file.name, upload.url)
                resolve(upload)
            },
        })


        // Check if there are any previous uploads to continue.
        return upload.findPreviousUploads().then(function (previousUploads) {
            // Found previous uploads so we select the first one.
            if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0])
            }

            // Start the upload
            upload.start()
        })
    })
}

async function uploadFile3(file) 
{

    // get the file name and size
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;

    // get binary data from the file
    const reader = new FileReader();
    reader.onload = async function() {
        const binaryData = reader.result;
        // Call edge function to upload the file
        const { data, error } = await supabaseClient.functions.invoke('processfile', {
            body: binaryData 
        });

        if (error) {
            console.error('Error uploading file:', error);
            $( "#wait" ).hide();
            $( "#result" ).show().text('Error uploading file');
        } else {
            console.log('File uploaded successfully');
            $( "#wait" ).hide();
            $( "#result" ).show().html(data.data);
        }
    };
    reader.readAsArrayBuffer(file);
}