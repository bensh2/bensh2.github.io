const { createClient } = supabase;
const supabaseClient = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');

$( function() {

    $("#offerButton").click(function() {
        window.location.href = "purchase.html?priceId=prod_SMFQqydqibCzyp"; 

        /*if (!checkUser()) {
            localStorage.setItem("redirectAfterLogin", "purchase.html");
            window.location.href = "login.html"; // Redirect to login page if not logged in
            return;
        } else
            window.location.href = "purchase.html";*/
    });

});

async function checkUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.error("Error fetching user:", error);
        return false;
    }

    if (user) {
        console.log("User is logged in:", user);
        return true;
    } else {
        return false; // User is not logged in
    }
}