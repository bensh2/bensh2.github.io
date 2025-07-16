import { getUser } from './sbapi.js'; // Import the Supabase API client

$( async function() {
    const user = await getUser();
    if (user) {
        $("#userInfo").text(`Logged in as: ${user.email}`);
    } else {
        $("#userInfo").text("User not logged in");
    }
});