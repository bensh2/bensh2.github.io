// create checkout session for Stripe elements checkout
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import Stripe from 'https://esm.sh/stripe@14?target=denonext';

const corsHeaders = {  'Access-Control-Allow-Origin': '*',  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',};
const YOUR_DOMAIN = "https://bensh2.github.io/apptest";

Deno.serve(async (req) => {

    // This is needed if you're planning to invoke your function from a browser.  
    if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
          }

    const signature = req.headers.get('Stripe-Signature');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405 })
    }

    const { priceId } = await req.json();
    const quantity = 1;

    if (!priceId) {
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 })
    }

    // Get Supabase user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        //console.log('Error fetching Supabase user:', userError);
        //console.log('User data:', user);
        return new Response(JSON.stringify({ error: 'Unable to fetch Supabase user', code: -2 }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 })
    }

    let stripeCustomerId = null;
    // Check if the user already exists in the customers table
    const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select()
        .eq('id', user.id)
        .maybeSingle();  // retrieve a single record or null if not found, prevents error if not found

    if (fetchError) { 
        console.log('Error fetching customer:', fetchError);
        return new Response(JSON.stringify({ error: 'Unable to fetch customer', code: -1 }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 })
    }


    //console.log('Existing customer:', existingCustomer);

    if (!existingCustomer) {
        /*const { error: insertError } = await supabase.from('customers').insert({ id: user.id, email: user.email });
        if (insertError) {
            console.log('Error inserting customer ('+user.id +' ' + user.email + '):', insertError);
            return new Response(JSON.stringify({ error: 'Unable to insert customer', code: -3 }), { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400 })
        }*/
       stripeCustomerId = null; 
    } else {
        stripeCustomerId = existingCustomer.stripe_customer_id;
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
        apiVersion: "2025-05-28.basil",
    })

    if (!stripeCustomerId) {
        // Create a new customer in Stripe 
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
                supabase_user_id: user.id,
            },
        });
        if (!customer || !customer.id) {
            console.log('Error creating Stripe customer for user:', user.id, user.email);
            return new Response(JSON.stringify({ error: 'Unable to create Stripe customer', code: -5 }), { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400 })
        }

        stripeCustomerId = customer.id;
        // Insert the new customer into the Supabase customers table
        const { error: insertError } = await supabase
            .from('customers')
            .insert({ id: user.id, email: user.email, stripe_customer_id: stripeCustomerId });
        if (insertError) { 
            console.log('Error inserting customer ('+user.id +' ' + user.email + '):', insertError);
            return new Response(JSON.stringify({ error: 'Unable to insert customer into Supabase', code: -3 }), { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400 })
        }
    }

    if (!stripeCustomerId) {
        console.log('Stripe customer ID is null for user:', user.id, user.email);
        return new Response(JSON.stringify({ error: 'Stripe customer ID is null', code: -6 }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
    ui_mode: "custom",
        customer: stripeCustomerId,
        /*layout: {
        type: 'tabs',
        defaultCollapsed: false,
        },*/
        line_items: [
            {
                price: priceId,
                quantity: quantity,
            },
        ],
        mode: "payment",
        client_reference_id: user.id, 
        metadata: {
            supabase_user_id: user.id,
            email: user.email,
            priceId: priceId,
            quantity: quantity
        },
        return_url: `${YOUR_DOMAIN}/return.html?priceId=${priceId}&session_id={CHECKOUT_SESSION_ID}`,  // Checkout replaces the variable with the Checkout Session ID.
    });

    //res.send({ clientSecret: session.client_secret });
    return new Response(JSON.stringify({ clientSecret: session.client_secret, email: user.email }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

});