import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const goToLogin = () => navigate('/login');
  const goToRegister = () => navigate('/register');

  return (
    <div className="landing-page">
      <h1>Welcome to Swyve!</h1>
      <p>Please log in or register to continue.</p>
      <div className="landing-buttons">
        <button onClick={goToLogin}>Log In</button>
        <button onClick={goToRegister}>Register</button>
      </div>
    </div>
  );
}

export default LandingPage;
