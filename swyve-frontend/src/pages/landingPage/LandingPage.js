// LandingPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleGuest = () => {
    localStorage.setItem('guest', 'true');
    localStorage.removeItem('token'); // Ensure no token is present
    // Navigate to the home feed
    navigate('/feed');
  };

  // Use backend URL from environment variable, fallback to localhost if not set.
  const backendUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

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
        localStorage.removeItem('guest');
        navigate('/feed'); // Navigate to home or feed after login
      } else {
        setMessage(data.error || 'Login failed.');
      }
    } catch (error) {
      setMessage('Error logging in.');
    }
  };

  const goToRegister = () => navigate('/register');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If already logged in, redirect to /splash
      navigate('/splash');
    }
  }, [navigate]);

  return (
    <div className="landing-container">
      {/* Left column with branding/marketing message */}
      <div className="landing-left">
        <div className="brand-section">
          {/* Replace with your own logo path if needed */}
          <div className="logo-title-row">
            <img src="/images/logo.png" alt="Swyve Logo" className="splash-logo" />
            <h1>SWYVE</h1>
          </div>
          <h2>Sign up to support your favorite Pornstar</h2>
        </div>
      </div>

      {/* Right column with the login form */}
      <div className="landing-right">
        <div className="login-form">
          <h2>Log in</h2>

          <input
            type="text"
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

          <div className="forgot-password">
            {/* If you have a forgot password route, link it here */}
            <a href="/forgot">Forgot Password?</a>
          </div>

          <button onClick={handleLogin}>Login</button>
          {message && <p className="login-message">{message}</p>}

          <p className="terms-text">
            By logging in and using Swyve, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>, and confirm you are at least 18 years old.
          </p>

          <div className="login-links">
            {/* Instead of just text, make “Guest” clickable */}
            <span onClick={handleGuest} className="register-link">
              Continue as Guest
            </span>
            {' | '}
            <span onClick={goToRegister} className="register-link">
              Sign up for Swyve
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
