import { createClient } from 'https://esm.sh/@supabase/supabase-js';  
import { srvAddress, srvKey } from './apiconfig.js'; // Assuming you have a config file for the Supabase address and key

const supabaseClient = createClient(srvAddress, srvKey);

export function sbApiClient()
{
    return supabaseClient;
}

export async function getUser()
{
    const { data, error } = await supabaseClient.auth.getClaims();
    console.log("getUser", data, error);
    return data?.claims;
    //const { data: { user } } = await supabaseClient.auth.getUser()
    //return user;
}