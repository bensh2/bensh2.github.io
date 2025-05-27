import { createClient } from 'https://esm.sh/@supabase/supabase-js';  
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');

/*const supabase = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');
let userauth = supabase.auth.session().access_token;
console.log("User auth token:", userauth);*/

export async function makePurchaseRequest(priceId, quantity) 
{
    /*if (!priceId) {
        console.error("Price ID is required");
        return false;
    }*/

    /*let userauth = "";
    debugger
    const { userdata, error } = await supabase.auth.getSession();
    if (userdata && userdata.session) {
        userauth = userdata.session.access_token; // Get the access token from the session
        console.log("User auth token:", userauth);
    }

    const response = await fetch("https://ujqbqwpjlbmlthwgqdgm.supabase.co/functions/v1/stripesession", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${userauth}`, // Use the access token for authentication
        },
        body: JSON.stringify(
            { 
                priceId: priceId,
                successUrl: "https://https://bensh2.github.io/apptest/success",
                cancelUrl: "https://https://bensh2.github.io/apptest/cancel",
            }),
    });

    if (response.status === 401) {
        localStorage.setItem("redirectAfterLogin", "purchase.html?priceId=" + priceId + "&quantity=" + "1");
        //window.location.href = "login.html"; // Redirect to login page if not authenticated
        return;
    }

    const data = await response.json();

    if (!response.ok) {
        console.error("Error creating checkout session:", data.error);
        return false;
    }*/

    const { data, error } = await supabase.functions.invoke('stripesession', {  body: 
        JSON.stringify({
            priceId: priceId,
            successUrl: "https://bensh2.github.io/apptest/success",
            cancelUrl: "https://bensh2.github.io/apptest/cancel"
        })
    });
    if (error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json();
        console.log('Function returned an error', errorMessage);
        if (errorMessage.code == -2) {
            //localStorage.setItem("redirectAfterLogin", "purchase.html?priceId=" + priceId + "&quantity=" + "1");
            let redirect = "purchase.html?priceId=" + priceId + "&quantity=" + "1"
            window.location.href = "login.html?redir" + encodeURIComponent(redirect); // Redirect to login page if not authenticated
            return;
        }
    } else if (error instanceof FunctionsRelayError) {
        console.log('Relay error:', error.message)
    } else if (error instanceof FunctionsFetchError) {
        console.log('Fetch error:', error.message)
    } else {
        window.location.href = data.url;
    }
    return true;
}