// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

// Get the URL and anon key from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.');
}

// Create and export the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
module.exports = supabase;
