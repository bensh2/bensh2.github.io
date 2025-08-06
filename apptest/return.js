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
    purchaseComplete(data);
  } else if (data.status == "expired") {
    document.getElementById("status").textContent = "Session expired";
  } else {
    processError("Unknown session status: " + data.status);
  }
}

async function purchaseComplete(data)
{
    document.getElementById("status").classList.add("d-none");
    document.getElementById("success").classList.remove("d-none");
    //document.getElementById("customer-email").textContent = data.customer_email
    let product = await getPurchase(data.purchaseid);
    if (!product) {
        processError("Unable to fetch purchase data");
        return;
    }

    showPurchase(product);
}

function processError(msg) {
  document.getElementById("errorMessage").innerHTML = "Error fetching session status: " + msg;
  document.getElementById("error").classList.remove("d-none");
  document.getElementById("status").classList.add("d-none");
  console.error(msg);
}

async function getPurchase(purchaseid)
{
  let data, error;
  try {
    ({ data, error } = await supabase.from('userproducts').select().eq('purchaseid', purchaseid).maybeSingle());
  }
  catch (err) {
    processError("Error fetching purchase data:", err);
    return false;
  }

  if (error) {
      processError("Unable to fetch user products");
      return false;
  }

  return data;
}

function showPurchase(product)
{
  let datetime;
  try {
    const date = new Date(product.created * 1000);
    datetime = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  } catch (err) {
    datetime = "N/A";
  }

  let prdtype = (product.producttype == "p" ? "Purchase" : product.producttype == "s" ? "Subscription" : "");
  
  document.getElementById("product-name").textContent = product.productname + " (" + prdtype + ")";
  document.getElementById("product-time").textContent = datetime;
  document.getElementById("product-price").textContent = product.payment_amount + " (" + String(product.payment_currency).toUpperCase() + ")";

}