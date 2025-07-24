import { getUser } from './sbapi.js'; // Import the Supabase API client

$( async function() {
    const user = await getUser();
    if (user) {
        let html = "Logged in as: ";
        if (user.user_metadata?.avatar_url) {
            html += `<img style="width: 25px; height: auto" src="${user.user_metadata.avatar_url}" alt=""></img>`;
        }
        html += ` ${user.email}`;
        $("#userInfo").html(html);//`Logged in as: ${user.email}`);
    } else {
        $("#userInfo").text("User not logged in");
    }
});