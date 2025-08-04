import { createClient } from 'https://esm.sh/@supabase/supabase-js';  
import { srvAddress, srvKey, stripeKey } from './apiconfig.js'; // Assuming you have a config file for the Supabase address and key
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "https://esm.sh/@supabase/supabase-js";

const supabaseClient = createClient(srvAddress, srvKey);

export function getSbClient()
{
    return supabaseClient;
}

export function getStripeClient()
{
    if (typeof Stripe === 'undefined') {
        console.error("Stripe library is not loaded");
        return null;
    }
    return Stripe(stripeKey);
}

export async function getUser()
{
    const { data, error } = await supabaseClient.auth.getClaims();
    console.log("getUser", data, error);
    return data?.claims;
    //const { data: { user } } = await supabaseClient.auth.getUser()
    //return user;
}

// handles errors from Supabase Functions
// returns an object with message and code properties
export async function getFunctionError(error) {

    let response = { message: "", code: 0 };

    if (error instanceof FunctionsHttpError) {
        const errorObject = await error.context.json();
        response.code = errorObject.code;
        response.message = errorObject.message;
        return response;

    } else if (error instanceof FunctionsRelayError) {
        response.message = "Relay error: " + error.message;
        return response;

    } else if (error instanceof FunctionsFetchError) {
        response.message = "Fetch error: " + error.message;
        return response;
    } 

    return null;
}

export async function invokeFunction(functionName, body) {

    try {

        let payload = body;
        if (body && body.constructor === ({}).constructor)  {  // check if body is a JSON object
            payload = JSON.stringify(body);
        }

        const { data, error } = await supabaseClient.functions.invoke(functionName, { body: payload });

        let responseError = await getFunctionError(error);
        if (responseError) {
            return { data: data, error: responseError };
        }

        return { data: data, error: null };

    } catch (err) {
        console.error(`Error invoking ${functionName} function:`, err);
        return { data: null, error: { message: err.message, code: -1 } };
    }
}