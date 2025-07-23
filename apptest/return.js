import { sbApiClient } from './sbapi.js'; // Import the Supabase API client
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "https://esm.sh/@supabase/supabase-js";

const supabase = sbApiClient();

initialize();

async function initialize() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get("session_id");
  const priceId = urlParams.get("priceId");
  /*const response = await fetch(`/session-status?session_id=${sessionId}`);
  const session = await response.json();*/

  if (!sessionId) {
    /*processError("Missing session_id in the URL");
    return;*/
  }

  //debugger

  const { data, error } = await supabase.functions.invoke('sessionstatus', {  body: 
            JSON.stringify({
                session_id: sessionId,
            })
    });

  if (error) {
    //document.getElementById("status").textContent = "Error fetching session status";
    if (error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json();
        processError(errorMessage.message);
    } else if (error instanceof FunctionsRelayError) {
        processError('Function relay error:<br>' +  error.message);
    } else if (error instanceof FunctionsFetchError) {
        processError('Function fetch error:<br>' +  error.message);
    } else {
        processError('Unknown error:<br>' +  error);
    }
    return;
  }
  if (!data) {
    //document.getElementById("status").textContent = "No session found";
    processError("No session found");
    return;
  }

  if (data.status == "open") {
    // The payment failed or was canceled. Remount Checkout so that your customer can try again.
    //window.replace("http://localhost:4242/checkout.html")
    window.replace("checkout.html?priceId=" + priceId);
  } else if (data.status == "complete") {
    document.getElementById("status").classList.add("d-none");
    document.getElementById("success").classList.remove("d-none");
    //document.getElementById("customer-email").textContent = data.customer_email
  } else if (data.status == "expired") {
    document.getElementById("status").textContent = "Session expired";
  } else {
    processError("Unknown session status: " + data.status);
  }
}

function processError(msg) {
  document.getElementById("errorMessage").innerHTML = "Error fetching session status: " + msg;
  document.getElementById("error").classList.remove("d-none");
  document.getElementById("status").classList.add("d-none");
  console.error(msg);
}