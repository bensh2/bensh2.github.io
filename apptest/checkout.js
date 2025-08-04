import { getSbClient, getStripeClient, getFunctionError } from './common.js'; // Import the Supabase API client

const supabase = getSbClient();
const stripe = getStripeClient();

initialize();

/*const validateEmail = async (email) => {
  const updateResult = await checkout.updateEmail(email);
  const isValid = updateResult.type !== "error";

  return { isValid, message: !isValid ? updateResult.error.message : null };
};*/

function showPaymentElement() {
  // Hide the spinner and show the payment element
  const spinner = document.querySelector(".spinner-div");
  if (spinner) {
    spinner.classList.add("d-none");
  }

  const paymentElement = document.querySelector("#payment-form");
  if (paymentElement) {
    paymentElement.classList.remove("d-none");
  }
}

// Fetches a Checkout Session and captures the client secret
async function initialize() {

    let checkout;

    const priceId = new URLSearchParams(window.location.search).get("priceId");
    if (!priceId) {
        console.error("Price ID is required");
        return;
    }

    document.querySelector("#payment-form").addEventListener("submit", (e) => handleSubmit(e, checkout));

    let data, error;
    try {
        ({ data, error } = await supabase.functions.invoke('checkoutsession', { body:
            JSON.stringify({
                priceId: priceId,
            })
        }));
    }
    catch (err) {
        console.error("Error creating checkout session:", err);
        showError("Error creating checkout session: " + err.message, -1);
    }

    let responseError = await getFunctionError(error);
    if (responseError) {

        if (responseError.code == -2) {
            console.log('User is not authenticated, redirecting to login page');
            let redirect = "checkout.html?priceId=" + priceId + "&quantity=" + "1"
            window.location.href = "login.html?redir=" + encodeURIComponent(redirect); // Redirect to login page if not authenticated
            return;
        }

        showError(responseError.message, responseError.code);
        return;
    }
    
    if (!data) {
        //console.error("Error creating checkout session:", error);
        showError("Error retrieving checkout session data", -1);
        return;
    }

    // insert email into html element
    document.getElementById("email").value = data.email;

    const appearance = { theme: 'stripe' };

    try {
      checkout = await stripe.initCheckout({
          fetchClientSecret: () => data.clientSecret,
          elementsOptions: { appearance },
      });
    } 
    catch (error) {
      console.error("Error initializing checkout:", error);
      showError("Error initializing checkout", -1);
      return;
    }

    document.querySelector("#button-text").textContent = `Pay ${checkout.session().total.total.amount} now`;
    const emailInput = document.getElementById("email");
    const emailErrors = document.getElementById("email-errors");

    const paymentElement = checkout.createPaymentElement();
    paymentElement.mount("#payment-element");
    showPaymentElement()
}

async function handleSubmit(e, checkout) {

  e.preventDefault();
  setLoading(true);

  const { error } = await checkout.confirm();

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  alert(error.message);

  setLoading(false);
}

function showError(error, code) {
  // Hide the spinner
  document.querySelector(".spinner-div").classList.add("d-none");

  console.error("Error:", error);
  // Show the error in the UI
  const errorElement = document.querySelector("#error-message");
  let message = "An error occurred while processing your payment: <br><br>" + error;
  if (code) {
    message += `<br>(Error code: ${code})`;
  }
  message += "<br><br>Please try again or contact support if the issue persists.";

  errorElement.innerHTML = message;
  errorElement.classList.remove("d-none");

}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}