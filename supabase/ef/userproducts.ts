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

    if (!existingCustomer) {
        return new Response(JSON.stringify({ error: 'Customer not found', code: -7 }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 })
    
    } 
    
    stripeCustomerId = existingCustomer.stripe_customer_id;
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
        apiVersion: "2025-05-28.basil",
    })

    /*const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        customer: stripeCustomerId});

    return new Response(JSON.stringify({ data: paymentIntents }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })*/

    let items = new Array();
    const sessions = await stripe.checkout.sessions.list({
        limit: 100, customer: stripeCustomerId, status: "complete"
    });
    for (const session of sessions.data) {
        let sessionid = session.id;

        const lineItems = await stripe.checkout.sessions.listLineItems(sessionid, {
            limit: 100, expand: ['data.price.product'] // Expand product details
        });
        for (const item of lineItems.data) {
            items.push( { 
                productId: item.price.id, //item.price.product.id, 
                productName: item.description,
                quantity: item.quantity, 
                price: item.price.unit_amount, 
                currency: item.price.currency, 
                createdAt: session.created,
                metadata: item.price.product.metadata
            });
        }
    }

    return new Response(JSON.stringify({ items: items }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

});