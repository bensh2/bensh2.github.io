import { sbApiClient } from './sbapi.js'; // Import the Supabase API client
const supabaseClient = sbApiClient();

$( async function() {

    const { data, error } = await supabaseClient.functions.invoke('testdb');

    if (error) {
        console.error('Error:', error);
        $( "#messages" ).show().text(error);
    } else {
        console.log('File uploaded successfully');
        $( "#messages" ).show().html(JSON.stringify(data));
    }

});