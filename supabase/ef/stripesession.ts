import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=denonext';

const corsHeaders = {  'Access-Control-Allow-Origin': '*',  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',};

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

    const { priceId, successUrl, cancelUrl } = await req.json()

    if (!priceId || !successUrl || !cancelUrl) {
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

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {

    })

    try {
        //console.log('Creating Stripe Checkout session for user:', user.id, 'with priceId:', priceId);
        const session = await stripe.checkout.sessions.create({
            //payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: user.email,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                supabase_user_id: user.id,
            },
        })

        return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 })
    }
})