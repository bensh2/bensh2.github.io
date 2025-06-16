import { serve } from 'std/server'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const stripeClient = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

serve(async (req) => {
    const sig = req.headers.get('stripe-signature')
    const body = await req.text()

    let event: Stripe.Event

    try {
        event = stripeClient.webhooks.constructEvent(
            body,
            sig!,
            STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            // Handle successful payment here
            console.log('PaymentIntent was successful');
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const metadata = paymentIntent.metadata;
            // You can now use the metadata object as needed
            break
        case 'payment_intent.payment_failed':
            // Handle failed payment here
            let intent = event.data.object;
            const message = intent.last_payment_error && intent.last_payment_error.message;
            console.log('Payment failed:', intent.id, message);

            break
        // Add more event types as needed
        default:
            // Unexpected event type
            break
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },  
    })
})