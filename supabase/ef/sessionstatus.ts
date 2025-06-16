import "jsr:@supabase/functions-js/edge-runtime.d.ts";
//import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import Stripe from 'https://esm.sh/stripe@14?target=denonext';

const corsHeaders = {  'Access-Control-Allow-Origin': '*',  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',};
const YOUR_DOMAIN = "https://bensh2.github.io/apptest";

Deno.serve(async (req) => {
    // This is needed if you're planning to invoke your function from a browser.  
    if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
          }

    const signature = req.headers.get('Stripe-Signature');

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
        apiVersion: "2025-05-28.basil",
    });

    const { session_id } = await req.json();
    if (!session_id) {
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    return new Response(JSON.stringify({ status: session.status, customer_email: session.customer_details.email }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    })
});