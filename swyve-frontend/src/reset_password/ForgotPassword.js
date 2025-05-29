import React, { useState } from "react";
import { sendResetEmail } from "../services/passwordService";
import { validateEmail } from "../securityCheck/validation";
import "./passwordReset.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ message: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", error: false });

    if (!validateEmail(email)) {
      setStatus({
        message: "Please enter a valid email address.",
        error: true,
      });
      return;
    }

    try {
      await sendResetEmail(email);
      setStatus({
        message: "Check your inbox for a reset link!",
        error: false,
      });
    } catch (err) {
      setStatus({ message: err.message, error: true });
    }
  };

  return (
    <div className="forgot-container">
      {/* Left side: logo + branding */}
      <div className="forgot-left">
        <div className="brand-section">
          <div className="logo-title-row">
            <img
              src="/images/logo.png"
              alt="Swyve Logo"
              className="splash-logo"
            />
            <h1>SWYVE</h1>
          </div>
          <h2>Reset your password</h2>
        </div>
      </div>

      {/* Right side: reset form */}
      <div className="forgot-right">
        <form className="reset-form" onSubmit={handleSubmit} noValidate>
          <h2>Forgot Password?</h2>
          <p>Enter the email you used when you created your account.</p>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={status.error ? "input-error" : ""}
            required
          />
          {status.error && <p className="error-msg">{status.message}</p>}
          <button type="submit">Send reset link</button>
          {!status.error && status.message && (
            <p className="success-msg">{status.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
