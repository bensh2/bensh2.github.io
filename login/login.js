document.querySelector("#googlogin").addEventListener("click", () => { googleLogin() });


function googleLogin() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
  
    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);
  
    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {'client_id': '780365470464-8e6o75op1kq9dv339ahkr5ud4fvkcsnv.apps.googleusercontent.com',
                  'redirect_uri': 'https://bensh2.github.io/login/googleredir.html',
                  'response_type': 'token',
                  'scope': 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
                  'include_granted_scopes': 'true',
                  'response_type': 'code',  
                  'state': '5w798toojo3478ti'};
  
    // Add form parameters as hidden input values.
    for (var p in params) {
      var input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }
  
    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  }