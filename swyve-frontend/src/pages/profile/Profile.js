import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";

function Profile() {
  // 1) Read userId from the URL, e.g. /profile/4 => profileId = "4"
  const { profileId } = useParams();

  const [streak, setStreak] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
  // State to store the favorited videos
  const [favoritesVideos, setFavoritesVideos] = useState([]);

  // 2) Fetch streak for this user (if needed)
  useEffect(() => {
    if (!profileId) return; // If no user ID, do nothing
    fetch(`${BASE_URL}/streak`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profileId }),
    })
      .then((res) => res.json())
      .then((data) => setStreak(data.streakCount || 0))
      .catch((error) => console.error("Error fetching streak:", error));
  }, [BASE_URL, profileId]);

  // 3) Fetch playlists for this user (if you want)
  useEffect(() => {
    if (!profileId) return;
    fetch(`${BASE_URL}/api/playlists?userId=${profileId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error("Error fetching playlists:", error));
  }, [BASE_URL, profileId]);

  // In Profile.js
  useEffect(() => {
    if (!profileId) return;
    fetch(`${BASE_URL}/api/playlists?userId=${profileId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error("Error fetching playlists:", error));
  }, [BASE_URL, profileId]);

  // 4) Fetch only this user’s videos from the new endpoint
  useEffect(() => {
    if (!profileId) return;
    fetch(`${BASE_URL}/api/users/${profileId}/videos`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          // If user not found or some error
          return res.json().then((data) => {
            throw new Error(data.error || "Error fetching videos");
          });
        }
        return res.json();
      })
      .then((videos) => {
        console.log("Fetched user videos:", videos);
        setUserVideos(videos);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [BASE_URL, profileId]);

  useEffect(() => {
    // 1) Once playlists are loaded, find the "Favorites" playlist
    const favoritesPlaylist = playlists.find((p) => p.name === "Favorites");
    if (!favoritesPlaylist) return; // If user hasn't saved anything yet

    // 2) Fetch videos in that playlist using our new endpoint
    fetch(
      `${BASE_URL}/api/playlists/${favoritesPlaylist.id}/videos`,

      {
        credentials: "include",
      }
    )
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "Error fetching favorites");
          });
        }
        return res.json();
      })
      .then((videos) => {
        console.log("Fetched favorites videos:", videos);
        setFavoritesVideos(videos);
      })
      .catch((err) => console.error(err));
  }, [playlists, BASE_URL]);

  // 5) Mock user info (for demonstration)
  //    In a real app, you might fetch user info from an endpoint, e.g. /api/users/:id
  const user = {
    username: `User${profileId}`,
    followers: 1000,
    following: 150,
    likes: 5000,
    profilePic: "/images/profile-Pic.png",
  };

  // If there's an error (e.g. user not found), show it
  if (error) {
    return (
      <div style={{ color: "white", padding: "20px" }}>Error: {error}</div>
    );
  }

  const handleLogout = async () => {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    // clear localStorage items
    localStorage.removeItem("userId");
    // navigate to login
    navigate("/");
  };

  return (
    <div className="profile-page">
      {/* Profile overview */}
      <div className="profile-header">
        <img className="profile-pic" src={user.profilePic} alt="Profile" />
        <h2 className="username">@{user.username}</h2>
        <div className="profile-stats">
          <div>
            <strong>{user.followers}</strong>
            <p>Followers</p>
          </div>
          <div>
            <strong>{user.following}</strong>
            <p>Following</p>
          </div>
          <div>
            <strong>{user.likes}</strong>
            <p>Likes</p>
          </div>
        </div>
        <button className="follow-btn">Follow</button>
      </div>

      {/* Streak */}
      <div className="streak-section">
        <p>🔥 Streak: {streak} days</p>
      </div>

      {/* Playlists */}
      <div className="playlists-section">
        {/* Favorite Videos Gallery */}
        <div className="video-gallery">
          <h2>Your Favorite Videos</h2>
          {favoritesVideos.map((video) => (
            <div key={video.id} className="video-thumbnail">
              <video
                src={video.url}
                controls
                muted
                poster={video.thumbnail || "/images/default-thumbnail.jpg"}
                style={{ backgroundColor: "#000" }}
              />
            </div>
          ))}
        </div>
        <h2>Your Playlists</h2>
        {/*<div className="playlists">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="playlist">
              <h3>{playlist.name}</h3>
            </div>
          ))}
        </div>*/}
      </div>

      {/* Video gallery */}
      <div className="video-gallery">
        <h2>Your Videos</h2>
        {userVideos.map((video) => (
          <div key={video.id} className="video-thumbnail">
            {/* Use a thumbnail or poster for a nice still image */}
            <video
              src={video.url}
              controls
              muted
              poster={video.thumbnail || "/images/default-thumbnail.jpg"}
              style={{ backgroundColor: "#000" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
