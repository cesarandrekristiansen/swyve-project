import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function ResetPassword() {
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const access_token = params.get("access_token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.api.updateUser(
      access_token,
      { password: newPass }
    );
    if (error) {
      setMsg(error.message);
    } else {
      setMsg("Passord updated");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
        minLength={6}
        required
      />
      <button>Comfirm Password</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
