import { createClient } from 'https://esm.sh/@supabase/supabase-js';  
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');

// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = Stripe("pk_test_51RRWjTQon05XhpcyWjlrDgMcbzX7YiMcyOaCMKbIPdutrfFxqpUIikiqZqf1SCKh0uoEoSkpRnvgiKhXprXFQXB900pda3kx79");

let checkout;
initialize();

const validateEmail = async (email) => {
  const updateResult = await checkout.updateEmail(email);
  const isValid = updateResult.type !== "error";

  return { isValid, message: !isValid ? updateResult.error.message : null };
};

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

function showPaymentElement() {
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
  /*const promise = fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((r) => r.json())
    .then((r) => r.clientSecret);*/

    const priceId = new URLSearchParams(window.location.search).get("priceId");
    if (!priceId) {
        console.error("Price ID is required");
        return;
    }

    const { data, error } = await supabase.functions.invoke('checkoutsession', {  body: 
            JSON.stringify({
                priceId: priceId,
            })
    });

    if (error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json();
        console.log('Function returned an error', errorMessage);
        if (errorMessage.code == -2) {
            let redirect = "checkout.html?priceId=" + priceId + "&quantity=" + "1"
            window.location.href = "login.html?redir=" + encodeURIComponent(redirect); // Redirect to login page if not authenticated
            return;
        }
    } else if (error instanceof FunctionsRelayError) {
        console.log('Relay error:', error.message)
    } else if (error instanceof FunctionsFetchError) {
        console.log('Fetch error:', error.message)
    } 

    if (!data || error) {
        console.error("Error creating checkout session:", error);
        return;
    }

    // insert email into html element
    document.getElementById("email").value = data.email;

    const appearance = {
        theme: 'stripe',
    };

    checkout = await stripe.initCheckout({
        fetchClientSecret: () => data.clientSecret,
        elementsOptions: { appearance },
    });

    document.querySelector("#button-text").textContent = `Pay ${checkout.session().total.total.amount} now`;
    const emailInput = document.getElementById("email");
    const emailErrors = document.getElementById("email-errors");

    /*emailInput.addEventListener("input", () => {
        // Clear any validation errors
        emailErrors.textContent = "";
    });

    emailInput.addEventListener("blur", async () => {
        const newEmail = emailInput.value;
        if (!newEmail) {
        return;
        }

        const { isValid, message } = await validateEmail(newEmail);
        if (!isValid) {
        emailErrors.textContent = message;
        }
    });*/

    const paymentElement = checkout.createPaymentElement();
    paymentElement.mount("#payment-element");
    showPaymentElement()
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  // email is already provided in the checkout session
  /*const email = document.getElementById("email").value;
  const { isValid, message } = await validateEmail(email);
  if (!isValid) {
    showMessage(message);
    setLoading(false);
    return;
  }*/

  const { error } = await checkout.confirm();

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  showMessage(error.message);

  setLoading(false);
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