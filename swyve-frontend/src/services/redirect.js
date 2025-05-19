import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export async function sendResetEmail(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${process.env.REACT_APP_FRONTEND_URL}/reset-password`,
    }
  );
  if (error) {
    throw new Error(error.message || "No Email like this in the database...");
  }
  return data;
}
