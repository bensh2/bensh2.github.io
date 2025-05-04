reqUserData();

async function reqUserData()
{
    const params = new URLSearchParams(window.location.search);
    const scopes = params.get("scope");
    // add code verify the scopes

    // request email

    const baseurl = "https://www.googleapis.com/auth/userinfo.email";
    const access_token = params.get("access_token");
    let url = baseurl + "?access_token="+decodeURI(access_token);
    try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
    
        const json = await response.json();
        console.log(json);
      } catch (error) {
        console.error(error.message);
    }
}