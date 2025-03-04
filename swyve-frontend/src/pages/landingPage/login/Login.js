import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Use backend URL from environment variable, fallback to localhost if not set.
  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const handleLogin = async () => {
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Login successful!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        console.log('UserId login page: ', data.userId);
        // Redirect to splash screen after login
        navigate('/');
      } else {
        setMessage(data.error || 'Login failed.');
      }
    } catch (error) {
      setMessage('Error logging in.');
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
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
      <button onClick={handleLogin}>Login</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
