import React, { useState } from "react";
import { sendResetEmail } from "../services/redirect";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ message: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", error: false });

    try {
      await sendResetEmail(email);
      setStatus({
        message: "Check your email for a reset link!",
        error: false,
      });
    } catch (err) {
      setStatus({ message: err.message, error: true });
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Passord?</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your@email.com"
          required
        />
        <button type="submit">Send link</button>
      </form>
      {status.message && (
        <p className={status.error ? "error-msg" : "success-msg"}>
          {status.message}
        </p>
      )}
    </div>
  );
}
