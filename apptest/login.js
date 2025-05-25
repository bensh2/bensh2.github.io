
// esm version
import { createClient } from 'https://esm.sh/@supabase/supabase-js';  
const supabase = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');

export async function handleSignInWithGoogle(response) 
{  
    //debugger;
    const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,  
        });

    console.log("Sign in with Google response:", data, error);
}

//window.handleSignInWithGoogle = handleSignInWithGoogle;  // Expose the function to the global scope

/*
// non-esm version
const { createClient } = supabase;

const supabaseClient = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');

async function handleSignInWithGoogle(response) 
{  
    //debugger;
    const { data, error } = await supabaseClient.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,  
        });

    console.log("Sign in with Google response:", data, error);
}
*/
