import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/passwordService";
import { passwordRules, passwordStrength } from "../securityCheck/validation";
import "./passwordReset.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const token = params.get("token");

  const [newPass, setNewPass] = useState("");
  const [rules, setRules] = useState(passwordRules(""));
  const [strength, setStrength] = useState(0);
  const [msg, setMsg] = useState({ text: "", error: false });

  useEffect(() => {
    setRules(passwordRules(newPass));
    setStrength(passwordStrength(newPass));
  }, [newPass]);

  const allPass = Object.values(rules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allPass) {
      setMsg({ text: "Password does not meet all requirements.", error: true });
      return;
    }
    try {
      await resetPassword(token, newPass);
      setMsg({ text: "Password updated! Redirecting…", error: false });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMsg({ text: err.message, error: true });
    }
  };

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="page-wrapper">
    <form onSubmit={handleSubmit} className="reset-container" noValidate>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
        className={msg.error && !allPass ? "input-error" : ""}
        required
      />

      <div className="password-requirements">
        <p>All requirements needs to be included</p>
        <ul>
          <li className={rules.length ? "ok" : "fail"}>≥ 8 characters</li>
          <li className={rules.upper ? "ok" : "fail"}>Uppercase letter</li>
          <li className={rules.lower ? "ok" : "fail"}>Lowercase letter</li>
          <li className={rules.digit ? "ok" : "fail"}>Digit</li>
          <li className={rules.symbol ? "ok" : "fail"}>Symbol</li>
        </ul>

        <div className="strength-meter">
          <div
            className="strength-meter__bar"
            data-score={strength}
            style={{ width: `${(strength + 1) * 20}%` }}
          />
        </div>
        <p className="strength-label">{strengthLabels[strength]}</p>
      </div>

      {msg.text && (
        <p className={msg.error ? "error-msg" : "success-msg"}>{msg.text}</p>
      )}

      <button type="submit" disabled={!allPass}>
        Confirm Password
      </button>
    </form>
    </div>
  );
}
