import { sbApiClient } from './sbapi.js'; // Import the Supabase API client
const supabaseClient = sbApiClient();

$( function() {

    $( "#fileSelect" ).on("click", function() {
        $( "#fileElem" ).click();
    });

    $( "#fileElem" ).on("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            $( "#wait" ).show();
            $( "#result" ).hide();
            uploadFile(file);
        }
    });
});

async function uploadFile(file) 
{
    const { data, error } = await supabaseClient.storage.from('useruploads').upload("listfile.data", file, { cacheControl: '0', upsert: true });

    if (error) {
        console.error('Error uploading file:', error);
        $( "#wait" ).hide();
        $( "#result" ).show().text(JSON.stringify(error));
        return false;
    } else {
        console.log('File uploaded successfully');
        $( "#wait" ).hide();
        $( "#result" ).show().text(JSON.stringify(data));
    }

    const { data: data2, error: error2 } = await supabaseClient.functions.invoke('processfile');

    if (error2) {
        console.error('Error processing file:', error2);
        $( "#wait" ).hide();
        $( "#result" ).show().text(JSON.stringify(error2));
        return false;
    } else {
        console.log('File processed successfully');
        $( "#wait" ).hide();
        $( "#result" ).show().text(JSON.stringify(data2));
    }
}

async function uploadFile2(file)
{
    //debugger;
    let formdata = new FormData();
    formdata.append(file.name, file);
    let entries = formdata.entries();
    for (let entry of entries) {
        console.log(entry[0], entry[1]);
    }

    const { data, error } = await supabaseClient.functions.invoke('uploadfile', {
            body: formdata
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
}

async function uploadFile1(file) 
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
        const { data, error } = await supabaseClient.functions.invoke('uploadfile', {
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