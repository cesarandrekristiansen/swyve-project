import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import './App.css';
import SplashScreen from './components/splashscreen/SplashScreen';
import Feed from './pages/feed/Feed';
import Profile from './pages/profile/Profile';
import Upload from './pages/upload/Upload';
import Inbox from './pages/inbox/Inbox';
import Register from './pages/landingPage/register/Register';
import Login from './pages/landingPage/login/Login';
import LandingPage from './pages/landingPage/LandingPage';
import Trending from './pages/trending/Trending';
import Stats from './Stats';
import ProtectedRoute from './components/ProtectedRoute';
import {
  FaHome,
  FaPlusCircle,
  FaEnvelope,
  FaUser,
  FaFire,
  FaSyncAlt,
  FaSearch,
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
  const iconStyle = { transition: 'transform 0.2s ease', fontSize: '24px' };
  const token = localStorage.getItem('token');


  return (
    <div className="app">
      {/* Public Routes */}
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/splash" element={<SplashScreen onFinish={handleSplashFinish} />} />
          <Route path="/" element={showSplash ? <SplashScreen onFinish={handleSplashFinish} /> : <Feed infiniteScroll={infiniteScroll} />} />
          <Route path="/following" element={<Feed infiniteScroll={infiniteScroll} />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>

      {isVideoPage && (
        <button className="infinite-scroll-icon" onClick={toggleInfiniteScroll}>
          <FaSyncAlt style={{ color: infiniteScroll ? '#00ff00' : '#ffffff', fontSize: '20px' }} />
        </button>
      )}

      {token && (
        <div className="bottom-nav">
          <NavLink to="/trending" className="nav-item">
            <FaSearch style={iconStyle} />
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
      )}
    </div>
  );
}

export default App;
