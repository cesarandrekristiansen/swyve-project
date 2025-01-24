import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import './App.css';
import SplashScreen from './SplashScreen';
import Feed from './Feed';
import Profile from './Profile';
import Upload from './Upload';
import Inbox from './Inbox';
import Register from './Register';
import Login from './Login';
import Trending from './Trending';
import Stats from './Stats';
import {
  FaHome,
  FaPlusCircle,
  FaEnvelope,
  FaUser,
  FaFire,
  
  FaSyncAlt,
} from 'react-icons/fa';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const location = useLocation();

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const toggleInfiniteScroll = () => {
    setInfiniteScroll((prev) => !prev);
  };

  const isVideoPage = location.pathname === '/' || location.pathname === '/following';

  const iconStyle = {
    transition: 'transform 0.2s ease',
    fontSize: '24px',
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div className="app">
      {isVideoPage && (
        <button className="infinite-scroll-icon" onClick={toggleInfiniteScroll}>
          <FaSyncAlt
            style={{
              color: infiniteScroll ? '#00ff00' : '#ffffff',
              fontSize: '20px',
            }}
          />
        </button>
      )}

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Feed infiniteScroll={infiniteScroll} />} />
          <Route path="/following" element={<Feed infiniteScroll={infiniteScroll} />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>

      <div className="bottom-nav">
        <NavLink to="/trending" className="nav-item">
          <FaFire style={iconStyle} />
        </NavLink>
        <NavLink to="/" className="nav-item">
          <FaHome style={iconStyle} />
        </NavLink>
        <NavLink to="/upload" className="nav-item upload-btn">
          <FaPlusCircle style={{ ...iconStyle, fontSize: '28px' }} />
        </NavLink>
        <NavLink to="/inbox" className="nav-item">
          <FaEnvelope style={iconStyle} />
        </NavLink>
        <NavLink to="/profile" className="nav-item">
          <FaUser style={iconStyle} />
        </NavLink>
      </div>
    </div>
  );
}

export default App;
