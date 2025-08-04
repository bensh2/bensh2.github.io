import { getSbClient, getFunctionError, invokeFunction } from './common.js'; // Import the Supabase API client

const supabase = getSbClient();

initialize();

async function initialize() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get("session_id");
  const priceId = urlParams.get("priceId");

  if (!sessionId) {
    /*processError("Missing session_id in the URL");
    return;*/
  }

  const { data, error } = await invokeFunction('sessionstatus', { session_id: sessionId });

  if (error) {
    processError(error.message);
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