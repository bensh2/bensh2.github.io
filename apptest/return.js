import { createClient } from 'https://esm.sh/@supabase/supabase-js';  
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient('https://ujqbqwpjlbmlthwgqdgm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWJxd3BqbGJtbHRod2dxZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzM5MTYsImV4cCI6MjA2MjgwOTkxNn0.8FBSPslplJIIPMYE-f4Ij_nYiB6ut0ElxGxVaoqZLbs');

initialize();

async function initialize() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get("session_id");
  const priceId = urlParams.get("priceId");
  /*const response = await fetch(`/session-status?session_id=${sessionId}`);
  const session = await response.json();*/
  const { session, error } = await supabase.functions.invoke('sessionstatus', {  body: 
            JSON.stringify({
                session_id: sessionId,
            })
    });

  if (session.status == "open") {
    // The payment failed or was canceled. Remount Checkout so that your customer can try again.
    //window.replace("http://localhost:4242/checkout.html")
    window.replace("checkout.html?priceId=" + priceId);
  } else if (session.status == "complete") {
    document.getElementById("success").classList.remove("hidden");
    document.getElementById("customer-email").textContent = session.customer_email
  }
}