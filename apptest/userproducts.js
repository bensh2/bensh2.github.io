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

    console.log(data);

    let list = "<table class='table table-striped table-hover'><thead><tr><th>Product ID</th><th>Product Name</th><th>Quantity</th><th>Price</th><th>Currenccy</th><th>Date</th><th>Metadata</th></tr></thead><tbody>";
    for (const item of data.items) {
        list += `<tr><td>${item.productId}</td><td>${item.productName}</td><td>${item.quantity}</td><td>${item.price}</td><td>${item.currency}</td><td>${new Date(item.createdAt * 1000).toLocaleDateString()}</td><td>${JSON.stringify(item.metadata)}</td></tr>`;
    }

    list += "</tbody></table>";
    document.getElementById("product-list").innerHTML = list;
    
}