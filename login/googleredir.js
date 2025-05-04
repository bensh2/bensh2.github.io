addEventListener("DOMContentLoaded", (event) => { reqUserData() });

async function reqUserData()
{
    let uri = window.location.search;
    if (uri == "")
        uri = window.location.hash;

    const params = new URLSearchParams(uri);
    const scopes = params.get("scope");
    // add code verify the scopes

    // request email

    const baseurl = "https://www.googleapis.com/oauth2/v2/userinfo";//"https://www.googleapis.com/auth/userinfo.email";
    const access_token = params.get("access_token");
    

    let url = baseurl + "?access_token="+access_token;
    try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
    
        const json = await response.json();
        console.log(json);
        document.querySelector("#userinfo").innerHTML = JSON.stringify(json, null, 2);
      } catch (error) {
        console.error(error.message);
    }
        /*let form = document.createElement('form');
        form.setAttribute('method', 'GET'); // Send as a GET request.
        form.setAttribute('action', baseurl);
      
        // Parameters to pass to OAuth 2.0 endpoint.
        let fparams = { 'access_token': access_token};
      
        // Add form parameters as hidden input values.
        for (var p in fparams) {
          var input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', p);
          input.setAttribute('value', fparams[p]);
          form.appendChild(input);
        }
      
        // Add form to page and submit it to open the OAuth 2.0 endpoint.
        document.body.appendChild(form);
        form.submit();*/
}