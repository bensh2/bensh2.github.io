// esm version
import { sbApiClient } from './sbapi.js'; // Import the Supabase API client
const supabaseClient = sbApiClient();

export async function handleSignInWithGoogleCB(response) 
{  
    const { data, error } = await supabaseClient.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,  
        });

    console.log("Sign in with Google response:", data, error);
    if (!error) {
        // let redirect = localStorage.getItem("redirectAfterLogin");
        const urlParams = new URLSearchParams(window.location.search);
        let redirect = urlParams.get("redir");
        if (redirect) {
            //localStorage.removeItem("redirectAfterLogin");
        } else {
            redirect = "index.html"; // Default redirect if not set
        }

        window.location.href = redirect; // Redirect to the specified page after login
    }
}

window.handleSignInWithGoogleCB = handleSignInWithGoogleCB;  // Expose the function to the global scope


// non-esm version
/*const { createClient } = supabase;

const supabaseClient = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');

async function handleSignInWithGoogle(response) 
{  
    //debugger;
    const { data, error } = await supabaseClient.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,  
        });

    console.log("Sign in with Google response:", data, error);
    if (!error) {
        // let redirect = localStorage.getItem("redirectAfterLogin");
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redir");
        
        if (redirect) {
            //localStorage.removeItem("redirectAfterLogin");
        } else {
            redirect = "index.html"; // Default redirect if not set
        }

        window.location.href = redirect; // Redirect to the specified page after login
    }
}
*/

