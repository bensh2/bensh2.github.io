import { createClient } from 'https://esm.sh/@supabase/supabase-js';  
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');

initialize();

async function initialize()
{
    const { data, error } = await supabase.functions.invoke('userproducts', {  body: 
            JSON.stringify({
                user_id: null
            })
    });

    if (error) {
        document.getElementById("error-message").textContent = "Error fetching session status";
        if (error instanceof FunctionsHttpError) {
            const errorMessage = await error.context.json();
            console.error('Function returned an error', errorMessage);
        } else if (error instanceof FunctionsRelayError) {
            console.error('Function relay error', error.message);
        } else if (error instanceof FunctionsFetchError) {
            console.error('Function fetch error', error.message);
        } else {
            console.error('Unknown error', error);
        }
        return;
    }
    
    if (!data) {
        document.getElementById("error-message").textContent = "No data found for the user";
        return;
    }

    document.getElementById("product-list").textContent = "Data retrieved successfully";
    console.log(data);
}