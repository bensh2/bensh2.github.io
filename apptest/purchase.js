export async function makePurchaseRequest(priceId, quantity) 
{
    /*if (!priceId) {
        console.error("Price ID is required");
        return false;
    }*/
    const response = await fetch("https://ujqbqwpjlbmlthwgqdgm.supabase.co/functions/v1/stripesession", {
        method: "POST",
        body: JSON.stringify(
            { 
                priceId: priceId,
                successUrl: "https://https://bensh2.github.io/apptest/success",
                cancelUrl: "https://https://bensh2.github.io/apptest/cancel",

            }),
    });

    if (response.status === 401) {
        localStorage.setItem("redirectAfterLogin", "purchase.html?productId=" + priceId + "&quantity=" + "1");
        window.location.href = "login.html"; // Redirect to login page if not authenticated
        return;
    }

    if (!response.ok) {
        console.error("Error creating checkout session:", data.error);
        return false;
    }

    const data = await response.json();
    window.location.href = data.url;

}