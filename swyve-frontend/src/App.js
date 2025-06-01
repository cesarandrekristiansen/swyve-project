// App.js
import React, { useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import "./App.css";
import SplashScreen from "./components/splashscreen/SplashScreen";
import Feed from "./pages/feed/Feed";
import Profile from "./pages/profile/Profile";
import Upload from "./pages/upload/Upload";
import Inbox from "./pages/inbox/Inbox";
import Register from "./pages/landingPage/register/Register";
import LandingPage from "./pages/landingPage/LandingPage";
import Search from "./pages/search/Search";
import Stats from "./Stats";
import ProtectedRoute from "./components/ProtectedRoute";
import HashtagPage from "./pages/search/HashtagPage";
import {
  FaHome,
  FaPlusCircle,
  FaEnvelope,
  FaUser,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "./auth/AuthContext";
import ForgotPassword from "../src/reset_password/ForgotPassword";
import ResetPassword from "../src/reset_password/reset";
import ApplicationCreator from "./pages/applicationCreator/ApplicationCreator";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useAuth();
  const guest = localStorage.getItem("guest");
  const navigate = useNavigate();

  const handleSplashFinish = () => {
    setShowSplash(false);
    navigate("/feed");
  };

  return (
    <div className="app">
      {/* Main content area */}
      <div className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/splash"
              element={<SplashScreen onFinish={handleSplashFinish} />}
            />
            <Route path="/upload" element={<Upload />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/profile/:profileId" element={<Profile />} />
            <Route path="/trending" element={<Search />} />
            <Route path="/hashtag/:tag" element={<HashtagPage />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/apply-creator" element={<ApplicationCreator />} />
          </Route>
        </Routes>
      </div>

      {/* Bottom navigation – show only for logged-in users */}
      {(user || guest) && (
        <div className="bottom-nav">
          <NavLink to="/feed" className="nav-item">
            <FaHome />
          </NavLink>
          <NavLink to="/trending" className="nav-item">
            <FaSearch />
          </NavLink>
          <NavLink
            to={user.role === "creator" ? "/upload" : "/apply-creator"}
            className="nav-item upload-btn"
          >
            <FaPlusCircle />
          </NavLink>
          <NavLink to="/inbox" className="nav-item">
            <FaEnvelope />
          </NavLink>
          <NavLink to={user ? `/profile/${user.id}` : "/"} className="nav-item">
            <FaUser />
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default App;
