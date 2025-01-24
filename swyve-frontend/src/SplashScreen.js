import React, { useEffect } from 'react';
import './SplashScreen.css';

function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // Varsle at splash-skjermen er ferdig
    }, 3000); // Splash-skjerm vises i 3 sekunder

    return () => clearTimeout(timer); // Rydd opp timeren
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <img src="/images/logo.png" alt="Swyve Logo" className="splash-logo" />
    </div>
  );
}

export default SplashScreen;
