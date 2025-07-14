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

    document.querySelector(".spinner-div").classList.add("d-none"); // Hide the spinner

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

    /*let list = "<table class='table table-striped table-hover'><thead><tr><th>Product ID</th><th>Product Name</th><th>Size</th><th>Creation Date</th><th>Status</th></tr></thead><tbody>";
    for (const item of data.items) {
        list += `<tr><td>${item.productId}</td><td>${item.productName}</td><td>${item.size}</td><td>${new Date(item.createdAt * 1000).toLocaleDateString()}</td><td>${item.status}</td></tr>`;
    }*/

    let statusCodes = { "A": "Active", "C": "Cancelled", "E": "Expired", "PC": "Pending Cancellation" };

    let list = "<table class='table table-striped table-hover'><thead><tr><th>Product ID</th><th>Product Name</th><th>Product Type</th><th>Size</th><th>Creation Date</th><th>Status</th><th></th></tr></thead><tbody>";
    for (const item of data.items) {
        let status = statusCodes[item.status] || "Unknown";
        let producttype = (item.productType == "p" ? "Purchase" : item.productType == "s" ? "Subscription" : "Unknown");
        let button = (item.status == "A" && item.productType == "s") ? `<button id="cancel-button-${item.purchaseId}" class='status btn btn-danger btn-sm'>Cancel</button>` : "";

        list += `<tr><td>${item.productId}</td><td>${item.productName}</td><td>${producttype}</td><td>${item.size}</td><td>${new Date(item.createdAt * 1000).toLocaleDateString()}</td><td>${status}</td><td>${button}</td></tr>`;
    }

    list += "</tbody></table>";
    document.getElementById("product-list").innerHTML = list;
    document.querySelectorAll("button[id^='cancel-button-']").forEach(button => {
        button.addEventListener("click", () => {
            const purchaseId = button.id.split("-")[2];
            cancelProduct(purchaseId);
        });
    });
    
}

export async function cancelProduct(purchaseId) {

    let c = confirm("Are you sure you want to cancel this product? You will still be able to use it until the end of the billing period.");
    if (!c) {
        return;
    }

    document.getElementById("cancel-button-" + purchaseId).disabled = true; // Disable the button to prevent multiple clicks
    // set button to show spinner
    document.getElementById("cancel-button-" + purchaseId).innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>";

    const { data, error } = await supabase.functions.invoke('cancelproduct', { body: JSON.stringify({ purchase_id: purchaseId }) });

    if (error) {
        document.getElementById("error-message").textContent = "Error cancelling product";
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
        document.getElementById("cancel-button-" + purchaseId).innerHTML = "Failed"; // Re-enable the button
    }

    if (!data || !data.success) {
        alert("Failed to cancel product");
        return;
    }

    document.getElementById("cancel-button-" + purchaseId).classList.add("d-none");

    alert("Product cancelled successfully. You can continue to use it until the end of the billing period.");
    
    window.location.reload(); // reload page
}