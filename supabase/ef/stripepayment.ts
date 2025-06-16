import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import Stripe from 'https://esm.sh/stripe@14?target=denonext';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
//const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
        apiVersion: "2025-05-28.basil",
    });

const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')  
    
    // First step is to verify the event. The .text() method must be used as the  
    // verification relies on the raw request body rather than the parsed JSON.  
    
    const body = await req.text()  
    let event  
    try {    
        event = await stripe.webhooks.constructEventAsync(      
            body,      
            signature!,     
            Deno.env.get('STRIPE_PAYEVENT_SECRET')!,      
            undefined,      
            cryptoProvider    
        )  
    } catch (err) {   
         return new Response(err.message, { status: 400 })  
    }

    // Handle the event
    let result = true;
    switch (event.type) {
        case 'checkout.session.completed':
            // Handle successful checkout session here
            console.log('checkout.session.completed event', event.data.object);  
            result = await updateUserProducts(event);
            break

        case 'checkout.session.async_payment_succeeded':
            console.log('checkout.session.async_payment_succeeded event', event.data.object);
            break;
            
        default:
            // Unexpected event type
            break
    }

    if (result)
        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },  
        });
    else
        return new Response(JSON.stringify({ error: 'Failed to update user products' }), {
            headers: { 'Content-Type': 'application/json' },  
            status: 500
        });
})

async function updateUserProducts(event) 
{
    const supabaseDB = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
     );

    // get user id from customer id
    const customerId = event.data.object.customer;
    const userId = event.data.object.client_reference_id;
     
    const { data: user, error: fetchError } = await supabaseDB
        .from('customers')
        .select()
        .eq('id', userId)
        .maybeSingle();  // retrieve a single record or null if not found, prevents error if not found

    if (fetchError) { 
        console.log('Error fetching customer:', fetchError);
        return false;
    }

    if (!user) {
        console.log('Customer not found for customer ID:', customerId);
        return false;
    }

    const { data, error } = await supabaseDB.from('userproducts').upsert({ 
        id: userId, 
        paymentid: event.data.object.payment_intent,
        startdate: event.data.object.created,
    }).select();

    if (error) { 
        console.log('Error upserting user product ('+userId+'):', error);
        return false;
    }

    return true;
}
