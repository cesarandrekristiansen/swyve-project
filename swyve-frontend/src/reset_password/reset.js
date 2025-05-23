import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/passwordService";

export default function ResetPassword() {
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const token = params.get("token"); 

  useEffect(() => {
    if (!token) {
      setMsg("Token missing");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(token, newPass);
      setMsg("Password changed! Now Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          minLength={6}
          required
        />
        <button type="submit">Comfirm</button>
      </form>
      {msg && <p className="status-msg">{msg}</p>}
    </div>
  );
}
