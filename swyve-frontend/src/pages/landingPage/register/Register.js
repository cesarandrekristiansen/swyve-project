import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LandingPage.css";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const handleRegister = async () => {
    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("User registered successfully!");
        navigate("/");
      } else {
        setMessage(data.error || "Registration failed.");
      }
    } catch (err) {
      setMessage("Error registering user.");
    }
  };

  return (
    <div className="landing-container">
      {/* Left brand panel */}
      <div className="landing-left">
        <div className="brand-section">
          <div className="logo-title-row">
            <img
              src="/images/logo.png"
              alt="Swyve Logo"
              className="splash-logo"
            />
            <h1>SWYVE</h1>
          </div>
          <h2>Create your account</h2>
        </div>
      </div>

      {/* Right form panel */}
      <div className="landing-right">
        <div className="login-form">
          <h2>Sign up</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleRegister}>Register</button>
          {message && <p className="login-message">{message}</p>}

          <p className="terms-text">
            By signing up, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>

          <div className="login-links">
            <span onClick={() => navigate("/")} className="register-link">
              Already have an account? Log in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
