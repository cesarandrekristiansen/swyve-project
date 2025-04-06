import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Use backend URL from environment variable, fallback to localhost if not set.
  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const handleRegister = async () => {
    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: "POST",
        // credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("User registered successfully!");
        // Redirect to login page after successful registration
        navigate("/");
      } else {
        setMessage(data.error || "Registration failed.");
      }
    } catch (error) {
      setMessage("Error registering user.");
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
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
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
